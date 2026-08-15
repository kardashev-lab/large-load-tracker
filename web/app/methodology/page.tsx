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
          If we can&apos;t point to a public source for a number, it doesn&apos;t belong on this site.
          Here&apos;s where everything comes from.
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Large-load queue history</h2>
        </div>
        <div className="panel">
          <p className="section-desc" style={{ marginBottom: 12 }}>
            ERCOT&apos;s Large Load Working Group and its predecessor, the Large Flexible Load Task
            Force, each post a monthly status update. It&apos;s a slide deck, not a spreadsheet. The real
            numbers live inside bar and pie charts, not a table you can copy and paste.
          </p>
          <p className="section-desc" style={{ marginBottom: 12 }}>
            We download each deck, turn the slides into images, and read the numbers off the charts by
            hand. Every deck also shows its own 12-month trend chart, so we can check one month&apos;s
            number against up to 12 other decks. If a number is more than 5% off from what the other
            decks say, we go back and check the original PDF before trusting it.
          </p>
          <p className="section-desc" style={{ marginBottom: 12 }}>
            ERCOT&apos;s type pie often prints megawatts only on the data-center slice and leaves the
            other wedges as percentages. When that happens we derive MW as share × total tracked load
            for that month, rather than showing zeros.
          </p>
          <p className="section-desc">
            <strong>There are real gaps in the data.</strong> The committee didn&apos;t meet or post this
            deck every single month, especially in the earlier LFLTF era, so several months are missing
            throughout the history, plus one big gap between October 2024 and January 2026 where nobody
            posted anything for over a year. We show every one of these as a break in the chart. We
            don&apos;t guess at what happened in between.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Generator interconnection timelines</h2>
        </div>
        <div className="panel">
          <p className="section-desc">
            ERCOT publishes a monthly report tracking every power plant project waiting to connect: when
            its studies started, when it signed its agreement, when it got approved to turn on. That&apos;s
            a different queue than the large-load one above (it&apos;s power plants, not data centers), but
            it&apos;s the best real measurement we have of how long ERCOT interconnection actually takes.
            We use it as a stand-in by zone and fuel type.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Zone stress proxy</h2>
        </div>
        <div className="panel">
          <p className="section-desc">
            Each month, we look at ERCOT&apos;s wholesale electricity prices by zone going back to 2019:
            how often prices spiked, how often they went negative, how volatile they were. This is a
            rough signal for how strained a zone&apos;s grid is. It is not a real engineering study of
            specific power lines or substations. Treat it as a hint, not a verdict.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">What this data can&apos;t tell you</h2>
        </div>
        <div className="panel">
          <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            <li className="section-desc">
              No individual projects. ERCOT only publishes totals, not project names, sizes, or exact
              locations.
            </li>
            <li className="section-desc">
              The split is LLWG Split geography: West, North, and Other. Houston does not have its
              own Large-Load geography in the decks.
            </li>
            <li className="section-desc">
              This isn&apos;t a forecast. Every number here already happened. Nothing predicts what comes
              next.
            </li>
            <li className="section-desc">
              ERCOT keeps changing its own category names between decks. When that happens, we leave the
              field blank instead of guessing at a match.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
