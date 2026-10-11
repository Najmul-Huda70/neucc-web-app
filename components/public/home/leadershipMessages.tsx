import React from "react";
import { MessageCard, MessageItem } from "@/components/ui/card";

interface LeadershipMessagesProps {
  messages: MessageItem[];
}

export default function LeadershipMessages({ messages }: LeadershipMessagesProps) {
  if (!messages || messages.length === 0) return null;

  // Separate Chairman and Advisors
  const chairmanMessage = messages.find((m) => m.role === "CHAIRMAN");
  const advisorMessages = messages
    .filter((m) => m.role === "ADVISOR")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section className="py-16 sm:py-24 bg-(--bg-app)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section 1: Chairperson Message */}
        {chairmanMessage && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-(--text-primary) tracking-tight">
                Messages from Our Chairperson
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-(--text-muted) font-medium">
                A message from the Chairperson of the Department of CSE
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <MessageCard item={chairmanMessage} showActions={false} />
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Advisors Messages */}
        {advisorMessages.length > 0 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-(--text-primary) tracking-tight">
                Messages from Our Advisors
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-(--text-muted) font-medium">
                Guidance and remarks from our esteemed faculty advisors
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {advisorMessages.map((item) => (
                <div
                  key={item.messageId}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-grow max-w-md"
                >
                  <MessageCard item={item} showActions={false} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
