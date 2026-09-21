import { prisma } from '@/lib/prisma';

export interface FinancialReportData {
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: {
    date: Date;
    type: 'INCOME' | 'EXPENSE';
    fundHeadName: string;
    description: string;
    memberName: string;
    amount: number;
  }[];
}

export async function buildFinancialReportData(startDate: Date, endDate: Date): Promise<FinancialReportData> {
  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    include: { fundHead: { select: { name: true } } },
    orderBy: { date: 'asc' },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    if (t.type === 'INCOME') totalIncome += t.amount;
    else totalExpense += t.amount;
  }

  return {
    startDate,
    endDate,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactions: transactions.map((t) => ({
      date: t.date,
      type: t.type,
      fundHeadName: t.fundHead.name,
      description: t.description,
      memberName: t.memberName,
      amount: t.amount,
    })),
  };
}
