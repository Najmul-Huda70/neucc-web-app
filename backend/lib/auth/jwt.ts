import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// jose (not jsonwebtoken) because it runs in the Edge runtime, which is what
// Next.js middleware.ts uses — jsonwebtoken depends on Node's crypto module
// and will throw inside middleware.

const ACCESS_SECRET = new TextEncoder().encode(requireEnv("JWT_ACCESS_SECRET"));
const REFRESH_SECRET = new TextEncoder().encode(requireEnv("JWT_REFRESH_SECRET"));

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "30d";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export interface AccessTokenPayload extends JWTPayload {
  sub: string; // userId
  role: "ELECTION_COMMITTEE" | "EXECUTIVE_COMMITTEE";
  postId: string | null;
  committeeId: string | null;
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string; // userId
}

export async function signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRES_IN)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: Omit<RefreshTokenPayload, "iat" | "exp">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES_IN)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as AccessTokenPayload;
  } catch {
    return null; // expired, malformed, or wrong signature
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as RefreshTokenPayload;
  } catch {
    return null;
  }
}
