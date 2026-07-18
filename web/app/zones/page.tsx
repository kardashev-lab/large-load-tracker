export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { fetchGisTimelines, fetchGisPending, fetchZoneStats, fetchLargeLoadLatest } from "@/lib/api";
import { buildZoneCards, ZONES } from "@/lib/zones";
import { ZoneCard } from "@/components/ZoneCard";
import type { ZoneStat } from "@/lib/api";

export const metadata: Metadata = {
  title: "Zone Scorecards | ERCOT Large Load Tracker",
  description:
    "Load queue, generator-side interconnection timelines, and price stress per ERCOT zone, with a transparent composite grade.",
};

export default async function ZonesPage() {
  const [timelines, pending, latestLoad] = await Promise.all([
    fetchGisTimelines(),
    fetchGisPending(),
    fetchLargeLoadLatest(),
  ]);

  const lmpZones = ZONES.map((z) => z.lmpZone).filter((z): z is string => z != null);
  const zoneStatsByZone: Record<string, ZoneStat[]> = {};
  await Promise.all(
    lmpZones.map(async (zone) => {
      zoneStatsByZone[zone] = await fetchZoneStats({ zone });
    }),
  );
  const allZoneStats = Object.values(zoneStatsByZone).flat();

  if (!timelines.length) {
    return <div className="api-error">Data API is unreachable right now. Try again shortly.</div>;
  }

  const cards = buildZoneCards(timelines, pending, allZoneStats, latestLoad);

  return (
    <>
      <section className="hero">
        <span className="eyebrow">By zone</span>
        <h1 className="hero-title">Which zones can actually absorb this load</h1>
        <p className="hero-desc">
          Each card mixes three different datasets. We don&apos;t force them to line up when they
          don&apos;t. The grade is a simple average rank. The formula is printed right on the card, no
          black box.
        </p>
      </section>

      <div className="zone-grid">
        {cards.map((c) => (
          <ZoneCard key={c.meta.key} data={c} months={c.meta.lmpZone ? (zoneStatsByZone[c.meta.lmpZone] ?? []) : []} />
        ))}
      </div>

      <div className="notice">
        <span className="notice-dot" />
        <span>
          ERCOT splits the grid into zones differently depending on the dataset. They don&apos;t always
          line up. When a card says a number isn&apos;t available, that&apos;s real, not a bug. See{" "}
          <a href="/methodology">methodology</a>.
        </span>
      </div>
    </>
  );
}
