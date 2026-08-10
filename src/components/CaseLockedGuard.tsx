import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { TopBar } from "@/components/TopBar";

/**
 * Spoiler-free guard screen shown when a player reaches a case route
 * before its prerequisite case has been solved.
 */
export function CaseLockedGuard({
  title,
  reason,
}: {
  title: string;
  reason: string;
}) {
  return (
    <div className="min-h-screen noir-grain">
      <TopBar to="/" label="사건 목록" />
      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-muted/50">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Restricted File
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
          아직 열람 권한이 없습니다
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {reason}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">{title}</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          사건 목록으로 돌아가기
        </Link>
      </main>
    </div>
  );
}
