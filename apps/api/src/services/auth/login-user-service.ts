import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import type { AuthResponse, SafeUser } from "@nexusflow/types";

import { signAccessToken } from "../../utils/jwt";
import { db } from "../../db";
import { users } from "../../db/schema/users";
import { AppError } from "../../utils/app-error";

interface LoginUserServiceInput {
  email: string;
  password: string;
}

export async function loginUserService(
  input: LoginUserServiceInput,
): Promise<AuthResponse> {
  const { email, password } = input;
  const normalizedEmail = email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = signAccessToken(user.id, user.role ?? "");

  const safeUser: SafeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  return {
    token: accessToken,
    user: safeUser,
  };
}
