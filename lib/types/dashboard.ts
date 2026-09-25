import { Role } from "@/generated/prisma/client";
import { AuthUser, DynamicUserProps } from "./auth";

// Navigation Link Type
export interface NavLink {
  label: string;
  href: string;
  roles: Role[];
}

// Sidebar Component Props
export interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  userRole: Role;
  user: {
    name: string;
    email: string;
    image?: string;
    role: Role;
  };
}

// Client Layout Component Props
export interface DashboardClientLayoutProps {
  children: React.ReactNode;
  user: AuthUser;
}