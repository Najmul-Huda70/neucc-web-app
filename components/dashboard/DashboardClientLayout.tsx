"use client";

import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { DashboardClientLayoutProps } from "@/lib/types";

export default function DashboardClientLayout({
  children,
  user,
}: DashboardClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userRole={user.role}
        user={{
          name: user.name,
          email: user.email,
          image: user.image || undefined,
          role: user.role,
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}