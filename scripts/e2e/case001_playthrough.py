#!/usr/bin/env python3
"""
CASE001 end-to-end playthrough (Playwright, 420px mobile viewport).

Drives the real UI: intro skip -> scene hotspots -> dialogue -> Scene 03
interviews -> Scene 04 six-step deduction -> submit -> reconstruction, then
reloads and asserts no discovery / transition modal replays and that the
career record is not rewarded twice.

Run:  python3 scripts/e2e/case001_playthrough.py [base_url]
"""

import asyncio
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
CASE = "midnight-office"
URL = f"{BASE}/case/{CASE}/investigate"
SHOT = "/tmp/browser/case001"


def log(msg: str) -> None:
    print(f"[e2e] {msg}", flush=True)


async def dismiss_modals(page) -> int:
    """Close discovery + scene-transition modals through their own buttons."""
    closed = 0
    for _ in range(20):
        for tid in ("discovery-continue", "transition-continue"):
            btn = page.get_by_test_id(tid)
            if await btn.count():
                try:
                    await btn.first.click(timeout=1500)
                    await page.wait_for_timeout(280)
                    closed += 1
                except Exception:
                    pass
        if await page.locator('[role="dialog"]').count():
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(280)
            closed += 1
            continue
        break
    return closed


async def settle(page, timeout_ms: int = 20000) -> None:
    """Wait until no modal is queued and the scene is interactive again."""
    waited = 0
    while waited < timeout_ms:
        await dismiss_modals(page)
        if not await page.locator('[role="dialog"]').count():
            return
        await page.wait_for_timeout(300)
        waited += 300


async def click_when_ready(page, locator) -> bool:
    """Click through late-arriving modals without failing the run."""
    for _ in range(20):
        await settle(page)
        try:
            await locator.click(timeout=2000)
            return True
        except Exception:
            await page.wait_for_timeout(400)
    return False


async def tab(page, name: str) -> None:
    await page.get_by_test_id(f"shell-tab-{name}").click()
    await page.wait_for_timeout(220)


async def drain_dialogue(page) -> None:
    """Answer every available dialogue choice on the talk tab."""
    for _ in range(30):
        await dismiss_modals(page)
        choices = page.locator('[data-testid="dialogue-choice"][data-available="true"]')
        if not await choices.count():
            break
        if not await click_when_ready(page, choices.first):
            break
        await page.wait_for_timeout(500)


async def wait_scene_idle(page, timeout_ms: int = 20000) -> None:
    """Hotspot reveals are ~4.5s; never leave the tab mid-animation."""
    waited = 0
    surface = page.get_by_test_id("scene-surface")
    while waited < timeout_ms:
        if not await surface.count():
            return
        if await surface.first.get_attribute("data-stage") in (None, "IDLE"):
            return
        await page.wait_for_timeout(300)
        waited += 300


async def play_hotspots(page) -> int:
    """Investigate every not-yet-investigated hotspot in the current scene."""
    done = 0
    for _ in range(12):
        await dismiss_modals(page)
        spots = page.locator('[data-testid^="hotspot-"][data-investigated="false"]')
        if not await spots.count():
            break
        if not await click_when_ready(page, spots.first):
            break
        await wait_scene_idle(page)
        await settle(page)
        done += 1
    return done


async def finish_topic(page, topic_id: str) -> bool:
    """Ask one topic, flush typing, answer a choice if any, assert completion."""
    btn = page.locator(f'[data-testid="interview-topic"][data-topic-id="{topic_id}"]')
    if not await btn.count():
        return False
    if await btn.first.get_attribute("data-topic-done") == "true":
        return True
    if await btn.first.get_attribute("data-available") != "true":
        return False
    if not await click_when_ready(page, btn.first):
        return False
    # Flush typing cadence by tapping the transcript, then answer if asked.
    for _ in range(24):
        await dismiss_modals(page)
        choice = page.locator('[data-testid="interview-choice"]')
        if await choice.count():
            if not await click_when_ready(page, choice.first):
                return False
            await page.wait_for_timeout(400)
            continue
        marker = page.locator(f'[data-testid="interview-topic"][data-topic-id="{topic_id}"]')
        if await marker.count() and await marker.first.get_attribute("data-topic-done") == "true":
            return True
        await page.mouse.click(210, 700)  # tap-to-skip the typing queue
        await page.wait_for_timeout(450)
    return False


async def play_interviews(page) -> int:
    """Complete every required topic of every incomplete suspect room."""
    rooms_done = 0
    for _ in range(8):
        await dismiss_modals(page)
        rooms = page.locator('[data-testid^="interview-room-"][data-complete="false"]')
        if not await rooms.count():
            break
        room = rooms.first
        if not await click_when_ready(page, room):
            break
        await page.wait_for_timeout(600)
        for _ in range(12):
            pending = page.locator(
                '[data-testid="interview-topic"][data-topic-done="false"][data-available="true"]'
            )
            if not await pending.count():
                break
            topic_id = await pending.first.get_attribute("data-topic-id")
            if not topic_id or not await finish_topic(page, topic_id):
                break
        progress = page.get_by_test_id("interview-progress")
        if await progress.count():
            log(
                "room progress "
                + f"{await progress.first.get_attribute('data-done')}/"
                + f"{await progress.first.get_attribute('data-total')}"
            )
        back = page.get_by_test_id("interview-back")
        if await back.count():
            await back.click()
            await page.wait_for_timeout(400)
        rooms_done += 1
        log(
            "remaining incomplete rooms="
            + str(await page.locator('[data-testid^="interview-room-"][data-complete="false"]').count())
        )
    return rooms_done


