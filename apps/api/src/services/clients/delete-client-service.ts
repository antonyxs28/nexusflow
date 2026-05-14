import { and, eq } from "drizzle-orm";

import { db } from "../../db";
import { clients } from "../../db/schema/clients";
import { AppError } from "../../utils/app-error";

export async function deleteClientService(
  id: string,
  ownerId: string,
): Promise<void> {
  const [existing] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.ownerId, ownerId)));

  if (!existing) {
    throw new AppError("Client not found", 404);
  }

  await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.ownerId, ownerId)));
}
