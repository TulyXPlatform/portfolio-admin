import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaGlobe, FaDesktop, FaChrome, FaEye, FaUsers, FaCalendarDay } from 'react-icons/fa';
const rawApi = import.meta.env.VITE_API_URL;
if (!rawApi) console.error('VITE_API_URL not defined (analytics)');
const API = rawApi ? `${rawApi}/api` : '/api';
console.log('[admin] using API base', API);

const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin-token')}` });

interface Analytics {
  total: number;
  today: number;
  byCountry: { country: string; count: number }[];
  byBrowser: { browser: string; count: number }[];
  byOs: { os: string; count: number }[];
  recent: { id: number; ipAddress: string; country: string; city: string; browser: string; os: string; visitedAt: string }[];
  daily: { date: string; count: number }[];
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${API}/admin/analytics`, { headers: getH() })
      .then(r => setData(r.data))
      .catch(err => {
        console.error('[admin] analytics request failed', err);
        setErrorMsg(err.response?.data?.error || err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page" style={{ color: 'var(--text-muted)' }}>Loading analytics…</div>;
  if (!data) return <div className="admin-page">
      <div className="alert alert-error">
        Could not load analytics. {errorMsg && `Error: ${errorMsg}`}<br />Make sure the server is running and the API URL is correct.
      </div>
    </div>;

  const maxDaily = Math.max(...data.daily.map(d => d.count), 1);
  const maxCountry = Math.max(...data.byCountry.map(c => c.count), 1);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Visitor Analytics</h1>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time visitor tracking</span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Visitors', value: data.total, icon: <FaUsers />, color: 'var(--primary)' },
          { label: "Today's Visitors", value: data.today, icon: <FaCalendarDay />, color: 'var(--green)' },
          { label: 'Countries', value: data.byCountry.length, icon: <FaGlobe />, color: '#ccff00' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <p className="stat-label">{s.label}</p>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <p className="stat-value" style={{ color: s.color, fontSize: '1.8rem' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      {data.daily.length > 0 && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
            Visitors — Last 30 Days
          </h2>
          <div className="bar-chart">
            {data.daily.map(d => (
              <div key={d.date} className="bar-wrap" title={`${d.date}: ${d.count} visitors`}>
                <div
                  className="bar"
                  style={{ height: `${Math.max((d.count / maxDaily) * 100, 4)}%` }}
                />
                <span className="bar-label">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* By country */}
        <div className="admin-card">
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <FaGlobe style={{ marginRight: '0.4rem' }} /> Top Countries
          </h2>
          {data.byCountry.map(c => (
            <div key={c.country} className="country-bar-row">
              <span className="country-name">{c.country || 'Unknown'}</span>
              <div className="country-bar-bg">
                <div className="country-bar-fill" style={{ width: `${(c.count / maxCountry) * 100}%` }} />
              </div>
              <span className="country-count">{c.count}</span>
            </div>
          ))}
          {data.byCountry.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet.</p>}
        </div>

        {/* Browser + OS */}
        <div>
          <div className="admin-card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <FaChrome style={{ marginRight: '0.4rem' }} /> Browsers
            </h2>
            {data.byBrowser.map(b => (
              <div key={b.browser} className="country-bar-row">
                <span className="country-name">{b.browser}</span>
                <div className="country-bar-bg">
                  <div className="country-bar-fill" style={{ width: `${(b.count / data.total) * 100}%`, background: 'var(--primary)' }} />
                </div>
                <span className="country-count">{b.count}</span>
              </div>
            ))}
          </div>
          <div className="admin-card">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <FaDesktop style={{ marginRight: '0.4rem' }} /> Operating Systems
            </h2>
            {data.byOs.map(o => (
              <div key={o.os} className="country-bar-row">
                <span className="country-name">{o.os}</span>
                <div className="country-bar-bg">
                  <div className="country-bar-fill" style={{ width: `${(o.count / data.total) * 100}%`, background: 'var(--secondary)' }} />
                </div>
                <span className="country-count">{o.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent visitors table */}
      <div className="admin-card">
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <FaEye style={{ marginRight: '0.4rem' }} /> Recent Visitors (Last 20)
        </h2>
        <div className="admin-table-wrap" style={{ border: 'none', background: 'transparent' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Country</th>
                <th>City</th>
                <th>Browser</th>
                <th>OS</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No visitors yet.</td></tr>
              )}
              {data.recent.map(v => (
                <tr key={v.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.ipAddress}</td>
                  <td>{v.country || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{v.city || '—'}</td>
                  <td><span className="badge badge-blue">{v.browser}</span></td>
                  <td><span className="badge badge-yellow">{v.os}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {new Date(v.visitedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
