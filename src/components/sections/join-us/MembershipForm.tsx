'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface FormState {
  name: string;
  studentId: string;
  batch: string;
  email: string;
  interest: string;
}

const INITIAL_STATE: FormState = {
  name: '',
  studentId: '',
  batch: '',
  email: '',
  interest: '',
};

const INTERESTS = [
  'Competitive Programming',
  'Cybersecurity / CTF',
  'Web Development',
  'Machine Learning / AI',
  'Event Organizing',
  'Other',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function MembershipForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.studentId.trim()) nextErrors.studentId = 'Student ID is required.';
    if (!form.batch.trim()) nextErrors.batch = 'Batch is required.';
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.interest) nextErrors.interest = 'Please select an area of interest.';

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

    console.log('NEUCC membership submission:', form);
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
          Application submitted! We&apos;ll be in touch soon.
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-main">Student ID</label>
            <input
              type="text"
              value={form.studentId}
              onChange={(e) => handleChange('studentId', e.target.value)}
              placeholder="e.g. 2023-01-001"
              className={inputClasses(!!errors.studentId)}
            />
            {errors.studentId && <p className="mt-1 text-xs text-error">{errors.studentId}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-main">Batch</label>
            <input
              type="text"
              value={form.batch}
              onChange={(e) => handleChange('batch', e.target.value)}
              placeholder="e.g. 2023"
              className={inputClasses(!!errors.batch)}
            />
            {errors.batch && <p className="mt-1 text-xs text-error">{errors.batch}</p>}
          </div>
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
          <label className="mb-1.5 block text-sm font-medium text-text-main">Area of Interest</label>
          <select
            value={form.interest}
            onChange={(e) => handleChange('interest', e.target.value)}
            className={inputClasses(!!errors.interest)}
          >
            <option value="">Select an area</option>
            {INTERESTS.map((interest) => (
              <option key={interest} value={interest}>{interest}</option>
            ))}
          </select>
          {errors.interest && <p className="mt-1 text-xs text-error">{errors.interest}</p>}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
