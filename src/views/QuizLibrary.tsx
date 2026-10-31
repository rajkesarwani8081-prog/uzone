import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Search,
  ListChecks,
  Clock3,
  Award,
  Play,
  RotateCcw,
  Code2,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuizLibrary: React.FC = () => {
  const { quizzes, quizBookmarks, toggleQuizBookmark, setIntroQuizId, searchQuery, setSearchQuery } = useApp();

  const [typeFilter, setTypeFilter] = useState<'All' | 'coding' | 'mcq'>('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [onlySaved, setOnlySaved] = useState(false);

  const published = quizzes.filter((q) => q.status === 'Published');

  const subjects = ['All', ...Array.from(new Set(published.map((q) => q.subject)))];
  const batches = ['All', ...Array.from(new Set(published.map((q) => q.batch)))];
  const semesters = ['All', ...Array.from(new Set(published.map((q) => q.semester)))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filtered = published.filter((q) => {
    const qText = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !qText ||
      q.title.toLowerCase().includes(qText) ||
      q.topic.toLowerCase().includes(qText) ||
      q.subject.toLowerCase().includes(qText);
    const matchesType = typeFilter === 'All' || (q.quizType || 'mcq') === typeFilter;
    const matchesSubject = subjectFilter === 'All' || q.subject === subjectFilter;
    const matchesBatch = batchFilter === 'All' || q.batch === batchFilter;
    const matchesSemester = semesterFilter === 'All' || q.semester === semesterFilter;
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesSaved = !onlySaved || quizBookmarks.has(q.id);
    return matchesSearch && matchesType && matchesSubject && matchesBatch && matchesSemester && matchesDiff && matchesSaved;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setSubjectFilter('All');
    setBatchFilter('All');
    setSemesterFilter('All');
    setDifficultyFilter('All');
    setOnlySaved(false);
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">All batches, one library</span>
          <h2>Revise without limits.</h2>
          <p>Practice MCQ quizzes and solve real coding assessments anytime.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className={`btn ${onlySaved ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setOnlySaved(!onlySaved)}
          >
            <Bookmark size={14} />
            {onlySaved ? 'Showing saved quizzes' : 'Saved quizzes'}
          </button>
        </div>
      </div>

      {/* Type Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`lc-chip ${typeFilter === 'All' ? 'active' : ''}`}
          onClick={() => setTypeFilter('All')}
        >
          All Assessments ({published.length})
        </button>
        <button
          type="button"
          className={`lc-chip ${typeFilter === 'coding' ? 'active' : ''}`}
          onClick={() => setTypeFilter('coding')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Code2 size={13} style={{ color: 'var(--green)' }} />
          Coding Quizzes ({published.filter((q) => q.quizType === 'coding').length})
        </button>
        <button
          type="button"
          className={`lc-chip ${typeFilter === 'mcq' ? 'active' : ''}`}
          onClick={() => setTypeFilter('mcq')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <CheckSquare size={13} style={{ color: 'var(--blue-2)' }} />
          MCQ Quizzes ({published.filter((q) => q.quizType !== 'coding').length})
        </button>
      </div>

      <div className="glass-card filters-bar" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <label className="search-field">
          <Search size={15} />
          <input
            className="form-control"
            placeholder="Search quiz name, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>

        <select
          className="form-select filter-select"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All subjects' : s}
            </option>
          ))}
        </select>

        <select
          className="form-select filter-select"
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
        >
          {batches.map((b) => (
            <option key={b} value={b}>
              {b === 'All' ? 'All batches' : `Batch ${b}`}
            </option>
          ))}
        </select>

        <select
          className="form-select filter-select"
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
        >
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              {sem === 'All' ? 'All semesters' : `Semester ${sem}`}
            </option>
          ))}
        </select>

        <select
          className="form-select filter-select"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d === 'All' ? 'All difficulty' : d}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '0 2px 13px',
        }}
      >
        <span style={{ fontSize: '9px', color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> quizzes available
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="quiz-grid" id="library-grid">
          {filtered.map((q) => {
            const isSaved = quizBookmarks.has(q.id);
            const isCoding = q.quizType === 'coding';
            const count = isCoding ? q.codingProblemIds?.length || 0 : q.questions.length;

            return (
              <article
                key={q.id}
                className="glass-card quiz-card"
                style={{ '--card-color': q.color || (isCoding ? '#60c99f' : '#4d94ff') } as any}
              >
                <div className="quiz-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="subject-badge">{q.subject.slice(0, 2).toUpperCase()}</span>
                    <span
                      className="chip"
                      style={{
                        background: isCoding ? 'rgba(77,227,163,.15)' : 'rgba(36,124,255,.15)',
                        color: isCoding ? 'var(--green)' : 'var(--blue-2)',
                        fontSize: '8px',
                        padding: '2px 7px',
                      }}
                    >
                      {isCoding ? 'Coding Quiz' : 'MCQ Quiz'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="card-menu"
                    onClick={() => toggleQuizBookmark(q.id)}
                    aria-label="Bookmark quiz"
                  >
                    {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                </div>

                <h3>{q.title}</h3>
                <p>
                  {q.topic} · Semester {q.semester}
                </p>

                <div className="quiz-meta">
                  <span>
                    {isCoding ? <Code2 size={13} /> : <ListChecks size={13} />}
                    {count} {isCoding ? 'problems' : 'questions'}
                  </span>
                  <span>
                    <Clock3 size={13} />
                    {q.timer} min
                  </span>
                  <span>
                    <Award size={13} />
                    {q.marks} marks
                  </span>
                </div>

                <div className="quiz-footer">
                  <span className={`difficulty ${q.difficulty.toLowerCase()}`}>
                    {q.difficulty}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setIntroQuizId(q.id)}
                  >
                    <Play size={13} />
                    {isCoding ? 'Attempt Coding' : 'Attempt'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <div className="empty-toy" aria-hidden="true">
            <div className="empty-box"></div>
            <div className="empty-face"></div>
            <span className="empty-spark one">✦</span>
            <span className="empty-spark two">✧</span>
          </div>
          <h3>No quiz matches yet</h3>
          <p>Clear a filter or search another topic. There’s always something new to practice.</p>
          <button type="button" className="btn btn-secondary" onClick={clearFilters}>
            <RotateCcw size={14} />
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
};
