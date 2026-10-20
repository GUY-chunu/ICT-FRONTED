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

// Base API URL configurable via environment variable with fallback for local dev
const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text();
      let errMsg = `Request failed: HTTP ${res.status}`;
      try {
        const json = JSON.parse(errText);
        errMsg = json.message || errMsg;
      } catch {
        if (errText) errMsg = errText.slice(0, 150);
      }
      throw new Error(errMsg);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err: any) {
    console.warn(`[API] ${options.method || "GET"} ${path} error:`, err.message);
    throw err;
  }
}

export const api = {
  // Aggregate Desk
  getDesk: () => request<DeskData>("/api/desk"),
  replaceAllDesk: (data: DeskData) =>
    request<{ success: boolean }>("/api/desk", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  resetDesk: () =>
    request<{ success: boolean }>("/api/desk/reset", {
      method: "POST",
    }),

  // Trades
  getTrades: () => request<Trade[]>("/api/trades"),
  upsertTrade: (trade: Trade) =>
    request<Trade>("/api/trades", {
      method: "POST",
      body: JSON.stringify(trade),
    }),
  deleteTrade: (id: string) =>
    request<{ id: string }>(`/api/trades/${id}`, {
      method: "DELETE",
    }),

  // Missed Trades
  getMissed: () => request<MissedTrade[]>("/api/missed"),
  upsertMissed: (row: MissedTrade) =>
    request<MissedTrade>("/api/missed", {
      method: "POST",
      body: JSON.stringify(row),
    }),
  deleteMissed: (id: string) =>
    request<{ id: string }>(`/api/missed/${id}`, {
      method: "DELETE",
    }),

  // Daily Plans
  getDailyPlans: () => request<Record<string, DailyPlan>>("/api/daily-plans"),
  setPlan: (date: string, plan: DailyPlan) =>
    request<DailyPlan>("/api/daily-plans", {
      method: "POST",
      body: JSON.stringify({ ...plan, date }),
    }),
  deleteDailyPlan: (date: string) =>
    request<{ date: string }>(`/api/daily-plans/${date}`, {
      method: "DELETE",
    }),

  // Weekly Narratives
  getWeeklies: () => request<WeeklyNarrative[]>("/api/weekly-narratives"),
  upsertWeekly: (row: WeeklyNarrative) =>
    request<WeeklyNarrative>("/api/weekly-narratives", {
      method: "POST",
      body: JSON.stringify(row),
    }),
  deleteWeekly: (id: string) =>
    request<{ id: string }>(`/api/weekly-narratives/${id}`, {
      method: "DELETE",
    }),

  // Models
  getModels: () => request<SetupModel[]>("/api/models"),
  upsertModel: (model: SetupModel) =>
    request<SetupModel>("/api/models", {
      method: "POST",
      body: JSON.stringify(model),
    }),
  deleteModel: (id: string) =>
    request<{ id: string }>(`/api/models/${id}`, {
      method: "DELETE",
    }),

  // Liquidity
  getLiquidity: () => request<LiquidityLevel[]>("/api/liquidity"),
  upsertLiquidity: (row: LiquidityLevel) =>
    request<LiquidityLevel>("/api/liquidity", {
      method: "POST",
      body: JSON.stringify(row),
    }),
  deleteLiquidity: (id: string) =>
    request<{ id: string }>(`/api/liquidity/${id}`, {
      method: "DELETE",
    }),

  // Protocol
  getProtocolDays: () => request<ProtocolDay[]>("/api/protocol"),
  upsertProtocolDay: (day: ProtocolDay) =>
    request<ProtocolDay>("/api/protocol", {
      method: "POST",
      body: JSON.stringify(day),
    }),
  addProtocolDay: () =>
    request<ProtocolDay>("/api/protocol/add-day", {
      method: "POST",
    }),
  rebuildProtocolDates: (startDate: string) =>
    request<ProtocolDay[]>("/api/protocol/rebuild-dates", {
      method: "POST",
      body: JSON.stringify({ startDate }),
    }),

  // News Events
  getNews: () => request<NewsEvent[]>("/api/news"),
  upsertNews: (event: NewsEvent) =>
    request<NewsEvent>("/api/news", {
      method: "POST",
      body: JSON.stringify(event),
    }),
  deleteNews: (id: string) =>
    request<{ id: string }>(`/api/news/${id}`, {
      method: "DELETE",
    }),

  // Settings & Rules
  getSettings: () => request<any>("/api/settings"),
  patchSettings: (
    patch: Partial<Pick<DeskData, "accountName" | "phaseId" | "mantra">> & {
      rules?: Partial<AccountRules>;
      phases?: Phase[];
      checklistItems?: ChecklistItem[];
    },
  ) =>
    request<any>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(patch),
    }),
  toggleCheck: (date: string, id: string) =>
    request<{ date: string; checkedIds: string[] }>("/api/settings/toggle-check", {
      method: "POST",
      body: JSON.stringify({ date, id }),
    }),
  closeToday: (date: string) =>
    request<any>("/api/settings/close-today", {
      method: "POST",
      body: JSON.stringify({ date }),
    }),
  openToday: (date: string) =>
    request<any>("/api/settings/open-today", {
      method: "POST",
      body: JSON.stringify({ date }),
    }),
};
