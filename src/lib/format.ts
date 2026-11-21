import type { HeatLevel, Severity } from "./types";

export const compact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const fullNumber = (n: number): string => n.toLocaleString("en-US");

export const severityMeta: Record<
  Severity,
  { label: string; color: string; chip: string }
> = {
  critical: {
    label: "Critical",
    color: "#ef4444",
    chip: "bg-red-500/12 text-red-400 ring-red-500/30",
  },
  high: {
    label: "High",
    color: "#f97316",
    chip: "bg-orange-500/12 text-orange-300 ring-orange-500/30",
  },
  medium: {
    label: "Medium",
    color: "#f5c542",
    chip: "bg-amber-400/12 text-amber-300 ring-amber-400/30",
  },
  low: {
    label: "Low",
    color: "#38bdf8",
    chip: "bg-sky-500/12 text-sky-300 ring-sky-500/30",
  },
};

export const heatMeta: Record<
  HeatLevel,
  { label: string; color: string; fill: string; glow: string }
> = {
  high: {
    label: "High verified activity",
    color: "#ff3b30",
    fill: "rgba(239, 68, 68, 0.42)",
    glow: "rgba(255, 59, 48, 0.55)",
  },
  elevated: {
    label: "Elevated activity",
    color: "#ff8a1e",
    fill: "rgba(249, 115, 22, 0.30)",
    glow: "rgba(249, 115, 22, 0.45)",
  },
  lower: {
    label: "Lower activity",
    color: "#f5c542",
    fill: "rgba(245, 197, 66, 0.20)",
    glow: "rgba(245, 197, 66, 0.32)",
  },
  neutral: {
    label: "Insufficient data",
    color: "#334155",
    fill: "rgba(51, 65, 85, 0.35)",
    glow: "rgba(51, 65, 85, 0.1)",
  },
};

export const reputationMeta: Record<
  string,
  { label: string; color: string }
> = {
  malicious: { label: "Malicious", color: "#e11d48" },
  suspicious: { label: "Suspicious", color: "#f97316" },
  common: { label: "Common", color: "#f5c542" },
  unknown: { label: "Unknown", color: "#64748b" },
  clean: { label: "Clean", color: "#0ea5e9" },
  asset: { label: "Asset", color: "#8b5cf6" },
};

export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};
