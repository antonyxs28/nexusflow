import { eq } from "drizzle-orm";

import type { SafeUser } from "@nexusflow/types";

import { db } from "../../db";
import { users } from "../../db/schema/users";
import { AppError } from "../../utils/app-error";

export async function getUserByIdService(id: string): Promise<SafeUser> {
  const [user] = await db.select().from(users).where(eq(users.id, id));

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
