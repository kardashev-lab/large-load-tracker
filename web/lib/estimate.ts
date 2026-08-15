import type { GisTimeline, LargeLoadSnapshot } from "@/lib/api";

export type ZoneOption = {
  key: string; // large-load by_zone key ("lz_west" | "lz_north" | "other")
  label: string;
  gisZones: string[]; // GIS CDR reporting zone(s) this maps to, for the timeline analog
};

export const ZONE_OPTIONS: ZoneOption[] = [
  { key: "lz_west", label: "West (LLWG Split)", gisZones: ["WEST"] },
  { key: "lz_north", label: "North (LLWG Split)", gisZones: ["NORTH"] },
  { key: "other", label: "Other LLWG Split (South / Houston / Coastal / Panhandle)", gisZones: ["SOUTH", "HOUSTON", "COASTAL", "PANHANDLE"] },
];

export type LoadType = "data_center" | "crypto" | "industrial" | "hydrogen" | "not_specified";

export const LOAD_TYPE_OPTIONS: { key: LoadType; label: string }[] = [
  { key: "data_center", label: "Data center" },
  { key: "crypto", label: "Crypto" },
  { key: "industrial", label: "Industrial" },
  { key: "hydrogen", label: "Hydrogen" },
  { key: "not_specified", label: "Not specified / other" },
];

export type ApprovalThroughput = {
  positiveDeltasMW: number[];
  medianMWPerMonth: number | null;
  minMWPerMonth: number | null;
  maxMWPerMonth: number | null;
  sampleMonths: number;
  flatOrRestatedMonths: number;
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * System-wide (not zone-specific -- ERCOT doesn't publish a consistent
 * zone-level approvals time series) MW/month reaching Approved-to-Energize,
 * from consecutive-calendar-month pairs in the backfilled history only
 * (skips across the disclosed Oct 2024-Jan 2026 reporting gap rather than
 * treating it as one giant month-over-month jump).
 *
 * Only pairs with an observed INCREASE feed the pace figure. Zero-delta
 * pairs (a deck re-filed the same cumulative total) and negative-delta
 * pairs (a later deck restated the total downward, e.g. the 2026-05->06
 * transition) are real events in the series but don't represent "zero or
 * negative approval throughput" in a physical sense -- including them would
 * produce a degenerate, misleadingly wide or open-ended range. They're
 * counted and disclosed, not silently dropped.
 */
export function computeApprovalThroughput(history: LargeLoadSnapshot[]): ApprovalThroughput {
  const sorted = [...history].sort((a, b) => a.snapshot_month.localeCompare(b.snapshot_month));
  const allDeltas: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (prev.approved_to_energize_mw == null || cur.approved_to_energize_mw == null) continue;

    const prevDate = new Date(`${prev.snapshot_month}T00:00:00`);
    const curDate = new Date(`${cur.snapshot_month}T00:00:00`);
    const monthsApart =
      (curDate.getFullYear() - prevDate.getFullYear()) * 12 + (curDate.getMonth() - prevDate.getMonth());
    if (monthsApart !== 1) continue; // skip gaps in the disclosed reporting gap

    allDeltas.push(cur.approved_to_energize_mw - prev.approved_to_energize_mw);
  }

  const positive = allDeltas.filter((d) => d > 0);
  const flatOrRestatedMonths = allDeltas.length - positive.length;

  if (!positive.length) {
    return {
      positiveDeltasMW: [],
      medianMWPerMonth: null,
      minMWPerMonth: null,
      maxMWPerMonth: null,
      sampleMonths: 0,
      flatOrRestatedMonths,
    };
  }

  return {
    positiveDeltasMW: positive,
    medianMWPerMonth: median(positive),
    minMWPerMonth: Math.min(...positive),
    maxMWPerMonth: Math.max(...positive),
    sampleMonths: positive.length,
    flatOrRestatedMonths,
  };
}

export function zoneQueueDepthMW(latest: LargeLoadSnapshot | null, zone: ZoneOption): number | null {
  const byZone = (latest?.by_zone ?? {}) as Record<string, number>;
  return byZone[zone.key] ?? null;
}

export function zoneTimelineYears(
  timelines: GisTimeline[],
  zone: ZoneOption,
): { min: number; max: number; zones: string[] } | null {
  const values = zone.gisZones
    .map((gz) => timelines.find((t) => t.group_type === "zone" && t.group_value === gz && t.metric === "full_process_days"))
    .filter((t): t is GisTimeline => t?.median_years != null);
  if (!values.length) return null;
  const years = values.map((t) => t.median_years as number);
  return { min: Math.min(...years), max: Math.max(...years), zones: values.map((t) => t.group_value) };
}

export function sizeBucketPercentile(
  latest: LargeLoadSnapshot | null,
  mw: number,
): { bucketLabel: string; countInBucket: number; totalCount: number } | null {
  const buckets = latest?.by_size_bucket as Record<string, { mw: number; count: number }> | null;
  if (!buckets) return null;
  const totalCount = Object.values(buckets).reduce((s, b) => s + b.count, 0);
  let bucketKey: string;
  if (mw < 250) bucketKey = "75_250mw";
  else if (mw < 500) bucketKey = "250_500mw";
  else if (mw < 1000) bucketKey = "500_1000mw";
  else bucketKey = "1000mw_plus";
  const labels: Record<string, string> = {
    "75_250mw": "75-250 MW",
    "250_500mw": "250-500 MW",
    "500_1000mw": "500-1,000 MW",
    "1000mw_plus": "1,000+ MW",
  };
  const bucket = buckets[bucketKey];
  if (!bucket) return null;
  return { bucketLabel: labels[bucketKey], countInBucket: bucket.count, totalCount };
}
