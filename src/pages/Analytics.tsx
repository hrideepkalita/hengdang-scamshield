import { useMemo, useState } from "react";
import {
  Activity,
  Ban,
  Bug,
  Crosshair,
  Filter,
  Network,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThreatData } from "../lib/data";
import { useI18n } from "../lib/i18n";
import { Badge, Panel, SectionHeading, Segmented, StatCard } from "../components/ui";
import {
  CategoryBars,
  ChartTooltip,
  MiniSpark,
  RadialGauge,
  SeverityRadar,
} from "../components/charts";
import { compact, fullNumber, severityMeta, timeAgo } from "../lib/format";

const detection = [
  { name: "Confirmed threats", value: 46, color: "#22d3ee" },
  { name: "Blocked automatically", value: 28, color: "#34d399" },
  { name: "False positives", value: 26, color: "#f5c542" },
];

const breakdown = [
  { name: "Phishing", value: 184, color: "#ef4444" },
  { name: "Quishing", value: 118, color: "#3b82f6" },
  { name: "Fake site", value: 96, color: "#38bdf8" },
  { name: "Smishing", value: 84, color: "#60a5fa" },
  { name: "Investment", value: 71, color: "#818cf8" },
  { name: "Job scam", value: 58, color: "#a78bfa" },
  { name: "Lottery", value: 42, color: "#c084fc" },
  { name: "Tech support", value: 33, color: "#f472b6" },
  { name: "Malware", value: 24, color: "#fb7185" },
  { name: "Other", value: 16, color: "#94a3b8" },
];

const attackLog = [
  { title: "Credential harvesting kit", from: "US", to: "IN", sev: "critical" as const, time: "10:12:01" },
  { title: "Cloned payment gateway", from: "UK", to: "IN", sev: "high" as const, time: "10:11:48" },
  { title: "QR sticker overlay", from: "AE", to: "IN", sev: "high" as const, time: "10:09:22" },
  { title: "Parcel smishing wave", from: "SG", to: "IN", sev: "medium" as const, time: "10:07:11" },
  { title: "Investment platform clone", from: "ID", to: "IN", sev: "critical" as const, time: "10:04:57" },
];

