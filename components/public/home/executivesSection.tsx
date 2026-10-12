import React from "react";
import { Users, ArrowRight } from "lucide-react";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/Button";
import TitleDescription from "@/components/ui/TitleDescription";

export default function ExecutivesSection() {
  return (
    <section className="w-full bg-(--bg-app)">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <Card
          padding="md"
          className="text-center space-y-5 bg-gradient-to-b from-(--card-bg) to-(--bg-subtle) border border-(--border-color)"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--text-secondary)/10 text-(--text-secondary) text-xs font-semibold border border-(--text-secondary)/20">
            <Users size={13} />
            <span>Leadership & Committees</span>
          </div>

          {/* Title & Description using Reusable Component */}
          <TitleDescription
            title="Meet the NEUCC Committees"
            description="Dedicated advisors and student leaders driving our tech community forward."
            as="h3"
            titleClassName="text-lg sm:text-xl font-bold text-(--text-primary)"
            descClassName="text-xs sm:text-sm text-(--text-muted) max-w-lg mx-auto"
          />

          {/* Button CTA */}
          <div className="pt-1 flex justify-center">
            <Button
              href="/committee"
              variant="primary"
              size="sm"
              className="gap-2 group cursor-pointer"
            >
              <span>Explore Committee</span>
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}