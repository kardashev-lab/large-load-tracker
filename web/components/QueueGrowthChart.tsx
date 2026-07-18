"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthLabel } from "@/lib/format";

type Point = {
  month: string;
  colocated: number | null;
  standalone: number | null;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const colocated = payload.find((p: any) => p.dataKey === "colocated")?.value ?? 0;
  const standalone = payload.find((p: any) => p.dataKey === "standalone")?.value ?? 0;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eaeaea",
        borderRadius: 6,
        padding: "10px 12px",
        fontSize: 12,
        fontFamily: "var(--font-sans)",
        boxShadow: "0 8px 24px rgba(47,52,55,0.12)",
      }}
    >
      <div style={{ color: "#6b6863", marginBottom: 6 }}>{monthLabel(label)}</div>
      <div style={{ color: "#2f3437", fontWeight: 600 }}>
        {(colocated + standalone).toLocaleString("en-US", { maximumFractionDigits: 0 })} MW total
      </div>
      <div style={{ color: "#5f5c58" }}>
        {standalone.toLocaleString("en-US", { maximumFractionDigits: 0 })} standalone
      </div>
      <div style={{ color: "#d3801a" }}>
        {colocated.toLocaleString("en-US", { maximumFractionDigits: 0 })} co-located
      </div>
    </div>
  );
}

export function QueueGrowthChart({ points }: { points: Point[] }) {
  if (!points.length) {
    return <div className="chart-container chart-empty">No history available.</div>;
  }
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="standaloneFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#787774" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#787774" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="colocatedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffb020" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#ffb020" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eaeaea" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={monthLabel}
            stroke="#6b6863"
            tick={{ fontSize: 11, fontFamily: "var(--font-sans)" }}
            tickLine={false}
            axisLine={{ stroke: "#eaeaea" }}
            minTickGap={40}
          />
          <YAxis
            stroke="#6b6863"
            tick={{ fontSize: 11, fontFamily: "var(--font-sans)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="standalone"
            stackId="1"
            stroke="#9a9793"
            fill="url(#standaloneFill)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="colocated"
            stackId="1"
            stroke="#d3801a"
            fill="url(#colocatedFill)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
