import { NavLink, useNavigate } from 'react-router-dom';
import { Archive, FileText, LogOut, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export function AppShell({ children, onCreate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
      toast.success('You’re signed out');
    } catch {
      toast.error('Could not sign out. Please try again.');
    }
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <NavLink to="/app" className="brand-lockup" aria-label="NotesFlow home">
          <span className="brand-mark"><FileText size={19} strokeWidth={2.2} /></span><span>notesflow<span className="brand-period">.</span></span>
        </NavLink>
        <div className="sidebar-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <NavLink to="/app" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><FileText size={18} /> <span>My notes</span></NavLink>
          <NavLink to="/app/archive" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Archive size={18} /> <span>Archive</span></NavLink>
        </nav>
        <div className="sidebar-tip"><Sparkles size={16} /><p>A little space for all the things on your mind.</p></div>
        <div className="sidebar-bottom">
          <div className="user-profile"><span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'N'}</span><span className="user-meta"><strong>{user?.name}</strong><small>{user?.email}</small></span></div>
          <button className="icon-button logout-button" type="button" onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="mobile-header">
          <NavLink to="/app" className="brand-lockup"><span className="brand-mark"><FileText size={18} /></span><span>notesflow<span className="brand-period">.</span></span></NavLink>
          <nav aria-label="Mobile navigation">
            <NavLink to="/app" end aria-label="My notes"><FileText size={18} /></NavLink>
            <NavLink to="/app/archive" aria-label="Archive"><Archive size={18} /></NavLink>
            <button type="button" onClick={handleLogout} aria-label="Sign out"><LogOut size={18} /></button>
          </nav>
        </header>
        <div className="mobile-create"><button className="button button-primary" type="button" onClick={onCreate}><Plus size={17} /> New note</button></div>
        {children}
      </main>
    </div>
  );
}
