import { and, eq, sql } from "drizzle-orm";

import { db } from "../../db";
import { invoices } from "../../db/schema/invoices";
import { subscriptions } from "../../db/schema/subscriptions";

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RevenueAnalytics {
  monthlyRevenue: MonthlyRevenue[];
  mrr: number;
  arr: number;
}

export async function getRevenueAnalyticsService(
  ownerId: string,
): Promise<RevenueAnalytics> {
  const monthlyRows = await db.execute(sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', ${invoices.createdAt}), 'YYYY-MM') AS month,
      COALESCE(SUM(${invoices.amount}), 0) AS revenue
    FROM ${invoices}
    WHERE
      ${eq(invoices.ownerId, ownerId)} AND
      ${eq(invoices.status, 'paid')}
    GROUP BY DATE_TRUNC('month', ${invoices.createdAt})
    ORDER BY month DESC
    LIMIT 12
  `);

  const monthlyRevenue: MonthlyRevenue[] = (monthlyRows as any[]).map(
    (row: any) => ({
      month: row.month,
      revenue: Number(row.revenue),
    }),
  );

  const [mrrResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${subscriptions.mrr}), 0)`,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.ownerId, ownerId),
        eq(subscriptions.status, "active"),
      ),
    );

  const mrr = Number(mrrResult.total);
  const arr = Number((mrr * 12).toFixed(2));

  return {
    monthlyRevenue,
    mrr,
    arr,
  };
}
