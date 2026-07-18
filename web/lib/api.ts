const API = (process.env.KARDASHEV_API_URL ?? "https://data.kardashevlabs.org").replace(/\/$/, "");

// ── Large load ───────────────────────────────────────────────────────

export type LargeLoadSnapshot = {
  snapshot_month: string;
  report_date: string | null;
  total_mw: number | null;
  colocated_mw: number | null;
  standalone_mw: number | null;
  by_status: Record<string, number> | null;
  by_size_bucket: Record<string, unknown> | null;
  by_type: Record<string, unknown> | null;
  by_zone: Record<string, number> | null;
  approved_to_energize_mw: number | null;
  planning_studies_approved_mw: number | null;
  trailing_12mo: Record<string, number> | null;
  source_url: string | null;
  extracted_at: string | null;
};

// ── GIS interconnection timelines ───────────────────────────────────

export type GisTimeline = {
  metric: string;
  group_type: string;
  group_value: string;
  sample_count: number | null;
  median_days: number | null;
  mean_days: number | null;
  median_years: number | null;
  total_mw: number | null;
};

// ── Zone stress stats ───────────────────────────────────────────────

export type ZoneStat = {
  zone: string;
  month: string;
  mean_rt_da_spread: number | null;
  p95_rt_price: number | null;
  pct_hours_rt_over_100: number | null;
  pct_hours_rt_negative: number | null;
  rt_price_volatility: number | null;
  sample_count: number | null;
};

// ── Core fetch ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, revalidate = 3600): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/health`, { next: { revalidate: 60 } });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchLargeLoadHistory(): Promise<LargeLoadSnapshot[]> {
  const data = await apiFetch<LargeLoadSnapshot[]>("/ercot/large-load/history");
  return data ?? [];
}

export async function fetchLargeLoadLatest(): Promise<LargeLoadSnapshot | null> {
  return apiFetch<LargeLoadSnapshot>("/ercot/large-load/latest");
}

export async function fetchGisTimelines(params?: {
  zone?: string;
  fuel?: string;
  metric?: string;
}): Promise<GisTimeline[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const data = await apiFetch<GisTimeline[]>(`/ercot/gis/timelines${qs ? `?${qs}` : ""}`);
  return data ?? [];
}

export async function fetchGisPending(zone?: string): Promise<GisTimeline[]> {
  const qs = zone ? `?zone=${encodeURIComponent(zone)}` : "";
  const data = await apiFetch<GisTimeline[]>(`/ercot/gis/pending${qs}`);
  return data ?? [];
}

export async function fetchZoneStats(params?: {
  zone?: string;
  from?: string;
  to?: string;
}): Promise<ZoneStat[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const data = await apiFetch<ZoneStat[]>(`/ercot/zone-stats${qs ? `?${qs}` : ""}`);
  return data ?? [];
}
