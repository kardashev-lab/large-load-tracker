export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { fetchLargeLoadHistory, fetchLargeLoadLatest, fetchGisTimelines } from "@/lib/api";
import { EstimateForm } from "@/components/EstimateForm";

export const metadata: Metadata = {
  title: "Estimate | ERCOT Large Load Tracker",
  description:
    "Ahead of you in line: current queue depth, historical approval throughput, and measured generator-side timelines for a large-load project in ERCOT.",
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
        <span className="eyebrow">Estimate</span>
        <h1 className="hero-title">Ahead of you in line</h1>
        <p className="hero-desc">
          Pick your zone, size, and load type. We&apos;ll do simple math on real ERCOT numbers: how many
          projects are ahead of you, how fast ERCOT has been approving loads, and how long similar
          projects have taken. Not a forecast. Not a promise.
        </p>
      </section>

      <div className="section">
        <EstimateForm history={history} latest={latest} timelines={timelines} />
      </div>
    </>
  );
}
