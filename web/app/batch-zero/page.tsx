import type { Metadata } from "next";
import { TIMELINE, CLASSIFICATIONS, PATHWAYS } from "@/lib/batch-zero";

export const metadata: Metadata = {
  title: "Batch Zero Explained | ERCOT Large Load Tracker",
  description:
    "What ERCOT's Batch Zero process (PGRR145, NPRR1325, SB6) is, the key deadlines, how projects get classified, and what happens next.",
};

const STATUS_LABEL: Record<string, string> = { done: "DONE", upcoming: "UPCOMING", unconfirmed: "UNCONFIRMED" };

export default function BatchZeroPage() {
  return (
    <>
      <section className="hero">
        <span className="eyebrow">Batch Zero</span>
        <h1 className="hero-title">ERCOT&apos;s first large-load batch, explained</h1>
        <p className="hero-desc">
          ERCOT is the first grid operator in the country to approve large-load connection requests in
          batches rather than one at a time. Batch Zero is the first group to go through it. Here&apos;s what
          it actually is, sourced from ERCOT&apos;s own filings, not secondhand summaries.
        </p>
      </section>

      <div className="notice">
        <span className="notice-dot" />
        <span>
          As of the deck this queue history was extracted from, ERCOT reported more than 438,000 MW of
          large-load connection requests — nearly 90% from data centers — against an all-time system peak
          demand record of 85,508 MW (Aug 10, 2023). That gap between requested and physically deliverable
          load is the entire reason Batch Zero exists.
        </span>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">Why this exists</div>
        </div>
        <div className="panel">
          <p className="section-desc" style={{ marginBottom: 10 }}>
            ERCOT studied large-load interconnection requests one at a time for years. As requests piled up,
            each new large project could invalidate studies already done for projects further along in the
            queue, triggering costly restudies and delays. Batch Zero replaces that with a system-wide study:
            ERCOT evaluates all eligible large loads together, in one coordinated pass, and produces a single
            transmission plan for what the grid can actually support.
          </p>
          <p className="section-desc">
            Senate Bill 6 (signed 2025, effective immediately) is the statutory basis: it directs the PUCT to
            set new interconnection standards, cost-sharing rules, and curtailment programs for loads with
            75+ MW of single-site peak demand. PGRR145 (the study process) and NPRR1325 (the market rules)
            are how ERCOT implemented that direction.
          </p>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">Timeline</div>
          <div className="section-desc">Primary source where available; secondary/unconfirmed dates flagged plainly.</div>
        </div>
        <div className="panel">
          <div className="timeline-list">
            {TIMELINE.map((t) => (
              <div key={t.date} className="timeline-entry">
                <div className="timeline-date mono">
                  {t.date}
                  <span className={`timeline-status timeline-status-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </div>
                <div className="timeline-body">
                  <div className="timeline-title">{t.title}</div>
                  <div className="section-desc">{t.detail}</div>
                  {t.sourceUrl && (
                    <div className="source-line" style={{ marginTop: 6, paddingTop: 0, border: "none" }}>
                      Source:{" "}
                      <a href={t.sourceUrl} target="_blank" rel="noreferrer">
                        {t.sourceLabel}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">How projects get classified</div>
        </div>
        <div className="panel">
          <div className="bar-list">
            {CLASSIFICATIONS.map((c) => (
              <div key={c.name} className="zone-note" style={{ fontStyle: "normal", marginBottom: 4 }}>
                <strong style={{ color: "var(--text)" }}>{c.name}.</strong> {c.description}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">Optional connection pathways</div>
          <div className="section-desc">Ways to connect faster by reducing pressure on the transmission grid.</div>
        </div>
        <div className="panel">
          <div className="bar-list">
            {PATHWAYS.map((p) => (
              <div key={p.name} className="zone-note" style={{ fontStyle: "normal", marginBottom: 4 }}>
                <strong style={{ color: "var(--text)" }}>{p.name}.</strong> {p.description}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="notice">
        <span className="notice-dot" />
        <span>
          This page is manually maintained, not auto-generated from the deck backfill — check dates against
          ERCOT&apos;s own postings before relying on them for a filing deadline. See{" "}
          <a href="/methodology">methodology</a> for how the rest of this site&apos;s numbers are sourced.
        </span>
      </div>
    </>
  );
}
