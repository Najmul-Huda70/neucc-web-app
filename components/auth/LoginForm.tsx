"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const processedError = useRef<string | null>(null);

  const clearError = () => {
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId.trim(),
          password: password.trim(),
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid User ID or password");
      }

      router.refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google login error handling
  useEffect(() => {
    const error = searchParams.get("error");

    if (!error) return;
    if (processedError.current === error) return;

    processedError.current = error;

    switch (error) {
      case "user_not_found":
        toast.error("Account not found. Only registered members can sign in.", {
          duration: 4000,
          id: "google-user-not-found",
        });
        break;

      case "account_deactivated":
        toast.error("Your account is currently inactive or DEACTIVATED.", {
          duration: 4000,
          id: "google-account-deactivated",
        });
        break;

      case "google_auth_failed":
        toast.error("Google authentication failed. Please try again.", {
          duration: 4000,
          id: "google-auth-failed",
        });
        break;

      case "no_code":
        toast.error("Google login authorization code missing.", {
          duration: 4000,
          id: "google-no-code",
        });
        break;

      default:
        toast.error("Something went wrong. Please try again.", {
          duration: 4000,
          id: "google-login-error",
        });
    }

    router.replace("/login");
  }, [searchParams, router]);

  const handleGoogleLogin = () => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options = {
      redirect_uri: `${window.location.origin}/api/auth/callback/google`,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <div className="p-8 sm:p-10 flex flex-col justify-center">
      <span
        className="text-xs font-bold tracking-wider uppercase mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        Member portal
      </span>
      <h1
        className="text-2xl sm:text-3xl font-bold tracking-tight mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Log in to your profile
      </h1>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border font-semibold text-sm cursor-pointer transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "var(--badge-bg)",
          color: "var(--badge-text)",
          borderColor: "var(--badge-bg)",
        }}
      >
        <svg width="17" height="17" viewBox="0 0 48 48">
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 6.1 29.6 4 24 4 16 4 9.1 8.4 6.3 14.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.6 35 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9 39.6 15.9 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.8l6.5 5.5C41.5 36 44 30.6 44 24c0-1.4-.1-2.7-.4-3.5z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 my-6">
        <span
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--btn-secondary-border)" }}
        />
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--text-primary)", opacity: 0.5 }}
        >
          OR
        </span>
        <span
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--btn-secondary-border)" }}
        />
      </div>

      {errorMessage && (
        <div
          className="mb-5 p-3 rounded-xl text-sm text-center font-semibold bg-red-500/10 border border-red-500/20 animate-shake"
          style={{ color: "var(--text-important)" }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="userId"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            User ID
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18v12H3z" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <input
              id="userId"
              type="text"
              required
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                clearError();
              }}
              placeholder="Enter your user ID"
              className="w-full py-3 pl-10 pr-4 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-teal-500/50"
              style={{
                backgroundColor: "var(--stat-card-bg)",
                color: "var(--text-primary)",
                borderColor: "var(--btn-secondary-border)",
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold shrink-0"
              style={{ color: "var(--text-primary)" }}
            >
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-xs font-semibold shrink-0 hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              placeholder="Enter your password"
              className="w-full py-3 pl-10 pr-14 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-teal-500/50"
              style={{
                backgroundColor: "var(--stat-card-bg)",
                color: "var(--text-primary)",
                borderColor: "var(--btn-secondary-border)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-teal-600 focus:ring-2 focus:ring-teal-500/50"
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Remember me for a month
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-md"
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
            "Log in"
          )}
        </button>
      </form>

      <p
        className="text-center text-sm mt-5"
        style={{ color: "var(--text-primary)", opacity: 0.65 }}
      >
        Not a member yet?{" "}
        <a
          href="/membership"
          className="font-semibold hover:underline"
          style={{ color: "var(--text-secondary)" }}
        >
          Apply for the membership
        </a>
      </p>
    </div>
  );
}