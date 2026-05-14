import type { FastifyInstance } from "fastify";

import { createClientSchema, updateClientSchema } from "@nexusflow/schemas";

import { authMiddleware } from "../middlewares/auth-middleware";
import { createClientService } from "../services/clients/create-client-service";
import { getClientsService } from "../services/clients/get-clients-service";
import { getClientByIdService } from "../services/clients/get-client-by-id-service";
import { updateClientService } from "../services/clients/update-client-service";
import { deleteClientService } from "../services/clients/delete-client-service";
import { AppError } from "../utils/app-error";

export async function clientRoutes(server: FastifyInstance) {
  server.addHook("preHandler", authMiddleware);

  server.post("/", async (request, reply) => {
    const body = createClientSchema.parse(request.body);

    const client = await createClientService({
      ...body,
      ownerId: request.user.sub,
    });

    return reply.status(201).send({ client });
  });

  server.get("/", async (request) => {
    const list = await getClientsService(request.user.sub);

    return { clients: list };
  });

  server.get("/:id", async (request) => {
    const { id } = request.params as { id: string };

    const client = await getClientByIdService(id, request.user.sub);

    return { client };
  });

  server.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateClientSchema.parse(request.body);

    const client = await updateClientService(id, request.user.sub, body);

    return reply.send({ client });
  });

  server.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    await deleteClientService(id, request.user.sub);

    return reply.status(204).send();
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
