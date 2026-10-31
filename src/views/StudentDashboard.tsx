import React from 'react';
import {
  Play,
  LibraryBig,
  CheckCircle2,
  Gauge,
  Trophy,
  Clock3,
  Flame,
  Check,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  ListChecks,
  Award,
  Swords,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StationeryMascot } from '../components/StationeryMascot';

export const StudentDashboard: React.FC = () => {
  const {
    user,
    quizzes,
    attempts,
    quizBookmarks,
    toggleQuizBookmark,
    setIntroQuizId,
    setPage,
    revisionDueCount,
  } = useApp();

  const firstName = (user?.name || 'Aarav').split(' ')[0];
  const publishedQuizzes = quizzes.filter((q) => q.status === 'Published');
  const heroQuiz = publishedQuizzes[0] || quizzes[0];

  const completedCount = attempts.length;
  const avgAccuracy = attempts.length
    ? Math.round(
        attempts.reduce((sum, a) => sum + (a.total ? (a.score / a.total) * 100 : 0), 0) /
          attempts.length
      )
    : 85;

  const streakDays = Math.max(1, attempts.length);

  const week = [
    { label: 'Mon', count: 1 },
    { label: 'Tue', count: 0 },
    { label: 'Wed', count: 1 },
    { label: 'Thu', count: 2 },
    { label: 'Fri', count: 1 },
    { label: 'Sat', count: 0 },
    { label: 'Sun', count: 1 },
  ];

  const recentAttempts = attempts.slice(0, 3);

  // Line chart points for accuracy trend
  const chartPoints = attempts.length
    ? attempts.map((a) => (a.total ? Math.round((a.score / a.total) * 100) : 80))
    : [70, 85, 80, 90, 88, 95];

  const maxVal = Math.max(...chartPoints, 100);
  const xs = chartPoints.map((_, i) => Math.round((i * 700) / (Math.max(1, chartPoints.length - 1))));
  const ys = chartPoints.map((v) => Math.round(178 - (v / maxVal) * 148));
  const linePath = xs.map((x, i) => `${i ? 'L' : 'M'}${x},${ys[i]}`).join(' ');

  return (
    <section className="page dashboard-stack">
      <article className="hero-card">
        <div className="hero-copy">
          <span className="hero-kicker">
            <i></i>
            {streakDays} day streak
          </span>
          <h2>
            Hey {firstName}, ready to <span>level up?</span>
          </h2>
          <p>
            {publishedQuizzes.length} quiz
            {publishedQuizzes.length === 1 ? ' is' : 'zes are'} live right now. Every attempt updates
            your rank and sharpens your coding intuition.
          </p>
          <div className="hero-actions">
            {heroQuiz && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIntroQuizId(heroQuiz.id)}
              >
                <Play size={14} />
                Continue learning
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage('learningSpace')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(77, 148, 255, 0.4)' }}
            >
              <BookOpen size={14} style={{ color: 'var(--blue)' }} />
              My Learning Space
              {revisionDueCount > 0 && (
                <span style={{ fontSize: '10px', background: '#e14e68', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {revisionDueCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage('peerBattles')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(234, 178, 52, 0.4)' }}
            >
              <Swords size={14} style={{ color: 'var(--amber)' }} />
              Peer battle
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage('library')}
            >
              <LibraryBig size={14} />
              Explore library
            </button>
          </div>
        </div>
        <StationeryMascot />
      </article>

      <div className="stats-grid">
        <article className="glass-card stat-card" style={{ '--stat-color': '#4d94ff' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <CheckCircle2 size={16} />
            </span>
            <span className="stat-trend">—</span>
          </div>
          <div className="stat-number">{completedCount}</div>
          <div className="stat-label">Quizzes completed</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#4de3a3' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Gauge size={16} />
            </span>
            <span className="stat-trend">—</span>
          </div>
          <div className="stat-number">{avgAccuracy}%</div>
          <div className="stat-label">Average score</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#ffbf62' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Trophy size={16} />
            </span>
            <span className="stat-trend">—</span>
          </div>
          <div className="stat-number">#3</div>
          <div className="stat-label">Current rank</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#55d9ff' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Flame size={16} className="text-amber-400" />
            </span>
            <span className="stat-trend">🔥</span>
          </div>
          <div className="stat-number">{streakDays}d</div>
          <div className="stat-label">Learning streak</div>
        </article>
      </div>

      <div className="two-column">
        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Recommended for you</h3>
              <p>Based on your recent practice</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setPage('library')}
            >
              See all <ArrowRight size={13} />
            </button>
          </div>

          <div className="quiz-grid">
            {publishedQuizzes.slice(0, 2).map((q) => {
              const isSaved = quizBookmarks.has(q.id);
              return (
                <article
                  key={q.id}
                  className="glass-card quiz-card"
                  style={{ '--card-color': q.color || '#4d94ff' } as any}
                >
                  <div className="quiz-top">
                    <span className="subject-badge">{q.subject.slice(0, 2).toUpperCase()}</span>
                    <button
                      type="button"
                      className="card-menu"
                      onClick={() => toggleQuizBookmark(q.id)}
                      aria-label="Bookmark quiz"
                    >
                      {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
                  </div>
                  <h3>{q.title}</h3>
                  <p>
                    {q.topic} · Semester {q.semester}
                  </p>
                  <div className="quiz-meta">
                    <span>
                      <ListChecks size={13} />
                      {q.questions.length} questions
                    </span>
                    <span>
                      <Clock3 size={13} />
                      {q.timer} min
                    </span>
                    <span>
                      <Award size={13} />
                      {q.marks} marks
                    </span>
                  </div>
                  <div className="quiz-footer">
                    <span className={`difficulty ${q.difficulty.toLowerCase()}`}>
                      {q.difficulty}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setIntroQuizId(q.id)}
                    >
                      <Play size={13} />
                      Attempt
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <div className="dashboard-stack">
          <article className="glass-card streak-card">
            <span className="streak-flame">
              <Flame size={20} />
            </span>
            <span className="streak-copy">
              <strong>{streakDays} day streak</strong>
              <span>Keep it going — one challenge a day.</span>
            </span>
            <div className="week-dots">
              {week.map((d, i) => (
                <span key={i} className={`day-dot ${d.count ? 'done' : ''}`}>
                  <i>{d.count ? <Check size={10} /> : null}</i>
                  {d.label[0]}
                </span>
              ))}
            </div>
          </article>

          <article className="glass-card panel">
            <div className="panel-head">
              <div className="panel-title">
                <h3>Quick performance</h3>
                <p>Your recent attempts</p>
              </div>
              <div className="progress-ring" style={{ '--value': avgAccuracy, width: '64px' } as any}>
                <span style={{ fontSize: '13px' }}>
                  {avgAccuracy}
                  <small>%</small>
                </span>
              </div>
            </div>

            <div className="mini-quiz-list">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((a, i) => (
                  <div key={i} className="mini-quiz">
                    <span
                      className="subject-icon"
                      style={{ '--sub1': '#4d94ff', '--sub2': '#17427e' } as any}
                    >
                      CS
                    </span>
                    <span className="mini-quiz-copy">
                      <strong>{a.quizTitle}</strong>
                      <span>
                        {new Date(a.when).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        · {a.correct}/{a.totalQuestions} correct
                      </span>
                    </span>
                    <span className="score-chip">
                      {a.score}/{a.total}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: '9px', padding: '10px 0' }}>
                  No attempts yet — your recent scores will appear here.
                </p>
              )}
            </div>
          </article>
        </div>
      </div>

      <article className="glass-card panel">
        <div className="panel-head">
          <div className="panel-title">
            <h3>Your weekly momentum</h3>
            <p>Accuracy across your recent attempts</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setPage('performance')}
          >
            Full report <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="chart-wrap">
          <svg
            className="line-chart"
            viewBox="0 0 700 190"
            preserveAspectRatio="none"
            role="img"
            aria-label="Accuracy trend"
          >
            <defs>
              <linearGradient id="studentChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3d57d6" stopOpacity="0.28" />
                <stop offset="1" stopColor="#3d57d6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line className="gridline" x1="0" y1="28" x2="700" y2="28" />
            <line className="gridline" x1="0" y1="78" x2="700" y2="78" />
            <line className="gridline" x1="0" y1="128" x2="700" y2="128" />
            <line className="gridline" x1="0" y1="178" x2="700" y2="178" />
            <path className="area" d={`${linePath} L700,190 L0,190 Z`} />
            <path className="line" d={linePath} />
            {xs.map((x, i) => (
              <circle key={i} className="point" cx={x} cy={ys[i]} r="4" />
            ))}
          </svg>
          <div className="chart-labels">
            {chartPoints.map((_, i) => (
              <span key={i}>Attempt {i + 1}</span>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
};
