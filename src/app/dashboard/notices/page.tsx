'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost, ApiClientError } from '@/lib/api-client';

type NoticeScope = 'GENERAL' | 'INTERNAL' | 'ELECTION';

type Notice = {
  id: string;
  subject: string;
  body: string;
  scope: NoticeScope;
  memoNo: string;
  date: string;
  pdfUrl: string | null;
  imageUrl: string | null;
  isPinned: boolean;
};

type NoticeCollection = {
  data: Notice[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

type NoticeDraft = {
  subject: string;
  body: string;
  scope: NoticeScope;
  memoNo: string;
  date: string;
  pdfUrl: string;
  imageUrl: string;
  isPinned: boolean;
};

type AiTurn = { role: 'user' | 'assistant'; content: string };

type AiDraftResponse = {
  data: {
    needsClarification: boolean;
    clarifyingQuestion: string | null;
    draft: { subject: string; body: string; memoNoSuggestion: string } | null;
  };
};

const emptyDraft: NoticeDraft = {
  subject: '',
  body: '',
  scope: 'GENERAL',
  memoNo: '',
  date: new Date().toISOString().slice(0, 10),
  pdfUrl: '',
  imageUrl: '',
  isPinned: false,
};

function toDraft(notice: Notice): NoticeDraft {
  return {
    subject: notice.subject,
    body: notice.body,
    scope: notice.scope,
    memoNo: notice.memoNo,
    date: notice.date.slice(0, 10),
    pdfUrl: notice.pdfUrl ?? '',
    imageUrl: notice.imageUrl ?? '',
    isPinned: notice.isPinned,
  };
}


export default function DashboardNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [draft, setDraft] = useState<NoticeDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [aiOpen, setAiOpen] = useState(false);
  const [aiConversation, setAiConversation] = useState<AiTurn[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState('');

  const loadNotices = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiGet<NoticeCollection>('/api/panel/notices?page=1&pageSize=50');
      setNotices(response.data);
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : 'Unable to load notices.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotices();
  }, []);

  const updateDraft = <K extends keyof NoticeDraft>(field: K, value: NoticeDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const openCreate = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setError('');
    setNotice('');
    setIsFormOpen(true);
    setAiOpen(false);
    setAiConversation([]);
    setAiInput('');
    setAiError('');
  };

  const openEdit = (item: Notice) => {
    setDraft(toDraft(item));
    setEditingId(item.id);
    setError('');
    setNotice('');
    setIsFormOpen(true);
    setAiOpen(false);
    setAiConversation([]);
    setAiInput('');
    setAiError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setNotice('');

    const payload = {
      ...draft,
      pdfUrl: draft.pdfUrl || null,
      imageUrl: draft.imageUrl || null,
      date: new Date(`${draft.date}T00:00:00.000Z`).toISOString(),
    };

    try {
      if (editingId) {
        await apiPatch(`/api/panel/notices/${editingId}`, payload);
        setNotice('Notice updated successfully.');
      } else {
        await apiPost('/api/panel/notices', payload);
        setNotice('Notice published successfully.');
      }
      setIsFormOpen(false);
      await loadNotices();
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : 'Unable to save notice.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notice?')) return;
    setError('');
    setNotice('');
    try {
      await apiDelete(`/api/panel/notices/${id}`);
      setNotice('Notice deleted successfully.');
      await loadNotices();
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : 'Unable to delete notice.');
    }
  };

  // Sends the current aiInput as the next turn. On a clarifying question,
  // appends it to the transcript and waits for the next reply. On a
  // finished draft, fills the form fields directly — the committee reviews
  // and edits before publishing, same as if they'd typed it themselves.
  const sendAiMessage = async () => {
    const instruction = aiInput.trim();
    if (!instruction) return;
    setAiLoading(true);
    setAiError('');
    try {
      const response = await apiPost<AiDraftResponse>('/api/panel/notices/ai-draft', {
        scope: draft.scope,
        instruction,
        conversation: aiConversation,
      });
      const result = response.data;
      const nextConversation: AiTurn[] = [...aiConversation, { role: 'user', content: instruction }];
      setAiInput('');

      if (result.needsClarification && result.clarifyingQuestion) {
        setAiConversation([...nextConversation, { role: 'assistant', content: result.clarifyingQuestion }]);
      } else if (result.draft) {
        setAiConversation([
          ...nextConversation,
          { role: 'assistant', content: 'Draft ready — applied to the form below. Review and edit before publishing.' },
        ]);
        setDraft((current) => ({
          ...current,
          subject: result.draft!.subject,
          body: result.draft!.body,
          memoNo: current.memoNo || result.draft!.memoNoSuggestion,
        }));
      }
    } catch (requestError) {
      setAiError(requestError instanceof ApiClientError ? requestError.message : 'AI drafting failed.');
    } finally {
      setAiLoading(false);
    }
  };

  // Downloads the letterhead PDF for an existing (already-saved) notice —
  // wires up the Step 7 PDF infrastructure from this page.
  const handleGeneratePad = async (id: string) => {
    setPdfBusyId(id);
    setPdfError('');
    try {
      const res = await fetch(`/api/panel/notices/${id}/generate-pad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include',
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setPdfError(requestError instanceof Error ? requestError.message : 'Failed to generate PDF.');
    } finally {
      setPdfBusyId(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Committee tools</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-text-main">Notices</h1>
            <p className="mt-2 text-sm text-text-muted">Publish and manage notices available to authorized members.</p>
          </div>
          <button type="button" onClick={openCreate} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
            Create notice
          </button>
        </div>

        {error && <p className="mt-6 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</p>}
        {notice && <p className="mt-6 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">{notice}</p>}

        {isFormOpen && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-main">✨ Draft with AI</p>
                <button type="button" onClick={() => setAiOpen((v) => !v)} className="text-xs font-semibold text-primary">
                  {aiOpen ? 'Hide' : 'Open'}
                </button>
              </div>
              {aiOpen && (
                <div className="mt-3 space-y-3">
                  {aiConversation.length > 0 && (
                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border bg-background p-3">
                      {aiConversation.map((turn, i) => (
                        <p key={i} className={`text-sm ${turn.role === 'assistant' ? 'text-primary' : 'text-text-main'}`}>
                          <span className="font-semibold">{turn.role === 'assistant' ? 'AI: ' : 'You: '}</span>
                          {turn.content}
                        </p>
                      ))}
                    </div>
                  )}
                  {aiError && <p className="text-sm text-error">{aiError}</p>}
                  <div className="flex gap-2">
                    <input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void sendAiMessage();
                        }
                      }}
                      placeholder="e.g. আগামী শনিবার ওয়ার্কশপের নোটিশ লিখো"
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => void sendAiMessage()}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {aiLoading ? 'Thinking...' : 'Send'}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted">
                    Set the Scope field below first — the AI drafts in that scope&apos;s tone and checks its recent
                    notices for memo-number style. If it&apos;s missing information, it will ask before drafting.
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-text-main">Subject<input required minLength={2} value={draft.subject} onChange={(event) => updateDraft('subject', event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-medium text-text-main">Memo number<input required value={draft.memoNo} onChange={(event) => updateDraft('memoNo', event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-medium text-text-main">Scope<select value={draft.scope} onChange={(event) => updateDraft('scope', event.target.value as NoticeScope)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal"><option value="GENERAL">General</option><option value="INTERNAL">Internal</option><option value="ELECTION">Election</option></select></label>
              <label className="text-sm font-medium text-text-main">Date<input required type="date" value={draft.date} onChange={(event) => updateDraft('date', event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal" /></label>
            </div>
            <label className="block text-sm font-medium text-text-main">Body<textarea required minLength={5} rows={5} value={draft.body} onChange={(event) => updateDraft('body', event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-text-main">PDF URL<input type="url" value={draft.pdfUrl} onChange={(event) => updateDraft('pdfUrl', event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal" /></label><label className="text-sm font-medium text-text-main">Image URL<input type="url" value={draft.imageUrl} onChange={(event) => updateDraft('imageUrl', event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal" /></label></div>
            <label className="flex items-center gap-2 text-sm text-text-main"><input type="checkbox" checked={draft.isPinned} onChange={(event) => updateDraft('isPinned', event.target.checked)} /> Pin this notice</label>
            <div className="flex gap-3"><button type="submit" disabled={isSaving} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? 'Saving...' : editingId ? 'Update notice' : 'Publish notice'}</button><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text-main">Cancel</button></div>
          </form>
        )}

        {pdfError && <p className="mt-6 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{pdfError}</p>}

        <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
          {isLoading ? <p className="p-6 text-sm text-text-muted">Loading notices...</p> : notices.length === 0 ? <p className="p-6 text-sm text-text-muted">No notices found.</p> : <div className="divide-y divide-border">{notices.map((item) => <article key={item.id} className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{item.scope}</span>{item.isPinned && <span className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">Pinned</span>}</div><h2 className="mt-3 font-heading text-lg font-bold text-text-main">{item.subject}</h2><p className="mt-1 text-xs text-text-muted">{item.memoNo} · {new Date(item.date).toLocaleDateString()}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-muted">{item.body}</p></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" disabled={pdfBusyId === item.id} onClick={() => void handleGeneratePad(item.id)} className="rounded-lg border border-primary/30 px-3 py-2 text-sm font-semibold text-primary disabled:opacity-60">{pdfBusyId === item.id ? 'Generating...' : 'Generate PDF'}</button><button type="button" onClick={() => openEdit(item)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-main">Edit</button><button type="button" onClick={() => void handleDelete(item.id)} className="rounded-lg border border-error/30 px-3 py-2 text-sm font-semibold text-error">Delete</button></div></div></article>)}</div>}
        </section>
      </div>
    </main>
  );
}
