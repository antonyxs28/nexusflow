import "dotenv/config";

import { fastify } from "fastify";
import { corsPlugin } from "./plugins/cors";
import { docsPlugin } from "./plugins/docs";
import { registerRateLimiter } from "./plugins/rate-limiter";
import { analyticsRoutes } from "./routes/analytics-routes";
import { authRoutes } from "./routes/auth-routes";
import { clientRoutes } from "./routes/client-routes";
import { errorHandler } from "./errors";
import { env } from "./env";
import { validateJwtSecret } from "./utils/jwt";
import {
  logger,
  printStartupBanner,
  printEndpointList,
  logServerStart,
  logResponse,
} from "./utils/logger";
import type { EndpointGroup } from "./utils/logger";

export const server = fastify({
  logger: false,
  trustProxy: true,
});

const PORT = env.PORT;
const HOST = env.HOST;
const ENV = env.NODE_ENV;

server.addHook("onResponse", async (request, reply) => {
  if (request.url.startsWith("/reference")) return;
  logResponse(
    request.method,
    request.url,
    reply.statusCode,
    reply.elapsedTime,
  );
});

server.register(corsPlugin);
server.register(docsPlugin);

server.setErrorHandler(errorHandler);

server.get(
  "/",
  {
    schema: {
      tags: ["Health"],
      summary: "Health check",
      description: "Returns a simple health check response to confirm the API is running.",
      response: {
        200: {
          description: "Server is healthy",
          type: "string",
        },
      },
    },
  },
  async (_request, reply) => {
    return reply.send("Hello, World!");
  },
);

server.register(authRoutes, { prefix: "/auth" });
server.register(clientRoutes, { prefix: "/clients" });
server.register(analyticsRoutes, { prefix: "/analytics" });

const groups: EndpointGroup[] = [
  {
    tag: "Health",
    color: "#6b7280",
    routes: [{ method: "GET", path: "/" }],
  },
  {
    tag: "Auth",
    color: "#a855f7",
    routes: [
      { method: "POST", path: "/auth/register" },
      { method: "POST", path: "/auth/login" },
      { method: "GET", path: "/auth/me" },
    ],
  },
  {
    tag: "Clients",
    color: "#3b82f6",
    routes: [
      { method: "POST", path: "/clients" },
      { method: "GET", path: "/clients" },
      { method: "GET", path: "/clients/:id" },
      { method: "PATCH", path: "/clients/:id" },
      { method: "DELETE", path: "/clients/:id" },
    ],
  },
  {
    tag: "Analytics",
    color: "#f59e0b",
    routes: [
      { method: "GET", path: "/analytics/overview" },
      { method: "GET", path: "/analytics/revenue" },
      { method: "GET", path: "/analytics/traffic" },
      { method: "GET", path: "/analytics/activity" },
    ],
  },
];

const start = async () => {
  try {
    validateJwtSecret(env.JWT_SECRET);

    await registerRateLimiter(server, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    });

    await server.ready();

    printStartupBanner({
      port: PORT,
      host: HOST === "0.0.0.0" ? "localhost" : HOST,
      env: ENV,
      version: "1.0.0",
    });

    printEndpointList(groups);

    await server.listen({ port: PORT, host: HOST });
    logServerStart(PORT, HOST === "0.0.0.0" ? "localhost" : HOST);
  } catch (err) {
    logger.fatal("Failed to start server");
    logger.error(err);
    process.exit(1);
  }
};

start();
