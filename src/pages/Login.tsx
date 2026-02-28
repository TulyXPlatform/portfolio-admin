import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

// build-time check for the API URL; will be undefined if env var is missing
const rawApiUrl = import.meta.env.VITE_API_URL;
if (!rawApiUrl) {
  console.error("VITE_API_URL is not defined. The admin app cannot contact the server.");
}
const API_BASE = rawApiUrl ? `${rawApiUrl}/api` : "/api"; // fallback to relative path (likely broken)


const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/login`, { username, password });
            localStorage.setItem('admin-token', res.data.token);
            navigate('/');
        } catch {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="brand-logo" style={{ width: 56, height: 56, fontSize: '1.25rem' }}>TM</div>
                    <div>
                        <p className="login-title">Portfolio Admin Panel</p>
                        <p className="login-subtitle">Sign in to manage your content</p>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            className="form-control"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-control"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-blue"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
