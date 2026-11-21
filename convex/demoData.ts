import type {
  CountryAggregate,
  DashboardData,
  FeedItem,
  GraphEdge,
  GraphNode,
  HeatLevel,
  Hotspot,
  RegionSeriesPoint,
  TrendPoint,
} from "../src/lib/types";

/**
 * DEMONSTRATION DATASET
 * ---------------------
 * Every value below is synthetic and deterministic. It exists so the dashboard can be
 * evaluated without a live feed. Figures are modelled on aggregated public phishing and
 * fraud reporting patterns, but they are NOT live threat intelligence, and a high report
 * count here does not imply a high underlying crime rate — it reflects reporting volume
 * from regions with active reporting channels.
 */

const country = (
  name: string,
  reports: number,
  level: HeatLevel,
  verifiedShare: number,
  topCategory: string,
): CountryAggregate => ({ name, reports, level, verifiedShare, topCategory });

export const demoCountries: CountryAggregate[] = [
  country("India", 41286, "high", 0.86, "Phishing links"),
  country("United States of America", 22940, "high", 0.81, "Fake payment pages"),
  country("Brazil", 11840, "high", 0.72, "Banking phishing"),
  country("Nigeria", 9420, "high", 0.68, "Advance-fee fraud"),
  country("United Kingdom", 8130, "high", 0.84, "Delivery smishing"),
  country("Indonesia", 7620, "elevated", 0.64, "Investment fraud"),
  country("Pakistan", 6890, "elevated", 0.61, "Phishing links"),
  country("Bangladesh", 6120, "elevated", 0.58, "Job offer scams"),
  country("Philippines", 5480, "elevated", 0.66, "QR / quishing"),
  country("Vietnam", 5210, "elevated", 0.59, "Malware droppers"),
  country("China", 4980, "elevated", 0.55, "Credential harvesting"),
  country("Mexico", 4610, "elevated", 0.62, "Banking phishing"),
  country("South Africa", 4120, "elevated", 0.57, "Advance-fee fraud"),
  country("United Arab Emirates", 3740, "elevated", 0.74, "Fake trading platforms"),
  country("Germany", 3480, "elevated", 0.83, "Invoice fraud"),
  country("Turkey", 3210, "elevated", 0.63, "Phishing links"),
  country("Thailand", 2980, "elevated", 0.6, "QR / quishing"),
  country("Malaysia", 2710, "elevated", 0.66, "Investment fraud"),
  country("Russia", 2480, "elevated", 0.52, "Credential harvesting"),
  country("Canada", 2260, "lower", 0.79, "Delivery smishing"),
  country("Australia", 2190, "lower", 0.82, "Fake payment pages"),
  country("France", 2080, "lower", 0.8, "Invoice fraud"),
  country("Spain", 1940, "lower", 0.76, "Banking phishing"),
  country("Italy", 1860, "lower", 0.75, "Phishing links"),
  country("Saudi Arabia", 1790, "lower", 0.7, "Job offer scams"),
  country("Kenya", 1680, "lower", 0.55, "Mobile money fraud"),
  country("Egypt", 1610, "lower", 0.54, "Advance-fee fraud"),
  country("South Korea", 1540, "lower", 0.78, "Voice phishing"),
  country("Japan", 1480, "lower", 0.8, "Fake payment pages"),
  country("Netherlands", 1360, "lower", 0.81, "Invoice fraud"),
  country("Poland", 1240, "lower", 0.74, "Phishing links"),
  country("Sri Lanka", 1190, "lower", 0.63, "Job offer scams"),
  country("Nepal", 1080, "lower", 0.58, "QR / quishing"),
  country("Myanmar", 1020, "lower", 0.49, "Investment fraud"),
  country("Colombia", 980, "lower", 0.6, "Banking phishing"),
  country("Argentina", 910, "lower", 0.64, "Fake payment pages"),
  country("Ukraine", 880, "lower", 0.57, "Credential harvesting"),
  country("Sweden", 760, "lower", 0.83, "Delivery smishing"),
  country("Ireland", 640, "lower", 0.82, "Phishing links"),
  country("New Zealand", 520, "lower", 0.85, "Fake payment pages"),
  country("Ghana", 480, "lower", 0.5, "Advance-fee fraud"),
  country("Chile", 440, "lower", 0.66, "Banking phishing"),
  country("Peru", 380, "lower", 0.6, "Investment fraud"),
  country("Iran", 340, "lower", 0.42, "Credential harvesting"),
];

