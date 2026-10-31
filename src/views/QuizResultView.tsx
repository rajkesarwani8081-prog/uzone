import React from 'react';
import {
  Share2,
  RotateCcw,
  Crown,
  Star,
  Check,
  X,
  Bookmark,
  BookmarkCheck,
  LibraryBig,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuizQuestion } from '../types';

export const QuizResultView: React.FC = () => {
  const { lastResult, bookmarks, toggleQuestionBookmark, setIntroQuizId, setPage, addToast } = useApp();

  if (!lastResult) {
    return (
      <section className="page">
        <div className="glass-card empty-state">
          <div className="empty-toy" aria-hidden="true">
            <div className="empty-box"></div>
            <div className="empty-face"></div>
            <span className="empty-spark one">✦</span>
            <span className="empty-spark two">✧</span>
          </div>
          <h3>No recent result</h3>
          <p>Complete a quiz to see your score, accuracy, time, and teacher explanations here.</p>
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

  const { quiz, answers, correct, score, total, time, rank } = lastResult;
  const pct = Math.round((correct / quiz.questions.length) * 100);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `I scored ${score}/${total} (${pct}%) on ${quiz.title} on UzoneQuiz!`
      );
      addToast('Score copied', 'Result summary copied to clipboard.', 'share-2');
    }
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Attempt complete</span>
          <h2>Here’s how you did.</h2>
          <p>Review every answer and turn mistakes into progress.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary" onClick={handleShare}>
            <Share2 size={14} />
            Share result
          </button>
          {quiz.retry && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIntroQuizId(quiz.id)}
            >
              <RotateCcw size={14} />
              Retry quiz
            </button>
          )}
        </div>
      </div>

      <div className="two-column">
        <article className="glass-card result-hero">
          <div className="result-crown">
            {pct >= 80 ? <Crown size={28} /> : <Star size={28} />}
          </div>
          <h2>
            {pct >= 80
              ? 'Excellent work!'
              : pct >= 60
              ? 'Nice progress!'
              : 'Keep practicing!'}
          </h2>
          <p>
            {pct >= 80
              ? 'You’ve mastered most of this topic.'
              : pct >= 60
              ? 'A quick review will make this topic even stronger.'
              : 'Review the explanations and try again when ready.'}
          </p>

          <div className="result-score" style={{ '--score': `${pct}%` } as any}>
            <strong>{pct}%</strong>
            <span>accuracy</span>
          </div>

          <div className="result-stat-grid">
            <div className="result-stat">
              <strong>
                {score}/{total}
              </strong>
              <span>Score</span>
            </div>
            <div className="result-stat">
              <strong>
                {correct}/{quiz.questions.length}
              </strong>
              <span>Correct</span>
            </div>
            <div className="result-stat">
              <strong>{formatTime(time)}</strong>
              <span>Time taken</span>
            </div>
            <div className="result-stat">
              <strong>#{rank || 2}</strong>
              <span>Leaderboard</span>
            </div>
          </div>
        </article>

        <article className="glass-card panel">
          <div className="panel-head">
            <div className="panel-title">
              <h3>Performance snapshot</h3>
              <p>Compared with other learners</p>
            </div>
            <span className="chip published">Top 12%</span>
          </div>

          <div style={{ display: 'grid', gap: '18px', marginTop: '15px' }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '9px',
                  marginBottom: '7px',
                }}
              >
                <strong>Your accuracy</strong>
                <span style={{ fontFamily: 'DM Mono', color: 'var(--muted)' }}>{pct}%</span>
              </div>
              <div className="accuracy-track" style={{ width: '100%', height: '6px' }}>
                <i style={{ width: `${pct}%`, background: '#4d94ff' }}></i>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '9px',
                  marginBottom: '7px',
                }}
              >
                <strong>Class average</strong>
                <span style={{ fontFamily: 'DM Mono', color: 'var(--muted)' }}>76%</span>
              </div>
              <div className="accuracy-track" style={{ width: '100%', height: '6px' }}>
                <i style={{ width: '76%', background: '#55d9ff' }}></i>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '9px',
                  marginBottom: '7px',
                }}
              >
                <strong>Top scorer</strong>
                <span style={{ fontFamily: 'DM Mono', color: 'var(--muted)' }}>96%</span>
              </div>
              <div className="accuracy-track" style={{ width: '100%', height: '6px' }}>
                <i style={{ width: '96%', background: '#4de3a3' }}></i>
              </div>
            </div>
          </div>

          <div className="quiz-health" style={{ marginTop: '21px' }}>
            <div className="health-head">
              Learning tip <span>✦</span>
            </div>
            <p style={{ marginTop: '8px' }}>
              Review the questions marked incorrect below. You can bookmark them directly into your
              practice list for focused revision.
            </p>
          </div>
        </article>
      </div>

      <div className="panel-head" style={{ margin: '24px 2px 12px' }}>
        <div className="panel-title">
          <h3>Answer review</h3>
          <p>Teacher explanations are shown for every question</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setPage('bookmarks')}
        >
          <Bookmark size={14} />
          Practice saved
        </button>
      </div>

      <div className="review-list">
        {quiz.questions.map((q: QuizQuestion, i: number) => {
          const userAns = answers[q.id];
          const right = userAns === q.correct;
          const isMarked = bookmarks.has(q.id);

          return (
            <article key={q.id || i} className="glass-card review-item">
              <div className="review-head">
                <span className={`review-status ${right ? 'correct' : 'wrong'}`}>
                  {right ? <Check size={16} /> : <X size={16} />}
                </span>

                <div className="review-copy" style={{ flex: 1 }}>
                  <h4>
                    {i + 1}. {q.question}
                  </h4>
                  <div className="review-answer">
                    Your answer:{' '}
                    <b style={{ color: right ? 'var(--green)' : 'var(--red)' }}>
                      {userAns === undefined ? 'Not answered' : q.options[userAns]}
                    </b>
                    <br />
                    Correct answer: <b>{q.options[q.correct]}</b>
                  </div>
                  <div className="explanation">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                  {q.solution && (
                    <details className="solution-details">
                      <summary>View reference solution</summary>
                      <pre className="solution-code">{q.solution}</pre>
                    </details>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => toggleQuestionBookmark(q.id)}
                  aria-label="Bookmark question"
                >
                  {isMarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
