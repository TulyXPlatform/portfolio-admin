import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL + '/api';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin-token')}` });

interface Skill { id: number; name: string; logo: string; category: string; }
const EMPTY = { name: '', logo: '', category: 'frontend' };

const categoryLabels: Record<string, string> = {
  programming: 'Programming',
  frontend: 'Frontend',
  backend: 'Backend',
  tech_tools: 'Tech & Tools'
};

const Skills: React.FC = () => {
  const [items, setItems] = useState<Skill[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    axios.get(`${API}/admin/skills`, { headers: getH() }).then(r => setItems(r.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (item?: Skill) => {
    setEditing(item || null);
    setForm(item ? { name: item.name, logo: item.logo, category: item.category } : EMPTY);
    setModal(true);
    setMsg('');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/admin/skills/${editing.id}`, form, { headers: getH() });
      } else {
        await axios.post(`${API}/admin/skills`, form, { headers: getH() });
      }
      load();
      setModal(false);
    } catch { setMsg('Error saving.'); }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this skill?')) return;
    await axios.delete(`${API}/admin/skills/${id}`, { headers: getH() });
    load();
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Skills</h1>
        <button className="btn btn-blue" onClick={() => open()}><FaPlus /> Add Skill</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Logo</th><th>Name</th><th>Category</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No skills yet.</td></tr>}
            {items.map(s => (
              <tr key={s.id}>
                <td>{s.logo && <img src={s.logo} alt={s.name} style={{ width: 28, height: 28, objectFit: 'contain' }} />}</td>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td>
                  <span className={`badge badge-blue`}>
                    {categoryLabels[s.category] || s.category}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => open(s)}><FaEdit /></button>
                    <button className="btn btn-red btn-sm" onClick={() => del(s.id)}><FaTrash /></button>
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
              {editing ? 'Edit Skill' : 'Add Skill'}
              <button className="modal-close" onClick={() => setModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body form-grid">
                {msg && <div className="alert alert-error">{msg}</div>}
                <div className="form-group">
                  <label className="form-label">Skill Name *</label>
                  <input className="form-control" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Logo URL (devicon CDN recommended)</label>
                  <input className="form-control" value={form.logo} placeholder="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/..." onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} />
                  {form.logo && <img src={form.logo} alt="preview" style={{ marginTop: 8, width: 40, height: 40, objectFit: 'contain' }} />}
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="programming">Programming</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="tech_tools">Tech & Tools</option>
                  </select>
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

export default Skills;
