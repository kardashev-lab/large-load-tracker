type Row = { label: string; mw: number };

export function BreakdownBars({ rows }: { rows: Row[] }) {
  if (!rows.length) {
    return <div className="section-desc">Not broken out in this month&apos;s deck.</div>;
  }
  const max = Math.max(...rows.map((r) => r.mw));
  return (
    <div className="bar-list">
      {rows.map((r) => (
        <div key={r.label} className="bar-row">
          <span className="bar-row-label">{r.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${max > 0 ? (r.mw / max) * 100 : 0}%` }} />
          </div>
          <span className="bar-row-value mono">{Math.round(r.mw).toLocaleString("en-US")} MW</span>
        </div>
      ))}
    </div>
  );
}
