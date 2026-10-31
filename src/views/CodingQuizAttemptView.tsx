import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Play,
  Send,
  RotateCcw,
  ListChecks,
  Terminal,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  Code2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { codingProblems } from '../data/codingProblems';
import { CodingLanguage, ProblemSubmissionResult, CodingQuizResult, CodingProblem } from '../types';
import { getProblemStarter, executeProblemTests } from '../data/codingHarness';
import { LeetCodeEditor } from '../components/LeetCodeEditor';

export const CodingQuizAttemptView: React.FC = () => {
  const {
    activeQuizId,
    setActiveQuizId,
    quizzes,
    recordCodingAttempt,
    setLastCodingResult,
    setPage,
    addToast,
  } = useApp();

  const quiz = quizzes.find((q) => q.id === activeQuizId);

  // Get problem models for this quiz
  const quizProblemIds = quiz?.codingProblemIds || [];
  const quizProblems: CodingProblem[] = quizProblemIds
    .map((id) => codingProblems.find((p) => p.id === id))
    .filter(Boolean) as CodingProblem[];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = quizProblems[currentIndex] || quizProblems[0];

  // Language state per problem
  const [languages, setLanguages] = useState<Record<string, CodingLanguage>>({});
  const currentLang = (currentProblem && languages[currentProblem.id]) || 'javascript';

  // Code state per problem and language: { [problemId]: { [lang]: code } }
  const [codeMap, setCodeMap] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem(`uzone-coding-quiz-code-${activeQuizId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Test results per problem: { [problemId]: { verdict, totalMs, cases } }
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Active test case tab in console
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeCase, setActiveCase] = useState(0);

  // Overall countdown timer in seconds
  const [remaining, setRemaining] = useState(() => (quiz ? quiz.timer * 60 : 2700));
  const [startedAt] = useState(() => Date.now());

  const [isRunning, setIsRunning] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Autosave codeMap to localStorage
  useEffect(() => {
    if (activeQuizId) {
      localStorage.setItem(`uzone-coding-quiz-code-${activeQuizId}`, JSON.stringify(codeMap));
    }
  }, [codeMap, activeQuizId]);

  // Overall Countdown Timer
  useEffect(() => {
    if (!quiz) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz]);

  if (!quiz || !currentProblem) {
    return (
      <section className="page">
        <p>No active coding quiz found.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setPage('library')}
        >
          Return to library
        </button>
      </section>
    );
  }

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getProblemCode = (probId: string, lang: CodingLanguage) => {
    if (codeMap[probId]?.[lang]) return codeMap[probId][lang];
    const target = quizProblems.find((p) => p.id === probId);
    return target ? getProblemStarter(target, lang) : '';
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

  const currentCode = getProblemCode(currentProblem.id, currentLang);

  const handleLanguageSelect = (lang: CodingLanguage) => {
    setLanguages((prev) => ({ ...prev, [currentProblem.id]: lang }));
    setConsoleTab('testcase');
  };

  const handleResetCode = () => {
    const starter = getProblemStarter(currentProblem, currentLang);
    setProblemCode(currentProblem.id, currentLang, starter);
    addToast('Code reset', `Reset to default ${currentLang.toUpperCase()} template.`, 'rotate-ccw');
  };

  const handleSwitchQuestion = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= quizProblems.length) return;
    // Autosaves current code automatically because state is reactive
    setCurrentIndex(nextIndex);
    setActiveCase(0);
    setConsoleTab('testcase');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      const next = val.substring(0, start) + '    ' + val.substring(end);
      setProblemCode(currentProblem.id, currentLang, next);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleRunCode = async () => {
    if (isRunning) return;
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
        addToast('Accepted', `All ${outcome.cases.length} test cases passed!`, 'circle-check');
      } else {
        addToast(outcome.verdict, 'Check test case failure details below.', 'circle-alert');
      }
    } catch (err: any) {
      setIsRunning(false);
      addToast('Error', err.message || 'Execution failed', 'circle-alert');
    }
  };

  const handleAutoSubmit = () => {
    finishQuizSubmission(true);
  };

  const finishQuizSubmission = async (auto = false) => {
    // Grade all problems in quiz
    const marksAllocation = quiz.codingProblemMarks || {};
    let totalScore = 0;
    const problemResults: ProblemSubmissionResult[] = [];

    for (let i = 0; i < quizProblems.length; i++) {
      const prob = quizProblems[i];
      const lang = languages[prob.id] || 'javascript';
      const code = getProblemCode(prob.id, lang);
      const maxMarks = marksAllocation[prob.id] ?? Math.round(quiz.marks / quizProblems.length);

      const outcome = await executeProblemTests(prob, code, lang);
      const passedCount = outcome.cases.filter((c) => c.pass).length;
      const earnedMarks = Math.round((passedCount / outcome.cases.length) * maxMarks);

      totalScore += earnedMarks;

      problemResults.push({
        problemId: prob.id,
        problemTitle: prob.title,
        difficulty: prob.difficulty,
        code,
        language: lang,
        marksEarned: earnedMarks,
        maxMarks,
        verdict: outcome.verdict,
        totalCases: outcome.cases.length,
        passedCases: passedCount,
        cases: outcome.cases,
      });
    }

    const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const pct = Math.round((totalScore / (quiz.marks || 1)) * 100);

    const quizResult: CodingQuizResult = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      score: totalScore,
      totalMarks: quiz.marks,
      pct,
      timeTakenSec: elapsed,
      autoSubmitted: auto,
      completedAt: new Date().toISOString(),
      results: problemResults,
      rank: totalScore > 40 ? 1 : 2,
    };

    recordCodingAttempt(quizResult);
    setLastCodingResult(quizResult);

    // Clean up temporary autosave
    localStorage.removeItem(`uzone-coding-quiz-code-${activeQuizId}`);

    setSubmitModalOpen(false);
    setActiveQuizId(null);
    setPage('codingQuizResult');

    if (auto) {
      addToast('Time is up', 'Your code was automatically evaluated and submitted.', 'circle-alert');
    } else {
      addToast('Assessment submitted', `You scored ${totalScore} / ${quiz.marks}!`, 'send');
    }
  };

  const currentResult = testResults[currentProblem.id];
  const currentTest = currentProblem.tests[activeCase] || currentProblem.tests[0];
  const currentResultCase = currentResult?.cases[activeCase];

  // Number of problems with tests passed
  const solvedCount = quizProblems.filter(
    (p) => testResults[p.id]?.verdict === 'Accepted'
  ).length;

  return (
    <div className="lc-shell">
      {/* Quiz Top Header */}
      <header className="lc-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="attempt-brand" style={{ marginRight: '4px' }}>
            <span className="brand-mark" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
              U
            </span>
          </div>
          <div>
            <strong style={{ fontSize: '12px', display: 'block' }}>{quiz.title}</strong>
            <span style={{ fontSize: '9px', color: 'var(--muted)' }}>
              Coding Quiz · {quizProblems.length} Problems · {quiz.marks} Marks
            </span>
          </div>
        </div>

        {/* Question Status Tracker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            margin: '0 auto',
          }}
        >
          {quizProblems.map((prob, idx) => {
            const isCurrent = idx === currentIndex;
            const res = testResults[prob.id];
            const isPassed = res?.verdict === 'Accepted';
            const isAttempted = res && !isPassed;

            return (
              <button
                key={prob.id}
                type="button"
                className={`lc-chip ${isCurrent ? 'active' : ''}`}
                style={{
                  height: '28px',
                  padding: '0 10px',
                  fontSize: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderColor: isPassed
                    ? 'var(--green)'
                    : isAttempted
                    ? 'var(--amber)'
                    : undefined,
                  background: isPassed
                    ? 'rgba(77, 227, 163, 0.15)'
                    : isAttempted
                    ? 'rgba(255, 191, 98, 0.15)'
                    : undefined,
                }}
                onClick={() => handleSwitchQuestion(idx)}
              >
                <span>Q{idx + 1}</span>
                {isPassed ? (
                  <CheckCircle2 size={11} style={{ color: 'var(--green)' }} />
                ) : isAttempted ? (
                  <AlertCircle size={11} style={{ color: 'var(--amber)' }} />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Global Countdown Timer */}
        <div
          className="timer-pill"
          style={{
            borderColor: remaining < 300 ? 'var(--red)' : undefined,
            color: remaining < 300 ? 'var(--red)' : undefined,
          }}
        >
          <Timer size={14} />
          <span id="timer-value" style={{ fontFamily: 'DM Mono', fontWeight: 700 }}>
            {formatTimer(remaining)}
          </span>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setExitModalOpen(true)}
        >
          <LogOut size={13} />
          <span className="hide-mobile">Exit</span>
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setSubmitModalOpen(true)}
        >
          <Send size={13} />
          <span>Submit Quiz</span>
        </button>
      </header>

      {/* Split Pane */}
      <div className="lc-split">
        {/* Left Pane: Problem Description */}
        <section className="lc-pane lc-left">
          <div className="lc-pane-tabs">
            <span
              className="lc-pane-tab active"
              style={{ cursor: 'default' }}
            >
              <FileCode size={14} />
              Problem {currentIndex + 1} Description
            </span>
          </div>

          <div className="lc-desc" style={{ padding: '16px' }}>
            <h2>
              {currentIndex + 1}. {currentProblem.title}
            </h2>

            <div className="lc-desc-meta" style={{ margin: '8px 0 16px' }}>
              <span className={`lc-diff ${currentProblem.difficulty.toLowerCase()}`}>
                {currentProblem.difficulty}
              </span>
              <span className="chip" style={{ background: 'rgba(36,124,255,.15)', color: 'var(--blue-2)' }}>
                {quiz.codingProblemMarks?.[currentProblem.id] ?? 20} Marks
              </span>
              {currentProblem.tags.map((t) => (
                <span key={t} className="lc-tag">
                  {t}
                </span>
              ))}
            </div>

            {currentProblem.description.split(/\n\n+/).map((par, i) => (
              <p key={i} style={{ lineHeight: 1.6, fontSize: '10px' }}>
                {par}
              </p>
            ))}

            {currentProblem.examples.map((e, i) => (
              <div key={i} className="lc-example">
                <h5>Example {i + 1}</h5>
                <pre>
                  <b>Input:</b> {e.input}
                  {'\n'}
                  <b>Output:</b> {e.output}
                  {e.explanation && (
                    <>
                      {'\n'}
                      <b>Explanation:</b> {e.explanation}
                    </>
                  )}
                </pre>
              </div>
            ))}

            <h4>Constraints</h4>
            <ul className="lc-constraints">
              {currentProblem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </section>

        <div className="lc-gutter" aria-hidden="true"></div>

        {/* Right Pane: Code Editor & Test Console */}
        <section className="lc-right">
          {/* Editor Header */}
          <div className="lc-pane lc-editor-pane">
            <div className="lc-editor-head" style={{ padding: '6px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code2 size={15} style={{ color: 'var(--muted)' }} />
                <select
                  className="lc-lang-select"
                  value={currentLang}
                  onChange={(e) => handleLanguageSelect(e.target.value as CodingLanguage)}
                  aria-label="Language selector"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python 3</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="ruby">Ruby</option>
                  <option value="go">Golang</option>
                </select>
              </div>

              <span className="spacer"></span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleResetCode}
                  title="Reset starter template"
                >
                  <RotateCcw size={13} />
                  <span className="hide-mobile">Reset</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentIndex === 0}
                  onClick={() => handleSwitchQuestion(currentIndex - 1)}
                  title="Previous Question (Autosaves code)"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentIndex === quizProblems.length - 1}
                  onClick={() => handleSwitchQuestion(currentIndex + 1)}
                  title="Next Question (Autosaves code)"
                >
                  Next
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={isRunning}
                  onClick={handleRunCode}
                  style={{ marginLeft: '4px' }}
                >
                  <Play size={13} />
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            {/* Code Editor Body */}
            <div className="lc-editor-body" id="lc-editor-mount">
              <LeetCodeEditor
                value={currentCode}
                language={currentLang}
                onChange={(newVal) => setProblemCode(currentProblem.id, currentLang, newVal)}
              />
            </div>
          </div>

          {/* Bottom Console Panel */}
          <div className="lc-pane lc-console">
            <div className="lc-pane-tabs">
              <button
                type="button"
                className={`lc-pane-tab ${consoleTab === 'testcase' ? 'active' : ''}`}
                onClick={() => setConsoleTab('testcase')}
              >
                <ListChecks size={14} />
                Testcase
              </button>
              <button
                type="button"
                className={`lc-pane-tab ${consoleTab === 'result' ? 'active' : ''}`}
                onClick={() => setConsoleTab('result')}
              >
                <Terminal size={14} />
                Test Result
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
                  <span className="lc-spin"></span>
                  Compiling and running against {currentProblem.tests.length} test cases...
                </div>
              ) : !currentResult ? (
                <div className="lc-run-note">
                  Click <strong>Run Code</strong> above to test your {currentLang.toUpperCase()} solution
                  against sample test cases.
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
                          <span className={`dot ${c?.pass ? 'pass' : 'fail'}`}></span>
                          Case {i + 1}
                        </button>
                      );
                    })}
                  </div>

                  {currentResultCase && (
                    <>
                      <div className="lc-io-label">Input</div>
                      <div className="lc-io">{currentResultCase.input}</div>

                      {currentResultCase.status === 'Accepted' ? (
                        <>
                          <div className="lc-io-label">Your Output</div>
                          <div className="lc-io good">{currentResultCase.actual}</div>
                          <div className="lc-io-label">Expected</div>
                          <div className="lc-io">{currentResultCase.expected}</div>
                        </>
                      ) : (
                        <>
                          {currentResultCase.actual && (
                            <>
                              <div className="lc-io-label">Your Output</div>
                              <div className="lc-io bad">{currentResultCase.actual}</div>
                            </>
                          )}
                          <div className="lc-io-label">Expected Output</div>
                          <div className="lc-io">{currentResultCase.expected}</div>
                          {currentResultCase.error && (
                            <>
                              <div className="lc-io-label">Error Details</div>
                              <div className="lc-io bad">{currentResultCase.error}</div>
                            </>
                          )}
                        </>
                      )}

                      {currentResultCase.logs && currentResultCase.logs.length > 0 && (
                        <>
                          <div className="lc-io-label">Stdout</div>
                          <div className="lc-io">{currentResultCase.logs.join('\n')}</div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Submit Confirmation Modal */}
      {submitModalOpen && (
        <div id="modal-root">
          <div className="modal-backdrop" onClick={() => setSubmitModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h3>Submit Coding Quiz?</h3>
                  <p>Your code for all {quizProblems.length} problems will be evaluated.</p>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setSubmitModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <div className="quiz-health">
                  <div className="health-head">
                    Problem Progress{' '}
                    <span>
                      {solvedCount} of {quizProblems.length} tested & passed
                    </span>
                  </div>
                  <div className="health-track">
                    <i style={{ width: `${(solvedCount / quizProblems.length) * 100}%` }}></i>
                  </div>
                  <p style={{ marginTop: '8px' }}>
                    {solvedCount < quizProblems.length
                      ? `You still have ${
                          quizProblems.length - solvedCount
                        } problem(s) unverified. Submitting now will evaluate your latest code across all test cases.`
                      : 'All problems have passing solutions ready for submission!'}
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSubmitModalOpen(false)}
                >
                  Continue Coding
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => finishQuizSubmission(false)}
                >
                  <Send size={14} />
                  Submit Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Modal */}
      {exitModalOpen && (
        <div id="modal-root">
          <div className="modal-backdrop" onClick={() => setExitModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h3>Exit Coding Assessment?</h3>
                  <p>Progress on this quiz will not be scored unless submitted.</p>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setExitModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setExitModalOpen(false)}
                >
                  Resume Quiz
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setExitModalOpen(false);
                    setActiveQuizId(null);
                    setPage('library');
                  }}
                >
                  Exit without Scoring
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
