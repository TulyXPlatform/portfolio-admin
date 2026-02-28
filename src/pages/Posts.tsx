import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL + '/api';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin-token')}` });

interface Post { id: number; title: string; summary: string; content: string; coverImage: string; createdAt: string; }
const EMPTY = { title: '', summary: '', content: '', coverImage: '' };

const Posts: React.FC = () => {
  const [items, setItems] = useState<Post[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    axios.get(`${API}/admin/posts`, { headers: getH() }).then(r => setItems(r.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (item?: Post) => {
    setEditing(item || null);
    setForm(item ? { title: item.title, summary: item.summary, content: item.content, coverImage: item.coverImage } : EMPTY);
    setModal(true); setMsg('');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/admin/posts/${editing.id}`, form, { headers: getH() }); }
      else { await axios.post(`${API}/admin/posts`, form, { headers: getH() }); }
      load(); setModal(false);
    } catch { setMsg('Error saving.'); }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this post?')) return;
    await axios.delete(`${API}/admin/posts/${id}`, { headers: getH() });
    load();
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    const res = await axios.post(`${API}/upload`, data, { headers: { ...getH(), 'Content-Type': 'multipart/form-data' } });
    setForm(f => ({ ...f, coverImage: `${import.meta.env.VITE_API_URL}${res.data.url}` }));
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Blog Posts</h1>
        <button className="btn btn-blue" onClick={() => open()}><FaPlus /> New Post</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Summary</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No posts yet.</td></tr>}
            {items.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500, maxWidth: 200 }}>{p.title}</td>
                <td style={{ color: 'var(--text-muted)', maxWidth: 250 }}>{p.summary}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => open(p)}><FaEdit /></button>
                    <button className="btn btn-red btn-sm" onClick={() => del(p.id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 780 }}>
            <div className="modal-header">
              {editing ? 'Edit Post' : 'New Blog Post'}
              <button className="modal-close" onClick={() => setModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body form-grid">
                {msg && <div className="alert alert-error">{msg}</div>}
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-control" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Summary / Excerpt</label>
                  <textarea className="form-control" rows={2} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Cover Image</label>
                  <input type="file" accept="image/*" onChange={uploadCover} className="form-control" />
                  <input className="form-control" style={{ marginTop: 6 }} value={form.coverImage} placeholder="Or paste image URL" onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} />
                  {form.coverImage && <img src={form.coverImage} alt="cover" style={{ marginTop: 8, width: '100%', height: 140, objectFit: 'cover', borderRadius: 4 }} />}
                </div>
                <div className="form-group">
                  <label className="form-label">Content (supports plain text / markdown)</label>
                  <textarea className="form-control" rows={12} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your full post here..." style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.7 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-blue">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
