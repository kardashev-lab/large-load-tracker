export const dynamic = "force-dynamic";

import Link from "next/link";
import { fetchLargeLoadHistory, checkApiHealth } from "@/lib/api";
import { StatGrid, type Stat } from "@/components/StatGrid";
import { QueueGrowthChart } from "@/components/QueueGrowthChart";
import { BreakdownBars } from "@/components/BreakdownBars";
import { Term } from "@/components/Term";
import { formatDate, formatMW, formatDelta } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  data_center: "Data center",
  crypto: "Crypto",
  industrial: "Industrial",
  data_center_crypto: "Data center / crypto",
  hydrogen: "Hydrogen",
  not_specified: "Not specified",
  none: "Not specified",
};

const SIZE_LABELS: Record<string, string> = {
  "75_250mw": "75–250 MW",
  "250_500mw": "250–500 MW",
  "500_1000mw": "500–1,000 MW",
  "1000mw_plus": "1,000+ MW",
};

export default async function HomePage() {
  const [history, apiUp] = await Promise.all([fetchLargeLoadHistory(), checkApiHealth()]);

  if (!apiUp || !history.length) {
    return (
      <>
        <div className="api-error">Data API is unreachable right now. Try again shortly.</div>
      </>
    );
  }

  const sorted = [...history].sort((a, b) => a.snapshot_month.localeCompare(b.snapshot_month));
  const latest = sorted[sorted.length - 1];
  const prevMonth = sorted[sorted.length - 2] ?? null;

  // Year-over-year: find a snapshot ~12 months before latest, if the (disclosed) coverage gap allows it.
  const latestDate = new Date(`${latest.snapshot_month}T00:00:00`);
  const yoyTarget = new Date(latestDate);
  yoyTarget.setMonth(yoyTarget.getMonth() - 12);
  const yoySnap =
    sorted.find((s) => s.snapshot_month === yoyTarget.toISOString().slice(0, 8) + "01") ?? null;

  // Chart points, with an explicit null-gap point inserted wherever consecutive
  // snapshots are more than one calendar month apart, so the chart breaks
  // instead of implying smooth growth across the disclosed Oct 2024-Jan 2026 gap.
  const chartPoints: { month: string; colocated: number | null; standalone: number | null }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    if (i > 0) {
      const prev = sorted[i - 1];
      const prevDate = new Date(`${prev.snapshot_month}T00:00:00`);
      const curDate = new Date(`${cur.snapshot_month}T00:00:00`);
      const monthsApart =
        (curDate.getFullYear() - prevDate.getFullYear()) * 12 + (curDate.getMonth() - prevDate.getMonth());
      if (monthsApart > 1) {
        const gapDate = new Date(prevDate);
        gapDate.setMonth(gapDate.getMonth() + 1);
        chartPoints.push({
          month: gapDate.toISOString().slice(0, 7) + "-01",
          colocated: null,
          standalone: null,
        });
      }
    }
    chartPoints.push({
      month: cur.snapshot_month,
      colocated: cur.colocated_mw,
      standalone: cur.standalone_mw,
    });
  }

  const dataCenterType = latest.by_type?.["data_center"] as { mw: number; pct: number } | undefined;
  const colocatedPct = latest.total_mw ? (latest.colocated_mw ?? 0) / latest.total_mw : null;

  const stats: Stat[] = [
    { label: "Tracked large load", value: formatMW(latest.total_mw) },
    {
      label: "Month over month",
      value: formatDelta(latest.total_mw, prevMonth?.total_mw ?? null) ?? "—",
      tone:
        prevMonth && latest.total_mw != null && prevMonth.total_mw != null && latest.total_mw < prevMonth.total_mw
          ? "down"
          : "up",
    },
    {
      label: "Year over year",
      value: yoySnap ? formatDelta(latest.total_mw, yoySnap.total_mw) ?? "—" : "n/a (gap)",
      sub: !yoySnap ? "no snapshot 12mo back" : undefined,
    },
    {
      label: "Data center share",
      value: dataCenterType ? `${dataCenterType.pct.toFixed(1)}%` : "—",
      sub: colocatedPct != null ? `${(colocatedPct * 100).toFixed(1)}% co-located` : undefined,
      tone: "neutral",
    },
  ];

  const observedEnergized = (latest.by_status?.["observed_energized"] as number | undefined) ?? null;
  const approvedToEnergize = latest.approved_to_energize_mw;
  const realityRatio =
    approvedToEnergize && observedEnergized != null ? observedEnergized / approvedToEnergize : null;

  const typeRows = latest.by_type
    ? Object.entries(latest.by_type as Record<string, { mw: number; pct: number }>)
        .map(([k, v]) => ({ label: TYPE_LABELS[k] ?? k, mw: v.mw }))
        .sort((a, b) => b.mw - a.mw)
    : [];

  const sizeRows = latest.by_size_bucket
    ? Object.entries(latest.by_size_bucket as Record<string, { mw: number; count: number }>)
        .map(([k, v]) => ({ label: SIZE_LABELS[k] ?? k, mw: v.mw }))
    : [];

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div className="hero-copy">
              <span className="eyebrow">ERCOT · Updated monthly</span>
              <h1 className="hero-title">
                Can this site get power in ERCOT, and <span className="amber">roughly when?</span>
              </h1>
              <p className="hero-desc">
                We track ERCOT&apos;s data center, crypto, and industrial power queue back to{" "}
                {formatDate(sorted[0].snapshot_month)}. Real timelines, real prices, real numbers. This
                is what already happened, not a prediction of what will.
              </p>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-label">Tracked load</span>
                <span className="hero-stat-value">{formatMW(latest.total_mw)}</span>
              </div>
              <div className="hero-stat">
                <span className="stat-label">Data center share</span>
                <span className="hero-stat-value">
                  {dataCenterType ? `${dataCenterType.pct.toFixed(0)}%` : "—"}
                </span>
              </div>
              <div className="hero-stat">
                <span className="stat-label">Months tracked</span>
                <span className="hero-stat-value">{sorted.length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="start-here">
        <div className="start-here-text">
          <div className="start-here-label">New here?</div>
          <div className="start-here-desc">
            No jargon required. Tell us your project&apos;s size and location. We&apos;ll show you where it
            stands.
          </div>
        </div>
        <Link href="/estimate" className="start-here-cta">
          Estimate my project →
        </Link>
      </div>

      <StatGrid stats={stats} />

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Large load queue, tracked history</h2>
            <div className="section-desc">
              <Term def="Built next to an existing power plant, sharing its connection instead of needing a new one from the grid.">
                Co-located
              </Term>{" "}
              vs.{" "}
              <Term def="A standalone project that needs its own new connection to the grid, built from scratch.">
                standalone
              </Term>{" "}
              MW, monthly. Every break in the line is real: ERCOT&apos;s committee didn&apos;t meet or
              publish a deck those months. It only met about once a month, not every month.
            </div>
          </div>
        </div>
        <div className="panel">
          <QueueGrowthChart points={chartPoints} />
          <div className="source-line">
            Source: ERCOT LLWG / LFLTF committee decks, {sorted.length} monthly snapshots,{" "}
            {formatDate(sorted[0].snapshot_month)}–{formatDate(latest.snapshot_month)}. Latest:{" "}
            <a href={latest.source_url ?? "#"} target="_blank" rel="noreferrer">
              deck of {formatDate(latest.report_date)}
            </a>
            .
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">The reality gap</h2>
            <div className="section-desc">
              Of everything ERCOT has said &quot;yes, you can turn on,&quot; how much has actually{" "}
              <Term def="ERCOT has directly measured this load drawing real power, not just approved it on paper.">
                shown up and started drawing power
              </Term>
              ?
            </div>
          </div>
        </div>
        <div className="gap-grid">
          <div className="gap-cell">
            <div className="gap-cell-label">Approved to energize</div>
            <div className="gap-cell-value">{formatMW(approvedToEnergize)}</div>
            <div className="gap-cell-sub">Cumulative, ERCOT-approved</div>
          </div>
          <div className="gap-cell">
            <div className="gap-cell-label">Observed energized</div>
            <div className="gap-cell-value amber">{formatMW(observedEnergized)}</div>
            <div className="gap-cell-sub">
              {realityRatio != null
                ? `${(realityRatio * 100).toFixed(0)}% of approved load is actually showing up`
                : "Not broken out in this month's deck"}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">By project type</h2>
            <div className="section-desc">Latest snapshot, {formatDate(latest.snapshot_month)}.</div>
          </div>
        </div>
        <div className="panel">
          <BreakdownBars rows={typeRows} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">By project size</h2>
            <div className="section-desc">Latest snapshot, {formatDate(latest.snapshot_month)}.</div>
          </div>
        </div>
        <div className="panel">
          <BreakdownBars rows={sizeRows} />
        </div>
      </section>

      <div className="notice">
        <span className="notice-dot" />
        <span>
ERCOT doesn&apos;t share project-level data. These numbers come from committee slide decks, read
          and cross-checked by hand. See <a href="/methodology">methodology</a> for what we can and
          can&apos;t say.
        </span>
      </div>
    </>
  );
}
