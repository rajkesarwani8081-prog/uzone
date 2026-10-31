export type Role = 'teacher' | 'student';

export type AppTheme = 'light' | 'dark' | 'aurora';

export type QuizType = 'mcq' | 'coding';

export type CodingLanguage = 'java' | 'python' | 'cpp' | 'javascript';

export type AppPage =
  | 'dashboard'
  | 'quizzes'
  | 'create'
  | 'createCoding'
  | 'students'
  | 'analytics'
  | 'library'
  | 'performance'
  | 'leaderboard'
  | 'bookmarks'
  | 'coding'
  | 'codingProblem'
  | 'attempt'
  | 'result'
  | 'codingQuizAttempt'
  | 'codingQuizResult'
  | 'peerBattles'
  | 'teacherBattleSets'
  | 'liveBattle'
  | 'battleResult'
  | 'learningSpace';

export type LearningSection = 'mistakes' | 'learnings' | 'ideas' | 'notes';

export type LearningStatus = 'Learning' | 'Understood' | 'Need Revision';

export interface LearningResource {
  id: string;
  label: string;
  url: string;
  type: 'link' | 'pdf' | 'doc' | 'video';
}

export interface LearningItem {
  id: string;
  studentId: string; // Strictly private per student
  section: LearningSection;
  title: string;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD format
  tags: string[];
  status: LearningStatus;
  bookmarked: boolean;
  nextRevisionDate?: string;
  lastRevisedDate?: string;
  revisionCount?: number;
  
  // Mistake Book specific fields
  problemId?: string;
  problemTitle?: string;
  failureType?: string;
  failedInput?: string;
  expectedOutput?: string;
  actualOutput?: string;
  buggyCode?: string;
  correctedSolution?: string;
  fixExplanation?: string;

  // Code snippets (for New Learning, Notes, or Tricks)
  codeSnippet?: string;
  codeLanguage?: string;

  // Attached resources (PDFs, links, cheat-sheet URLs)
  resources?: LearningResource[];

  // Ideas & experiments specific fields
  ideaStage?: 'Hypothesis' | 'In Progress' | 'Tested & Validated' | 'Archived';
  actionItems?: Array<{ id: string; text: string; done: boolean }>;
  discoveryNotes?: string;
}

export interface LearningStreakData {
  currentStreak: number;
  longestStreak: number;
  activityMap: Record<string, number>; // date string YYYY-MM-DD -> count of activities
  todayCount: number;
  lastActiveDate: string;
}

export interface QuizQuestion {
  id: string;
  title?: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  solution?: string;
  marks: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  batch: string;
  semester: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  timer: number; // in minutes
  instructions: string;
  leaderboard: boolean;
  retry: boolean;
  shuffle?: boolean;
  explanations?: boolean;
  color?: string;
  date?: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  attempts?: number;
  accuracy?: number;
  quizType?: QuizType;
  questions: QuizQuestion[];
  codingProblemIds?: string[];
  codingProblemMarks?: Record<string, number>;
}

export interface StudentItem {
  name: string;
  batch: string;
  attempts: number;
  score: string;
  accuracy: number;
  status: 'Active' | 'At risk';
  color: [string, string];
}

export interface LeaderboardEntry {
  name: string;
  batch: string;
  marks: number;
  time: string;
  me?: boolean;
}

export interface AttemptRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  quizType?: QuizType;
  score: number;
  total: number;
  correct: number;
  totalQuestions: number;
  timeTakenSec: number;
  when: string;
  answers: Record<string, any>;
  bookmarked?: string[];
}

export interface CodingProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingProblemTest {
  args: any[];
  expected: any;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  examples: CodingProblemExample[];
  constraints: string[];
  functionName: string;
  params: string[];
  judge: 'exact' | 'float' | 'unordered' | 'unordered_inner' | 'inplace' | 'design' | 'tree_roundtrip';
  argStructures?: Record<string, string>;
  resultStructure?: string;
  inplaceArg?: number;
  starter: {
    javascript: string;
    python: string;
    java?: string;
    cpp?: string;
  };
  solution: {
    javascript: string;
    python: string;
    java?: string;
    cpp?: string;
  };
  approach: string;
  complexity: {
    time: string;
    space: string;
  };
  tests: CodingProblemTest[];
}

export interface TestCaseResult {
  caseIndex: number;
  pass: boolean;
  status: string;
  input: string;
  expected: string;
  actual?: string;
  logs?: string[];
  error?: string;
  executionTimeMs?: number;
}

export interface ProblemSubmissionResult {
  problemId: string;
  problemTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  code: string;
  language: CodingLanguage;
  marksEarned: number;
  maxMarks: number;
  verdict: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Unattempted';
  totalCases: number;
  passedCases: number;
  cases: TestCaseResult[];
}

export interface CodingQuizResult {
  quizId: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  pct: number;
  timeTakenSec: number;
  autoSubmitted: boolean;
  completedAt: string;
  results: ProblemSubmissionResult[];
  rank?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: string;
  unread: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  batch?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  icon?: string;
}

export type BattleRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'in_progress'
  | 'completed'
  | 'expired';

export interface BattleSet {
  id: string;
  title: string;
  subject: string;
  batch: string; // Enrolled class / course filter
  semester: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number; // in minutes
  marks: number;
  codingProblemIds: string[];
  codingProblemMarks: Record<string, number>;
  status: 'Published' | 'Draft';
  createdBy: string;
  createdAt: string;
  battlesCount?: number;
}

export interface BattleParticipantProgress {
  studentId: string;
  studentName: string;
  batch: string;
  solvedProblems: string[];
  currentProblemIndex: number;
  score: number;
  timeSpentSec: number;
  accuracy: number;
  problemResults: ProblemSubmissionResult[];
  submitted: boolean;
  statusText?: string;
  lastActive?: string;
}

export interface BattleAnalysis {
  winnerName: string;
  scoreDiff: number;
  timeDiffSec: number;
  questionsBetterA: string[];
  questionsBetterB: string[];
  whereALostMarks: string[];
  whereBLostMarks: string[];
  timeEfficiencySummary: string;
  accuracySummary: string;
  recommendedTopicsA: string[];
  recommendedTopicsB: string[];
  efficiencyInsights: string[];
}

export interface PeerBattle {
  id: string;
  battleSetId: string;
  battleSetTitle: string;
  subject: string;
  batch: string; // Class / Course enrollment check
  initiatorStudentId: string;
  initiatorName: string;
  targetStudentId: string;
  targetName: string;
  scheduledFor?: string;
  isScheduled?: boolean;
  status: BattleRequestStatus;
  duration: number; // minutes
  totalMarks: number;
  codingProblemIds: string[];
  startedAt?: string;
  endedAt?: string;
  initiatorProgress: BattleParticipantProgress;
  opponentProgress: BattleParticipantProgress;
  winner?: string | 'tie' | null;
  analysis?: BattleAnalysis;
  note?: string;
}
