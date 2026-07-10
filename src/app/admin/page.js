"use client";

import { useEffect, useState, useCallback } from 'react';

const EMPTY = { title: '', project: '', year: '', role: '', description: '', link: '' };

export default function Admin() {
  const [key, setKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch('/api/contributions', { cache: 'no-store' });
    setItems(await r.json());
  }, []);

  useEffect(() => {
    const saved = typeof window !== 'undefined' && sessionStorage.getItem('nfs-admin-key');
    if (saved) { setKey(saved); setUnlocked(true); }
    load();
  }, [load]);

  const unlock = async (e) => {
    e.preventDefault();
    // Validate by attempting an authorized no-op via a POST with missing title
    // (401 => wrong key, 400 => key OK).
    const r = await fetch('/api/contributions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': key }, body: '{}',
    });
    if (r.status === 401) { setMsg('Wrong key'); return; }
    sessionStorage.setItem('nfs-admin-key', key);
    setUnlocked(true); setMsg('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) { setMsg('Title is required'); return; }
    setBusy(true);
    const r = await fetch('/api/contributions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': key }, body: JSON.stringify(form),
    });
    setBusy(false);
    if (!r.ok) { setMsg('Save failed'); return; }
    setForm(EMPTY); setMsg('Saved ✓'); load();
  };

  const del = async (id) => {
    if (!confirm('Delete this contribution?')) return;
    await fetch(`/api/contributions?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-admin-key': key } });
    load();
  };

  const field = (name, label, textarea) => (
    <label className="adm-field">
      <span>{label}</span>
      {textarea ? (
        <textarea rows={3} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
      ) : (
        <input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
      )}
    </label>
  );

  if (!unlocked) {
    return (
      <main className="adm">
        <form className="adm-lock" onSubmit={unlock}>
          <h1>Admin</h1>
          <p className="adm-hint">Scientific contributions manager</p>
          <input type="password" placeholder="Admin key" value={key} onChange={(e) => setKey(e.target.value)} autoFocus />
          <button className="btn-primary" type="submit">Unlock</button>
          {msg && <p className="adm-msg">{msg}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="adm">
      <div className="adm-head">
        <h1>Scientific Contributions</h1>
        <a href="/" className="btn-outline">← Back to site</a>
      </div>

      <form className="adm-form" onSubmit={submit}>
        <div className="adm-grid">
          {field('title', 'Title')}
          {field('project', 'Project')}
          {field('year', 'Year')}
          {field('role', 'Role')}
          {field('link', 'Link (optional)')}
        </div>
        {field('description', 'Description', true)}
        <div className="adm-actions">
          <button className="btn-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Add contribution'}</button>
          {msg && <span className="adm-msg">{msg}</span>}
        </div>
      </form>

      <div className="adm-list">
        {items.length === 0 && <p className="adm-hint">No contributions yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="adm-item">
            <div>
              <strong>{it.title}</strong>
              <span className="adm-meta">{[it.project, it.role, it.year].filter(Boolean).join(' · ')}</span>
              {it.description && <p>{it.description}</p>}
            </div>
            <button className="adm-del" onClick={() => del(it.id)}>Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}
