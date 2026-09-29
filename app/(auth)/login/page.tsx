import { Suspense } from "react";
import LoginBrandPanel from "@/components/auth/LoginBrandPanel";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div
        className="w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl border shadow-xl overflow-hidden"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--btn-secondary-border)",
        }}
      >
        {/* LEFT: brand panel */}
        <LoginBrandPanel />

        {/* RIGHT: form wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="p-8 sm:p-10 flex flex-col justify-center items-center">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-(--text-secondary)">
                Loading portal...
              </p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}