import type { LargeLoadSnapshot } from "@/lib/api";

export type MonthDelta = { snapshotMonth: string; mw: number; pct: number | null } | null;

export type MonthlyReport = {
  snapshot: LargeLoadSnapshot;
  mom: MonthDelta;
  yoy: MonthDelta;
  realityGap: { approvedMW: number | null; observedMW: number | null; pct: number | null } | null;
  notableMovements: { category: string; mwDelta: number }[];
};

function shiftMonths(monthStr: string, n: number): string {
  const [y, m] = monthStr.split("-").map(Number);
  const total = y * 12 + (m - 1) - n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}-01`;
}

function delta(cur: number | null, prior: number | null): { mw: number; pct: number | null } | null {
  if (cur == null || prior == null) return null;
  return { mw: cur - prior, pct: prior !== 0 ? ((cur - prior) / prior) * 100 : null };
}

/** Builds the same report shape as kardashev-data's /ercot/large-load/summary,
 * but for any month in the backfilled history, not just the latest — powers
 * per-month permalinks without needing a new backend endpoint per month. */
export function buildMonthlyReport(history: LargeLoadSnapshot[], targetMonth: string): MonthlyReport | null {
  const byMonth = new Map(history.map((h) => [h.snapshot_month, h]));
  const snapshot = byMonth.get(targetMonth);
  if (!snapshot) return null;

  const momSnap = byMonth.get(shiftMonths(targetMonth, 1));
  const yoySnap = byMonth.get(shiftMonths(targetMonth, 12));

  const mom = momSnap
    ? { snapshotMonth: momSnap.snapshot_month, ...(delta(snapshot.total_mw, momSnap.total_mw) ?? { mw: 0, pct: null }) }
    : null;
  const yoy = yoySnap
    ? { snapshotMonth: yoySnap.snapshot_month, ...(delta(snapshot.total_mw, yoySnap.total_mw) ?? { mw: 0, pct: null }) }
    : null;

  const approvedMW = snapshot.approved_to_energize_mw;
  const observedMW = snapshot.by_status ? ((snapshot.by_status as Record<string, number>)["observed_energized"] ?? null) : null;
  const realityGap =
    approvedMW != null
      ? { approvedMW, observedMW, pct: observedMW != null && approvedMW ? (observedMW / approvedMW) * 100 : null }
      : null;

  const notableMovements: { category: string; mwDelta: number }[] = [];
  if (momSnap?.by_status && snapshot.by_status) {
    const curStatus = snapshot.by_status as Record<string, number>;
    const priorStatus = momSnap.by_status as Record<string, number>;
    for (const [key, curMW] of Object.entries(curStatus)) {
      const priorMW = priorStatus[key];
      if (priorMW == null) continue; // taxonomy renamed between decks -- not a like-for-like comparison, skip rather than mismatch
      notableMovements.push({ category: key, mwDelta: curMW - priorMW });
    }
    notableMovements.sort((a, b) => Math.abs(b.mwDelta) - Math.abs(a.mwDelta));
  }

  return { snapshot, mom: mom ?? null, yoy: yoy ?? null, realityGap, notableMovements: notableMovements.slice(0, 5) };
}

export const CATEGORY_LABELS: Record<string, string> = {
  observed_energized: "Observed energized",
  under_ercot_review: "Under ERCOT review",
  no_studies_submitted: "No studies submitted",
  approved_to_energize_not_operational: "Approved to energize (not operational)",
  planning_studies_approved: "Planning studies approved",
  section_9_4_requirements_only: "Section 9.4 only",
  section_9_4_9_5_requirements_met: "Section 9.4/9.5 met",
  section_9_4_only: "Section 9.4 only",
  section_9_4_9_5_met: "Section 9.4/9.5 met",
};
