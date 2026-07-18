"use client";

import { useState } from "react";
import type { GisTimeline, LargeLoadSnapshot } from "@/lib/api";
import {
  ZONE_OPTIONS,
  LOAD_TYPE_OPTIONS,
  computeApprovalThroughput,
  zoneQueueDepthMW,
  zoneTimelineYears,
  sizeBucketPercentile,
  type LoadType,
} from "@/lib/estimate";
import { Term } from "@/components/Term";
import { formatMW } from "@/lib/format";

export function EstimateForm({
  history,
  latest,
  timelines,
}: {
  history: LargeLoadSnapshot[];
  latest: LargeLoadSnapshot | null;
  timelines: GisTimeline[];
}) {
  const [zoneKey, setZoneKey] = useState(ZONE_OPTIONS[0].key);
  const [mw, setMw] = useState(500);
  const [loadType, setLoadType] = useState<LoadType>("data_center");
  const [submitted, setSubmitted] = useState(false);

  const zone = ZONE_OPTIONS.find((z) => z.key === zoneKey)!;
  const throughput = computeApprovalThroughput(history);
  const queueDepth = zoneQueueDepthMW(latest, zone);
  const timeline = zoneTimelineYears(timelines, zone);
  const sizePct = sizeBucketPercentile(latest, mw);

  const typeShare = latest?.by_type
    ? ((latest.by_type as Record<string, { pct: number }>)[loadType]?.pct ?? null)
    : null;

  const yearsAtMedianPace =
    queueDepth != null && throughput.medianMWPerMonth != null
      ? queueDepth / (throughput.medianMWPerMonth * 12)
      : null;
  const yearsAtFastestPace =
    queueDepth != null && throughput.maxMWPerMonth != null ? queueDepth / (throughput.maxMWPerMonth * 12) : null;
  const yearsAtSlowestPace =
    queueDepth != null && throughput.minMWPerMonth != null ? queueDepth / (throughput.minMWPerMonth * 12) : null;

  return (
    <div className="panel">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="estimate-form"
      >
        <div className="estimate-field">
          <label className="zone-section-label" htmlFor="zone">
            Zone
          </label>
          <select id="zone" className="estimate-select" value={zoneKey} onChange={(e) => setZoneKey(e.target.value)}>
            {ZONE_OPTIONS.map((z) => (
              <option key={z.key} value={z.key}>
                {z.label}
              </option>
            ))}
          </select>
        </div>

        <div className="estimate-field">
          <label className="zone-section-label" htmlFor="mw">
            Project size (MW)
          </label>
          <input
            id="mw"
            type="number"
            min={1}
            className="estimate-input"
            value={mw}
            onChange={(e) => setMw(Number(e.target.value) || 0)}
          />
        </div>

        <div className="estimate-field">
          <label className="zone-section-label" htmlFor="type">
            Load type
          </label>
          <select
            id="type"
            className="estimate-select"
            value={loadType}
            onChange={(e) => setLoadType(e.target.value as LoadType)}
          >
            {LOAD_TYPE_OPTIONS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="estimate-submit">
          Show me the arithmetic
        </button>
      </form>

      {submitted && (
        <div className="estimate-result">
          <div className="estimate-result-row">
            <span className="zone-stat-label">Current queue ahead of you ({zone.label})</span>
            <span className="zone-stat-value mono">{formatMW(queueDepth)}</span>
          </div>

          <div className="estimate-result-row">
            <span className="zone-stat-label">
              <Term def="Not specific to this zone — ERCOT doesn't publish a per-zone version of this number, so this is the whole-grid rate.">
                How fast ERCOT approves loads, grid-wide
              </Term>
            </span>
            <span className="zone-stat-value mono">
              {throughput.medianMWPerMonth != null
                ? `${Math.round(throughput.medianMWPerMonth).toLocaleString("en-US")} MW/mo (typical month)`
                : "—"}
            </span>
          </div>

          {yearsAtMedianPace != null && (
            <>
              <div className="estimate-headline">
                At the median observed approval pace, the {zone.label} queue alone would take{" "}
                <span className="amber">~{yearsAtMedianPace.toFixed(0)} years</span> to clear if nothing else were
                added to it.
              </div>
              <div className="zone-note">
                Pace varies a lot month to month: {Math.round(throughput.minMWPerMonth!).toLocaleString("en-US")}
                –{Math.round(throughput.maxMWPerMonth!).toLocaleString("en-US")} MW in a single month across the{" "}
                {throughput.sampleMonths} months with an observed increase (
                {yearsAtFastestPace!.toFixed(0)}–{yearsAtSlowestPace!.toFixed(0)} yr at those extremes) —{" "}
                {throughput.flatOrRestatedMonths} additional months showed no change or a downward restatement,
                excluded from the pace calculation.
              </div>
            </>
          )}

          {timeline && (
            <div className="estimate-result-row">
              <span className="zone-stat-label">
                <Term def="ERCOT doesn't track large-load timelines yet, so this uses measured power-plant interconnection times in the same zone as the closest real-world comparison.">
                  How long similar projects have taken
                </Term>{" "}
                ({timeline.zones.join("/")})
              </span>
              <span className="zone-stat-value mono">
                {timeline.min === timeline.max
                  ? `${timeline.min} yr`
                  : `${timeline.min}-${timeline.max} yr`}
              </span>
            </div>
          )}

          {sizePct && (
            <div className="estimate-result-row">
              <span className="zone-stat-label">Your project size vs. queue</span>
              <span className="zone-stat-value mono">
                {mw} MW falls in the {sizePct.bucketLabel} bucket ({sizePct.countInBucket} of {sizePct.totalCount}{" "}
                tracked projects)
              </span>
            </div>
          )}

          {typeShare != null && (
            <div className="estimate-result-row">
              <span className="zone-stat-label">{loadType.replace(/_/g, " ")} share of current queue</span>
              <span className="zone-stat-value mono">{typeShare.toFixed(1)}%</span>
            </div>
          )}

          <div className="zone-formula">
            Descriptive arithmetic from published data, not a forecast. Approval throughput is ERCOT system-wide
            (a consistent zone-level approvals series isn&apos;t published); the generator-side timeline is a
            different queue (generation, not large load) used as the best available measured analog. See{" "}
            <a href="/methodology">methodology</a>.
          </div>
        </div>
      )}
    </div>
  );
}
