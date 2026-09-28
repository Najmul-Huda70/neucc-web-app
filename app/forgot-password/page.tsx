"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Mail, KeyRound, Lock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Multi-step State: 1 = Send OTP, 2 = Verify OTP, 3 = New Password
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form States
  const [identifier, setIdentifier] = useState("");
  const [userId, setUserId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetOtpExpiresAt, setResetOtpExpiresAt] = useState<string | Date | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(false);

  useEffect(() => {
    if (step !== 2 || !resetOtpExpiresAt) return;

    const updateTimer = () => {
      // Expiry time এবং Current time এর পার্থক্য হিসাব করা
      const expiresAt = new Date(resetOtpExpiresAt).getTime();
      const now = new Date().getTime();
      const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

      setTimer(remainingSeconds);

      if (remainingSeconds === 0) {
        setCanResend(true);
      } else {
        setCanResend(false);
      }
    };

    // প্রথমে একবার রান করে টাইমার সেট করা
    updateTimer();

    // প্রতি ১ সেকেন্ড পরপর টাইমার আপডেট করা
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [step, resetOtpExpiresAt]);
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("A new OTP has been sent to your email!");

      // ব্যাকএন্ড থেকে আসা নতুন Expiration Time সেভ করুন
      if (data.resetOtpExpiresAt) {
        setResetOtpExpiresAt(data.resetOtpExpiresAt);
      }
      setOtp("");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };
  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUserId(data.userId);
      setMaskedEmail(data.emailMasked);
      if (data.resetOtpExpiresAt) {
        setResetOtpExpiresAt(data.resetOtpExpiresAt);
      } else if (data.expiresAt) {
        setResetOtpExpiresAt(data.expiresAt);
      }
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("OTP Verified!");
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] relative">

        {/* LEFT SIDE (Branding) */}
        <div className="md:col-span-5 bg-[#f8faf9] p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden border-r border-slate-100">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#e8f3f0] rounded-full opacity-60 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col">
              <span className="font-bold text-base text-slate-800">Computer Club</span>
              <span className="text-xs text-teal-700 font-medium">Department of CSE</span>
              <a href="#" className="text-[11px] text-teal-600 font-semibold inline-flex items-center gap-0.5 hover:underline">
                Netrokona University <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <div className="relative z-10 my-10 space-y-3">
            <div className="w-8 h-1 bg-teal-700 rounded-full" />
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
              Reset Your Password Securely
            </h2>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Verify your identity via email OTP to set up a new password for your portal account.
            </p>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Netrokona University</span>
            <span>Developed by Najmul Huda</span>
          </div>
        </div>

        {/* RIGHT SIDE (Form Steps) */}
        <div className="md:col-span-7 bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-[380px] w-full mx-auto space-y-6">

            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>

            {/* STEP 1: Enter User ID or Email */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase">STEP 1 OF 3</span>
                  <h1 className="text-2xl font-bold text-slate-900 mt-1">Forgot Password</h1>
                  <p className="text-xs text-slate-500 mt-1">Enter your User ID or Email address to receive a verification OTP.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">User ID or Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. CSE2024001 or user@neu.ac.bd"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#fdfdfd] text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#118274] hover:bg-[#0e6c60] transition-colors cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? "Sending OTP..." : "Send Verification OTP"}
                </button>
              </form>
            )}

            {/* STEP 2: Verify OTP */}
            {/* STEP 2: Verify OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase">
                    STEP 2 OF 3
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900 mt-1">Enter OTP Code</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    An OTP has been sent to <strong>{maskedEmail}</strong>. Enter the 6-digit code below.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      6-Digit OTP
                    </label>

                    {/* Timer / Resend Display */}
                    <span className="text-[11px] font-semibold">
                      {timer > 0 ? (
                        <span className="text-teal-700">
                          Expires in: {Math.floor(timer / 60)}:
                          {(timer % 60).toString().padStart(2, "0")}s
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-500 font-medium">OTP Expired!</span>
                          <button
                            type="button"
                            disabled={!canResend || isLoading}
                            onClick={handleResendOtp}
                            className={`font-bold transition-colors ${canResend && !isLoading
                                ? "text-teal-700 hover:underline cursor-pointer"
                                : "text-slate-300 cursor-not-allowed"
                              }`}
                          >
                            {isLoading ? "Sending..." : "Resend OTP"}
                          </button>
                        </div>
                      )}
                    </span>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      disabled={timer === 0} // সময় শেষ হলে ইনপুট ফিল্ড ডিজেবল রাখতে পারেন (অপশনাল)
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#fdfdfd] text-xs font-bold tracking-widest text-slate-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || timer === 0}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#118274] hover:bg-[#0e6c60] transition-colors cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify OTP Code"}
                </button>
              </form>
            )}
            {/* STEP 3: Set New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase">STEP 3 OF 3</span>
                  <h1 className="text-2xl font-bold text-slate-900 mt-1">New Password</h1>
                  <p className="text-xs text-slate-500 mt-1">Set a strong new password for your account.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 bg-[#fdfdfd] text-xs font-medium text-slate-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-[#fdfdfd] text-xs font-medium text-slate-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#118274] hover:bg-[#0e6c60] transition-colors cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  {isLoading ? "Updating Password..." : "Reset Password"}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}