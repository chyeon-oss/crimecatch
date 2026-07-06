import { createFileRoute, notFound } from "@tanstack/react-router";
import { Gavel } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { getCaseById, type CaseData } from "@/lib/mock-cases";

export const Route = createFileRoute("/case/$caseId/accuse")({
  loader: ({ params }) => {
    const data = getCaseById(params.caseId);
    if (!data) throw notFound();
    return { data };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `최종 추리: ${loaderData.data.title} — CaseNote` },
          { name: "robots", content: "noindex" },
        ]
      : [{ title: "최종 추리 — CaseNote" }, { name: "robots", content: "noindex" }],
  }),
  component: AccusePage,
});

function AccusePage() {
  const { data } = Route.useLoaderData() as { data: CaseData };

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
            현재는 수사 단계까지의 UI 흐름을 검증하는 단계입니다. 곧 용의자 지목,
            동기 선택, 범행 방법 재구성, 결과 화면이 연결됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
