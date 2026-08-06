"use client";

import { useMemo, useState, type MouseEvent } from "react";
import {
  AreaSeries,
  Axis,
  ChartFrame,
  ChartTooltip,
  LineSeries,
  closestIndex,
  clientToViewBoxX,
  createLinearScales,
  padDomain,
} from "kardashev-charts";
import { monthLabel } from "@/lib/format";

type Point = {
  month: string;
  colocated: number | null;
  standalone: number | null;
};

export function QueueGrowthChart({ points }: { points: Point[] }) {
  if (!points.length) {
    return <div className="chart-container chart-empty">No history available.</div>;
  }

  return (
    <div className="chart-container">
      <ChartFrame height={300} theme="paper" minWidth={60}>
        {(size) => <QueueGrowthInner points={points} width={size.width} height={size.height} />}
      </ChartFrame>
    </div>
  );
}

function QueueGrowthInner({
  points,
  width,
  height,
}: {
  points: Point[];
  width: number;
  height: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const padding = { top: 8, right: 8, bottom: 28, left: 44 };

  const { scales, xs, stacks, yTicks, xTicks } = useMemo(() => {
    const n = points.length;
    const totals = points.map((p) => (p.standalone ?? 0) + (p.colocated ?? 0));
    const maxY = Math.max(...totals, 0);
    const [, hi] = padDomain(0, maxY, 0.05);
    const scales = createLinearScales({
      width,
      height,
      xDomain: [0, Math.max(n - 1, 1)],
      yDomain: [0, hi],
      padding,
    });
    const xs = points.map((_, i) => scales.x(i));
    const stacks = points.map((p, i) => {
      const standalone = p.standalone ?? 0;
      const colocated = p.colocated ?? 0;
      return {
        x: scales.x(i),
        yStandalone: scales.y(standalone),
        yTotal: scales.y(standalone + colocated),
      };
    });
    const tickCount = Math.min(5, n);
    const xTicks = Array.from({ length: tickCount }, (_, i) => {
      const idx = tickCount === 1 ? 0 : Math.round((i / (tickCount - 1)) * (n - 1));
      return { value: idx, label: monthLabel(points[idx].month) };
    });
    const yTicks = [0, hi / 2, hi].map((v) => ({
      value: v,
      label: `${(v / 1000).toFixed(0)}k`,
    }));
    return { scales, xs, stacks, yTicks, xTicks };
  }, [points, width, height]);

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const px = clientToViewBoxX(e.currentTarget, e.clientX, width);
    setHover(closestIndex(xs, px));
  };

  const h = hover != null ? points[hover] : null;
  const hs = hover != null ? stacks[hover] : null;

  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
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
        <Axis
          x={scales.x}
          y={scales.y}
          width={width}
          height={height}
          padding={padding}
          theme="paper"
          xTicks={xTicks}
          yTicks={yTicks}
          showGrid
        />
        {/* total with amber (colocated) fill, then gray standalone covers the bottom */}
        <AreaSeries
          points={stacks.map((s) => ({ x: s.x, y: s.yTotal }))}
          y0={scales.y(0)}
          fill="url(#colocatedFill)"
          fillOpacity={1}
          curve="monotone"
        />
        <AreaSeries
          points={stacks.map((s) => ({ x: s.x, y: s.yStandalone }))}
          y0={scales.y(0)}
          fill="url(#standaloneFill)"
          fillOpacity={1}
          stroke="#4a4c4f"
          strokeWidth={2}
          curve="monotone"
        />
        <LineSeries
          points={stacks.map((s) => ({ x: s.x, y: s.yTotal }))}
          stroke="#17181a"
          strokeWidth={2}
          curve="monotone"
        />
        {hs && (
          <line
            x1={hs.x}
            x2={hs.x}
            y1={padding.top}
            y2={height - padding.bottom}
            stroke="#17181a"
            strokeOpacity={0.25}
          />
        )}
      </svg>
      {h && hs && (
        <div
          style={{
            position: "absolute",
            left: Math.min(hs.x + 8, width - 180),
            top: padding.top,
          }}
        >
          <ChartTooltip theme="paper">
            <div style={{ color: "#82817b", marginBottom: 6 }}>{monthLabel(h.month)}</div>
            <div style={{ color: "#17181a", fontWeight: 700 }}>
              {((h.colocated ?? 0) + (h.standalone ?? 0)).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}{" "}
              MW total
            </div>
            <div style={{ color: "#4a4c4f" }}>
              {(h.standalone ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} standalone
            </div>
            <div style={{ color: "#8a6200" }}>
              {(h.colocated ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} co-located
            </div>
          </ChartTooltip>
        </div>
      )}
    </div>
  );
}
