import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const heatLevel = v.union(
  v.literal("high"),
  v.literal("elevated"),
  v.literal("lower"),
  v.literal("neutral"),
);

const severity = v.union(
  v.literal("critical"),
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
);

const reputation = v.union(
  v.literal("malicious"),
  v.literal("suspicious"),
  v.literal("common"),
  v.literal("unknown"),
  v.literal("clean"),
  v.literal("asset"),
);

export default defineSchema({
  /** Aggregated, geographically attributable phishing / fraud reports by country. */
  regions: defineTable({
    name: v.string(),
    reports: v.number(),
    level: heatLevel,
    verifiedShare: v.number(),
    topCategory: v.string(),
  }).index("by_reports", ["reports"]),

  /** Verified hotspots with coordinates used for the global threat map. */
  hotspots: defineTable({
    label: v.string(),
    country: v.string(),
    lat: v.number(),
    lng: v.number(),
    reports: v.number(),
    level: v.union(v.literal("critical"), v.literal("high"), v.literal("elevated")),
    category: v.string(),
    verified: v.boolean(),
    lastSeen: v.number(),
    sources: v.array(v.string()),
  }),

  /** Individual reported incidents powering the intelligence feed. */
  reports: defineTable({
    ref: v.string(),
    title: v.string(),
    domain: v.string(),
    category: v.string(),
    region: v.string(),
    severity,
    status: v.union(
      v.literal("active"),
      v.literal("mitigated"),
      v.literal("monitoring"),
      v.literal("blocked"),
    ),
    reportCount: v.number(),
    observedAt: v.number(),
  }).index("by_observed", ["observedAt"]),

  /** Threat relationship graph indicators. */
  graphNodes: defineTable({
    key: v.string(),
    label: v.string(),
    kind: v.union(
      v.literal("ip"),
      v.literal("domain"),
      v.literal("hash"),
      v.literal("cert"),
      v.literal("asset"),
    ),
    reputation,
  }).index("by_key", ["key"]),

  graphEdges: defineTable({
    source: v.string(),
    target: v.string(),
    relation: v.string(),
  }),

  /** QR / URL scans submitted from the scanner page. */
  scanEvents: defineTable({
    url: v.string(),
    verdict: v.union(
      v.literal("dangerous"),
      v.literal("suspicious"),
      v.literal("safe"),
    ),
    reason: v.string(),
    score: v.number(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  /** Provenance metadata for the dashboard dataset. */
  meta: defineTable({
    source: v.string(),
    mode: v.union(v.literal("demo"), v.literal("live")),
    note: v.string(),
  }),
});
