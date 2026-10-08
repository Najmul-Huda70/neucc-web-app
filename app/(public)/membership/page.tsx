"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function MembershipPage() {
    const [formData, setFormData] = useState({
        userId: "",
        name: "",
        email: "",
        session: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
                body: JSON.stringify(formData),
            });

            const json = await res.json();

            if (json.success) {
                toast.success("Registration successful! Your account is pending activation.");
                setFormData({ userId: "", name: "", email: "", session: "" });
            } else {
                toast.error(json.error || "Registration failed");
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
            <Toaster
                position="bottom-right"
                reverseOrder={false}
            />
            <div className="w-full max-w-md rounded-2xl bg-(--card-bg) border border-(--border-color) p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-2">Apply for Membership</h2>
                <p className="text-xs text-center text-(--text-secondary) mb-6">
                    Fill in your details to register as a club member
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User ID / Student ID */}
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

                    {/* Full Name */}
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

                    {/* Email */}
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

                    {/* Session */}
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
            </div>
        </div>
    );
}