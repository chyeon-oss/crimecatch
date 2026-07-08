import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Fingerprint, ArrowRight, FileSearch } from "lucide-react";
import { DossierCard } from "@/components/DossierCard";
import { CinematicBackdrop } from "@/components/CinematicBackdrop";
import { CaseEngine } from "@/engine";
import heroDetective from "@/assets/hero-detective.jpg";
import detectiveBadge from "@/assets/detective-badge.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "크라임캐치 — AI 탐정 수사 플랫폼" },
      {
        name: "description",
        content:
          "기밀 사건 파일을 열고, 증거를 분석하고, 용의자를 심문하여 진실을 밝혀내세요. AI 기반의 프리미엄 탐정 수사 게임.",
      },
      { property: "og:title", content: "크라임캐치 — AI 탐정 수사 플랫폼" },
      {
        property: "og:description",
        content:
          "프리미엄 AI 탐정 수사 게임. 범죄 현장을 조사하고 증거를 분석하여 사건을 해결하세요.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const cases = CaseEngine.list();
  const firstAvailable = cases.find((c) => c.status !== "프리미엄") ?? cases[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─────────────── HERO ─────────────── */}
      <section className="relative isolate overflow-hidden border-b border-border/40">
        {/* Cinematic detective backdrop image */}
        <div className="pointer-events-none absolute inset-0">
          <img
            src={heroDetective}
            alt="수사관의 책상 위에 놓인 사건 파일과 돋보기, 지문 증거"
            width={1920}
            height={1280}
            className="h-full w-full object-cover opacity-40"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, var(--background) 0%, color-mix(in oklab, var(--background) 85%, transparent) 45%, color-mix(in oklab, var(--background) 40%, transparent) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 40%, var(--background) 100%)",
            }}
          />
        </div>
        <CinematicBackdrop />

        {/* Top status bar */}
        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:px-8">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              style={{ animation: "cc-pulse-dot 2.4s ease-in-out infinite" }}
            />
            <span className="text-primary/90">기밀문서</span>
            <span className="hidden text-muted-foreground/60 sm:inline">// 1급 열람 권한</span>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <span>시스템 · 보안</span>
            <span>케이스노트 / v3.14</span>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-primary transition-colors hover:bg-primary/15"
          >
            <Shield className="h-3 w-3" />
            <span className="tracking-widest">본부</span>
          </Link>
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 sm:px-8 sm:pt-28 lg:pt-36">
          <div className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 backdrop-blur-md">
              <Fingerprint className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/90">
                수사 본부 · 2026 설립
              </span>
            </div>

            <h1 className="font-display text-6xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
              크라임
              <br />
              <span className="text-primary" style={{ textShadow: "0 0 40px color-mix(in oklab, var(--gold) 45%, transparent)" }}>
                캐치
              </span>
            </h1>

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px w-12 bg-primary/60" />
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground sm:text-sm">
                AI 탐정 수사 플랫폼
              </p>
            </div>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              기밀 사건 파일을 열어보세요. 흩어진 증거의 조각을 조사하고, 용의자들을 교차 심문하여
              진실이 묻힌 그 순간을 재구성하십시오.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/case/$caseId/investigate"
                params={{ caseId: firstAvailable.slug }}
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-10px_color-mix(in_oklab,var(--gold)_60%,transparent)]"
              >
                <span>수사 시작하기</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#case-files"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-6 py-3.5 text-sm font-semibold tracking-wide text-foreground backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-card/70"
              >
                <FileSearch className="h-4 w-4 text-primary" />
                <span>사건 목록 보기</span>
              </a>
            </div>

            {/* Ambient stats row */}
            <div className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-border/50 pt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">{cases.length.toString().padStart(2, "0")}</p>
                <p className="mt-1">진행 중 사건</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">24시간</p>
                <p className="mt-1">현장 대응</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-primary">AI</p>
                <p className="mt-1">수사 지원</p>
              </div>
            </div>
          </div>

          {/* Detective badge — floating emblem */}
          <img
            src={detectiveBadge}
            alt="탐정 배지"
            width={1024}
            height={1024}
            loading="lazy"
            className="pointer-events-none absolute right-6 top-24 hidden h-64 w-64 opacity-70 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] lg:block xl:h-80 xl:w-80"
            style={{ animation: "cc-float 12s ease-in-out infinite" }}
          />
        </div>

        {/* Bottom hairline */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </section>

      {/* ─────────────── CASE FILES ─────────────── */}
      <main id="case-files" className="relative mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80">
              // 사건 기록보관소
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
              사건 파일
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              모든 사건 파일은 하나의 독립된 수사입니다. 형사님, 사건을 선택하세요.
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {cases.length}건 열람 가능
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <DossierCard key={c.id} data={c} index={i} />
          ))}
        </div>

        <footer className="mt-24 flex flex-col items-center gap-2 border-t border-border/50 pt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>크라임캐치 · 수사 픽션 전담 본부</span>
          <span className="text-muted-foreground/50">등장하는 모든 사건은 허구입니다.</span>
        </footer>
      </main>
    </div>
  );
}
