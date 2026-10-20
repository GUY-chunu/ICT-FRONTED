import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDaysISO } from "./ict-time";
import type {
  AccountRules,
  ChecklistItem,
  DailyPlan,
  DeskData,
  LiquidityLevel,
  MissedTrade,
  NewsEvent,
  Phase,
  ProtocolDay,
  SetupModel,
  Trade,
  WeeklyNarrative,
} from "./ict-types";
import { createInitialState, emptyDesk } from "./ict-defaults";
import { uid } from "./utils";
import { api } from "./api";

type DeskActions = {
  fetchFromBackend: () => Promise<void>;
  bootstrapIfNeeded: () => Promise<void>;
  resetAll: () => Promise<void>;
  replaceAll: (data: DeskData) => Promise<void>;
  patchAccount: (
    patch: Partial<Pick<DeskData, "accountName" | "phaseId" | "mantra">> & Partial<AccountRules>,
  ) => void;
  setPhaseId: (id: Phase["id"]) => void;
  updatePhase: (phase: Phase) => void;
  upsertTrade: (trade: Trade) => void;
  removeTrade: (id: string) => void;
  upsertMissed: (row: MissedTrade) => void;
  removeMissed: (id: string) => void;
  upsertWeekly: (row: WeeklyNarrative) => void;
  removeWeekly: (id: string) => void;
  setPlan: (date: string, plan: DailyPlan) => void;
  upsertLiquidity: (row: LiquidityLevel) => void;
  removeLiquidity: (id: string) => void;
  upsertModel: (model: SetupModel) => void;
  removeModel: (id: string) => void;
  upsertChecklistItem: (item: ChecklistItem) => void;
  removeChecklistItem: (id: string) => void;
  toggleCheck: (date: string, id: string) => void;
  upsertNews: (event: NewsEvent) => void;
  removeNews: (id: string) => void;
  upsertProtocolDay: (day: ProtocolDay) => void;
  addProtocolDay: () => void;
  closeToday: (date: string) => void;
  openToday: (date: string) => void;
  rebuildProtocolDates: (startDate: string) => void;
};

export type DeskStore = DeskData & DeskActions;

function upsert<T extends { id: string }>(list: T[], item: T) {
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) return [...list, item];
  const next = list.slice();
  next[i] = item;
  return next;
}

