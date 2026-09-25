"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // User ID অটোমেটিক Uppercase করবে এবং ইনপুট পরিবর্তন হলে এরর মুছে দেবে
    setUserId(e.target.value.toUpperCase());
    if (errorMessage) setErrorMessage("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const cleanUserId = userId.trim();
    const cleanPassword = password.trim();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: cleanUserId, password: cleanPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid User ID or Password");
      }

      // Refresh to update cookie state before redirecting
      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div
        className="w-full max-w-md p-6 sm:p-8 rounded-2xl border shadow-xl transition-colors duration-300"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--btn-secondary-border)",
        }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Welcome Back
          </h1>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Please enter your credentials to sign in
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            className="mb-5 p-3 rounded-xl text-sm text-center font-semibold bg-red-500/10 border border-red-500/20 animate-shake"
            style={{ color: "var(--text-important)" }}
          >
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User ID Field */}
          <div>
            <label
              htmlFor="userId"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              User ID
            </label>
            <input
              id="userId"
              type="text"
              required
              value={userId}
              onChange={handleUserIdChange}
              placeholder="e.g. CSE2024001"
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-teal-500/50 uppercase"
              style={{
                backgroundColor: "var(--stat-card-bg)",
                color: "var(--text-primary)",
                borderColor: "var(--btn-secondary-border)",
              }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl border text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-teal-500/50"
                style={{
                  backgroundColor: "var(--stat-card-bg)",
                  color: "var(--text-primary)",
                  borderColor: "var(--btn-secondary-border)",
                }}
              />

              {/* Show/Hide Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                style={{ color: "var(--text-secondary)" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md mt-2"
            style={{
              backgroundColor: "var(--btn-primary-bg)",
              color: "var(--btn-primary-text)",
            }}
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}