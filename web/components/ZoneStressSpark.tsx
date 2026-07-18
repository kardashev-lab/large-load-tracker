"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { ZoneStat } from "@/lib/api";

export function ZoneStressSpark({ months }: { months: ZoneStat[] }) {
  if (!months.length) {
    return <div className="spark-empty">No LMP zone match</div>;
  }
  const data = months.map((m) => ({
    month: m.month,
    negative: (m.pct_hours_rt_negative ?? 0) * 100,
  }));
  return (
    <div className="spark-container">
      <ResponsiveContainer width="100%" height={36}>
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line type="monotone" dataKey="negative" stroke="#ffb020" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
