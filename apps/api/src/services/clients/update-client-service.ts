import { and, eq } from "drizzle-orm";

import { updateClientSchema } from "@nexusflow/schemas";
import type { Client, UpdateClientInput } from "@nexusflow/types";

import { db } from "../../db";
import { clients } from "../../db/schema/clients";
import { AppError } from "../../utils/app-error";

export async function updateClientService(
  id: string,
  ownerId: string,
  input: UpdateClientInput,
): Promise<Client> {
  const values = updateClientSchema.parse(input);

  const [existing] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.ownerId, ownerId)));

  if (!existing) {
    throw new AppError("Client not found", 404);
  }

  const [client] = await db
    .update(clients)
    .set(values)
    .where(and(eq(clients.id, id), eq(clients.ownerId, ownerId)))
    .returning();

  return client;
}
