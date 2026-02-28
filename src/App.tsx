import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout';
import ProjectsPage from './pages/Projects';
import SkillsPage from './pages/Skills';
import ExperiencesPage from './pages/Experiences';
import PostsPage from './pages/Posts';
import SocialPage from './pages/Social';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';
import MessagesPage from './pages/Messages';
import './index.css';

const isAuth = () => !!localStorage.getItem('admin-token');

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isAuth() ? <AdminLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="experiences" element={<ExperiencesPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="social" element={<SocialPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
