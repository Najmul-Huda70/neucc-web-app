'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost, ApiClientError } from '@/lib/api-client';

type Me = { capabilities: { canManageDocument: boolean } };

type Doc = {
  id: string;
  title: string;
  url: string;
  mimeType: string;
  noticeId: string | null;
  resolutionId: string | null;
  createdAt: string;
};

export default function DashboardDocumentsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [mimeType, setMimeType] = useState('application/pdf');
  const [linkType, setLinkType] = useState<'notice' | 'resolution'>('notice');
  const [linkId, setLinkId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const meData = await apiGet<Me>('/api/panel/me');
      setMe(meData);
      if (!meData.capabilities.canManageDocument) return;
      const res = await apiGet<{ data: Doc[] }>('/api/panel/documents?pageSize=30');
      setDocs(res.data);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await apiPost('/api/panel/documents', {
        title,
        url,
        mimeType,
        ...(linkType === 'notice' ? { noticeId: linkId } : { resolutionId: linkId }),
      });
      setTitle('');
      setUrl('');
      setLinkId('');
      await load();
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : 'Failed to save document.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 text-sm text-text-muted">Loading documents...</main>;
  }
  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{loadError}</p>
      </main>
    );
  }
  if (me && !me.capabilities.canManageDocument) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          Only the Information Secretary team can manage documents.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Committee tools</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-main">Documents</h1>
          <p className="mt-2 text-sm text-text-muted">
            Link an already-hosted file (S3/Cloudinary/etc. URL) to a Notice or Resolution. There is no file upload
            here — this project has no file storage configured yet; you paste a URL to something already hosted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
          <label className="text-sm text-text-main">Title<input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main">File URL<input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main">MIME type<input required value={mimeType} onChange={(e) => setMimeType(e.target.value)} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main">
            Link to
            <div className="mt-1 flex gap-2">
              <select value={linkType} onChange={(e) => setLinkType(e.target.value as 'notice' | 'resolution')} className="rounded-lg border border-border bg-background px-3 py-2">
                <option value="notice">Notice ID</option>
                <option value="resolution">Resolution ID</option>
              </select>
              <input required value={linkId} onChange={(e) => setLinkId(e.target.value)} placeholder="cuid..." className="flex-1 rounded-lg border border-border bg-background px-3 py-2" />
            </div>
          </label>
          {saveError && <p className="text-sm text-error sm:col-span-2">{saveError}</p>}
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit">
            {saving ? 'Saving...' : 'Attach document'}
          </button>
        </form>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          {docs.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">No documents attached yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium text-text-main">{d.title}</p>
                    <p className="text-xs text-text-muted">
                      {d.mimeType} · {d.noticeId ? `Notice ${d.noticeId.slice(0, 8)}…` : `Resolution ${d.resolutionId?.slice(0, 8)}…`}
                    </p>
                  </div>
                  <a href={d.url} target="_blank" rel="noreferrer" className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                    Open
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
