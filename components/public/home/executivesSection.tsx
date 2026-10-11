import React from "react";
import { Users, ArrowRight } from "lucide-react";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/Button";

export default function ExecutivesSection() {
  return (
    <section className="py-8 sm:py-12 bg-(--bg-app)">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          padding="md"
          className="text-center space-y-4 bg-gradient-to-b from-(--card-bg) to-(--bg-subtle)"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#288c83]/10 text-[#288c83] text-xs font-bold border border-[#288c83]/20">
            <Users size={13} />
            <span>Leadership & Committees</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-(--text-primary)">
              Meet the NEUCC Committees
            </h3>
            <p className="text-xs sm:text-sm text-(--text-muted) max-w-lg mx-auto">
              Dedicated advisors and student leaders driving our tech community forward.
            </p>
          </div>

          <div className="pt-1 flex justify-center">
            <Button
              href="/committee"
              variant="primary"
              size="sm"
              className="gap-2 group"
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