import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

export interface RateLimitConfig {
  max: number;
  timeWindow: string;
}

export async function registerRateLimiter(
  instance: FastifyInstance,
  config: RateLimitConfig,
) {
  await instance.register(rateLimit, {
    max: config.max,
    timeWindow: config.timeWindow,
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (_request, context) => {
      const retryAfter = Math.ceil((context.ttl || 60000) / 1000);
      return {
        message: `Too many requests. Try again in ${retryAfter}s.`,
        statusCode: 429,
        error: "Too Many Requests",
      };
    },
    hook: "onRequest",
  });
}
