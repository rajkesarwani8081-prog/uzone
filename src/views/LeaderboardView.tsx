import React from 'react';
import { useApp } from '../context/AppContext';

export const LeaderboardView: React.FC = () => {
  const { leaderboard } = useApp();

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const podium = [
    { rank: 2, medal: '🥈', entry: leaderboard[1] },
    { rank: 1, medal: '👑', entry: leaderboard[0] },
    { rank: 3, medal: '🥉', entry: leaderboard[2] },
  ];

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Live rankings</span>
          <h2>Skill speaks louder than luck.</h2>
          <p>Ranked by marks first, then fastest completion time.</p>
        </div>
      </div>

      <div className="three-column" style={{ marginBottom: '14px' }}>
        {podium.map(({ rank, medal, entry }) => {
          if (!entry) return null;
          return (
            <article
              key={rank}
              className={`glass-card panel podium-card rank-${rank}`}
              style={
                {
                  textAlign: 'center',
                  borderColor: rank === 1 ? 'rgba(255,191,98,.23)' : undefined,
                  transform: rank === 1 ? 'translateY(-5px)' : undefined,
                } as React.CSSProperties
              }
            >
              <div
                className="podium-medal"
                style={{ fontSize: rank === 1 ? '28px' : '22px', marginBottom: '8px' }}
              >
                {medal}
              </div>
              <span
                className="mini-avatar"
                style={
                  {
                    width: '43px',
                    height: '43px',
                    margin: '0 auto 9px',
                    '--av1': rank === 1 ? '#ffbf62' : '#4d94ff',
                    '--av2': rank === 1 ? '#a96112' : '#164a98',
                  } as any
                }
              >
                {getInitials(entry.name)}
              </span>
              <strong style={{ display: 'block', fontSize: '11px' }}>{entry.name}</strong>
              <span
                style={{
                  display: 'block',
                  color: 'var(--muted)',
                  fontSize: '8px',
                  marginTop: '4px',
                }}
              >
                {entry.marks} marks · {entry.time}
              </span>
            </article>
          );
        })}
      </div>

      <article className="glass-card panel">
        <div className="panel-head">
          <div className="panel-title">
            <h3>Full leaderboard</h3>
            <p>
              {leaderboard.length} student{leaderboard.length === 1 ? '' : 's'} · updated just now
            </p>
          </div>
          <span className="chip published">Live</span>
        </div>

        <div className="rank-list">
          {leaderboard.map((r, i) => {
            const medal = ['🥇', '🥈', '🥉'][i];
            return (
              <div
                key={i}
                className={`rank-item ${r.me ? 'me' : ''}`}
                style={{ '--rank-i': i } as any}
              >
                <span className={`rank-num ${medal ? 'medal' : ''}`}>{medal || i + 1}</span>
                <span className="mini-avatar">{getInitials(r.name)}</span>
                <span className="rank-copy">
                  <strong>
                    {r.name}
                    {r.me ? ' · You' : ''}
                  </strong>
                  <span>Batch {r.batch || '—'}</span>
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
    </section>
  );
};
