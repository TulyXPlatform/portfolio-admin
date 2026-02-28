import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaGithub, FaLinkedin, FaFacebook, FaWhatsapp, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL + '/api';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin-token')}` });

interface Social { id: number; platform: string; url: string; }
const EMPTY = { platform: 'github', url: '' };

const iconMap: Record<string, React.ReactNode> = {
  github: <FaGithub />, linkedin: <FaLinkedin />, facebook: <FaFacebook />,
  whatsapp: <FaWhatsapp />, gmail: <FaEnvelope />, bdjobs: <FaExternalLinkAlt />,
};

const platforms = ['github', 'linkedin', 'facebook', 'whatsapp', 'gmail', 'bdjobs', 'twitter', 'instagram', 'youtube'];

const Social: React.FC = () => {
  const [items, setItems] = useState<Social[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Social | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    axios.get(`${API}/admin/social`, { headers: getH() }).then(r => setItems(r.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (item?: Social) => {
    setEditing(item || null);
    setForm(item ? { platform: item.platform, url: item.url } : EMPTY);
    setModal(true); setMsg('');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/admin/social/${editing.id}`, form, { headers: getH() }); }
      else { await axios.post(`${API}/admin/social`, form, { headers: getH() }); }
      load(); setModal(false);
    } catch { setMsg('Error saving.'); }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this link?')) return;
    await axios.delete(`${API}/admin/social/${id}`, { headers: getH() });
    load();
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Social Links</h1>
        <button className="btn btn-blue" onClick={() => open()}><FaPlus /> Add Link</button>
      </div>

      <div style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        Supported: GitHub, LinkedIn, BDjobs, Facebook, Gmail, WhatsApp (and others). These appear in the hero section and floating navbar.
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Icon</th><th>Platform</th><th>URL</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No social links yet.</td></tr>}
            {items.map(s => (
              <tr key={s.id}>
                <td style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{iconMap[s.platform.toLowerCase()] || <FaExternalLinkAlt />}</td>
                <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{s.platform}</td>
                <td><a href={s.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', wordBreak: 'break-all' }}>{s.url}</a></td>
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
              {editing ? 'Edit Social Link' : 'Add Social Link'}
              <button className="modal-close" onClick={() => setModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body form-grid">
                {msg && <div className="alert alert-error">{msg}</div>}
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select className="form-control" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                    {platforms.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">URL *</label>
                  <input className="form-control" required type="url" value={form.url}
                    placeholder={form.platform === 'gmail' ? 'mailto:your@email.com' : `https://${form.platform}.com/...`}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
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

export default Social;