export default function Analytics() {
  const { t } = useI18n();
  const { data } = useThreatData();
  const [range, setRange] = useState<"today" | "24h" | "7d">("24h");
  const [region, setRegion] = useState("all");
  const [severity, setSeverity] = useState("all");

  const trendData = useMemo(() => {
    if (range === "today") return data.hourlyTrend.slice(-12);
    if (range === "7d")
      return data.regionSeries.map((d) => {
        const total = d.APAC + d.EMEA + d.AMER + d.LATAM + d.AFRICA;
        return {
          label: d.day,
          phishing: Math.round(total * 0.58),
          quishing: Math.round(total * 0.27),
          fakeSites: Math.round(total * 0.15),
        };
      });
    return data.hourlyTrend;
  }, [data.hourlyTrend, data.regionSeries, range]);

  const affectedRegions = useMemo(() => {
    const rows = [...data.countries].sort((a, b) => b.reports - a.reports);
    const filtered =
      region === "all"
        ? rows
        : rows.filter((r) => {
            if (region === "apac")
              return [
                "India",
                "Indonesia",
                "Pakistan",
                "Bangladesh",
                "Philippines",
                "Vietnam",
                "China",
                "Thailand",
                "Malaysia",
                "Australia",
                "Japan",
                "South Korea",
                "Singapore",
              ].includes(r.name);
            if (region === "emea")
              return [
                "United Kingdom",
                "Germany",
                "France",
                "Spain",
                "Italy",
                "Netherlands",
                "United Arab Emirates",
                "Saudi Arabia",
                "South Africa",
                "Kenya",
                "Egypt",
                "Turkey",
                "Russia",
                "Ukraine",
                "Sweden",
                "Ireland",
                "Poland",
              ].includes(r.name);
            return [
              "United States of America",
              "Canada",
              "Brazil",
              "Mexico",
              "Colombia",
              "Argentina",
              "Chile",
              "Peru",
            ].includes(r.name);
          });
    return filtered.slice(0, 6);
  }, [data.countries, region]);

  const filteredFeed = useMemo(() => {
    if (severity === "all") return data.feed;
    return data.feed.filter((f) => f.severity === severity);
  }, [data.feed, severity]);

  const kpis = [
    {
      icon: ShieldAlert,
      label: "Total threats",
      value: compact(data.overview.totalReports),
      delta: "+12.4%",
      hint: "vs prior period",
      accent: "#38bdf8",
    },
    {
      icon: Bug,
      label: "Malicious payloads",
      value: "1,870",
      delta: "+6.1%",
      hint: "quarantined",
      accent: "#a78bfa",
    },
    {
      icon: Ban,
      label: "Blocked requests",
      value: compact(data.overview.blockedTraffic),
      delta: "99.4%",
      hint: "filter rate",
      accent: "#34d399",
    },
    {
      icon: Activity,
      label: "Anomalous traffic",
      value: "3,210",
      delta: "-2.8%",
      hint: "events flagged",
      accent: "#f97316",
    },
    {
      icon: Network,
      label: "IPs blocked",
      value: "3,120",
      delta: "+218",
      hint: "unique addresses",
      accent: "#ef4444",
    },
  ];

  return (
    <div className="space-y-3">
      <SectionHeading
        title={t("an.title")}
        subtitle={t("an.sub")}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              options={[
                { value: "today", label: "Today" },
                { value: "24h", label: "Last 24 hours" },
                { value: "7d", label: "Date range" },
              ]}
              value={range}
              onChange={setRange}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#dbe4f6] bg-[#f7faff] px-3 py-2">
        <Filter size={12} className="text-[#7183a8]" />
        <span className="text-[12px] uppercase tracking-[0.14em] text-[#7183a8]">
          Scope
        </span>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border border-[#dbe4f6] bg-[#f7faff] px-2 py-1 text-[12px] text-[#334155] outline-none focus:border-[#2563eb]"
        >
          <option value="all">Region: All</option>
          <option value="apac">Region: APAC</option>
          <option value="emea">Region: EMEA</option>
          <option value="amer">Region: AMER</option>
        </select>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-md border border-[#dbe4f6] bg-[#f7faff] px-2 py-1 text-[12px] text-[#334155] outline-none focus:border-[#2563eb]"
        >
          <option value="all">Severity: All</option>
          <option value="critical">Severity: Critical</option>
          <option value="high">Severity: High</option>
          <option value="medium">Severity: Medium</option>
        </select>
        <span className="ml-auto flex items-center gap-1.5 text-[12px] text-[#16a34a]">
          <span className="live-dot" /> telemetry streaming
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* LEFT */}
        <div className="flex flex-col gap-3 xl:col-span-3">
          <Panel
            title="Threat severity"
            subtitle="Share of attributable reports"
            action={<Badge tone="orange">Dynamic</Badge>}
          >
            <div className="px-2 pt-2">
              <SeverityRadar data={data.severity} />
              <div className="grid grid-cols-2 gap-2 px-2 pb-3">
                {data.severity.map((s) => (
                  <div
                    key={s.name}
                    className="rounded-md border border-[#eef2fb] bg-[#f7faff] px-2 py-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-[#7183a8]">
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: s.color }}
                        />
                        {s.name}
                      </span>
                      <span className="tabular text-[12.5px] font-semibold text-[#0b1220]">
                        {s.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Detection accuracy" subtitle="Outcome of analysed reports">
            <div className="relative px-2 pb-1 pt-2">
              <div className="flex h-[176px] justify-center">
                <PieChart width={176} height={176}>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie
                    data={detection}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={82}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {detection.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-3">
                <span className="tabular text-[19px] font-semibold text-[#0b1220]">97.2%</span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-[#7183a8]">
                  precision
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pb-2">
                {detection.map((d) => (
                  <span
                    key={d.name}
                    className="flex items-center gap-1.5 text-[11px] text-[#7183a8]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Analyst triage queue" subtitle="Oldest unresolved critical items">
            <div className="divide-y divide-[#eef2fb]">
              {filteredFeed.slice(0, 4).map((f) => (
                <div key={f.id} className="px-3 py-2">
                  <p className="line-clamp-1 text-[12px] text-[#334155]">{f.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className="text-[11px] uppercase tracking-wider"
                      style={{ color: severityMeta[f.severity].color }}
                    >
                      {f.severity}
                    </span>
                    <span className="font-mono text-[11px] text-[#93a2bf]">
                      {timeAgo(f.time)}
                    </span>
                    <span className="ml-auto text-[11px] text-[#93a2bf]">{f.region}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* CENTRE */}
        <div className="xl:col-span-6">
          <Panel
            className="h-full"
            title="Attack activity"
            subtitle="Live attack log, affected regions and correlation volume"
            action={
              <span className="flex items-center gap-2">
                <MiniSpark
                  values={data.hourlyTrend.map((t) => t.phishing)}
                  color="#38bdf8"
                  width={64}
                  height={20}
                />
                <Badge tone="sky">Live</Badge>
              </span>
            }
          >
            <div className="grid gap-2 p-2 sm:grid-cols-2">
              <div className="rounded-lg border border-[#eef2fb] bg-[#f7faff]">
                <div className="flex items-center justify-between border-b border-[#eef2fb] px-2.5 py-1.5">
                  <span className="text-[12px] font-semibold text-[#334155]">Attacks</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-[#93a2bf]">
                    <span className="live-dot" /> current
                  </span>
                </div>
                <div className="divide-y divide-[#eef2fb]">
                  {attackLog.map((a) => (
                    <div key={a.title} className="flex items-center gap-2 px-2.5 py-1.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: severityMeta[a.sev].color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] text-[#334155]">{a.title}</p>
                        <p className="font-mono text-[11px] text-[#93a2bf]">{a.time}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] text-[#7183a8]">
                        {a.from}
                        <span className="mx-0.5 text-[#b7c8e4]">→</span>
                        {a.to}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#eef2fb] bg-[#f7faff]">
                <div className="flex items-center justify-between border-b border-[#eef2fb] px-2.5 py-1.5">
                  <span className="text-[12px] font-semibold text-[#334155]">
                    Top affected regions
                  </span>
                  <span className="font-mono text-[11px] text-[#93a2bf]">By reports</span>
                </div>
                <div className="divide-y divide-[#eef2fb]">
                  {affectedRegions.slice(0, 5).map((r, i) => (
                    <div key={r.name} className="flex items-center gap-2 px-2.5 py-1.5">
                      <span className="w-3 font-mono text-[11px] text-[#93a2bf]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-[11px] text-[#334155]">
                        {r.name}
                      </p>
                      <span className="tabular text-[11px] text-[#5b6b8c]">
                        {compact(r.reports)}
                      </span>
                      <span
                        className="h-1 w-8 overflow-hidden rounded-full bg-[#e8eefb]"
                        aria-hidden
                      >
                        <span
                          className="block h-full rounded-full bg-[#2563eb]/70"
                          style={{
                            width: `${Math.max(8, (r.reports / affectedRegions[0].reports) * 100)}%`,
                          }}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-4">
              {[
                { label: "Campaigns", value: data.overview.activeCampaigns.toString(), hint: "active" },
                { label: "Indicators", value: "12.4K", hint: "tracked" },
                { label: "Correlation", value: "87%", hint: "confidence" },
                { label: "MTTR", value: "14m", hint: "median" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-md border border-[#eef2fb] bg-[#f7faff] px-2 py-1.5"
                >
                  <p className="text-[11px] uppercase tracking-wider text-[#93a2bf]">
                    {m.label}
                  </p>
                  <p className="tabular text-[13.5px] font-semibold text-[#0b1220]">{m.value}</p>
                  <p className="text-[11px] text-[#93a2bf]">{m.hint}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-3 xl:col-span-3">
          <Panel
            title="Threat trends over time"
            subtitle="Reported events by vector"
            action={<Badge tone="sky">24h</Badge>}
          >
            <div className="px-1.5 pb-2 pt-3">
              <div className="h-[168px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#e3ebf9" strokeDasharray="3 4" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#526181", fontSize: 10.5 }}
                      stroke="#c3d3ea"
                      tickLine={false}
                      axisLine={false}
                      interval={Math.max(0, Math.floor(trendData.length / 6) - 1)}
                    />
                    <YAxis
                      tick={{ fill: "#526181", fontSize: 10.5 }}
                      stroke="#c3d3ea"
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="phishing" name="Phishing" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="quishing" name="Quishing" stroke="#f97316" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="fakeSites" name="Fake site" stroke="#a78bfa" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 px-2">
                {[
                  ["#38bdf8", "Phishing"],
                  ["#f97316", "Quishing"],
                  ["#a78bfa", "Fake site"],
                ].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-1.5 text-[11px] text-[#7183a8]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </Panel>

          <Panel
            title="Threat breakdown"
            subtitle="Normalised event counts"
            action={
              <span className="flex items-center gap-1 text-[11px] text-[#7183a8]">
                <TrendingUp size={10} /> 24h
              </span>
            }
          >
            <div className="px-1.5 pb-2 pt-2">
              <CategoryBars data={breakdown} height={208} horizontal />
            </div>
          </Panel>

          <Panel title="Affected systems & severity" subtitle="Assets under active investigation">
            <div className="grid grid-cols-2 gap-y-3 px-2 py-3 sm:grid-cols-4 xl:grid-cols-2">
              <RadialGauge value={450} max={520} label="Users" sublabel="Investigating" accent="#ef4444" />
              <RadialGauge value={150} max={220} label="Endpoints" sublabel="Blocked" accent="#f97316" />
              <RadialGauge value={15} max={40} label="Servers" sublabel="Mitigated" accent="#f5c542" />
              <RadialGauge value={8} max={20} label="Network devices" sublabel="Unlinked" accent="#38bdf8" />
            </div>
            <div className="flex items-center justify-between border-t border-[#eef2fb] px-3 py-2 text-[11px] text-[#7183a8]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={11} className="text-[#16a34a]/80" />
                97.2% containment
              </span>
              <span className="font-mono text-[#93a2bf]">SOC-2 controls</span>
            </div>
          </Panel>
        </div>
      </div>

      {/* Regional table */}
      <Panel
        title="Regional activity breakdown"
        subtitle="Aggregated reports, verification coverage and dominant category"
        action={<Badge tone="slate">Top {affectedRegions.length}</Badge>}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[#dbe4f6] text-[11px] uppercase tracking-[0.14em] text-[#93a2bf]">
                <th className="px-3 py-2 font-medium">Region</th>
                <th className="px-3 py-2 font-medium">Reports</th>
                <th className="px-3 py-2 font-medium">Verified</th>
                <th className="px-3 py-2 font-medium">Dominant category</th>
                <th className="px-3 py-2 font-medium">Heat</th>
                <th className="px-3 py-2 text-right font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {affectedRegions.map((r) => (
                <tr
                  key={r.name}
                  className="border-b border-[#eef2fb] text-[12px] transition hover:bg-[#f4f8ff]"
                >
                  <td className="px-3 py-2 text-[#334155]">{r.name}</td>
                  <td className="tabular px-3 py-2 text-[#334155]">{fullNumber(r.reports)}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1 w-12 overflow-hidden rounded-full bg-[#e8eefb]">
                        <span
                          className="block h-full rounded-full bg-emerald-400/80"
                          style={{ width: `${r.verifiedShare * 100}%` }}
                        />
                      </span>
                      <span className="tabular text-[#5b6b8c]">
                        {Math.round(r.verifiedShare * 100)}%
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[#5b6b8c]">{r.topCategory}</td>
                  <td className="px-3 py-2">
                    <Badge
                      tone={
                        r.level === "high"
                          ? "red"
                          : r.level === "elevated"
                            ? "orange"
                            : r.level === "lower"
                              ? "amber"
                              : "slate"
                      }
                    >
                      {r.level}
                    </Badge>
                  </td>
                  <td className="tabular px-3 py-2 text-right text-[#5b6b8c]">
                    {((r.reports / data.overview.totalReports) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-1 border-t border-[#eef2fb] px-3 py-2 text-[11px] text-[#93a2bf] sm:flex-row sm:justify-between">
          <span className="flex items-center gap-1.5">
            <Crosshair size={10} /> Counts represent reporting volume, not crime incidence.
          </span>
          <span className="font-mono">{data.source}</span>
        </div>
      </Panel>
    </div>
  );
}
