import NotFoundCard from "@/components/ui/NotFoundCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | NEU Computer Club",
  description: "The requested page could not be found.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-(--bg-app) text-(--text-primary)">
      <NotFoundCard
        title="Page Not Found"
        description="We couldn't find the page or event you were looking for. It might have been moved, renamed, or deleted."
        backUrl="/events"
        backLabel="View All Events"
      />
    </main>
  );
}