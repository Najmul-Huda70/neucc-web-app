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

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(15),
});

export const PublicEventsQuerySchema = PaginationSchema.extend({
  status: z.enum(["UPCOMING", "PAST", "CANCELLED"]).optional(),
  category: z.enum(["WORKSHOP", "SEMINAR", "COMPETITION", "MEETUP"]).optional(),
  q: z.string().trim().max(100).optional(),
});

export const PublicAnnouncementsQuerySchema = PaginationSchema;

const DateInput = z.coerce.date();

export const PanelEventsQuerySchema = PaginationSchema.extend({
  status: z.enum(["UPCOMING", "PAST", "CANCELLED"]).optional(),
  category: z.enum(["WORKSHOP", "SEMINAR", "COMPETITION", "MEETUP"]).optional(),
  q: z.string().trim().max(100).optional(),
});

export const EventCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(5).max(5000),
  date: DateInput,
  venue: z.string().trim().min(2).max(200),
  guests: z.string().trim().max(1000).nullable().optional(),
  registrationLink: z.string().url().max(2000).nullable().optional(),
  category: z.enum(["WORKSHOP", "SEMINAR", "COMPETITION", "MEETUP"]),
  status: z.enum(["UPCOMING", "PAST", "CANCELLED"]).default("UPCOMING"),
});

export const EventUpdateSchema = EventCreateSchema.partial();

export const PanelNoticesQuerySchema = PaginationSchema.extend({
  scope: z.enum(["GENERAL", "INTERNAL", "ELECTION"]).optional(),
});

export const NoticeCreateSchema = z.object({
  subject: z.string().trim().min(2).max(200),
  body: z.string().trim().min(5).max(10000),
  scope: z.enum(["GENERAL", "INTERNAL", "ELECTION"]),
  memoNo: z.string().trim().min(1).max(100),
  date: DateInput,
  pdfUrl: z.string().url().max(2000).nullable().optional(),
  imageUrl: z.string().url().max(2000).nullable().optional(),
  isPinned: z.boolean().default(false),
});

export const NoticeUpdateSchema = NoticeCreateSchema.partial();

export function parsePublicQuery<T extends z.AnyZodObject>(schema: T, req: Request) {
  const url = new URL(req.url);
  return schema.safeParse(Object.fromEntries(url.searchParams.entries()));
}
