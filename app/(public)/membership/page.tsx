"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function MembershipPage() {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    userId: "",
    name: "",
    session: "",
  });

  // Workflow steps: "email" | "otp" | "details"
  const [step, setStep] = useState<"email" | "otp" | "details">("email");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send Verification OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/membership/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("OTP sent to your email!");
        setStep("otp");
      } else {
        toast.error(json.error || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/membership/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Email verified successfully!");
        setStep("details");
      } else {
        toast.error(json.error || "Invalid or expired OTP");
      }
    } catch (err) {
      toast.error("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Membership Registration
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Session Regex Check
    const sessionRegex = /^\d{4}-\d{2}$/;
    if (!sessionRegex.test(formData.session.trim())) {
      toast.error("Invalid Session format. Use structure like '2022-23'");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          userId: formData.userId,
          name: formData.name,
          session: formData.session,
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Registration successful! Your account is pending activation.");
        setFormData({ email: "", otp: "", userId: "", name: "", session: "" });
        setStep("email");
      } else {
        toast.error(json.error || json.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-(--bg-app) px-4 py-8 text-(--text-primary)">
      {/* Toast Notification Container */}
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="w-full max-w-md rounded-2xl bg-(--card-bg) border border-(--border-color) p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-2">Apply for Membership</h2>
        <p className="text-xs text-center text-(--text-secondary) mb-6">
          {step === "email" && "Step 1: Enter your email address to receive OTP"}
          {step === "otp" && "Step 2: Enter the 6-digit OTP sent to your email"}
          {step === "details" && "Step 3: Fill in your personal details to complete registration"}
        </p>

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
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {loading ? "Sending OTP..." : "Send Verification OTP"}
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
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-1/3 py-3 px-4 rounded-xl border border-(--border-color) text-xs font-semibold hover:bg-(--bg-app) text-(--text-primary)"
              >
                Change Email
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 px-4 rounded-xl bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
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
                Email Address (Verified)
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm opacity-60 cursor-not-allowed text-(--text-primary)"
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
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
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
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
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
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3.5 py-2.5 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}