import ExcelJS from 'exceljs';
import type { FinancialReportData } from './report';

export async function buildReportWorkbook(data: FinancialReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NEUCC Panel';
  workbook.created = new Date();

  const summary = workbook.addWorksheet('Summary');
  summary.columns = [
    { header: 'Field', key: 'field', width: 28 },
    { header: 'Value', key: 'value', width: 24 },
  ];
  summary.addRows([
    { field: 'Period start', value: data.startDate.toISOString().slice(0, 10) },
    { field: 'Period end', value: data.endDate.toISOString().slice(0, 10) },
    { field: 'Total income (৳)', value: data.totalIncome },
    { field: 'Total expense (৳)', value: data.totalExpense },
    { field: 'Closing balance (৳)', value: data.balance },
    { field: 'Transaction count', value: data.transactions.length },
  ]);
  summary.getRow(1).font = { bold: true };

  const sheet = workbook.addWorksheet('Transactions');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Fund Head', key: 'fundHead', width: 24 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Member/Donor', key: 'member', width: 24 },
    { header: 'Amount (৳)', key: 'amount', width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };
  for (const t of data.transactions) {
    sheet.addRow({
      date: t.date.toISOString().slice(0, 10),
      type: t.type,
      fundHead: t.fundHeadName,
      description: t.description,
      member: t.memberName,
      amount: t.type === 'EXPENSE' ? -t.amount : t.amount,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
