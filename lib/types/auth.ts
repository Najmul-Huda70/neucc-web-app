import { Role, Status } from "@/generated/prisma/client";

export { Role, Status };

// User Base Interface
export interface UserBase {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  status: Status;
  postId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// NextAuth Session User Type
export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  status: Status;
}

// Client Side Component Props User Type
export interface DynamicUserProps {
  name: string;
  email: string;
  image?: string;
  role: Role;
}

export interface LoginResponse {
  message: string;
  user: {
    userId: string;
    name: string;
    role: Role;
  };
}
// JWT Payload Interface
export interface JWTPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}