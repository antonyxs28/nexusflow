import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import cors from "@fastify/cors";

import { env } from "../env";
import { logger } from "../utils/logger";

async function corsPluginInner(server: FastifyInstance) {
  const origins: (string | RegExp)[] = [env.CORS_ORIGIN];

  if (env.CORS_ORIGIN_REGEX) {
    try {
      origins.push(new RegExp(env.CORS_ORIGIN_REGEX));
    } catch {
      logger.warn(`Invalid CORS_ORIGIN_REGEX, ignoring: ${env.CORS_ORIGIN_REGEX}`);
    }
  }

  const allowedMethods = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"];
  const allowedHeaders = [
    "Authorization",
    "Content-Type",
    "X-Requested-With",
  ];
  const exposedHeaders = ["X-Request-Id"];

  await server.register(cors, {
    origin: origins,
    methods: allowedMethods,
    allowedHeaders,
    exposedHeaders,
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    strictPreflight: true,
  });

  logger.info(`CORS enabled for origins: ${origins.join(", ")}`);
}

export const corsPlugin = fp(corsPluginInner, {
  name: "cors-plugin",
});
