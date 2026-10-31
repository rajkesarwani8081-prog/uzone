import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Timer,
  Play,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Send,
  RotateCcw,
  ListChecks,
  Terminal,
  CheckCircle2,
  AlertCircle,
  X,
  Code2,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { codingProblems } from '../data/codingProblems';
import { CodingLanguage, ProblemSubmissionResult, CodingProblem } from '../types';
import { getProblemStarter, executeProblemTests } from '../data/codingHarness';
import { LeetCodeEditor } from '../components/LeetCodeEditor';

export const LiveBattleArena: React.FC = () => {
  const {
    activeBattleId,
    setActiveBattleId,
    battles,
    user,
    finishBattle,
    setPage,
    addToast,
  } = useApp();

  const battle = battles.find((b) => b.id === activeBattleId);

  const currentUserName = user?.name || 'Aarav Sharma';
  const isInitiator = battle?.initiatorName === currentUserName || battle?.initiatorStudentId === (user?.id || 'student-me');
  const opponentName = isInitiator ? battle?.targetName || 'Opponent' : battle?.initiatorName || 'Opponent';

  // Coding problems in this battle
  const problemIds = battle?.codingProblemIds || [];
  const problems: CodingProblem[] = problemIds
    .map((id) => codingProblems.find((p) => p.id === id))
    .filter(Boolean) as CodingProblem[];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = problems[currentIndex] || problems[0];

  // Per-problem language state
  const [languages, setLanguages] = useState<Record<string, CodingLanguage>>({});
  const currentLang = (currentProblem && languages[currentProblem.id]) || 'javascript';

  // Code state per problem and language: { [problemId]: { [lang]: code } }
  const [codeMap, setCodeMap] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem(`uzone-battle-code-${activeBattleId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Test results per problem: { [problemId]: outcome }
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeCase, setActiveCase] = useState(0);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [finishModalOpen, setFinishModalOpen] = useState(false);

  // Synchronized countdown timer for battle
  const battleDurationSec = (battle?.duration || 25) * 60;
  const [timeLeftSec, setTimeLeftSec] = useState<number>(battleDurationSec);
  const [startedAt] = useState<number>(Date.now());

  // Simulated live opponent updates
  const [oppTicker, setOppTicker] = useState<{ status: string; solvedCount: number; activeProblem: number }>({
    status: `${opponentName} entered the arena and opened Problem 1`,
    solvedCount: 0,
    activeProblem: 0,
  });

  // Autosave to localStorage on code updates
  useEffect(() => {
    if (activeBattleId) {
      localStorage.setItem(`uzone-battle-code-${activeBattleId}`, JSON.stringify(codeMap));
    }
  }, [codeMap, activeBattleId]);

  // Synchronized overall countdown timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Opponent live activity simulator during battle
  useEffect(() => {
    if (!battle) return;

    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      const totalProblems = problems.length;

      // Realistic milestone simulation for opponent
      if (elapsed > 45 && elapsed <= 90) {
        setOppTicker({
          status: `${opponentName} is running test cases on Problem 1...`,
          solvedCount: 0,
          activeProblem: 0,
        });
      } else if (elapsed > 90 && elapsed <= 180) {
        setOppTicker({
          status: `⚡ ${opponentName} passed 3/3 test cases on Problem 1!`,
          solvedCount: Math.min(1, totalProblems),
          activeProblem: 1,
        });
      } else if (elapsed > 180 && elapsed <= 300) {
        setOppTicker({
          status: `${opponentName} switched to Problem 2 [In Progress]`,
          solvedCount: Math.min(1, totalProblems),
          activeProblem: 1,
        });
      } else if (elapsed > 300) {
        setOppTicker({
          status: `🔥 ${opponentName} running final submissions...`,
          solvedCount: Math.min(2, totalProblems),
          activeProblem: 1,
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [battle?.id, startedAt, problems.length]);

  // Code getters and setters
  const getProblemCode = (probId: string, lang: CodingLanguage): string => {
    if (codeMap[probId]?.[lang] !== undefined) {
      return codeMap[probId][lang];
    }
    const prob = problems.find((p) => p.id === probId);
    if (!prob) return '';
    return getProblemStarter(prob, lang);
  };

  const setProblemCode = (probId: string, lang: CodingLanguage, newCode: string) => {
    setCodeMap((prev) => ({
      ...prev,
      [probId]: {
        ...(prev[probId] || {}),
        [lang]: newCode,
      },
    }));
  };

  const currentCode = currentProblem ? getProblemCode(currentProblem.id, currentLang) : '';
  const currentResult = currentProblem ? testResults[currentProblem.id] : null;

  const handleLanguageChange = (nextLang: CodingLanguage) => {
    if (!currentProblem) return;
    setLanguages((prev) => ({
      ...prev,
      [currentProblem.id]: nextLang,
    }));
    addToast('Language switched', `Coding in ${nextLang.toUpperCase()}`, 'code-2');
  };

  const handleResetStarter = () => {
    if (!currentProblem) return;
    const starter = getProblemStarter(currentProblem, currentLang);
    setProblemCode(currentProblem.id, currentLang, starter);
    addToast('Code reset', `Restored ${currentLang.toUpperCase()} starter template.`, 'rotate-ccw');
  };

  const handleRunCode = async () => {
    if (!currentProblem || isRunning) return;
    setIsRunning(true);
    setConsoleTab('result');

    try {
      const outcome = await executeProblemTests(currentProblem, currentCode, currentLang);
      setTestResults((prev) => ({
        ...prev,
        [currentProblem.id]: outcome,
      }));
      setIsRunning(false);

      if (outcome.verdict === 'Accepted') {
        addToast('Accepted!', `Passed all test cases in ${outcome.totalMs}ms`, 'check-circle-2');
      } else {
        addToast(outcome.verdict, `Failed test cases. Review console for details.`, 'alert-circle');
      }
    } catch (err: any) {
      setIsRunning(false);
      addToast('Execution error', err.message || 'Sandbox execution error', 'alert-circle');
    }
  };

  const handleAutoSubmit = () => {
    finalizeBattle(true);
  };

  const finalizeBattle = async (auto = false) => {
    if (!battle) return;

    // Evaluate all problems
    const userProblemResults: ProblemSubmissionResult[] = [];
    const totalMarks = battle.totalMarks;
    const marksPerProblem = Math.round(totalMarks / problems.length);

    for (let i = 0; i < problems.length; i++) {
      const prob = problems[i];
      const lang = languages[prob.id] || 'javascript';
      const code = getProblemCode(prob.id, lang);

      const outcome = await executeProblemTests(prob, code, lang);
      const passedCount = outcome.cases.filter((c) => c.pass).length;
      const earned = Math.round((passedCount / outcome.cases.length) * marksPerProblem);

      userProblemResults.push({
        problemId: prob.id,
        problemTitle: prob.title,
        difficulty: prob.difficulty,
        code,
        language: lang,
        marksEarned: earned,
        maxMarks: marksPerProblem,
        verdict: outcome.verdict,
        totalCases: outcome.cases.length,
        passedCases: passedCount,
        cases: outcome.cases,
      });
    }

    const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

    // Clear battle autosave
    localStorage.removeItem(`uzone-battle-code-${battle.id}`);

    setFinishModalOpen(false);
    finishBattle(battle.id, userProblemResults, elapsed);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerWarning = timeLeftSec < 300; // Under 5 minutes
  const timerCritical = timeLeftSec < 60; // Under 1 minute

  if (!battle || !currentProblem) {
    return (
      <div className="lc-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p>No active battle session found.</p>
        <button type="button" className="btn btn-primary" onClick={() => setPage('peerBattles')}>
          Back to Peer Battle Hub
        </button>
      </div>
    );
  }

  const currentTest = currentProblem.tests[activeCase] || currentProblem.tests[0];

  return (
    <div className="lc-shell">
      {/* Top Navigation Bar */}
      <header
        className="lc-top"
        style={{
          background: 'var(--surface-solid)',
          borderBottom: '1px solid var(--line)',
          padding: '8px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => setExitModalOpen(true)}
            title="Leave Battle"
          >
            <LogOut size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(234, 178, 52, 0.15)',
                color: 'var(--amber)',
                padding: '3px 8px',
                borderRadius: '999px',
                font: '700 9px "DM Mono", monospace',
              }}
            >
              <Swords size={12} />
              LIVE DUEL
            </span>
            <strong style={{ fontSize: '13px' }}>{battle.battleSetTitle}</strong>
          </div>
        </div>

        {/* Versus Matchup HUD */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            margin: '0 auto',
            background: 'var(--surface-2)',
            padding: '4px 14px',
            borderRadius: '999px',
            border: '1px solid var(--line)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--green)',
              }}
            />
            <strong style={{ fontSize: '11px', color: 'var(--blue)' }}>{currentUserName} (You)</strong>
          </div>

          <span style={{ font: '800 10px "DM Mono", monospace', color: 'var(--amber)' }}>VS</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#e14e68',
              }}
            />
            <strong style={{ fontSize: '11px', color: 'var(--text)' }}>{opponentName}</strong>
          </div>
        </div>

        {/* Timer & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              font: '700 13px "DM Mono", monospace',
              padding: '5px 12px',
              borderRadius: '8px',
              background: timerCritical
                ? 'rgba(225, 78, 104, 0.2)'
                : timerWarning
                ? 'rgba(234, 178, 52, 0.2)'
                : 'var(--surface-2)',
              color: timerCritical ? '#ff7b93' : timerWarning ? 'var(--amber)' : 'var(--text)',
              border: timerCritical ? '1px solid #e14e68' : '1px solid var(--line)',
            }}
          >
            <Timer size={14} />
            <span>{formatTimer(timeLeftSec)}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setFinishModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={13} />
            Submit Battle
          </button>
        </div>
      </header>

      {/* Synchronized Question Bar + Live Opponent Ticker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>
            PROBLEMS:
          </span>

          {problems.map((prob, idx) => {
            const hasResult = testResults[prob.id];
            const isAccepted = hasResult?.verdict === 'Accepted';
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={prob.id}
                type="button"
                className={`lc-chip ${isCurrent ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setActiveCase(0);
                }}
                style={{
                  fontSize: '10.5px',
                  padding: '4px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isAccepted ? (
                  <CheckCircle2 size={11} style={{ color: 'var(--green)' }} />
                ) : (
                  <span>Q{idx + 1}</span>
                )}
                <span>{prob.title.slice(0, 16)}...</span>
              </button>
            );
          })}
        </div>

        {/* Live Opponent Status Stream */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--text-soft)',
            background: 'var(--surface-solid)',
            padding: '3px 10px',
            borderRadius: '999px',
            border: '1px solid var(--line)',
          }}
        >
          <Zap size={12} style={{ color: 'var(--amber)' }} />
          <span>{oppTicker.status}</span>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="lc-split">
        {/* Left Pane: Problem Description */}
        <section className="lc-pane lc-left">
          <div className="lc-pane-tabs">
            <button type="button" className="lc-pane-tab active">
              <Code2 size={13} />
              Problem {currentIndex + 1} of {problems.length}
            </button>
          </div>

          <div className="lc-desc">
            <h2>{currentProblem.title}</h2>
            <div className="lc-desc-meta">
              <span className={`lc-diff ${currentProblem.difficulty.toLowerCase()}`}>
                {currentProblem.difficulty}
              </span>
              {currentProblem.tags.map((tag) => (
                <span key={tag} className="lc-tag">
                  {tag}
                </span>
              ))}
              <span style={{ fontSize: '10.5px', color: 'var(--muted)', marginLeft: 'auto' }}>
                Weight: {Math.round(battle.totalMarks / problems.length)} pts
              </span>
            </div>

            <p>{currentProblem.description}</p>

            {currentProblem.examples.map((ex, i) => (
              <div key={i} className="lc-example">
                <h5>Example {i + 1}:</h5>
                <pre>
                  <b>Input:</b> {ex.input}
                  {'\n'}
                  <b>Output:</b> {ex.output}
                  {ex.explanation ? `\nExplanation: ${ex.explanation}` : ''}
                </pre>
              </div>
            ))}

            <h4>Constraints:</h4>
            <ul className="lc-constraints">
              {currentProblem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </section>

        <div className="lc-gutter" aria-hidden="true" />

        {/* Right Pane: Editor & Console */}
        <section className="lc-right">
          {/* Editor Pane */}
          <div className="lc-pane lc-editor-pane">
            <div className="lc-editor-head">
              <select
                className="lc-lang-select"
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value as CodingLanguage)}
                aria-label="Language Selector"
              >
                <option value="javascript">JavaScript (ES6)</option>
                <option value="python">Python 3</option>
                <option value="java">Java 17</option>
                <option value="cpp">C++ 20</option>
              </select>

              <span className="spacer" />

              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={handleResetStarter}
                title="Reset Starter Code"
              >
                <RotateCcw size={13} />
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={isRunning}
                onClick={handleRunCode}
                style={{ marginLeft: '4px' }}
              >
                <Play size={13} />
                {isRunning ? 'Compiling...' : 'Run Code'}
              </button>
            </div>

            {/* Editor Body */}
            <div className="lc-editor-body" id="lc-editor-mount">
              <LeetCodeEditor
                value={currentCode}
                language={currentLang}
                onChange={(newVal) => setProblemCode(currentProblem.id, currentLang, newVal)}
              />
            </div>
          </div>

          {/* Console Pane */}
          <div className="lc-pane lc-console">
            <div className="lc-pane-tabs">
              <button
                type="button"
                className={`lc-pane-tab ${consoleTab === 'testcase' ? 'active' : ''}`}
                onClick={() => setConsoleTab('testcase')}
              >
                <ListChecks size={13} />
                Testcases
              </button>
              <button
                type="button"
                className={`lc-pane-tab ${consoleTab === 'result' ? 'active' : ''}`}
                onClick={() => setConsoleTab('result')}
              >
                <Terminal size={13} />
                Execution Result
              </button>
            </div>

            <div className="lc-console-body">
              {consoleTab === 'testcase' ? (
                <>
                  <div className="lc-cases">
                    {currentProblem.tests.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`lc-case-chip ${activeCase === i ? 'active' : ''}`}
                        onClick={() => setActiveCase(i)}
                      >
                        Case {i + 1}
                      </button>
                    ))}
                  </div>

                  <div className="lc-io-label">Expected Output</div>
                  <div className="lc-io">{JSON.stringify(currentTest.expected)}</div>
                </>
              ) : isRunning ? (
                <div className="lc-run-note">
                  <span className="lc-spin" />
                  Evaluating in secure sandbox against {currentProblem.tests.length} test cases...
                </div>
              ) : !currentResult ? (
                <div className="lc-run-note">
                  Click <strong>Run Code</strong> above to test your {currentLang.toUpperCase()} solution.
                </div>
              ) : (
                <>
                  <div
                    className={`lc-verdict ${
                      currentResult.verdict === 'Accepted' ? 'ok' : 'bad'
                    } lc-accepted-burst`}
                  >
                    <strong>{currentResult.verdict}</strong>
                    <small>
                      {currentLang.toUpperCase()} · {currentResult.totalMs} ms execution
                    </small>
                  </div>

                  <div className="lc-cases">
                    {currentProblem.tests.map((_, i) => {
                      const c = currentResult.cases[i];
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`lc-case-chip ${activeCase === i ? 'active' : ''}`}
                          onClick={() => setActiveCase(i)}
                        >
                          <span className={`dot ${c?.pass ? 'pass' : 'fail'}`} />
                          Case {i + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="lc-io-label">Test Input</div>
                  <div className="lc-io">{currentResult.cases[activeCase]?.input}</div>

                  <div className="lc-io-label">Your Output</div>
                  <div className="lc-io">{currentResult.cases[activeCase]?.actual || 'undefined'}</div>

                  <div className="lc-io-label">Expected</div>
                  <div className="lc-io">{currentResult.cases[activeCase]?.expected}</div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Navigation Toolbar */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'var(--surface-solid)',
          borderTop: '1px solid var(--line)',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={currentIndex === 0}
          onClick={() => {
            setCurrentIndex((prev) => Math.max(0, prev - 1));
            setActiveCase(0);
          }}
        >
          <ChevronLeft size={14} />
          Previous Problem
        </button>

        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
          Problem {currentIndex + 1} of {problems.length} · Code autosaved continuously
        </span>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={currentIndex === problems.length - 1}
          onClick={() => {
            setCurrentIndex((prev) => Math.min(problems.length - 1, prev + 1));
            setActiveCase(0);
          }}
        >
          Next Problem
          <ChevronRight size={14} />
        </button>
      </footer>

      {/* Surrender / Leave Modal */}
      {exitModalOpen && (
        <div className="modal-backdrop" onClick={() => setExitModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Leave Battle?</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
              If you leave now, your current code will be submitted as-is and evaluated against {opponentName}.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setExitModalOpen(false)}>
                Stay in Duel
              </button>
              <button type="button" className="btn btn-primary" onClick={() => finalizeBattle(false)}>
                Submit & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Battle Confirmation */}
      {finishModalOpen && (
        <div className="modal-backdrop" onClick={() => setFinishModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Submit Live Battle?</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
              All {problems.length} problems will be compiled and evaluated in the sandbox against automated test cases.
              Head-to-head metrics and performance analysis will be generated immediately.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setFinishModalOpen(false)}>
                Keep Coding
              </button>
              <button type="button" className="btn btn-primary" onClick={() => finalizeBattle(false)}>
                Confirm Final Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
