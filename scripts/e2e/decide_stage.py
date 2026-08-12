#!/usr/bin/env python3
"""
Deterministic SceneSurface DECIDE-stage checks (390px).

Asserts: a hotspot tap runs ZOOM -> SEARCH -> DECIDE, the clue is only recorded
when the detective taps "단서 기록", an already-investigated hotspot never
replays the beats, and a reload replays no discovery modal. Also fails on any
asset 404 or console error.

Run: python3 scripts/e2e/decide_stage.py [base_url]
"""

import asyncio
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
URL = f"{BASE}/case/midnight-office/investigate"
SHOT = "/tmp/browser/decide"

failures: list[str] = []


def check(name: str, cond: bool) -> None:
    print(f"  {'ok  ' if cond else 'FAIL'} {name}", flush=True)
    if not cond:
        failures.append(name)


async def dismiss(page) -> None:
    for _ in range(12):
        for tid in ("discovery-continue", "transition-continue"):
            btn = page.get_by_test_id(tid)
            if await btn.count():
                try:
                    await btn.first.click(timeout=1200)
                    await page.wait_for_timeout(260)
                except Exception:
                    pass
        if not await page.locator('[role="dialog"]').count():
            return
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(260)


async def main() -> int:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 390, "height": 1800})
        page = await ctx.new_page()
        console_errors: list[str] = []
        bad_responses: list[str] = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(str(e)))
        page.on(
            "response",
            lambda r: bad_responses.append(f"{r.status} {r.url}") if r.status >= 400 else None,
        )

        await page.goto(URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1200)
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(600)
        await dismiss(page)

        await page.get_by_test_id("shell-tab-scene").click()
        await page.wait_for_timeout(400)

        surface = page.get_by_test_id("scene-surface")
        check("scene surface renders", await surface.count() > 0)

        spot = page.locator('[data-testid^="hotspot-"][data-investigated="false"]').first
        check("an uninvestigated hotspot exists", await spot.count() > 0)
        hotspot_id = await spot.get_attribute("data-testid")
        await spot.click()

        # Stage machine must pass through the pre-reveal beats and stop at DECIDE.
        seen: set[str] = set()
        for _ in range(60):
            stage = await surface.first.get_attribute("data-stage")
            if stage:
                seen.add(stage)
            if stage == "DECIDE":
                break
            await page.wait_for_timeout(300)
        check("reaches DECIDE stage", "DECIDE" in seen)
        check("plays search beats before deciding", "SEARCH" in seen)

        target = page.locator(f'[data-testid="{hotspot_id}"]')
        check("clue not yet recorded while deciding", await target.get_attribute("data-investigated") == "false")

        rec = page.get_by_test_id("scene-record-clue")
        check("record-clue control offered", await rec.count() > 0)
        await page.screenshot(path=f"{SHOT}-decide.png")
        # Rapid double tap must record exactly once, not twice.
        try:
            await rec.first.click(timeout=2000)
            await rec.first.click(timeout=400)
        except Exception:
            pass

        for _ in range(40):
            if await surface.first.get_attribute("data-stage") == "IDLE":
                break
            await page.wait_for_timeout(250)
        await dismiss(page)
        check("returns to IDLE after recording", await surface.first.get_attribute("data-stage") == "IDLE")
        check("hotspot marked investigated", await target.get_attribute("data-investigated") == "true")

        # Re-tapping an investigated hotspot must not restart the beats.
        try:
            await target.click(timeout=2000)
        except Exception:
            pass
        await page.wait_for_timeout(900)
        check(
            "investigated hotspot does not replay beats",
            await surface.first.get_attribute("data-stage") == "IDLE",
        )

        # Reload: state restored, no modal replay.
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        modal_on_load = await page.locator('[role="dialog"]').count()
        await dismiss(page)
        await page.get_by_test_id("shell-tab-scene").click()
        await page.wait_for_timeout(500)
        check("no discovery modal replays after reload", modal_on_load == 0)
        check(
            "investigated state survives reload",
            await page.locator(f'[data-testid="{hotspot_id}"]').get_attribute("data-investigated") == "true",
        )
        await page.screenshot(path=f"{SHOT}-after-reload.png")

        assets = [r for r in bad_responses if not r.startswith(("401", "403"))]
        check(f"no failing asset requests ({assets[:3]})", not assets)
        real_errors = [e for e in console_errors if "favicon" not in e]
        check(f"no console errors ({real_errors[:2]})", not real_errors)

        await browser.close()

    print(f"\ndecide stage: {'PASS' if not failures else 'FAIL ' + str(failures)}")
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
