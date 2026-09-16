'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'Who can join NEUCC?',
    answer: 'Any currently enrolled student at Netrokona University can join, regardless of department or year. No prior programming experience is required.',
  },
  {
    question: 'Is there a membership fee?',
    answer: 'NEUCC membership is currently free. Some special workshops or events may have a nominal fee to cover materials or venue costs.',
  },
  {
    question: 'Do I need to know programming already?',
    answer: 'No. We welcome complete beginners as well as experienced competitive programmers. Our workshops are designed for a range of skill levels.',
  },
  {
    question: 'How often does the club meet?',
    answer: 'We hold regular workshops and meetups throughout the semester, plus special events like hackathons and contests a few times a year.',
  },
  {
    question: 'Can I join more than one interest area?',
    answer: 'Yes — the "Area of Interest" field on the membership form is just to help us route you to relevant events; you\'re welcome to attend any club activity.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question} className="rounded-2xl border border-border bg-surface">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="font-medium text-text-main">{faq.question}</span>
              <ChevronDown
                size={18}
                className={`flex-shrink-0 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <p className="border-t border-border px-6 py-4 text-sm text-text-muted">
                {faq.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
