import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { registerSchema } from "@nexusflow/schemas";
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
  const { name, email, password } = registerSchema.parse(input);

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
