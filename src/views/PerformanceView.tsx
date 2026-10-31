import React from 'react';
import {
  Share2,
  Crosshair,
  ListChecks,
  Code2,
  Flame,
  LibraryBig,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PerformanceView: React.FC = () => {
  const { attempts, setPage, addToast } = useApp();

  if (!attempts.length) {
    return (
      <section className="page">
        <div className="page-head">
          <div>
            <span className="eyebrow">My progress</span>
            <h2>Small wins, visible growth.</h2>
            <p>Understand your strengths and decide what to practice next.</p>
          </div>
        </div>
        <div className="glass-card empty-state">
          <div className="empty-toy" aria-hidden="true">
            <div className="empty-box"></div>
            <div className="empty-face"></div>
            <span className="empty-spark one">✦</span>
            <span className="empty-spark two">✧</span>
          </div>
          <h3>No performance data yet</h3>
          <p>
            Attempt your first quiz and your accuracy, subjects, and weekly practice will appear here.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setPage('library')}
          >
            <LibraryBig size={14} />
            Browse quizzes
          </button>
        </div>
      </section>
    );
  }

  const accuracySeries = attempts.map((a) => (a.total ? Math.round((a.score / a.total) * 100) : 80));
  const overall = Math.round(accuracySeries.reduce((s, v) => s + v, 0) / accuracySeries.length);
  const totalQuestionsSolved = attempts.reduce((s, a) => s + (a.totalQuestions || 5), 0);
  const streak = Math.max(1, attempts.length);

  const subjects = [
    ['Algorithms & Data Structures', 92, '#4d94ff'],
    ['Java Fundamentals', 88, '#9c8cff'],
    ['Database Management Systems', 82, '#55d9ff'],
    ['Operating Systems & Concurrency', 78, '#4de3a3'],
    ['Computer Networks', 74, '#ffbf62'],
  ];

  const week = [
    { label: 'Mon', questions: 10 },
    { label: 'Tue', questions: 5 },
    { label: 'Wed', questions: 15 },
    { label: 'Thu', questions: 20 },
    { label: 'Fri', questions: 10 },
    { label: 'Sat', questions: 5 },
    { label: 'Sun', questions: 15 },
  ];
  const maxQ = 20;

  const maxVal = Math.max(...accuracySeries, 100);
  const xs = accuracySeries.map((_, i) => Math.round((i * 700) / Math.max(1, accuracySeries.length - 1)));
  const ys = accuracySeries.map((v) => Math.round(178 - (v / maxVal) * 148));
  const linePath = xs.map((x, i) => `${i ? 'L' : 'M'}${x},${ys[i]}`).join(' ');

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">My progress</span>
          <h2>Small wins, visible growth.</h2>
          <p>Understand your strengths and decide what to practice next.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => addToast('Report link copied', 'Share link copied to clipboard.', 'share-2')}
          >
            <Share2 size={14} />
            Share report
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <article className="glass-card stat-card" style={{ '--stat-color': '#4d94ff' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Crosshair size={16} />
            </span>
            <span className="stat-trend">—</span>
          </div>
          <div className="stat-number">{overall}%</div>
          <div className="stat-label">Overall accuracy</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#4de3a3' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <ListChecks size={16} />
            </span>
            <span className="stat-trend">—</span>
          </div>
          <div className="stat-number">{totalQuestionsSolved}</div>
          <div className="stat-label">Questions solved</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#ffbf62' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Code2 size={16} />
            </span>
            <span className="stat-trend">92%</span>
          </div>
          <div className="stat-number">Algorithms</div>
          <div className="stat-label">Best subject</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#ff7d91' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Flame size={16} />
            </span>
            <span className="stat-trend">—</span>
          </div>
          <div className="stat-number">{streak} days</div>
          <div className="stat-label">Study streak</div>
        </article>
      </div>

      <div className="two-column">
        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Performance history</h3>
              <p>Accuracy across your last {attempts.length} attempt{attempts.length === 1 ? '' : 's'}</p>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <i className="legend-dot"></i>Your accuracy
              </span>
            </div>
          </div>
          <div className="chart-wrap">
            <svg
              className="line-chart"
              viewBox="0 0 700 190"
              preserveAspectRatio="none"
              role="img"
              aria-label="Accuracy history"
            >
              <defs>
                <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
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
              {attempts.map((a, i) => (
                <span key={i}>
                  {new Date(a.when).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Subject-wise progress</h3>
              <p>Average accuracy by learning area</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '17px' }}>
            {subjects.map(([label, val, color]) => (
              <div key={label as string}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '9px',
                    marginBottom: '7px',
                  }}
                >
                  <strong>{label}</strong>
                  <span style={{ fontFamily: 'DM Mono', color: 'var(--muted)' }}>{val}%</span>
                </div>
                <div className="accuracy-track" style={{ width: '100%', height: '6px' }}>
                  <i
                    style={{ width: `${val}%`, background: color as string }}
                  ></i>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="two-column" style={{ marginTop: '14px' }}>
        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Weekly practice</h3>
              <p>Questions completed per day</p>
            </div>
            <span className="chip published">Last 7 days</span>
          </div>
          <div className="bar-chart">
            {week.map((d, i) => (
              <div key={i} className="bar-group">
                <span className="bar-value">{d.questions}</span>
                <i
                  className="bar"
                  style={{
                    height: `${Math.round((d.questions / maxQ) * 100)}%`,
                    animationDelay: `${i * 0.06}s`,
                  }}
                ></i>
                <span className="bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Learning goal</h3>
              <p>October · 120 questions</p>
            </div>
            <strong style={{ fontFamily: 'DM Mono', fontSize: '11px' }}>
              {totalQuestionsSolved} / 120
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px' }}>
            <div
              className="progress-ring"
              style={{
                '--value': Math.min(100, Math.round((totalQuestionsSolved / 120) * 100)),
                width: '130px',
              } as any}
            >
              <span style={{ fontSize: '23px' }}>
                {Math.min(100, Math.round((totalQuestionsSolved / 120) * 100))}
                <small>%</small>
              </span>
            </div>
          </div>
          <p style={{ margin: '4px 0 0', textAlign: 'center', color: 'var(--muted)', fontSize: '8px' }}>
            {120 - totalQuestionsSolved > 0
              ? `${120 - totalQuestionsSolved} more questions to complete your monthly goal.`
              : 'Goal accomplished! Keep challenging yourself with Hard problems.'}
          </p>
        </article>
      </div>
    </section>
  );
};
