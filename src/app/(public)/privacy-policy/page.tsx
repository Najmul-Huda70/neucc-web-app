export const metadata = { title: 'Privacy Policy', description: 'How NEUCC collects, uses, and protects your information.' };

import { Database, Target, ShieldCheck, Share2, Mail } from 'lucide-react';

const SECTIONS = [
  {
    icon: Database,
    title: 'Information Collected',
    body: 'We may collect your name, email address, student ID, and any messages you submit through our Contact or Join Us forms. We also use standard cookies to remember your theme preference (light/dark mode) and improve site performance.',
  },
  {
    icon: Target,
    title: 'Purpose of Use',
    body: 'Information you provide is used only to respond to inquiries, process membership applications, and communicate about club events, workshops, and contests. We do not use your data for advertising or unrelated purposes.',
  },
  {
    icon: ShieldCheck,
    title: 'Data Protection',
    body: 'We take reasonable technical and organizational measures to protect any information submitted through this website from unauthorized access, alteration, or disclosure.',
  },
  {
    icon: Share2,
    title: 'Third-Party Sharing',
    body: 'No — NEUCC does not sell, rent, or share your personal information with third parties. Any information you submit stays within the club\'s internal records.',
  },
  {
    icon: Mail,
    title: 'Contact for Privacy Concerns',
    body: 'If you have any questions or concerns about how your information is handled, please reach out to us at neucc@netrokona.university.edu.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-text-muted">
          Last updated: September 2026. This policy explains how NEUCC
          collects, uses, and protects information submitted through this
          website.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon size={18} />
              </div>
              <h2 className="font-heading text-lg font-semibold text-text-main">
                {title}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
