import { sql } from "drizzle-orm";

import { db } from "../../db";

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
  const result = await db.execute(sql`
    WITH
    source_agg AS (
      SELECT
        source,
        COALESCE(SUM(visitors), 0) AS visitors,
        COALESCE(SUM(page_views), 0) AS page_views,
        COALESCE(SUM(leads), 0) AS leads
      FROM traffic_sources
      WHERE owner_id = ${ownerId}
      GROUP BY source
      ORDER BY source
    ),
    totals AS (
      SELECT
        COALESCE(SUM(visitors), 0) AS total_visitors,
        COALESCE(SUM(page_views), 0) AS total_page_views,
        COALESCE(SUM(leads), 0) AS total_leads
      FROM traffic_sources
      WHERE owner_id = ${ownerId}
    )
    SELECT
      source_agg.source,
      source_agg.visitors,
      source_agg.page_views,
      source_agg.leads,
      CASE
        WHEN totals.total_visitors > 0
        THEN ROUND((source_agg.visitors::numeric / totals.total_visitors) * 100, 1)
        ELSE 0
      END AS percentage,
      totals.total_visitors,
      totals.total_page_views,
      totals.total_leads,
      CASE
        WHEN totals.total_visitors > 0
        THEN ROUND((totals.total_leads::numeric / totals.total_visitors) * 100, 2)
        ELSE 0
      END AS conversion_rate
    FROM source_agg, totals
  `);

  const rows = result.rows as unknown as Record<string, unknown>[];

  if (rows.length === 0) {
    return {
      sources: [],
      totalVisitors: 0,
      totalPageViews: 0,
      totalLeads: 0,
      conversionRate: 0,
    };
  }

  const firstRow = rows[0]!;
  const totalVisitors = Number(firstRow.total_visitors);
  const totalPageViews = Number(firstRow.total_page_views);
  const totalLeads = Number(firstRow.total_leads);
  const conversionRate = Number(firstRow.conversion_rate);

  const sources: TrafficSource[] = rows.map((row) => ({
    source: row.source as string,
    visitors: Number(row.visitors),
    pageViews: Number(row.page_views),
    leads: Number(row.leads),
    percentage: Number(row.percentage),
  }));

  return {
    sources,
    totalVisitors,
    totalPageViews,
    totalLeads,
    conversionRate,
  };
}
