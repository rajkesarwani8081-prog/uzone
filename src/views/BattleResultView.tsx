import React, { useState } from 'react';
import {
  Trophy,
  Swords,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  TrendingUp,
  BrainCircuit,
  Zap,
  Target,
  BookOpen,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PeerBattle } from '../types';

export const BattleResultView: React.FC = () => {
  const {
    activeBattleResult,
    user,
    battles,
    startBattle,
    createBattleRequest,
    setPage,
    addToast,
  } = useApp();

  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'overview' | 'matrix' | 'deepAnalysis'>('overview');

  // Fallback to most recent completed battle if activeBattleResult not set
  const battle: PeerBattle | undefined =
    activeBattleResult ||
    battles.find((b) => b.status === 'completed') ||
    battles[0];

  const currentUserName = user?.name || 'Aarav Sharma';

  if (!battle) {
    return (
      <section className="page">
        <div className="lc-empty">
          <p>No completed battle record found.</p>
          <button type="button" className="btn btn-primary" onClick={() => setPage('peerBattles')}>
            Back to Peer Battle Hub
          </button>
        </div>
      </section>
    );
  }

  const pA = battle.initiatorProgress;
  const pB = battle.opponentProgress;

  const isUserA = pA.studentName.toLowerCase() === currentUserName.toLowerCase() || pA.studentName === 'You';
  const myProgress = isUserA ? pA : pB;
  const oppProgress = isUserA ? pB : pA;

  const isTie = battle.winner === 'Tie' || battle.winner === 'tie';
  const isWinner = battle.winner?.toLowerCase() === currentUserName.toLowerCase() || battle.winner === 'You';

  const analysis = battle.analysis || {
    winnerName: battle.winner || 'Tie',
    scoreDiff: Math.abs(pA.score - pB.score),
    timeDiffSec: Math.abs(pA.timeSpentSec - pB.timeSpentSec),
    questionsBetterA: [],
    questionsBetterB: [],
    whereALostMarks: ['Evaluated against test cases.'],
    whereBLostMarks: ['Evaluated against test cases.'],
    timeEfficiencySummary: 'Both participants completed the battle within the allotted time limit.',
    accuracySummary: `${pA.studentName} scored ${pA.score} pts; ${pB.studentName} scored ${pB.score} pts.`,
    recommendedTopicsA: ['Problem Solving'],
    recommendedTopicsB: ['Edge Cases'],
    efficiencyInsights: ['Algorithmic correctness and edge case handling compared.'],
  };

  const handleRematch = () => {
    // Initiate fresh rematch request
    createBattleRequest({
      battleSetId: battle.battleSetId,
      targetStudentId: oppProgress.studentId,
      targetName: oppProgress.studentName,
      note: 'Rematch challenge! Let us go again!',
    });
    setPage('peerBattles');
  };

  const handleShare = () => {
    addToast('Battle Link Copied', 'Share your battle results with your classmates.', 'share-2');
  };

  return (
    <section className="page">
      {/* Top Victory / Defeat Hero Banner */}
      <div
        className="paper-card"
        style={{
          padding: '28px',
          textAlign: 'center',
          marginBottom: '22px',
          background: isWinner
            ? 'radial-gradient(ellipse at top, rgba(32, 141, 104, 0.22) 0%, var(--surface-solid) 70%)'
            : isTie
            ? 'radial-gradient(ellipse at top, rgba(234, 178, 52, 0.2) 0%, var(--surface-solid) 70%)'
            : 'radial-gradient(ellipse at top, rgba(225, 78, 104, 0.18) 0%, var(--surface-solid) 70%)',
          border: `1px solid ${
            isWinner ? 'rgba(32, 141, 104, 0.35)' : isTie ? 'rgba(234, 178, 52, 0.35)' : 'rgba(225, 78, 104, 0.35)'
          }`,
          position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'var(--surface-2)', marginBottom: '12px' }}>
          {isWinner ? (
            <Trophy size={36} style={{ color: '#ffc93d' }} />
          ) : isTie ? (
            <Swords size={36} style={{ color: 'var(--amber)' }} />
          ) : (
            <Award size={36} style={{ color: 'var(--blue)' }} />
          )}
        </div>

        <span
          className="eyebrow"
          style={{
            color: isWinner ? 'var(--green)' : isTie ? 'var(--amber)' : '#ff7b93',
            fontSize: '11px',
            letterSpacing: '1px',
          }}
        >
          {isWinner ? 'VICTORY ACHIEVED' : isTie ? 'HONORABLE DRAW' : 'DEFEAT'}
        </span>

        <h1 style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', marginBottom: '8px' }}>
          {isWinner
            ? `You Won Against ${oppProgress.studentName}!`
            : isTie
            ? `Epic Tie Against ${oppProgress.studentName}!`
            : `${oppProgress.studentName} Won This Battle!`}
        </h1>

        <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '560px', margin: '0 auto 18px' }}>
          {battle.battleSetTitle} · Enrolled Course (Batch {battle.batch}) · {battle.duration} minutes
        </p>

        {/* Score comparison pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            background: 'var(--surface-solid)',
            padding: '12px 24px',
            borderRadius: '999px',
            border: '1px solid var(--line)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 600 }}>You ({myProgress.studentName})</span>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>{myProgress.score} <small style={{ fontSize: '12px', color: 'var(--muted)' }}>pts</small></div>
          </div>

          <span style={{ font: '800 14px "DM Mono", monospace', color: 'var(--amber)' }}>VS</span>

          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600 }}>{oppProgress.studentName}</span>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>{oppProgress.score} <small style={{ fontSize: '12px', color: 'var(--muted)' }}>pts</small></div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="lc-toolbar" style={{ marginBottom: '18px' }}>
        <button
          type="button"
          className={`lc-chip ${activeAnalysisTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveAnalysisTab('overview')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Award size={13} />
          Scorecard Comparison
        </button>

        <button
          type="button"
          className={`lc-chip ${activeAnalysisTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveAnalysisTab('matrix')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Target size={13} />
          Question-by-Question Matrix
        </button>

        <button
          type="button"
          className={`lc-chip ${activeAnalysisTab === 'deepAnalysis' ? 'active' : ''}`}
          onClick={() => setActiveAnalysisTab('deepAnalysis')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <BrainCircuit size={13} />
          Deep Performance Analysis
        </button>
      </div>

      {/* TAB 1: OVERVIEW SCORECARD */}
      {activeAnalysisTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '22px' }}>
          {/* Card: Your Performance */}
          <div className="paper-card" style={{ padding: '20px', borderTop: '3px solid var(--blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-primary" style={{ fontSize: '9px' }}>Participant 1</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>{myProgress.studentName} (You)</h3>
              </div>
              <strong style={{ fontSize: '22px', color: 'var(--blue)' }}>
                {myProgress.score} / {battle.totalMarks}
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Solved</span>
                <strong style={{ fontSize: '14px' }}>{myProgress.solvedProblems.length} / {battle.codingProblemIds.length}</strong>
              </div>
              <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Accuracy</span>
                <strong style={{ fontSize: '14px' }}>{myProgress.accuracy}%</strong>
              </div>
              <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Time Taken</span>
                <strong style={{ fontSize: '14px' }}>{Math.floor(myProgress.timeSpentSec / 60)}m {myProgress.timeSpentSec % 60}s</strong>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
              <strong>Problem Outcomes:</strong>
              <div style={{ display: 'grid', gap: '6px', marginTop: '8px' }}>
                {myProgress.problemResults.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--surface-solid)',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                    }}
                  >
                    <span>{r.problemTitle}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`dot ${r.verdict === 'Accepted' ? 'pass' : 'fail'}`} />
                      <strong>{r.marksEarned} pts</strong>
                      <span style={{ color: 'var(--muted)', fontSize: '10.5px' }}>({r.passedCases}/{r.totalCases} tests)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Opponent Performance (Privacy protected: no raw source code) */}
          <div className="paper-card" style={{ padding: '20px', borderTop: '3px solid #e14e68' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <span className="badge" style={{ fontSize: '9px', background: 'rgba(225, 78, 104, 0.15)', color: '#ff7b93' }}>
                  Participant 2
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>{oppProgress.studentName}</h3>
              </div>
              <strong style={{ fontSize: '22px', color: '#ff7b93' }}>
                {oppProgress.score} / {battle.totalMarks}
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Solved</span>
                <strong style={{ fontSize: '14px' }}>{oppProgress.solvedProblems.length} / {battle.codingProblemIds.length}</strong>
              </div>
              <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Accuracy</span>
                <strong style={{ fontSize: '14px' }}>{oppProgress.accuracy}%</strong>
              </div>
              <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Time Taken</span>
                <strong style={{ fontSize: '14px' }}>{Math.floor(oppProgress.timeSpentSec / 60)}m {oppProgress.timeSpentSec % 60}s</strong>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
              <strong>Problem Outcomes:</strong>
              <div style={{ display: 'grid', gap: '6px', marginTop: '8px' }}>
                {oppProgress.problemResults.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--surface-solid)',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                    }}
                  >
                    <span>{r.problemTitle}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`dot ${r.verdict === 'Accepted' ? 'pass' : 'fail'}`} />
                      <strong>{r.marksEarned} pts</strong>
                      <span style={{ color: 'var(--muted)', fontSize: '10.5px' }}>({r.passedCases}/{r.totalCases} tests)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '14px', fontSize: '10px', color: 'var(--muted)', fontStyle: 'italic' }}>
              * Rule 5 Compliance: Private source code is kept confidential. Only permitted test-case evaluations and runtime metrics are shown.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION-BY-QUESTION MATRIX */}
      {activeAnalysisTab === 'matrix' && (
        <div className="paper-card" style={{ padding: '22px', marginBottom: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Question-Wise Performance Matrix</h3>
          <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginBottom: '16px' }}>
            Comparison of marks earned, test case pass counts, and verdicts for both participants on identical questions.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: 'var(--muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Problem Title</th>
                  <th style={{ padding: '10px 12px' }}>Difficulty</th>
                  <th style={{ padding: '10px 12px' }}>Max Pts</th>
                  <th style={{ padding: '10px 12px', color: 'var(--blue)' }}>You ({myProgress.studentName})</th>
                  <th style={{ padding: '10px 12px', color: '#ff7b93' }}>{oppProgress.studentName}</th>
                  <th style={{ padding: '10px 12px' }}>Advantage</th>
                </tr>
              </thead>
              <tbody>
                {myProgress.problemResults.map((rA, idx) => {
                  const rB = oppProgress.problemResults[idx] || oppProgress.problemResults.find((r) => r.problemId === rA.problemId);
                  const marksA = rA.marksEarned;
                  const marksB = rB?.marksEarned || 0;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{rA.problemTitle}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`lc-diff ${rA.difficulty.toLowerCase()}`}>{rA.difficulty}</span>
                      </td>
                      <td style={{ padding: '12px', font: '500 11px "DM Mono", monospace' }}>{rA.maxMarks} pts</td>

                      {/* Participant A */}
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`dot ${rA.verdict === 'Accepted' ? 'pass' : 'fail'}`} />
                          <strong>{marksA} pts</strong>
                          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                            ({rA.passedCases}/{rA.totalCases} tests · {rA.language.toUpperCase()})
                          </span>
                        </div>
                      </td>

                      {/* Participant B */}
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`dot ${rB?.verdict === 'Accepted' ? 'pass' : 'fail'}`} />
                          <strong>{marksB} pts</strong>
                          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                            ({rB?.passedCases || 0}/{rB?.totalCases || rA.totalCases} tests · {rB?.language.toUpperCase() || 'JAVA'})
                          </span>
                        </div>
                      </td>

                      {/* Advantage */}
                      <td style={{ padding: '12px' }}>
                        {marksA > marksB ? (
                          <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '11px' }}>
                            +{(marksA - marksB)} pts You
                          </span>
                        ) : marksB > marksA ? (
                          <span style={{ color: '#ff7b93', fontWeight: 700, fontSize: '11px' }}>
                            +{(marksB - marksA)} pts {oppProgress.studentName}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Even (+0)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEEP PERFORMANCE ANALYSIS (Rule 5 requirement) */}
      {activeAnalysisTab === 'deepAnalysis' && (
        <div style={{ display: 'grid', gap: '18px', marginBottom: '22px' }}>
          {/* Section: Who Solved Better & Where Marks Were Lost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="paper-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={16} style={{ color: 'var(--green)' }} />
                <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>Where Advantage Was Gained</h4>
              </div>

              {analysis.questionsBetterA.length > 0 ? (
                <ul style={{ paddingLeft: '16px', fontSize: '12px', lineHeight: 1.6, color: 'var(--text-soft)' }}>
                  {analysis.questionsBetterA.map((item, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>
                      <strong style={{ color: 'var(--green)' }}>{myProgress.studentName}:</strong> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Both participants achieved equal points on all attempted questions.
                </p>
              )}

              {analysis.questionsBetterB.length > 0 && (
                <ul style={{ paddingLeft: '16px', fontSize: '12px', lineHeight: 1.6, color: 'var(--text-soft)', marginTop: '8px' }}>
                  {analysis.questionsBetterB.map((item, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>
                      <strong style={{ color: '#ff7b93' }}>{oppProgress.studentName}:</strong> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="paper-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertCircle size={16} style={{ color: 'var(--amber)' }} />
                <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>Where Marks Were Dropped</h4>
              </div>

              <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--blue)', display: 'block', marginBottom: '4px' }}>
                  {myProgress.studentName}:
                </strong>
                <ul style={{ paddingLeft: '16px', color: 'var(--text-soft)', marginBottom: '12px' }}>
                  {analysis.whereALostMarks.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>

                <strong style={{ color: '#ff7b93', display: 'block', marginBottom: '4px' }}>
                  {oppProgress.studentName}:
                </strong>
                <ul style={{ paddingLeft: '16px', color: 'var(--text-soft)' }}>
                  {analysis.whereBLostMarks.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Time Efficiency & Algorithmic Insights */}
          <div className="paper-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={16} style={{ color: 'var(--blue)' }} />
              <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>Time Efficiency & Execution Speed</h4>
            </div>

            <p style={{ fontSize: '12.5px', lineHeight: 1.65, color: 'var(--text-soft)', marginBottom: '16px' }}>
              {analysis.timeEfficiencySummary}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <BrainCircuit size={16} style={{ color: 'var(--amber)' }} />
              <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Algorithmic Correctness & Efficiency Observations</h5>
            </div>

            <ul style={{ paddingLeft: '18px', fontSize: '12px', lineHeight: 1.6, color: 'var(--text-soft)' }}>
              {analysis.efficiencyInsights.map((insight, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{insight}</li>
              ))}
            </ul>
          </div>

          {/* Targeted Practice Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="paper-card" style={{ padding: '18px', borderLeft: '4px solid var(--blue)' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Recommended Topics for {myProgress.studentName}
              </h5>
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px' }}>
                Derived from failed test cases or suboptimal edge-condition handling:
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {analysis.recommendedTopicsA.map((t, i) => (
                  <span key={i} className="lc-tag" style={{ background: 'var(--surface-2)', padding: '4px 10px', fontSize: '11px' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="paper-card" style={{ padding: '18px', borderLeft: '4px solid #e14e68' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Recommended Topics for {oppProgress.studentName}
              </h5>
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px' }}>
                Areas for further review prior to future peer duels:
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {analysis.recommendedTopicsB.map((t, i) => (
                  <span key={i} className="lc-tag" style={{ background: 'var(--surface-2)', padding: '4px 10px', fontSize: '11px' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--surface-solid)',
          borderRadius: '12px',
          border: '1px solid var(--line)',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setPage('peerBattles')}
        >
          Back to Peer Battle Hub
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleShare}
          >
            <Share2 size={13} />
            Share Result
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRematch}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={13} />
            Challenge to Rematch
          </button>
        </div>
      </div>
    </section>
  );
};
