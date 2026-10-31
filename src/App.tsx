import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { MobileNav } from './components/MobileNav';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { QuizIntroModal } from './components/QuizIntroModal';
import { AuroraCanvas } from './components/AuroraCanvas';

// Views
import { TeacherDashboard } from './views/TeacherDashboard';
import { TeacherQuizzes } from './views/TeacherQuizzes';
import { QuizBuilder } from './views/QuizBuilder';
import { CodingQuizBuilder } from './views/CodingQuizBuilder';
import { StudentsView } from './views/StudentsView';
import { AnalyticsView } from './views/AnalyticsView';

import { StudentDashboard } from './views/StudentDashboard';
import { QuizLibrary } from './views/QuizLibrary';
import { PerformanceView } from './views/PerformanceView';
import { LeaderboardView } from './views/LeaderboardView';
import { BookmarksView } from './views/BookmarksView';

import { QuizAttemptView } from './views/QuizAttemptView';
import { QuizResultView } from './views/QuizResultView';
import { CodingListView } from './views/CodingListView';
import { CodingWorkspaceView } from './views/CodingWorkspaceView';
import { CodingQuizAttemptView } from './views/CodingQuizAttemptView';
import { CodingQuizResultView } from './views/CodingQuizResultView';
import { TeacherBattleSets } from './views/TeacherBattleSets';
import { PeerBattleHub } from './views/PeerBattleHub';
import { LiveBattleArena } from './views/LiveBattleArena';
import { BattleResultView } from './views/BattleResultView';
import { LearningSpaceView } from './views/LearningSpaceView';

export const App: React.FC = () => {
  const { role, page } = useApp();

  // Fullscreen standalone views
  if (page === 'liveBattle') {
    return (
      <>
        <AuroraCanvas />
        <LiveBattleArena />
        <ToastContainer />
      </>
    );
  }
  if (page === 'attempt') {
    return (
      <>
        <AuroraCanvas />
        <QuizAttemptView />
        <ToastContainer />
      </>
    );
  }

  if (page === 'codingQuizAttempt') {
    return (
      <>
        <AuroraCanvas />
        <CodingQuizAttemptView />
        <ToastContainer />
      </>
    );
  }

  if (page === 'codingProblem') {
    return (
      <>
        <AuroraCanvas />
        <CodingWorkspaceView />
        <ToastContainer />
      </>
    );
  }

  // Normal shell views
  const renderCurrentPage = () => {
    if (page === 'result') return <QuizResultView />;
    if (page === 'codingQuizResult') return <CodingQuizResultView />;
    if (page === 'battleResult') return <BattleResultView />;
    if (page === 'coding') return <CodingListView />;

    if (role === 'teacher') {
      switch (page) {
        case 'dashboard':
          return <TeacherDashboard />;
        case 'quizzes':
          return <TeacherQuizzes />;
        case 'teacherBattleSets':
          return <TeacherBattleSets />;
        case 'create':
          return <QuizBuilder />;
        case 'createCoding':
          return <CodingQuizBuilder />;
        case 'students':
          return <StudentsView />;
        case 'analytics':
          return <AnalyticsView />;
        default:
          return <TeacherDashboard />;
      }
    } else {
      switch (page) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'library':
          return <QuizLibrary />;
        case 'peerBattles':
          return <PeerBattleHub />;
        case 'performance':
          return <PerformanceView />;
        case 'leaderboard':
          return <LeaderboardView />;
        case 'bookmarks':
          return <BookmarksView />;
        case 'learningSpace':
          return <LearningSpaceView />;
        default:
          return <StudentDashboard />;
      }
    }
  };

  return (
    <>
      <AuroraCanvas />
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      <div className="app-shell">
        <Sidebar />
        <div className="main-wrap">
          <Topbar />
          <main>{renderCurrentPage()}</main>
        </div>
        <MobileNav />
      </div>

      <AuthModal />
      <NotificationsDrawer />
      <QuizIntroModal />
      <ToastContainer />
    </>
  );
};
export default App;
