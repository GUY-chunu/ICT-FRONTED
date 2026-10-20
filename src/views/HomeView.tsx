import { AppShell } from "@/components/layout/app-shell";
import { useDeskStore } from "@/lib/ict-store";
import {
  currentBalance,
  lockInfo,
  payoutProgress,
  planFor,
  protocolDayNumber,
  remainingRToDanger,
  sumPnlPct,
  todayProtocol,
  tradesOn,
  weeklyFor,
} from "@/lib/ict-stats";
import { biasConfidence } from "@/lib/ict-calc";
import { formatMoney, formatPct, formatR, todayISO, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Panel } from "@/components/desk/fields";
import { RangeBar } from "@/components/desk/range-bar";
import { KpiCard } from "@/components/desk/kpi-card";
import { nowHHMM } from "@/lib/ict-time";
import {
  Activity,
  Flame,
  ShieldAlert,
  Target,
  Wallet,
  Sparkles,
  Quote,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function HomeView() {
  const data = useDeskStore();
  const toggleCheck = useDeskStore((s) => s.toggleCheck);
  const closeToday = useDeskStore((s) => s.closeToday);
  const openToday = useDeskStore((s) => s.openToday);
  const today = todayISO();
  const day = protocolDayNumber(data);
  const proto = todayProtocol(data);
  const plan = planFor(data, today);
  const week = weeklyFor(data, today);
  const lock = lockInfo(data, today);
  const pay = payoutProgress(data);
  const danger = remainingRToDanger(data, today);
  const todays = tradesOn(data.trades, today);
  const todayR = todays.reduce((a, t) => a + (t.rMultiple ?? 0), 0);
  const conf = biasConfidence(plan.alignments);
  const checked = new Set(data.checks[today] ?? []);
  const core = data.checklistItems.filter((i) => i.group === "core");
  const cond = data.checklistItems.filter((i) => i.group === "conditional");
  const life = data.checklistItems.filter((i) => i.group === "lifestyle");
  const news = data.newsEvents.filter((n) => n.date === today);
  const models = data.models.filter((m) => m.active);

  return (
    <AppShell>
      <header className="stagger-in mb-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live New York
          </span>
          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {today} · {nowHHMM()} NY
          </span>
        </div>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl text-gradient">
          Was the read correct?
        </h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Narrative → liquidity → location → timing → trigger → risk.
          {proto ? ` ${proto.title}: ${proto.focus}` : ` Day ${day}.`}
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard
          label="Equity"
          value={formatMoney(currentBalance(data))}
          hint={formatPct(sumPnlPct(data.trades))}
          icon={Wallet}
          variant="default"
        />
        <KpiCard
          label="Today"
          value={formatR(todayR)}
          hint={`${todays.length} execution${todays.length === 1 ? "" : "s"}`}
          icon={Flame}
          variant={todayR > 0 ? "up" : todayR < 0 ? "down" : "default"}
        />
        <KpiCard
          label="R to danger"
          value={`${danger.dailyR.toFixed(0)}R`}
          hint={`${danger.dailyLeftPct.toFixed(2)}% daily cap`}
          icon={ShieldAlert}
          variant={danger.dailyR <= 2 ? "down" : "default"}
        />
        <KpiCard
          label="Payout path"
          value={`${Math.max(0, Math.round(pay.pct))}%`}
          hint={`Target ${formatPct(data.rules.payoutThresholdPct, 0)}`}
          icon={Target}
          variant="up"
        />
      </div>

      <Panel
        className="mb-6"
        kicker="Circuit Breaker"
        title={lock.locked ? "Platform Lock Active" : "Execution Open"}
        action={
          <Badge
            variant={lock.locked ? "down" : "up"}
            className="gap-1.5 px-3 py-1 text-xs font-semibold"
          >
            <span className={cn("size-2 rounded-full", lock.locked ? "bg-down" : "bg-up animate-pulse")} />
            {lock.locked ? "Circuit Tripped" : "Ready to Execute"}
          </Badge>
        }
      >
        {lock.reasons.map((r) => (
          <div key={r} className="mb-2 flex items-center gap-2 rounded-lg border border-down/30 bg-down/10 px-3 py-2 text-sm text-down">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{r}</span>
          </div>
        ))}
        {lock.warnings.map((r) => (
          <div key={r} className="mb-2 flex items-center gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{r}</span>
          </div>
        ))}
        {!lock.reasons.length && !lock.warnings.length ? (
          <p className="text-sm text-muted-foreground">
            No lockout triggers detected. Execute only the written playbook models.
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2.5">
          {lock.locked ? (
            <Button size="sm" variant="outline" onClick={() => openToday(today)}>
              Override Lock & Open
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => closeToday(today)}>
              Close Platform Now
            </Button>
          )}
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Daily Loss Used</span>
            <span className="font-mono text-foreground">
              {Math.min(100, Math.round(((plan.maxDailyLossPct - danger.dailyLeftPct) / plan.maxDailyLossPct) * 100))}%
            </span>
          </div>
          <Progress value={Math.min(100, ((plan.maxDailyLossPct - danger.dailyLeftPct) / plan.maxDailyLossPct) * 100)} />
        </div>
      </Panel>

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <Panel kicker="Weekly Map" title={week ? `${week.structure} week` : "No weekly narrative"}>
          {week ? (
            <>
              <p className="mb-3.5 text-sm text-muted-foreground">
                Draw: <span className="font-semibold text-foreground">{week.primaryDraw || "—"}</span>
                {week.secondaryDraw ? <span className="text-muted-foreground"> → {week.secondaryDraw}</span> : ""}. {week.beforeDraw}
              </p>
              <RangeBar range={week.dealingRange} />
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {week.liquidity.map((l) => (
                  <Badge key={l.type} variant={l.status === "taken" ? "down" : "default"}>
                    {l.type} {l.status}
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Open Weekly to write PWH/PWL and the draw.</p>
          )}
        </Panel>

        <Panel
          kicker="Daily bias"
          title={plan.expectedDelivery || "No delivery model"}
          action={
            <Badge
              variant={conf >= 80 ? "up" : conf >= 60 ? "warn" : "default"}
              className="px-2.5 py-0.5 text-xs font-semibold"
            >
              {conf}% aligned
            </Badge>
          }
        >
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Row k="HTF Structure" v={plan.htfStructure} />
            <Row k="Location" v={plan.location} />
            <Row k="Liquidity" v={plan.liquidityCondition} />
            <Row k="Draw" v={plan.expectedDraw || "—"} />
            <Row k="AMD Phase" v={plan.amdPhase || "—"} />
            <Row k="Risk Parameters" v={`${plan.riskPerTrade}% · ${plan.maxTrades} trades`} />
          </dl>
          {plan.scenarios ? (
            <p className="mt-4 whitespace-pre-line rounded-xl border border-white/[0.06] bg-black/30 p-3 text-xs leading-relaxed text-muted-foreground">
              {plan.scenarios}
            </p>
          ) : null}
        </Panel>
      </div>

      <Panel className="mb-6" kicker="Execution Gate" title="Daily Checklist">
        <Group items={core} checked={checked} onToggle={(id) => toggleCheck(today, id)} />
        <p className="mt-5 mb-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Conditional Requirements</p>
        <Group items={cond} checked={checked} onToggle={(id) => toggleCheck(today, id)} />
        <p className="mt-5 mb-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Lifestyle & Mental State</p>
        <Group items={life} checked={checked} onToggle={(id) => toggleCheck(today, id)} />
      </Panel>

      <Panel className="mb-6" kicker="Playbook Models" title="Permitted Setups">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {models.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-surface-2/60 p-3.5 transition-all duration-200 hover:border-white/[0.18] hover:bg-surface-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-accent">{m.code}</span>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{m.market}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">{m.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {m.trigger} → <span className="text-foreground/90 font-medium">{m.target}</span>
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {news.length ? (
        <Panel className="mb-6" kicker="Economic Calendar" title="High-Impact Events">
          <div className="space-y-2">
            {news.map((n) => (
              <div key={n.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-2/40 px-3.5 py-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-accent">{n.time} NY</span>
                  <span className="font-medium text-foreground">{n.name}</span>
                </div>
                {n.avoid ? (
                  <Badge variant="down" className="text-[11px]">Stay flat</Badge>
                ) : (
                  <Badge variant="default" className="text-[11px]">Normal</Badge>
                )}
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-card/90 via-surface-2/60 to-card/40 p-6 shadow-xl backdrop-blur-md">
        <Quote className="size-8 text-accent/30 mb-2" />
        <p className="font-display text-2xl italic leading-snug tracking-wide text-foreground sm:text-3xl">
          "{data.mantra}"
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-accent/70">
          Core Operating Principle · ICT Disciplines
        </p>
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
      <dt className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 font-medium text-foreground capitalize">{v}</dd>
    </div>
  );
}

function Group({
  items,
  checked,
  onToggle,
}: {
  items: { id: string; label: string }[];
  checked: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const isChecked = checked.has(item.id);
        return (
          <li
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.05] p-3 transition-all duration-150 hover:border-white/[0.14] hover:bg-white/[0.03]",
              isChecked && "bg-white/[0.03] border-white/[0.1]",
            )}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => onToggle(item.id)}
              className="mt-0.5"
            />
            <span
              className={cn(
                "text-sm font-medium leading-5 transition-colors select-none",
                isChecked ? "text-foreground line-through opacity-60" : "text-foreground/90",
              )}
            >
              {item.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

