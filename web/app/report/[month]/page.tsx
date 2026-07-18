export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchLargeLoadHistory } from "@/lib/api";
import { buildMonthlyReport, CATEGORY_LABELS } from "@/lib/report";
import { formatMW, formatDate, monthLabel } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}): Promise<Metadata> {
  const { month } = await params;
  return {
    title: `State of ERCOT Large Load: ${monthLabel(`${month}-01`)} | Kardashev Labs`,
    description: `Monthly ERCOT large-load queue summary for ${monthLabel(`${month}-01`)}: what changed, notable status movements, and the reality gap.`,
  };
}

export default async function ReportMonthPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const history = await fetchLargeLoadHistory();
  if (!history.length) {
    return <div className="api-error">Data API is unreachable right now. Try again shortly.</div>;
  }

  const targetMonth = `${month}-01`;
  const report = buildMonthlyReport(history, targetMonth);
  if (!report) notFound();

  const sorted = [...history].sort((a, b) => a.snapshot_month.localeCompare(b.snapshot_month));
  const idx = sorted.findIndex((s) => s.snapshot_month === targetMonth);
  const prevAvailable = idx > 0 ? sorted[idx - 1] : null;
  const nextAvailable = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const { snapshot, mom, yoy, realityGap, notableMovements } = report;

  return (
    <>
      <section className="hero">
        <span className="eyebrow">State of ERCOT Large Load</span>
        <h1 className="hero-title">{monthLabel(targetMonth)}</h1>
        <p className="hero-desc">
          Built automatically from the {formatDate(snapshot.report_date)} deck. This page is a permanent
          link. It won&apos;t change later.
        </p>
      </section>

      <div className="report-nav">
        {prevAvailable ? (
          <Link href={`/report/${prevAvailable.snapshot_month.slice(0, 7)}`}>← {monthLabel(prevAvailable.snapshot_month)}</Link>
        ) : (
          <span />
        )}
        {nextAvailable ? (
          <Link href={`/report/${nextAvailable.snapshot_month.slice(0, 7)}`}>{monthLabel(nextAvailable.snapshot_month)} →</Link>
        ) : (
          <span />
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Tracked large load</span>
          <span className="stat-value">{formatMW(snapshot.total_mw)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Month over month</span>
          <span className="stat-value">
            {mom?.pct != null ? `${mom.pct >= 0 ? "+" : ""}${mom.pct.toFixed(1)}%` : "—"}
          </span>
          {mom && <span className="stat-delta up">vs. {monthLabel(mom.snapshotMonth)}</span>}
        </div>
        <div className="stat-card">
          <span className="stat-label">Year over year</span>
          <span className="stat-value">
            {yoy?.pct != null ? `${yoy.pct >= 0 ? "+" : ""}${yoy.pct.toFixed(1)}%` : "n/a (gap)"}
          </span>
          {yoy && <span className="stat-delta up">vs. {monthLabel(yoy.snapshotMonth)}</span>}
        </div>
        <div className="stat-card">
          <span className="stat-label">Reality gap</span>
          <span className="stat-value">{realityGap?.pct != null ? `${realityGap.pct.toFixed(0)}%` : "—"}</span>
          <span className="stat-delta up">of approved MW observed energized</span>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">What moved this month</div>
        </div>
        <div className="panel">
          {notableMovements.length ? (
            <div className="bar-list">
              {notableMovements.map((m) => (
                <div key={m.category} className="zone-stat-row">
                  <span className="zone-stat-label">{CATEGORY_LABELS[m.category] ?? m.category}</span>
                  <span className={`zone-stat-value mono ${m.mwDelta < 0 ? "" : ""}`}>
                    {m.mwDelta >= 0 ? "+" : ""}
                    {Math.round(m.mwDelta).toLocaleString("en-US")} MW
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="section-desc">
              {mom
                ? "Can't compare to last month. ERCOT changed its category names between these two decks."
                : "No prior month to compare against. This is either the first month we have, or it follows a gap in reporting."}
            </div>
          )}
          <div className="source-line">
            Source:{" "}
            <a href={snapshot.source_url ?? "#"} target="_blank" rel="noreferrer">
              LLWG deck of {formatDate(snapshot.report_date)}
            </a>
            .
          </div>
        </div>
      </div>

      <div className="notice">
        <span className="notice-dot" />
        <span>
          This page is generated automatically. Nobody edits it by hand. See <a href="/">overview</a> for
          the full history and <a href="/methodology">methodology</a> for how we get these numbers.
        </span>
      </div>
    </>
  );
}
