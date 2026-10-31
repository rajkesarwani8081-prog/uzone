import React, { useState } from 'react';
import {
  Share2,
  Crown,
  Star,
  CheckCircle2,
  XCircle,
  Clock3,
  Award,
  ChevronDown,
  ChevronUp,
  CodeXml,
  LibraryBig,
  BarChart3,
  Check,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CodingQuizResultView: React.FC = () => {
  const { lastCodingResult, setPage, addToast, logMistakeFromCoding } = useApp();

  const [expandedCode, setExpandedCode] = useState<Record<string, boolean>>({});

  if (!lastCodingResult) {
    return (
      <section className="page">
        <div className="glass-card empty-state">
          <div className="empty-toy" aria-hidden="true">
            <div className="empty-box"></div>
            <div className="empty-face"></div>
            <span className="empty-spark one">✦</span>
          </div>
          <h3>No recent coding assessment</h3>
          <p>Complete a coding quiz to review your test case results, scores and submitted code.</p>
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

  const { quizTitle, score, totalMarks, pct, timeTakenSec, autoSubmitted, results, rank } =
    lastCodingResult;

  const totalCasesCount = results.reduce((s, r) => s + r.totalCases, 0);
  const passedCasesCount = results.reduce((s, r) => s + r.passedCases, 0);
  const solvedProblemsCount = results.filter((r) => r.verdict === 'Accepted').length;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedCode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `I scored ${score}/${totalMarks} (${pct}%) on ${quizTitle} with ${solvedProblemsCount}/${results.length} problems solved!`
      );
      addToast('Copied to clipboard', 'Assessment report ready to share.', 'share-2');
    }
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Assessment Evaluated</span>
          <h2>Here’s your coding performance.</h2>
          <p>
            {quizTitle} · {autoSubmitted ? 'Auto-submitted at time limit' : 'Submitted successfully'}
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary" onClick={handleShare}>
            <Share2 size={14} />
            Share result
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setPage('library')}
          >
            <LibraryBig size={14} />
            Quiz Library
          </button>
        </div>
      </div>

      <div className="two-column">
        {/* Result Hero Card */}
        <article className="glass-card result-hero">
          <div className="result-crown">
            {pct >= 80 ? <Crown size={28} /> : <Star size={28} />}
          </div>
          <h2>
            {pct >= 85
              ? 'Outstanding Code!'
              : pct >= 60
              ? 'Solid Performance!'
              : 'Keep Practicing!'}
          </h2>
          <p>
            {pct >= 85
              ? 'Your algorithms passed edge cases and time complexity requirements.'
              : pct >= 60
              ? 'Great effort! A few test cases failed on boundary conditions.'
              : 'Review the failing test cases below and refine your approach.'}
          </p>

          <div className="result-score" style={{ '--score': `${pct}%` } as any}>
            <strong>{pct}%</strong>
            <span>accuracy</span>
          </div>

          <div className="result-stat-grid">
            <div className="result-stat">
              <strong>
                {score} / {totalMarks}
              </strong>
              <span>Marks Earned</span>
            </div>
            <div className="result-stat">
              <strong>
                {solvedProblemsCount} / {results.length}
              </strong>
              <span>Problems Solved</span>
            </div>
            <div className="result-stat">
              <strong>{formatTime(timeTakenSec)}</strong>
              <span>Duration</span>
            </div>
            <div className="result-stat">
              <strong>#{rank || 1}</strong>
              <span>Class Rank</span>
            </div>
          </div>
        </article>

        {/* Performance Analytics Snapshot */}
        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Test-Case Analytics</h3>
              <p>Granular code verification metrics</p>
            </div>
            <span className="chip published">Verified Engine</span>
          </div>

          <div style={{ display: 'grid', gap: '16px', marginTop: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '7px' }}>
                <strong>Test Cases Passed</strong>
                <span style={{ fontFamily: 'DM Mono', color: 'var(--muted)' }}>
                  {passedCasesCount} / {totalCasesCount} ({Math.round((passedCasesCount / (totalCasesCount || 1)) * 100)}%)
                </span>
              </div>
              <div className="accuracy-track" style={{ width: '100%', height: '7px' }}>
                <i
                  style={{
                    width: `${Math.round((passedCasesCount / (totalCasesCount || 1)) * 100)}%`,
                    background: 'var(--green)',
                  }}
                ></i>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '7px' }}>
                <strong>Marks Realization</strong>
                <span style={{ fontFamily: 'DM Mono', color: 'var(--muted)' }}>
                  {score} / {totalMarks} ({pct}%)
                </span>
              </div>
              <div className="accuracy-track" style={{ width: '100%', height: '7px' }}>
                <i style={{ width: `${pct}%`, background: 'var(--blue)' }}></i>
              </div>
            </div>

            <div className="quiz-health" style={{ marginTop: '12px' }}>
              <div className="health-head">
                Execution Quality <span>✦</span>
              </div>
              <p style={{ marginTop: '8px' }}>
                Submissions were verified for time complexity, memory allocation, and correct return types across all problems.
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* Problem-by-problem test case results breakdown */}
      <div className="panel-head" style={{ margin: '26px 2px 14px' }}>
        <div className="panel-title">
          <h3>Problem Breakdown & Test Cases</h3>
          <p>Detailed evaluation for each coding problem</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {results.map((r, i) => {
          const isPassed = r.verdict === 'Accepted';
          const isExpanded = !!expandedCode[r.problemId];

          return (
            <article
              key={r.problemId}
              className="glass-card"
              style={{
                padding: '18px',
                borderColor: isPassed ? 'rgba(77, 227, 163, 0.3)' : 'rgba(255, 108, 130, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      className="review-status"
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        display: 'grid',
                        placeItems: 'center',
                        color: isPassed ? 'var(--green)' : 'var(--red)',
                        background: isPassed ? 'rgba(77,227,163,.1)' : 'rgba(255,108,130,.1)',
                      }}
                    >
                      {isPassed ? <Check size={16} /> : <XCircle size={16} />}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '13px' }}>
                      Problem {i + 1}: {r.problemTitle}
                    </h3>
                    <span className={`lc-diff ${r.difficulty.toLowerCase()}`}>
                      {r.difficulty}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', fontSize: '9px', color: 'var(--muted)', marginLeft: '34px' }}>
                    <span>Language: <strong style={{ color: 'var(--text)' }}>{r.language.toUpperCase()}</strong></span>
                    <span>Test Cases: <strong style={{ color: isPassed ? 'var(--green)' : 'var(--amber)' }}>{r.passedCases}/{r.totalCases} Passed</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block' }}>Marks</span>
                    <strong style={{ fontSize: '14px', fontFamily: 'DM Mono', color: isPassed ? 'var(--green)' : 'var(--amber)' }}>
                      {r.marksEarned} / {r.maxMarks}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleExpand(r.problemId)}
                  >
                    <CodeXml size={13} />
                    {isExpanded ? 'Hide Code' : 'View Code'}
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {!isPassed && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: 'rgba(255, 191, 98, 0.4)', color: 'var(--amber)' }}
                      onClick={() => {
                        const failedCase = r.cases.find((c) => !c.pass) || r.cases[0];
                        logMistakeFromCoding({
                          problemId: r.problemId,
                          problemTitle: r.problemTitle,
                          failureType: r.verdict === 'Runtime Error' ? 'Runtime Error' : 'Quiz Test Case Failure',
                          failedInput: failedCase?.input,
                          expected: failedCase?.expected,
                          actual: failedCase?.actual || failedCase?.error,
                          code: r.code,
                          language: r.language,
                          category: 'Coding Quiz Assessment',
                          explanation: `Failed in assessment "${quizTitle}". Review edge cases and test inputs.`,
                        });
                      }}
                      title="Save this mistake to your Learning Space Mistake Book"
                    >
                      <BookOpen size={13} />
                      <span>Log to Mistake Book</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Test cases table */}
              <div style={{ marginTop: '14px', background: 'var(--surface-2)', borderRadius: '12px', padding: '12px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Test Cases Evaluation
                </span>

                <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
                  {r.cases.map((c, ci) => (
                    <div
                      key={ci}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,.02)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '9px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: c.pass ? 'var(--green)' : 'var(--red)',
                          }}
                        ></span>
                        <strong>Case {ci + 1}</strong>
                        <span style={{ color: 'var(--muted)' }}>
                          Expected: <code style={{ fontFamily: 'DM Mono' }}>{c.expected}</code>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {c.actual && (
                          <span style={{ color: c.pass ? 'var(--green)' : 'var(--red)' }}>
                            Output: <code style={{ fontFamily: 'DM Mono' }}>{c.actual}</code>
                          </span>
                        )}
                        <span className={`chip ${c.pass ? 'published' : 'draft'}`}>
                          {c.pass ? 'Passed' : c.status || 'Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submitted Code Accordion */}
              {isExpanded && (
                <div style={{ marginTop: '14px' }}>
                  <pre
                    style={{
                      background: 'rgba(6,8,12,.8)',
                      padding: '14px',
                      borderRadius: '12px',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '10px',
                      overflowX: 'auto',
                      border: '1px solid var(--line)',
                      color: 'var(--text)',
                      lineHeight: 1.5,
                    }}
                  >
                    {r.code}
                  </pre>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