const hotspot = (
  id: string,
  label: string,
  countryName: string,
  lat: number,
  lng: number,
  reports: number,
  level: Hotspot["level"],
  category: string,
  verified: boolean,
  sources: string[],
): Hotspot => ({
  id,
  label,
  country: countryName,
  lat,
  lng,
  reports,
  level,
  category,
  verified,
  lastSeen: new Date(Date.now() - (reports % 47) * 60000).toISOString(),
  sources,
});

export const demoHotspots: Hotspot[] = [
  hotspot("hs-del", "New Delhi", "India", 28.6139, 77.209, 8420, "critical", "Phishing links", true, ["Reported URLs", "User submissions", "Partner SOC"]),
  hotspot("hs-bom", "Mumbai", "India", 19.076, 72.8777, 7310, "critical", "Fake payment pages", true, ["Reported URLs", "Banking partners"]),
  hotspot("hs-blr", "Bengaluru", "India", 12.9716, 77.5946, 6290, "critical", "Job offer scams", true, ["User submissions", "Partner SOC"]),
  hotspot("hs-hyd", "Hyderabad", "India", 17.385, 78.4867, 4830, "high", "Investment fraud", true, ["Reported URLs", "User submissions"]),
  hotspot("hs-ccu", "Kolkata", "India", 22.5726, 88.3639, 4210, "high", "QR / quishing", true, ["QR scan reports"]),
  hotspot("hs-maa", "Chennai", "India", 13.0827, 80.2707, 3680, "high", "Delivery smishing", true, ["SMS reports", "User submissions"]),
  hotspot("hs-pnq", "Pune", "India", 18.5204, 73.8567, 3140, "high", "Phishing links", true, ["Reported URLs"]),
  hotspot("hs-amt", "Ahmedabad", "India", 23.0225, 72.5714, 2460, "high", "Fake trading platforms", true, ["Reported URLs"]),
  hotspot("hs-jai", "Jaipur", "India", 26.9124, 75.7873, 1980, "elevated", "Lottery / prize scams", false, ["User submissions"]),
  hotspot("hs-cok", "Kochi", "India", 9.9312, 76.2673, 1620, "elevated", "Phishing links", true, ["Reported URLs"]),
  hotspot("hs-khi", "Karachi", "Pakistan", 24.8607, 67.0011, 3280, "high", "Phishing links", true, ["Partner SOC"]),
  hotspot("hs-dac", "Dhaka", "Bangladesh", 23.8103, 90.4125, 2910, "high", "Job offer scams", true, ["User submissions"]),
  hotspot("hs-cmb", "Colombo", "Sri Lanka", 6.9271, 79.8612, 1240, "elevated", "QR / quishing", false, ["QR scan reports"]),
  hotspot("hs-ktm", "Kathmandu", "Nepal", 27.7172, 85.324, 980, "elevated", "Investment fraud", false, ["User submissions"]),
  hotspot("hs-rgn", "Yangon", "Myanmar", 16.8409, 96.1735, 1460, "elevated", "Investment fraud", false, ["Partner SOC"]),
  hotspot("hs-bkk", "Bangkok", "Thailand", 13.7563, 100.5018, 2180, "elevated", "QR / quishing", true, ["QR scan reports"]),
  hotspot("hs-sin", "Singapore", "Singapore", 1.3521, 103.8198, 1740, "elevated", "Fake payment pages", true, ["Partner SOC"]),
  hotspot("hs-jkt", "Jakarta", "Indonesia", -6.2088, 106.8456, 3420, "high", "Investment fraud", true, ["Reported URLs", "Partner SOC"]),
  hotspot("hs-mnl", "Manila", "Philippines", 14.5995, 120.9842, 2610, "high", "QR / quishing", true, ["User submissions"]),
  hotspot("hs-hkg", "Hong Kong", "China", 22.3193, 114.1694, 1520, "elevated", "Credential harvesting", true, ["Partner SOC"]),
  hotspot("hs-sha", "Shanghai", "China", 31.2304, 121.4737, 1880, "elevated", "Credential harvesting", false, ["Reported URLs"]),
  hotspot("hs-dxb", "Dubai", "United Arab Emirates", 25.2048, 55.2708, 2260, "high", "Fake trading platforms", true, ["Partner SOC", "User submissions"]),
  hotspot("hs-ruh", "Riyadh", "Saudi Arabia", 24.7136, 46.6753, 1380, "elevated", "Job offer scams", true, ["User submissions"]),
  hotspot("hs-los", "Lagos", "Nigeria", 6.5244, 3.3792, 3120, "high", "Advance-fee fraud", true, ["Reported URLs", "Partner SOC"]),
  hotspot("hs-nbo", "Nairobi", "Kenya", -1.2921, 36.8219, 1260, "elevated", "Mobile money fraud", false, ["User submissions"]),
  hotspot("hs-jnb", "Johannesburg", "South Africa", -26.2041, 28.0473, 1940, "elevated", "Advance-fee fraud", true, ["Partner SOC"]),
  hotspot("hs-cai", "Cairo", "Egypt", 30.0444, 31.2357, 1140, "elevated", "Advance-fee fraud", false, ["User submissions"]),
  hotspot("hs-lon", "London", "United Kingdom", 51.5074, -0.1278, 3480, "high", "Delivery smishing", true, ["Reported URLs", "Partner SOC"]),
  hotspot("hs-ber", "Berlin", "Germany", 52.52, 13.405, 1620, "elevated", "Invoice fraud", true, ["Partner SOC"]),
  hotspot("hs-ams", "Amsterdam", "Netherlands", 52.3676, 4.9041, 1180, "elevated", "Invoice fraud", true, ["Partner SOC"]),
  hotspot("hs-par", "Paris", "France", 48.8566, 2.3522, 1420, "elevated", "Invoice fraud", false, ["Reported URLs"]),
  hotspot("hs-mad", "Madrid", "Spain", 40.4168, -3.7038, 980, "elevated", "Banking phishing", false, ["Reported URLs"]),
  hotspot("hs-nyc", "New York", "United States of America", 40.7128, -74.006, 6840, "critical", "Fake payment pages", true, ["Reported URLs", "Partner SOC"]),
  hotspot("hs-sfo", "San Francisco", "United States of America", 37.7749, -122.4194, 4120, "high", "Credential harvesting", true, ["Partner SOC"]),
  hotspot("hs-chi", "Chicago", "United States of America", 41.8781, -87.6298, 2830, "high", "Banking phishing", true, ["Reported URLs"]),
  hotspot("hs-tor", "Toronto", "Canada", 43.6532, -79.3832, 1460, "elevated", "Delivery smishing", true, ["User submissions"]),
  hotspot("hs-sao", "Sao Paulo", "Brazil", -23.5505, -46.6333, 5210, "high", "Banking phishing", true, ["Reported URLs", "Partner SOC"]),
  hotspot("hs-mex", "Mexico City", "Mexico", 19.4326, -99.1332, 2960, "high", "Banking phishing", true, ["Partner SOC"]),
  hotspot("hs-bog", "Bogota", "Colombia", 4.711, -74.0721, 1420, "elevated", "Fake payment pages", false, ["User submissions"]),
  hotspot("hs-syd", "Sydney", "Australia", -33.8688, 151.2093, 1680, "elevated", "Fake payment pages", true, ["Partner SOC"]),
  hotspot("hs-mow", "Moscow", "Russia", 55.7558, 37.6173, 1320, "elevated", "Credential harvesting", false, ["Reported URLs"]),
];

