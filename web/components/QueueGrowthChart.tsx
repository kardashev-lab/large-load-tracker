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
        border: "2px solid #17181a",
        padding: "10px 12px",
        fontSize: 12,
        fontFamily: "var(--font-mono)",
      }}
    >
      <div style={{ color: "#82817b", marginBottom: 6 }}>{monthLabel(label)}</div>
      <div style={{ color: "#17181a", fontWeight: 700 }}>
        {(colocated + standalone).toLocaleString("en-US", { maximumFractionDigits: 0 })} MW total
      </div>
      <div style={{ color: "#4a4c4f" }}>
        {standalone.toLocaleString("en-US", { maximumFractionDigits: 0 })} standalone
      </div>
      <div style={{ color: "#8a6200" }}>
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
              <stop offset="0%" stopColor="#82817b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#82817b" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="colocatedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffb020" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#ffb020" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ddd9cf" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={monthLabel}
            stroke="#82817b"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "#17181a" }}
            minTickGap={40}
          />
          <YAxis
            stroke="#82817b"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
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
            stroke="#4a4c4f"
            fill="url(#standaloneFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="colocated"
            stackId="1"
            stroke="#17181a"
            fill="url(#colocatedFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
