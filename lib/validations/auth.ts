// lib/validations/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  userId: z
    .string({ message: "User ID is required" })
    .trim()
    .min(1, "User ID is required"),
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;