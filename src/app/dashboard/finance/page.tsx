'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost, ApiClientError } from '@/lib/api-client';

type Me = { capabilities: { canManageFinance: boolean; canViewFinanceOversight: boolean } };

type FundHead = { id: string; name: string; type: 'INCOME' | 'EXPENSE' };

type Transaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  memberName: string;
  date: string;
  fundHead: { name: string };
};

type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byFundHead: { fundHeadId: string; name: string; type: 'INCOME' | 'EXPENSE'; total: number; transactionCount: number }[];
};

function taka(n: number): string {
  return `৳${n.toLocaleString('en-BD')}`;
}

export default function DashboardFinancePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [fundHeads, setFundHeads] = useState<FundHead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');

  // Transaction form
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [txFundHeadId, setTxFundHeadId] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txMemberName, setTxMemberName] = useState('');
  const [txSaving, setTxSaving] = useState(false);
  const [txError, setTxError] = useState('');

  // Fund head form
  const [fhName, setFhName] = useState('');
  const [fhType, setFhType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [fhSaving, setFhSaving] = useState(false);
  const [fhError, setFhError] = useState('');

  // Report form
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [reportBusy, setReportBusy] = useState<'pdf' | 'xlsx' | null>(null);
  const [reportError, setReportError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const meData = await apiGet<Me>('/api/panel/me');
      setMe(meData);
      if (!meData.capabilities.canManageFinance && !meData.capabilities.canViewFinanceOversight) return;

      const [summaryRes, fundHeadsRes, txRes] = await Promise.all([
        apiGet<{ data: Summary }>('/api/panel/finance/summary'),
        apiGet<{ data: FundHead[] }>('/api/panel/finance/fund-heads'),
        apiGet<{ data: Transaction[] }>('/api/panel/finance/transactions?page=1&pageSize=30'),
      ]);
      setSummary(summaryRes.data);
      setFundHeads(fundHeadsRes.data);
      setTransactions(txRes.data);
      setTxFundHeadId((current) => current || fundHeadsRes.data.find((f) => f.type === 'INCOME')?.id || fundHeadsRes.data[0]?.id || '');
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load finance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleAddTransaction = async (e: FormEvent) => {
    e.preventDefault();
    setTxSaving(true);
    setTxError('');
    setNotice('');
    try {
      await apiPost('/api/panel/finance/transactions', {
        type: txType,
        fundHeadId: txFundHeadId,
        amount: Number(txAmount),
        description: txDescription,
        memberName: txMemberName,
      });
      setNotice('Transaction recorded.');
      setTxAmount('');
      setTxDescription('');
      setTxMemberName('');
      await loadAll();
    } catch (err) {
      setTxError(err instanceof ApiClientError ? err.message : 'Failed to record transaction.');
    } finally {
      setTxSaving(false);
    }
  };

  const handleAddFundHead = async (e: FormEvent) => {
    e.preventDefault();
    setFhSaving(true);
    setFhError('');
    setNotice('');
    try {
      await apiPost('/api/panel/finance/fund-heads', { name: fhName, type: fhType });
      setNotice('Fund head added.');
      setFhName('');
      await loadAll();
    } catch (err) {
      setFhError(err instanceof ApiClientError ? err.message : 'Failed to add fund head.');
    } finally {
      setFhSaving(false);
    }
  };

  const downloadReport = async (format: 'pdf' | 'xlsx') => {
    if (!reportStart || !reportEnd) {
      setReportError('Pick a start and end date first.');
      return;
    }
    setReportBusy(format);
    setReportError('');
    try {
      const res = await fetch(
        `/api/panel/finance/reports/half-yearly?startDate=${reportStart}&endDate=${reportEnd}&format=${format}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${reportStart}_to_${reportEnd}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to generate report.');
    } finally {
      setReportBusy(null);
    }
  };

  if (loading) {
    return <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 text-sm text-text-muted">Loading finance data...</main>;
  }
  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{loadError}</p>
      </main>
    );
  }
  if (me && !me.capabilities.canManageFinance && !me.capabilities.canViewFinanceOversight) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          Only the Treasurer (full access) or the President (view &amp; download) can see finance records.
        </p>
      </main>
    );
  }

  const canEdit = !!me?.capabilities.canManageFinance;

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Committee tools</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-main">Finance</h1>
          <p className="mt-2 text-sm text-text-muted">
            {canEdit ? 'Record transactions, manage fund heads, and generate reports.' : 'View-only: running balance and report downloads.'}
          </p>
        </div>

        {notice && <p className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">{notice}</p>}

        {summary && (
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Total Income</p>
              <p className="mt-1 font-heading text-2xl font-bold text-success">{taka(summary.totalIncome)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Total Expense</p>
              <p className="mt-1 font-heading text-2xl font-bold text-error">{taka(summary.totalExpense)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-wide text-text-muted">Running Balance</p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary">{taka(summary.balance)}</p>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-heading text-lg font-bold text-text-main">Generate Report</h2>
          <p className="mt-1 text-sm text-text-muted">Pick a date range and download it as PDF (official letterhead) or Excel.</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-sm text-text-main">
              Start<input type="date" value={reportStart} onChange={(e) => setReportStart(e.target.value)} className="mt-1 block rounded-lg border border-border bg-background px-3 py-2" />
            </label>
            <label className="text-sm text-text-main">
              End<input type="date" value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} className="mt-1 block rounded-lg border border-border bg-background px-3 py-2" />
            </label>
            <button type="button" disabled={reportBusy !== null} onClick={() => downloadReport('pdf')} className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60">
              {reportBusy === 'pdf' ? 'Generating...' : 'Download PDF'}
            </button>
            <button type="button" disabled={reportBusy !== null} onClick={() => downloadReport('xlsx')} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-main disabled:opacity-60">
              {reportBusy === 'xlsx' ? 'Generating...' : 'Download Excel'}
            </button>
          </div>
          {reportError && <p className="mt-2 text-sm text-error">{reportError}</p>}
        </section>

        {canEdit && (
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-heading text-lg font-bold text-text-main">Record a Transaction</h2>
            <form onSubmit={handleAddTransaction} className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-text-main">
                Type
                <select value={txType} onChange={(e) => setTxType(e.target.value as 'INCOME' | 'EXPENSE')} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2">
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </label>
              <label className="text-sm text-text-main">
                Fund head
                <select value={txFundHeadId} onChange={(e) => setTxFundHeadId(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2">
                  {fundHeads.filter((f) => f.type === txType).map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-text-main">
                Amount (৳)<input required type="number" min={1} value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" />
              </label>
              <label className="text-sm text-text-main">
                Member/Donor<input required value={txMemberName} onChange={(e) => setTxMemberName(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" />
              </label>
              <label className="text-sm text-text-main sm:col-span-2">
                Description<input required value={txDescription} onChange={(e) => setTxDescription(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" />
              </label>
              {txError && <p className="text-sm text-error sm:col-span-2">{txError}</p>}
              <button type="submit" disabled={txSaving || !txFundHeadId} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit">
                {txSaving ? 'Saving...' : 'Record transaction'}
              </button>
            </form>

            <div className="mt-6 border-t border-border pt-5">
              <h3 className="font-heading text-base font-bold text-text-main">Fund Heads</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {fundHeads.map((f) => (
                  <span key={f.id} className={`rounded-full px-3 py-1 text-xs font-semibold ${f.type === 'INCOME' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                    {f.name}
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddFundHead} className="mt-3 flex flex-wrap items-end gap-3">
                <label className="text-sm text-text-main">
                  New fund head name<input required value={fhName} onChange={(e) => setFhName(e.target.value)} className="mt-1 block rounded-lg border border-border bg-background px-3 py-2" />
                </label>
                <label className="text-sm text-text-main">
                  Type
                  <select value={fhType} onChange={(e) => setFhType(e.target.value as 'INCOME' | 'EXPENSE')} className="mt-1 block rounded-lg border border-border bg-background px-3 py-2">
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </label>
                <button type="submit" disabled={fhSaving} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-main disabled:opacity-60">
                  {fhSaving ? 'Adding...' : 'Add fund head'}
                </button>
              </form>
              {fhError && <p className="mt-2 text-sm text-error">{fhError}</p>}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <h2 className="p-5 pb-0 font-heading text-lg font-bold text-text-main">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">No transactions recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div>
                    <p className="font-medium text-text-main">{t.description}</p>
                    <p className="text-xs text-text-muted">{t.fundHead.name} · {t.memberName} · {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-semibold ${t.type === 'INCOME' ? 'text-success' : 'text-error'}`}>
                    {t.type === 'INCOME' ? '+' : '−'}{taka(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
