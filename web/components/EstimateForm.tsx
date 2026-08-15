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
import { typeSharePct } from "@/lib/byType";

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

  const typeShare = typeSharePct(latest?.by_type, loadType, latest?.total_mw ?? null);

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
          <label className="estimate-label" htmlFor="zone">
            LLWG Split
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
          <label className="estimate-label" htmlFor="mw">
            Stated MW
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
          <label className="estimate-label" htmlFor="type">
            Large Load type
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
            <span className="zone-stat-label">Large-Load Queue ahead ({zone.label})</span>
            <span className="zone-stat-value mono">{formatMW(queueDepth)}</span>
          </div>

          <div className="estimate-result-row">
            <span className="zone-stat-label">
              <Term def="System-wide. ERCOT does not publish a per-LLWG-Split version of this number.">
                How fast ERCOT approves Large Load, system-wide
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
                At the typical pace, the {zone.label} Large-Load Queue alone would take{" "}
                <span className="amber">~{yearsAtMedianPace.toFixed(0)} years</span> to clear, if nothing else
                got added.
              </div>
              <div className="zone-note">
                The pace swings a lot month to month: as low as{" "}
                {Math.round(throughput.minMWPerMonth!).toLocaleString("en-US")} MW and as high as{" "}
                {Math.round(throughput.maxMWPerMonth!).toLocaleString("en-US")} MW in a single month, across the{" "}
                {throughput.sampleMonths} months that actually grew ({yearsAtFastestPace!.toFixed(0)} to{" "}
                {yearsAtSlowestPace!.toFixed(0)} years at those two extremes). {throughput.flatOrRestatedMonths}{" "}
                other months showed no change or a drop, so we left them out of the pace calculation.
              </div>
            </>
          )}

          {timeline && (
            <div className="estimate-result-row">
              <span className="zone-stat-label">
                <Term def="ERCOT does not publish Large-Load Full Process. This uses measured generation-side Full Process in the matching CDR Zone as the closest stand-in.">
                  Generation-side Full Process (stand-in)
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
              <span className="zone-stat-label">This MW vs the Large-Load Queue</span>
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
            Line Ahead is arithmetic on Filing Observations, not a forecast, not a Clearance, and
            not a time-to-power promise. Approval pace is system-wide; ERCOT does not publish it
            by LLWG Split. Full Process comes from the Generation Queue, not Large Load. See{" "}
            <a href="/methodology">methodology</a>.
          </div>
        </div>
      )}
    </div>
  );
}
