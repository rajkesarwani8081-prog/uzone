import React from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Sparkles,
  Bell,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Topbar: React.FC = () => {
  const {
    role,
    page,
    theme,
    toggleTheme,
    notifications,
    setNotificationsOpen,
    setSidebarOpen,
    setAuthModalOpen,
    user,
    authed,
    logout,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const unreadCount = notifications.filter((n) => n.unread).length;

  const initials = (user?.name || 'Guest')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const getPageMeta = () => {
    const meta: Record<string, [string, string]> = {
      dashboard:
        role === 'teacher'
          ? ['Teacher dashboard', 'Your classroom at a glance']
          : ['Student dashboard', 'Keep learning, keep growing'],
      quizzes: ['My quizzes', 'Create, publish, and manage assessments'],
      create: ['Quiz builder', 'Craft a focused learning experience'],
      createCoding: ['Coding Quiz Builder', 'Select problems, assign marks and schedule'],
      students: ['Students', 'Track every learner’s progress'],
      analytics: ['Analytics', 'Insights that make teaching smarter'],
      library: ['Quiz library', 'Explore every batch and revise freely'],
      performance: ['Performance', 'Your learning journey, visualized'],
      leaderboard: ['Leaderboard', 'Challenge friends and climb the ranks'],
      bookmarks: ['Practice later', 'Your saved questions in one place'],
      result: ['Quiz result', 'Review your performance and explanations'],
      codingQuizResult: ['Coding Assessment Results', 'Review scores, test cases and submitted code'],
      coding: ['Code practice', 'LeetCode-style problems with an in-browser judge'],
      codingProblem: ['Code practice', 'Solve the problem and run tests'],
      attempt: ['Quiz in progress', 'Answer every question before time expires'],
      codingQuizAttempt: ['Coding Assessment in progress', 'Solve all problems before time expires'],
      teacherBattleSets: ['Coding Battle Sets', 'Create and publish competitive sets for enrolled batches'],
      peerBattles: ['Peer Battle Arena', 'Compete head-to-head with your enrolled classmates'],
      liveBattle: ['Live Coding Battle', 'Synchronized real-time battle arena'],
      battleResult: ['Battle Results & Performance Analysis', 'Head-to-head scoreboard and permitted performance insights'],
      learningSpace: ['My Learning Space', 'Mistake Book, concept vault, ideas and daily revision streak'],
    };
    return meta[page] || ['UzoneQuiz', 'Learn. Test. Level up.'];
  };

  const [title] = getPageMeta();

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn mobile-menu"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={16} />
      </button>

      <div className="top-title">
        <h1>{title}</h1>
      </div>

      <label className="top-search" aria-label="Global search">
        <Search size={15} />
        <input
          id="global-search"
          placeholder="Search quizzes, students, topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <kbd>⌘ K</kbd>
      </label>

      <div className="top-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={`Toggle theme (currently ${theme})`}
          title={`Theme: ${theme}`}
        >
          {theme === 'aurora' ? (
            <Sparkles size={16} />
          ) : theme === 'dark' ? (
            <Sun size={16} />
          ) : (
            <Moon size={16} />
          )}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={() => setNotificationsOpen(true)}
          aria-label="Open notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && <span className="notification-dot" />}
        </button>

        {authed && (
          <button
            type="button"
            className="icon-btn"
            onClick={logout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        )}

        <button
          type="button"
          className="top-avatar"
          onClick={() => setAuthModalOpen(true)}
          aria-label="Open profile"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};
