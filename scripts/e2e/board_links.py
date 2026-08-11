#!/usr/bin/env python3
"""
Mobile Detective Board tap-to-link E2E (Playwright).

Drives the real board UI on the deduce tab for both cases at 420px:
open board -> card detail -> tap link flow -> relation sheet -> "내 연결"
-> edit relation -> reload persistence -> delete -> deduction still reachable.
Then sweeps 390/420/430px for horizontal overflow and console errors.

Run:  python3 scripts/e2e/board_links.py [base_url]
"""

import asyncio
import json
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
SHOT = "/tmp/browser/board"

FIXTURE = {
    "profile": {
        "name": "형사", "xp": 900, "level": 3, "rank": "Junior Investigator",
        "title": "주임 형사", "reputation": 40,
        "solvedCaseIds": ["midnight-office"], "wrongAccusations": 0,
        "achievementsUnlocked": [],
    },
    "activeCaseId": None,
    "history": [{"caseId": "midnight-office", "solved": True, "perfect": False,
                 "at": 1, "score": 88, "rank": "A"}],
    "perCaseEvidenceRead": {},
    "contradictionCount": 0,
    "caseResults": {"midnight-office": {
        "caseId": "midnight-office", "attempts": 1, "bestScore": 88,
        "bestRank": "A", "lastScore": 88, "lastRank": "A", "solved": True,
        "perfect": False, "lastSubmittedAt": 1, "solvedAt": 1}},
    "version": 2,
}


def log(msg: str) -> None:
    print(f"[board-e2e] {msg}", flush=True)


async def dismiss(page) -> None:
    for _ in range(12):
        hit = False
        for tid in ("discovery-continue", "transition-continue"):
            btn = page.get_by_test_id(tid)
            if await btn.count():
                try:
                    await btn.first.click(timeout=1200)
                    await page.wait_for_timeout(220)
                    hit = True
                except Exception:
                    pass
        if not hit:
            return


async def seed_runtime(page, case: str) -> None:
    """Give the board real cards by replaying evidence discoveries."""
    log_payload = {
        "version": 1,
        "caseId": case,
        "actions": [{"type": "DISCOVER_EVIDENCE", "evidenceId": e} for e in
                    ("e1", "e2", "e3", "e4")]
        + [{"type": "READ_EVIDENCE", "evidenceId": e} for e in ("e1", "e2")],
    }
    await page.evaluate(
        "([id, s]) => localStorage.setItem('runtime-log:' + id, s)",
        [case, json.dumps(log_payload)],
    )


async def open_board(page, case: str) -> None:
    await page.goto(f"{BASE}/case/{case}/investigate", wait_until="domcontentloaded")
    await page.wait_for_timeout(1200)
    for _ in range(8):
        intro = page.locator('[aria-label="Case intro"]')
        if not await intro.count():
            break
        try:
            await intro.first.click(timeout=1500)
        except Exception:
            await page.keyboard.press("Escape")
        await page.wait_for_timeout(500)
    await dismiss(page)
    await page.get_by_test_id("shell-tab-deduce").click()
    await page.wait_for_timeout(400)
    # The board lives in the notebook's 추리 보드 tab.
    tab = page.get_by_role("button", name="추리 보드")
    if await tab.count():
        await tab.first.click()
        await page.wait_for_timeout(300)
    await page.get_by_test_id("mobile-link-board").wait_for(timeout=8000)


async def card_ids(page) -> list[str]:
    els = page.locator('[data-testid^="board-card-"]')
    out = []
    for i in range(await els.count()):
        tid = await els.nth(i).get_attribute("data-testid")
        if tid:
            out.append(tid)
    return out


