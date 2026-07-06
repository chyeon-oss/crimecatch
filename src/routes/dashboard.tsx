import { createFileRoute } from "@tanstack/react-router";
import {
  Briefcase,
  History,
  Lock as LockIcon,
  Trophy,
  BarChart3,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { InvestigationSection } from "@/components/InvestigationSection";
import { DetectiveIDCard } from "@/components/DetectiveIDCard";
import { CareerStats } from "@/components/CareerStats";
import { ActiveCaseTile } from "@/components/ActiveCaseTile";
import { RecentSolvedList } from "@/components/RecentSolvedList";
import { LockedCasesList } from "@/components/LockedCasesList";
import { AchievementGrid } from "@/components/AchievementGrid";
import { CaseEngine } from "@/engine";
import { useProgress } from "@/state/progressStore";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "탐정 사무실 — CaseNote" },
      {
        name: "description",
        content: "당신의 수사 경력과 배정된 사건, 업적을 확인하세요.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const state = useProgress();
  const cases = CaseEngine.list();
  const activeCase = state.activeCaseId ? CaseEngine.get(state.activeCaseId) ?? null : null;

  return (
    <div className="min-h-screen noir-grain">
      <TopBar to="/" label="사건 목록" />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary">
            DETECTIVE OFFICE
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            탐정 사무실
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            당신의 경력이 이곳에 기록됩니다.
          </p>
        </div>

        <div className="grid gap-4">
          <DetectiveIDCard profile={state.profile} />

          <InvestigationSection icon={BarChart3} title="경력 통계" subtitle="누적 지표">
            <CareerStats profile={state.profile} />
          </InvestigationSection>

          <InvestigationSection icon={Briefcase} title="현재 배정 사건">
            <ActiveCaseTile activeCase={activeCase} />
          </InvestigationSection>

          <InvestigationSection icon={History} title="최근 해결 사건">
            <RecentSolvedList history={state.history} resolve={(id) => CaseEngine.get(id)} />
          </InvestigationSection>

          <InvestigationSection icon={LockIcon} title="잠긴 사건 파일" subtitle="접근 권한 부족">
            <LockedCasesList cases={cases} profile={state.profile} />
          </InvestigationSection>

          <InvestigationSection icon={Trophy} title="업적">
            <AchievementGrid unlocked={state.profile.achievementsUnlocked} />
          </InvestigationSection>
        </div>
      </main>
    </div>
  );
}
