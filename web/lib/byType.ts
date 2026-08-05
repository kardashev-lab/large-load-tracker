/** Normalize ERCOT LLWG by_type payloads across deck vintages. */

export const TYPE_LABELS: Record<string, string> = {
  data_center: "Data center",
  crypto: "Crypto",
  industrial: "Industrial",
  data_center_crypto: "Data center / crypto",
  hydrogen: "Hydrogen",
  not_specified: "Not specified",
  none: "Not specified",
};

export type TypeRow = { key: string; label: string; mw: number; pct: number | null };

type RawEntry = number | { mw?: number | null; pct?: number | null } | null | undefined;

function canonicalTypeKey(key: string): string {
  const k = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (k === "not_specified" || k === "unidentified" || k === "none" || k === "n_a" || k === "na") {
    return "none";
  }
  if (k === "data_center_crypto" || k === "datacenter_crypto" || k === "dc_crypto") {
    return "data_center_crypto";
  }
  if (k === "data_center" || k === "datacenter" || k === "dc") return "data_center";
  return k;
}

function parseEntry(raw: RawEntry): { mw: number | null; pct: number | null } | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return { mw: raw, pct: null };
  }
  if (typeof raw === "object") {
    const mw = raw.mw == null || !Number.isFinite(raw.mw) ? null : Number(raw.mw);
    const pct = raw.pct == null || !Number.isFinite(raw.pct) ? null : Number(raw.pct);
    if (mw == null && pct == null) return null;
    return { mw, pct };
  }
  return null;
}

/**
 * ERCOT's type pie often labels MW only on the data-center slice and leaves
 * the other wedges as percentages. Older extracts also stored plain MW
 * numbers instead of {mw, pct}. Fill gaps from total_mw when possible.
 */
export function normalizeByType(
  byType: Record<string, unknown> | null | undefined,
  totalMw: number | null | undefined,
): TypeRow[] {
  if (!byType) return [];

  const merged = new Map<string, { mw: number | null; pct: number | null }>();
  for (const [rawKey, rawVal] of Object.entries(byType)) {
    const key = canonicalTypeKey(rawKey);
    const parsed = parseEntry(rawVal as RawEntry);
    if (!parsed) continue;
    const prev = merged.get(key);
    if (!prev) {
      merged.set(key, parsed);
      continue;
    }
    merged.set(key, {
      mw: parsed.mw ?? prev.mw,
      pct: parsed.pct ?? prev.pct,
    });
  }

  const total = totalMw != null && Number.isFinite(totalMw) && totalMw > 0 ? totalMw : null;
  const rows: TypeRow[] = [];

  for (const [key, entry] of merged) {
    let mw = entry.mw;
    let pct = entry.pct;
    if (mw == null && pct != null && total != null) {
      mw = (pct / 100) * total;
    }
    if (pct == null && mw != null && total != null) {
      pct = (mw / total) * 100;
    }
    if (mw == null || !Number.isFinite(mw)) continue;
    rows.push({
      key,
      label: TYPE_LABELS[key] ?? key,
      mw,
      pct: pct != null && Number.isFinite(pct) ? pct : null,
    });
  }

  return rows.sort((a, b) => b.mw - a.mw);
}

/** Type share for the estimate form; accepts none/not_specified aliases. */
export function typeSharePct(
  byType: Record<string, unknown> | null | undefined,
  loadType: string,
  totalMw: number | null | undefined,
): number | null {
  const rows = normalizeByType(byType, totalMw);
  const want = canonicalTypeKey(loadType);
  return rows.find((r) => r.key === want)?.pct ?? null;
}
