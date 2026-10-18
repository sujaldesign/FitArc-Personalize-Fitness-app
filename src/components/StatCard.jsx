import React from "react";

const accents = {
  rose: "text-rose-600 bg-rose-50",
  amber: "text-amber-600 bg-amber-50",
  indigo: "text-indigo-600 bg-indigo-50",
  emerald: "text-emerald-600 bg-emerald-50",
  sky: "text-sky-600 bg-sky-50",
  violet: "text-violet-600 bg-violet-50",
};

export default function StatCard({ icon: Icon, label, value = "—", unit, accent = "emerald", subtitle }) {
  return (
    <section className="stat-card rounded-2xl border bg-background p-4 sm:p-5" aria-label={label}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <p className="text-2xl sm:text-3xl font-display font-semibold tracking-tight">{value}</p>
            {unit && <span className="text-xs font-medium text-muted-foreground">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accents[accent] || accents.emerald}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
      {subtitle && <p className="mt-3 truncate text-xs text-muted-foreground">{subtitle}</p>}
    </section>
  );
}
