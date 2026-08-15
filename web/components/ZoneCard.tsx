import type { ZoneCardData } from "@/lib/zones";
import { geographyLine } from "@/lib/zones";
import type { ZoneStat } from "@/lib/api";
import { ZoneStressSpark } from "@/components/ZoneStressSpark";
import { Term } from "@/components/Term";
import { formatMW, formatPct } from "@/lib/format";

const GRADE_TONE: Record<string, string> = { A: "grade-a", B: "grade-b", C: "grade-c", D: "grade-d" };

export function ZoneCard({ data, months }: { data: ZoneCardData; months: ZoneStat[] }) {
  const tone = GRADE_TONE[data.mark];
  return (
    <div className={`zone-card zone-card-${data.mark.toLowerCase()}`}>
      <div className="zone-card-head">
        <h3 className="zone-card-name">{data.meta.label}</h3>
        <span className={`grade-badge ${tone}`} title="Zone Scorecard Mark">
          {data.mark}
        </span>
      </div>
      <div className="zone-note">{geographyLine(data.meta)}</div>

      <div className="zone-stat-row">
        <span className="zone-stat-label">Large-Load Queue waiting to connect</span>
        <span className="zone-stat-value mono">{formatMW(data.loadMW)}</span>
      </div>
      {data.loadIsShared && (
        <div className="zone-note">No own LLWG Split. This CDR Zone is lumped into Other in the decks.</div>
      )}

      <div className="zone-section-label">
        <Term def="ERCOT doesn't publish how long large loads like data centers take yet. This uses power-plant interconnection times in the same zone as the closest real-world stand-in.">
          How long it&apos;s taken others
        </Term>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">
          <Term def="Full Process: Screening Start to Approved for Energization. Not Commercial Operation.">
            Full Process
          </Term>
        </span>
        <span className="zone-stat-value mono">
          {data.fullProcessYears != null ? `${data.fullProcessYears} yr` : "—"}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">
          <Term def="Build Phase: IA Signed to Approved for Energization.">
            Build Phase
          </Term>
        </span>
        <span className="zone-stat-value mono">
          {data.buildPhaseYears != null ? `${data.buildPhaseYears} yr` : "—"}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">
          <Term def="Projected Commercial Operation versus actual Commercial Operation. Not Full Process.">
            COD Slip
          </Term>
        </span>
        <span className="zone-stat-value mono">
          {data.codSlipYears != null ? `${data.codSlipYears} yr` : "—"}
        </span>
      </div>
      <div className="zone-stat-row">
        <span className="zone-stat-label">Generation Queue ahead</span>
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
          Generation-side pending MW over this CDR Zone&apos;s own Approved for Energization
          throughput: {formatMW(data.annualThroughputMW)} per year on average.
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
        <div className="zone-note">No Settlement Zone LMP series for this CDR Zone (Coastal and Panhandle have none).</div>
      )}

      <div className="zone-formula">
        Mark is the average rank across {data.markInputs.length} of 3 factors ({data.markInputs.map((g) => g.label).join(", ")}). Relative CDR Zone rank, not a Clearance Band.
      </div>
    </div>
  );
}
