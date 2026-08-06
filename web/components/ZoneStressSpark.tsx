"use client";

import { Sparkline } from "kardashev-charts";
import type { ZoneStat } from "@/lib/api";

export function ZoneStressSpark({ months }: { months: ZoneStat[] }) {
  if (!months.length) {
    return <div className="spark-empty">No LMP zone match</div>;
  }
  const values = months.map((m) => (m.pct_hours_rt_negative ?? 0) * 100);
  return (
    <div className="spark-container">
      <Sparkline values={values} width={120} height={36} color="#ffb020" fillOpacity={0.25} />
    </div>
  );
}
