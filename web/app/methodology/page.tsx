export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology | ERCOT Large Load Tracker",
  description: "Where every number on this site comes from, and what the data can and cannot say.",
};

export default function MethodologyPage() {
  return (
    <>
      <section className="hero">
        <span className="eyebrow">Methodology</span>
        <h1 className="hero-title">Where every number comes from</h1>
        <p className="hero-desc">
          Written for a skeptical analyst. If a number on this site can&apos;t be traced to a public
          source, it shouldn&apos;t be trusted — and it shouldn&apos;t be here.
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">Large-load queue history</div>
        </div>
        <div className="panel">
          <p className="section-desc" style={{ marginBottom: 12 }}>
            ERCOT&apos;s Large Load Working Group (LLWG, active 2025–present) and its predecessor
            committee, the Large Flexible Load Task Force (LFLTF, active 2022–2024), each post a
            monthly &quot;Large Load Interconnection Status Update&quot; slide deck to their committee
            meeting pages. The figures are rendered as bar/pie charts with data labels, not text
            tables or a CSV — ERCOT does not publish a structured feed for this data.
          </p>
          <p className="section-desc" style={{ marginBottom: 12 }}>
            Each deck is downloaded, converted to page images, and read (vision extraction) into a
            fixed JSON schema matching this site&apos;s database columns. Every deck also carries its
            own &quot;Large Load Queue – Past 12 Months&quot; trend chart; overlapping decks are
            cross-checked against each other (a given month&apos;s total, as reported by up to 12
            different decks) and any claim more than 5% off the group median is flagged for manual
            review against the source PDF before being trusted.
          </p>
          <p className="section-desc">
            <strong>Disclosed gap:</strong> neither committee posted the quantitative deck between
            October 2024 and January 2026 — LFLTF had wound down and LLWG had not yet resumed the
            cadence. That gap is shown as a break in the queue-growth chart, not filled by inference.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">Generator interconnection timelines</div>
        </div>
        <div className="panel">
          <p className="section-desc">
            Sourced from ERCOT&apos;s monthly GIS_Report filings (MIS reportTypeId 15933), which track
            every generation-interconnection-queue project&apos;s milestone dates (screening study,
            interconnection agreement signed, construction, approved for energization) across every
            month it appears. &quot;Full process&quot; duration is screening-study-started to
            approved-for-energization; &quot;build phase&quot; is IA-signed to
            approved-for-energization. This is <strong>generation-side</strong> interconnection data —
            a structurally different queue and process than the large-load queue above — used here as
            the best available proxy for how long ERCOT interconnection actually takes in practice,
            by zone and fuel type.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">Zone stress proxy</div>
        </div>
        <div className="panel">
          <p className="section-desc">
            Computed monthly from ERCOT&apos;s day-ahead and real-time locational marginal price (LMP)
            history at each settlement-point load zone (2019–present): mean RT-DA spread, the 95th
            percentile real-time price, the share of 15-minute intervals above $100/MWh, the share
            below $0/MWh, and real-time price volatility (standard deviation). This is a{" "}
            <strong>coarse stress proxy</strong>, not a real congestion or OPF (optimal power flow)
            model — it says nothing about specific transmission-line loading or substation capacity.
            Treat it as a directional signal, not an engineering assessment.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="section-title">What this data cannot say</div>
        </div>
        <div className="panel">
          <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            <li className="section-desc">
              No project-level large-load data. ERCOT&apos;s large-load figures are chart-level
              aggregates only — individual project names, sizes, or exact locations are not disclosed
              at this stage of the interconnection process.
            </li>
            <li className="section-desc">
              The load-side zone split is coarse — LLWG decks split the queue only into LZ_WEST,
              LZ_NORTH, and &quot;Other,&quot; not the full set of settlement zones.
            </li>
            <li className="section-desc">
              Not a forecast. Every number here describes what has already happened or what ERCOT has
              already published — not a prediction of what will happen next.
            </li>
            <li className="section-desc">
              Category taxonomies have changed between decks (e.g. &quot;Planning Studies
              Approved&quot; became &quot;Section 9.4 / Section 9.4-9.5&quot; in mid-2026) as ERCOT
              revised its own reporting methodology. Fields are stored as null for a given month
              rather than force-fit to a schema the source deck didn&apos;t actually use.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
