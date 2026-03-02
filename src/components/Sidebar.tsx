import { Brain, Home, LayoutGrid, FileText, TriangleAlert, BookOpen, Users, Medal, Shield, Settings, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../App';
import './Sidebar.css';

interface User {
  name: string;
  email: string;
}

export function Sidebar() {
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || ''
        });
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const firstLetter = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <a href="/" className="logo">
        <span className="logo-icon"><Brain size={20} /></span>
        TruthPrompt
      </a>

      <ul className="nav">
        <li className="nav-item">
          <a href="#" className="nav-link active">
            <Home size={20} />
            Главная
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link">
            <LayoutGrid size={20} />
            Dashboard
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link">
            <FileText size={20} />
            История
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link">
            <TriangleAlert size={20} />
            Доска позора
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link">
            <BookOpen size={20} />
            Термины
          </a>
        </li>

        <li className="nav-divider"></li>

        <li className="nav-item">
          <a href="#" className="nav-link" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
            <Users size={20} />
            Community
            <span className="nav-badge">Development</span>
          </a>
        </li>
      </ul>

      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-dropdown">
          <div className="profile-card">
            <div className="profile-avatar">{firstLetter}</div>
            <div className="profile-info">
              <div className="profile-name">{user?.name || 'User'}</div>
              <div className="profile-email">{user?.email || 'user@example.com'}</div>
              <div className="badge-preview">
                <span className="badge-preview-item"><Medal size={14} /></span>
                <span className="badge-preview-item"><Medal size={14} /></span>
                <span className="badge-preview-item"><Medal size={14} /></span>
                <span className="badge-preview-count">+5</span>
              </div>
            </div>
            <div className="profile-chevron">▶</div>
          </div>

          {/* Profile Dropdown Menu */}
          <div className="profile-menu">
            <a href="#" className="profile-menu-item">
              <Shield size={16} />
              Мои достижения
            </a>
            <a href="#" className="profile-menu-item">
              <Settings size={16} />
              Настройки
            </a>
            <div className="profile-menu-divider"></div>
            <button type="button" className="profile-menu-item logout" onClick={handleLogout}>
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
