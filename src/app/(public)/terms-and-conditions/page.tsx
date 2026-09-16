export const metadata = { title: 'Terms & Conditions', description: 'Terms and conditions for using the NEUCC website and participating in club activities.' };

import { FileCheck, Users, Copyright, ShieldAlert, RefreshCcw } from 'lucide-react';

const SECTIONS = [
  {
    icon: FileCheck,
    title: 'Acceptable Use',
    body: 'Visitors may browse and use content on this website for personal, non-commercial, and informational purposes. Any attempt to disrupt the site, scrape data at scale, or misuse submitted forms is prohibited.',
  },
  {
    icon: Users,
    title: 'Membership Rules',
    body: 'Membership is open to currently enrolled students of Netrokona University. Members are expected to participate respectfully in club activities and follow any event-specific guidelines communicated by the executive committee.',
  },
  {
    icon: Copyright,
    title: 'Content Ownership',
    body: 'The NEUCC name, logo, and all original content published on this website (text, graphics, and media) are the property of the Netrokona University Computer Club unless otherwise credited.',
  },
  {
    icon: ShieldAlert,
    title: 'Liability Disclaimer',
    body: 'NEUCC and its organizers are not liable for any injury, loss, or damage arising from participation in club events, workshops, or contests. Participants join activities voluntarily and at their own discretion.',
  },
  {
    icon: RefreshCcw,
    title: 'Policy Updates',
    body: 'These terms may be updated periodically to reflect changes in club operations or applicable policies. Continued use of this website after updates constitutes acceptance of the revised terms.',
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-text-muted">
          Last updated: September 2026. Please read these terms carefully
          before using this website or participating in NEUCC activities.
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
