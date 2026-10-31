import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  CloudUpload,
  FileText,
  FlaskConical,
  RotateCcw,
  ListChecks,
  Terminal,
  Check,
  CodeXml,
  Info,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { codingProblems } from '../data/codingProblems';
import { composeJsProgram, judgeResult, getProblemStarter, executeProblemTests } from '../data/codingHarness';
import { LeetCodeEditor } from '../components/LeetCodeEditor';
import { CodingLanguage } from '../types';

export const CodingWorkspaceView: React.FC = () => {
  const { activeCodingProblemId, setActiveCodingProblemId, setPage, addToast, logMistakeFromCoding } = useApp();

  const problem = codingProblems.find((p) => p.id === activeCodingProblemId) || codingProblems[0];
  const problemIndex = codingProblems.indexOf(problem);

  const [language, setLanguage] = useState<CodingLanguage>(() => {
    return (localStorage.getItem('uzone-code-lang') as CodingLanguage) || 'javascript';
  });

  const [code, setCode] = useState<string>('');
  const [leftTab, setLeftTab] = useState<'description' | 'editorial'>('description');
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeCase, setActiveCase] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    verdict: string;
    totalMs: number;
    cases: Array<{ pass: boolean; status: string; value: any; logs?: string[]; error?: string }>;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load code from localStorage or starter
  useEffect(() => {
    if (!problem) return;
    const key = `uzone-code:${problem.id}:${language}`;
    const saved = localStorage.getItem(key);
    setCode(saved !== null ? saved : getProblemStarter(problem, language));
    setResults(null);
    setConsoleTab('testcase');
    setActiveCase(0);
  }, [problem?.id, language]);

  const handleLanguageChange = (lang: CodingLanguage) => {
    setLanguage(lang);
    localStorage.setItem('uzone-code-lang', lang);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (problem) {
      const key = `uzone-code:${problem.id}:${language}`;
      localStorage.setItem(key, newCode);
    }
  };

  const handleResetStarter = () => {
    if (!problem) return;
    const starter = getProblemStarter(problem, language);
    setCode(starter);
    localStorage.removeItem(`uzone-code:${problem.id}:${language}`);
    const langNames: Record<CodingLanguage, string> = {
      javascript: 'JavaScript',
      python: 'Python 3',
      java: 'Java',
      c: 'C',
      cpp: 'C++',
      ruby: 'Ruby',
      go: 'Golang',
    };
    addToast('Code reset', `Restored ${langNames[language]} starter.`, 'rotate-ccw');
  };

  const handleNav = (dir: number) => {
    const nextIdx = problemIndex + dir;
    if (nextIdx >= 0 && nextIdx < codingProblems.length) {
      setActiveCodingProblemId(codingProblems[nextIdx].id);
    }
  };

  const handleRun = (isSubmit = false) => {
    if (!problem || isRunning) return;
    setIsRunning(true);
    setConsoleTab('result');

    setTimeout(() => {
      try {
        if (language === 'javascript') {
          // Worker-based in-browser execution
          const program = composeJsProgram(problem, code);
          const workerCode = `
            self.onmessage = function(e) {
              try {
                var f = new Function(e.data.program + "\\n;return __uzExecute;");
                var res = f()(e.data.tests);
                self.postMessage({ results: res });
              } catch(err) {
                self.postMessage({ fatal: String(err && err.message ? err.message : err) });
              }
            };
          `;
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          const workerUrl = URL.createObjectURL(blob);
          const worker = new Worker(workerUrl);

          const timeoutId = setTimeout(() => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            setResults({
              verdict: 'Time Limit Exceeded',
              totalMs: 10000,
              cases: problem.tests.map(() => ({
                pass: false,
                status: 'error',
                value: null,
                error: 'Execution exceeded 10 seconds timeout.',
              })),
            });
            setIsRunning(false);
          }, 10000);

          worker.onmessage = (e) => {
            clearTimeout(timeoutId);
            worker.terminate();
            URL.revokeObjectURL(workerUrl);

            if (e.data.fatal) {
              setResults({
                verdict: 'Runtime Error',
                totalMs: 12,
                cases: problem.tests.map(() => ({
                  pass: false,
                  status: 'error',
                  value: null,
                  error: e.data.fatal,
                })),
              });
              setIsRunning(false);
              return;
            }

            const rawResults = e.data.results || [];
            let allPassed = true;
            let totalMs = 0;

            const evaluatedCases = problem.tests.map((test, i) => {
              const res = rawResults[i] || { status: 'error', error: 'No output' };
              totalMs += res.ms || 0;
              const passed = res.status === 'ok' && judgeResult(problem, test.expected, res.value);
              if (!passed) allPassed = false;
              return {
                pass: passed,
                status: res.status,
                value: res.value,
                logs: res.logs,
                error: res.error,
              };
            });

            const verdict = allPassed
              ? 'Accepted'
              : evaluatedCases.some((c) => c.status === 'error')
              ? 'Runtime Error'
              : 'Wrong Answer';

            setResults({
              verdict,
              totalMs: Math.max(1, totalMs),
              cases: evaluatedCases,
            });
            setIsRunning(false);

            if (isSubmit) {
              const progress = JSON.parse(localStorage.getItem('uzone-coding-progress') || '{}');
              progress[problem.id] = allPassed ? 'solved' : 'attempted';
              localStorage.setItem('uzone-coding-progress', JSON.stringify(progress));
              addToast(
                allPassed ? 'Accepted!' : 'Test cases failed',
                allPassed ? 'Your solution has been saved.' : 'Check the differences in the console.',
                allPassed ? 'circle-check' : 'circle-alert'
              );
            }
          };

          worker.postMessage({ program, tests: problem.tests });
        } else {
          // Multi-language evaluation for Python, Java, C, C++, Ruby, Golang
          executeProblemTests(problem, code, language).then((outcome) => {
            const evaluatedCases = outcome.cases.map((c) => {
              let val: any = null;
              if (c.actual !== undefined) {
                try {
                  val = JSON.parse(c.actual);
                } catch {
                  val = c.actual;
                }
              }
              return {
                pass: c.pass,
                status: c.pass ? 'ok' : 'error',
                value: val,
                logs: c.logs,
                error: c.error,
              };
            });

            setResults({
              verdict: outcome.verdict,
              totalMs: outcome.totalMs,
              cases: evaluatedCases,
            });
            setIsRunning(false);

            if (isSubmit) {
              const allPassed = outcome.verdict === 'Accepted';
              const progress = JSON.parse(localStorage.getItem('uzone-coding-progress') || '{}');
              progress[problem.id] = allPassed ? 'solved' : 'attempted';
              localStorage.setItem('uzone-coding-progress', JSON.stringify(progress));
              addToast(
                allPassed ? 'Accepted!' : 'Test cases failed',
                allPassed ? `${language.toUpperCase()} solution recorded as solved.` : 'Check the differences in the console.',
                allPassed ? 'circle-check' : 'circle-alert'
              );
            }
          }).catch((err: any) => {
            setResults({
              verdict: 'Runtime Error',
              totalMs: 1,
              cases: problem.tests.map(() => ({
                pass: false,
                status: 'error',
                value: null,
                error: err.message || String(err),
              })),
            });
            setIsRunning(false);
          });
        }
      } catch (err: any) {
        setResults({
          verdict: 'Runtime Error',
          totalMs: 1,
          cases: problem.tests.map(() => ({
            pass: false,
            status: 'error',
            value: null,
            error: err.message || String(err),
          })),
        });
        setIsRunning(false);
      }
    }, 350);
  };

  const handleLogMistake = () => {
    if (!results) return;
    const failedCaseIndex = results.cases.findIndex((c) => !c.pass);
    const targetCase = failedCaseIndex >= 0 ? results.cases[failedCaseIndex] : results.cases[0];
    const targetTest = failedCaseIndex >= 0 ? problem.tests[failedCaseIndex] : problem.tests[0];
    const targetSolution = (problem.solution as any)[language] || problem.solution.javascript;

    logMistakeFromCoding({
      problemId: problem.id,
      problemTitle: problem.title,
      failureType: results.verdict === 'Runtime Error' ? 'Runtime Error' : 'Wrong Answer / Edge Case',
      failedInput: targetTest ? JSON.stringify(targetTest.args) : undefined,
      expected: targetTest ? JSON.stringify(targetTest.expected) : undefined,
      actual: targetCase ? (targetCase.error || JSON.stringify(targetCase.value)) : undefined,
      code,
      language,
      category: `DSA - ${problem.tags ? problem.tags[0] : 'Algorithms'}`,
      solution: targetSolution,
      explanation: problem.approach,
    });
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
      handleCodeChange(next);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      }, 0);
    }
  };

  const formatArgs = (args: any[]) => {
    if (problem.judge === 'design') {
      return `ops  = ${JSON.stringify(args[0])}\nargs = ${JSON.stringify(args[1])}`;
    }
    const params = problem.params.length ? problem.params : ['input'];
    return params.map((name, i) => `${name} = ${JSON.stringify(args[i])}`).join('\n');
  };

  const currentTest = problem.tests[activeCase] || problem.tests[0];
  const currentResultCase = results?.cases[activeCase];

  return (
    <div className="lc-shell">
      <header className="lc-top">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setPage('coding')}
        >
          <ArrowLeft size={14} />
          <span className="hide-mobile">Problems</span>
        </button>

        <div className="lc-title">
          <strong>
            {problemIndex + 1}. {problem.title}
          </strong>
          <span className={`lc-diff ${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm"
          disabled={problemIndex <= 0}
          onClick={() => handleNav(-1)}
          aria-label="Previous problem"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm"
          disabled={problemIndex >= codingProblems.length - 1}
          onClick={() => handleNav(1)}
          aria-label="Next problem"
        >
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          className="btn btn-sm btn-run"
          disabled={isRunning}
          onClick={() => handleRun(false)}
        >
          <Play size={13} />
          Run
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={isRunning}
          onClick={() => handleRun(true)}
        >
          <CloudUpload size={13} />
          <span className="hide-mobile">Submit</span>
        </button>
      </header>

      <div className="lc-split">
        {/* Left Pane */}
        <section className="lc-pane lc-left">
          <div className="lc-pane-tabs">
            <button
              type="button"
              className={`lc-pane-tab ${leftTab === 'description' ? 'active' : ''}`}
              onClick={() => setLeftTab('description')}
            >
              <FileText size={14} />
              Description
            </button>
            <button
              type="button"
              className={`lc-pane-tab ${leftTab === 'editorial' ? 'active' : ''}`}
              onClick={() => setLeftTab('editorial')}
            >
              <FlaskConical size={14} />
              Editorial
            </button>
          </div>

          <div className="lc-desc" id="lc-left-body">
            {leftTab === 'description' ? (
              <>
                <h2>
                  {problemIndex + 1}. {problem.title}
                </h2>
                <div className="lc-desc-meta">
                  <span className={`lc-diff ${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                  {problem.tags.map((t) => (
                    <span key={t} className="lc-tag">
                      {t}
                    </span>
                  ))}
                </div>

                {problem.description.split(/\n\n+/).map((par, i) => (
                  <p key={i}>{par}</p>
                ))}

                {problem.examples.map((e, i) => (
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
                  {problem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h2>Editorial</h2>
                <div className="lc-desc-meta">
                  <span className={`lc-diff ${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="lc-editorial-block">
                  {problem.approach.split(/\n\n+/).map((par, i) => (
                    <p key={i}>{par}</p>
                  ))}
                </div>
                <div className="lc-complexity">
                  <span>Time {problem.complexity.time}</span>
                  <span>Space {problem.complexity.space}</span>
                </div>

                {([
                  { key: 'javascript', label: 'JavaScript' },
                  { key: 'python', label: 'Python 3' },
                  { key: 'java', label: 'Java' },
                  { key: 'cpp', label: 'C++' },
                  { key: 'c', label: 'C' },
                  { key: 'ruby', label: 'Ruby' },
                  { key: 'go', label: 'Golang' },
                ] as const).map(({ key, label }) => {
                  const sol = (problem.solution as any)[key];
                  if (!sol) return null;
                  return (
                    <details key={key} className="lc-solution-code">
                      <summary>
                        <CodeXml size={13} /> Reference solution — {label}
                      </summary>
                      <pre>{sol}</pre>
                    </details>
                  );
                })}
              </>
            )}
          </div>
        </section>

        <div className="lc-gutter" aria-hidden="true"></div>

        {/* Right Pane */}
        <section className="lc-right">
          <div className="lc-pane lc-editor-pane">
            <div className="lc-editor-head">
              <select
                className="lc-lang-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as CodingLanguage)}
                aria-label="Language"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python 3</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="ruby">Ruby</option>
                <option value="go">Golang</option>
              </select>
              <span className="spacer"></span>
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={handleResetStarter}
                title="Reset to starter code"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="lc-editor-body" id="lc-editor-mount">
              <LeetCodeEditor
                value={code}
                language={language}
                onChange={(newVal) => handleCodeChange(newVal)}
              />
            </div>
          </div>

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
                    {problem.tests.map((_, i) => (
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
                  <div className="lc-io-label">Input</div>
                  <div className="lc-io">{formatArgs(currentTest.args)}</div>
                  <div className="lc-io-label">Expected</div>
                  <div className="lc-io">{JSON.stringify(currentTest.expected)}</div>
                </>
              ) : isRunning ? (
                <div className="lc-run-note">
                  <span className="lc-spin"></span>
                  Running your {language === 'python' ? 'Python' : 'JavaScript'} code against{' '}
                  {problem.tests.length} test cases…
                </div>
              ) : !results ? (
                <div className="lc-run-note">
                  <Info size={15} />
                  Run your code to see results for the {problem.tests.length} test cases.
                </div>
              ) : (
                <>
                  <div
                    className={`lc-verdict ${
                      results.verdict === 'Accepted' ? 'ok' : 'bad'
                    } lc-accepted-burst flex items-center justify-between flex-wrap gap-2`}
                  >
                    <div>
                      <strong>{results.verdict}</strong>
                      <small>
                        {language === 'python' ? 'Python 3' : 'JavaScript'} · {results.totalMs} ms
                      </small>
                    </div>

                    {results.verdict !== 'Accepted' && (
                      <button
                        type="button"
                        onClick={handleLogMistake}
                        className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs text-amber-300 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20"
                        title="Save this failed run to your Mistake Book"
                      >
                        <BookOpen size={13} />
                        <span>Log to Mistake Book</span>
                      </button>
                    )}
                  </div>

                  <div className="lc-cases">
                    {problem.tests.map((_, i) => {
                      const c = results.cases[i];
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`lc-case-chip ${activeCase === i ? 'active' : ''}`}
                          onClick={() => setActiveCase(i)}
                        >
                          <span className={`dot ${c ? (c.pass ? 'pass' : 'fail') : ''}`}></span>
                          Case {i + 1}
                        </button>
                      );
                    })}
                  </div>

                  {currentResultCase && (
                    <>
                      <div className="lc-io-label">Input</div>
                      <div className="lc-io">{formatArgs(currentTest.args)}</div>
                      {currentResultCase.status === 'ok' ? (
                        <>
                          <div className="lc-io-label">Your output</div>
                          <div className={`lc-io ${currentResultCase.pass ? 'good' : 'bad'}`}>
                            {JSON.stringify(currentResultCase.value)}
                          </div>
                          <div className="lc-io-label">Expected</div>
                          <div className="lc-io">{JSON.stringify(currentTest.expected)}</div>
                        </>
                      ) : (
                        <>
                          <div className="lc-io-label">Error</div>
                          <div className="lc-io bad">
                            {currentResultCase.error || 'Unknown error'}
                          </div>
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
    </div>
  );
};
