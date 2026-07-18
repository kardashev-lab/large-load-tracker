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
          Three datasets, three granularities, combined honestly rather than forced together: the
          large-load queue&apos;s own coarse west/north/other split, generator-side interconnection
          timelines at full CDR-zone granularity, and an LMP-derived price stress proxy at the
          settlement-point level. The grade on each card is a transparent average rank — formula
          printed on every card, no hidden weighting.
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
          These are three different zone taxonomies that don&apos;t map 1:1 — ERCOT&apos;s load-side
          reporting, generator-side CDR reporting zones, and settlement-point pricing zones all carve
          up the grid differently. Where a card says a dataset doesn&apos;t apply, that&apos;s a real
          granularity mismatch, not a missing-data bug. See <a href="/methodology">methodology</a>.
        </span>
      </div>
    </>
  );
}
