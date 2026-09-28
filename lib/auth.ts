import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Role } from "@/lib/types";

export async function verifyRole(allowedRoles: Role[]) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        isAuthorized: false,
        message: "Unauthorized access: No token found",
        status: 401,
      };
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );

    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role as Role;

    if (!allowedRoles.includes(userRole)) {
      return {
        isAuthorized: false,
        message: "Forbidden: You do not have permission",
        status: 403,
      };
    }

    return { isAuthorized: true, user: payload };
  } catch (error) {
    console.error("Auth verification failed:", error);
    return {
      isAuthorized: false,
      message: "Unauthorized access: Invalid or expired token",
      status: 401,
    };
  }
}