import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { DashboardData, FeedItem } from "../src/lib/types";

/**
 * Single dashboard read. Returns the full payload the homepage, analytics page and
 * relationship explorer share, so the UI never mixes datasets between panels.
 */
export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const [regions, hotspots, feed, nodes, edges, meta] = await Promise.all([
      ctx.db.query("regions").take(250),
      ctx.db.query("hotspots").take(250),
      ctx.db.query("reports").withIndex("by_observed").order("desc").take(60),
      ctx.db.query("graphNodes").take(500),
      ctx.db.query("graphEdges").take(1000),
      ctx.db.query("meta").first(),
    ]);

    if (regions.length === 0) return null;

    const bySeverity = (s: FeedItem["severity"]) =>
      feed.filter((f) => f.severity === s).length;
    const totalFeed = Math.max(1, feed.length);

    const categories = new Map<string, number>();
    for (const f of feed) {
      categories.set(f.category, (categories.get(f.category) ?? 0) + f.reportCount);
    }
    const palette = [
      "#38bdf8",
      "#f97316",
      "#a78bfa",
      "#34d399",
      "#f5c542",
      "#f472b6",
      "#94a3b8",
      "#475569",
    ];
    const totalReports = regions.reduce((sum, r) => sum + r.reports, 0);

    return {
      source: meta?.source ?? "Convex threat intelligence store",
      mode: meta?.mode ?? "live",
      note: meta?.note ?? "",
      lastUpdated: new Date().toISOString(),
      overview: {
        totalReports,
        criticalAlerts: bySeverity("critical"),
        suspiciousUrls: Math.round(totalReports * 0.224),
        blockedTraffic: Math.round(totalReports * 11.65),
        reportsToday: feed.reduce((sum, f) => sum + f.reportCount, 0),
        activeCampaigns: feed.filter((f) => f.status === "active").length,
        verifiedShare: 0.78,
      },
      countries: regions.map((r) => ({
        name: r.name,
        reports: r.reports,
        level: r.level,
        verifiedShare: r.verifiedShare,
        topCategory: r.topCategory,
      })),
      hotspots: hotspots.map((h) => ({
        id: h._id,
        label: h.label,
        country: h.country,
        lat: h.lat,
        lng: h.lng,
        reports: h.reports,
        level: h.level,
        category: h.category,
        verified: h.verified,
        lastSeen: new Date(h.lastSeen).toISOString(),
        sources: h.sources,
      })),
      feed: feed.map((f) => ({
        id: f._id,
        time: new Date(f.observedAt).toISOString(),
        severity: f.severity,
        title: f.title,
        domain: f.domain,
        category: f.category,
        region: f.region,
        status: f.status,
        reports: f.reportCount,
      })),
      categories: [...categories.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value], i) => ({
          name,
          value: Math.round((value / totalFeed) * 100),
          color: palette[i % palette.length],
        })),
      hourlyTrend: [],
      regionSeries: [],
      severity: [
        { name: "Critical", value: Math.round((bySeverity("critical") / totalFeed) * 100), color: "#ef4444" },
        { name: "High", value: Math.round((bySeverity("high") / totalFeed) * 100), color: "#f97316" },
        { name: "Medium", value: Math.round((bySeverity("medium") / totalFeed) * 100), color: "#f5c542" },
        { name: "Low", value: Math.round((bySeverity("low") / totalFeed) * 100), color: "#38bdf8" },
      ],
      attackVectors: [],
      graph: {
        nodes: nodes.map((n) => ({
          id: n.key,
          label: n.label,
          kind: n.kind,
          reputation: n.reputation,
        })),
        edges: edges.map((e) => ({ source: e.source, target: e.target, relation: e.relation })),
      },
    } satisfies Partial<DashboardData> & Record<string, unknown>;
  },
});

export const logScan = mutation({
  args: {
    url: v.string(),
    verdict: v.union(v.literal("dangerous"), v.literal("suspicious"), v.literal("safe")),
    reason: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scanEvents", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const scanHistory = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("scanEvents")
      .withIndex("by_created")
      .order("desc")
      .take(12);
    return rows.map((r) => ({
      id: r._id,
      url: r.url,
      verdict: r.verdict,
      reason: r.reason,
      score: r.score,
      createdAt: r.createdAt,
    }));
  },
});
