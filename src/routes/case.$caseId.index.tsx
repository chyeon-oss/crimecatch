import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { CaseDetail } from "@/components/CaseDetail";
import { Route as CaseRoute } from "./case.$caseId";

export const Route = createFileRoute("/case/$caseId/")({
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { data } = CaseRoute.useLoaderData();
  return (
    <div className="min-h-screen noir-grain">
      <TopBar to="/" label="사건 목록" />
      <CaseDetail data={data} />
    </div>
  );
}