async def run_case(page, case: str, problems: list[str]) -> None:
    log(f"--- {case}")
    # Start from a clean board for this case.
    await page.goto(BASE, wait_until="domcontentloaded")
    await page.evaluate("id => localStorage.removeItem('detective-board:' + id)", case)
    await seed_runtime(page, case)
    await open_board(page, case)

    cards = await card_ids(page)
    log(f"cards on board: {len(cards)}")
    if len(cards) < 2:
        problems.append(f"{case}: fewer than 2 board cards ({len(cards)})")
        return

    # 1. card detail sheet
    await page.get_by_test_id(cards[0]).click()
    await page.get_by_test_id("board-card-sheet").wait_for(timeout=5000)
    log("card detail sheet open")

    # 2. tap-to-link flow
    await page.get_by_test_id("board-start-link").click()
    await page.get_by_test_id("link-mode-banner").wait_for(timeout=5000)
    log("link-target mode active")

    # source must be non-tappable, target tappable
    if await page.get_by_test_id(cards[0]).is_enabled():
        problems.append(f"{case}: source card still enabled in link mode")

    scroll_before = await page.evaluate("() => window.scrollY")
    await page.get_by_test_id(cards[1]).click()
    await page.get_by_test_id("relation-sheet").wait_for(timeout=5000)
    await page.get_by_test_id("relation-contradicts").click()
    await page.wait_for_timeout(400)
    if await page.get_by_test_id("link-mode-banner").count():
        problems.append(f"{case}: link mode did not exit after confirm")
    scroll_after = await page.evaluate("() => window.scrollY")
    if abs(scroll_after - scroll_before) > 120:
        problems.append(f"{case}: scroll jumped {scroll_before}->{scroll_after}")
    log("link created via tap flow")

    stored = json.loads(await page.evaluate(
        "id => localStorage.getItem('detective-board:' + id) || '{}'", case))
    if len(stored.get("connections", [])) != 1:
        problems.append(f"{case}: expected 1 persisted link, got {stored}")
    link_id = stored["connections"][0]["id"]

    # 3. 내 연결 view
    await page.get_by_test_id("board-view-links").click()
    await page.get_by_test_id(f"board-link-{link_id}").wait_for(timeout=5000)
    sentence = await page.get_by_test_id(f"board-link-{link_id}").inner_text()
    log(f"내 연결 row: {sentence.replace(chr(10), ' ')[:80]}")
    if "모순된다" not in sentence:
        problems.append(f"{case}: relation missing from link sentence")

    # 4. duplicate prevention (reverse order)
    await page.get_by_test_id("board-view-cards").click()
    await page.get_by_test_id(cards[1]).click()
    await page.get_by_test_id("board-start-link").click()
    await page.get_by_test_id(cards[0]).click()
    await page.wait_for_timeout(400)
    if await page.get_by_test_id("relation-sheet").count():
        problems.append(f"{case}: duplicate pair offered a new relation sheet")
    await page.get_by_test_id("board-link-sheet").wait_for(timeout=5000)
    log("reverse-order duplicate opened existing link for edit")

    # 5. edit relation
    await page.get_by_test_id("edit-relation-supports").click()
    await page.wait_for_timeout(400)
    rel = await page.get_by_test_id("board-link-relation").inner_text()
    if "뒷받침" not in rel:
        problems.append(f"{case}: relation edit not reflected ({rel})")
    await page.get_by_test_id("board-link-sheet-close").click()
    await page.wait_for_timeout(250)
    log("relation edited")

    # 6. reload persistence
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(1000)
    await dismiss(page)
    await page.get_by_test_id("shell-tab-deduce").click()
    await page.wait_for_timeout(400)
    t = page.get_by_role("button", name="추리 보드")
    if await t.count():
        await t.first.click()
    await page.get_by_test_id("board-view-links").click()
    await page.get_by_test_id(f"board-link-{link_id}").wait_for(timeout=8000)
    after = await page.get_by_test_id(f"board-link-{link_id}").inner_text()
    if "뒷받침" not in after:
        problems.append(f"{case}: edited relation lost on reload")
    log("link + relation survived reload")

    # 7. cancel exits without mutation
    await page.get_by_test_id("board-view-cards").click()
    await page.get_by_test_id(cards[0]).click()
    await page.get_by_test_id("board-start-link").click()
    await page.get_by_test_id("link-mode-cancel").click()
    await page.wait_for_timeout(300)
    n = json.loads(await page.evaluate(
        "id => localStorage.getItem('detective-board:' + id)", case))
    if len(n["connections"]) != 1:
        problems.append(f"{case}: cancel mutated board state")
    log("cancel left state untouched")

    # 8. delete with confirmation
    await page.get_by_test_id("board-view-links").click()
    await page.get_by_test_id(f"board-link-{link_id}").click()
    await page.get_by_test_id("board-link-delete").click()
    await page.get_by_test_id("board-link-delete-confirm").click()
    await page.wait_for_timeout(400)
    n = json.loads(await page.evaluate(
        "id => localStorage.getItem('detective-board:' + id)", case))
    if n["connections"]:
        problems.append(f"{case}: link not deleted")
    log("link deleted")

    # 9. case flow still reachable (deduction section present on deduce tab)
    if not await page.get_by_text("최종 추리").count():
        problems.append(f"{case}: deduction section missing after board work")
    await page.screenshot(path=f"{SHOT}-{case}.png")


async def sweep(browser, case: str, problems: list[str]) -> None:
    for w in (390, 420, 430):
        ctx = await browser.new_context(viewport={"width": w, "height": 1600})
        page = await ctx.new_page()
        errs: list[str] = []
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errs.append(str(e)))
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.evaluate("s => localStorage.setItem('casenote.progress.v1', s)",
                            json.dumps(FIXTURE))
        await seed_runtime(page, case)
        await open_board(page, case)
        overflow = await page.evaluate(
            "() => document.documentElement.scrollWidth - window.innerWidth")
        if overflow > 1:
            problems.append(f"{case}@{w}: horizontal overflow {overflow}px")
        # sheet actions must clear the fixed tab bar
        first = (await card_ids(page))[0]
        await page.get_by_test_id(first).click()
        await page.get_by_test_id("board-card-sheet").wait_for(timeout=5000)
        btn = page.get_by_test_id("board-start-link")
        box = await btn.bounding_box()
        nav = await page.locator("nav").last.bounding_box()
        if box and nav and box["y"] + box["height"] > nav["y"] + 1:
            problems.append(f"{case}@{w}: link action overlapped by tab bar")
        if any("Warning" not in e for e in errs):
            problems.append(f"{case}@{w}: console errors {errs[:2]}")
        log(f"{case}@{w}px overflow={overflow} errors={len(errs)}")
        await page.screenshot(path=f"{SHOT}-{case}-{w}.png")
        await ctx.close()


async def main() -> int:
    problems: list[str] = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 420, "height": 1800})
        page = await ctx.new_page()
        page.on("pageerror", lambda e: problems.append(f"pageerror: {e}"))
        await page.goto(BASE, wait_until="domcontentloaded")
        await page.evaluate("s => localStorage.setItem('casenote.progress.v1', s)",
                            json.dumps(FIXTURE))
        for case in ("midnight-office", "inheritance-party"):
            await run_case(page, case, problems)
        await ctx.close()
        for case in ("midnight-office", "inheritance-party"):
            await sweep(browser, case, problems)
        await browser.close()

    if problems:
        log("FAIL")
        for pr in problems:
            log(f"  - {pr}")
        return 1
    log("PASS — board tap-to-link verified on both cases at 390/420/430px")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
