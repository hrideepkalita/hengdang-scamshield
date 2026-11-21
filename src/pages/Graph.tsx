import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Crosshair,
  FileText,
  Focus,
  Globe2,
  Maximize2,
  Minus,
  Network,
  Plus,
  Search,
  Server,
  Settings,
  ShieldBan,
  Shrink,
  X,
} from "lucide-react";
import { useThreatData } from "../lib/data";
import { useI18n } from "../lib/i18n";
import { Badge, Panel, SectionHeading } from "../components/ui";
import { reputationMeta } from "../lib/format";
import type { GraphNode } from "../lib/types";

const W = 1080;
const H = 700;
const CX = W / 2;
const CY = H / 2;

const kindIcon = {
  hash: Settings,
  cert: FileText,
  asset: Server,
  domain: Globe2,
  ip: Network,
} as const;

const legend: { key: string; label: string }[] = [
  { key: "malicious", label: "Malicious" },
  { key: "suspicious", label: "Suspicious" },
  { key: "common", label: "Common" },
  { key: "unknown", label: "Unknown" },
  { key: "clean", label: "Clean" },
  { key: "asset", label: "Asset" },
];

const riskFor = (rep: GraphNode["reputation"]) =>
  rep === "malicious" ? 94 : rep === "suspicious" ? 71 : rep === "common" ? 44 : rep === "unknown" ? 22 : rep === "asset" ? 0 : 3;

