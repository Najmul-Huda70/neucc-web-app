import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Used only when election result publication (Step 6) creates brand-new
// Executive Committee accounts for winning candidates. The plaintext is
// returned once in that API's response (to be emailed via the Part 9
// notification service once it exists) — never stored anywhere except as
// its bcrypt hash via hashPassword() above.
export function generateTempPassword(): string {
  return crypto.randomBytes(9).toString("base64url"); // 12-char URL-safe string, >= the 12-char min UserCreateSchema requires
}
