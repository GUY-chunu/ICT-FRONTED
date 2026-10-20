import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  CalendarRange,
  ChartLine,
  Compass,
  LayoutDashboard,
  ListChecks,
  Plus,
  RotateCcw,
  Settings2,
  Shield,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeskStore } from "@/lib/ict-store";
import { lockInfo, protocolDayNumber } from "@/lib/ict-stats";
import { cn, todayISO } from "@/lib/utils";
import { TradeWizard } from "@/components/desk/trade-wizard";
import { SettingsSheet } from "@/components/desk/settings-sheet";

const NAV = [
  { to: "/", label: "Today", icon: LayoutDashboard },
  { to: "/weekly", label: "Weekly", icon: CalendarRange },
  { to: "/daily", label: "Daily", icon: Sun },
  { to: "/playbook", label: "Playbook", icon: Compass },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/replay", label: "Replay", icon: RotateCcw },
  { to: "/analytics", label: "Analytics", icon: ChartLine },
  { to: "/protocol", label: "Protocol", icon: ListChecks },
] as const;

const MOBILE = [
  { to: "/", label: "Today", icon: LayoutDashboard },
  { to: "/weekly", label: "Weekly", icon: CalendarRange },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Edge", icon: ChartLine },
] as const;

export interface AppShellProps {
  children?: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const phaseId = useDeskStore((s) => s.phaseId);
  const phases = useDeskStore((s) => s.phases);
  const data = useDeskStore();
  const [tradeOpen, setTradeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lock = lockInfo(data, todayISO());
  const phase = phases.find((p) => p.id === phaseId);
  const day = protocolDayNumber(data);

  return (
    <div className={cn("flex min-h-dvh bg-background text-foreground", className)}>
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-white/[0.08] bg-card/40 backdrop-blur-xl px-3 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/30 text-accent shadow-md shadow-accent/10">
            <Shield className="size-4.5" />
          </span>
          <div>
            <p className="font-display text-xl leading-none tracking-wide text-foreground">First Payout</p>
            <p className="mt-1 text-[11px] font-medium tracking-wider uppercase text-accent/70">ICT Desk Terminal</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-gradient-to-r from-accent/[0.14] via-accent/[0.07] to-transparent text-foreground border-l-2 border-accent shadow-sm"
                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-4 shrink-0 transition-colors", active ? "text-accent" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-2 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>Day {day}</span>
            <span className="inline-flex items-center gap-1 text-up"><span className="size-1.5 rounded-full bg-up animate-pulse" /> Live NY</span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.08] bg-background/80 px-4 py-3 backdrop-blur-md md:px-8">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {data.accountName}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={lock.locked ? "down" : "up"} className="gap-1.5">
                <span className={cn("size-1.5 rounded-full", lock.locked ? "bg-down" : "bg-up animate-pulse")} />
                {lock.locked ? "Platform closed" : "Session open"}
              </Badge>
              <Badge variant="default" className="border-white/[0.08]">
                Phase {phaseId} · {phase?.name}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Settings" onClick={() => setSettingsOpen(true)} className="rounded-xl border border-white/[0.08] hover:border-white/[0.2]">
            <Settings2 className="size-4" />
          </Button>
          <Button size="sm" onClick={() => setTradeOpen(true)} className="gap-1.5 shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/25 active:scale-95 transition-all" aria-label="Log trade">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Log execution</span>
          </Button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-white/[0.08] bg-background/95 px-2 py-2 backdrop-blur-lg lg:hidden">
          {MOBILE.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <TradeWizard open={tradeOpen} onOpenChange={setTradeOpen} trade={null} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