export default function Graph() {
  const { t } = useI18n();
  const { data } = useThreatData();
  const [selected, setSelected] = useState<string | null>("67.215.92.210");
  const [query, setQuery] = useState("");
  const [enabled, setEnabled] = useState<string[]>(legend.map((l) => l.key));
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const panFrameRef = useRef<number | null>(null);
  const panTargetRef = useRef<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [blocked, setBlocked] = useState<string[]>([]);

  const { nodes, edges } = data.graph;

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    const center = nodes.find((n) => n.id === "67.215.92.210") ?? nodes[0];
    if (!center) return map;
    map.set(center.id, { x: CX, y: CY });

    const orbit = nodes.filter((n) => n.id !== center.id && (n.kind === "hash" || n.kind === "cert"));
    const outer = nodes.filter(
      (n) => n.id !== center.id && n.kind !== "hash" && n.kind !== "cert",
    );

    orbit.forEach((n, i) => {
      const angle = (i / Math.max(1, orbit.length)) * Math.PI * 2 - Math.PI / 2;
      const radius = 218 + ((i * 37) % 26);
      map.set(n.id, {
        x: CX + Math.cos(angle) * radius,
        y: CY + Math.sin(angle) * radius,
      });
    });

    const outerSpots = [
      { x: CX + 430, y: CY - 222 },
      { x: CX + 470, y: CY - 130 },
      { x: CX + 386, y: CY - 46 },
      { x: CX + 442, y: CY + 128 },
      { x: CX + 336, y: CY + 214 },
    ];
    outer.forEach((n, i) => {
      const spot = outerSpots[i % outerSpots.length];
      map.set(n.id, { x: spot.x, y: spot.y + (i >= outerSpots.length ? (i - outerSpots.length) * 60 : 0) });
    });

    return map;
  }, [nodes]);

  const selectedNode = nodes.find((n) => n.id === selected) ?? null;

  const connections = useMemo(
    () =>
      selected
        ? edges
            .filter((e) => e.source === selected || e.target === selected)
            .map((e) => {
              const otherId = e.source === selected ? e.target : e.source;
              const node = nodes.find((n) => n.id === otherId);
              return node ? { edge: e, node } : null;
            })
            .filter((v): v is { edge: (typeof edges)[number]; node: GraphNode } => v !== null)
        : [],
    [edges, nodes, selected],
  );

  const zoomAt = useCallback((factor: number, px = CX, py = CY) => {
    setView((v) => {
      const k = Math.min(3.2, Math.max(0.55, v.k * factor));
      const ratio = k / v.k;
      return {
        k,
        x: px - (px - v.x) * ratio,
        y: py - (py - v.y) * ratio,
      };
    });
  }, []);

  useEffect(
    () => () => {
      if (panFrameRef.current !== null) cancelAnimationFrame(panFrameRef.current);
    },
    [],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(
        e.deltaY < 0 ? 1.14 : 1 / 1.14,
        ((e.clientX - rect.left) / rect.width) * W,
        ((e.clientY - rect.top) / rect.height) * H,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const toggleRep = (key: string) =>
    setEnabled((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const enabledSet = useMemo(() => new Set(enabled), [enabled]);
  const normalizedQuery = query.trim().toLowerCase();
  const isDim = (n: GraphNode) => {
    if (!enabledSet.has(n.reputation)) return true;
    if (normalizedQuery && !n.label.toLowerCase().includes(normalizedQuery)) return true;
    return false;
  };

  const highlightedNeighbours = new Set([selected, ...connections.map((c) => c.node.id)]);
  const centerNode = nodes.find((n) => n.id === "67.215.92.210");

  return (
    <div className="space-y-3">
      <SectionHeading
        title={t("graph.title")}
        subtitle={t("graph.sub")}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="sky">{nodes.length} nodes</Badge>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1.5 rounded-md border border-[#dbe4f6] bg-[#eef3fb] px-2.5 py-1.5 text-[12px] text-[#334155] transition hover:text-[#2563eb]"
            >
              {expanded ? <Shrink size={12} /> : <Maximize2 size={12} />}
              {expanded ? "Exit full screen" : "Full screen"}
            </button>
          </div>
        }
      />

      <div className={`grid grid-cols-1 gap-3 ${expanded ? "" : "xl:grid-cols-12"}`}>
        <div className={expanded ? "" : "xl:col-span-9"}>
          <Panel
            className="h-full"
            bodyClassName="flex flex-col"
            title="Campaign graph"
            subtitle="Radial layout · hover to trace · click an indicator for evidence"
            action={
              <div className="flex items-center gap-1.5">
                <div className="hidden items-center gap-1.5 rounded-md border border-[#dbe4f6] bg-[#f7faff] px-2 py-1 sm:flex">
                  <Search size={11} className="text-[#7183a8]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter indicators"
                    className="w-[112px] bg-transparent text-[12px] text-[#334155] placeholder:text-[#93a2bf] focus:outline-none"
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery("")} aria-label="Clear filter">
                      <X size={10} className="text-[#7183a8]" />
                    </button>
                  )}
                </div>
                <Badge tone="slate">{connections.length} links</Badge>
              </div>
            }
          >
            <div className="flex flex-wrap gap-1.5 border-b border-[#eef2fb] px-3 py-2">
              {legend.map((l) => {
                const active = enabled.includes(l.key);
                return (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => toggleRep(l.key)}
                    className={`chip ring-1 transition ${
                      active ? "opacity-100" : "opacity-35"
                    }`}
                    style={{
                      color: reputationMeta[l.key].color,
                      background: `${reputationMeta[l.key].color}12`,
                      boxShadow: `inset 0 0 0 1px ${reputationMeta[l.key].color}33`,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: reputationMeta[l.key].color }}
                    />
                    {l.label}
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1">
              <div
                ref={wrapRef}
                className="graph-canvas relative w-full touch-none select-none overflow-hidden"
                style={{ height: expanded ? "calc(100vh - 250px)" : 560 }}
              >
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="h-full w-full cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => {
                    (e.target as Element).setPointerCapture?.(e.pointerId);
                    setDragging(true);
                    dragStart.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
                  }}
                  onPointerMove={(e) => {
                    if (!dragging || !wrapRef.current) return;
                    const rect = wrapRef.current.getBoundingClientRect();
                    // Pointer events fire faster than the browser paints. Apply
                    // at most one transform per frame so panning stays smooth
                    // instead of re-rendering the whole graph per event.
                    panTargetRef.current = {
                      x: dragStart.current.vx + (e.clientX - dragStart.current.x) * (W / rect.width),
                      y: dragStart.current.vy + (e.clientY - dragStart.current.y) * (H / rect.height),
                    };
                    if (panFrameRef.current !== null) return;
                    panFrameRef.current = requestAnimationFrame(() => {
                      panFrameRef.current = null;
                      const next = panTargetRef.current;
                      if (!next) return;
                      setView((v) => ({ ...v, x: next.x, y: next.y }));
                    });
                  }}
                  onPointerUp={() => setDragging(false)}
                  onPointerLeave={() => setDragging(false)}
                >
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="16"
                      refY="5"
                      markerWidth="4"
                      markerHeight="4"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#9fb3d1" />
                    </marker>
                    <marker
                      id="arrowActive"
                      viewBox="0 0 10 10"
                      refX="16"
                      refY="5"
                      markerWidth="4"
                      markerHeight="4"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                    </marker>
                  </defs>

                  <g
                    transform={`translate(${view.x} ${view.y}) scale(${view.k})`}
                    style={{ transition: dragging ? "none" : "transform 0.18s ease-out" }}
                  >
                    {edges.map((e, i) => {
                      const a = positions.get(e.source);
                      const b = positions.get(e.target);
                      if (!a || !b) return null;
                      const active =
                        selected !== null && (e.source === selected || e.target === selected);
                      return (
                        <line
                          key={`${e.source}-${e.target}-${i}`}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke={active ? "#2563eb" : "#c7d6ef"}
                          strokeWidth={active ? 1.5 : 0.9}
                          strokeOpacity={active ? 0.8 : 0.4}
                          markerEnd={active ? "url(#arrowActive)" : "url(#arrow)"}
                        />
                      );
                    })}

                    {nodes.map((n) => {
                      const p = positions.get(n.id);
                      if (!p) return null;
                      const meta = reputationMeta[n.reputation];
                      const Icon = kindIcon[n.kind] ?? Network;
                      const isCenter = n.id === "67.215.92.210";
                      const active = selected === n.id;
                      const related = highlightedNeighbours.has(n.id);
                      const dim = isDim(n);
                      const radius = isCenter ? 27 : n.kind === "domain" ? 21 : 18;
                      return (
                        <g
                          key={n.id}
                          transform={`translate(${p.x} ${p.y})`}
                          opacity={dim ? 0.16 : related || !selected ? 1 : 0.5}
                          className="cursor-pointer transition-opacity"
                          onClick={() => setSelected(n.id)}
                        >
                          {(active || isCenter) && (
                            <circle
                              r={radius + 9}
                              fill="none"
                              stroke={meta.color}
                              strokeOpacity={0.32}
                              strokeWidth={1}
                              strokeDasharray="3 4"
                            />
                          )}
                          <circle
                            r={radius}
                            fill="#ffffff"
                            stroke={meta.color}
                            strokeWidth={active ? 2 : 1.3}
                            style={{
                              filter: active ? `drop-shadow(0 0 10px ${meta.color}88)` : undefined,
                            }}
                          />
                          <foreignObject
                            x={-radius + 5}
                            y={-radius + 5}
                            width={(radius - 5) * 2}
                            height={(radius - 5) * 2}
                            pointerEvents="none"
                          >
                            <div
                              className="flex h-full w-full items-center justify-center"
                              style={{ color: meta.color }}
                            >
                              <Icon size={isCenter ? 17 : 14} strokeWidth={1.6} />
                            </div>
                          </foreignObject>
                          {blocked.includes(n.id) && (
                            <g transform={`translate(${radius - 3} ${-radius + 3})`}>
                              <circle r={5} fill="#ffffff" stroke="#ef4444" strokeWidth={1} />
                              <path d="M-2.4,-2.4 l4.8,4.8 M2.4,-2.4 l-4.8,4.8" stroke="#ef4444" strokeWidth={1} />
                            </g>
                          )}
                          <text
                            y={radius + 13}
                            textAnchor="middle"
                            fontSize={isCenter ? 10.5 : 9.5}
                            fontFamily="'JetBrains Mono', monospace"
                            fill={active ? "#1d4ed8" : "#526181"}
                          >
                            {n.kind === "hash"
                              ? n.label.replace(/^sha256:\s*/, "")
                              : n.label.length > 22
                                ? `${n.label.slice(0, 14)}…`
                                : n.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Toolbar */}
                <div className="absolute left-3 top-3 flex flex-col overflow-hidden rounded-lg border border-[#eef2fb] bg-white/90 backdrop-blur">
                  {[
                    { icon: Plus, label: "Zoom in", action: () => zoomAt(1.25) },
                    { icon: Minus, label: "Zoom out", action: () => zoomAt(1 / 1.25) },
                    {
                      icon: Focus,
                      label: "Fit graph",
                      action: () => setView({ k: 1, x: 0, y: 0 }),
                    },
                    {
                      icon: Crosshair,
                      label: "Centre on selected",
                      action: () => {
                        const p = selected ? positions.get(selected) : undefined;
                        if (!p) return;
                        setView((v) => ({
                          k: Math.max(v.k, 1.4),
                          x: CX - p.x * Math.max(v.k, 1.4),
                          y: CY - p.y * Math.max(v.k, 1.4),
                        }));
                      },
                    },
                  ].map((t, i) => (
                    <button
                      key={t.label}
                      type="button"
                      title={t.label}
                      aria-label={t.label}
                      onClick={t.action}
                      className={`grid h-8 w-8 place-items-center text-[#5b6b8c] transition hover:bg-[#e8effd] hover:text-[#2563eb] ${
                        i > 0 ? "border-t border-[#eef2fb]" : ""
                      }`}
                    >
                      <t.icon size={13} />
                    </button>
                  ))}
                </div>

                <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-x-3 gap-y-1 rounded-lg border border-[#eef2fb] bg-white/90 px-3 py-1.5 backdrop-blur">
                  {legend.map((l) => (
                    <span
                      key={l.key}
                      className="flex items-center gap-1.5 text-[11px] text-[#5b6b8c]"
                    >
                      <span
                        className="h-2 w-2 rounded-[2px]"
                        style={{ background: reputationMeta[l.key].color }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>

                <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-[11px] text-[#93a2bf]">
                  zoom {view.k.toFixed(2)}× · drag to pan · scroll to zoom
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Detail rail */}
        <div className={`flex flex-col gap-3 ${expanded ? "" : "xl:col-span-3"}`}>
          <Panel
            title="Indicator detail"
            subtitle={selectedNode ? "Selected node" : "Nothing selected"}
            action={
              selectedNode && (
                <Badge
                  tone={
                    selectedNode.reputation === "malicious"
                      ? "red"
                      : selectedNode.reputation === "suspicious"
                        ? "orange"
                        : "slate"
                  }
                >
                  {reputationMeta[selectedNode.reputation].label}
                </Badge>
              )
            }
          >
            {selectedNode ? (
              <div className="p-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
                    style={{
                      color: reputationMeta[selectedNode.reputation].color,
                      borderColor: `${reputationMeta[selectedNode.reputation].color}44`,
                      background: `${reputationMeta[selectedNode.reputation].color}12`,
                    }}
                  >
                    {(() => {
                      const Icon = kindIcon[selectedNode.kind] ?? Network;
                      return <Icon size={16} />;
                    })()}
                  </span>
                  <div className="min-w-0">
                    <p className="break-all font-mono text-[12px] leading-snug text-[#0b1220]">
                      {selectedNode.label}
                    </p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[#7183a8]">
                      {selectedNode.kind} indicator
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-[#eef2fb] bg-[#f7faff] px-2 py-1.5">
                    <p className="text-[11px] uppercase tracking-wider text-[#93a2bf]">
                      Risk score
                    </p>
                    <p
                      className="tabular text-[15px] font-semibold"
                      style={{ color: reputationMeta[selectedNode.reputation].color }}
                    >
                      {riskFor(selectedNode.reputation)}
                      <span className="text-[11px] text-[#93a2bf]">/100</span>
                    </p>
                  </div>
                  <div className="rounded-md border border-[#eef2fb] bg-[#f7faff] px-2 py-1.5">
                    <p className="text-[11px] uppercase tracking-wider text-[#93a2bf]">
                      Connections
                    </p>
                    <p className="tabular text-[15px] font-semibold text-[#0b1220]">
                      {connections.length}
                    </p>
                  </div>
                </div>

                <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e8eefb]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${riskFor(selectedNode.reputation)}%`,
                      background: reputationMeta[selectedNode.reputation].color,
                    }}
                  />
                </div>

                <div className="mt-3 space-y-1 text-[11px] text-[#7183a8]">
                  <p className="flex justify-between">
                    <span>First observed</span>
                    <span className="text-[#334155]">2026-11-14 09:22 UTC</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Last observed</span>
                    <span className="text-[#334155]">2026-11-21 10:04 UTC</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Confidence</span>
                    <span className="text-[#334155]">
                      {selectedNode.reputation === "malicious" ? "High (0.94)" : "Moderate (0.62)"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Campaign</span>
                    <span className="text-[#334155]">HD-2026-1114</span>
                  </p>
                </div>

                <p className="mt-3 truncate text-[11px] text-[#93a2bf]">
                  {centerNode?.label} · cluster {nodes.length} indicators
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setBlocked((prev) =>
                      prev.includes(selectedNode.id)
                        ? prev.filter((id) => id !== selectedNode.id)
                        : [...prev, selectedNode.id],
                    )
                  }
                  className={`mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[12px] font-medium transition ${
                    blocked.includes(selectedNode.id)
                      ? "border-emerald-500/40 bg-[#e3f8ea] text-[#15803d]"
                      : "border-[#f6c9c5] bg-[#fdeceb] text-[#dc2626] hover:bg-red-500/20"
                  }`}
                >
                  <ShieldBan size={12} />
                  {blocked.includes(selectedNode.id)
                    ? "Added to blocklist"
                    : "Add to blocklist"}
                </button>
              </div>
            ) : (
              <p className="px-3 py-6 text-center text-[12px] text-[#7183a8]">
                Select a node to inspect its evidence.
              </p>
            )}
          </Panel>

          <Panel
            title="Linked indicators"
            subtitle="Direct relationships"
            action={<Badge tone="slate">{connections.length}</Badge>}
          >
            <div className="max-h-[240px] divide-y divide-[#eef2fb] overflow-y-auto">
              {connections.map(({ edge, node }) => (
                <button
                  key={`${edge.source}-${edge.target}-${node.id}`}
                  type="button"
                  onClick={() => setSelected(node.id)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition hover:bg-[#f4f8ff]"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: reputationMeta[node.reputation].color }}
                  />
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[#5b6b8c]">
                    {node.label}
                  </span>
                  <span className="shrink-0 text-[11px] uppercase tracking-wider text-[#93a2bf]">
                    {edge.relation}
                  </span>
                  <ArrowUpRight size={10} className="shrink-0 text-[#93a2bf]" />
                </button>
              ))}
              {connections.length === 0 && (
                <p className="px-3 py-5 text-center text-[12px] text-[#93a2bf]">
                  No direct links recorded.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
