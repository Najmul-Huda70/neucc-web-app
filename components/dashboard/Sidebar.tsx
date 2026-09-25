"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu, User, X } from "lucide-react";
import { SidebarProps, NavLink } from "@/lib/types";

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  userRole,
  user,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Role-based Nav Links (Matching your Prisma Schema Roles)
  const dashboardNavLinks: NavLink[] = [
  {
    label: "Overview",
    href: "/dashboard",
    roles: ["SUPER_ADMIN","ADMIN", "MODARATOR", "MEMBER"],
  },
  {
    label: "Committee Management",
    href: "/dashboard/committees",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "Notices",
    href: "/dashboard/notices",
    roles: ["ADMIN", "MODARATOR", "MEMBER"],
  },
  {
    label: "Profile Settings",
    href: "/dashboard/profile",
    roles: ["SUPER_ADMIN", "ADMIN", "MODARATOR", "MEMBER"],
  },
];
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* 1. MOBILE TOP BAR (Visible only on mobile screens)   */}
      {/* ---------------------------------------------------- */}
      <header
        className="lg:hidden w-full sticky top-0 z-30 h-14 px-4 border-b flex items-center justify-between shadow-sm shrink-0"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--btn-secondary-border)",
        }}
      >
        {/* Left: Logo */}
        <Link href="/" className="w-8 h-10 rounded overflow-hidden shrink-0 flex items-center">
          <Image
            src="/image/Logo-NeU-jpg.jpg"
            alt="Logo NeU"
            width={32}
            height={40}
            priority
            className="object-cover w-full h-full"
          />
        </Link>

        {/* Middle: Club Title */}
        <h1
          className="text-base font-bold tracking-tight text-center truncate px-2"
          style={{ color: "var(--text-primary)" }}
        >
          Computer Club
        </h1>

        {/* Right: Drawer Trigger Icon */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 rounded-lg border transition-all hover:opacity-80 shrink-0 cursor-pointer"
          style={{
            borderColor: "var(--btn-secondary-border)",
            color: "var(--text-primary)",
          }}
          aria-label="Open Drawer"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. BACKDROP FOR MOBILE DRAWER                        */}
      {/* ---------------------------------------------------- */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. SIDEBAR / MOBILE RIGHT DRAWER                     */}
      {/* ---------------------------------------------------- */}
      <aside
        className={`fixed lg:sticky top-0 z-50 w-72 h-screen h-[100dvh] border-l lg:border-l-0 lg:border-r flex flex-col transform transition-transform duration-300 ease-in-out shrink-0
          right-0 lg:left-0 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--btn-secondary-border)",
        }}
      >
        {/* Top Header Inside Sidebar */}
        <div
          className="p-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: "var(--btn-secondary-border)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="w-12 h-16 sm:w-14 sm:h-18 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
            >
              <Image
                src="/image/Logo-NeU-jpg.jpg"
                alt="Logo NeU"
                width={56}
                height={72}
                priority
                className="object-cover w-full h-full"
              />
            </Link>

            <div className="flex flex-col min-w-0">
              <Link
                href="/"
                className="text-base sm:text-lg font-bold leading-tight hover:opacity-80 transition-opacity truncate"
                style={{ color: "var(--text-primary)" }}
              >
                Computer Club
              </Link>
              <Link
                href="https://cse.neu.ac.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-semibold transition-colors truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                Department of CSE
              </Link>
              <Link
                href="https://neu.ac.bd"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-[11px] sm:text-xs flex items-center gap-1 font-bold truncate"
                style={{ color: "var(--text-important)" }}
              >
                <span className="truncate">Netrokona University</span>
                <ExternalLink
                  size={12}
                  className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg opacity-70 hover:opacity-100 shrink-0 transition-colors cursor-pointer"
            style={{ color: "var(--text-primary)" }}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items Filtered by Role */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 [scrollbar-width:thin] [scrollbar-color:var(--btn-secondary-border)_transparent]">
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                Dashboard
              </p>
              {/* Dynamic Role Badge */}
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-teal-500/10 text-teal-600 border border-teal-500/20">
                {userRole}
              </span>
            </div>

            <div className="space-y-1">
              {dashboardNavLinks
                .filter((link) => link.roles.includes(userRole))
                .map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive ? "shadow-sm" : "hover:opacity-80"
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? "var(--btn-primary-bg)"
                          : "transparent",
                        color: isActive
                          ? "var(--btn-primary-text)"
                          : "var(--text-primary)",
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        </nav>

        {/* User Info & Sign Out Footer */}
        <div
          className="p-3.5 border-t shrink-0 flex items-center justify-between gap-2"
          style={{ borderColor: "var(--btn-secondary-border)" }}
        >
          <Link
            href="/dashboard/profile"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 min-w-0 p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex-1"
          >
            <div
              className="w-9 h-9 rounded-full overflow-hidden shrink-0 border flex items-center justify-center bg-black/5 dark:bg-white/5"
              style={{ borderColor: "var(--btn-secondary-border)" }}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} style={{ color: "var(--text-secondary)" }} />
              )}
            </div>

            <div className="flex flex-col min-w-0 text-left">
              <span
                className="text-sm font-bold truncate leading-snug"
                style={{ color: "var(--text-primary)" }}
              >
                {user.name}
              </span>
              <span
                className="text-xs truncate leading-none"
                style={{ color: "var(--text-secondary)" }}
              >
                {user.email}
              </span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl border transition-all hover:opacity-80 shrink-0 cursor-pointer"
            style={{
              borderColor: "var(--btn-secondary-border)",
              color: "var(--text-important)",
              backgroundColor: "transparent",
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}