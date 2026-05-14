import { eq, sql } from "drizzle-orm";

import { db } from "../../db";
import { trafficSources } from "../../db/schema/traffic-sources";

export interface TrafficSource {
  source: string;
  visitors: number;
  pageViews: number;
  leads: number;
  percentage: number;
}

export interface TrafficAnalytics {
  sources: TrafficSource[];
  totalVisitors: number;
  totalPageViews: number;
  totalLeads: number;
  conversionRate: number;
}

export async function getTrafficAnalyticsService(
  ownerId: string,
): Promise<TrafficAnalytics> {
  const rows = await db
    .select({
      source: trafficSources.source,
      visitors: sql<number>`COALESCE(SUM(${trafficSources.visitors}), 0)`,
      pageViews: sql<number>`COALESCE(SUM(${trafficSources.pageViews}), 0)`,
      leads: sql<number>`COALESCE(SUM(${trafficSources.leads}), 0)`,
    })
    .from(trafficSources)
    .where(eq(trafficSources.ownerId, ownerId))
    .groupBy(trafficSources.source)
    .orderBy(trafficSources.source);

  const totalVisitors = rows.reduce((acc, r) => acc + Number(r.visitors), 0);
  const totalPageViews = rows.reduce((acc, r) => acc + Number(r.pageViews), 0);
  const totalLeads = rows.reduce((acc, r) => acc + Number(r.leads), 0);

  const sources: TrafficSource[] = rows.map((row) => ({
    source: row.source,
    visitors: Number(row.visitors),
    pageViews: Number(row.pageViews),
    leads: Number(row.leads),
    percentage: totalVisitors > 0
      ? Number(((Number(row.visitors) / totalVisitors) * 100).toFixed(1))
      : 0,
  }));

  const conversionRate = totalVisitors > 0
    ? Number(((totalLeads / totalVisitors) * 100).toFixed(2))
    : 0;

  return {
    sources,
    totalVisitors,
    totalPageViews,
    totalLeads,
    conversionRate,
  };
}
