import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, PenLine, BookMarked, Network } from "lucide-react";
import {
  NOTEBOOK_SECTIONS,
  useNotebook,
  type NotebookSectionId,
} from "@/lib/notebook";
import { DetectiveBoard, type BoardItem } from "./DetectiveBoard";

type TabId = NotebookSectionId | "board";

interface Props {
  caseId: string;
  boardEvidence?: BoardItem[];
  boardQuestions?: BoardItem[];
  boardSuspects?: BoardItem[];
}

export function DetectiveNotebook({
  caseId,
  boardEvidence = [],
  boardQuestions = [],
  boardSuspects = [],
}: Props) {
  const { notebook, update } = useNotebook(caseId);
  const [active, setActive] = useState<TabId>("suspects");
  const [mode, setMode] = useState<"write" | "read">("write");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const handler = () => {
      setFlash(false);
      requestAnimationFrame(() => setFlash(true));
      const t = setTimeout(() => setFlash(false), 1700);
      return () => clearTimeout(t);
    };
    window.addEventListener("cc:evidence-discovered", handler);
    return () => window.removeEventListener("cc:evidence-discovered", handler);
  }, []);

  const section = useMemo(
    () =>
      active === "board"
        ? null
        : NOTEBOOK_SECTIONS.find((s) => s.id === active) ?? null,
    [active],
  );
  const value = section ? notebook[section.id] ?? "" : "";
  const isBoard = active === "board";

  return (
    <div
      className={
        "notebook-shell overflow-hidden rounded-xl border border-amber-900/30 " +
        (flash ? "cc-discovery-flash" : "")
      }
    >
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-amber-900/30 bg-[#1a1410]/60 px-2 py-1.5">
        <BookMarked className="mx-1 h-3.5 w-3.5 text-amber-200/70" />
        {NOTEBOOK_SECTIONS.map((s) => {
          const filled = (notebook[s.id]?.trim().length ?? 0) > 0;
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={
                "relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors " +
                (isActive
                  ? "bg-amber-100/10 text-amber-100"
                  : "text-amber-200/50 hover:text-amber-100")
              }
            >
              {s.label}
              {filled && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80" />
              )}
              {isActive && (
                <span className="absolute inset-x-1 -bottom-[7px] h-[2px] rounded-full bg-amber-300/70" />
              )}
            </button>
          );
        })}
        <button
          onClick={() => setActive("board")}
          className={
            "relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors " +
            (isBoard
              ? "bg-amber-100/10 text-amber-100"
              : "text-amber-200/50 hover:text-amber-100")
          }
        >
          <Network className="h-3 w-3" />
          추리 보드
          {isBoard && (
            <span className="absolute inset-x-1 -bottom-[7px] h-[2px] rounded-full bg-amber-300/70" />
          )}
        </button>
        {!isBoard && (
          <div className="ml-auto flex items-center gap-1">
            <ModeButton
              active={mode === "write"}
              onClick={() => setMode("write")}
              icon={PenLine}
              label="Write"
            />
            <ModeButton
              active={mode === "read"}
              onClick={() => setMode("read")}
              icon={Eye}
              label="Read"
            />
          </div>
        )}
      </div>

      {/* Page */}
      {isBoard ? (
        <div className="bg-[#120f0d] p-3">
          <DetectiveBoard
            caseId={caseId}
            evidence={boardEvidence}
            questions={boardQuestions}
            suspects={boardSuspects}
          />
        </div>
      ) : (
        <div className="notebook-page relative min-h-[22rem]">
          <div className="pointer-events-none absolute left-10 top-0 bottom-0 w-px bg-red-500/25" />
          <div className="relative px-12 pt-6 pb-8">
            <p className="mb-1 font-hand text-[11px] uppercase tracking-[0.25em] text-amber-900/60">
              Case File · {section?.label}
            </p>
            <p className="mb-4 font-hand text-sm text-amber-950/60 italic">
              {section?.hint}
            </p>

            {mode === "write" ? (
              <textarea
                value={value}
                onChange={(e) =>
                  section && update(section.id, e.target.value)
                }
                placeholder={section?.placeholder}
                spellCheck={false}
                className="notebook-textarea min-h-[18rem] w-full resize-y bg-transparent font-hand text-[15px] leading-[1.9] text-amber-950 placeholder:text-amber-900/40 focus:outline-none"
              />
            ) : (
              <div className="notebook-markdown font-hand text-[15px] leading-[1.9] text-amber-950">
                {value.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {value}
                  </ReactMarkdown>
                ) : (
                  <p className="italic text-amber-900/50">
                    아직 작성된 메모가 없습니다. Write 모드로 전환해 기록을 시작하세요.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-amber-900/30 bg-[#1a1410]/60 px-3 py-1.5 text-[10px] uppercase tracking-widest text-amber-200/60">
        <span>
          {isBoard
            ? "드래그 또는 클릭으로 연결 · 메모 최대 100자"
            : "Markdown 지원 · **굵게** *기울임* # 제목 - 목록"}
        </span>
        <span>자동 저장됨</span>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Eye;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] uppercase tracking-widest transition-colors " +
        (active
          ? "bg-amber-100/15 text-amber-100"
          : "text-amber-200/50 hover:text-amber-100")
      }
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
