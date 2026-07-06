import { createFileRoute } from "@tanstack/react-router";
import { Gavel } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Route as CaseRoute } from "./case.$caseId";

export const Route = createFileRoute("/case/$caseId/accuse")({
  head: () => ({
    meta: [
      { title: "최종 추리 — CaseNote" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccusePage,
});

function AccusePage() {
  const { data } = CaseRoute.useLoaderData();

  return (
    <div className="min-h-screen noir-grain">
      <TopBar to="/case/$caseId/investigate" label="수사로 돌아가기" />

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
          <Gavel className="h-6 w-6" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
          FINAL DEDUCTION
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          최종 추리
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{data.title}</p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left shadow-[var(--shadow-noir)] sm:p-8">
          <p className="text-sm leading-relaxed text-foreground/90">
            범인, 동기, 범행 방법을 선택하는 기능은 다음 단계에서 구현됩니다.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            엔진 계층에는 이미 <code>AccusationEngine.submit()</code>{" "}
            검증과 업적 판정 로직이 준비되어 있으며, UI만 연결하면 됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
