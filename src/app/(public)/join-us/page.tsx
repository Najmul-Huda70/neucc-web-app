export const metadata = { title: 'Join Us', description: 'Become a member of NEUCC 2014 explore benefits and apply today.' };

import { Users, Trophy, BookOpen, Network } from 'lucide-react';
import { MembershipForm } from '@/components/sections/join-us/MembershipForm';
import { FaqAccordion } from '@/components/sections/join-us/FaqAccordion';

const BENEFITS = [
  { icon: BookOpen, title: 'Hands-on Learning', description: 'Access to workshops covering competitive programming, cybersecurity, web development, and more.' },
  { icon: Trophy, title: 'Contest Opportunities', description: 'Compete in ICPC, IUPC, CTFs, and internal contests with mentorship from senior members.' },
  { icon: Network, title: 'Networking', description: 'Connect with alumni, industry professionals, and sponsor companies through club events.' },
  { icon: Users, title: 'Community', description: 'Join a supportive community of like-minded students who share your passion for technology.' },
];

export default function JoinUsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Join NEUCC
        </h1>
        <p className="mt-3 text-text-muted">
          Become part of a growing community of programmers and builders at
          Netrokona University.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl border border-border bg-surface p-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon size={20} />
            </div>
            <h3 className="mt-3 font-heading text-sm font-semibold text-text-main">{title}</h3>
            <p className="mt-2 text-xs text-text-muted">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
          Membership Application
        </h2>
        <div className="mx-auto mt-8 max-w-xl">
          <MembershipForm />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center font-heading text-2xl font-bold text-text-main sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto mt-8 max-w-2xl">
          <FaqAccordion />
        </div>
      </div>
    </div>
  );
}
