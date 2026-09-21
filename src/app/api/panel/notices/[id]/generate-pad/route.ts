import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/session';
import { can } from '@/lib/auth/permissions';
import { apiError, unexpectedError } from '@/lib/http/api-response';
import { noticeViewAction } from '@/lib/auth/notice-actions';
import { renderLetterheadHtml, plainTextToParagraphs } from '@/lib/pdf/letterhead';
import { renderHtmlToPdf } from '@/lib/pdf/render';

type Context = { params: Promise<{ id: string }> };

// Needs the Node.js runtime (not Edge) for puppeteer-core, and more than the
// default execution budget for a cold Chromium launch + render — Vercel
// Hobby/Pro plans both allow raising this per-route via `maxDuration`.
export const runtime = 'nodejs';
export const maxDuration = 30;

const BodySchema = z.object({
  // Not stored on Notice anywhere — the committee supplies the distribution
  // list at generation time. Optional; omit for no CC section.
  ccList: z.array(z.string().min(1).max(300)).max(30).optional(),
});

function formatBengaliStyleDate(d: Date): string {
  // Matches the reference letterhead's "২/০৭/২৬" style: day/month/2-digit
  // year, Bengali digits. Kept as a small local helper rather than a new
  // dependency — this project has no date-formatting library yet.
  const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n: number) => String(n).split('').map((c) => BN_DIGITS[Number(c)] ?? c).join('');
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear() % 100;
  return `${toBn(day)}/${toBn(month).padStart(2, '০')}/${toBn(year).padStart(2, '০')}`;
}

// POST /api/panel/notices/:id/generate-pad
//
// Renders the notice onto the club's official bilingual letterhead and
// returns it as a PDF download. This is the first concrete use of the
// Step 7 PDF infrastructure (lib/pdf/letterhead.ts, lib/pdf/render.ts) —
// the same two functions are meant to be reused for Resolution PDFs,
// election result declarations, and nomination forms later, each with its
// own small route like this one.
//
// Gated on the same permission as *viewing* the notice (not publishing) —
// anyone who can see a notice in the panel can also get its letterhead PDF.
export async function POST(req: Request, { params }: Context) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { id } = await params;

  const notice = await prisma.notice.findUnique({
    where: { id },
    include: { publishedBy: { select: { name: true, post: { select: { name: true } } } } },
  });
  if (!notice) return apiError(404, 'NOT_FOUND', 'Notice not found.');

  if (!can(auth.user, noticeViewAction(notice.scope))) {
    return apiError(403, 'FORBIDDEN', 'You do not have permission to view notices in this scope.');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid request body.', parsed.error.flatten());

  try {
    const html = renderLetterheadHtml({
      date: formatBengaliStyleDate(notice.date),
      memoNo: notice.memoNo,
      subject: notice.subject,
      bodyParagraphs: plainTextToParagraphs(notice.body),
      signatory: {
        name: notice.publishedBy.name,
        designation: notice.publishedBy.post?.name ?? '',
        orgLines: ['কম্পিউটার ক্লাব', 'সিএসই বিভাগ, নেত্রকোণা বিশ্ববিদ্যালয়'],
      },
      ccList: parsed.data.ccList,
    });

    const pdf = await renderHtmlToPdf(html);
    const bytes = new Uint8Array(pdf);

    // Not persisted anywhere (Notice.pdfUrl is left untouched) — there is no
    // file storage configured yet (S3/Cloudinary), so this always renders
    // fresh on demand rather than caching a URL that would need one. See
    // docs/STEP_7_CHANGELOG.md for the follow-up this implies.
    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="notice-${notice.memoNo.replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf"`,
      },
    });
  } catch {
    return unexpectedError();
  }
}