const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export const demoFeed: FeedItem[] = [
  {
    id: "f1",
    time: minsAgo(2),
    severity: "critical",
    title: "Credential-harvesting kit impersonating a national bank",
    domain: "secure-verify-kyc[.]top",
    category: "Phishing link",
    region: "India / New Delhi",
    status: "active",
    reports: 412,
  },
  {
    id: "f2",
    time: minsAgo(6),
    severity: "critical",
    title: "Fake UPI collect-request page harvesting PINs",
    domain: "upi-refund-check[.]online",
    category: "Fake payment page",
    region: "India / Mumbai",
    status: "active",
    reports: 286,
  },
  {
    id: "f3",
    time: minsAgo(14),
    severity: "high",
    title: "QR code sticker campaign over payment terminals",
    domain: "qr-scan-reward[.]shop",
    category: "QR / quishing",
    region: "India / Chennai",
    status: "monitoring",
    reports: 174,
  },
  {
    id: "f4",
    time: minsAgo(21),
    severity: "critical",
    title: "Parcel-delivery smishing with cloned courier portal",
    domain: "in-post-delivery[.]xyz",
    category: "Delivery smishing",
    region: "United Kingdom / London",
    status: "active",
    reports: 159,
  },
  {
    id: "f5",
    time: minsAgo(28),
    severity: "high",
    title: "Fake recruiter sending malicious offline offer letter archive",
    domain: "careers-hiring-portal[.]site",
    category: "Job offer scam",
    region: "India / Bengaluru",
    status: "active",
    reports: 143,
  },
  {
    id: "f6",
    time: minsAgo(37),
    severity: "medium",
    title: "Investment platform clone with fabricated returns",
    domain: "fx-premium-capital[.]live",
    category: "Investment fraud",
    region: "United Arab Emirates / Dubai",
    status: "monitoring",
    reports: 96,
  },
  {
    id: "f7",
    time: minsAgo(44),
    severity: "high",
    title: "Lookalike government portal requesting Aadhaar OTP",
    domain: "gov-benefit-verify[.]cc",
    category: "Phishing link",
    region: "India / Hyderabad",
    status: "mitigated",
    reports: 88,
  },
  {
    id: "f8",
    time: minsAgo(52),
    severity: "critical",
    title: "Mobile-banking overlay trojan distributed via SMS",
    domain: "apk-update-secure[.]apk",
    category: "Malware / dropper",
    region: "Indonesia / Jakarta",
    status: "active",
    reports: 203,
  },
  {
    id: "f9",
    time: minsAgo(63),
    severity: "medium",
    title: "Fake electricity-bill disconnection notice",
    domain: "bill-pay-disconnect[.]info",
    category: "Phishing link",
    region: "India / Pune",
    status: "blocked",
    reports: 64,
  },
  {
    id: "f10",
    time: minsAgo(71),
    severity: "low",
    title: "Low-volume lottery prize lure on messaging app",
    domain: "lucky-draw-winner[.]club",
    category: "Lottery / prize",
    region: "Nigeria / Lagos",
    status: "monitoring",
    reports: 31,
  },
  {
    id: "f11",
    time: minsAgo(82),
    severity: "high",
    title: "Cloned ticketing page skimming card details",
    domain: "event-tickets-pay[.]store",
    category: "Fake payment page",
    region: "United States / New York",
    status: "mitigated",
    reports: 118,
  },
  {
    id: "f12",
    time: minsAgo(96),
    severity: "medium",
    title: "Parcel redelivery QR redirecting to credential form",
    domain: "redeliver-parcel[.]link",
    category: "QR / quishing",
    region: "Australia / Sydney",
    status: "blocked",
    reports: 57,
  },
];

