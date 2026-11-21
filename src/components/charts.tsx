import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryStat, RegionSeriesPoint, SeveritySlice, TrendPoint } from "../lib/types";

const axis = {
  stroke: "#c3d3ea",
  tick: { fill: "#526181", fontSize: 11.5 },
};

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#dbe4f6] bg-white/95 px-2.5 py-2 shadow-xl backdrop-blur">
      {label !== undefined && (
        <p className="mb-1 font-mono text-[12px] uppercase tracking-wider text-[#7183a8]">
          {label}
        </p>
      )}
      {payload.map((entry: any) => (
        <p key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-[12.5px]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: entry.color ?? entry.payload?.color ?? "#38bdf8" }}
          />
          <span className="text-[#7183a8]">{entry.name}</span>
          <span className="tabular ml-auto pl-3 font-bold text-[#0b1220]">
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function SeverityDonut({
  data,
  total,
  centerLabel,
  height = 168,
}: {
  data: SeveritySlice[];
  total: string;
  centerLabel: string;
  height?: number;
}) {
  const size = Math.max(110, height);
  return (
    <div className="relative flex justify-center" style={{ height }}>
      <PieChart width={size} height={size}>
        <Tooltip content={<ChartTooltip />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={height * 0.32}
          outerRadius={height * 0.44}
          paddingAngle={3}
          stroke="none"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-[19px] font-extrabold text-[#0b1220]">{total}</span>
        <span className="text-[11px] uppercase tracking-[0.16em] text-[#7183a8]">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

export function SeverityLegend({ data }: { data: SeveritySlice[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
      {data.map((d) => (
        <div key={d.name} className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12px] text-[#5b6b8c]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
            {d.name}
          </span>
          <span className="tabular text-[12px] font-semibold text-[#334155]">{d.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function TrendAreaChart({
  data,
  height = 190,
}: {
  data: TrendPoint[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="gPhish" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gQr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gFake" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e3ebf9" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" {...axis} tickLine={false} axisLine={false} interval={2} />
          <YAxis {...axis} tickLine={false} axisLine={false} width={44} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#38bdf8", strokeOpacity: 0.25 }} />
          <Area
            type="monotone"
            dataKey="phishing"
            name="Phishing links"
            stroke="#38bdf8"
            strokeWidth={1.8}
            fill="url(#gPhish)"
          />
          <Area
            type="monotone"
            dataKey="quishing"
            name="Quishing"
            stroke="#f97316"
            strokeWidth={1.5}
            fill="url(#gQr)"
          />
          <Area
            type="monotone"
            dataKey="fakeSites"
            name="Fake sites"
            stroke="#a78bfa"
            strokeWidth={1.5}
            fill="url(#gFake)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBars({
  data,
  height = 190,
  horizontal = false,
}: {
  data: CategoryStat[];
  height?: number;
  horizontal?: boolean;
}) {
  if (horizontal) {
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="#e3ebf9" strokeDasharray="3 4" horizontal={false} />
            <XAxis type="number" {...axis} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              {...axis}
              width={110}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(56,189,248,0.05)" }} />
            <Bar dataKey="value" name="Reports" radius={[0, 4, 4, 0]} barSize={11}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="#e3ebf9" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="name" {...axis} tickLine={false} axisLine={false} interval={0} />
          <YAxis {...axis} tickLine={false} axisLine={false} width={44} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(56,189,248,0.05)" }} />
          <Bar dataKey="value" name="Reports" radius={[4, 4, 0, 0]} barSize={16}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RegionLines({
  data,
  height = 190,
}: {
  data: RegionSeriesPoint[];
  height?: number;
}) {
  const lines: { key: keyof Omit<RegionSeriesPoint, "day">; color: string }[] = [
    { key: "APAC", color: "#38bdf8" },
    { key: "AMER", color: "#60a5fa" },
    { key: "EMEA", color: "#818cf8" },
    { key: "LATAM", color: "#a78bfa" },
    { key: "AFRICA", color: "#34d399" },
  ];
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="#e3ebf9" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="day" {...axis} tickLine={false} axisLine={false} />
          <YAxis {...axis} tickLine={false} axisLine={false} width={44} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#38bdf8", strokeOpacity: 0.2 }} />
          {lines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.key}
              stroke={l.color}
              strokeWidth={1.6}
              dot={false}
              activeDot={{ r: 2.5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeverityRadar({ data }: { data: SeveritySlice[] }) {
  const radarData = data.map((d) => ({ subject: d.name, value: d.value }));
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} outerRadius="72%">
          <PolarGrid stroke="#dbe4f6" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#526181", fontSize: 11.5 }} />
          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 45]} />
          <Radar
            name="Severity"
            dataKey="value"
            stroke="#ff8a1e"
            fill="#ff8a1e"
            fillOpacity={0.18}
            strokeWidth={1.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RadialGauge({
  value,
  max,
  label,
  sublabel,
  accent = "#ef4444",
}: {
  value: number;
  max: number;
  label: string;
  sublabel: string;
  accent?: string;
}) {
  const size = 92;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, value / Math.max(1, max));
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e8eefb"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - stroke - 3}
            fill="none"
            stroke="#f59e0b"
            strokeOpacity={0.35}
            strokeWidth={2}
            strokeDasharray={`${circumference * 0.4} ${circumference}`}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * pct} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-[16px] font-extrabold text-[#0b1220]">
            {value.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
      <p className="mt-1.5 text-[12px] font-semibold text-[#334155]">{label}</p>
      <p className="text-[11px] text-[#93a2bf]">{sublabel}</p>
    </div>
  );
}

export function MiniSpark({
  values,
  color = "#38bdf8",
  height = 30,
  width = 88,
}: {
  values: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * width;
      const y = height - ((v - min) / span) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.4} opacity={0.9} />
    </svg>
  );
}
