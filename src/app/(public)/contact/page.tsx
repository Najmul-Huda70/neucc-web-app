export const metadata = { title: 'Contact Us', description: 'Get in touch with NEUCC 2014 send a message, find our office hours, and location.' };

import { Mail, Phone, Clock } from 'lucide-react';
import { ContactForm } from '@/components/sections/contact/ContactForm';

const SOCIAL_ITEMS = [
  { label: 'Facebook', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Discord', href: '#' },
  { label: 'LinkedIn', href: '#' },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-text-muted">
          Have a question or want to get involved? Send us a message.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ContactForm />

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-heading font-semibold text-text-main">Direct Contact</h3>
            <div className="mt-4 space-y-3 text-sm text-text-muted">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                neucc@netrokona.university.edu
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary" />
                +880 1XXX-XXXXXX
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-heading font-semibold text-text-main">Social Media</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {SOCIAL_ITEMS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:text-primary"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="flex items-center gap-2 font-heading font-semibold text-text-main">
              <Clock size={16} className="text-primary" />
              Office Hours
            </h3>
            <div className="mt-4 space-y-1 text-sm text-text-muted">
              <div className="flex justify-between">
                <span>Sunday – Thursday</span>
                <span>2:00 PM – 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Friday – Saturday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Netrokona University Location"
              src="https://www.google.com/maps?q=Netrokona+University&output=embed"
              width="100%"
              height="220"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