export const demoCategories = [
  { name: "Phishing link", value: 41, color: "#38bdf8" },
  { name: "Fake payment page", value: 18, color: "#f97316" },
  { name: "QR / quishing", value: 12, color: "#a78bfa" },
  { name: "Job offer", value: 9, color: "#34d399" },
  { name: "Investment fraud", value: 8, color: "#f5c542" },
  { name: "Lottery / prize", value: 6, color: "#f472b6" },
  { name: "Tech support", value: 4, color: "#94a3b8" },
  { name: "Other", value: 2, color: "#475569" },
];

export const demoSeverity = [
  { name: "Critical", value: 18, color: "#ef4444" },
  { name: "High", value: 27, color: "#f97316" },
  { name: "Medium", value: 31, color: "#f5c542" },
  { name: "Low", value: 24, color: "#38bdf8" },
];

export const demoAttackVectors = [
  { name: "Phishing", value: 18432, color: "#34d399" },
  { name: "Quishing", value: 9410, color: "#34d399" },
  { name: "Fake checkout", value: 7280, color: "#34d399" },
  { name: "Investment", value: 6150, color: "#34d399" },
  { name: "Job scams", value: 4200, color: "#34d399" },
];

const s = (i: number) => Math.sin(i * 12.9898) * 43758.5453;
const rand = (i: number) => s(i) - Math.floor(s(i));

export const demoHourlyTrend: TrendPoint[] = Array.from({ length: 24 }, (_, i) => {
  const base = 220 + Math.round(rand(i + 1) * 190);
  const evening = i >= 17 && i <= 22 ? 210 : 0;
  return {
    label: `${String(i).padStart(2, "0")}:00`,
    phishing: base + evening,
    quishing: Math.round(base * 0.34 + rand(i + 8) * 70),
    fakeSites: Math.round(base * 0.18 + rand(i + 15) * 45),
  };
});

