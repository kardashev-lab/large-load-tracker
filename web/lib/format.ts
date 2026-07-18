export function formatMW(mw: number | null | undefined, opts?: { unit?: boolean }): string {
  if (mw == null) return "—";
  const abs = Math.abs(mw);
  if (abs >= 1000) {
    const gw = (mw / 1000).toFixed(1);
    return opts?.unit === false ? gw : `${gw} GW`;
  }
  const val = Math.round(mw).toLocaleString("en-US");
  return opts?.unit === false ? val : `${val} MW`;
}

export function formatPct(frac: number | null | undefined, digits = 1): string {
  if (frac == null) return "—";
  return `${(frac * 100).toFixed(digits)}%`;
}

export function formatDelta(current: number | null, previous: number | null): string | null {
  if (current == null || previous == null || previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function monthLabel(isoDate: string): string {
  const [y, m] = isoDate.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
