import type { FastifyInstance } from "fastify";

import { authMiddleware } from "../middlewares/auth-middleware";
import { getDashboardOverviewService } from "../services/analytics/get-dashboard-overview-service";
import { getRevenueAnalyticsService } from "../services/analytics/get-revenue-analytics-service";
import { getTrafficAnalyticsService } from "../services/analytics/get-traffic-analytics-service";
import { getRecentActivityService } from "../services/analytics/get-recent-activity-service";
import { AppError } from "../utils/app-error";

export async function analyticsRoutes(server: FastifyInstance) {
  server.addHook("preHandler", authMiddleware);

  server.get("/overview", async (request) => {
    const overview = await getDashboardOverviewService(request.user.sub);

    return { overview };
  });

  server.get("/revenue", async (request) => {
    const revenue = await getRevenueAnalyticsService(request.user.sub);

    return revenue;
  });

  server.get("/traffic", async (request) => {
    const traffic = await getTrafficAnalyticsService(request.user.sub);

    return traffic;
  });

  server.get("/activity", async (request) => {
    const activity = await getRecentActivityService(request.user.sub);

    return { activities: activity };
  });

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

    console.error(error);
    return reply.status(500).send({
      message: "Internal server error",
    });
  });
}
