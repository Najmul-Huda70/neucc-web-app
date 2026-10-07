import { loginSchema } from "@/lib/validations/auth";
import { describe, it, expect } from "vitest";

describe("Login Form Validation Schema", () => {
  describe("Valid Inputs", () => {
    it("should pass when valid userId and password are provided", () => {
      const input = {
        userId: "user123",
        password: "securePassword123",
        rememberMe: true,
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe("user123");
        expect(result.data.password).toBe("securePassword123");
        expect(result.data.rememberMe).toBe(true);
      }
    });

    it("should automatically trim leading and trailing spaces from userId", () => {
      const input = {
        userId: "   user123   ",
        password: "password123",
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe("user123");
      }
    });

    it("should allow rememberMe to be omitted/undefined", () => {
      const input = {
        userId: "user123",
        password: "password123",
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBeUndefined();
      }
    });
  });

  describe("Invalid Inputs", () => {
    it("should fail when userId is an empty string", () => {
      const input = {
        userId: "",
        password: "password123",
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("User ID is required");
      }
    });

    it("should fail when userId contains only whitespace", () => {
      const input = {
        userId: "   ",
        password: "password123",
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("User ID is required");
      }
    });

    it("should fail when password is missing or empty", () => {
      const input = {
        userId: "user123",
        password: "",
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is required");
      }
    });

    it("should fail when data types are invalid", () => {
      const input = {
        userId: 12345, // invalid type (number)
        password: "password123",
        rememberMe: "true", // invalid type (string)
      };

      const result = loginSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });
});