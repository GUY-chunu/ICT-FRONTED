import { AppShell } from "@/components/layout/app-shell";
import { useDeskStore } from "@/lib/ict-store";
import { closedTrades } from "@/lib/ict-calc";
import { cn, formatR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/desk/fields";

export function PlaybookView() {
  const models = useDeskStore((s) => s.models);
  const trades = useDeskStore((s) => s.trades);

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">ICT playbook</p>
        <h1 className="mt-1 font-display text-4xl leading-tight">Named models, not vibes.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Each recipe has a valid/invalid list. Analytics will tell you which one actually has expectancy.
        </p>
      </header>
      <div className="space-y-4">
        {models.map((m) => {
          const sample = closedTrades(trades.filter((t) => t.modelId === m.id || t.modelName === m.name));
          const r = sample.reduce((a, t) => a + (t.rMultiple ?? 0), 0);
          const wr = sample.length
            ? (sample.filter((t) => t.result === "win").length / sample.length) * 100
            : 0;
          const exp = sample.length ? r / sample.length : 0;
          const isPositiveExp = exp > 0;
          return (
            <Panel
              key={m.id}
              kicker={`Model ${m.code} · ${m.market} · ${m.timeframe}`}
              title={m.name}
              action={
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={cn(
                      "font-mono text-base font-bold tabular-nums px-2.5 py-0.5 rounded-lg border",
                      isPositiveExp
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                        : "border-white/[0.08] bg-white/[0.04] text-muted-foreground",
                    )}
                  >
                    {formatR(exp)} Expectancy
                  </span>
                  <p className="text-xs text-muted-foreground font-mono">
                    {sample.length} executions · <span className={wr >= 50 ? "text-up font-semibold" : ""}>{wr.toFixed(0)}% win rate</span>
                  </p>
                </div>
              }
            >
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Block k="HTF Narrative" v={m.htfNarrative} />
                <Block k="Liquidity Condition" v={m.liquidityCondition} />
                <Block k="PD Array" v={m.pdArray} />
                <Block k="Trigger" v={m.trigger} />
                <Block k="Invalidation" v={m.invalidation} />
                <Block k="Target Draw" v={m.target} />
                <Block k="Execution Timing" v={m.requiredTiming} />
              </dl>
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <p className="mb-2 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">Valid Setup Criteria</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.validWhen.map((x) => (
                    <Badge key={x} variant="up" className="text-xs">
                      ✓ {x}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-2 text-[11px] font-semibold tracking-wider text-rose-400 uppercase">Invalidation Triggers (Stay Flat)</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.invalidWhen.map((x) => (
                    <Badge key={x} variant="down" className="text-xs">
                      ✕ {x}
                    </Badge>
                  ))}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </AppShell>
  );
}

function Block({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <dt className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">{k}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground leading-snug">{v}</dd>
    </div>
  );
}
