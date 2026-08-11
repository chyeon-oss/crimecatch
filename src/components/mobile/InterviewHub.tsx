import { AlertTriangle, Check, ChevronRight, MessageSquare } from "lucide-react";
import type { SuspectMood } from "@/types/interview";
import { MOOD_LABEL } from "@/lib/interviewRuntime";

export interface HubRoom {
  suspectId: string;
  name: string;
  title: string;
  progress: { done: number; total: number };
  complete: boolean;
  mood: SuspectMood;
  contradictions: number;
  started: boolean;
  lastLine: string | null;
  portrait?: string;
}

interface Props {
  rooms: HubRoom[];
  onOpen: (suspectId: string) => void;
  /** Suspects the runtime still needs before the case can advance. */
  remainingRequiredNames?: string[];
  heroImage?: string;
}

const MOOD_TONE: Record<SuspectMood, string> = {
  calm: "border-border/60 text-muted-foreground",
  guarded: "border-primary/40 text-primary",
  shaken: "border-destructive/40 text-destructive",
};

/**
 * Scene 03 interview hub — a messenger-style room list. Each suspect is a
 * chat room with progress, current mood, and captured contradictions.
 * Mood is a reaction reading only; it never implies guilt.
 */
export function InterviewHub({ rooms, onOpen, remainingRequiredNames = [], heroImage }: Props) {
  const remaining = rooms.filter((r) => !r.complete).length;
  const required = remainingRequiredNames.length;

  return (
    <section className="space-y-3 px-4 py-4">
      {heroImage && (
        <div className="relative -mx-4 -mt-4 h-40 overflow-hidden border-b border-border/60">
          <img src={heroImage} alt="사건 관계자 네 명" className="h-full w-full object-cover object-[center_40%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <p className="absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.28em] text-white/70">Persons of interest · 4</p>
        </div>
      )}
      <header>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">진술 조사</p>
        <h2 className="text-[15px] font-semibold text-foreground">용의자 인터뷰</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {required > 0
            ? `다음 단계로 넘어가려면 ${remainingRequiredNames.join(", ")}의 기본 질문을 모두 마쳐야 합니다. 채팅방을 열어 질문 목록의 항목을 차례로 물어보세요.`
            : remaining > 0
              ? `필수 진술은 확보했습니다. 남은 ${remaining}명의 진술도 들어보면 모순을 더 찾을 수 있습니다.`
              : "네 명의 진술을 모두 확보했습니다. 모순을 다시 확인해 보세요."}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground/70">
          표시되는 감정 상태는 반응 기록일 뿐, 유죄 여부와는 무관합니다.
        </p>
      </header>

      <ul className="space-y-2">
        {rooms.map((r) => (
          <li key={r.suspectId}>
            <button
              type="button"
              data-testid={`interview-room-${r.suspectId}`}
              data-complete={r.complete ? "true" : "false"}
              data-required-done={r.progress.done}
              data-required-total={r.progress.total}
              onClick={() => onOpen(r.suspectId)}
              className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-3 text-left transition-colors hover:border-primary/40"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-border/70 bg-surface-elevated text-[13px] font-semibold text-foreground">
                {r.portrait ? <img src={r.portrait} alt="" className="h-full w-full object-cover object-top" /> : r.name.slice(0, 1)}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-medium text-foreground">{r.name}</span>
                  <span
                    className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] tracking-wide ${MOOD_TONE[r.mood]}`}
                  >
                    {MOOD_LABEL[r.mood]}
                  </span>
                  {r.complete && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                  {r.title}
                </span>
                <span className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {r.started
                    ? `필수 질문 ${r.progress.done}/${r.progress.total}`
                    : "아직 조사하지 않음"}
                  {r.contradictions > 0 && (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      모순 {r.contradictions}
                    </span>
                  )}
                </span>

                {r.lastLine && (
                  <span className="mt-1 block truncate text-[11px] text-foreground/70">
                    “{r.lastLine}”
                  </span>
                )}
              </span>

              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