export const useDeskStore = create<DeskStore>()(
  persist(
    (set, get) => ({
      ...emptyDesk(),

      fetchFromBackend: async () => {
        try {
          const remote = await api.getDesk();
          if (remote && remote.hasBootstrapped) {
            set({ ...remote, hasBootstrapped: true });
          }
        } catch (err) {
          console.warn("[Store] Could not fetch remote desk from backend, using local state:", err);
        }
      },

      bootstrapIfNeeded: async () => {
        try {
          const remote = await api.getDesk();
          if (remote && remote.hasBootstrapped) {
            set({ ...remote, hasBootstrapped: true });
            return;
          }
        } catch {
          // Backend unreachable or empty
        }
        if (!get().hasBootstrapped) {
          const initial = createInitialState();
          set(initial);
          try {
            await api.replaceAllDesk(initial);
          } catch {
            // Offline
          }
        }
      },

      resetAll: async () => {
        const initial = createInitialState();
        set(initial);
        try {
          await api.resetDesk();
        } catch (err) {
          console.warn("[Store] Backend reset failed:", err);
        }
      },

      replaceAll: async (data) => {
        set({ ...data, hasBootstrapped: true });
        try {
          await api.replaceAllDesk(data);
        } catch (err) {
          console.warn("[Store] Backend replace failed:", err);
        }
      },

      patchAccount: (patch) => {
        set((s) => {
          const { accountName, phaseId, mantra, ...rest } = patch;
          const next = {
            accountName: accountName ?? s.accountName,
            phaseId: phaseId ?? s.phaseId,
            mantra: mantra ?? s.mantra,
            rules: { ...s.rules, ...rest },
          };
          api.patchSettings({
            accountName: next.accountName,
            phaseId: next.phaseId,
            mantra: next.mantra,
            rules: next.rules,
          }).catch(console.warn);
          return next;
        });
      },

      setPhaseId: (id) => {
        set({ phaseId: id });
        api.patchSettings({ phaseId: id }).catch(console.warn);
      },

      updatePhase: (phase) => {
        set((s) => {
          const nextPhases = s.phases.map((p) => (p.id === phase.id ? phase : p));
          api.patchSettings({ phases: nextPhases }).catch(console.warn);
          return { phases: nextPhases };
        });
      },

      upsertTrade: (trade) => {
        set((s) => ({ trades: upsert(s.trades, trade) }));
        api.upsertTrade(trade).catch(console.warn);
      },

      removeTrade: (id) => {
        set((s) => ({ trades: s.trades.filter((x) => x.id !== id) }));
        api.deleteTrade(id).catch(console.warn);
      },

      upsertMissed: (row) => {
        set((s) => ({ missed: upsert(s.missed, row) }));
        api.upsertMissed(row).catch(console.warn);
      },

      removeMissed: (id) => {
        set((s) => ({ missed: s.missed.filter((x) => x.id !== id) }));
        api.deleteMissed(id).catch(console.warn);
      },

      upsertWeekly: (row) => {
        set((s) => ({ weeklies: upsert(s.weeklies, row) }));
        api.upsertWeekly(row).catch(console.warn);
      },

      removeWeekly: (id) => {
        set((s) => ({ weeklies: s.weeklies.filter((x) => x.id !== id) }));
        api.deleteWeekly(id).catch(console.warn);
      },

      setPlan: (date, plan) => {
        set((s) => ({ dailyPlans: { ...s.dailyPlans, [date]: plan } }));
        api.setPlan(date, plan).catch(console.warn);
      },

      upsertLiquidity: (row) => {
        set((s) => ({ liquidity: upsert(s.liquidity, row) }));
        api.upsertLiquidity(row).catch(console.warn);
      },

      removeLiquidity: (id) => {
        set((s) => ({ liquidity: s.liquidity.filter((x) => x.id !== id) }));
        api.deleteLiquidity(id).catch(console.warn);
      },

      upsertModel: (model) => {
        set((s) => ({ models: upsert(s.models, model) }));
        api.upsertModel(model).catch(console.warn);
      },

      removeModel: (id) => {
        set((s) => ({ models: s.models.filter((x) => x.id !== id) }));
        api.deleteModel(id).catch(console.warn);
      },

      upsertChecklistItem: (item) => {
        set((s) => {
          const next = upsert(s.checklistItems, item);
          api.patchSettings({ checklistItems: next }).catch(console.warn);
          return { checklistItems: next };
        });
      },

      removeChecklistItem: (id) => {
        set((s) => {
          const next = s.checklistItems.filter((x) => x.id !== id);
          api.patchSettings({ checklistItems: next }).catch(console.warn);
          return { checklistItems: next };
        });
      },

      toggleCheck: (date, id) => {
        set((s) => {
          const cur = new Set(s.checks[date] ?? []);
          if (cur.has(id)) cur.delete(id);
          else cur.add(id);
          api.toggleCheck(date, id).catch(console.warn);
          return { checks: { ...s.checks, [date]: [...cur] } };
        });
      },

      upsertNews: (event) => {
        set((s) => ({ newsEvents: upsert(s.newsEvents, event) }));
        api.upsertNews(event).catch(console.warn);
      },

      removeNews: (id) => {
        set((s) => ({ newsEvents: s.newsEvents.filter((x) => x.id !== id) }));
        api.deleteNews(id).catch(console.warn);
      },

      upsertProtocolDay: (day) => {
        set((s) => ({ protocolDays: upsert(s.protocolDays, day) }));
        api.upsertProtocolDay(day).catch(console.warn);
      },

      addProtocolDay: () => {
        set((s) => {
          const last = s.protocolDays[s.protocolDays.length - 1];
          const day = (last?.day ?? 0) + 1;
          const date = s.rules.protocolStartDate
            ? addDaysISO(s.rules.protocolStartDate, day - 1)
            : addDaysISO(new Date().toISOString().slice(0, 10), day - 1);
          const next: ProtocolDay = {
            id: uid("day"),
            day,
            date,
            title: `Custom · Day ${day}`,
            focus: "Write the job for this day.",
            phase: last?.phase ?? 1,
            riskPct: last?.riskPct ?? s.rules.normalRiskPct,
            maxTrades: last?.maxTrades ?? s.rules.maxTrades,
            completed: false,
            skipped: false,
            notes: "",
          };
          api.upsertProtocolDay(next).catch(console.warn);
          return { protocolDays: [...s.protocolDays, next] };
        });
      },

      closeToday: (date) => {
        set((s) => {
          const forceClosed = s.forceClosedDates.includes(date)
            ? s.forceClosedDates
            : [...s.forceClosedDates, date];
          const forceOpen = s.forceOpenDates.filter((d) => d !== date);
          api.closeToday(date).catch(console.warn);
          return {
            forceClosedDates: forceClosed,
            forceOpenDates: forceOpen,
          };
        });
      },

      openToday: (date) => {
        set((s) => {
          const forceOpen = s.forceOpenDates.includes(date)
            ? s.forceOpenDates
            : [...s.forceOpenDates, date];
          const forceClosed = s.forceClosedDates.filter((d) => d !== date);
          api.openToday(date).catch(console.warn);
          return {
            forceOpenDates: forceOpen,
            forceClosedDates: forceClosed,
          };
        });
      },

      rebuildProtocolDates: (startDate) => {
        set((s) => {
          const days = s.protocolDays.map((d, i) => ({
            ...d,
            date: addDaysISO(startDate, (d.day || i + 1) - 1),
          }));
          api.rebuildProtocolDates(startDate).catch(console.warn);
          return {
            rules: { ...s.rules, protocolStartDate: startDate },
            protocolDays: days,
          };
        });
      },
    }),
    {
      name: "ict-narrative-desk",
      skipHydration: true,
      version: 1,
      partialize: (state) => ({
        hasBootstrapped: state.hasBootstrapped,
        accountName: state.accountName,
        phaseId: state.phaseId,
        phases: state.phases,
        rules: state.rules,
        mantra: state.mantra,
        instruments: state.instruments,
        models: state.models,
        trades: state.trades,
        missed: state.missed,
        weeklies: state.weeklies,
        dailyPlans: state.dailyPlans,
        liquidity: state.liquidity,
        checklistItems: state.checklistItems,
        checks: state.checks,
        protocolDays: state.protocolDays,
        newsEvents: state.newsEvents,
        forceClosedDates: state.forceClosedDates,
        forceOpenDates: state.forceOpenDates,
      }),
    },
  ),
);
