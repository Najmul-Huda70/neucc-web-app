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

export const ContentPaginationSchema = PaginationSchema.extend({
  q: z.string().trim().max(100).optional(),
});

export const AchievementCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  date: DateInput,
  awardingOrg: z.string().trim().max(200).nullable().optional(),
  photoUrl: z.string().url().max(2000).nullable().optional(),
});

export const AchievementUpdateSchema = AchievementCreateSchema.partial();

export const ContestCreateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  date: DateInput,
  type: z.enum(["PROGRAMMING", "CTF", "HACKATHON"]),
  result: z.string().trim().max(1000).nullable().optional(),
  registrationLink: z.string().url().max(2000).nullable().optional(),
});

export const ContestUpdateSchema = ContestCreateSchema.partial();

export const SponsorCreateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  logoUrl: z.string().url().max(2000).nullable().optional(),
  tier: z.enum(["PLATINUM", "GOLD", "SILVER"]),
  description: z.string().trim().max(2000).nullable().optional(),
});

export const SponsorUpdateSchema = SponsorCreateSchema.partial();

export const GalleryItemCreateSchema = z.object({
  url: z.string().url().max(2000),
  isVideo: z.boolean().default(false),
  eventName: z.string().trim().max(200).nullable().optional(),
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 5),
});

export const GalleryItemUpdateSchema = GalleryItemCreateSchema.partial();

export const SiteContentSchema = z.object({
  key: z.string().trim().min(2).max(200),
  value: z.any(),
});

export const SiteContentUpdateSchema = SiteContentSchema.partial();

export const GovernancePaginationSchema = PaginationSchema.extend({
  q: z.string().trim().max(100).optional(),
  type: z.enum(['ELECTION', 'EXECUTIVE']).optional(),
  status: z.enum(['ACTIVE', 'DISSOLVED', 'DRAFT', 'OPEN', 'CLOSED', 'RESULTS_PUBLISHED', 'PENDING', 'VERIFIED', 'SYMBOL_ALLOTTED', 'UNOPPOSED', 'REJECTED']).optional(),
});

export const CommitteeQuerySchema = GovernancePaginationSchema.extend({
  type: z.enum(['ELECTION', 'EXECUTIVE']).optional(),
  status: z.enum(['ACTIVE', 'DISSOLVED']).optional(),
});

export const ElectionQuerySchema = GovernancePaginationSchema.extend({
  committeeId: z.string().trim().max(200).optional(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'RESULTS_PUBLISHED']).optional(),
});

export const CandidateQuerySchema = GovernancePaginationSchema.extend({
  electionId: z.string().trim().max(200).optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'SYMBOL_ALLOTTED', 'UNOPPOSED', 'REJECTED']).optional(),
});

export const SymbolQuerySchema = GovernancePaginationSchema.extend({
  q: z.string().trim().max(100).optional(),
});

export const PaymentQuerySchema = GovernancePaginationSchema.extend({
  candidateId: z.string().trim().max(200).optional(),
  method: z.enum(['BANK_TRANSFER', 'PAID_TO_MEMBER', 'ONLINE_PLACEHOLDER']).optional(),
});

export const ElectionResultQuerySchema = GovernancePaginationSchema.extend({
  electionId: z.string().trim().max(200).optional(),
  postId: z.string().trim().max(200).optional(),
  outcome: z.enum(['ELECTED', 'UNOPPOSED', 'WALKOVER', 'NO_CANDIDATE']).optional(),
});

export const CommitteeCreateSchema = z.object({
  type: z.enum(['ELECTION', 'EXECUTIVE']),
  status: z.enum(['ACTIVE', 'DISSOLVED']).default('ACTIVE'),
  startDate: DateInput,
  endDate: DateInput.nullish(),
});

export const CommitteeUpdateSchema = CommitteeCreateSchema.partial();

export const ElectionCreateSchema = z.object({
  committeeId: z.string().trim().min(1).max(200),
  applicationDeadline: DateInput,
  votingDate: DateInput,
  applicationFee: z.coerce.number().int().min(0).max(1_000_000),
  eligibleBatches: z.array(z.coerce.number().int().min(2000).max(new Date().getFullYear() + 10)).optional(),
  resultDeclarationUrl: z.string().url().max(2000).nullable().optional(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'RESULTS_PUBLISHED']).default('DRAFT'),
});

export const ElectionUpdateSchema = ElectionCreateSchema.partial();

export const CandidateCreateSchema = z.object({
  electionId: z.string().trim().min(1).max(200),
  postId: z.string().trim().min(1).max(200),
  applicantName: z.string().trim().min(2).max(200),
  studentId: z.string().trim().min(1).max(40),
  batch: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 10),
  email: z.string().email(),
  status: z.enum(['PENDING', 'VERIFIED', 'SYMBOL_ALLOTTED', 'UNOPPOSED', 'REJECTED']).default('PENDING'),
  symbolId: z.string().trim().max(200).nullable().optional(),
  isUnopposed: z.boolean().default(false),
  eligibilityWaived: z.boolean().default(false),
  isWinner: z.boolean().default(false),
});

export const CandidateUpdateSchema = CandidateCreateSchema.partial();

export const SymbolCreateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  imageUrl: z.string().url().max(2000).nullable().optional(),
});

export const SymbolUpdateSchema = SymbolCreateSchema.partial();

