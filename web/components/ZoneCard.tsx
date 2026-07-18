import type { ZoneCardData } from "@/lib/zones";
import type { ZoneStat } from "@/lib/api";
import { ZoneStressSpark } from "@/components/ZoneStressSpark";
import { Term } from "@/components/Term";
import { formatMW, formatPct } from "@/lib/format";

const GRADE_TONE: Record<string, string> = { A: "grade-a", B: "grade-b", C: "grade-c", D: "grade-d" };

export function ZoneCard({ data, months }: { data: ZoneCardData; months: ZoneStat[] }) {
  const tone = GRADE_TONE[data.grade];
  return (
    <div className={`zone-card zone-card-${data.grade.toLowerCase()}`}>
      <div className="zone-card-head">
        <span className="zone-card-name">{data.meta.label}</span>
        <span className={`grade-badge ${tone}`}>{data.grade}</span>
      </div>

      <div className="zone-stat-row">
        <span className="zone-stat-label">Large loads waiting to connect</span>
        <span className="zone-stat-value mono">{formatMW(data.loadMW)}</span>
      </div>
      {data.loadIsShared && (
        <div className="zone-note">ERCOT doesn&apos;t break this zone out on its own. It&apos;s lumped into &quot;Other.&quot;</div>
      )}

      <div className="zone-section-label">
        <Term def="ERCOT doesn't publish how long large loads like data centers take yet. This uses power-plant interconnection times in the same zone as the closest real-world stand-in.">
          How long it&apos;s taken others
        </Term>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">
          <Term def="Time from first application to actually being allowed to draw power, start to finish.">
            Start to finish
          </Term>
        </span>
        <span className="zone-stat-value mono">
          {data.fullProcessYears != null ? `${data.fullProcessYears} yr` : "—"}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">
          <Term def="Time from signing the interconnection agreement (the formal construction contract) to actually being energized.">
            After signing the agreement
          </Term>
        </span>
        <span className="zone-stat-value mono">
          {data.buildPhaseYears != null ? `${data.buildPhaseYears} yr` : "—"}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">
          <Term def="How much later projects actually came online compared to the completion date they originally filed.">
            Typically runs late by
          </Term>
        </span>
        <span className="zone-stat-value mono">
          {data.codSlipYears != null ? `${data.codSlipYears} yr` : "—"}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">Queue ahead of you</span>
        <span className="zone-stat-value mono">
          {formatMW(data.pendingMW)}
          {data.pendingCount != null ? ` · ${data.pendingCount} projects` : ""}
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
          Based on this zone&apos;s own track record: {formatMW(data.annualThroughputMW)} energized per year on
          average.
        </div>
      )}

      <div className="zone-section-label">Grid stress signal (from electricity prices)</div>
      {data.stressMonths > 0 ? (
        <>
          <div className="zone-stat-row">
            <span className="zone-stat-label">
              <Term def="Share of 15-minute periods in the past 12 months where wholesale power cost more than $100/MWh. A sign the local grid was strained.">
                Expensive hours
              </Term>
            </span>
            <span className="zone-stat-value mono">{formatPct(data.stressPctOver100)}</span>
          </div>
          <div className="zone-stat-row">
            <span className="zone-stat-label">
              <Term def="Share of 15-minute periods where power prices went below $0. Usually means too much wind and solar for the local demand to soak up.">
                Oversupplied hours
              </Term>
            </span>
            <span className="zone-stat-value mono">{formatPct(data.stressPctNegative)}</span>
          </div>
          <ZoneStressSpark months={months} />
        </>
      ) : (
        <div className="zone-note">No price data for this zone.</div>
      )}

      <div className="zone-formula">
        Grade is the average rank across {data.gradeInputs.length} of 3 factors ({data.gradeInputs.map((g) => g.label).join(", ")}). Every number above feeds directly into it. Nothing hidden.
      </div>
    </div>
  );
}
