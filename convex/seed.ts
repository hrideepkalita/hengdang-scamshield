import { mutation } from "./_generated/server";
import { demoDashboard } from "./demoData";

/**
 * Seeds the Convex deployment with the labelled demonstration dataset.
 * Run with: npx convex run seed:seedDemo
 * Replace `demoData` with ingested, verified intelligence for production mode.
 */
export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("regions").take(1);
    if (existing.length > 0) {
      return { skipped: true, reason: "Dataset already present" };
    }

    const now = Date.now();
    for (const r of demoDashboard.countries) {
      await ctx.db.insert("regions", {
        name: r.name,
        reports: r.reports,
        level: r.level,
        verifiedShare: r.verifiedShare,
        topCategory: r.topCategory,
      });
    }

    for (const h of demoDashboard.hotspots) {
      await ctx.db.insert("hotspots", {
        label: h.label,
        country: h.country,
        lat: h.lat,
        lng: h.lng,
        reports: h.reports,
        level: h.level,
        category: h.category,
        verified: h.verified,
        lastSeen: new Date(h.lastSeen).getTime(),
        sources: h.sources,
      });
    }

    for (const f of demoDashboard.feed) {
      await ctx.db.insert("reports", {
        ref: f.id,
        title: f.title,
        domain: f.domain,
        category: f.category,
        region: f.region,
        severity: f.severity,
        status: f.status,
        reportCount: f.reports,
        observedAt: new Date(f.time).getTime(),
      });
    }

    for (const n of demoDashboard.graph.nodes) {
      await ctx.db.insert("graphNodes", {
        key: n.id,
        label: n.label,
        kind: n.kind,
        reputation: n.reputation,
      });
    }

    for (const e of demoDashboard.graph.edges) {
      await ctx.db.insert("graphEdges", e);
    }

    await ctx.db.insert("meta", {
      source: demoDashboard.source,
      mode: "demo",
      note: "Synthetic demonstration dataset. Not live threat intelligence.",
    });

    return { seeded: true, regions: demoDashboard.countries.length, at: now };
  },
});
