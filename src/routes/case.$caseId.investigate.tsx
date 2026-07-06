import { createFileRoute, notFound } from "@tanstack/react-router";
import { FileText, Archive, Users, NotebookPen, Lock } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { InvestigationSection } from "@/components/InvestigationSection";
import { getCaseById, type CaseData } from "@/lib/mock-cases";

export const Route = createFileRoute("/case/$caseId/investigate")({
  loader: ({ params }) => {
    const data = getCaseById(params.caseId);
    if (!data) throw notFound();
    return { data };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `수사 중: ${loaderData.data.title} — CaseNote` }]
      : [{ title: "수사 — CaseNote" }, { name: "robots", content: "noindex" }],
  }),
  component: InvestigatePage,
});

function InvestigatePage() {
  const { data } = Route.useLoaderData() as { data: CaseData };
  const params = Route.useParams();

  return (
    <div className="min-h-screen noir-grain">
      <TopBar
        to="/case/$caseId"
        label="사건 정보"
        right={
          <span className="text-xs uppercase tracking-widest text-primary/80">
            수사 중
          </span>
        }
      />

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:pt-10">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            CASE · {params.caseId.toUpperCase()}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {data.title}
          </h1>
        </div>

        <div className="grid gap-4">
          <InvestigationSection
            icon={FileText}
            title="사건 개요"
            subtitle="지금까지 확인된 사실"
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {data.overview}
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-md border border-border/60 bg-surface-elevated px-3 py-2">
                <dt className="text-muted-foreground">피해자</dt>
                <dd className="mt-0.5 text-foreground">
                  {data.victim.name} · {data.victim.occupation}
                </dd>
              </div>
              <div className="rounded-md border border-border/60 bg-surface-elevated px-3 py-2">
                <dt className="text-muted-foreground">사건 시각</dt>
                <dd className="mt-0.5 text-foreground">{data.incidentTime}</dd>
              </div>
            </dl>
          </InvestigationSection>

          <InvestigationSection
            icon={Archive}
            title="증거 보관함"
            subtitle={`${data.evidence.length}개의 증거`}
          >
            <ul className="grid gap-2">
              {data.evidence.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-surface-elevated p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{e.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{e.description}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-primary/70">
                      발견 장소 · {e.location}
                    </p>
                  </div>
                  <Lock className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/60" />
                </li>
              ))}
            </ul>
          </InvestigationSection>

          <InvestigationSection
            icon={Users}
            title="용의자 목록"
            subtitle={`${data.suspects.length}명의 용의자`}
          >
            <ul className="grid gap-2">
              {data.suspects.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-border/60 bg-surface-elevated p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {s.name}{" "}
                        <span className="text-xs text-muted-foreground">
                          · {s.age}세 · {s.occupation}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.relation}</p>
                    </div>
                    <button
                      disabled
                      className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground/70"
                    >
                      심문 (준비 중)
                    </button>
                  </div>
                  <p className="mt-2 rounded border-l-2 border-primary/40 bg-background/40 px-3 py-1.5 text-xs italic text-muted-foreground">
                    “{s.alibi}”
                  </p>
                </li>
              ))}
            </ul>
          </InvestigationSection>

          <InvestigationSection
            icon={NotebookPen}
            title="추리 노트"
            subtitle="당신의 가설을 기록하세요"
          >
            <textarea
              placeholder="용의자, 동기, 알리바이의 모순점을 자유롭게 메모하세요..."
              className="min-h-32 w-full resize-y rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
            />
            <button
              disabled
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary/80"
            >
              범인 지목 (곧 공개)
            </button>
          </InvestigationSection>
        </div>
      </main>
    </div>
  );
}
