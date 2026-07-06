import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Fingerprint, ArrowRight, FileSearch } from "lucide-react";
import { DossierCard } from "@/components/DossierCard";
import { CinematicBackdrop } from "@/components/CinematicBackdrop";
import { CaseEngine } from "@/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CrimeCatch — AI Detective Investigation Platform" },
      {
        name: "description",
        content:
          "Open classified case files, examine evidence, interrogate suspects, and uncover the truth in an AI-powered detective investigation platform.",
      },
      { property: "og:title", content: "CrimeCatch — AI Detective Investigation Platform" },
      {
        property: "og:description",
        content:
          "A premium AI-powered detective game. Investigate crime scenes, analyze evidence, and solve the case.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const cases = CaseEngine.list();
  const firstAvailable = cases.find((c) => c.status !== "프리미엄") ?? cases[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─────────────── HERO ─────────────── */}
      <section className="relative isolate overflow-hidden border-b border-border/40">
        <CinematicBackdrop />

        {/* Top status bar */}
        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:px-8">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              style={{ animation: "cc-pulse-dot 2.4s ease-in-out infinite" }}
            />
            <span className="text-primary/90">CLASSIFIED</span>
            <span className="hidden text-muted-foreground/60 sm:inline">// LEVEL-1 CLEARANCE</span>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <span>SYS · SECURE</span>
            <span>CASENOTE / v3.14</span>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-primary transition-colors hover:bg-primary/15"
          >
            <Shield className="h-3 w-3" />
            <span className="tracking-widest">HQ</span>
          </Link>
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 sm:px-8 sm:pt-28 lg:pt-36">
          <div className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 backdrop-blur-md">
              <Fingerprint className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/90">
                Case Bureau · Est. 2026
              </span>
            </div>

            <h1 className="font-display text-6xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
              CRIME
              <br />
              <span className="text-primary" style={{ textShadow: "0 0 40px color-mix(in oklab, var(--gold) 45%, transparent)" }}>
                CATCH
              </span>
            </h1>

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px w-12 bg-primary/60" />
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground sm:text-sm">
                AI Detective Investigation Platform
              </p>
            </div>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Open the classified dossier. Examine every fragment of evidence, cross-reference the
              suspects, and reconstruct the moment the truth was buried.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/case/$caseId/investigate"
                params={{ caseId: firstAvailable.slug }}
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-10px_color-mix(in_oklab,var(--gold)_60%,transparent)]"
              >
                <span>Start Investigation</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#case-files"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-6 py-3.5 text-sm font-semibold tracking-wide text-foreground backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-card/70"
              >
                <FileSearch className="h-4 w-4 text-primary" />
                <span>Browse Cases</span>
              </a>
            </div>

            {/* Ambient stats row */}
            <div className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-border/50 pt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">{cases.length.toString().padStart(2, "0")}</p>
                <p className="mt-1">Active Cases</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">24/7</p>
                <p className="mt-1">Field Ops</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-primary">AI</p>
                <p className="mt-1">Assisted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hairline */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </section>

      {/* ─────────────── CASE FILES ─────────────── */}
      <main id="case-files" className="relative mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80">
              // Archive
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Case Files
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Every dossier is a self-contained investigation. Choose your case, detective.
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {cases.length} Files Available
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <DossierCard key={c.id} data={c} index={i} />
          ))}
        </div>

        <footer className="mt-24 flex flex-col items-center gap-2 border-t border-border/50 pt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>CrimeCatch · Bureau of Investigative Fiction</span>
          <span className="text-muted-foreground/50">All cases depicted are fictional.</span>
        </footer>
      </main>
    </div>
  );
}
