'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Award, Building2, ImageIcon, Loader2, Newspaper, Trophy } from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete, ApiClientError } from '@/lib/api-client';

type Me = { capabilities: { canManageContent: boolean; canViewContent: boolean } };

type Tab = 'site' | 'sponsors' | 'gallery' | 'achievements' | 'contests';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'site', label: 'Home & About Text', icon: Newspaper },
  { id: 'sponsors', label: 'Sponsors', icon: Building2 },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'contests', label: 'Contests', icon: Trophy },
];

function ErrorBanner({ message }: { message: string }) {
  return <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{message}</p>;
}

// ---------- Site content (Home & About text blocks) ----------

const SITE_CONTENT_FIELDS: { key: string; label: string; help: string; multiline?: boolean; list?: boolean }[] = [
  { key: 'home.chairpersonMessage', label: "Chairperson's Message", help: 'Shown on the Home page.', multiline: true },
  { key: 'home.moderatorMessage', label: "Moderator's Message", help: 'Shown on the Home page.', multiline: true },
  { key: 'home.aboutSnapshot', label: 'About Snapshot', help: 'Short "about the club" blurb on the Home page.', multiline: true },
  { key: 'about.mission', label: 'Mission', help: 'Shown on the About page.', multiline: true },
  { key: 'about.vision', label: 'Vision', help: 'Shown on the About page.', multiline: true },
  { key: 'about.history', label: 'History', help: 'Shown on the About page.', multiline: true },
  { key: 'about.facultyAdvisors', label: 'Faculty Advisors', help: 'One name per line — shown as a list on the About page.', multiline: true, list: true },
];

