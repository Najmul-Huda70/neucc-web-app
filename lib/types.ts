import { Role, Status, Type } from "@/generated/prisma/client";

export { Role, Status, Type };

/* ============================================================
 * REUSABLE BASE TYPES
 * ============================================================ */

export interface Timestamps {
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface WithStatus {
  status: Status | string;
}

/* ============================================================
 * USER TYPES
 * ============================================================ */

export interface AuthUser extends WithStatus {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role | string;
}

export interface UserBase extends AuthUser, Timestamps {}

export interface JWTPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export type UserDetail = Partial<AuthUser>;

/* ============================================================
 * COMMITTEE & POST TYPES (API Response Compatible)
 * ============================================================ */

export interface UserPost extends Partial<WithStatus>, Partial<Timestamps> {
  user: UserDetail;
}

export interface Post extends WithStatus {
  postId: string;
  postTitle: string;
  user_posts: UserPost[];
}

export interface Committee extends WithStatus, Partial<Timestamps> {
  committeeId?: string;
  type: Type | string;
  year: number;
  session?: string;
  posts: Post[];
}

/* Base and Utility Types */
export type CommitteeBase = Omit<Committee, "posts">;
export type CreateCommitteeInput = Pick<Committee, "type"> & {
  session?: string;
  year?: number;
  status?: Status;
};

/* ============================================================
 * GENERIC API RESPONSE
 * ============================================================ */

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/* ============================================================
 * NAV / LAYOUT
 * ============================================================ */

export interface NavLink {
  label: string;
  href: string;
  roles: Role[];
}

export interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  userRole: Role;
}

export interface DashboardClientLayoutProps {
  children: React.ReactNode;
  user: AuthUser;
}