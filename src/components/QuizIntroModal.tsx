import React from 'react';
import {
  X,
  ListChecks,
  Clock3,
  Award,
  Trophy,
  EyeOff,
  RotateCcw,
  ShieldCheck,
  MessageCircleMore,
  Play,
  Code2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuizIntroModal: React.FC = () => {
  const { introQuizId, setIntroQuizId, quizzes, setActiveQuizId, setPage } = useApp();

  if (!introQuizId) return null;

  const quiz = quizzes.find((q) => q.id === introQuizId);
  if (!quiz) return null;

  const isCoding = quiz.quizType === 'coding';
  const problemCount = isCoding
    ? quiz.codingProblemIds?.length || 0
    : quiz.questions?.length || 0;

  const handleStart = () => {
    setActiveQuizId(quiz.id);
    setIntroQuizId(null);
    if (isCoding) {
      setPage('codingQuizAttempt');
    } else {
      setPage('attempt');
    }
  };

  return (
    <div id="modal-root">
      <div
        className="modal-backdrop"
        onClick={() => setIntroQuizId(null)}
        aria-hidden="true"
      >
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3>{quiz.title}</h3>
                <span
                  className="chip"
                  style={{
                    background: isCoding ? 'rgba(77,227,163,.15)' : 'rgba(36,124,255,.15)',
                    color: isCoding ? 'var(--green)' : 'var(--blue-2)',
                    fontSize: '8px',
                  }}
                >
                  {isCoding ? 'Coding Quiz' : 'MCQ Quiz'}
                </span>
              </div>
              <p>
                {quiz.topic} · Batch {quiz.batch}
              </p>
            </div>
            <button
              type="button"
              className="modal-close"
              onClick={() => setIntroQuizId(null)}
              aria-label="Close intro"
            >
              <X size={16} />
            </button>
          </div>

          <div className="modal-body">
            <div
              className="stats-grid"
              style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '0 0 18px' }}
            >
              <div className="result-stat" style={{ textAlign: 'center' }}>
                {isCoding ? <Code2 size={18} /> : <ListChecks size={18} />}
                <strong style={{ marginTop: '6px' }}>{problemCount}</strong>
                <span>{isCoding ? 'Problems' : 'Questions'}</span>
              </div>
              <div className="result-stat" style={{ textAlign: 'center' }}>
                <Clock3 size={18} />
                <strong style={{ marginTop: '6px' }}>{quiz.timer} min</strong>
                <span>Total Duration</span>
              </div>
              <div className="result-stat" style={{ textAlign: 'center' }}>
                <Award size={18} />
                <strong style={{ marginTop: '6px' }}>{quiz.marks}</strong>
                <span>Marks</span>
              </div>
            </div>

            <div className="quiz-health">
              <div className="health-head">
                Before you begin <span>{quiz.difficulty}</span>
              </div>
              <p style={{ marginTop: '10px' }}>
                {isCoding
                  ? 'This is a timed coding challenge. Write solutions in Java, Python, C++, or JavaScript. Your code is automatically saved when switching problems and will be evaluated upon submission or timer expiration.'
                  : 'Read every question carefully. Your timer starts immediately, answers are autosaved, and you can navigate between questions before submitting.'}
              </p>
            </div>

            {isCoding && (
              <div
                style={{
                  margin: '14px 0 0',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line)',
                  fontSize: '9px',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                  Supported Languages:
                </div>
                <div style={{ display: 'flex', gap: '8px', color: 'var(--blue-2)' }}>
                  <span>• Java</span>
                  <span>• Python 3</span>
                  <span>• C++</span>
                  <span>• JavaScript</span>
                </div>
              </div>
            )}

            <div className="setting-list" style={{ marginTop: '17px' }}>
              <div className="setting-row">
                <span className="setting-copy">
                  <strong>Leaderboard</strong>
                  <span>{quiz.leaderboard ? 'Enabled' : 'Hidden'}</span>
                </span>
                <span className="stat-icon" style={{ width: '28px', height: '28px' }}>
                  {quiz.leaderboard ? <Trophy size={14} /> : <EyeOff size={14} />}
                </span>
              </div>

              <div className="setting-row">
                <span className="setting-copy">
                  <strong>Retry mode</strong>
                  <span>{quiz.retry ? 'One retry allowed' : 'Single attempt only'}</span>
                </span>
                <span className="stat-icon" style={{ width: '28px', height: '28px' }}>
                  {quiz.retry ? <RotateCcw size={14} /> : <ShieldCheck size={14} />}
                </span>
              </div>

              <div className="setting-row">
                <span className="setting-copy">
                  <strong>Automatic Evaluation</strong>
                  <span>Full test case runner & immediate scoring</span>
                </span>
                <span className="stat-icon" style={{ width: '28px', height: '28px' }}>
                  <MessageCircleMore size={14} />
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIntroQuizId(null)}
            >
              Maybe later
            </button>
            <button type="button" className="btn btn-primary" onClick={handleStart}>
              <Play size={14} />
              Start assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
