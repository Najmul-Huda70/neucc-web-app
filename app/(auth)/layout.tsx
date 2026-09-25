import React from "react";

export const metadata = {
  title: "Authentication | Computer Club Portal",
  description: "Sign in to access the university committee dashboard",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg-app)",
      }}
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}