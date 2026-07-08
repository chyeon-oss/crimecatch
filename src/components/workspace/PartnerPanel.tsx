import { useEffect, useRef, useState } from "react";
import { Bot, Lightbulb, Send, Sparkles, Brain, BookMarked } from "lucide-react";
import { IntelligenceEngine, StoryRuntime, type IntelligenceState } from "@/engine";
import type { Case, StoryRuntimeState } from "@/types";
import { useNotebook, NOTEBOOK_SECTIONS, notebookSummary } from "@/lib/notebook";



interface PartnerMessage {
  id: string;
  role: "partner" | "detective";
  text: string;
  kind?: "hint" | "reasoning" | "chat";
}

interface Props {
  case: Case;
  intelligenceState: IntelligenceState;
  storyState: StoryRuntimeState;
}

/**
 * Detective Partner panel.
 *
 * Architecture note: this is the presentational shell for the future AI
 * interrogation / reasoning layer. Messages are derived locally from the
 * current investigation intelligence. When the AI layer is wired in, the
 * `sendToPartner` call site is the single integration point.
 */
export function PartnerPanel({ case: c, intelligenceState, storyState }: Props) {
  const [tab, setTab] = useState<"chat" | "hints" | "reasoning">("chat");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<PartnerMessage[]>(() => [
    {
      id: "greet",
      role: "partner",
      text: `안녕하세요, 형사님. 저는 파트너 AI입니다. "${c.title}" 사건을 함께 조사하죠.`,
      kind: "chat",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const questions = IntelligenceEngine.visibleQuestions(c, intelligenceState);
  const activeQuestions = questions.filter((q) => q.status === "active");
  const solvedQuestions = questions.filter((q) => q.status === "solved");
  const readCount = intelligenceState.readIds.size;

  const { notebook } = useNotebook(c.id);
  const nbSummary = notebookSummary(notebook);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, tab]);

  const referenceNotebook = (userText: string): string | null => {
    const q = userText.toLowerCase();
    // Match a section the detective mentions, or fall back to any filled section.
    const matchedSection =
      NOTEBOOK_SECTIONS.find(
        (s) =>
          q.includes(s.label.toLowerCase()) ||
          q.includes(s.id) ||
          q.includes(SECTION_KEYWORDS[s.id]),
      ) ?? NOTEBOOK_SECTIONS.find((s) => notebook[s.id]?.trim().length);
    if (!matchedSection) return null;
    const raw = notebook[matchedSection.id]?.trim();
    if (!raw) return null;
    const snippet = raw
      .replace(/[#>*_`\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140);
    return `노트북의 "${matchedSection.label}" 항목을 참고했습니다 — "${snippet}${raw.length > 140 ? "…" : ""}". 이 기록과 지금까지의 증거를 비교해보시죠.`;
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    const user: PartnerMessage = {
      id: `u_${Date.now()}`,
      role: "detective",
      text,
      kind: "chat",
    };
    // Partner reasoning. Never surfaces suspect.hiddenTruth or Solution — those
    // are gated by the accusation flow. Uses only player-authored notebook +
    // discovered/read evidence state.
    const notebookLine = referenceNotebook(text);
    const baseReply =
      activeQuestions.length > 0
        ? `아직 확인이 필요한 의문이 ${activeQuestions.length}개 있습니다. 우선 "${activeQuestions[0].question.text}"부터 짚어보시죠.`
        : "지금까지 수집한 단서들이 하나의 그림으로 모이고 있습니다. 가설을 정리해보시죠.";
    const reply: PartnerMessage = {
      id: `p_${Date.now() + 1}`,
      role: "partner",
      text: notebookLine ? `${notebookLine}\n\n${baseReply}` : baseReply,
      kind: "reasoning",
    };
    setHistory((h) => [...h, user, reply]);
  };


  return (
    <aside className="flex h-full flex-col border-l border-border/60 bg-card/40 backdrop-blur-sm">
      <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            DETECTIVE PARTNER
          </p>
          <p className="truncate font-display text-sm text-foreground">
            수사 파트너 · {StoryRuntimePhaseLabel(storyState)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Ready
        </span>
      </header>

      <nav className="flex items-center gap-1 border-b border-border/60 px-2 py-1.5">
        <TabButton
          active={tab === "chat"}
          onClick={() => setTab("chat")}
          icon={Sparkles}
          label="Conversation"
        />
        <TabButton
          active={tab === "hints"}
          onClick={() => setTab("hints")}
          icon={Lightbulb}
          label={`Hints${activeQuestions.length ? ` · ${activeQuestions.length}` : ""}`}
        />
        <TabButton
          active={tab === "reasoning"}
          onClick={() => setTab("reasoning")}
          icon={Brain}
          label="Reasoning"
        />
      </nav>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        {tab === "chat" && (
          <div className="space-y-2.5">
            {history.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        )}

        {tab === "hints" && (
          <div className="space-y-2">
            {activeQuestions.length === 0 && (
              <EmptyLine text="현재 새로운 의문이 없습니다." />
            )}
            {activeQuestions.map(({ question }) => (
              <div
                key={question.id}
                className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5"
              >
                <div className="mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-amber-300">
                  <Lightbulb className="h-3 w-3" />
                  Hint
                </div>
                <p className="text-xs text-foreground/90">{question.text}</p>
              </div>
            ))}
            {solvedQuestions.length > 0 && (
              <>
                <p className="pt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  해결됨
                </p>
                {solvedQuestions.map(({ question }) => (
                  <div
                    key={question.id}
                    className="rounded-lg border border-border/40 bg-surface-elevated/40 p-2.5"
                  >
                    <p className="text-xs text-muted-foreground line-through">
                      {question.text}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "reasoning" && (
          <div className="space-y-3 text-xs text-foreground/90">
            <ReasoningLine label="현재 단계">
              {StoryRuntimePhaseLabel(storyState)}
            </ReasoningLine>
            <ReasoningLine label="확인한 증거">
              {readCount}개 / {c.evidence.length}개
            </ReasoningLine>
            <ReasoningLine label="남은 의문">
              {activeQuestions.length}개
            </ReasoningLine>
            <ReasoningLine label="용의자">
              {c.suspects.map((s) => s.name).join(", ")}
            </ReasoningLine>
            <ReasoningLine label="노트북">
              <span className="inline-flex items-center gap-1">
                <BookMarked className="h-3 w-3 text-amber-300" />
                {nbSummary.filledCount}/{nbSummary.totalSections} 섹션 · {nbSummary.words} words
              </span>
            </ReasoningLine>

            <div className="rounded-lg border border-border/40 bg-surface-elevated/40 p-3">
              <p className="mb-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                파트너 메모
              </p>
              <p className="leading-relaxed">
                {activeQuestions.length > 0
                  ? `아직 ${activeQuestions.length}개의 의문이 해결되지 않았습니다. 관련 증거를 다시 살펴보세요.`
                  : "모든 주요 의문이 정리되었습니다. 이제 가설을 세워 최종 추리로 넘어갈 준비가 되었습니다."}
              </p>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-border/60 bg-card/60 px-3 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="파트너에게 물어보기..."
          className="h-9 flex-1 rounded-lg border border-border/60 bg-surface-elevated/60 px-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="grid h-9 w-9 place-items-center rounded-lg border border-primary/40 bg-primary/15 text-primary transition-colors hover:bg-primary/25 disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </aside>
  );
}

function MessageBubble({ message }: { message: PartnerMessage }) {
  const isPartner = message.role === "partner";
  return (
    <div
      className={
        "flex " + (isPartner ? "justify-start" : "justify-end")
      }
    >
      <div
        className={
          "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed " +
          (isPartner
            ? "border border-border/50 bg-surface-elevated/60 text-foreground/90"
            : "bg-primary/90 text-primary-foreground")
        }
      >
        {message.text}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Bot;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors " +
        (active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border/50 py-4 text-center text-[11px] text-muted-foreground">
      {text}
    </p>
  );
}

function ReasoningLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-1.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-right text-xs text-foreground">
        {children}
      </span>
    </div>
  );
}

function StoryRuntimePhaseLabel(state: StoryRuntimeState) {
  return StoryRuntime.phaseDef(state.phase).koreanTitle;
}

