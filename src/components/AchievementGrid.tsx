import { Award, Lock } from "lucide-react";
import { META_ACHIEVEMENTS } from "@/data/achievements";

export function AchievementGrid({ unlocked }: { unlocked: string[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {META_ACHIEVEMENTS.map((a) => {
        const has = unlocked.includes(a.id);
        return (
          <li
            key={a.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              has
                ? "border-primary/40 bg-primary/5"
                : "border-border/60 bg-surface-elevated/50"
            }`}
          >
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                has ? "bg-primary/15 text-primary" : "bg-surface text-muted-foreground"
              }`}
            >
              {has ? <Award className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm ${
                  has ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {a.title}
              </p>
              <p className="text-[11px] text-muted-foreground">{a.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
