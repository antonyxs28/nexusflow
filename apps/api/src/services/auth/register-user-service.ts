import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import type { SafeUser } from "@nexusflow/types";

import { db } from "../../db";
import { users } from "../../db/schema/users";
import { AppError } from "../../utils/app-error";

interface RegisterUserServiceInput {
  name: string;
  email: string;
  password: string;
}

export async function registerUserService(
  input: RegisterUserServiceInput,
): Promise<SafeUser> {
  const { name, email, password } = input;
  const normalizedEmail = email.toLowerCase().trim();

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    })
    .returning();

  const createdUser = user!;

  return {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    role: createdUser.role,
    createdAt: createdUser.createdAt,
  };
}
