import React from 'react';
import {
  CalendarDays,
  Download,
  Gauge,
  CheckCircle2,
  Timer,
  Crosshair,
  HelpCircle,
  Ellipsis,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { leaderboard, addToast } = useApp();

  const bars: Array<[string, number]> = [
    ['Java 5.0', 78],
    ['DSA 5.0', 64],
    ['DBMS 3.0', 73],
    ['Java 4.0', 82],
    ['OS 4.0', 58],
    ['Networks', 86],
  ];

  const dist = [
    { label: 'Java · 72%', color: 'var(--blue)' },
    { label: 'DSA · 12%', color: 'var(--cyan)' },
    { label: 'DBMS · 9%', color: 'var(--amber)' },
    { label: 'Other · 7%', color: 'var(--red)' },
  ];

  const hardest = [
    { text: 'Graph traversal complexity', pct: '68% answered incorrectly', num: '#12' },
    { text: 'Third normal form dependency', pct: '54% answered incorrectly', num: '#08' },
    { text: 'Java method dispatch', pct: '47% answered incorrectly', num: '#04' },
    { text: 'Deadlock prevention in OS', pct: '41% answered incorrectly', num: '#15' },
  ];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Learning intelligence</span>
          <h2>See what the scores don’t say.</h2>
          <p>Spot trends, misconceptions, and opportunities to improve.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary">
            <CalendarDays size={14} />
            Last 30 days
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => addToast('Report generated', 'Analytics report ready.', 'download')}
          >
            <Download size={14} />
            Export report
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <article className="glass-card stat-card" style={{ '--stat-color': '#4d94ff' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Gauge size={16} />
            </span>
            <span className="stat-trend">+2.1%</span>
          </div>
          <div className="stat-number">76.8%</div>
          <div className="stat-label">Average score</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#4de3a3' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <CheckCircle2 size={16} />
            </span>
            <span className="stat-trend">+3.8%</span>
          </div>
          <div className="stat-number">92.4%</div>
          <div className="stat-label">Completion rate</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#ffbf62' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Timer size={16} />
            </span>
            <span className="stat-trend down">-1.2%</span>
          </div>
          <div className="stat-number">14m 32s</div>
          <div className="stat-label">Avg. time</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#55d9ff' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Crosshair size={16} />
            </span>
            <span className="stat-trend">+4.6%</span>
          </div>
          <div className="stat-number">79.1%</div>
          <div className="stat-label">Quiz accuracy</div>
        </article>
      </div>

      <div className="two-column">
        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Quiz-wise accuracy</h3>
              <p>Average correct answers by assessment</p>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <i className="legend-dot"></i>Accuracy
              </span>
            </div>
          </div>
          <div className="bar-chart">
            {bars.map(([label, val], idx) => (
              <div key={label} className="bar-group">
                <span className="bar-value">{val}%</span>
                <i
                  className="bar"
                  style={{ height: `${val}%`, animationDelay: `${idx * 0.07}s` }}
                ></i>
                <span className="bar-label">{label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Subject distribution</h3>
              <p>Attempt share this month</p>
            </div>
            <Ellipsis size={15} style={{ color: 'var(--muted)' }} />
          </div>
          <div className="donut-layout">
            <div className="donut">
              <strong>8.4k</strong>
              <span>attempts</span>
            </div>
            <div className="donut-legend">
              {dist.map((d) => (
                <span key={d.label}>
                  <i style={{ background: d.color }}></i>
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="two-column" style={{ marginTop: '14px' }}>
        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Most incorrect questions</h3>
              <p>Concepts students are struggling with</p>
            </div>
          </div>
          <div className="activity-list">
            {hardest.map((h, i) => (
              <div key={i} className="activity-item">
                <span className="activity-icon amber">
                  <HelpCircle size={15} />
                </span>
                <span className="activity-copy">
                  <strong>{h.text}</strong>
                  <span>{h.pct}</span>
                </span>
                <time className="activity-time">{h.num}</time>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Top performers</h3>
              <p>Across all quizzes this month</p>
            </div>
          </div>
          <div className="rank-list">
            {leaderboard.slice(0, 4).map((r, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={i} className="rank-item" style={{ '--rank-i': i } as any}>
                  <span className={`rank-num ${i < 3 ? 'medal' : ''}`}>
                    {medals[i] || i + 1}
                  </span>
                  <span className="mini-avatar">{getInitials(r.name)}</span>
                  <span className="rank-copy">
                    <strong>{r.name}</strong>
                    <span>Batch {r.batch}</span>
                  </span>
                  <span className="rank-score">
                    <strong>{r.marks} marks</strong>
                    <span>{r.time}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
};
