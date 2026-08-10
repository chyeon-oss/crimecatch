import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { CaseSelectionCard, type CaseRosterItem } from "@/components/CaseSelectionCard";
import { CaseEngine } from "@/engine";
import { useProgress } from "@/state/progressStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "크라임캐치 — 사건 파일" },
      {
        name: "description",
        content:
          "기밀 사건 파일을 열고, 증거를 분석하고, 용의자를 심문하여 진실을 밝혀내세요. AI 기반의 프리미엄 탐정 수사 게임.",
      },
      { property: "og:title", content: "크라임캐치 — 사건 파일" },
      {
        property: "og:description",
        content:
          "프리미엄 AI 탐정 수사 게임. 범죄 현장을 조사하고 증거를 분석하여 사건을 해결하세요.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaseSelectionPage,
});

const TOTAL_CASES = 12;

const LOCKED_ROSTER: Omit<CaseRosterItem & { locked: true }, "locked">[] = [
  {
    caseNumber: "CASE 002",
    title: "유산 상속 파티 살인사건",
    subtitle: "화려한 별장에서 열린 상속 파티. 유언장이 공개되는 순간, 주인공이 무너졌다.",
    difficulty: "보통",
    estimatedMinutes: 40,
  },
  {
    caseNumber: "CASE 003",
    title: "실종된 연습생",
    subtitle: "데뷔를 앞둔 아이돌 연습생이 연습실에서 사라졌다. 남은 것은 어긋난 춤 동작뿐.",
    difficulty: "어려움",
    estimatedMinutes: 50,
  },
  {
    caseNumber: "CASE 004",
    title: "붉은 도서관의 밀실",
    subtitle: "대학 도서관 밀실에서 발견된 고고학 교수. 책장 사이에 숨겨진 진실을 밝혀라.",
    difficulty: "어려움",
    estimatedMinutes: 55,
  },
];

function buildRoster(): CaseRosterItem[] {
  const cases = CaseEngine.list();
  const firstCase = cases[0];

  const roster: CaseRosterItem[] = [];

  if (firstCase) {
    roster.push({
      caseNumber: "CASE 001",
      locked: false,
      data: firstCase,
      completed: false,
    });
  }

  roster.push(...LOCKED_ROSTER.map((item) => ({ ...item, locked: true as const })));

  return roster;
}

function CaseSelectionPage() {
  const progress = useProgress();
  const baseRoster = buildRoster();

  const roster: CaseRosterItem[] = baseRoster.map((item) => {
    if (item.locked) return item;
    const record = progress.caseResults[item.data.id];
    const completed =
      !!record?.solved || progress.profile.solvedCaseIds.includes(item.data.id);
    return {
      ...item,
      completed,
      bestRank: record?.bestRank ?? null,
    };
  });

  const playable = roster.filter(
    (item): item is Extract<CaseRosterItem, { locked: false }> => !item.locked,
  );
  const availableCount = playable.length;
  const solvedCount = playable.filter((item) => item.completed).length;
  const solvedPercent =
    availableCount === 0 ? 0 : Math.round((solvedCount / availableCount) * 100);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/5 to-transparent" />

      {/* Header */}
      <header className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-8 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold tracking-wide text-foreground sm:text-xl">
                CRIMECATCH
              </h1>
              <p className="hidden font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground sm:block">
                Confidential Investigation Bureau
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-border/60 bg-surface-elevated/60 px-4 py-2 backdrop-blur-md">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Cases
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums text-primary">
              {availableCount.toString().padStart(2, "0")}
            </span>
            <span className="font-mono text-xs text-muted-foreground/60">/</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-muted-foreground">
              {TOTAL_CASES.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:px-8 sm:py-20">
        <div className="mb-12 text-center sm:mb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80">
            // Case Files
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
            수사 대기 중인 사건
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            형사님에게 배정된 사건 파일입니다. 하나의 사건을 완료해야 다음 기밀 파일이 열립니다.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roster.map((item) => (
            <CaseSelectionCard key={item.caseNumber} item={item} />
          ))}
        </div>

        {/* Progress summary */}
        <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-border/50 bg-surface-elevated/40 p-6 text-center backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Overall Progress
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/50">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${solvedPercent}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
              {solvedPercent}%
            </span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground/70">
            공개된 사건 {solvedCount} / {availableCount}건 해결 ·{" "}
            {TOTAL_CASES - availableCount}건의 사건이 곧 추가됩니다.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-8 pt-4 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 sm:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
            v0.1 Alpha
          </p>
          <p className="text-center text-xs text-muted-foreground/70 sm:text-right">
            새로운 사건은 지속적으로 추가됩니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
