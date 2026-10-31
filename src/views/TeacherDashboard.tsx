import React from 'react';
import {
  Plus,
  ChartNoAxesCombined,
  Files,
  Users,
  MousePointerClick,
  Gauge,
  ArrowUpRight,
  TrendingUp,
  Swords,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StationeryMascot } from '../components/StationeryMascot';

export const TeacherDashboard: React.FC = () => {
  const { user, quizzes, students, attempts, setPage } = useApp();

  const firstName = (user?.name || 'Professor').split(' ')[0];
  const publishedQuizzes = quizzes.filter((q) => q.status === 'Published');
  const totalAttemptsCount = quizzes.reduce((acc, q) => acc + (q.attempts || 0), attempts.length * 3);
  const avgAccuracy = Math.round(
    quizzes.reduce((acc, q) => acc + (q.accuracy || 75), 0) / (quizzes.length || 1)
  );

  // 7-day attempt points for SVG chart
  const weeklyData = [
    { label: 'Mon', count: 12 },
    { label: 'Tue', count: 19 },
    { label: 'Wed', count: 15 },
    { label: 'Thu', count: 28 },
    { label: 'Fri', count: 22 },
    { label: 'Sat', count: 34 },
    { label: 'Sun', count: 41 },
  ];

  const points = weeklyData.map((d) => d.count);
  const maxPoint = Math.max(...points, 1);
  const xs = points.map((_, i) => Math.round((i * 700) / (points.length - 1)));
  const ys = points.map((v) => Math.round(178 - (v / maxPoint) * 148));
  const linePath = xs.map((x, i) => `${i ? 'L' : 'M'}${x},${ys[i]}`).join(' ');

  return (
    <section className="page dashboard-stack">
      <article className="hero-card">
        <div className="hero-copy">
          <span className="hero-kicker">
            <i></i>Live classroom
          </span>
          <h2>
            Good afternoon, {firstName}. <span>Let’s spark curiosity.</span>
          </h2>
          <p>
            {publishedQuizzes.length > 0
              ? `${publishedQuizzes.length} assessment${
                  publishedQuizzes.length === 1 ? ' is' : 's are'
                } actively challenging students across batches.`
              : 'Create a quiz and invite students to test their skills and track rankings.'}
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPage('create')}
            >
              <Plus size={14} />
              Create a quiz
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage('teacherBattleSets')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Swords size={14} style={{ color: 'var(--amber)' }} />
              Battle sets
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage('analytics')}
            >
              <ChartNoAxesCombined size={14} />
              View insights
            </button>
          </div>
        </div>
        <StationeryMascot />
      </article>

      <div className="stats-grid">
        <article className="glass-card stat-card" style={{ '--stat-color': '#4d94ff' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Files size={16} />
            </span>
            <span className="stat-trend">
              <TrendingUp size={12} />
              Active
            </span>
          </div>
          <div className="stat-number">{quizzes.length}</div>
          <div className="stat-label">Total quizzes</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#55d9ff' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Users size={16} />
            </span>
            <span className="stat-trend">
              <TrendingUp size={12} />
              Enrolled
            </span>
          </div>
          <div className="stat-number">{students.length}</div>
          <div className="stat-label">Total students</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#4de3a3' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <MousePointerClick size={16} />
            </span>
            <span className="stat-trend">
              <TrendingUp size={12} />
              +14%
            </span>
          </div>
          <div className="stat-number">{totalAttemptsCount}</div>
          <div className="stat-label">Total attempts</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#ffbf62' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Gauge size={16} />
            </span>
            <span className="stat-trend">
              <TrendingUp size={12} />
              +3.2%
            </span>
          </div>
          <div className="stat-number">{avgAccuracy}%</div>
          <div className="stat-label">Average score</div>
        </article>
      </div>

      <div className="two-column">
        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Attempts this week</h3>
              <p>Daily submission activity across all quizzes</p>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <i className="legend-dot"></i>Attempts
              </span>
              <span className="chip">Last 7 days</span>
            </div>
          </div>

          <div className="chart-wrap">
            <svg
              className="line-chart"
              viewBox="0 0 700 190"
              preserveAspectRatio="none"
              role="img"
              aria-label="Weekly attempts chart"
            >
              <defs>
                <linearGradient id="teacherChartFill" x1="0" y1="0" x2="0" y2="1">
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
              {weeklyData.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
          </div>
        </article>

        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Recent activity</h3>
              <p>What’s happening now</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setPage('students')}
            >
              View all
            </button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon green">
                <Users size={16} />
              </span>
              <span className="activity-copy">
                <strong>Ananya Gupta scored 100%</strong>
                <span>Completed Two Sum & Hash Maps in 11m 45s</span>
              </span>
              <time className="activity-time">5m ago</time>
            </div>
            <div className="activity-item">
              <span className="activity-icon blue">
                <Files size={16} />
              </span>
              <span className="activity-copy">
                <strong>Batch 5.0 submissions active</strong>
                <span>14 new submissions in Binary Tree Traversal</span>
              </span>
              <time className="activity-time">22m ago</time>
            </div>
            <div className="activity-item">
              <span className="activity-icon amber">
                <Gauge size={16} />
              </span>
              <span className="activity-copy">
                <strong>Accuracy milestone reached</strong>
                <span>Class average rose above 85% this week</span>
              </span>
              <time className="activity-time">2h ago</time>
            </div>
          </div>
        </article>
      </div>

      <div className="two-column">
        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Active quizzes</h3>
              <p>Live performance snapshot</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setPage('quizzes')}
            >
              Manage all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="mini-quiz-list">
            {publishedQuizzes.slice(0, 3).map((q) => (
              <div key={q.id} className="mini-quiz">
                <span
                  className="subject-icon"
                  style={
                    {
                      '--sub1': q.color || '#4d94ff',
                      '--sub2': '#17427e',
                    } as any
                  }
                >
                  {q.subject.slice(0, 2).toUpperCase()}
                </span>
                <span className="mini-quiz-copy">
                  <strong>{q.title}</strong>
                  <span>
                    {q.attempts || 12} attempts · {q.questions.length} questions
                  </span>
                </span>
                <span className="score-chip">{q.accuracy || 82}%</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Class pulse</h3>
              <p>Across published assessments</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '6px' }}>
                <span>Completion rate</span>
                <strong>92%</strong>
              </div>
              <div className="accuracy-track" style={{ width: '100%', height: '6px' }}>
                <i style={{ width: '92%', background: 'var(--green)' }}></i>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '6px' }}>
                <span>Time efficiency</span>
                <strong>78%</strong>
              </div>
              <div className="accuracy-track" style={{ width: '100%', height: '6px' }}>
                <i style={{ width: '78%', background: 'var(--blue)' }}></i>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '6px' }}>
                <span>Topic coverage</span>
                <strong>86%</strong>
              </div>
              <div className="accuracy-track" style={{ width: '100%', height: '6px' }}>
                <i style={{ width: '86%', background: 'var(--amber)' }}></i>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
