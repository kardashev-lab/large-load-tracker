import type { GisTimeline, LargeLoadSnapshot, ZoneStat } from "@/lib/api";

export type ZoneMeta = {
  key: string; // GIS/CDR reporting zone value, e.g. "WEST"
  label: string;
  lmpZone: string | null; // matching settlement-point zone for LMP stress stats, or null
  loadKey: string | null; // matching key in large-load by_zone, or null if lumped into "other"
};

export const ZONES: ZoneMeta[] = [
  { key: "WEST", label: "West", lmpZone: "LZ_WEST", loadKey: "lz_west" },
  { key: "NORTH", label: "North", lmpZone: "LZ_NORTH", loadKey: "lz_north" },
  { key: "SOUTH", label: "South", lmpZone: "LZ_SOUTH", loadKey: null },
  { key: "HOUSTON", label: "Houston", lmpZone: "LZ_HOUSTON", loadKey: null },
  { key: "COASTAL", label: "Coastal", lmpZone: null, loadKey: null },
  { key: "PANHANDLE", label: "Panhandle", lmpZone: null, loadKey: null },
];

export type ZoneCardData = {
  meta: ZoneMeta;
  loadMW: number | null;
  loadIsShared: boolean; // true when loadMW is the shared "other" bucket, not zone-specific
  fullProcessYears: number | null;
  buildPhaseYears: number | null;
  codSlipYears: number | null;
  pendingMW: number | null;
  pendingCount: number | null;
  annualThroughputMW: number | null;
  yearsToClearBacklog: number | null;
  stressPctOver100: number | null;
  stressPctNegative: number | null;
  stressMonths: number;
  grade: string;
  gradeInputs: { label: string; rank: number; of: number }[];
};

function findTimeline(
  timelines: GisTimeline[],
  zone: string,
  metric: string,
): GisTimeline | undefined {
  return timelines.find((t) => t.group_type === "zone" && t.group_value === zone && t.metric === metric);
}

function rankAscending(values: (number | null)[]): (number | null)[] {
  // Lower raw value = better = rank 1. Nulls keep null (excluded from scoring).
  const indexed = values.map((v, i) => ({ v, i })).filter((x) => x.v != null) as { v: number; i: number }[];
  indexed.sort((a, b) => a.v - b.v);
  const ranks: (number | null)[] = values.map(() => null);
  indexed.forEach((x, rankIdx) => {
    ranks[x.i] = rankIdx + 1;
  });
  return ranks;
}

function letterFromScore(avgRank: number, n: number): string {
  const pct = (avgRank - 1) / Math.max(n - 1, 1); // 0 = best, 1 = worst
  if (pct <= 0.25) return "A";
  if (pct <= 0.5) return "B";
  if (pct <= 0.75) return "C";
  return "D";
}

export function buildZoneCards(
  timelines: GisTimeline[],
  pending: GisTimeline[],
  zoneStats: ZoneStat[],
  latestLoad: LargeLoadSnapshot | null,
): ZoneCardData[] {
  const byZone = (latestLoad?.by_zone ?? {}) as Record<string, number>;
  const otherMW = byZone["other"] ?? null;

  const rows = ZONES.map((meta) => {
    const fullProcess = findTimeline(timelines, meta.key, "full_process_days");
    const buildPhase = findTimeline(timelines, meta.key, "build_phase_days");
    const codSlip = findTimeline(timelines, meta.key, "cod_slip_days");
    const pendingRow = pending.find((p) => p.group_value === meta.key);
    const throughputRow = findTimeline(timelines, meta.key, "annual_energized_mw");
    const annualThroughputMW = throughputRow?.total_mw ?? null;
    const pendingMW = pendingRow?.total_mw ?? null;
    const yearsToClearBacklog =
      pendingMW != null && annualThroughputMW != null && annualThroughputMW > 0
        ? pendingMW / annualThroughputMW
        : null;

    const zoneMonths = meta.lmpZone
      ? zoneStats.filter((z) => z.zone === meta.lmpZone).slice(-12)
      : [];
    const avgOver100 = zoneMonths.length
      ? zoneMonths.reduce((s, z) => s + (z.pct_hours_rt_over_100 ?? 0), 0) / zoneMonths.length
      : null;
    const avgNegative = zoneMonths.length
      ? zoneMonths.reduce((s, z) => s + (z.pct_hours_rt_negative ?? 0), 0) / zoneMonths.length
      : null;
    const stressIndex = avgOver100 != null && avgNegative != null ? avgOver100 + avgNegative : null;

    const loadMW = meta.loadKey ? (byZone[meta.loadKey] ?? null) : otherMW;

    return {
      meta,
      loadMW,
      loadIsShared: !meta.loadKey,
      fullProcessYears: fullProcess?.median_years ?? null,
      buildPhaseYears: buildPhase?.median_years ?? null,
      codSlipYears: codSlip?.median_years ?? null,
      pendingMW,
      pendingCount: pendingRow?.sample_count ?? null,
      annualThroughputMW,
      yearsToClearBacklog,
      stressPctOver100: avgOver100,
      stressPctNegative: avgNegative,
      stressMonths: zoneMonths.length,
      _stressIndex: stressIndex,
    };
  });

  const n = rows.length;
  const timelineRanks = rankAscending(rows.map((r) => r.fullProcessYears));
  const backlogRanks = rankAscending(rows.map((r) => r.yearsToClearBacklog));
  const stressRanks = rankAscending(rows.map((r) => r._stressIndex));

  return rows.map((r, i) => {
    const inputs: { label: string; rank: number; of: number }[] = [];
    if (timelineRanks[i] != null) inputs.push({ label: "interconnection timeline", rank: timelineRanks[i]!, of: n });
    if (backlogRanks[i] != null) inputs.push({ label: "backlog vs. throughput", rank: backlogRanks[i]!, of: n });
    if (stressRanks[i] != null) inputs.push({ label: "price stress", rank: stressRanks[i]!, of: n });

    const avgRank = inputs.length ? inputs.reduce((s, x) => s + x.rank, 0) / inputs.length : n;
    const grade = letterFromScore(avgRank, n);

    const { _stressIndex, ...rest } = r;
    void _stressIndex;
    return { ...rest, grade, gradeInputs: inputs };
  });
}
