"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  label: string;
  value: number;
}

const tickStyle = { fill: "var(--color-muted-foreground)", fontSize: 10 };
const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-popover-foreground)",
};

export function MiniBarChart({ data, valuePrefix = "" }: { data: Point[]; valuePrefix?: string }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={tickStyle}
          />
          <YAxis tickLine={false} axisLine={false} width={28} tick={tickStyle} />
          <Tooltip
            cursor={{ fill: "var(--color-muted)" }}
            contentStyle={tooltipStyle}
            formatter={(value) => [`${valuePrefix}${value}`, ""]}
          />
          <Bar dataKey="value" fill="var(--color-brand-emerald-700)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniLineChart({ data, valuePrefix = "" }: { data: Point[]; valuePrefix?: string }) {
  const gradientId = useId();

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-brand-bronze-400)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-brand-bronze-400)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={tickStyle}
          />
          <YAxis tickLine={false} axisLine={false} width={28} tick={tickStyle} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`${valuePrefix}${value}`, ""]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-brand-bronze-600)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={segments.length > 1 ? 2 : 0}
              stroke="none"
            >
              {segments.map((s, i) => (
                <Cell key={i} fill={s.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-foreground">{total}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-medium tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
