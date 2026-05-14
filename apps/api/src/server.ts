import "dotenv/config";

import { fastify } from "fastify";
import { docsPlugin } from "./plugins/docs";
import { analyticsRoutes } from "./routes/analytics-routes";
import { authRoutes } from "./routes/auth-routes";
import { clientRoutes } from "./routes/client-routes";
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
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const ENV = process.env.NODE_ENV || "development";

server.addHook("onResponse", async (request, reply) => {
  if (request.url.startsWith("/reference")) return;
  logResponse(
    request.method,
    request.url,
    reply.statusCode,
    reply.elapsedTime,
  );
});

server.register(docsPlugin);

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
