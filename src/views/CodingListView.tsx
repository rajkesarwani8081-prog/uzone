import React, { useState } from 'react';
import { Search, Check, CircleDot, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { codingProblems } from '../data/codingProblems';

export const CodingListView: React.FC = () => {
  const { setActiveCodingProblemId, setPage } = useApp();

  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [search, setSearch] = useState('');

  // Read progress from localStorage
  const [progress] = useState<Record<string, 'solved' | 'attempted'>>(() => {
    try {
      return JSON.parse(localStorage.getItem('uzone-coding-progress') || '{}');
    } catch {
      return {};
    }
  });

  const counts: Record<string, [number, number]> = {
    Easy: [0, 0],
    Medium: [0, 0],
    Hard: [0, 0],
  };

  codingProblems.forEach((p) => {
    if (counts[p.difficulty]) {
      counts[p.difficulty][1]++;
      if (progress[p.id] === 'solved') counts[p.difficulty][0]++;
    }
  });

  const totalSolved = Object.values(counts).reduce((s, c) => s + c[0], 0);

  const filtered = codingProblems.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesFilter = filter === 'All' || p.difficulty === filter;
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const handleOpenProblem = (id: string) => {
    setActiveCodingProblemId(id);
    setPage('codingProblem');
  };

  return (
    <section className="page">
      <div className="lc-list-head">
        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Code practice</h3>
              <p>
                Solve real interview problems with an in-browser judge — pick a problem, write code,
                and run it against test cases.
              </p>
            </div>
          </div>
          <div className="lc-toolbar" style={{ marginBottom: 0 }}>
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
              <button
                key={d}
                type="button"
                className={`lc-chip ${filter === d ? 'active' : ''}`}
                onClick={() => setFilter(d)}
              >
                {d}
              </button>
            ))}
            <label className="lc-search">
              <Search size={15} />
              <input
                id="lc-search"
                placeholder="Search problems or topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </article>

        <article className="glass-card panel lc-progress-card">
          <div
            className="progress-ring"
            style={
              {
                '--value': codingProblems.length
                  ? Math.round((totalSolved / codingProblems.length) * 100)
                  : 0,
              } as any
            }
          >
            <span>
              {totalSolved}
              <small>/{codingProblems.length}</small>
            </span>
          </div>

          <div className="lc-progress-bars">
            {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
              <div key={d} className="lc-progress-row">
                <span>{d}</span>
                <span className={`lc-bar ${d.toLowerCase()}`}>
                  <i
                    style={{
                      width: `${
                        counts[d][1] ? (counts[d][0] / counts[d][1]) * 100 : 0
                      }%`,
                    }}
                  ></i>
                </span>
                <strong>
                  {counts[d][0]} / {counts[d][1]}
                </strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="glass-card panel">
        <div className="lc-table" id="lc-rows">
          {filtered.length > 0 ? (
            filtered.map((p, index) => {
              const origIndex = codingProblems.indexOf(p) + 1;
              const status = progress[p.id];
              return (
                <div
                  key={p.id}
                  className="lc-row"
                  onClick={() => handleOpenProblem(p.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {status === 'solved' ? (
                    <span className="lc-status-dot solved">
                      <Check size={12} />
                    </span>
                  ) : status === 'attempted' ? (
                    <span className="lc-status-dot attempted">
                      <CircleDot size={12} />
                    </span>
                  ) : (
                    <span className="lc-status-dot todo">
                      <Circle size={12} />
                    </span>
                  )}
                  <span className="lc-num">{origIndex}</span>
                  <h4>{p.title}</h4>
                  <span className="lc-tags">
                    {p.tags.slice(0, 2).map((t) => (
                      <span key={t} className="lc-tag">
                        {t}
                      </span>
                    ))}
                  </span>
                  <span className={`lc-diff ${p.difficulty.toLowerCase()}`}>
                    {p.difficulty}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="lc-empty">No problems match — try a different search or filter.</div>
          )}
        </div>
      </article>
    </section>
  );
};
