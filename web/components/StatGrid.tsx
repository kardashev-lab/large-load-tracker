export type Stat = {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down" | "neutral";
};

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="stat-grid">
      {stats.map((s) => (
        <div key={s.label} className="stat-card">
          <span className="stat-label">{s.label}</span>
          <span className="stat-value">{s.value}</span>
          {s.sub && (
            <span className={`stat-delta ${s.tone === "down" ? "down" : "up"}`}>{s.sub}</span>
          )}
        </div>
      ))}
    </div>
  );
}
