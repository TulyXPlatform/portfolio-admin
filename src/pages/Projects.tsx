import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL + '/api';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin-token')}` });

interface Project { id: number; title: string; shortDescription: string; description: string; image: string; images: string; liveLink: string; githubLink: string; tags: string; }
const EMPTY: Omit<Project, 'id'> = { title: '', shortDescription: '', description: '', image: '', images: '', liveLink: '', githubLink: '', tags: '' };

const Projects: React.FC = () => {
  const [items, setItems] = useState<Project[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, 'id'>>(EMPTY);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    axios.get(`${API}/admin/projects`, { headers: getH() }).then(r => setItems(r.data)).catch(console.error);
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (item?: Project) => {
    setEditing(item || null);
    setForm(item ? { ...item } : EMPTY);
    setModal(true);
    setMsg('');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/admin/projects/${editing.id}`, form, { headers: getH() });
      } else {
        await axios.post(`${API}/admin/projects`, form, { headers: getH() });
      }
      setMsg('Saved!');
      load();
      setModal(false);
    } catch { setMsg('Error saving. Please try again.'); }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    await axios.delete(`${API}/admin/projects/${id}`, { headers: getH() });
    load();
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    const res = await axios.post(`${API}/upload`, data, { headers: { ...getH(), 'Content-Type': 'multipart/form-data' } });
    setForm(f => ({ ...f, image: `http://localhost:5000${res.data.url}` }));
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn btn-blue" onClick={() => open()}>
          <FaPlus /> Add Project
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Short Description</th>
              <th>Tags</th>
              <th>Live</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No projects yet.</td></tr>
            )}
            {items.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.title}</td>
                <td style={{ color: 'var(--text-muted)', maxWidth: 200 }}>{p.shortDescription}</td>
                <td>{p.tags?.split(',').map((t, i) => <span key={i} className="badge badge-blue" style={{ marginRight: 3 }}>{t.trim()}</span>)}</td>
                <td>{p.liveLink && <a href={p.liveLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}><FaExternalLinkAlt /></a>}</td>
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
          <div className="modal">
            <div className="modal-header">
              {editing ? 'Edit Project' : 'Add Project'}
              <button className="modal-close" onClick={() => setModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body form-grid">
                {msg && <div className={`alert ${msg === 'Saved!' ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-control" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <input className="form-control" value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Description</label>
                  <textarea className="form-control" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Image URL</label>
                  <input className="form-control" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://... or upload below" />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Primary Image</label>
                  <input type="file" accept="image/*" onChange={uploadImage} className="form-control" />
                  {form.image && <img src={form.image} alt="preview" style={{ marginTop: 8, width: 120, height: 80, objectFit: 'cover', borderRadius: 4 }} />}
                </div>
                <div className="form-group">
                  <label className="form-label">Extra Images (comma-separated URLs)</label>
                  <input className="form-control" value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} />
                </div>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Live Link</label>
                    <input className="form-control" value={form.liveLink} onChange={e => setForm(f => ({ ...f, liveLink: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub Link</label>
                    <input className="form-control" value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-control" value={form.tags} placeholder="React, Node.js, MSSQL" onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-blue">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
