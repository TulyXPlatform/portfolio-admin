import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaProjectDiagram, FaCode, FaBriefcase, FaBookOpen, FaUsers, FaEye, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL + '/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin-token')}` });

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({ projects: 0, skills: 0, experiences: 0, posts: 0, totalVisitors: 0, todayVisitors: 0, messages: 0 });

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/admin/projects`, { headers: getHeaders() }),
            axios.get(`${API}/admin/skills`, { headers: getHeaders() }),
            axios.get(`${API}/admin/experiences`, { headers: getHeaders() }),
            axios.get(`${API}/admin/posts`, { headers: getHeaders() }),
            axios.get(`${API}/admin/analytics`, { headers: getHeaders() }),
            axios.get(`${API}/admin/messages`, { headers: getHeaders() }),
        ]).then(([p, s, e, b, a, m]) => {
            setStats({
                projects: p.data.length,
                skills: s.data.length,
                experiences: e.data.length,
                posts: b.data.length,
                totalVisitors: a.data.total,
                todayVisitors: a.data.today,
                messages: m.data.length,
            });
        }).catch(console.error);
    }, []);

    const cards = [
        { label: 'Total Projects', value: stats.projects, icon: <FaProjectDiagram />, link: '/projects', color: 'var(--primary)' },
        { label: 'Skills Listed', value: stats.skills, icon: <FaCode />, link: '/skills', color: '#00bd65' },
        { label: 'Experiences', value: stats.experiences, icon: <FaBriefcase />, link: '/experiences', color: '#ccff00' },
        { label: 'Blog Posts', value: stats.posts, icon: <FaBookOpen />, link: '/posts', color: '#00ff88' },
        { label: 'Total Visitors', value: stats.totalVisitors, icon: <FaUsers />, link: '/analytics', color: 'var(--primary)' },
        { label: "Today's Visitors", value: stats.todayVisitors, icon: <FaEye />, link: '/analytics', color: '#00bd65' },
        { label: 'Unread Messages', value: stats.messages, icon: <FaEnvelope />, link: '/messages', color: '#ccff00' },
    ];

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>

            <div className="card-grid">
                {cards.map(c => (
                    <Link to={c.link} key={c.label} style={{ textDecoration: 'none' }}>
                        <div className="stat-card" style={{ borderLeft: `3px solid ${c.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <p className="stat-label">{c.label}</p>
                                <span style={{ color: c.color, fontSize: '1.2rem' }}>{c.icon}</span>
                            </div>
                            <p className="stat-value" style={{ color: c.color }}>{c.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="admin-card" style={{ marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Quick Actions</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {[
                        { label: '+ Add Project', link: '/projects' },
                        { label: '+ Add Skill', link: '/skills' },
                        { label: '+ Add Experience', link: '/experiences' },
                        { label: '+ New Blog Post', link: '/posts' },
                        { label: 'View Analytics', link: '/analytics' },
                    ].map(a => (
                        <Link key={a.label} to={a.link} className="btn btn-ghost btn-sm">{a.label}</Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
