import React from 'react';
import {
  LayoutDashboard,
  Files,
  SquareCode,
  CirclePlus,
  Users,
  ChartNoAxesCombined,
  LibraryBig,
  ChartSpline,
  Trophy,
  Bookmark,
  CheckCircle,
  ChevronsUpDown,
  Swords,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppPage } from '../types';

export const Sidebar: React.FC = () => {
  const { role, switchRole, page, setPage, bookmarks, user, sidebarOpen, setSidebarOpen, setAuthModalOpen, battles, revisionDueCount } = useApp();

  const pendingIncomingCount = battles.filter((b) => b.status === 'pending').length;

  const teacherNav: Array<{ id: AppPage; label: string; icon: React.FC<{ size?: number; className?: string }> }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'quizzes', label: 'My quizzes', icon: Files },
    { id: 'teacherBattleSets', label: 'Battle sets', icon: Swords },
    { id: 'coding', label: 'Code practice', icon: SquareCode },
    { id: 'create', label: 'Create quiz', icon: CirclePlus },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  ];

  const studentNav: Array<{ id: AppPage; label: string; icon: React.FC<{ size?: number; className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'learningSpace', label: 'My Learning Space', icon: BookOpen, badge: revisionDueCount > 0 ? revisionDueCount : undefined },
    { id: 'library', label: 'Quiz library', icon: LibraryBig },
    { id: 'peerBattles', label: 'Peer battle', icon: Swords, badge: pendingIncomingCount > 0 ? pendingIncomingCount : undefined },
    { id: 'coding', label: 'Code practice', icon: SquareCode },
    { id: 'performance', label: 'Performance', icon: ChartSpline },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'bookmarks', label: 'Practice later', icon: Bookmark },
  ];

  const navItems = role === 'teacher' ? teacherNav : studentNav;

  const initials = (user?.name || 'Guest')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const userSubtext =
    role === 'teacher' ? 'Teacher · Computer Science' : `Student · Batch ${user?.batch || '5.0'}`;

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">U</div>
          <div className="brand-copy">
            Uzone<span>Quiz</span>
            <small>Learn · Test · Grow</small>
          </div>
        </div>

        <div className="role-switcher" aria-label="Switch workspace role">
          <button
            type="button"
            className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
            onClick={() => switchRole('teacher')}
          >
            Teacher
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => switchRole('student')}
          >
            Student
          </button>
        </div>

        <div className="nav-label">Workspace</div>
        <nav className="nav">
          {navItems.map((item) => {
            const { id, label, icon: IconComponent } = item;
            const badgeCount = 'badge' in item ? (item as any).badge : undefined;
            return (
              <button
                key={id}
                type="button"
                className={`nav-item ${page === id ? 'active' : ''}`}
                onClick={() => {
                  setPage(id);
                  setSidebarOpen(false);
                }}
              >
                <IconComponent size={17} />
                <span>{label}</span>
                {id === 'bookmarks' && bookmarks.size > 0 && (
                  <span className="nav-count">{bookmarks.size}</span>
                )}
                {badgeCount && (
                  <span
                    className="nav-count"
                    style={{ background: '#e14e68', color: '#fff', fontWeight: 700, padding: '1px 6px' }}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sync-card">
            <div className="sync-row">
              <span className="sync-icon">
                <CheckCircle size={14} />
              </span>
              <span className="sync-copy">
                <strong>Offline ready</strong>
                <span>Changes synced just now</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-profile"
            onClick={() => setAuthModalOpen(true)}
            aria-label="Manage profile"
          >
            <span className="avatar">{initials}</span>
            <span className="profile-copy">
              <strong>{user?.name || 'Guest User'}</strong>
              <span>{userSubtext}</span>
            </span>
            <ChevronsUpDown size={14} />
          </button>
        </div>
      </aside>
    </>
  );
};
