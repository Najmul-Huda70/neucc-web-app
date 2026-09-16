import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Workshops, seminars, competitions, and meetups hosted by NEUCC.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
