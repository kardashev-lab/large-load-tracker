export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { fetchGisTimelines, fetchGisPending, fetchZoneStats, fetchLargeLoadLatest } from "@/lib/api";
import { buildZoneCards, ZONES } from "@/lib/zones";
import { ZoneCard } from "@/components/ZoneCard";
import type { ZoneStat } from "@/lib/api";

export const metadata: Metadata = {
  title: "Zone Scorecards | ERCOT Large Load Tracker",
  description:
    "Large-Load Queue, generation-side Full Process, and Settlement Zone stress per CDR Zone, with a Zone Scorecard Mark (A–D).",
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
        <span className="eyebrow">Zone Scorecards</span>
        <h1 className="hero-title">Which CDR Zones can absorb Large Load</h1>
        <p className="hero-desc">
          Each card mixes three datasets and says which geography it actually has (LLWG Split,
          CDR Zone, Settlement Zone). The Mark is a simple average rank, not a Clearance Band.
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
          ERCOT splits the grid into CDR Zones, Settlement Zones, and LLWG Splits. They don&apos;t
          always line up. When a card says a number isn&apos;t available, that&apos;s real, not a bug. See{" "}
          <a href="/methodology">methodology</a>.
        </span>
      </div>
    </>
  );
}
