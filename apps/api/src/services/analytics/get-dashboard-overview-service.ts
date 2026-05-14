import { and, count, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "../../db";
import { invoices } from "../../db/schema/invoices";
import { subscriptions } from "../../db/schema/subscriptions";
import {
  calculateAverageRevenuePerUser,
  calculateChurnRate,
  calculateGrowth,
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

export async function getDashboardOverviewService(
  ownerId: string,
): Promise<DashboardOverview> {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  );

  const [currentRevenue] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${invoices.amount}), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.ownerId, ownerId),
        eq(invoices.status, "paid"),
        gte(invoices.createdAt, currentMonthStart),
      ),
    );

  const [previousRevenue] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${invoices.amount}), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.ownerId, ownerId),
        eq(invoices.status, "paid"),
        gte(invoices.createdAt, lastMonthStart),
        lt(invoices.createdAt, currentMonthStart),
      ),
    );

  const [currentActive] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.ownerId, ownerId),
        eq(subscriptions.status, "active"),
        gte(subscriptions.createdAt, currentMonthStart),
      ),
    );

  const [previousActive] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.ownerId, ownerId),
        eq(subscriptions.status, "active"),
        gte(subscriptions.createdAt, lastMonthStart),
        lt(subscriptions.createdAt, currentMonthStart),
      ),
    );

  const [allSubscriptions] = await db
    .select({
      total: count(),
      canceled:
        sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${subscriptions.status} = 'canceled'), 0)`,
    })
    .from(subscriptions)
    .where(eq(subscriptions.ownerId, ownerId));

  const churnRate = calculateChurnRate(
    Number(allSubscriptions.canceled),
    allSubscriptions.total,
  );

  const [previousSubscriptions] = await db
    .select({
      total: count(),
      canceled:
        sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${subscriptions.status} = 'canceled'), 0)`,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.ownerId, ownerId),
        gte(subscriptions.createdAt, lastMonthStart),
        lt(subscriptions.createdAt, currentMonthStart),
      ),
    );

  const previousChurnRate = calculateChurnRate(
    Number(previousSubscriptions.canceled),
    previousSubscriptions.total,
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

  const totalRevenueCurrent = Number(currentRevenue.total);
  const totalRevenuePrevious = Number(previousRevenue.total);
  const activeUsersCurrent = Number(currentActive.count);
  const activeUsersPrevious = Number(previousActive.count);
  const mrr = Number(mrrResult.total);

  return {
    totalRevenue: totalRevenueCurrent,
    totalRevenueGrowth: calculateGrowth(
      totalRevenueCurrent,
      totalRevenuePrevious,
    ),
    activeUsers: activeUsersCurrent,
    activeUsersGrowth: calculateGrowth(
      activeUsersCurrent,
      activeUsersPrevious,
    ),
    churnRate,
    churnRateGrowth: calculateGrowth(churnRate, previousChurnRate),
    averageRevenuePerUser: calculateAverageRevenuePerUser(
      totalRevenueCurrent,
      activeUsersCurrent,
    ),
    mrr,
  };
}
