import React from 'react';
import { BookmarkCheck, X, Play, LibraryBig, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BookmarksView: React.FC = () => {
  const { bookmarks, removeQuestionBookmark, quizzes, setIntroQuizId, setPage } = useApp();

  // Find all questions matching bookmarked IDs
  const allQuestions = quizzes.flatMap((q) => q.questions);
  const bookmarkedQuestions = allQuestions.filter((q) => bookmarks.has(q.id));

  if (!bookmarkedQuestions.length) {
    return (
      <section className="page">
        <div className="page-head">
          <div>
            <span className="eyebrow">Saved practice</span>
            <h2>Practice later.</h2>
            <p>Difficult questions you save will appear here.</p>
          </div>
        </div>
        <div className="glass-card empty-state">
          <div className="empty-toy" aria-hidden="true">
            <div className="empty-box"></div>
            <div className="empty-face"></div>
            <span className="empty-spark one">✦</span>
            <span className="empty-spark two">✧</span>
          </div>
          <h3>Your practice list is empty</h3>
          <p>
            Bookmark a tricky question during a quiz and it’ll wait here for your next focused study
            session. You can also explore your private Mistake Book in My Learning Space.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPage('library')}
            >
              <LibraryBig size={14} />
              Explore quizzes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage('learningSpace')}
            >
              <BookOpen size={14} />
              My Learning Space
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Saved practice</span>
          <h2>Your tricky questions, tamed.</h2>
          <p>
            {bookmarkedQuestions.length} bookmarked question
            {bookmarkedQuestions.length === 1 ? '' : 's'} ready for focused revision.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setPage('learningSpace')}
          >
            <BookOpen size={14} />
            My Learning Space
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (quizzes[0]) setIntroQuizId(quizzes[0].id);
            }}
          >
            <Play size={14} />
            Practice all
          </button>
        </div>
      </div>

      <div className="review-list">
        {bookmarkedQuestions.map((q, i) => (
          <article key={q.id || i} className="glass-card review-item">
            <div className="review-head">
              <span
                className="review-status"
                style={{ color: 'var(--amber)', background: 'rgba(255,191,98,.08)' }}
              >
                <BookmarkCheck size={16} />
              </span>
              <div className="review-copy" style={{ flex: 1 }}>
                <h4>
                  {i + 1}. {q.question}
                </h4>
                <div className="review-answer">
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
                onClick={() => removeQuestionBookmark(q.id)}
                aria-label="Remove bookmark"
              >
                <X size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
