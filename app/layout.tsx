import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

// 1. Sans-serif font for body, buttons, and general text
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 2. Monospace font for index counters (e.g., 01 / 04) and metadata
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 3. Serif font for headings and titles (e.g., Hero headings, Section titles)
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEUCC - Netrokona University Computer Club",
  description: "Official website of Netrokona University Computer Club",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="h-full bg-(--bg-app) text-(--text-primary) font-sans selection:bg-(--accent)/20 selection:text-(--text-primary)">
        {/* Toast Notification Container */}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "var(--card-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}