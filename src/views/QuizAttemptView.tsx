import React, { useState, useEffect } from 'react';
import {
  Timer,
  LogOut,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttemptRecord } from '../types';

export const QuizAttemptView: React.FC = () => {
  const {
    activeQuizId,
    setActiveQuizId,
    quizzes,
    recordAttempt,
    setLastResult,
    setPage,
    bookmarks,
    toggleQuestionBookmark,
    addToast,
  } = useApp();

  const quiz = quizzes.find((q) => q.id === activeQuizId);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [attemptBookmarks, setAttemptBookmarks] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(() => (quiz ? quiz.timer * 60 : 1200));
  const [startedAt] = useState(() => Date.now());

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  useEffect(() => {
    if (!quiz) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz]);

  if (!quiz) {
    return (
      <section className="page">
        <p>No active quiz selected.</p>
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

  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = total - answeredCount;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
  };

  const toggleBookmarkCurrent = () => {
    const isBookmarked = attemptBookmarks.has(q.id);
    const next = new Set(attemptBookmarks);
    if (isBookmarked) {
      next.delete(q.id);
    } else {
      next.add(q.id);
      toggleQuestionBookmark(q.id);
    }
    setAttemptBookmarks(next);
  };

  const handleFinish = (auto = false) => {
    let correct = 0;
    let score = 0;

    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.correct) {
        correct++;
        score += Number(question.marks || 10);
      }
    });

    const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

    const record: AttemptRecord = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      total: quiz.marks,
      correct,
      totalQuestions: total,
      timeTakenSec: elapsed,
      when: new Date().toISOString(),
      answers,
      bookmarked: [...attemptBookmarks],
    };

    recordAttempt(record);

    setLastResult({
      quiz,
      answers,
      correct,
      score,
      total: quiz.marks,
      time: elapsed,
      auto,
      rank: 2,
    });

    setSubmitModalOpen(false);
    setActiveQuizId(null);
    setPage('result');

    if (auto) {
      addToast('Time is up', 'Your saved answers were submitted automatically.', 'circle-alert');
    } else {
      addToast('Quiz submitted', `Scored ${score} / ${quiz.marks}!`, 'send');
    }
  };

  return (
    <div className="attempt-shell">
      <header className="attempt-top">
        <div className="attempt-brand">
          <span className="brand-mark">U</span>
          <span>
            Uzone<span style={{ color: 'var(--blue-2)' }}>Quiz</span>
          </span>
        </div>

        <div className="attempt-info">
          <strong>{quiz.title}</strong>
          <span>
            {quiz.topic} · {total} questions
          </span>
        </div>

        <div className="attempt-progress">
          <div className="attempt-progress-track">
            <i style={{ width: `${(answeredCount / total) * 100}%` }}></i>
          </div>
          <small>
            {answeredCount} of {total} answered
          </small>
        </div>

        <div className="timer-pill">
          <Timer size={14} />
          <span id="timer-value">{formatTime(remaining)}</span>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setExitModalOpen(true)}
        >
          <LogOut size={13} />
          <span className="hide-mobile">Exit</span>
        </button>
      </header>

      <div className="attempt-layout">
        <main className="question-stage">
          <div className="question-stage-inner">
            <div className="question-tag">
              <span>
                Question {current + 1} of {total}
              </span>
              {q.title && <span className="chip">{q.title}</span>}
              <span className="marks">{q.marks} marks</span>
            </div>

            <h1 className="question-title">{q.question}</h1>

            <div className="answer-list">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className={`answer-option ${answers[q.id] === i ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(i)}
                >
                  <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            <div className="question-bottom">
              <button
                type="button"
                className={`btn ${
                  attemptBookmarks.has(q.id) || bookmarks.has(q.id) ? 'btn-secondary' : 'btn-ghost'
                }`}
                onClick={toggleBookmarkCurrent}
              >
                {attemptBookmarks.has(q.id) || bookmarks.has(q.id) ? (
                  <>
                    <BookmarkCheck size={14} /> Bookmarked
                  </>
                ) : (
                  <>
                    <Bookmark size={14} /> Bookmark
                  </>
                )}
              </button>

              <div className="page-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={current === 0}
                  onClick={() => setCurrent((prev) => Math.max(0, prev - 1))}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>

                {current === total - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setSubmitModalOpen(true)}
                  >
                    Submit quiz <Send size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCurrent((prev) => Math.min(total - 1, prev + 1))}
                  >
                    Next <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        <aside className="attempt-nav">
          <h3>Question navigator</h3>
          <p>Jump to any question before submitting.</p>

          <div className="number-grid">
            {quiz.questions.map((item, i) => {
              const isCurrent = i === current;
              const isAnswered = answers[item.id] !== undefined;
              const isMarked = attemptBookmarks.has(item.id) || bookmarks.has(item.id);
              return (
                <button
                  key={item.id || i}
                  type="button"
                  className={`q-number ${isCurrent ? 'current' : ''} ${
                    isAnswered ? 'answered' : ''
                  } ${isMarked ? 'bookmarked' : ''}`}
                  onClick={() => setCurrent(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="attempt-legend">
            <span>
              <i className="blue"></i>Current question
            </span>
            <span>
              <i className="soft"></i>Answered
            </span>
            <span>
              <i></i>Not answered
            </span>
          </div>

          <div className="quiz-health" style={{ marginTop: '22px' }}>
            <div className="health-head">
              Autosave{' '}
              <span>
                <CheckCircle size={15} />
              </span>
            </div>
            <p style={{ marginTop: '8px' }}>
              Every answer is saved on this device. You can navigate freely back and forth.
            </p>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {submitModalOpen && (
        <div id="modal-root">
          <div className="modal-backdrop" onClick={() => setSubmitModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h3>Submit this quiz?</h3>
                  <p>Your answers will be evaluated immediately.</p>
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
                    Attempt summary{' '}
                    <span>
                      {answeredCount}/{total} answered
                    </span>
                  </div>
                  <div className="health-track">
                    <i style={{ width: `${(answeredCount / total) * 100}%` }}></i>
                  </div>
                  <p>
                    {unansweredCount > 0
                      ? `You still have ${unansweredCount} unanswered question${
                          unansweredCount === 1 ? '' : 's'
                        }. You can review before submitting.`
                      : 'Everything is answered! Nice work — you are ready to view your rank.'}
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSubmitModalOpen(false)}
                >
                  Review answers
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleFinish(false)}
                >
                  <Send size={14} />
                  Submit now
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
                  <h3>Exit this attempt?</h3>
                  <p>Progress on this quiz will not be recorded unless submitted.</p>
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
                  Keep practicing
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
                  Exit without submitting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
