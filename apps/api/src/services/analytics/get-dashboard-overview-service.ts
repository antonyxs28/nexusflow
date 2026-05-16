import { sql } from "drizzle-orm";

import { db } from "../../db";
import {
  calculateAverageRevenuePerUser,
  calculateChurnRate,
  calculateGrowth,
  computePeriodDates,
} from "../../utils/analytics/calculations";

export interface DashboardOverview {
  totalRevenue: number;
  totalRevenueGrowth: number;
  activeUsers: number;
  activeUsersGrowth: number;
  churnRate: number;
  churnRateGrowth: number;
  averageRevenuePerUser: number;
  mrr: number;
}

interface DashboardQueryResult {
  current_revenue: string;
  previous_revenue: string;
  current_active: number;
  previous_active: number;
  total_subscriptions: number;
  total_canceled: number;
  previous_total_subscriptions: number;
  previous_canceled: number;
  mrr: string;
}

export async function getDashboardOverviewService(
  ownerId: string,
): Promise<DashboardOverview> {
  const { currentMonthStart, lastMonthStart } = computePeriodDates();

  const result = await db.execute(sql`
    WITH
    revenue_agg AS (
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE created_at >= ${currentMonthStart}), 0) AS current_revenue,
        COALESCE(SUM(amount) FILTER (WHERE created_at >= ${lastMonthStart} AND created_at < ${currentMonthStart}), 0) AS previous_revenue
      FROM invoices
      WHERE owner_id = ${ownerId} AND status = 'paid'
    ),
    subscription_agg AS (
      SELECT
        COUNT(*) FILTER (WHERE status = 'active' AND created_at >= ${currentMonthStart}) AS current_active,
        COUNT(*) FILTER (WHERE status = 'active' AND created_at >= ${lastMonthStart} AND created_at < ${currentMonthStart}) AS previous_active,
        COUNT(*) AS total_subscriptions,
        COUNT(*) FILTER (WHERE status = 'canceled') AS total_canceled,
        COUNT(*) FILTER (WHERE status = 'canceled' AND created_at >= ${lastMonthStart} AND created_at < ${currentMonthStart}) AS previous_canceled,
        COUNT(*) FILTER (WHERE created_at >= ${lastMonthStart} AND created_at < ${currentMonthStart}) AS previous_total_subscriptions,
        COALESCE(SUM(mrr) FILTER (WHERE status = 'active'), 0) AS mrr
      FROM subscriptions
      WHERE owner_id = ${ownerId}
    )
    SELECT * FROM revenue_agg, subscription_agg
  `);

  const row = result.rows[0] as unknown as DashboardQueryResult | undefined;

  if (!row) {
    return {
      totalRevenue: 0,
      totalRevenueGrowth: 0,
      activeUsers: 0,
      activeUsersGrowth: 0,
      churnRate: 0,
      churnRateGrowth: 0,
      averageRevenuePerUser: 0,
      mrr: 0,
    };
  }

  const totalRevenueCurrent = Number(row.current_revenue);
  const totalRevenuePrevious = Number(row.previous_revenue);
  const activeUsersCurrent = Number(row.current_active);
  const activeUsersPrevious = Number(row.previous_active);
  const churnRate = calculateChurnRate(row.total_canceled, row.total_subscriptions);
  const previousChurnRate = calculateChurnRate(
    row.previous_canceled,
    row.previous_total_subscriptions,
  );
  const mrr = Number(row.mrr);

  return {
    totalRevenue: totalRevenueCurrent,
    totalRevenueGrowth: calculateGrowth(totalRevenueCurrent, totalRevenuePrevious),
    activeUsers: activeUsersCurrent,
    activeUsersGrowth: calculateGrowth(activeUsersCurrent, activeUsersPrevious),
    churnRate,
    churnRateGrowth: calculateGrowth(churnRate, previousChurnRate),
    averageRevenuePerUser: calculateAverageRevenuePerUser(
      totalRevenueCurrent,
      activeUsersCurrent,
    ),
    mrr,
  };
}
