import { sql } from "drizzle-orm";

import { db } from "../../db";

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RevenueAnalytics {
  monthlyRevenue: MonthlyRevenue[];
  mrr: number;
  arr: number;
}

interface RevenueQueryRow {
  month: string | null;
  revenue: string;
  mrr: string;
}

export async function getRevenueAnalyticsService(
  ownerId: string,
): Promise<RevenueAnalytics> {
  const result = await db.execute(sql`
    WITH
    monthly_revenue AS (
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
        COALESCE(SUM(amount), 0) AS revenue
      FROM invoices
      WHERE owner_id = ${ownerId} AND status = 'paid'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    ),
    mrr_agg AS (
      SELECT COALESCE(SUM(mrr), 0) AS mrr
      FROM subscriptions
      WHERE owner_id = ${ownerId} AND status = 'active'
    )
    SELECT
      month,
      revenue,
      (SELECT mrr FROM mrr_agg) AS mrr
    FROM monthly_revenue
    UNION ALL
    SELECT
      NULL::text AS month,
      0::numeric AS revenue,
      mrr
    FROM mrr_agg
    WHERE NOT EXISTS (SELECT 1 FROM monthly_revenue)
  `);

  const rows = result.rows as unknown as RevenueQueryRow[];

  const mrr = rows.length > 0 ? Number(rows[0]!.mrr) : 0;
  const arr = Number((mrr * 12).toFixed(2));

  const monthlyRevenue: MonthlyRevenue[] = rows
    .filter((r) => r.month !== null)
    .map((r) => ({
      month: r.month!,
      revenue: Number(r.revenue),
    }));

  return {
    monthlyRevenue,
    mrr,
    arr,
  };
}
