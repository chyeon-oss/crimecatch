import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { getCaseById } from "@/lib/mock-cases";

export const Route = createFileRoute("/case/$caseId")({
  loader: ({ params }) => {
    const data = getCaseById(params.caseId);
    if (!data) throw notFound();
    return { data };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.data.title} — CaseNote` },
          { name: "description", content: loaderData.data.shortDescription },
        ]
      : [{ title: "사건을 찾을 수 없음 — CaseNote" }, { name: "robots", content: "noindex" }],
  }),
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <TopBar to="/" label="목록으로" />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl">사건을 찾을 수 없습니다</h1>
      </div>
    </div>
  ),
});
