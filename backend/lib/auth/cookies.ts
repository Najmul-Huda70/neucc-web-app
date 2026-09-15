import { cookies } from "next/headers";

const isProd = process.env.NODE_ENV === "production";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const baseCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...baseCookie, maxAge: 60 * 15 }); // 15 min
  store.set(REFRESH_COOKIE, refreshToken, { ...baseCookie, maxAge: 60 * 60 * 24 * 30 }); // 30 days
}

export function setAccessCookie(accessToken: string) {
  cookies().set(ACCESS_COOKIE, accessToken, { ...baseCookie, maxAge: 60 * 15 });
}

export function clearAuthCookies() {
  const store = cookies();
  store.set(ACCESS_COOKIE, "", { ...baseCookie, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...baseCookie, maxAge: 0 });
}
