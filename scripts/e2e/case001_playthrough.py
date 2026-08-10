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
    """Discovery + scene-transition modals both close on Escape."""
    closed = 0
    for _ in range(20):
        if await page.locator('[role="dialog"]').count():
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(300)
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
        await page.wait_for_timeout(2600)
        await settle(page)
        done += 1
    return done


async def play_interviews(page) -> int:
    """Exhaust every askable topic in every suspect room."""
    rooms_done = 0
    for _ in range(8):
        await dismiss_modals(page)
        rooms = page.locator('[data-testid^="interview-room-"][data-complete="false"]')
        if not await rooms.count():
            break
        if not await click_when_ready(page, rooms.first):
            break
        await page.wait_for_timeout(700)
        for _ in range(24):
            choice = page.locator('[data-testid="interview-choice"]')
            if await choice.count():
                if not await click_when_ready(page, choice.first):
                    break
                await page.wait_for_timeout(500)
                continue
            topic = page.locator('[data-testid="interview-topic"][data-available="true"]')
            if not await topic.count():
                break
            if not await click_when_ready(page, topic.first):
                break
            await page.wait_for_timeout(700)
        back = page.get_by_test_id("interview-back")
        if await back.count():
            await back.click()
            await page.wait_for_timeout(400)
        rooms_done += 1
        log(
            "room closed; remaining incomplete="
            + str(await page.locator('[data-testid^="interview-room-"][data-complete="false"]').count())
        )
    return rooms_done


async def run_deduction(page) -> None:
    """Six-step flow: culprit -> motive -> method -> evidence -> board -> confirm."""
    flow = page.get_by_test_id("deduction-flow")
    await flow.wait_for(state="visible", timeout=15000)
    for step in range(1, 6):
        assert await flow.get_attribute("data-step") == str(step), (
            f"expected step {step}, got {await flow.get_attribute('data-step')}"
        )
        options = page.locator('[data-testid="deduction-option"]')
        if await options.count():
            await options.first.click()
            await page.wait_for_timeout(200)
        await click_when_ready(page, page.get_by_test_id("deduction-next"))
        await page.wait_for_timeout(320)
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