export const PaymentCreateSchema = z.object({
  candidateId: z.string().trim().min(1).max(200),
  method: z.enum(['BANK_TRANSFER', 'PAID_TO_MEMBER', 'ONLINE_PLACEHOLDER']),
  amount: z.coerce.number().int().min(0).max(1_000_000),
  transactionRef: z.string().trim().max(200).nullable().optional(),
  paidToMember: z.string().trim().max(200).nullable().optional(),
  paidAt: DateInput.optional(),
});

export const PaymentUpdateSchema = PaymentCreateSchema.partial();

export const ElectionResultCreateSchema = z.object({
  electionId: z.string().trim().min(1).max(200),
  postId: z.string().trim().min(1).max(200),
  candidateId: z.string().trim().max(200).nullable().optional(),
  outcome: z.enum(['ELECTED', 'UNOPPOSED', 'WALKOVER', 'NO_CANDIDATE']),
});

export const ElectionResultUpdateSchema = ElectionResultCreateSchema.partial();

export const AttendanceFormCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
});

export const AttendanceEntrySchema = z.object({
  name: z.string().trim().min(2).max(120),
  studentId: z.string().trim().min(1).max(40),
  batch: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 10),
});

export const FinanceTransactionCreateSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  fundHeadId: z.string().trim().min(1).max(200),
  amount: z.coerce.number().int().positive().max(1_000_000_000),
  description: z.string().trim().min(2).max(1000),
  memberName: z.string().trim().min(2).max(200),
  documentUrl: z.string().url().max(2000).nullable().optional(),
  date: DateInput.optional(),
});

export const FinanceTransactionUpdateSchema = FinanceTransactionCreateSchema.partial();

export const FundHeadCreateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export const FinanceReportQuerySchema = z.object({
  startDate: DateInput,
  endDate: DateInput,
  format: z.enum(["json", "pdf", "xlsx"]).default("json"),
});

export const NoticeAiDraftSchema = z.object({
  scope: z.enum(["GENERAL", "INTERNAL", "ELECTION"]),
  instruction: z.string().trim().min(3).max(2000),
  conversation: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .max(20)
    .optional(),
});

export const ResolutionCreateSchema = z.object({
  meetingNo: z.string().trim().min(1).max(100),
  memoNo: z.string().trim().min(1).max(100),
  date: DateInput,
  meetingTime: z.string().trim().min(1).max(50),
  venue: z.string().trim().min(2).max(200),
  president: z.string().trim().min(2).max(200),
  convener: z.string().trim().min(2).max(200),
  agenda: z.string().trim().min(2).max(5000),
  discussion: z.string().trim().min(2).max(10000),
  decisions: z.string().trim().min(2).max(10000),
  implementationResponsibility: z.any().optional(),
  signatories: z.any().optional(),
  attendeeCount: z.coerce.number().int().min(0).max(100000),
  pdfUrl: z.string().url().max(2000).nullable().optional(),
});

export const ResolutionUpdateSchema = ResolutionCreateSchema.partial();

export const DocumentCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  url: z.string().url().max(2000),
  mimeType: z.string().trim().min(3).max(100),
  sizeBytes: z.coerce.number().int().positive().max(100_000_000).nullable().optional(),
  noticeId: z.string().trim().min(1).max(200).optional(),
  resolutionId: z.string().trim().min(1).max(200).optional(),
}).refine((value) => Boolean(value.noticeId) !== Boolean(value.resolutionId), {
  message: "A document must belong to exactly one notice or resolution.",
  path: ["noticeId"],
});

export const MembershipStatusUpdateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const OperationsPaginationSchema = PaginationSchema.extend({
  q: z.string().trim().max(100).optional(),
});

export const UserQuerySchema = OperationsPaginationSchema.extend({
  committeeId: z.string().trim().max(200).optional(),
  postId: z.string().trim().max(200).optional(),
  role: z.enum(['ELECTION_COMMITTEE', 'EXECUTIVE_COMMITTEE']).optional(),
  status: z.enum(['ACTIVE', 'REVOKED']).optional(),
});

// `role` is intentionally NOT accepted here — it's always derived server-side
// from the target committee's `type`, so a client can never request a role
// that doesn't match the committee it's assigning the user into.
export const UserCreateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(12).max(200),
  postId: z.string().trim().min(1).max(200),
  committeeId: z.string().trim().min(1).max(200),
  studentId: z.string().trim().max(50).nullable().optional(),
  batch: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 10).nullable().optional(),
});

// Same field set as create, all optional, minus password (handled by its own
// optional field below) and `electionAccessGranted` — that flag only ever
// changes through the dedicated grant-access endpoint (Step 3), never
// through this generic profile update.
export const UserUpdateSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  postId: z.string().trim().min(1).max(200).optional(),
  committeeId: z.string().trim().min(1).max(200).nullable().optional(),
  studentId: z.string().trim().max(50).nullable().optional(),
  batch: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 10).nullable().optional(),
  status: z.enum(['ACTIVE', 'REVOKED']).optional(),
  password: z.string().min(12).max(200).optional(),
});

export function parsePublicQuery<T extends z.AnyZodObject>(schema: T, req: Request) {
  const url = new URL(req.url);
  return schema.safeParse(Object.fromEntries(url.searchParams.entries()));
}
