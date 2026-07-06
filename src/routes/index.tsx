import { createFileRoute } from "@tanstack/react-router";
import { CaseCard } from "@/components/CaseCard";
import { CaseEngine } from "@/engine";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const cases = CaseEngine.list();
  return (
    <div className="min-h-screen noir-grain">
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(1200px 500px at 50% -20%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-14 sm:pt-20">
          <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-primary">
            <span className="h-px w-8 bg-primary/60" />
            CASENOTE
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            당신은 탐정입니다.
            <br />
            <span className="text-primary">사건의 진실</span>을 밝혀내세요.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            사건 파일을 열고, 증거를 조사하고, 용의자를 심문하세요.
            마지막에는 당신이 지목한 범인을 제출합니다.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-xl text-foreground sm:text-2xl">사건 파일</h2>
          <span className="text-xs text-muted-foreground">총 {cases.length}건</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cases.map((c) => (
            <CaseCard key={c.id} data={c} />
          ))}
        </div>

        <footer className="mt-16 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          © CaseNote · 모든 사건은 허구입니다.
        </footer>
      </main>
    </div>
  );
}
