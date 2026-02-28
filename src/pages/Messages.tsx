import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaTrash, FaEnvelope, FaUser, FaCalendarAlt, FaTimes } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL + '/api';
const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin-token')}` });

interface Message {
  id: number;
  name: string;
  email: string | null;
  message: string;
  createdAt: string;
}

const Messages: React.FC = () => {
  const [items, setItems] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [modal, setModal] = useState(false);

  const load = useCallback(() => {
    axios.get(`${API}/admin/messages`, { headers: getH() })
      .then(r => setItems(r.data))
      .catch(console.error);
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = async (id: number) => {
    if (!confirm('Delete this message?')) return;
    try {
      await axios.delete(`${API}/admin/messages/${id}`, { headers: getH() });
      load();
      if (selected?.id === id) setModal(false);
    } catch (err) {
      alert('Error deleting message');
    }
  };

  const view = (item: Message) => {
    setSelected(item);
    setModal(true);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Visitor Messages</h1>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Email</th>
              <th>Date</th>
              <th>Message Snippet</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No messages yet.
                </td>
              </tr>
            )}
            {items.map(m => (
              <tr key={m.id} onClick={() => view(m)} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 500 }}>
                  <FaUser style={{ marginRight: 8, fontSize: '0.8rem', opacity: 0.5 }} />
                  {m.name}
                </td>
                <td>
                  {m.email ? (
                    <span><FaEnvelope style={{ marginRight: 8, fontSize: '0.8rem', opacity: 0.5 }} />{m.email}</span>
                  ) : (
                    <span style={{ opacity: 0.3 }}>N/A</span>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.message}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => view(m)}>View</button>
                    <button className="btn btn-red btn-sm" onClick={() => del(m.id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && selected && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              Message from {selected.name}
              <button className="modal-close" onClick={() => setModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>From</p>
                  <p style={{ fontWeight: 600 }}>{selected.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Date</p>
                  <p style={{ fontSize: '0.9rem' }}><FaCalendarAlt style={{ marginRight: 6 }} />{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selected.email && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Email</p>
                  <p style={{ color: 'var(--primary)' }}><FaEnvelope style={{ marginRight: 6 }} />{selected.email}</p>
                </div>
              )}

              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Message</p>
                <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#e2e8f0' }}>{selected.message}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-red" onClick={() => del(selected.id)}>Delete Message</button>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
