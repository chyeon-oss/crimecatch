import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { CaseDetail } from "@/components/CaseDetail";
import { CaseLockedGuard } from "@/components/CaseLockedGuard";
import { caseAccess } from "@/lib/caseAccess";
import { useProgress } from "@/state/progressStore";
import { Route as CaseRoute } from "./case.$caseId";

export const Route = createFileRoute("/case/$caseId/")({
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { data } = CaseRoute.useLoaderData();
  const progress = useProgress();
  const access = caseAccess(progress, data.id);

  if (!access.unlocked) {
    return <CaseLockedGuard title={data.title} reason={access.reason ?? ""} />;
  }

  return (
    <div className="min-h-screen noir-grain">
      <TopBar to="/" label="사건 목록" />
      <CaseDetail data={data} />
    </div>
  );
}
