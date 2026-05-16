import { createClientSchema } from "@nexusflow/schemas";
import type { Client, CreateClientInput } from "@nexusflow/types";

import { db } from "../../db";
import { clients } from "../../db/schema/clients";
import { AppError } from "../../utils/app-error";

export async function createClientService(
  input: CreateClientInput & { ownerId: string },
): Promise<Client> {
  const { ownerId, ...data } = input;
  const values = createClientSchema.parse(data);

  const [client] = await db
    .insert(clients)
    .values({ ...values, ownerId })
    .returning();

  if (!client) {
    throw new AppError("Failed to create client", 500);
  }

  return client;
}
