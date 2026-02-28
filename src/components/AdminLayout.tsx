import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome, FaProjectDiagram, FaCode, FaBriefcase,
  FaBookOpen, FaLink, FaChartBar, FaCog, FaSignOutAlt, FaUser, FaEnvelope
} from 'react-icons/fa';

const nav = [
  { label: 'Dashboard', path: '/', icon: <FaHome />, end: true },
  {
    group: 'Content', items: [
      { label: 'Projects', path: '/projects', icon: <FaProjectDiagram /> },
      { label: 'Skills', path: '/skills', icon: <FaCode /> },
      { label: 'Experiences', path: '/experiences', icon: <FaBriefcase /> },
      { label: 'Blog Posts', path: '/posts', icon: <FaBookOpen /> },
      { label: 'Social Links', path: '/social', icon: <FaLink /> },
      { label: 'Messages', path: '/messages', icon: <FaEnvelope /> },
    ]
  },
  {
    group: 'Insights', items: [
      { label: 'Analytics', path: '/analytics', icon: <FaChartBar /> },
      { label: 'Settings', path: '/settings', icon: <FaCog /> },
    ]
  },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('admin-token');
    navigate('/login');
  };

  const getToken = () => localStorage.getItem('admin-token') || '';
  const username = (() => {
    try {
      const payload = JSON.parse(atob(getToken().split('.')[1]));
      return payload.username || 'admin';
    } catch { return 'admin'; }
  })();

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">TM</div>
          <span className="brand-name">Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          {/* Top-level items */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <FaHome /> Dashboard
          </NavLink>

          {/* Groups */}
          {nav.slice(1).map((section: any) => (
            <React.Fragment key={section.group}>
              <span className="nav-group-label">{section.group}</span>
              {section.items.map((item: any) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <FaUser /> {username}
          </div>
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
