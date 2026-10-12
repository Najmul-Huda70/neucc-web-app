import React from "react";
import { MessageCard, MessageItem } from "@/components/ui/card";
import SectionHeader from "@/components/ui/SectionHeader";

interface LeadershipMessagesProps {
  messages: MessageItem[];
}

export default function LeadershipMessages({ messages }: LeadershipMessagesProps) {
  if (!messages || messages.length === 0) return null;

  const chairmanMessage = messages.find((m) => m.role === "CHAIRMAN");
  const advisorMessages = messages
    .filter((m) => m.role === "ADVISOR")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 sm:px-8 space-y-16">
      {/* Section 1: Chairperson Message */}
      {chairmanMessage && (
        <div className="space-y-8">
          <SectionHeader
            title="Messages from Our Chairperson"
            subtitle="A message from the Chairperson of the Department of CSE"
          />

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
          <SectionHeader
            title="Messages from Our Advisors"
            subtitle="Guidance and remarks from our esteemed faculty advisors"
          />

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
    </section>
  );
}