"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function MembershipFormClient() {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    userId: "",
    name: "",
    session: "",
    website_hp: "", // Bot protection honeypot
  });

  // Workflow steps: "email" | "otp" | "details"
  const [step, setStep] = useState<"email" | "otp" | "details">("email");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // OTP Resend Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send Verification OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website_hp) return; // Silent reject for bots

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/membership/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("OTP sent to your email!");
        setStep("otp");
        setCooldown(60); // 60 seconds cooldown
      } else {
        toast.error(json.error || "Failed to send OTP");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/membership/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          otp: formData.otp.trim(),
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Email verified successfully!");
        setStep("details");
      } else {
        toast.error(json.error || "Invalid or expired OTP");
      }
    } catch {
      toast.error("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Membership Registration
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sessionRegex = /^\d{4}-\d{2}$/;
    if (!sessionRegex.test(formData.session.trim())) {
      toast.error("Invalid Session format. Use structure like '2022-23'");
      return;
    }

    if (formData.name.trim().length < 3) {
      toast.error("Name must be at least 3 characters long");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          userId: formData.userId.trim(),
          name: formData.name.trim(),
          session: formData.session.trim(),
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Registration successful! Your account is pending activation.");
        setFormData({ email: "", otp: "", userId: "", name: "", session: "", website_hp: "" });
        setStep("email");
      } else {
        toast.error(json.error || json.message || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-(--bg-app) px-4 py-8 text-(--text-primary)">
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="w-full max-w-md rounded-sm bg-(--card-bg) border border-(--border-color) p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-2">Apply for Membership</h2>
        <p className="text-xs text-center text-(--text-secondary) mb-6">
          {step === "email" && "Step 1: Enter your email address to receive OTP"}
          {step === "otp" && "Step 2: Enter the 6-digit OTP sent to your email"}
          {step === "details" && "Step 3: Fill in your personal details to complete registration"}
        </p>

        {/* Hidden Honeypot Field */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="website_hp"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website_hp}
            onChange={handleChange}
          />
        </div>

        {/* Step 1: Email Form */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="student@neu.ac.bd"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-sm border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full mt-2 py-3 px-4 rounded-sm bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {loading
                ? "Sending OTP..."
                : cooldown > 0
                  ? `Resend OTP in ${cooldown}s`
                  : "Send Verification OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Enter Verification OTP
              </label>
              <input
                type="text"
                name="otp"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                className="w-full rounded-sm border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm tracking-widest text-center font-bold text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-1/3 py-3 px-4 rounded-sm border border-(--border-color) text-xs font-semibold hover:bg-(--bg-app) text-(--text-primary)"
              >
                Change Email
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 px-4 rounded-sm bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Complete Registration Form */}
        {step === "details" && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Email Address (Verified ✓)
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-sm border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm opacity-60 cursor-not-allowed text-(--text-primary)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                User ID / Student ID
              </label>
              <input
                type="text"
                name="userId"
                placeholder="e.g. 20221001"
                value={formData.userId}
                onChange={handleChange}
                className="w-full rounded-sm border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-sm border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Academic Session (Format: YYYY-YY)
              </label>
              <input
                type="text"
                name="session"
                placeholder="e.g. 2022-23"
                value={formData.session}
                onChange={handleChange}
                className="w-full rounded-sm border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-sm bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}