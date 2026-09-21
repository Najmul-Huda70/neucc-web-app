import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/session';
import { can } from '@/lib/auth/permissions';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { FinanceReportQuerySchema } from '@/lib/validation/public';
import { buildFinancialReportData } from '@/lib/finance/report';
import { buildReportWorkbook } from '@/lib/finance/report-xlsx';
import { renderLetterheadHtml } from '@/lib/pdf/letterhead';
import { renderHtmlToPdf } from '@/lib/pdf/render';

export const runtime = 'nodejs';
export const maxDuration = 30; // pdf/xlsx formats render on demand, same budget reasoning as the notice pad route

function bnDigits(n: number): string {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).split('').map((c) => map[Number(c)] ?? c).join('');
}
function formatTaka(n: number): string {
  return `৳${bnDigits(n)}`;
}
function formatBnDate(d: Date): string {
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear() % 100;
  return `${bnDigits(day)}/${bnDigits(month).padStart(2, '০')}/${bnDigits(year).padStart(2, '০')}`;
}

// GET /api/panel/finance/reports/half-yearly?startDate=&endDate=&format=json|pdf|xlsx
//
// Simplification, documented here and in docs/STEP_9_CHANGELOG.md: the SRS
// describes a President-review step before a report is "released". There is
// no ReportRelease/approval model in the schema to back that workflow, and
// adding one is a bigger change than "report compiler" asks for. Instead,
// this is gated on `finance:manage` OR `finance:view_oversight` — meaning
// both the Treasurer (compiles it) and the President (views/downloads it,
// per SRS's "President: view-and-download only") can generate the same
// report on demand; there is no separate draft/released state.
export async function GET(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (!can(auth.user, 'finance:manage') && !can(auth.user, 'finance:view_oversight')) {
    return apiError(403, 'FORBIDDEN', 'You do not have permission to view finance records.');
  }

  const url = new URL(req.url);
  const parsed = FinanceReportQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid report parameters.', parsed.error.flatten());
  const { startDate, endDate, format } = parsed.data;
  if (endDate < startDate) return apiError(400, 'INVALID_RANGE', 'endDate must be on or after startDate.');

  try {
    const data = await buildFinancialReportData(startDate, endDate);

    if (format === 'json') {
      return ok(data);
    }

    if (format === 'xlsx') {
      const buffer = await buildReportWorkbook(data);
      const bytes = new Uint8Array(buffer);
      return new Response(bytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="financial-report-${startDate.toISOString().slice(0, 10)}_to_${endDate.toISOString().slice(0, 10)}.xlsx"`,
        },
      });
    }

    // format === 'pdf'
    const treasurer = await prisma.user.findFirst({
      where: { post: { name: 'Treasurer' }, status: 'ACTIVE' },
      select: { name: true },
    });

    const tableRows = data.transactions
      .map(
        (t) =>
          `<tr><td>${formatBnDate(t.date)}</td><td>${t.type === 'INCOME' ? 'আয়' : 'ব্যয়'}</td><td>${t.fundHeadName}</td><td>${t.description}</td><td>${t.memberName}</td><td style="text-align:right">${formatTaka(t.amount)}</td></tr>`
      )
      .join('');

    const bodyHtml = `
      <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
        <thead>
          <tr style="border-bottom:1.5px solid #111;">
            <th style="text-align:left; padding:4px 6px;">তারিখ</th>
            <th style="text-align:left; padding:4px 6px;">ধরন</th>
            <th style="text-align:left; padding:4px 6px;">খাত</th>
            <th style="text-align:left; padding:4px 6px;">বিবরণ</th>
            <th style="text-align:left; padding:4px 6px;">সদস্য/দাতা</th>
            <th style="text-align:right; padding:4px 6px;">পরিমাণ</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <p style="margin-top:14px;">
        <b>মোট আয়:</b> ${formatTaka(data.totalIncome)} &nbsp;&nbsp;
        <b>মোট ব্যয়:</b> ${formatTaka(data.totalExpense)} &nbsp;&nbsp;
        <b>স্থিতি:</b> ${formatTaka(data.balance)}
      </p>`;

    const html = renderLetterheadHtml({
      date: formatBnDate(new Date()),
      memoNo: `NeU.CSE.CC/FIN/${startDate.getFullYear()}`,
      subject: `অর্ধ-বার্ষিক আর্থিক প্রতিবেদন (${formatBnDate(startDate)} — ${formatBnDate(endDate)})`,
      bodyParagraphs: [bodyHtml],
      signatory: {
        name: treasurer?.name ?? 'কোষাধ্যক্ষ',
        designation: 'কোষাধ্যক্ষ',
        orgLines: ['কম্পিউটার ক্লাব', 'সিএসই বিভাগ, নেত্রকোণা বিশ্ববিদ্যালয়'],
      },
      showWatermark: true,
    });

    const pdf = await renderHtmlToPdf(html, { format: 'A4' });
    const bytes = new Uint8Array(pdf);
    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="financial-report-${startDate.toISOString().slice(0, 10)}_to_${endDate.toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch {
    return unexpectedError();
  }
}
