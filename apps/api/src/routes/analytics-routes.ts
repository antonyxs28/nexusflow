import type { FastifyInstance } from "fastify";

import { authMiddleware } from "../middlewares/auth-middleware";
import { getDashboardOverviewService } from "../services/analytics/get-dashboard-overview-service";
import { getRevenueAnalyticsService } from "../services/analytics/get-revenue-analytics-service";
import { getTrafficAnalyticsService } from "../services/analytics/get-traffic-analytics-service";
import { getRecentActivityService } from "../services/analytics/get-recent-activity-service";
import { AppError } from "../utils/app-error";

import { bearerAuth } from "../docs/schema-builders";
import { logger } from "../utils/logger";

export async function analyticsRoutes(server: FastifyInstance) {
  server.addHook("preHandler", authMiddleware);

  server.get(
    "/overview",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Dashboard overview",
        description:
          "Returns dashboard overview metrics including revenue, active users, churn rate, and MRR.",
        security: bearerAuth,
        response: {
          200: {
            description: "Dashboard overview metrics",
            $ref: "DashboardOverviewResponse",
          },
          401: {
            description: "Unauthorized",
            $ref: "Error",
          },
        },
      },
    },
    async (request) => {
      const overview = await getDashboardOverviewService(request.user.sub);

      return { overview };
    },
  );

  server.get(
    "/revenue",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Revenue analytics",
        description:
          "Returns revenue analytics including monthly breakdown, MRR, and ARR.",
        security: bearerAuth,
        response: {
          200: {
            description: "Revenue analytics data",
            $ref: "RevenueAnalytics",
          },
          401: {
            description: "Unauthorized",
            $ref: "Error",
          },
        },
      },
    },
    async (request) => {
      const revenue = await getRevenueAnalyticsService(request.user.sub);

      return revenue;
    },
  );

  server.get(
    "/traffic",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Traffic analytics",
        description:
          "Returns traffic analytics with source breakdown, visitor counts, conversion rates, and totals.",
        security: bearerAuth,
        response: {
          200: {
            description: "Traffic analytics data",
            $ref: "TrafficAnalytics",
          },
          401: {
            description: "Unauthorized",
            $ref: "Error",
          },
        },
      },
    },
    async (request) => {
      const traffic = await getTrafficAnalyticsService(request.user.sub);

      return traffic;
    },
  );

  server.get(
    "/activity",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Recent activity",
        description:
          "Returns the most recent activities for the authenticated user.",
        security: bearerAuth,
        response: {
          200: {
            description: "Recent activity list",
            $ref: "RecentActivity",
          },
          401: {
            description: "Unauthorized",
            $ref: "Error",
          },
        },
      },
    },
    async (request) => {
      const activity = await getRecentActivityService(request.user.sub);

      return { activities: activity };
    },
  );

  server.setErrorHandler(async (error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
      });
    }

    const zodError = error as any;
    if (zodError.name === "ZodError") {
      return reply.status(400).send({
        message: "Validation error",
        errors: zodError.issues ?? zodError.errors,
      });
    }

    logger.error(error);
    return reply.status(500).send({
      message: "Internal server error",
    });
  });
}
