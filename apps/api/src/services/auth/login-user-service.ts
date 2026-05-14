import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { loginSchema } from "@nexusflow/schemas";
import type { AuthResponse, JwtPayload, SafeUser } from "@nexusflow/types";

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
  const { email, password } = loginSchema.parse(input);

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: "7d",
  });

  const safeUser: SafeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  return {
    token,
    user: safeUser,
  };
}
