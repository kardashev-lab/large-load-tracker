export const dynamic = "force-dynamic";

import Link from "next/link";
import { fetchLargeLoadHistory, checkApiHealth } from "@/lib/api";
import { StatGrid, type Stat } from "@/components/StatGrid";
import { QueueGrowthChart } from "@/components/QueueGrowthChart";
import { BreakdownBars } from "@/components/BreakdownBars";
import { Term } from "@/components/Term";
import { formatDate, formatMW, formatDelta } from "@/lib/format";
import { normalizeByType } from "@/lib/byType";

const SIZE_LABELS: Record<string, string> = {
  "75_250mw": "75–250 MW",
  "250_500mw": "250–500 MW",
  "500_1000mw": "500–1,000 MW",
  "1000mw_plus": "1,000+ MW",
};

const STATUS_LABELS: Record<string, string> = {
  no_studies_submitted: "No studies submitted",
  under_ercot_review: "Under ERCOT review",
  planning_studies_approved: "Planning studies approved",
  approved_to_energize_not_operational: "Approved to energize (not operational)",
  observed_energized: "Observed energized",
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

  const typeRowsNormalized = normalizeByType(latest.by_type, latest.total_mw);
  const dataCenterType = typeRowsNormalized.find((r) => r.key === "data_center");
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
      value: dataCenterType?.pct != null ? `${dataCenterType.pct.toFixed(1)}%` : "—",
      sub: colocatedPct != null ? `${(colocatedPct * 100).toFixed(1)}% co-located` : undefined,
      tone: "neutral",
    },
  ];

  const observedEnergized = (latest.by_status?.["observed_energized"] as number | undefined) ?? null;
  const approvedToEnergize = latest.approved_to_energize_mw;
  const realityRatio =
    approvedToEnergize && observedEnergized != null ? observedEnergized / approvedToEnergize : null;

  const typeRows = typeRowsNormalized.map((r) => ({ label: r.label, mw: r.mw }));

  // Prefer the dedicated approvals columns when the status table left them blank
  // (common: pie/status chart omits planning-studies MW that the approvals chart has).
  const statusSource: Record<string, number | null | undefined> = {
    ...(latest.by_status ?? {}),
    planning_studies_approved:
      (latest.by_status?.["planning_studies_approved"] as number | null | undefined) ??
      latest.planning_studies_approved_mw,
    approved_to_energize_not_operational:
      (latest.by_status?.["approved_to_energize_not_operational"] as number | null | undefined) ??
      (approvedToEnergize != null && observedEnergized != null
        ? Math.max(approvedToEnergize - observedEnergized, 0)
        : undefined),
    observed_energized: observedEnergized,
  };
  const statusOrder = [
    "no_studies_submitted",
    "under_ercot_review",
    "planning_studies_approved",
    "approved_to_energize_not_operational",
    "observed_energized",
  ];
  const statusRows = statusOrder
    .map((k) => {
      const mw = statusSource[k];
      if (mw == null || !Number.isFinite(mw) || mw < 0) return null;
      return { label: STATUS_LABELS[k] ?? k, mw: Number(mw) };
    })
    .filter((r): r is { label: string; mw: number } => r != null);

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
                What do Filing Observations say about Large Load in ERCOT?
              </h1>
              <p className="hero-desc">
                We track ERCOT&apos;s data center, crypto, and industrial power queue back to{" "}
                {formatDate(sorted[0].snapshot_month)}. Real timelines, real prices, real numbers. This
                is what already happened, not a prediction of what will.
              </p>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-label">Large-Load Queue</span>
                <span className="hero-stat-value">{formatMW(latest.total_mw)}</span>
              </div>
              <div className="hero-stat">
                <span className="stat-label">Data center share</span>
                <span className="hero-stat-value">
                  {dataCenterType?.pct != null ? `${dataCenterType.pct.toFixed(0)}%` : "—"}
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
            Line Ahead is arithmetic on Filing Observations: size, LLWG Split, and type. Not a
            time-to-power promise.
          </div>
        </div>
        <Link href="/estimate" className="start-here-cta">
          Line Ahead →
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
            <h2 className="section-title">Reality Gap</h2>
            <div className="section-desc">
              Approved-to-Energize MW versus Observed Energized MW. This is not Pending
              Interconnection Project MW.
            </div>
          </div>
        </div>
        <div className="gap-grid">
          <div className="gap-cell">
            <div className="gap-cell-label">Approved-to-Energize MW</div>
            <div className="gap-cell-value">{formatMW(approvedToEnergize)}</div>
            <div className="gap-cell-sub">Cumulative, ERCOT-approved</div>
          </div>
          <div className="gap-cell">
            <div className="gap-cell-label">Observed Energized MW</div>
            <div className="gap-cell-value amber">{formatMW(observedEnergized)}</div>
            <div className="gap-cell-sub">
              {realityRatio != null
                ? `${(realityRatio * 100).toFixed(0)}% of Approved-to-Energize MW is Observed Energized`
                : "Not broken out in this month's deck"}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">By queue status</h2>
            <div className="section-desc">
              Same cut ERCOT shows in public LLWG / conference decks — speculative vs advanced vs energized.
              Latest snapshot, {formatDate(latest.snapshot_month)}.
            </div>
          </div>
        </div>
        <div className="panel">
          <BreakdownBars rows={statusRows} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">By project type</h2>
            <div className="section-desc">
              Latest snapshot, {formatDate(latest.snapshot_month)}. When ERCOT only labels percentages on the
              type pie, MW is derived from share × total tracked load.
            </div>
          </div>
        </div>
        <div className="panel">
          <BreakdownBars rows={typeRows} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">By MW size bucket</h2>
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
