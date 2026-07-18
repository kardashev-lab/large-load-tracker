import type { ZoneCardData } from "@/lib/zones";
import type { ZoneStat } from "@/lib/api";
import { ZoneStressSpark } from "@/components/ZoneStressSpark";
import { formatMW, formatPct } from "@/lib/format";

const GRADE_TONE: Record<string, string> = { A: "grade-a", B: "grade-b", C: "grade-c", D: "grade-d" };

export function ZoneCard({ data, months }: { data: ZoneCardData; months: ZoneStat[] }) {
  return (
    <div className="zone-card">
      <div className="zone-card-head">
        <span className="zone-card-name">{data.meta.label}</span>
        <span className={`grade-badge ${GRADE_TONE[data.grade]}`}>{data.grade}</span>
      </div>

      <div className="zone-stat-row">
        <span className="zone-stat-label">Load queue (LLWG)</span>
        <span className="zone-stat-value mono">{formatMW(data.loadMW)}</span>
      </div>
      {data.loadIsShared && (
        <div className="zone-note">Not broken out separately — combined into ERCOT&apos;s &quot;Other&quot; bucket.</div>
      )}

      <div className="zone-section-label">Generator-side timelines (median)</div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">Full process</span>
        <span className="zone-stat-value mono">
          {data.fullProcessYears != null ? `${data.fullProcessYears} yr` : "—"}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">Build phase (IA→energized)</span>
        <span className="zone-stat-value mono">
          {data.buildPhaseYears != null ? `${data.buildPhaseYears} yr` : "—"}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">COD slippage</span>
        <span className="zone-stat-value mono">
          {data.codSlipYears != null ? `${data.codSlipYears} yr late` : "—"}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">Pending backlog</span>
        <span className="zone-stat-value mono">
          {formatMW(data.pendingMW)}
          {data.pendingCount != null ? ` · ${data.pendingCount}` : ""}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">Years to clear at current pace</span>
        <span className="zone-stat-value mono">
          {data.yearsToClearBacklog != null ? `${data.yearsToClearBacklog.toFixed(0)} yr` : "—"}
        </span>
      </div>
      {data.annualThroughputMW != null && (
        <div className="zone-note">
          Zone has historically energized {formatMW(data.annualThroughputMW)}/yr — backlog ÷ throughput,
          not raw MW.
        </div>
      )}

      <div className="zone-section-label">Price stress proxy (12mo avg)</div>
      {data.stressMonths > 0 ? (
        <>
          <div className="zone-stat-row">
            <span className="zone-stat-label">Hours &gt; $100/MWh</span>
            <span className="zone-stat-value mono">{formatPct(data.stressPctOver100)}</span>
          </div>
          <div className="zone-stat-row">
            <span className="zone-stat-label">Hours negative</span>
            <span className="zone-stat-value mono">{formatPct(data.stressPctNegative)}</span>
          </div>
          <ZoneStressSpark months={months} />
        </>
      ) : (
        <div className="zone-note">No matching LMP settlement-point zone for this CDR zone.</div>
      )}

      <div className="zone-formula">
        Grade = avg rank across {data.gradeInputs.map((g) => g.label).join(", ")} ({data.gradeInputs.length}/3
        factors available), lower rank is better.
      </div>
    </div>
  );
}
