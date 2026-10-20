import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { useDeskStore } from "@/lib/ict-store";
import {
  avgLossR,
  avgWinR,
  conceptMatrix,
  currentBalance,
  dayOfWeekTable,
  equityCurve,
  errorBreakdown,
  expectancyR,
  maeMfeStats,
  maxDrawdownPct,
  payoutProgress,
  profitFactor,
  remainingRToDanger,
  ruleFollowRate,
  sumPnlPct,
  sumR,
  winRate,
  worstStreak,
} from "@/lib/ict-stats";
import { formatMoney, formatPct, formatR, cn } from "@/lib/utils";
import { Panel } from "@/components/desk/fields";
import { KpiCard } from "@/components/desk/kpi-card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Flame,
  Percent,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Compass,
} from "lucide-react";

export function AnalyticsView() {
  const data = useDeskStore();
  const curve = equityCurve(data.trades);
  const pay = payoutProgress(data);
  const concepts = conceptMatrix(data.trades).slice(0, 18);
  const errors = errorBreakdown(data.trades);
  const days = dayOfWeekTable(data.trades);
  const mm = maeMfeStats(data.trades);
  const danger = remainingRToDanger(data);
  const totalR = sumR(data.trades);
  const wr = winRate(data.trades);
  const pf = profitFactor(data.trades);

  return (
    <AppShell>
      <header className="mb-7">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          ICT edge analytics
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl text-gradient">
          Which concept pays?
        </h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Slice by narrative, liquidity, PD array, trigger, session, location — not by mood.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard
          label="Equity"
          value={formatMoney(currentBalance(data))}
          hint={formatPct(sumPnlPct(data.trades))}
          icon={Wallet}
        />
        <KpiCard
          label="Total R"
          value={formatR(totalR)}
          hint={`${data.trades.length} recorded trades`}
          icon={Flame}
          variant={totalR > 0 ? "up" : totalR < 0 ? "down" : "default"}
        />
        <KpiCard
          label="Win Rate"
          value={`${wr.toFixed(0)}%`}
          hint={`Exp: ${formatR(expectancyR(data.trades))}`}
          icon={Percent}
          variant={wr >= 50 ? "up" : "default"}
        />
        <KpiCard
          label="Profit Factor"
          value={pf.toFixed(2)}
          hint={`Max DD ${formatPct(-maxDrawdownPct(data.trades))}`}
          icon={TrendingUp}
          variant={pf >= 1.5 ? "up" : "default"}
        />
      </div>

      <Panel className="mb-6" title="Equity Curve (in R)" kicker={`Payout path ${Math.max(0, Math.round(pay.pct))}%`}>
        <div className="h-72 w-full pt-2">
          {curve.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curve} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="curveGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(18, 20, 17, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 12,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                    color: "var(--color-foreground)",
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="r"
                  stroke="var(--color-accent)"
                  fill="url(#curveGlow)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No closed trades logged yet. Log executions to generate your edge curve.
            </div>
          )}
        </div>
      </Panel>

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Risk of Ruin Model" kicker="Distance to danger">
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
              <span className="text-muted-foreground">Daily R remaining</span>
              <span className="font-mono font-semibold text-foreground">{danger.dailyR.toFixed(1)}R ({danger.dailyLeftPct.toFixed(2)}%)</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
              <span className="text-muted-foreground">Total Drawdown remaining</span>
              <span className="font-mono font-semibold text-foreground">{danger.totalR.toFixed(1)}R ({danger.totalLeftPct.toFixed(2)}%)</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
              <span className="text-muted-foreground">Worst losing streak</span>
              <span className="font-mono font-semibold text-down">{worstStreak(data.trades)} consecutive</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
              <span className="text-muted-foreground">Win / Loss Ratio</span>
              <span className="font-mono font-semibold text-foreground">
                <span className="text-up">{formatR(avgWinR(data.trades))}</span> / <span className="text-down">{formatR(avgLossR(data.trades))}</span>
              </span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
              <span className="text-muted-foreground">Rule Compliance</span>
              <Badge variant={ruleFollowRate(data.trades) >= 80 ? "up" : "warn"}>
                {ruleFollowRate(data.trades).toFixed(0)}% Followed
              </Badge>
            </li>
          </ul>
        </Panel>

        <Panel title="MAE / MFE Edge" kicker={`${mm.n} trades with excursion`}>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
              <span className="text-muted-foreground">Average MAE (Drawdown during trade)</span>
              <span className="font-mono font-semibold text-down">{formatR(mm.avgMae)}</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
              <span className="text-muted-foreground">Average MFE (Maximum favorable potential)</span>
              <span className="font-mono font-semibold text-up">{formatR(mm.avgMfe)}</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5">
              <span className="text-muted-foreground">MFE → Realized Conversion</span>
              <span className="font-mono font-bold text-accent">{(mm.conversion * 100).toFixed(0)}%</span>
            </li>
            <li className="rounded-xl border border-white/[0.06] bg-black/25 p-3 text-xs leading-relaxed text-muted-foreground">
              💡 If MFE is 3R and you bank 1R, the entry model is sharp and trade management is where alpha is leaking.
            </li>
          </ul>
        </Panel>
      </div>

      <Panel className="mb-6" title="ICT Concept Performance Matrix" kicker="Empirical Edge">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-3 font-medium">Concept</th>
                <th className="py-3 px-3 font-medium">Sample</th>
                <th className="py-3 px-3 font-medium">Win %</th>
                <th className="py-3 px-3 font-medium">Avg R (Exp)</th>
                <th className="py-3 px-3 font-medium text-right">Net R</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {concepts.map((c) => {
                const wr = c.trades ? ((c.wins / c.trades) * 100).toFixed(0) : 0;
                const isPositive = c.r > 0;
                const isNegative = c.r < 0;

                return (
                  <tr key={c.key} className="transition-colors hover:bg-white/[0.03]">
                    <td className="py-3 px-3 font-medium text-foreground">{c.label}</td>
                    <td className="py-3 px-3 font-mono text-muted-foreground tabular-nums">{c.trades}</td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      <span className={cn(Number(wr) >= 50 ? "text-up font-semibold" : "text-muted-foreground")}>
                        {wr}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">{formatR(c.expectancy)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-right tabular-nums">
                      <span className={isPositive ? "text-up" : isNegative ? "text-down" : "text-muted-foreground"}>
                        {formatR(c.r)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Primary Error Attribution" kicker="Behavioral leaks">
          <div className="space-y-2">
            {errors.map((e) => (
              <div
                key={e.key}
                className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-surface-2/40 px-3.5 py-2.5 text-sm transition-colors hover:bg-surface-2/70"
              >
                <span className="font-medium text-foreground">{e.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{e.trades} trades</span>
                  <span className="font-mono text-xs font-bold text-down">{formatR(e.r)}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Session / Day Performance" kicker="Time cycle edge">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-semibold text-muted-foreground uppercase border-b border-white/[0.08]">
                <tr>
                  <th className="py-2.5 px-2 font-medium">Day</th>
                  <th className="py-2.5 px-2 font-medium">Bias</th>
                  <th className="py-2.5 px-2 font-medium">Liq</th>
                  <th className="py-2.5 px-2 font-medium text-right">R</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {days.map((d) => (
                  <tr key={d.day} className="transition-colors hover:bg-white/[0.03]">
                    <td className="py-2.5 px-2 font-medium text-foreground">{d.day}</td>
                    <td className="py-2.5 px-2 capitalize text-muted-foreground">{d.bias}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{d.liq}</td>
                    <td className="py-2.5 px-2 font-mono font-bold text-right tabular-nums">
                      <span className={d.r > 0 ? "text-up" : d.r < 0 ? "text-down" : "text-muted-foreground"}>
                        {formatR(d.r)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
