import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  to?: string;
  onClick?: () => void;
  label?: string;
  right?: ReactNode;
}

export function TopBar({ to, onClick, label = "돌아가기", right }: Props) {
  const inner = (
    <>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        {to ? (
          <Link
            to={to}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {inner}
          </Link>
        ) : (
          <button
            onClick={onClick}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {inner}
          </button>
        )}
        {right}
      </div>
    </header>
  );
}
