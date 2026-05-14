import { describe, expect, it } from "vitest";

import { registerUserService } from "./register-user-service";
import { loginUserService } from "./login-user-service";
import { AppError } from "../../utils/app-error";

const testEmail = `test-${Date.now()}@nexusflow.dev`;

describe("Auth Service", () => {
  describe("Register", () => {
    it("should register a new user successfully", async () => {
      const user = await registerUserService({
        name: "Test User",
        email: testEmail,
        password: "123456",
      });

      expect(user).toBeDefined();
      expect(user.id).toEqual(expect.any(String));
      expect(user.name).toBe("Test User");
      expect(user.email).toBe(testEmail);
      expect(user.role).toBeDefined();
      expect(user.createdAt).toEqual(expect.any(Date));
      expect((user as any).password).toBeUndefined();
    });

    it("should reject duplicate email", async () => {
      await expect(
        registerUserService({
          name: "Test User 2",
          email: testEmail,
          password: "654321",
        }),
      ).rejects.toThrow(AppError);
    });
  });

  describe("Login", () => {
    it("should login successfully and return token + user", async () => {
      const result = await loginUserService({
        email: testEmail,
        password: "123456",
      });

      expect(result).toBeDefined();
      expect(result.token).toEqual(expect.any(String));
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testEmail);
      expect((result.user as any).password).toBeUndefined();
    });

    it("should reject invalid password", async () => {
      await expect(
        loginUserService({
          email: testEmail,
          password: "wrong-password",
        }),
      ).rejects.toThrow(AppError);
    });

    it("should reject non-existent email", async () => {
      await expect(
        loginUserService({
          email: "nonexistent@nexusflow.dev",
          password: "123456",
        }),
      ).rejects.toThrow(AppError);
    });
  });
});
