import { prisma } from '@/lib/prisma';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requireUser } from '@/lib/auth/session';
import { can } from '@/lib/auth/permissions';

// GET /api/panel/finance/summary — all-time running balance, computed live
// from the Transaction table on every call rather than a stored/cached
// total, to avoid it ever drifting from the underlying ledger (SRS §6.6:
// "a real-time aggregate query rather than a stored value").
export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (!can(auth.user, 'finance:manage') && !can(auth.user, 'finance:view_oversight')) {
    return apiError(403, 'FORBIDDEN', 'You do not have permission to view finance records.');
  }

  try {
    const [incomeTotal, expenseTotal, byFundHead] = await Promise.all([
      prisma.transaction.aggregate({ where: { type: 'INCOME' }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { type: 'EXPENSE' }, _sum: { amount: true } }),
      prisma.transaction.groupBy({
        by: ['fundHeadId', 'type'],
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    const fundHeads = await prisma.fundHead.findMany({
      where: { id: { in: byFundHead.map((g) => g.fundHeadId) } },
      select: { id: true, name: true, type: true },
    });
    const fundHeadById = new Map(fundHeads.map((f) => [f.id, f]));

    const totalIncome = incomeTotal._sum.amount ?? 0;
    const totalExpense = expenseTotal._sum.amount ?? 0;

    return ok({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byFundHead: byFundHead.map((g) => ({
        fundHeadId: g.fundHeadId,
        name: fundHeadById.get(g.fundHeadId)?.name ?? 'Unknown',
        type: g.type,
        total: g._sum.amount ?? 0,
        transactionCount: g._count._all,
      })),
    });
  } catch {
    return unexpectedError();
  }
}
