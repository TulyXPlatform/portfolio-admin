import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL + '/api';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin-token')}` });

interface Exp { id: number; title: string; organization: string; startDate: string; endDate: string; description: string; }
const EMPTY = { title: '', organization: '', startDate: '', endDate: 'Present', description: '' };

const Experiences: React.FC = () => {
  const [items, setItems] = useState<Exp[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Exp | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    axios.get(`${API}/admin/experiences`, { headers: getH() }).then(r => setItems(r.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (item?: Exp) => {
    setEditing(item || null);
    setForm(item ? { title: item.title, organization: item.organization, startDate: item.startDate, endDate: item.endDate, description: item.description } : EMPTY);
    setModal(true); setMsg('');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/admin/experiences/${editing.id}`, form, { headers: getH() }); }
      else { await axios.post(`${API}/admin/experiences`, form, { headers: getH() }); }
      load(); setModal(false);
    } catch { setMsg('Error saving.'); }
  };

  const del = async (id: number) => {
    if (!confirm('Delete?')) return;
    await axios.delete(`${API}/admin/experiences/${id}`, { headers: getH() });
    load();
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Experiences</h1>
        <button className="btn btn-blue" onClick={() => open()}><FaPlus /> Add Experience</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Organization</th><th>Duration</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No experiences yet.</td></tr>}
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.title}</td>
                <td style={{ color: 'var(--text-muted)' }}>{item.organization}</td>
                <td><span className="badge badge-green">{item.startDate} → {item.endDate}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => open(item)}><FaEdit /></button>
                    <button className="btn btn-red btn-sm" onClick={() => del(item.id)}><FaTrash /></button>
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
              {editing ? 'Edit Experience' : 'Add Experience'}
              <button className="modal-close" onClick={() => setModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body form-grid">
                {msg && <div className="alert alert-error">{msg}</div>}
                <div className="form-group">
                  <label className="form-label">Job Title / Role *</label>
                  <input className="form-control" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Organization *</label>
                  <input className="form-control" required value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />
                </div>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-control" value={form.startDate} placeholder="Jan 2024" onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-control" value={form.endDate} placeholder="Present" onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description / Responsibilities</label>
                  <textarea className="form-control" rows={6} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="List your responsibilities, modules, or achievements..." />
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

export default Experiences;
