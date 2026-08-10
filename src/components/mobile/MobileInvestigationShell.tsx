import type { ReactNode } from "react";
import { Fingerprint, MessagesSquare, FolderOpen, Brain } from "lucide-react";

export type ShellTab = "scene" | "talk" | "file" | "deduce";

interface TabDef {
  id: ShellTab;
  label: string;
  icon: typeof Fingerprint;
}

const TABS: TabDef[] = [
  { id: "scene", label: "현장", icon: Fingerprint },
  { id: "talk", label: "대화", icon: MessagesSquare },
  { id: "file", label: "사건파일", icon: FolderOpen },
  { id: "deduce", label: "추리", icon: Brain },
];

interface Props {
  header: ReactNode;
  active: ShellTab;
  onChange: (tab: ShellTab) => void;
  badges?: Partial<Record<ShellTab, number>>;
  children: ReactNode;
}

/**
 * Mobile-first investigation shell: one screen at a time, fixed bottom tabs,
 * centered as an app frame on desktop. Safe-area aware.
 */
export function MobileInvestigationShell({ header, active, onChange, badges, children }: Props) {
  return (
    <div className="min-h-screen bg-background/60">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[460px] flex-col border-border/60 bg-background sm:border-x">
        <div className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
          {header}
        </div>

        <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom))]">{children}</main>

        <nav
          className="fixed bottom-0 left-1/2 z-30 w-full max-w-[460px] -translate-x-1/2 border-t border-border/60 bg-background/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ul className="grid grid-cols-4">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.id;
              const badge = badges?.[t.id] ?? 0;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onChange(t.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex min-h-[56px] w-full flex-col items-center justify-center gap-1 text-[10px] tracking-wide transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {t.label}
                    {badge > 0 && (
                      <span className="absolute right-[22%] top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                        {badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
