import type {
  Alignments,
  DealingRange,
  DeskData,
  Instrument,
  PremiumDiscount,
  Trade,
  TradeResult,
} from "./ict-types";

export function dealingMeta(range: DealingRange) {
  const high = range.high;
  const low = range.low;
  if (high == null || low == null || high === low) {
    return {
      eq: null as number | null,
      span: 0,
      location: "equilibrium" as PremiumDiscount,
      pctFromLow: null as number | null,
    };
  }
  const top = Math.max(high, low);
  const bot = Math.min(high, low);
  const eq = (top + bot) / 2;
  const span = top - bot;
  const price = range.current ?? range.close ?? null;
  let location: PremiumDiscount = "equilibrium";
  let pctFromLow: number | null = null;
  if (price != null && span > 0) {
    pctFromLow = (price - bot) / span;
    if (pctFromLow > 0.55) location = "premium";
    else if (pctFromLow < 0.45) location = "discount";
    else location = "equilibrium";
  }
  return { eq, span, location, pctFromLow, high: top, low: bot };
}

export function locationOfPrice(price: number | null, range: DealingRange): PremiumDiscount {
  return dealingMeta({ ...range, current: price ?? range.current }).location;
}

export function stopDistance(t: Pick<Trade, "entry" | "sl">) {
  if (t.entry == null || t.sl == null) return 0;
  return Math.abs(t.entry - t.sl);
}

export function rFromPrices(
  side: Trade["side"],
  entry: number | null,
  sl: number | null,
  exit: number | null,
) {
  if (entry == null || sl == null || exit == null) return null;
  const stop = Math.abs(entry - sl);
  if (stop === 0) return null;
  const reward = side === "long" ? exit - entry : entry - exit;
  return reward / stop;
}

export function resultFromR(r: number | null, explicit?: TradeResult): TradeResult {
  if (explicit === "open") return "open";
  if (r == null) return "open";
  if (r > 0.15) return "win";
  if (r < -0.15) return "loss";
  return "be";
}

export function computeTradeR(t: Trade) {
  return rFromPrices(t.side, t.entry, t.sl, t.exitPrice);
}

export function pnlPctOf(t: Trade) {
  if (t.rMultiple == null || t.result === "open") return 0;
  return t.riskPct * t.rMultiple;
}

export function instrumentOf(data: DeskData, symbol: string) {
  return data.instruments.find((i) => i.symbol === symbol) ?? data.instruments[0];
}

export function positionLots(
  equity: number,
  riskPct: number,
  entry: number | null,
  sl: number | null,
  inst: Instrument | undefined,
) {
  if (!inst || entry == null || sl == null) return null;
  const stop = Math.abs(entry - sl);
  if (stop <= 0) return null;
  const riskUsd = equity * (riskPct / 100);
  const $PerLot = (stop / inst.tickSize) * inst.tickValuePerLot;
  if ($PerLot <= 0) return null;
  return riskUsd / $PerLot;
}

export function biasConfidence(a: Alignments) {
  const keys: (keyof Alignments)[] = ["htf", "liquidity", "location", "time", "narrative"];
  const n = keys.filter((k) => a[k]).length;
  return Math.round((n / keys.length) * 100);
}

export function confluenceScore(t: Trade) {
  let n = 0;
  if (t.weeklyBias !== "neutral" && t.weeklyBias === t.dailyBias) n += 1;
  if (t.drawOnLiquidity) n += 1;
  if (
    (t.side === "long" && t.location === "discount") ||
    (t.side === "short" && t.location === "premium")
  )
    n += 1;
  if (t.taken.length) n += 1;
  if (t.pdArray) n += 1;
  if (t.triggers.includes("MSS") || t.triggers.includes("CISD") || t.triggers.includes("BOS")) n += 1;
  if (t.triggers.includes("Displacement") || t.displacementQuality === "strong") n += 1;
  if (t.killZone && t.killZone !== "Other") n += 1;
  if (t.smt.present !== "no") n += 1;
  if (t.ote.used === "used" && t.ote.inside) n += 1;
  return n;
}

export function closedTrades(trades: Trade[]) {
  return trades.filter((t) => t.result !== "open" && t.rMultiple != null);
}

export function fmtPx(n: number | null | undefined, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtLots(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(2);
}
