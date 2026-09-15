import { z } from "zod";

// Join Us form (SRS §3.10) — Name, Student ID, Batch, Email, area of interest.
// `website` is a honeypot: real visitors never see or fill this field (hidden
// via CSS on the frontend); bots that auto-fill every input get caught here.
export const MembershipApplicationSchema = z.object({
  name: z.string().min(2).max(120),
  studentId: z.string().min(1).max(40),
  batch: z.coerce.number().int().min(2015).max(new Date().getFullYear()),
  email: z.string().email(),
  interest: z.string().max(500).optional(),
  website: z.string().max(0).optional(), // honeypot — must stay empty
});

// Contact form (SRS §3.11) — Name, email, subject, message.
export const ContactMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(2).max(150),
  message: z.string().min(5).max(3000),
  website: z.string().max(0).optional(), // honeypot
});
