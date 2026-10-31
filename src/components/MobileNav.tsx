import React from 'react';
import {
  LayoutDashboard,
  Files,
  SquareCode,
  CirclePlus,
  Users,
  LibraryBig,
  ChartSpline,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppPage } from '../types';

export const MobileNav: React.FC = () => {
  const { role, page, setPage } = useApp();

  const teacherNav: Array<{ id: AppPage; label: string; icon: React.FC<{ size?: number }> }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'quizzes', label: 'Quizzes', icon: Files },
    { id: 'coding', label: 'Code', icon: SquareCode },
    { id: 'create', label: 'Create', icon: CirclePlus },
    { id: 'students', label: 'Students', icon: Users },
  ];

  const studentNav: Array<{ id: AppPage; label: string; icon: React.FC<{ size?: number }> }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'learningSpace', label: 'Learn', icon: BookOpen },
    { id: 'coding', label: 'Code', icon: SquareCode },
    { id: 'library', label: 'Library', icon: LibraryBig },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  ];

  const nav = role === 'teacher' ? teacherNav : studentNav;
  const activeIndex = nav.findIndex((item) => item.id === page);

  return (
    <nav
      className="mobile-bottom-nav liquid-dock"
      style={
        {
          '--dock-count': nav.length,
          '--active-index': Math.max(0, activeIndex),
          '--liquid-offset': `${Math.max(0, activeIndex) * 100}%`,
        } as React.CSSProperties
      }
      aria-label="Quick navigation"
    >
      <span className="liquid-glass-clip" aria-hidden="true">
        <span className={`liquid-glass-indicator ${activeIndex < 0 ? 'is-hidden' : ''}`}>
          <i className="liquid-glass-core"></i>
        </span>
      </span>

      {nav.map(({ id, label, icon: IconComponent }, index) => {
        const isActive = page === id;
        return (
          <button
            key={id}
            type="button"
            className={`mobile-nav-item liquid-dock-item ${isActive ? 'active' : ''}`}
            onClick={() => setPage(id)}
            data-dock-index={index}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <IconComponent size={18} />
            <span>{label}</span>
            <i className="dock-tooltip">{label}</i>
          </button>
        );
      })}
    </nav>
  );
};
