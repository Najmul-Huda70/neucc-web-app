'use client';

import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_STATE: FormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.subject.trim()) nextErrors.subject = 'Subject is required.';
    if (!form.message.trim()) {
      nextErrors.message = 'Message is required.';
    } else if (form.message.trim().length < 10) {
      nextErrors.message = 'Message should be at least 10 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    console.log('NEUCC contact submission:', form);
    setSubmitted(true);
    setForm(INITIAL_STATE);

    setTimeout(() => setSubmitted(false), 4000);
  };

  const inputClasses = (hasError: boolean) =>
    `w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
      hasError ? 'border-error' : 'border-border'
    }`;

  return (
    <div className="relative rounded-2xl border border-border bg-surface p-6 sm:p-8">
      {submitted && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm font-medium text-success">
          <CheckCircle2 size={18} />
          Message sent! We&apos;ll get back to you soon.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-main">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your full name"
            className={inputClasses(!!errors.name)}
          />
          {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-main">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@example.com"
            className={inputClasses(!!errors.email)}
          />
          {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-main">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            placeholder="What is this about?"
            className={inputClasses(!!errors.subject)}
          />
          {errors.subject && <p className="mt-1 text-xs text-error">{errors.subject}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-main">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => handleChange('message', e.target.value)}
            placeholder="Write your message here..."
            rows={5}
            className={inputClasses(!!errors.message)}
          />
          {errors.message && <p className="mt-1 text-xs text-error">{errors.message}</p>}
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <Send size={16} />
          Send Message
        </button>
      </form>
    </div>
  );
}
