import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  AppTheme,
  AppPage,
  Quiz,
  StudentItem,
  LeaderboardEntry,
  NotificationItem,
  UserProfile,
  ToastMessage,
  AttemptRecord,
  CodingQuizResult,
  BattleSet,
  PeerBattle,
  ProblemSubmissionResult,
  LearningItem,
  LearningStreakData,
  LearningStatus,
} from '../types';
import {
  initialQuizzes,
  initialStudents,
  initialLeaderboard,
  initialNotifications,
  initialBattleSets,
  initialBattles,
} from '../data/seedData';
import {
  generateOpponentBattleOutcome,
  generateBattleAnalysis,
  canBattle,
} from '../data/battleEngine';
import { codingProblems } from '../data/codingProblems';
import { initialLearningItems, initialStreakData } from '../data/learningSpaceData';

export function createFreshDraft(): Quiz {
  return {
    id: '',
    title: '',
    subject: 'Java',
    batch: '5.0',
    semester: '4',
    topic: '',
    difficulty: 'Medium',
    marks: 50,
    timer: 20,
    instructions: 'Read each question carefully. Select the best answer before the timer ends.',
    leaderboard: true,
    retry: true,
    shuffle: false,
    explanations: true,
    color: '#4d94ff',
    date: 'Just now',
    status: 'Draft',
    quizType: 'mcq',
    questions: [
      {
        id: `q-${Date.now()}-0`,
        question: '',
        options: ['', '', '', ''],
        correct: 0,
        explanation: '',
        solution: '',
        marks: 10,
      },
    ],
  };
}

