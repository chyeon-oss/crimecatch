import { useState } from "react";

interface Props {
  storageKey?: string;
}

export function DetectiveNote({ storageKey }: Props) {
  const [value, setValue] = useState("");

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="의심되는 단서, 용의자의 모순점, 범행 동기를 정리해보세요."
        className="min-h-40 w-full resize-y rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
        data-storage-key={storageKey}
      />
      <p className="mt-2 text-[11px] text-muted-foreground">
        메모는 이 화면에서만 유지됩니다 · 자동 저장은 다음 단계에서 지원됩니다.
      </p>
    </div>
  );
}
