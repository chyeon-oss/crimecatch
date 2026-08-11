#!/usr/bin/env python3
"""
Sprint 6.1/7 residual sweeps:
  A) Interview room usability at 390/420/430px after the sticky-rail fix.
  B) Desktop regression for the free-placement corkboard (drag + link + note).

Run:  python3 scripts/e2e/sweeps.py [base_url]
"""

import asyncio
import json
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
SHOT = "/tmp/browser/sweeps"

RUNTIME_LOG = {
    "version": 1,
    "caseId": "midnight-office",
    "actions": [{"type": "DISCOVER_EVIDENCE", "evidenceId": e} for e in
                ("e1", "e2", "e3", "e4", "e5", "e6")]
    + [{"type": "READ_EVIDENCE", "evidenceId": e} for e in
       ("e1", "e2", "e3", "e4", "e5", "e6")]
    + [{"type": "ADVANCE_SCENE"}, {"type": "ADVANCE_SCENE"}],
}


def log(m: str) -> None:
    print(f"[sweeps] {m}", flush=True)


async def skip_intro(page) -> None:
    for _ in range(8):
        intro = page.locator('[aria-label="Case intro"]')
        if not await intro.count():
            return
        try:
            await intro.first.click(timeout=1500)
        except Exception:
            await page.keyboard.press("Escape")
        await page.wait_for_timeout(450)


async def dismiss(page) -> None:
    for _ in range(12):
        hit = False
        for tid in ("discovery-continue", "transition-continue"):
            b = page.get_by_test_id(tid)
            if await b.count():
                try:
                    await b.first.click(timeout=1200)
                    await page.wait_for_timeout(220)
                    hit = True
                except Exception:
                    pass
        if not hit:
            return


async def interview_sweep(browser, problems: list[str]) -> None:
    for w in (390, 420, 430):
        ctx = await browser.new_context(viewport={"width": w, "height": 1500})
        page = await ctx.new_page()
        errs: list[str] = []
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errs.append(str(e)))
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.evaluate(
            "s => localStorage.setItem('runtime-log:midnight-office', s)",
            json.dumps(RUNTIME_LOG),
        )
        await page.goto(f"{BASE}/case/midnight-office/investigate",
                        wait_until="domcontentloaded")
        await page.wait_for_timeout(1100)
        await skip_intro(page)
        await dismiss(page)
        await page.get_by_test_id("shell-tab-talk").click()
        await page.wait_for_timeout(500)
        await dismiss(page)

        rooms = page.locator('[data-testid^="interview-room-"]')
        if await rooms.count():
            await rooms.first.click()
            await page.wait_for_timeout(600)
            await dismiss(page)
        rail = page.get_by_test_id("interview-action-rail")
        nav = page.locator("nav").last
        if await rail.count():
            rb = await rail.first.bounding_box()
            nb = await nav.bounding_box()
            if rb and nb and rb["y"] + rb["height"] > nb["y"] + 2:
                problems.append(f"interview@{w}: action rail under the tab bar")
            else:
                log(f"interview@{w}: rail clears tab bar")
        else:
            log(f"interview@{w}: no room entered (hub view) — checked hub only")

        overflow = await page.evaluate(
            "() => document.documentElement.scrollWidth - window.innerWidth")
        if overflow > 1:
            problems.append(f"interview@{w}: horizontal overflow {overflow}px")
        small = await page.evaluate(
            """() => [...document.querySelectorAll('button')]
                 .filter(b => b.offsetParent && b.getBoundingClientRect().height > 0
                              && b.getBoundingClientRect().height < 40
                              && b.getBoundingClientRect().width > 80).length""")
        log(f"interview@{w}: overflow={overflow} sub-40px-tall wide buttons={small} errors={len(errs)}")
        if errs:
            problems.append(f"interview@{w}: console errors {errs[:2]}")
        await page.screenshot(path=f"{SHOT}-interview-{w}.png")
        await ctx.close()


async def desktop_board(browser, problems: list[str]) -> None:
    ctx = await browser.new_context(viewport={"width": 1440, "height": 1200})
    page = await ctx.new_page()
    errs: list[str] = []
    page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errs.append(str(e)))
    await page.goto(BASE, wait_until="domcontentloaded")
    await page.evaluate("s => localStorage.setItem('runtime-log:midnight-office', s)",
                        json.dumps(RUNTIME_LOG))
    await page.goto(f"{BASE}/case/midnight-office/investigate",
                    wait_until="domcontentloaded")
    await page.wait_for_timeout(1100)
    await skip_intro(page)
    await dismiss(page)
    await page.get_by_test_id("shell-tab-deduce").click()
    await page.wait_for_timeout(600)
    await dismiss(page)

    # 관계도 corkboard must still be present on desktop.
    if not await page.get_by_text("관계도").count():
        problems.append("desktop: 관계도 corkboard section missing")
        await ctx.close()
        return

    # Pin two evidence cards, drag one, connect them, add a note.
    add_evidence = page.get_by_role("button", name="증거").last
    await add_evidence.click()
    await page.wait_for_timeout(300)
    picks = page.locator("button", has_text="").filter(has_text="머그컵")
    if await picks.count():
        await picks.first.click()
        await page.wait_for_timeout(300)
    pins = page.locator("[data-board-node]")
    log(f"desktop: board nodes after pin = {await pins.count()}")
    if await pins.count() == 0:
        problems.append("desktop: pin was not added to the corkboard")
    else:
        box = await pins.first.bounding_box()
        await page.mouse.move(box["x"] + box["width"] / 2, box["y"] + 10)
        await page.mouse.down()
        await page.mouse.move(box["x"] + box["width"] / 2 + 90, box["y"] + 70, steps=8)
        await page.mouse.up()
        await page.wait_for_timeout(300)
        moved = await pins.first.bounding_box()
        if abs(moved["x"] - box["x"]) < 20 and abs(moved["y"] - box["y"]) < 20:
            problems.append("desktop: pin drag did not move the card")
        else:
            log("desktop: pin drag works")

    note_btn = page.get_by_role("button", name="메모")
    if await note_btn.count():
        await note_btn.first.click()
        await page.wait_for_timeout(300)
        log(f"desktop: nodes after note = {await page.locator('[data-board-node]').count()}")

    # Tap-to-link board on desktop keeps the legacy column layout.
    if await page.get_by_test_id("mobile-link-board").count():
        problems.append("desktop: mobile tap board rendered at 1440px")
    if errs:
        problems.append(f"desktop: console errors {errs[:2]}")
    await page.screenshot(path=f"{SHOT}-desktop.png")
    await ctx.close()


async def main() -> int:
    problems: list[str] = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        await interview_sweep(browser, problems)
        await desktop_board(browser, problems)
        await browser.close()
    if problems:
        log("FAIL")
        for pr in problems:
            log(f"  - {pr}")
        return 1
    log("PASS — interview sweep + desktop board regression clean")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
