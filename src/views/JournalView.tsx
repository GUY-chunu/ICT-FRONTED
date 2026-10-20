import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useDeskStore } from "@/lib/ict-store";
import { formatR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeWizard } from "@/components/desk/trade-wizard";
import { MissedForm } from "@/components/desk/missed-form";
import { ConfirmDelete } from "@/components/desk/confirm-delete";
import type { MissedTrade, Trade } from "@/lib/ict-types";
import { fmtPx } from "@/lib/ict-calc";
import { cn } from "@/lib/utils";

export function JournalView() {
  const trades = useDeskStore((s) => s.trades);
  const missed = useDeskStore((s) => s.missed);
  const removeTrade = useDeskStore((s) => s.removeTrade);
  const removeMissed = useDeskStore((s) => s.removeMissed);
  const [edit, setEdit] = useState<Trade | null>(null);
  const [open, setOpen] = useState(false);
  const [miss, setMiss] = useState<MissedTrade | null>(null);
  const [missOpen, setMissOpen] = useState(false);
  const [del, setDel] = useState<string | null>(null);
  const sorted = trades.slice().sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const sortedM = missed.slice().sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Journal</p>
        <h1 className="mt-1 font-display text-4xl leading-tight">Taken and missed.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every fill is a research row. So is every hesitation.
        </p>
      </header>

      <Tabs defaultValue="taken">
        <TabsList className="mb-4">
          <TabsTrigger value="taken">Taken ({trades.length})</TabsTrigger>
          <TabsTrigger value="missed">Missed ({missed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="taken">
          <div className="mb-3 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setEdit(null);
                setOpen(true);
              }}
            >
              Log trade
            </Button>
          </div>
          <div className="space-y-4">
            {sorted.map((t) => {
              const isWin = (t.rMultiple ?? 0) > 0;
              const isLoss = (t.rMultiple ?? 0) < 0;
              const isOpen = t.rMultiple == null;

              return (
                <article
                  key={t.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-card/95 via-card/80 to-card/60 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:p-6",
                    isWin && "border-emerald-500/25 shadow-emerald-500/5 hover:border-emerald-500/40",
                    isLoss && "border-rose-500/25 shadow-rose-500/5 hover:border-rose-500/40",
                    isOpen && "border-amber-500/25 shadow-amber-500/5 hover:border-amber-500/40",
                    !isWin && !isLoss && !isOpen && "border-white/[0.08] hover:border-white/[0.18]",
                    "before:absolute before:inset-x-0 before:top-0 before:h-[2px]",
                    isWin && "before:bg-gradient-to-r before:from-transparent before:via-emerald-400 before:to-transparent",
                    isLoss && "before:bg-gradient-to-r before:from-transparent before:via-rose-400 before:to-transparent",
                    isOpen && "before:bg-gradient-to-r before:from-transparent before:via-amber-400 before:to-transparent",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
                        <span>{t.date} · {t.time} NY</span>
                        <span className="size-1 rounded-full bg-white/20" />
                        <span className="uppercase text-foreground/80 font-semibold">{t.session}</span>
                        <span className="size-1 rounded-full bg-white/20" />
                        <span className="text-accent/90">{t.killZone}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2.5">
                        <h2 className="font-display text-2xl font-semibold sm:text-3xl tracking-tight text-foreground">
                          {t.market}
                        </h2>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border",
                            t.side === "long"
                              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                              : "border-rose-500/40 bg-rose-500/15 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.2)]",
                          )}
                        >
                          {t.side}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t.modelName || "No model"}</span> ·{" "}
                        {t.pdTimeframe} {t.pdArray || "—"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <p
                        className={cn(
                          "font-mono text-2xl font-bold tabular-nums sm:text-3xl",
                          isWin ? "text-up drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : isLoss ? "text-down drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]" : "text-muted-foreground",
                        )}
                      >
                        {isOpen ? "OPEN" : formatR(t.rMultiple!)}
                      </p>
                      <Badge
                        variant={t.ruleFollowed ? "up" : "down"}
                        className="px-2.5 py-0.5 text-xs font-semibold"
                      >
                        {t.ruleFollowed ? "Rules Followed" : "Rule Broken"}
                      </Badge>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
                    <Cell k="Bias" v={`${t.weeklyBias} / ${t.dailyBias}`} />
                    <Cell k="Draw on Liq" v={t.drawOnLiquidity || "—"} />
                    <Cell k="Location" v={t.location} />
                    <Cell k="Taken Liq" v={t.taken.join(", ") || "—"} />
                    <Cell k="Trigger" v={t.triggers.slice(0, 3).join(" · ") || "—"} />
                    <Cell k="Entry / SL" v={`${fmtPx(t.entry)} / ${fmtPx(t.sl)}`} />
                    <Cell k="Primary Error" v={t.primaryError || "None"} />
                    <Cell k="Execution Grade" v={t.grade || "—"} />
                  </dl>

                  {t.notes ? (
                    <p className="mt-3.5 rounded-xl border border-white/[0.06] bg-black/25 p-3 text-xs leading-relaxed text-muted-foreground">
                      "{t.notes}"
                    </p>
                  ) : null}

                  <div className="mt-4 flex gap-2 pt-2 border-t border-white/[0.06]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEdit(t);
                        setOpen(true);
                      }}
                    >
                      Edit Ticket
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDel(t.id)}>
                      Delete
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="missed">
          <div className="mb-3 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setMiss(null);
                setMissOpen(true);
              }}
            >
              Log missed
            </Button>
          </div>
          <div className="space-y-4">
            {sortedM.map((m) => (
              <article
                key={m.id}
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card/90 via-card/75 to-card/50 p-5 shadow-lg backdrop-blur-md sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground font-mono">
                    {m.date} · {m.time} NY
                  </p>
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-xs text-muted-foreground font-mono">
                    Missed Opportunity
                  </span>
                </div>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  {m.market} <span className="uppercase text-accent">{m.side}</span>
                </h2>
                <p className="mt-1 text-sm text-foreground/90">
                  <span className="text-muted-foreground">Hesitation:</span> {m.why || "—"} →{" "}
                  <span className="font-semibold text-foreground">{m.outcome || "unknown"}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge variant={m.narrativeValid ? "up" : "down"}>
                    Narrative {m.narrativeValid ? "Valid" : "Invalid"}
                  </Badge>
                  <Badge variant={m.liquiditySwept ? "up" : "default"}>
                    Sweep {m.liquiditySwept ? "Yes" : "No"}
                  </Badge>
                  <Badge variant={m.triggerOccurred ? "up" : "default"}>
                    Trigger {m.triggerOccurred ? "Fired" : "No"}
                  </Badge>
                </div>
                {m.notes ? (
                  <p className="mt-3 rounded-xl border border-white/[0.06] bg-black/25 p-3 text-xs leading-relaxed text-muted-foreground">
                    "{m.notes}"
                  </p>
                ) : null}
                <div className="mt-4 flex gap-2 pt-2 border-t border-white/[0.06]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMiss(m);
                      setMissOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeMissed(m.id)}>
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TradeWizard open={open} onOpenChange={setOpen} trade={edit} />
      <MissedForm open={missOpen} onOpenChange={setMissOpen} row={miss} />
      <ConfirmDelete
        open={!!del}
        onOpenChange={() => setDel(null)}
        title="Delete trade?"
        description="This removes the research row from the database."
        onConfirm={() => {
          if (del) removeTrade(del);
          setDel(null);
        }}
      />
    </AppShell>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
      <dt className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{k}</dt>
      <dd className="mt-0.5 truncate font-medium text-foreground">{v}</dd>
    </div>
  );
}

