import { describe, expect, it } from "vitest";

import { registerUserService } from "../auth/register-user-service";
import { getDashboardOverviewService } from "./get-dashboard-overview-service";
import { getRevenueAnalyticsService } from "./get-revenue-analytics-service";
import { getTrafficAnalyticsService } from "./get-traffic-analytics-service";
import { getRecentActivityService } from "./get-recent-activity-service";
import { db } from "../../db";
import { clients } from "../../db/schema/clients";
import { subscriptions } from "../../db/schema/subscriptions";
import { invoices } from "../../db/schema/invoices";
import { trafficSources } from "../../db/schema/traffic-sources";
import { activities } from "../../db/schema/activities";

const ts = Date.now();
const email = `analytics-${ts}@nexusflow.dev`;

let ownerId: string;
let clientId: string;

describe("Analytics Service", () => {
  it("should setup test user and seed data", async () => {
    const user = await registerUserService({
      name: "Analytics User",
      email,
      password: "123456",
    });
    ownerId = user.id;

    const [client] = await db
      .insert(clients)
      .values({
        name: "Analytics Client",
        email: "analytics-client@example.com",
        company: "Analytics Inc",
        ownerId,
      })
      .returning();
    clientId = client.id;

    const [sub1] = await db
      .insert(subscriptions)
      .values({
        clientId,
        plan: "pro",
        status: "active",
        mrr: "99.00",
        startDate: new Date(),
        ownerId,
      })
      .returning();

    const [sub2] = await db
      .insert(subscriptions)
      .values({
        clientId,
        plan: "enterprise",
        status: "active",
        mrr: "299.00",
        startDate: new Date(),
        ownerId,
      })
      .returning();

    await db.insert(subscriptions).values({
      clientId,
      plan: "starter",
      status: "canceled",
      mrr: "49.00",
      startDate: new Date(Date.now() - 86400000 * 60),
      endDate: new Date(),
      ownerId,
    });

    await db.insert(invoices).values([
      {
        clientId,
        subscriptionId: sub1.id,
        amount: "99.00",
        currency: "USD",
        status: "paid",
        dueDate: new Date(),
        paidAt: new Date(),
        ownerId,
      },
      {
        clientId,
        subscriptionId: sub2.id,
        amount: "299.00",
        currency: "USD",
        status: "paid",
        dueDate: new Date(),
        paidAt: new Date(),
        ownerId,
      },
      {
        clientId,
        subscriptionId: sub1.id,
        amount: "99.00",
        currency: "USD",
        status: "pending",
        dueDate: new Date(),
        ownerId,
      },
    ]);

    await db.insert(trafficSources).values([
      {
        source: "organic",
        visitors: 1200,
        pageViews: 4800,
        leads: 48,
        date: new Date().toISOString().split("T")[0],
        ownerId,
      },
      {
        source: "paid",
        visitors: 800,
        pageViews: 2400,
        leads: 64,
        date: new Date().toISOString().split("T")[0],
        ownerId,
      },
      {
        source: "social",
        visitors: 600,
        pageViews: 1800,
        leads: 18,
        date: new Date().toISOString().split("T")[0],
        ownerId,
      },
      {
        source: "referral",
        visitors: 400,
        pageViews: 1200,
        leads: 40,
        date: new Date().toISOString().split("T")[0],
        ownerId,
      },
    ]);

    await db.insert(activities).values([
      {
        action: "client.created",
        description: "New client signed up",
        resource: "client",
        resourceId: clientId,
        ownerId,
      },
      {
        action: "invoice.paid",
        description: "Invoice #INV-001 was paid",
        resource: "invoice",
        resourceId: "INV-001",
        ownerId,
      },
      {
        action: "subscription.upgraded",
        description: "Client upgraded to Pro plan",
        resource: "subscription",
        resourceId: sub1.id,
        ownerId,
      },
    ]);

    expect(ownerId).toEqual(expect.any(String));
    expect(clientId).toEqual(expect.any(String));
  });

  it("should calculate dashboard overview metrics", async () => {
    const overview = await getDashboardOverviewService(ownerId);

    expect(overview).toBeDefined();
    expect(overview.totalRevenue).toBeGreaterThan(0);
    expect(overview.activeUsers).toBeGreaterThan(0);
    expect(overview.churnRate).toBeGreaterThan(0);
    expect(overview.averageRevenuePerUser).toBeGreaterThan(0);
    expect(overview.mrr).toBeGreaterThan(0);
    expect(typeof overview.totalRevenueGrowth).toBe("number");
    expect(typeof overview.activeUsersGrowth).toBe("number");
    expect(typeof overview.churnRateGrowth).toBe("number");
  });

  it("should calculate MRR correctly", async () => {
    const overview = await getDashboardOverviewService(ownerId);

    expect(overview.mrr).toBe(398);
  });

  it("should return revenue analytics", async () => {
    const revenue = await getRevenueAnalyticsService(ownerId);

    expect(revenue).toBeDefined();
    expect(revenue.mrr).toBeGreaterThan(0);
    expect(revenue.arr).toBeGreaterThan(0);
    expect(revenue.monthlyRevenue).toBeInstanceOf(Array);
    expect(revenue.monthlyRevenue.length).toBeGreaterThanOrEqual(1);

    const latest = revenue.monthlyRevenue[0];
    expect(latest).toHaveProperty("month");
    expect(latest).toHaveProperty("revenue");
  });

  it("should return traffic sources with breakdown", async () => {
    const traffic = await getTrafficAnalyticsService(ownerId);

    expect(traffic).toBeDefined();
    expect(traffic.sources).toBeInstanceOf(Array);
    expect(traffic.sources.length).toBeGreaterThanOrEqual(4);
    expect(traffic.totalVisitors).toBeGreaterThan(0);
    expect(traffic.totalPageViews).toBeGreaterThan(0);
    expect(traffic.totalLeads).toBeGreaterThan(0);
    expect(traffic.conversionRate).toBeGreaterThan(0);

    const organic = traffic.sources.find((s) => s.source === "organic");
    expect(organic).toBeDefined();
    expect(organic!.visitors).toBe(1200);
    expect(organic!.percentage).toBeGreaterThan(0);
  });

  it("should return recent activities", async () => {
    const activity = await getRecentActivityService(ownerId);

    expect(activity).toBeInstanceOf(Array);
    expect(activity.length).toBeGreaterThanOrEqual(3);

    const first = activity[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("action");
    expect(first).toHaveProperty("description");
    expect(first).toHaveProperty("createdAt");
  });

  it("should return zeros for a user with no data", async () => {
    const otherUser = await registerUserService({
      name: "Empty Analytics",
      email: `empty-analytics-${ts}@nexusflow.dev`,
      password: "123456",
    });

    const overview = await getDashboardOverviewService(otherUser.id);
    expect(overview.totalRevenue).toBe(0);
    expect(overview.activeUsers).toBe(0);
    expect(overview.churnRate).toBe(0);
    expect(overview.mrr).toBe(0);

    const revenue = await getRevenueAnalyticsService(otherUser.id);
    expect(revenue.mrr).toBe(0);
    expect(revenue.arr).toBe(0);
    expect(revenue.monthlyRevenue).toEqual([]);

    const traffic = await getTrafficAnalyticsService(otherUser.id);
    expect(traffic.sources).toEqual([]);
    expect(traffic.totalVisitors).toBe(0);

    const activity = await getRecentActivityService(otherUser.id);
    expect(activity).toEqual([]);
  });
});