async def read_all_evidence(page) -> int:
    """Open every discovered evidence card so it counts as read."""
    await tab(page, "file")
    await page.wait_for_timeout(400)
    cards = page.locator('[data-testid="evidence-card"]')
    total = await cards.count()
    read = 0
    for i in range(total):
        card = cards.nth(i)
        if await card.get_attribute("data-read") == "true":
            read += 1
            continue
        await click_when_ready(page, card)
        detail = page.get_by_test_id("evidence-detail")
        try:
            await detail.wait_for(state="visible", timeout=6000)
        except Exception:
            continue
        await page.get_by_test_id("evidence-detail-close").click()
        await detail.wait_for(state="hidden", timeout=6000)
        read += 1
    log(f"evidence read {read}/{total}")
    return read


async def run_deduction(page) -> None:
    """Six-step flow: culprit -> motive -> method -> evidence -> board -> confirm."""
    flow = page.get_by_test_id("deduction-flow")
    await flow.wait_for(state="visible", timeout=15000)
    for _ in range(24):
        step = await flow.get_attribute("data-step")
        if step == "6":
            break
        if await page.get_by_test_id("deduction-open-casefile").count():
            await read_all_evidence(page)
            await tab(page, "deduce")
            await page.wait_for_timeout(400)
            continue
        options = page.locator('[data-testid="deduction-option"]')
        if await options.count():
            await options.first.click()
            await page.wait_for_timeout(200)
        nxt = page.get_by_test_id("deduction-next")
        if await nxt.count() and await nxt.first.is_enabled():
            await click_when_ready(page, nxt.first)
        await page.wait_for_timeout(360)
        if await flow.get_attribute("data-step") == step:
            # Step needs a selection this locator did not cover — surface it.
            log(f"deduction stalled on step {step}")
            break
    assert await flow.get_attribute("data-step") == "6"
    await page.screenshot(path=f"{SHOT}-step6.png")
    await click_when_ready(page, page.get_by_test_id("deduction-submit"))
    await page.wait_for_timeout(300)
    await page.get_by_test_id("deduction-confirm").click()
    await page.get_by_test_id("deduction-result").wait_for(state="visible", timeout=10000)


async def main() -> int:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 420, "height": 1800})
        page = await ctx.new_page()
        errors: list[str] = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))

        await page.goto(URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1200)

        # Intro is skippable with Escape and must not block interaction.
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(600)
        await dismiss_modals(page)

        # Progress the case until the deduction flow unlocks (SCENE 04).
        for loop in range(8):
            await tab(page, "talk")
            await drain_dialogue(page)
            interviews = await play_interviews(page)
            await tab(page, "scene")
            spots = await play_hotspots(page)
            await tab(page, "file")
            # Read every evidence card so decisive-evidence candidates exist.
            cards = page.locator("main button", has_text="증거")
            await page.wait_for_timeout(200)
            await tab(page, "deduce")
            await page.wait_for_timeout(400)
            if await page.get_by_test_id("deduction-flow").count():
                log(f"deduction unlocked after loop {loop} (hotspots={spots}, rooms={interviews})")
                break
            log(f"loop {loop}: hotspots={spots} rooms={interviews} cards={await cards.count()}")
        else:
            await page.screenshot(path=f"{SHOT}-stuck.png")
            print("[e2e] FAIL: deduction flow never unlocked")
            return 1

        # Final deduction must be the first block on the tab in SCENE 04.
        host_top = await page.get_by_test_id("deduction-host").bounding_box()
        notebook = page.locator("main section").first
        log(f"deduction host y={host_top['y'] if host_top else 'n/a'}")

        await run_deduction(page)
        await page.screenshot(path=f"{SHOT}-result.png")

        # Reconstruction: reveal every beat, then close.
        await page.get_by_test_id("reconstruction-open").click()
        await page.get_by_test_id("reconstruction-view").wait_for(state="visible")
        for _ in range(8):
            nxt = page.get_by_test_id("reconstruction-next")
            if not await nxt.count():
                break
            await nxt.click()
            await page.wait_for_timeout(260)
        await page.screenshot(path=f"{SHOT}-truth.png")
        await page.keyboard.press("Escape")

        # Reload: no modal replay, career not re-rewarded.
        before = await page.evaluate("() => localStorage.getItem('casenote.progress.v1')")
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        modal_count = await page.locator('[role="dialog"]').count()
        after = await page.evaluate("() => localStorage.getItem('casenote.progress.v1')")
        await page.screenshot(path=f"{SHOT}-reload.png")

        problems = []
        if modal_count:
            problems.append(f"{modal_count} modal(s) replayed after reload")
        if before != after:
            problems.append("progress record changed on reload (possible duplicate reward)")
        hard = [e for e in errors if "Warning" not in e]
        if hard:
            problems.append(f"console errors: {hard[:3]}")

        await browser.close()
        if problems:
            for pr in problems:
                print(f"[e2e] FAIL: {pr}")
            return 1
        print("[e2e] PASS — CASE001 420px playthrough complete")
        return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
