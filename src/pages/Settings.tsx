import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSave, FaFileUpload } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL + '/api';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin-token')}` });

const Settings: React.FC = () => {
  const [cvLink, setCvLink] = useState('');
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/admin/settings`, { headers: getH() }).then(r => {
      const cv = r.data.find((s: any) => s.keyName === 'cvLink');
      if (cv) setCvLink(cv.value);
    });
  }, []);

  const saveCvLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/settings/cvLink`, { value: cvLink }, { headers: getH() });
      setMsg('CV link saved!');
    } catch { setMsg('Error saving.'); }
  };

  const uploadCv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await axios.post(`${API}/upload`, data, { headers: { ...getH(), 'Content-Type': 'multipart/form-data' } });
      const url = `http://localhost:5000${res.data.url}`;
      setCvLink(url);
      await axios.put(`${API}/admin/settings/cvLink`, { value: url }, { headers: getH() });
      setMsg('CV uploaded and saved! URL: ' + url);
    } catch { setMsg('Upload failed.'); }
    finally { setUploading(false); }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('Error') || msg.includes('failed') ? 'alert-error' : 'alert-success'}`}>
          {msg}
        </div>
      )}

      <div className="admin-card" style={{ maxWidth: 600 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>CV / Resume</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Upload your CV/Resume PDF. Visitors can download it from the hero section of your portfolio.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Upload CV PDF</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text)'
                }}
              >
                <FaFileUpload /> {uploading ? 'Uploading…' : 'Choose PDF File'}
                <input type="file" accept=".pdf" onChange={uploadCv} style={{ display: 'none' }} />
              </label>
              {cvLink && (
                <a href={cvLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                  Preview Current CV ↗
                </a>
              )}
            </div>
          </div>

          <form onSubmit={saveCvLink} className="form-group">
            <label className="form-label">Or enter CV URL manually</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="form-control"
                value={cvLink}
                onChange={e => setCvLink(e.target.value)}
                placeholder="https://... or /uploads/cv.pdf"
              />
              <button type="submit" className="btn btn-blue" style={{ whiteSpace: 'nowrap' }}>
                <FaSave /> Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