export function createFreshCodingDraft(): Quiz {
  return {
    id: '',
    title: '',
    subject: 'Data Structures & Algorithms',
    batch: '5.0',
    semester: '4',
    topic: 'Arrays, Trees & Dynamic Programming',
    difficulty: 'Medium',
    marks: 60,
    timer: 45,
    instructions: 'Solve each problem in your preferred programming language. Test cases are checked automatically upon running or submitting.',
    leaderboard: true,
    retry: true,
    explanations: true,
    color: '#60c99f',
    date: 'Just now',
    status: 'Draft',
    quizType: 'coding',
    questions: [],
    codingProblemIds: ['lc-easy-two-sum', 'lc-easy-valid-parentheses'],
    codingProblemMarks: {
      'lc-easy-two-sum': 30,
      'lc-easy-valid-parentheses': 30,
    },
  };
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  switchRole: (role: Role) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  page: AppPage;
  setPage: (page: AppPage) => void;
  quizzes: Quiz[];
  saveQuiz: (quiz: Quiz) => void;
  deleteQuiz: (id: string) => void;
  duplicateQuiz: (id: string) => void;
  students: StudentItem[];
  leaderboard: LeaderboardEntry[];
  notifications: NotificationItem[];
  markNotificationsRead: () => void;
  bookmarks: Set<string>;
  quizBookmarks: Set<string>;
  toggleQuestionBookmark: (id: string) => void;
  toggleQuizBookmark: (id: string) => void;
  removeQuestionBookmark: (id: string) => void;
  attempts: AttemptRecord[];
  recordAttempt: (record: AttemptRecord) => void;
  lastResult: any;
  setLastResult: (res: any) => void;
  lastCodingResult: CodingQuizResult | null;
  setLastCodingResult: (res: CodingQuizResult | null) => void;
  recordCodingAttempt: (result: CodingQuizResult) => void;
  activeQuizId: string | null;
  setActiveQuizId: (id: string | null) => void;
  activeCodingProblemId: string | null;
  setActiveCodingProblemId: (id: string | null) => void;
  draftQuiz: Quiz;
  setDraftQuiz: React.Dispatch<React.SetStateAction<Quiz>>;
  resetDraftQuiz: () => void;
  draftCodingQuiz: Quiz;
  setDraftCodingQuiz: React.Dispatch<React.SetStateAction<Quiz>>;
  resetDraftCodingQuiz: () => void;
  user: UserProfile | null;
  authed: boolean;
  login: (email: string, pass: string, role: Role) => void;
  signup: (name: string, email: string, pass: string, role: Role) => void;
  logout: () => void;
  toasts: ToastMessage[];
  addToast: (title: string, message?: string, icon?: string) => void;
  removeToast: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  introQuizId: string | null;
  setIntroQuizId: (id: string | null) => void;
  battleSets: BattleSet[];
  saveBattleSet: (set: BattleSet) => void;
  deleteBattleSet: (id: string) => void;
  battles: PeerBattle[];
  activeBattleId: string | null;
  setActiveBattleId: (id: string | null) => void;
  activeBattleResult: PeerBattle | null;
  setActiveBattleResult: (b: PeerBattle | null) => void;
  createBattleRequest: (params: {
    battleSetId: string;
    targetStudentId: string;
    targetName: string;
    scheduledFor?: string;
    isScheduled?: boolean;
    note?: string;
  }) => PeerBattle | null;
  acceptBattleRequest: (battleId: string) => void;
  rejectBattleRequest: (battleId: string) => void;
  cancelBattleRequest: (battleId: string) => void;
  startBattle: (battleId: string) => void;
  finishBattle: (
    battleId: string,
    userResults: ProblemSubmissionResult[],
    userTimeSec: number
  ) => PeerBattle | null;
  // Learning Space
  learningItems: LearningItem[];
  learningStreak: LearningStreakData;
  revisionDueCount: number;
  addLearningItem: (item: Omit<LearningItem, 'id' | 'date'>) => LearningItem;
  updateLearningItem: (item: LearningItem) => void;
  deleteLearningItem: (id: string) => void;
  toggleLearningBookmark: (id: string) => void;
  updateLearningStatus: (id: string, status: LearningStatus) => void;
  markItemRevised: (id: string, nextStatus?: LearningStatus) => void;
  logMistakeFromCoding: (params: {
    problemId?: string;
    problemTitle: string;
    failureType: string;
    failedInput?: string;
    expected?: string;
    actual?: string;
    code?: string;
    language?: string;
    explanation?: string;
    solution?: string;
    category?: string;
  }) => LearningItem;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('uzone-studio-theme');
    if (saved === 'aurora' || saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });

  const setTheme = (nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    localStorage.setItem('uzone-studio-theme', nextTheme);
    const root = document.documentElement;
    root.classList.remove('dark', 'aurora');
    if (nextTheme === 'dark' || nextTheme === 'aurora') root.classList.add('dark');
    if (nextTheme === 'aurora') root.classList.add('aurora');
  };

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('aurora');
    else if (theme === 'aurora') setTheme('light');
    else setTheme('dark');
  };

  useEffect(() => {
    setTheme(theme);
  }, []);

  // Persisted state
  const [role, setRoleState] = useState<Role>(() => {
    try {
      const p = JSON.parse(localStorage.getItem('uzonequiz-session-v2') || '{}');
      return p.role === 'student' ? 'student' : 'teacher';
    } catch {
      return 'teacher';
    }
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const p = JSON.parse(localStorage.getItem('uzonequiz-session-v2') || '{}');
      if (Array.isArray(p.quizzes) && p.quizzes.length > 0) return p.quizzes;
    } catch {}
    return initialQuizzes;
  });

  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const p = JSON.parse(localStorage.getItem('uzonequiz-session-v2') || '{}');
      return new Set(p.bookmarks || []);
    } catch {
      return new Set();
    }
  });

  const [quizBookmarks, setQuizBookmarks] = useState<Set<string>>(() => {
    try {
      const p = JSON.parse(localStorage.getItem('uzonequiz-session-v2') || '{}');
      return new Set(p.quizBookmarks || []);
    } catch {
      return new Set();
    }
  });

  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('uzonequiz-attempts') || '[]');
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}
    return [
      {
        id: 'att-1',
        quizId: 'coding-quiz-1',
        quizTitle: 'Data Structures & Algorithms Midterm Exam',
        quizType: 'coding',
        score: 60,
        total: 60,
        correct: 3,
        totalQuestions: 3,
        timeTakenSec: 1420,
        when: new Date(Date.now() - 86400000 * 2).toISOString(),
        answers: {},
      },
      {
        id: 'att-2',
        quizId: 'quiz-0',
        quizTitle: 'Two Sum & Hash Maps',
        quizType: 'mcq',
        score: 45,
        total: 50,
        correct: 4,
        totalQuestions: 5,
        timeTakenSec: 480,
        when: new Date(Date.now() - 86400000).toISOString(),
        answers: { 'q-0': 1, 'q-1': 0, 'q-2': 1, 'q-3': 2, 'q-4': 1 },
      },
    ];
  });

  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // App navigation & selection
  const [page, setPage] = useState<AppPage>('dashboard');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeCodingProblemId, setActiveCodingProblemId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [lastCodingResult, setLastCodingResult] = useState<CodingQuizResult | null>(null);
  const [draftQuiz, setDraftQuiz] = useState<Quiz>(createFreshDraft);
  const [draftCodingQuiz, setDraftCodingQuiz] = useState<Quiz>(createFreshCodingDraft);

  // Peer battle state
  const [battleSets, setBattleSets] = useState<BattleSet[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('uzonequiz-battle-sets') || '[]');
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}
    return initialBattleSets;
  });

  const [battles, setBattles] = useState<PeerBattle[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('uzonequiz-battles') || '[]');
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}
    return initialBattles;
  });

  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [activeBattleResult, setActiveBattleResult] = useState<PeerBattle | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [introQuizId, setIntroQuizId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // User auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('uzonequiz-user') || 'null');
      if (saved) return saved;
    } catch {}
    return {
      id: 'demo-user-1',
      name: 'Professor Roy',
      email: 'roy@uzone.edu',
      role: 'teacher',
      batch: '5.0',
    };
  });
  const [authed, setAuthed] = useState<boolean>(true);

  // Student Learning Space State (Strictly private per student)
  const currentStudentKey = user?.id || 'student-current';

  const [learningItems, setLearningItems] = useState<LearningItem[]>(() => {
    try {
      const saved = localStorage.getItem(`uzonequiz-learning-items-${currentStudentKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialLearningItems;
  });

  const [learningStreak, setLearningStreak] = useState<LearningStreakData>(() => {
    try {
      const saved = localStorage.getItem(`uzonequiz-learning-streak-${currentStudentKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialStreakData;
  });

  // Calculate items due for revision today
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const revisionDueCount = learningItems.filter(
    (item) => item.status === 'Need Revision' || (item.nextRevisionDate && item.nextRevisionDate <= todayDateStr)
  ).length;

  // Persist learning space items
  useEffect(() => {
    try {
      localStorage.setItem(`uzonequiz-learning-items-${currentStudentKey}`, JSON.stringify(learningItems));
    } catch {}
  }, [learningItems, currentStudentKey]);

  // Persist learning streak
  useEffect(() => {
    try {
      localStorage.setItem(`uzonequiz-learning-streak-${currentStudentKey}`, JSON.stringify(learningStreak));
    } catch {}
  }, [learningStreak, currentStudentKey]);

  // Helper to record learning activity for streak
  const recordStreakActivity = () => {
    const today = new Date().toISOString().slice(0, 10);
    setLearningStreak((prev) => {
      const prevMap = { ...prev.activityMap };
      const currentDayCount = (prevMap[today] || 0) + 1;
      prevMap[today] = currentDayCount;

      let newStreak = prev.currentStreak;
      // If last active was yesterday, increment streak; if today, keep; if older, reset to 1
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (prev.lastActiveDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      return {
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        activityMap: prevMap,
        todayCount: currentDayCount,
        lastActiveDate: today,
      };
    });
  };

  const addLearningItem = (itemData: Omit<LearningItem, 'id' | 'date'>): LearningItem => {
    const today = new Date().toISOString().slice(0, 10);
    const newItem: LearningItem = {
      ...itemData,
      id: `learn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: currentStudentKey,
      date: today,
      revisionCount: 0,
      nextRevisionDate: itemData.status === 'Need Revision' ? today : new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    };
    setLearningItems((prev) => [newItem, ...prev]);
    recordStreakActivity();
    addToast(
      'Saved to Learning Space',
      `"${newItem.title}" added to your ${newItem.section === 'mistakes' ? 'Mistake Book' : newItem.section}.`,
      'bookmark-check'
    );
    return newItem;
  };

  const updateLearningItem = (updated: LearningItem) => {
    setLearningItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    addToast('Updated entry', `"${updated.title}" was saved.`, 'check');
  };

  const deleteLearningItem = (id: string) => {
    const target = learningItems.find((item) => item.id === id);
    setLearningItems((prev) => prev.filter((item) => item.id !== id));
    addToast('Deleted entry', target ? `"${target.title}" was removed.` : 'Entry removed.', 'trash-2');
  };

  const toggleLearningBookmark = (id: string) => {
    setLearningItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.bookmarked;
          addToast(
            nextState ? 'Bookmarked' : 'Bookmark removed',
            nextState ? `"${item.title}" added to priority list.` : undefined,
            'star'
          );
          return { ...item, bookmarked: nextState };
        }
        return item;
      })
    );
  };

  const updateLearningStatus = (id: string, nextStatus: LearningStatus) => {
    const today = new Date().toISOString().slice(0, 10);
    let nextRevDays = 3;
    if (nextStatus === 'Understood') nextRevDays = 7;
    if (nextStatus === 'Need Revision') nextRevDays = 1;

    setLearningItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: nextStatus,
            lastRevisedDate: today,
            nextRevisionDate: new Date(Date.now() + 86400000 * nextRevDays).toISOString().slice(0, 10),
          };
        }
        return item;
      })
    );
    recordStreakActivity();
    addToast('Status updated', `Marked as ${nextStatus}.`, 'check-circle');
  };

  const markItemRevised = (id: string, nextStatus: LearningStatus = 'Understood') => {
    const today = new Date().toISOString().slice(0, 10);
    const nextIntervalDays = nextStatus === 'Understood' ? 7 : nextStatus === 'Learning' ? 3 : 1;
    setLearningItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: nextStatus,
            revisionCount: (item.revisionCount || 0) + 1,
            lastRevisedDate: today,
            nextRevisionDate: new Date(Date.now() + 86400000 * nextIntervalDays).toISOString().slice(0, 10),
          };
        }
        return item;
      })
    );
    recordStreakActivity();
    addToast('Revision completed', `"${nextStatus}" status scheduled for spaced repetition.`, 'sparkles');
  };

  const logMistakeFromCoding = (params: {
    problemId?: string;
    problemTitle: string;
    failureType: string;
    failedInput?: string;
    expected?: string;
    actual?: string;
    code?: string;
    language?: string;
    explanation?: string;
    solution?: string;
    category?: string;
  }): LearningItem => {
    const today = new Date().toISOString().slice(0, 10);
    const newMistake: LearningItem = {
      id: `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: currentStudentKey,
      section: 'mistakes',
      title: `${params.problemTitle} — ${params.failureType}`,
      category: params.category || 'Coding Practice - DSA',
      description: `Encountered ${params.failureType} while solving "${params.problemTitle}". Test case inputs and discrepancy recorded below.`,
      date: today,
      tags: ['coding-mistake', params.failureType.toLowerCase().replace(/[^a-z0-9]/g, '-'), 'leetcode'],
      status: 'Need Revision',
      bookmarked: true,
      problemId: params.problemId,
      problemTitle: params.problemTitle,
      failureType: params.failureType,
      failedInput: params.failedInput,
      expectedOutput: params.expected,
      actualOutput: params.actual,
      buggyCode: params.code,
      codeLanguage: params.language || 'javascript',
      correctedSolution: params.solution,
      fixExplanation: params.explanation || 'Review edge cases and ensure loop bounds and base conditions are validated.',
      nextRevisionDate: today,
      revisionCount: 0,
    };

    setLearningItems((prev) => [newMistake, ...prev]);
    recordStreakActivity();
    addToast(
      'Mistake Logged!',
      `Saved to your Mistake Book. Review and resolve it in My Learning Space.`,
      'circle-alert'
    );
    return newMistake;
  };

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem(
      'uzonequiz-session-v2',
      JSON.stringify({
        role,
        quizzes,
        bookmarks: [...bookmarks],
        quizBookmarks: [...quizBookmarks],
      })
    );
  }, [role, quizzes, bookmarks, quizBookmarks]);

  useEffect(() => {
    localStorage.setItem('uzonequiz-attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem('uzonequiz-battle-sets', JSON.stringify(battleSets));
  }, [battleSets]);

  useEffect(() => {
    localStorage.setItem('uzonequiz-battles', JSON.stringify(battles));
  }, [battles]);

  const addToast = (title: string, message?: string, icon?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setRole = (nextRole: Role) => {
    setRoleState(nextRole);
    if (user) {
      const updatedUser = {
        ...user,
        role: nextRole,
        name: nextRole === 'teacher' ? 'Professor Roy' : 'Aarav Sharma',
      };
      setUser(updatedUser);
      localStorage.setItem('uzonequiz-user', JSON.stringify(updatedUser));
    }
  };

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
    setPage('dashboard');
    addToast(
      `Switched to ${nextRole === 'teacher' ? 'Teacher' : 'Student'} mode`,
      nextRole === 'teacher' ? 'Create, publish, and manage assessments.' : 'Practice quizzes and solve coding problems.',
      'arrow-left-right'
    );
  };

  const saveQuiz = (quiz: Quiz) => {
    const existingIdx = quizzes.findIndex((q) => q.id === quiz.id);
    if (existingIdx >= 0) {
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? quiz : q)));
    } else {
      setQuizzes((prev) => [quiz, ...prev]);
    }
  };

  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    addToast('Quiz deleted', 'The assessment was removed from your classroom.', 'trash-2');
  };

  const duplicateQuiz = (id: string) => {
    const target = quizzes.find((q) => q.id === id);
    if (!target) return;
    const duplicated: Quiz = {
      ...target,
      id: `quiz-${Date.now()}`,
      title: `${target.title} (Copy)`,
      status: 'Draft',
      attempts: 0,
      accuracy: 0,
      date: 'Just now',
      questions: target.questions ? target.questions.map((q) => ({ ...q, id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` })) : [],
      codingProblemIds: target.codingProblemIds ? [...target.codingProblemIds] : [],
      codingProblemMarks: target.codingProblemMarks ? { ...target.codingProblemMarks } : {},
    };
    setQuizzes((prev) => [duplicated, ...prev]);
    addToast('Quiz duplicated', 'Created a duplicate draft in your quizzes.', 'copy');
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    addToast('Notifications cleared', 'All notifications marked as read.', 'check-check');
  };

  const toggleQuestionBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        addToast('Bookmark removed', 'Removed from your practice list.', 'bookmark-x');
      } else {
        next.add(id);
        addToast('Question saved', 'Added to Practice later list.', 'bookmark-check');
      }
      return next;
    });
  };

  const toggleQuizBookmark = (id: string) => {
    setQuizBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        addToast('Quiz unsaved', 'Removed from saved quizzes.', 'bookmark-x');
      } else {
        next.add(id);
        addToast('Quiz saved', 'Added to your bookmarked quizzes.', 'bookmark-check');
      }
      return next;
    });
  };

  const removeQuestionBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    addToast('Bookmark removed', 'Question removed from saved revision.', 'bookmark-x');
  };

  const recordAttempt = (record: AttemptRecord) => {
    setAttempts((prev) => [record, ...prev]);

    // Update quiz stats
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === record.quizId) {
          const currentAttempts = (q.attempts || 0) + 1;
          const currentAcc = q.accuracy || 80;
          const attemptAcc = Math.round((record.correct / record.totalQuestions) * 100);
          const newAcc = Math.round((currentAcc + attemptAcc) / 2);
          return { ...q, attempts: currentAttempts, accuracy: newAcc };
        }
        return q;
      })
    );

    // Update leaderboard
    setLeaderboard((prev) => {
      const userName = user?.name || 'Aarav Sharma';
      const existingMeIdx = prev.findIndex((entry) => entry.me || entry.name === userName);
      const timeFmt = `${Math.floor(record.timeTakenSec / 60)}m ${String(record.timeTakenSec % 60).padStart(2, '0')}s`;
      const myEntry: LeaderboardEntry = {
        name: userName,
        batch: user?.batch || '5.0',
        marks: record.score,
        time: timeFmt,
        me: true,
      };

      let nextList = prev.map((e) => (e.me ? { ...e, me: false } : e));
      if (existingMeIdx >= 0) {
        if (record.score > nextList[existingMeIdx].marks) {
          nextList[existingMeIdx] = myEntry;
        } else {
          nextList[existingMeIdx].me = true;
        }
      } else {
        nextList.push(myEntry);
      }
      return nextList.sort((a, b) => b.marks - a.marks);
    });
  };

  const recordCodingAttempt = (result: CodingQuizResult) => {
    const passedProblems = result.results.filter((r) => r.verdict === 'Accepted').length;
    const totalProblems = result.results.length;

    const record: AttemptRecord = {
      id: `attempt-coding-${Date.now()}`,
      quizId: result.quizId,
      quizTitle: result.quizTitle,
      quizType: 'coding',
      score: result.score,
      total: result.totalMarks,
      correct: passedProblems,
      totalQuestions: totalProblems,
      timeTakenSec: result.timeTakenSec,
      when: result.completedAt,
      answers: {},
    };

    setAttempts((prev) => [record, ...prev]);

    // Update quiz stats
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === result.quizId) {
          const currentAttempts = (q.attempts || 0) + 1;
          const currentAcc = q.accuracy || 75;
          const newAcc = Math.round((currentAcc + result.pct) / 2);
          return { ...q, attempts: currentAttempts, accuracy: newAcc };
        }
        return q;
      })
    );

    // Update leaderboard
    setLeaderboard((prev) => {
      const userName = user?.name || 'Aarav Sharma';
      const timeFmt = `${Math.floor(result.timeTakenSec / 60)}m ${String(result.timeTakenSec % 60).padStart(2, '0')}s`;
      const myEntry: LeaderboardEntry = {
        name: userName,
        batch: user?.batch || '5.0',
        marks: result.score,
        time: timeFmt,
        me: true,
      };
      const existingMeIdx = prev.findIndex((entry) => entry.me || entry.name === userName);
      let nextList = prev.map((e) => (e.me ? { ...e, me: false } : e));
      if (existingMeIdx >= 0) {
        if (result.score >= nextList[existingMeIdx].marks) {
          nextList[existingMeIdx] = myEntry;
        } else {
          nextList[existingMeIdx].me = true;
        }
      } else {
        nextList.push(myEntry);
      }
      return nextList.sort((a, b) => b.marks - a.marks);
    });
  };

  const resetDraftQuiz = () => {
    setDraftQuiz(createFreshDraft());
  };

  const resetDraftCodingQuiz = () => {
    setDraftCodingQuiz(createFreshCodingDraft());
  };

  const login = (email: string, _pass: string, chosenRole: Role) => {
    const name = email.split('@')[0] || 'User';
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: chosenRole === 'teacher' ? `Prof. ${capitalized}` : capitalized,
      email,
      role: chosenRole,
      batch: '5.0',
    };
    setUser(profile);
    setAuthed(true);
    setRole(chosenRole);
    localStorage.setItem('uzonequiz-user', JSON.stringify(profile));
    setAuthModalOpen(false);
    addToast('Welcome back', `Signed in as ${profile.name}`, 'log-in');
  };

  const signup = (name: string, email: string, _pass: string, chosenRole: Role) => {
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'New Learner',
      email,
      role: chosenRole,
      batch: '5.0',
    };
    setUser(profile);
    setAuthed(true);
    setRole(chosenRole);
    localStorage.setItem('uzonequiz-user', JSON.stringify(profile));
    setAuthModalOpen(false);
    addToast('Account created', `Welcome to UzoneQuiz, ${profile.name}!`, 'sparkles');
  };

  const logout = () => {
    setUser({
      id: 'guest',
      name: 'Guest',
      email: 'guest@uzone.edu',
      role,
      batch: '5.0',
    });
    setAuthed(false);
    localStorage.removeItem('uzonequiz-user');
    addToast('Logged out', 'You are now viewing in guest mode.', 'log-out');
  };

  const saveBattleSet = (bSet: BattleSet) => {
    const existingIdx = battleSets.findIndex((s) => s.id === bSet.id);
    if (existingIdx >= 0) {
      setBattleSets((prev) => prev.map((s) => (s.id === bSet.id ? bSet : s)));
      addToast('Battle Set updated', `${bSet.title} saved successfully.`, 'swords');
    } else {
      setBattleSets((prev) => [bSet, ...prev]);
      addToast('Battle Set published', `${bSet.title} is now active for Batch ${bSet.batch}.`, 'swords');
    }
  };

  const deleteBattleSet = (id: string) => {
    setBattleSets((prev) => prev.filter((s) => s.id !== id));
    addToast('Battle Set deleted', 'The battle set has been removed.', 'trash-2');
  };

  const createBattleRequest = (params: {
    battleSetId: string;
    targetStudentId: string;
    targetName: string;
    scheduledFor?: string;
    isScheduled?: boolean;
    note?: string;
  }): PeerBattle | null => {
    const bSet = battleSets.find((s) => s.id === params.battleSetId);
    if (!bSet) {
      addToast('Error', 'Selected battle set was not found.', 'circle-alert');
      return null;
    }

    const currentUserName = user?.name || 'Aarav Sharma';
    const currentUserBatch = user?.batch || '5.0';

    // Enrollment check: verify target student belongs to the same batch
    const targetStudent = students.find((s) => s.name.toLowerCase() === params.targetName.toLowerCase());
    if (targetStudent && !canBattle({ batch: currentUserBatch }, { batch: targetStudent.batch })) {
      addToast('Enrollment mismatch', `Cannot battle with students from different batches (${targetStudent.batch} vs ${currentUserBatch}).`, 'lock');
      return null;
    }

    // Verify battle set matches student's batch
    if (bSet.batch !== currentUserBatch) {
      addToast('Batch restricted', `This battle set is restricted to Batch ${bSet.batch}. You are enrolled in Batch ${currentUserBatch}.`, 'lock');
      return null;
    }

    const newBattle: PeerBattle = {
      id: `battle-${Date.now()}`,
      battleSetId: bSet.id,
      battleSetTitle: bSet.title,
      subject: bSet.subject,
      batch: currentUserBatch,
      initiatorStudentId: user?.id || 'student-me',
      initiatorName: currentUserName,
      targetStudentId: params.targetStudentId,
      targetName: params.targetName,
      status: 'pending',
      scheduledFor: params.scheduledFor,
      isScheduled: params.isScheduled,
      duration: bSet.duration,
      totalMarks: bSet.marks,
      codingProblemIds: [...bSet.codingProblemIds],
      note: params.note,
      initiatorProgress: {
        studentId: user?.id || 'student-me',
        studentName: currentUserName,
        batch: currentUserBatch,
        solvedProblems: [],
        currentProblemIndex: 0,
        score: 0,
        timeSpentSec: 0,
        accuracy: 0,
        submitted: false,
        problemResults: [],
      },
      opponentProgress: {
        studentId: params.targetStudentId,
        studentName: params.targetName,
        batch: targetStudent?.batch || currentUserBatch,
        solvedProblems: [],
        currentProblemIndex: 0,
        score: 0,
        timeSpentSec: 0,
        accuracy: 0,
        submitted: false,
        problemResults: [],
      },
    };

    setBattles((prev) => [newBattle, ...prev]);
    addToast(
      'Battle challenge sent!',
      `Challenged ${params.targetName} to "${bSet.title}".`,
      'swords'
    );
    return newBattle;
  };

  const acceptBattleRequest = (battleId: string) => {
    setBattles((prev) =>
      prev.map((b) =>
        b.id === battleId ? { ...b, status: 'accepted' } : b
      )
    );
    const battle = battles.find((b) => b.id === battleId);
    addToast(
      'Battle accepted!',
      `Ready to battle against ${battle?.initiatorName || 'opponent'}!`,
      'check-circle'
    );
  };

  const rejectBattleRequest = (battleId: string) => {
    setBattles((prev) =>
      prev.map((b) =>
        b.id === battleId ? { ...b, status: 'rejected' } : b
      )
    );
    addToast('Battle rejected', 'The challenge was declined.', 'x-circle');
  };

  const cancelBattleRequest = (battleId: string) => {
    setBattles((prev) =>
      prev.map((b) =>
        b.id === battleId ? { ...b, status: 'cancelled' } : b
      )
    );
    addToast('Battle cancelled', 'Your challenge request was withdrawn.', 'info');
  };

  const startBattle = (battleId: string) => {
    const battle = battles.find((b) => b.id === battleId);
    if (!battle) return;

    setBattles((prev) =>
      prev.map((b) =>
        b.id === battleId
          ? { ...b, status: 'in_progress', startedAt: new Date().toISOString() }
          : b
      )
    );
    setActiveBattleId(battleId);
    setPage('liveBattle');
  };

  const finishBattle = (
    battleId: string,
    userResults: ProblemSubmissionResult[],
    userTimeSec: number
  ): PeerBattle | null => {
    const targetBattle = battles.find((b) => b.id === battleId);
    if (!targetBattle) return null;

    const currentUserName = user?.name || 'Aarav Sharma';
    const isInitiator = targetBattle.initiatorName === currentUserName || targetBattle.initiatorStudentId === (user?.id || 'student-me');
    const opponentName = isInitiator ? targetBattle.targetName : targetBattle.initiatorName;

    // Find opponent student profile to generate authentic matching outcomes
    const oppStudent = students.find((s) => s.name.toLowerCase() === opponentName.toLowerCase()) || {
      name: opponentName,
      batch: targetBattle.batch,
      accuracy: 88,
      score: '840 / 950',
      attempts: 14,
      status: 'Active' as const,
      color: ['#4d94ff', '#164a98'] as [string, string],
    };

    const problems = targetBattle.codingProblemIds
      .map((id) => codingProblems.find((p) => p.id === id))
      .filter(Boolean) as any[];

    // Generate opponent results based on enrolled classmate rating
    const opponentOutcome = generateOpponentBattleOutcome(
      oppStudent,
      problems,
      targetBattle.duration,
      userTimeSec
    );

    // Deep side-by-side performance analysis
    const analysis = generateBattleAnalysis(
      userResults,
      opponentOutcome.results,
      userTimeSec,
      opponentOutcome.timeSec,
      currentUserName,
      opponentName,
      problems
    );

    const userScore = userResults.reduce((a, b) => a + b.marksEarned, 0);
    const userPassedTests = userResults.reduce((a, b) => a + b.passedCases, 0);
    const userTotalTests = userResults.reduce((a, b) => a + b.totalCases, 0) || 1;
    const userAccuracy = Math.round((userPassedTests / userTotalTests) * 100);

    const oppPassedTests = opponentOutcome.results.reduce((a, b) => a + b.passedCases, 0);
    const oppTotalTests = opponentOutcome.results.reduce((a, b) => a + b.totalCases, 0) || 1;
    const oppAccuracy = Math.round((oppPassedTests / oppTotalTests) * 100);

    const userProgress = {
      studentId: isInitiator ? targetBattle.initiatorStudentId : targetBattle.targetStudentId,
      studentName: currentUserName,
      batch: targetBattle.batch,
      solvedProblems: userResults.filter((r) => r.verdict === 'Accepted').map((r) => r.problemId),
      currentProblemIndex: problems.length - 1,
      score: userScore,
      timeSpentSec: userTimeSec,
      accuracy: userAccuracy,
      problemResults: userResults,
      submitted: true,
      statusText: `${userScore}/${targetBattle.totalMarks} points earned`,
    };

    const oppProgress = {
      studentId: isInitiator ? targetBattle.targetStudentId : targetBattle.initiatorStudentId,
      studentName: opponentName,
      batch: targetBattle.batch,
      solvedProblems: opponentOutcome.results.filter((r) => r.verdict === 'Accepted').map((r) => r.problemId),
      currentProblemIndex: problems.length - 1,
      score: opponentOutcome.score,
      timeSpentSec: opponentOutcome.timeSec,
      accuracy: oppAccuracy,
      problemResults: opponentOutcome.results,
      submitted: true,
      statusText: `${opponentOutcome.score}/${targetBattle.totalMarks} points earned`,
    };

    const completedBattle: PeerBattle = {
      ...targetBattle,
      status: 'completed',
      endedAt: new Date().toISOString(),
      winner: analysis.winnerName,
      analysis,
      initiatorProgress: isInitiator ? userProgress : oppProgress,
      opponentProgress: isInitiator ? oppProgress : userProgress,
    };

    setBattles((prev) =>
      prev.map((b) => (b.id === battleId ? completedBattle : b))
    );

    setActiveBattleResult(completedBattle);
    setActiveBattleId(null);
    setPage('battleResult');

    if (analysis.winnerName === currentUserName) {
      addToast('Victory!', `You won the battle against ${opponentName}!`, 'trophy');
    } else if (analysis.winnerName === 'Tie') {
      addToast('Tie Match!', `Incredible match! Scores tied with ${opponentName}.`, 'swords');
    } else {
      addToast('Battle Finished', `Good effort! ${opponentName} won this round.`, 'award');
    }

    return completedBattle;
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        switchRole,
        theme,
        setTheme,
        toggleTheme,
        page,
        setPage,
        quizzes,
        saveQuiz,
        deleteQuiz,
        duplicateQuiz,
        students,
        leaderboard,
        notifications,
        markNotificationsRead,
        bookmarks,
        quizBookmarks,
        toggleQuestionBookmark,
        toggleQuizBookmark,
        removeQuestionBookmark,
        attempts,
        recordAttempt,
        lastResult,
        setLastResult,
        lastCodingResult,
        setLastCodingResult,
        recordCodingAttempt,
        activeQuizId,
        setActiveQuizId,
        activeCodingProblemId,
        setActiveCodingProblemId,
        draftQuiz,
        setDraftQuiz,
        resetDraftQuiz,
        draftCodingQuiz,
        setDraftCodingQuiz,
        resetDraftCodingQuiz,
        user,
        authed,
        login,
        signup,
        logout,
        toasts,
        addToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        sidebarOpen,
        setSidebarOpen,
        authModalOpen,
        setAuthModalOpen,
        notificationsOpen,
        setNotificationsOpen,
        introQuizId,
        setIntroQuizId,
        battleSets,
        saveBattleSet,
        deleteBattleSet,
        battles,
        activeBattleId,
        setActiveBattleId,
        activeBattleResult,
        setActiveBattleResult,
        createBattleRequest,
        acceptBattleRequest,
        rejectBattleRequest,
        cancelBattleRequest,
        startBattle,
        finishBattle,
        learningItems,
        learningStreak,
        revisionDueCount,
        addLearningItem,
        updateLearningItem,
        deleteLearningItem,
        toggleLearningBookmark,
        updateLearningStatus,
        markItemRevised,
        logMistakeFromCoding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
