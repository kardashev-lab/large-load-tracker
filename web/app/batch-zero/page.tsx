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
          ERCOT is the first grid operator in the country to approve Large Loads in batches instead of one
          at a time. Batch Zero is the first Large-Load Integration instance under that process. It is not
          a Clearance and not a context of its own. Here&apos;s what the filings actually say.
        </p>
      </section>

      <div className="notice">
        <span className="notice-dot" />
        <span>
          ERCOT has more than 438,000 MW of large-load requests on file. Almost 90% of that is data
          centers. The state&apos;s all-time peak demand record is 85,508 MW. That gap between what&apos;s
          requested and what the grid can actually deliver is why Batch Zero exists.
        </span>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Why this exists</h2>
        </div>
        <div className="panel">
          <p className="section-desc" style={{ marginBottom: 10 }}>
            ERCOT used to study each large-load request on its own. As requests piled up, every new
            project could break the studies already done for projects ahead of it in line. That meant
            expensive restudies and delays. Batch Zero fixes this by studying everyone at once. ERCOT looks
            at every eligible project together and builds one transmission plan for what the grid can
            actually support.
          </p>
          <p className="section-desc">
            Senate Bill 6, signed in 2025, is the law behind this. It tells the PUCT to set new
            interconnection rules, cost-sharing rules, and curtailment programs for any load over 75 MW.
            PGRR145 and NPRR1325 are how ERCOT turned that into an actual process.
          </p>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Timeline</h2>
          <div className="section-desc">Sourced from ERCOT where we can. Unconfirmed dates are flagged.</div>
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
          <h2 className="section-title">How projects get classified</h2>
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
          <h2 className="section-title">Optional connection pathways</h2>
          <div className="section-desc">Two ways to connect faster, if you ease pressure on the grid.</div>
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
          We update this page by hand, it isn&apos;t pulled from the deck data automatically. Double-check
          any filing deadline against ERCOT&apos;s own site before you rely on it. See{" "}
          <a href="/methodology">methodology</a> for how the rest of this site&apos;s numbers are sourced.
        </span>
      </div>
    </>
  );
}
