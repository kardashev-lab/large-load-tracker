export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { fetchLargeLoadHistory, fetchLargeLoadLatest, fetchGisTimelines } from "@/lib/api";
import { EstimateForm } from "@/components/EstimateForm";

export const metadata: Metadata = {
  title: "Line Ahead | ERCOT Large Load Tracker",
  description:
    "Line Ahead: descriptive arithmetic from Filing Observations and measured Full Process. Not a forecast, not a Clearance, not a time-to-power promise.",
};

export default async function EstimatePage() {
  const [history, latest, timelines] = await Promise.all([
    fetchLargeLoadHistory(),
    fetchLargeLoadLatest(),
    fetchGisTimelines(),
  ]);

  if (!history.length) {
    return <div className="api-error">Data API is unreachable right now. Try again shortly.</div>;
  }

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Line Ahead</span>
        <h1 className="hero-title">Descriptive arithmetic, not a forecast</h1>
        <p className="hero-desc">
          Pick an LLWG Split, size, and Large Load type. The math uses Filing Observation queue
          depth, system-wide approval pace (ERCOT does not publish zone-level approvals), and
          measured Full Process on the generation side. Not a forecast. Not a Clearance. Not a
          time-to-power promise.
        </p>
      </section>

      <div className="section">
        <EstimateForm history={history} latest={latest} timelines={timelines} />
      </div>
    </>
  );
}