export const demoRegionSeries: RegionSeriesPoint[] = [
  { day: "Mon", APAC: 620, EMEA: 280, AMER: 310, LATAM: 190, AFRICA: 140 },
  { day: "Tue", APAC: 690, EMEA: 305, AMER: 288, LATAM: 210, AFRICA: 156 },
  { day: "Wed", APAC: 740, EMEA: 322, AMER: 334, LATAM: 232, AFRICA: 148 },
  { day: "Thu", APAC: 812, EMEA: 298, AMER: 356, LATAM: 246, AFRICA: 172 },
  { day: "Fri", APAC: 905, EMEA: 341, AMER: 372, LATAM: 268, AFRICA: 188 },
  { day: "Sat", APAC: 780, EMEA: 286, AMER: 301, LATAM: 224, AFRICA: 164 },
  { day: "Sun", APAC: 848, EMEA: 314, AMER: 328, LATAM: 240, AFRICA: 179 },
];

export const demoRegions = [
  { name: "APAC", value: 62, color: "#38bdf8" },
  { name: "AMER", value: 18, color: "#60a5fa" },
  { name: "EMEA", value: 11, color: "#818cf8" },
  { name: "AFRICA", value: 5, color: "#a78bfa" },
  { name: "LATAM", value: 4, color: "#c084fc" },
];

const hashSeeds = [
  "7f6c", "d249", "3780", "e8a7", "277b", "2b7b", "5d1c", "1013",
  "33c9", "5505", "e9b8", "3b02", "9517", "17c9", "ae06", "9a0f",
  "27ae", "e9b4", "964a", "d1d1", "7057", "94f7", "6a73", "43b8",
  "ba72", "6d9b", "1a3e", "4325", "f821", "c640",
];

const hashNodes: GraphNode[] = hashSeeds.map((seed, i) => {
  const rep = (
    ["malicious", "suspicious", "common", "unknown", "clean", "malicious", "suspicious"] as const
  )[i % 7];
  return {
    id: `sha256:${seed}…${(i * 37 + 11).toString(16).padStart(4, "0")}`,
    label: `sha256: ${seed}…${(i * 37 + 11).toString(16).padStart(4, "0")}`,
    kind: i % 9 === 0 ? "cert" : "hash",
    reputation: rep,
  };
});

export const demoGraphNodes: GraphNode[] = [
  {
    id: "67.215.92.210",
    label: "67.215.92.210",
    kind: "ip",
    reputation: "malicious",
  },
  ...hashNodes,
  {
    id: "http://www.fakemsg-delivery.com",
    label: "http://www.fakemsg-delivery.com",
    kind: "domain",
    reputation: "malicious",
  },
  {
    id: "157.162.22.66",
    label: "157.162.22.66",
    kind: "ip",
    reputation: "suspicious",
  },
  {
    id: "192.168.1.44",
    label: "192.168.1.44",
    kind: "asset",
    reputation: "asset",
  },
  {
    id: "110.121.1.101",
    label: "110.121.1.101",
    kind: "ip",
    reputation: "unknown",
  },
  {
    id: "192.168.0.32",
    label: "192.168.0.32",
    kind: "asset",
    reputation: "asset",
  },
];

export const demoGraphEdges: GraphEdge[] = [
  ...hashNodes.map((n) => ({
    source: "67.215.92.210",
    target: n.id,
    relation: "downloads",
  })),
  {
    source: "http://www.fakemsg-delivery.com",
    target: "157.162.22.66",
    relation: "resolves to",
  },
  { source: "157.162.22.66", target: "192.168.1.44", relation: "connects" },
  { source: "110.121.1.101", target: "67.215.92.210", relation: "contacts" },
  { source: "192.168.0.32", target: "110.121.1.101", relation: "observed" },
  {
    source: "sha256:7f6c…1a3e",
    target: "http://www.fakemsg-delivery.com",
    relation: "drops",
  },
];

export const demoDashboard: DashboardData = {
  overview: {
    totalReports: 184392,
    criticalAlerts: 34,
    suspiciousUrls: 41286,
    blockedTraffic: 2148900,
    reportsToday: 3210,
    activeCampaigns: 12,
    verifiedShare: 0.78,
  },
  countries: demoCountries,
  hotspots: demoHotspots,
  feed: demoFeed,
  categories: demoCategories,
  hourlyTrend: demoHourlyTrend,
  regionSeries: demoRegionSeries,
  severity: demoSeverity,
  attackVectors: demoAttackVectors,
  graph: { nodes: demoGraphNodes, edges: demoGraphEdges },
  lastUpdated: new Date().toISOString(),
  source: "Demonstration dataset · deterministic sample",
};
