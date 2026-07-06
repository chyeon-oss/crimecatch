import type { Case } from "@/types";
import { ALL_CASES } from "@/data/cases";

/**
 * CaseEngine — single source of truth for case discovery.
 * React components must never import case data directly; they go through
 * the engine so that adding a new case is a pure data change.
 */
class CaseEngineImpl {
  private readonly registry = new Map<string, Case>();

  constructor(cases: Case[]) {
    for (const c of cases) this.register(c);
  }

  register(c: Case): void {
    if (this.registry.has(c.id)) {
      console.warn(`[CaseEngine] duplicate case id: ${c.id}`);
    }
    this.registry.set(c.id, c);
  }

  list(): Case[] {
    return Array.from(this.registry.values());
  }

  getById(id: string): Case | undefined {
    return this.registry.get(id);
  }

  getBySlug(slug: string): Case | undefined {
    return this.list().find((c) => c.slug === slug);
  }

  /** Convenience — most routes use slug interchangeably with id. */
  get(idOrSlug: string): Case | undefined {
    return this.getById(idOrSlug) ?? this.getBySlug(idOrSlug);
  }

  formatPlayTime(c: Case): string {
    return `약 ${c.estimatedMinutes}분`;
  }
}

export const CaseEngine = new CaseEngineImpl(ALL_CASES);
export type { Case };
