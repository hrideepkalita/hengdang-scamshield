export type Severity = "critical" | "high" | "medium" | "low";

export type HeatLevel = "high" | "elevated" | "lower" | "neutral";

export type FeedStatus = "active" | "mitigated" | "monitoring" | "blocked";

export type Reputation =
  | "malicious"
  | "suspicious"
  | "common"
  | "unknown"
  | "clean"
  | "asset";

export interface CountryAggregate {
  name: string;
  reports: number;
  level: HeatLevel;
  verifiedShare: number;
  topCategory: string;
}

export interface Hotspot {
  id: string;
  label: string;
  country: string;
  lat: number;
  lng: number;
  reports: number;
  level: "critical" | "high" | "elevated";
  category: string;
  verified: boolean;
  lastSeen: string;
  sources: string[];
}

export interface FeedItem {
  id: string;
  time: string;
  severity: Severity;
  title: string;
  domain: string;
  category: string;
  region: string;
  status: FeedStatus;
  reports: number;
}

export interface CategoryStat {
  name: string;
  value: number;
  color: string;
}

export interface TrendPoint {
  label: string;
  phishing: number;
  quishing: number;
  fakeSites: number;
}

export interface RegionSeriesPoint {
  day: string;
  APAC: number;
  EMEA: number;
  AMER: number;
  LATAM: number;
  AFRICA: number;
}

export interface SeveritySlice {
  name: string;
  value: number;
  color: string;
}

export interface GraphNode {
  id: string;
  label: string;
  kind: "ip" | "domain" | "hash" | "cert" | "asset";
  reputation: Reputation;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface OverviewStats {
  totalReports: number;
  criticalAlerts: number;
  suspiciousUrls: number;
  blockedTraffic: number;
  reportsToday: number;
  activeCampaigns: number;
  verifiedShare: number;
}

export interface DashboardData {
  overview: OverviewStats;
  countries: CountryAggregate[];
  hotspots: Hotspot[];
  feed: FeedItem[];
  categories: CategoryStat[];
  hourlyTrend: TrendPoint[];
  regionSeries: RegionSeriesPoint[];
  severity: SeveritySlice[];
  attackVectors: CategoryStat[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  lastUpdated: string;
  source: string;
  mode?: "demo" | "live";
  note?: string;
}

export interface ScanEvent {
  id: string;
  url: string;
  verdict: "dangerous" | "suspicious" | "safe";
  reason: string;
  createdAt: number;
  score: number;
}
