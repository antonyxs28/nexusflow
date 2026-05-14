import "dotenv/config";

import { fastify, type FastifyReply, type FastifyRequest } from "fastify";
import { authRoutes } from "./routes/auth-routes";
import { clientRoutes } from "./routes/client-routes";

export const server = fastify();

server.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.send("Hello, World!");
});

server.register(authRoutes, { prefix: "/auth" });
server.register(clientRoutes, { prefix: "/clients" });

const start = async () => {
  try {
    await server.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Server is running at http://localhost:3001");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
