import { useEffect, useRef } from "react";
import { FileText, HelpCircle, MapPin } from "lucide-react";
import type { DialogueChoice, TranscriptEntry } from "@/types/dialogue";

interface Props {
  entries: TranscriptEntry[];
  isTyping: boolean;
  choices: Array<{ choice: DialogueChoice; available: boolean }>;
  onChoose: (choiceId: string) => void;
  onSkip: () => void;
  threadTitle: string | null;
}

const systemIcon = {
  EVIDENCE: FileText,
  QUESTION: HelpCircle,
  SCENE: MapPin,
} as const;

/**
 * Messenger-style conversation surface for authored branching dialogue.
 * Tapping the transcript reveals the remaining lines of the current node.
 */
export function ConversationSurface({
  entries,
  isTyping,
  choices,
  onChoose,
  onSkip,
  threadTitle,
}: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length, isTyping, choices.length]);

  return (
    <section className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-border/60 bg-background/90 px-4 py-2 backdrop-blur">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">현장 교신</p>
        <p className="text-[13px] text-foreground">{threadTitle ?? "수사 기록"}</p>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4" onClick={onSkip} role="presentation">
        {entries.length === 0 && !isTyping && (
          <p className="py-10 text-center text-xs text-muted-foreground">
            아직 기록된 대화가 없습니다.
          </p>
        )}

        {entries.map((e) => {
          if (e.kind === "CHOICE") {
            return (
              <div key={e.id} className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-[13px] leading-relaxed text-primary-foreground">
                  {e.text}
                </p>
              </div>
            );
          }
          if (e.kind === "SYSTEM") {
            const Icon = systemIcon[e.systemKind ?? "SCENE"];
            return (
              <div
                key={e.id}
                className="mx-auto flex w-full items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 animate-fade-in"
              >
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-[12px] leading-relaxed text-foreground/90">{e.text}</p>
              </div>
            );
          }
          const mine = e.role === "DETECTIVE";
          return (
            <div key={e.id} className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
              <span className="px-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                {e.speaker}
              </span>
              <p
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                  mine
                    ? "rounded-br-sm border border-border/70 bg-surface-elevated text-foreground"
                    : "rounded-bl-sm border border-border/50 bg-card text-foreground"
                }`}
              >
                {e.text}
              </p>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 px-1 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
                style={{ animationDelay: `${i * 140}ms` }}
              />
            ))}
            <span className="ml-1 text-[10px] text-muted-foreground">
              입력 중… (탭하면 즉시 표시)
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {choices.length > 0 && (
        <div className="sticky bottom-0 space-y-2 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur">
          {choices.map(({ choice, available }) => (
            <button
              key={choice.id}
              type="button"
              data-testid="dialogue-choice"
              data-available={available ? "true" : "false"}
              disabled={!available}
              onClick={() => onChoose(choice.id)}
              className={`flex min-h-[44px] w-full items-center rounded-lg border px-3.5 py-2.5 text-left text-[13px] leading-snug transition-colors ${
                available
                  ? "border-primary/40 bg-primary/10 text-foreground hover:bg-primary/15"
                  : "border-border/50 bg-surface-elevated/60 text-muted-foreground"
              }`}
            >
              {available ? choice.text : (choice.lockedHint ?? choice.text)}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