function SiteContentTab({ canManage }: { canManage: boolean }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await apiGet<{ data: { key: string; value: unknown }[] }>('/api/panel/site-content?pageSize=100');
      const map: Record<string, string> = {};
      for (const item of res.data) {
        map[item.key] = Array.isArray(item.value) ? item.value.join('\n') : typeof item.value === 'string' ? item.value : '';
      }
      setValues(map);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load site content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (fieldKey: string, isList: boolean | undefined) => {
    setSavingKey(fieldKey);
    setErrors((e) => ({ ...e, [fieldKey]: '' }));
    setSavedKey(null);
    try {
      const raw = values[fieldKey] ?? '';
      const value = isList ? raw.split('\n').map((s) => s.trim()).filter(Boolean) : raw;
      await apiPost('/api/panel/site-content', { key: fieldKey, value });
      setSavedKey(fieldKey);
    } catch (err) {
      setErrors((e) => ({ ...e, [fieldKey]: err instanceof ApiClientError ? err.message : 'Failed to save.' }));
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <p className="text-sm text-text-muted">Loading site content...</p>;
  if (loadError) return <ErrorBanner message={loadError} />;

  return (
    <div className="space-y-4">
      {SITE_CONTENT_FIELDS.map((field) => (
        <div key={field.key} className="rounded-xl border border-border bg-surface p-4">
          <label className="text-sm font-semibold text-text-main">{field.label}</label>
          <p className="mt-0.5 text-xs text-text-muted">{field.help}</p>
          <textarea
            disabled={!canManage}
            rows={field.list ? 4 : 3}
            value={values[field.key] ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
            className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors[field.key] && <p className="mt-1 text-xs text-error">{errors[field.key]}</p>}
          {canManage && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                disabled={savingKey === field.key}
                onClick={() => handleSave(field.key, field.list)}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {savingKey === field.key ? 'Saving...' : 'Save'}
              </button>
              {savedKey === field.key && <span className="text-xs text-success">Saved</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------- Generic list helpers shared by the four resource tabs ----------

type Sponsor = { id: string; name: string; tier: 'PLATINUM' | 'GOLD' | 'SILVER'; logoUrl: string | null; description: string | null };
type GalleryItem = { id: string; url: string; isVideo: boolean; eventName: string | null; year: number };
type Achievement = { id: string; title: string; description: string | null; date: string; awardingOrg: string | null; photoUrl: string | null };
type Contest = { id: string; name: string; date: string; type: 'PROGRAMMING' | 'CTF' | 'HACKATHON'; result: string | null; registrationLink: string | null };

function SponsorsTab({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', tier: 'GOLD' as Sponsor['tier'], logoUrl: '', description: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await apiGet<{ data: Sponsor[] }>('/api/panel/sponsors?pageSize=100');
      setItems(res.data);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load sponsors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setDraft({ name: '', tier: 'GOLD', logoUrl: '', description: '' });
    setEditId(null);
    setIsFormOpen(false);
    setSaveError('');
  };

  const startEdit = (s: Sponsor) => {
    setDraft({ name: s.name, tier: s.tier, logoUrl: s.logoUrl ?? '', description: s.description ?? '' });
    setEditId(s.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        name: draft.name,
        tier: draft.tier,
        logoUrl: draft.logoUrl || null,
        description: draft.description || null,
      };
      if (editId) await apiPatch(`/api/panel/sponsors/${editId}`, payload);
      else await apiPost('/api/panel/sponsors', payload);
      resetForm();
      await load();
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : 'Failed to save sponsor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await apiDelete(`/api/panel/sponsors/${id}`);
      await load();
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to delete sponsor.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-sm text-text-muted">Loading sponsors...</p>;

  return (
    <div className="space-y-4">
      {loadError && <ErrorBanner message={loadError} />}
      {canManage && (
        <button type="button" onClick={() => (isFormOpen ? resetForm() : setIsFormOpen(true))} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          {isFormOpen ? 'Cancel' : '+ Add sponsor'}
        </button>
      )}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          <label className="text-sm text-text-main">Name<input required value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main">
            Tier
            <select value={draft.tier} onChange={(e) => setDraft((d) => ({ ...d, tier: e.target.value as Sponsor['tier'] }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2">
              <option value="PLATINUM">Platinum</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
            </select>
          </label>
          <label className="text-sm text-text-main sm:col-span-2">
            Logo URL (paste a hosted image link)
            <input type="url" value={draft.logoUrl} onChange={(e) => setDraft((d) => ({ ...d, logoUrl: e.target.value }))} placeholder="https://..." className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" />
          </label>
          <label className="text-sm text-text-main sm:col-span-2">Description<textarea rows={2} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          {saveError && <p className="text-sm text-error sm:col-span-2">{saveError}</p>}
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit">
            {saving ? 'Saving...' : editId ? 'Save changes' : 'Add sponsor'}
          </button>
        </form>
      )}
      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">No sponsors yet.</p>
        ) : (
          items.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-text-main">{s.name} <span className="text-xs text-text-muted">· {s.tier}</span></p>
                {s.description && <p className="text-xs text-text-muted">{s.description}</p>}
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(s)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-main">Edit</button>
                  <button type="button" disabled={busyId === s.id} onClick={() => handleDelete(s.id)} className="rounded-lg border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-semibold text-error disabled:opacity-60">Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GalleryTab({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draft, setDraft] = useState({ url: '', isVideo: false, eventName: '', year: String(new Date().getFullYear()) });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await apiGet<{ data: GalleryItem[] }>('/api/panel/gallery?pageSize=100');
      setItems(res.data);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load gallery items.');
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
      await apiPost('/api/panel/gallery', {
        url: draft.url,
        isVideo: draft.isVideo,
        eventName: draft.eventName || null,
        year: Number(draft.year),
      });
      setDraft({ url: '', isVideo: false, eventName: '', year: String(new Date().getFullYear()) });
      setIsFormOpen(false);
      await load();
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : 'Failed to add gallery item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await apiDelete(`/api/panel/gallery/${id}`);
      await load();
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to delete gallery item.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-sm text-text-muted">Loading gallery...</p>;

  return (
    <div className="space-y-4">
      {loadError && <ErrorBanner message={loadError} />}
      {canManage && (
        <button type="button" onClick={() => setIsFormOpen((v) => !v)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          {isFormOpen ? 'Cancel' : '+ Add photo/video'}
        </button>
      )}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          <label className="text-sm text-text-main sm:col-span-2">
            Media URL (paste a hosted image/video link)
            <input required type="url" value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} placeholder="https://..." className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" />
          </label>
          <label className="text-sm text-text-main">Event name<input value={draft.eventName} onChange={(e) => setDraft((d) => ({ ...d, eventName: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main">Year<input required type="number" min={2000} value={draft.year} onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="flex items-center gap-2 text-sm text-text-main sm:col-span-2">
            <input type="checkbox" checked={draft.isVideo} onChange={(e) => setDraft((d) => ({ ...d, isVideo: e.target.checked }))} /> This is a video
          </label>
          {saveError && <p className="text-sm text-error sm:col-span-2">{saveError}</p>}
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit">
            {saving ? 'Adding...' : 'Add to gallery'}
          </button>
        </form>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <p className="text-sm text-text-muted">No gallery items yet.</p>
        ) : (
          items.map((g) => (
            <div key={g.id} className="rounded-xl border border-border bg-surface p-3">
              {g.isVideo ? (
                <p className="truncate text-xs text-text-muted">Video: {g.url}</p>
              ) : (
                 
                <img src={g.url} alt={g.eventName ?? 'Gallery item'} className="h-32 w-full rounded-lg object-cover" />
              )}
              <p className="mt-2 text-sm font-medium text-text-main">{g.eventName ?? 'Untitled'} <span className="text-xs text-text-muted">· {g.year}</span></p>
              {canManage && (
                <button type="button" disabled={busyId === g.id} onClick={() => handleDelete(g.id)} className="mt-2 rounded-lg border border-error/30 bg-error/10 px-3 py-1 text-xs font-semibold text-error disabled:opacity-60">Delete</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AchievementsTab({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', description: '', date: new Date().toISOString().slice(0, 10), awardingOrg: '', photoUrl: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await apiGet<{ data: Achievement[] }>('/api/panel/achievements?pageSize=100');
      setItems(res.data);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load achievements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setDraft({ title: '', description: '', date: new Date().toISOString().slice(0, 10), awardingOrg: '', photoUrl: '' });
    setEditId(null);
    setIsFormOpen(false);
    setSaveError('');
  };

  const startEdit = (a: Achievement) => {
    setDraft({ title: a.title, description: a.description ?? '', date: a.date.slice(0, 10), awardingOrg: a.awardingOrg ?? '', photoUrl: a.photoUrl ?? '' });
    setEditId(a.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        title: draft.title,
        description: draft.description || null,
        date: draft.date,
        awardingOrg: draft.awardingOrg || null,
        photoUrl: draft.photoUrl || null,
      };
      if (editId) await apiPatch(`/api/panel/achievements/${editId}`, payload);
      else await apiPost('/api/panel/achievements', payload);
      resetForm();
      await load();
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await apiDelete(`/api/panel/achievements/${id}`);
      await load();
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to delete achievement.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-sm text-text-muted">Loading achievements...</p>;

  return (
    <div className="space-y-4">
      {loadError && <ErrorBanner message={loadError} />}
      {canManage && (
        <button type="button" onClick={() => (isFormOpen ? resetForm() : setIsFormOpen(true))} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          {isFormOpen ? 'Cancel' : '+ Add achievement'}
        </button>
      )}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          <label className="text-sm text-text-main sm:col-span-2">Title<input required value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main">Date<input required type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main">Awarding organization<input value={draft.awardingOrg} onChange={(e) => setDraft((d) => ({ ...d, awardingOrg: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main sm:col-span-2">Photo URL<input type="url" value={draft.photoUrl} onChange={(e) => setDraft((d) => ({ ...d, photoUrl: e.target.value }))} placeholder="https://..." className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main sm:col-span-2">Description<textarea rows={2} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          {saveError && <p className="text-sm text-error sm:col-span-2">{saveError}</p>}
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit">
            {saving ? 'Saving...' : editId ? 'Save changes' : 'Add achievement'}
          </button>
        </form>
      )}
      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">No achievements yet.</p>
        ) : (
          items.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-text-main">{a.title}</p>
                <p className="text-xs text-text-muted">{new Date(a.date).toLocaleDateString()}{a.awardingOrg ? ` · ${a.awardingOrg}` : ''}</p>
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(a)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-main">Edit</button>
                  <button type="button" disabled={busyId === a.id} onClick={() => handleDelete(a.id)} className="rounded-lg border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-semibold text-error disabled:opacity-60">Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ContestsTab({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', date: new Date().toISOString().slice(0, 10), type: 'PROGRAMMING' as Contest['type'], result: '', registrationLink: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await apiGet<{ data: Contest[] }>('/api/panel/contests?pageSize=100');
      setItems(res.data);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load contests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setDraft({ name: '', date: new Date().toISOString().slice(0, 10), type: 'PROGRAMMING', result: '', registrationLink: '' });
    setEditId(null);
    setIsFormOpen(false);
    setSaveError('');
  };

  const startEdit = (c: Contest) => {
    setDraft({ name: c.name, date: c.date.slice(0, 10), type: c.type, result: c.result ?? '', registrationLink: c.registrationLink ?? '' });
    setEditId(c.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        name: draft.name,
        date: draft.date,
        type: draft.type,
        result: draft.result || null,
        registrationLink: draft.registrationLink || null,
      };
      if (editId) await apiPatch(`/api/panel/contests/${editId}`, payload);
      else await apiPost('/api/panel/contests', payload);
      resetForm();
      await load();
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : 'Failed to save contest.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await apiDelete(`/api/panel/contests/${id}`);
      await load();
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Failed to delete contest.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-sm text-text-muted">Loading contests...</p>;

  return (
    <div className="space-y-4">
      {loadError && <ErrorBanner message={loadError} />}
      {canManage && (
        <button type="button" onClick={() => (isFormOpen ? resetForm() : setIsFormOpen(true))} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          {isFormOpen ? 'Cancel' : '+ Add contest'}
        </button>
      )}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          <label className="text-sm text-text-main sm:col-span-2">Name<input required value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main">Date<input required type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main">
            Type
            <select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as Contest['type'] }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2">
              <option value="PROGRAMMING">Programming</option>
              <option value="CTF">CTF</option>
              <option value="HACKATHON">Hackathon</option>
            </select>
          </label>
          <label className="text-sm text-text-main sm:col-span-2">Registration link<input type="url" value={draft.registrationLink} onChange={(e) => setDraft((d) => ({ ...d, registrationLink: e.target.value }))} placeholder="https://..." className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="text-sm text-text-main sm:col-span-2">Result<textarea rows={2} value={draft.result} onChange={(e) => setDraft((d) => ({ ...d, result: e.target.value }))} className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          {saveError && <p className="text-sm text-error sm:col-span-2">{saveError}</p>}
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit">
            {saving ? 'Saving...' : editId ? 'Save changes' : 'Add contest'}
          </button>
        </form>
      )}
      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">No contests yet.</p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-text-main">{c.name} <span className="text-xs text-text-muted">· {c.type}</span></p>
                <p className="text-xs text-text-muted">{new Date(c.date).toLocaleDateString()}{c.result ? ` · ${c.result}` : ''}</p>
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(c)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-main">Edit</button>
                  <button type="button" disabled={busyId === c.id} onClick={() => handleDelete(c.id)} className="rounded-lg border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-semibold text-error disabled:opacity-60">Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function ContentManagement() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<Tab>('site');

  useEffect(() => {
    (async () => {
      try {
        setMe(await apiGet<Me>('/api/panel/me'));
      } catch (err) {
        setLoadError(err instanceof ApiClientError ? err.message : 'Failed to load your profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 text-sm text-text-muted flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</main>;
  }
  if (loadError) {
    return <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8"><ErrorBanner message={loadError} /></main>;
  }
  if (me && !me.capabilities.canViewContent) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8">
        <p className="mx-auto max-w-3xl rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          You don&apos;t have access to website content management.
        </p>
      </main>
    );
  }

  const canManage = me?.capabilities.canManageContent ?? false;

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Public website</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-main">Website Content</h1>
          <p className="mt-1 text-sm text-text-muted">
            {canManage
              ? 'Update the text and media that appear on the public website — changes go live immediately.'
              : 'View-only access to the public website content.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  tab === t.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface hover:text-text-main'
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'site' && <SiteContentTab canManage={canManage} />}
        {tab === 'sponsors' && <SponsorsTab canManage={canManage} />}
        {tab === 'gallery' && <GalleryTab canManage={canManage} />}
        {tab === 'achievements' && <AchievementsTab canManage={canManage} />}
        {tab === 'contests' && <ContestsTab canManage={canManage} />}
      </div>
    </main>
  );
}
