import React, { useState } from 'react';
import {
  Download,
  Plus,
  Search,
  ArrowUpDown,
  ListChecks,
  Clock3,
  Award,
  ArrowUpRight,
  Ellipsis,
  Pencil,
  Copy,
  Trash2,
  X,
  AlertTriangle,
  Code2,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Quiz } from '../types';

export const TeacherQuizzes: React.FC = () => {
  const {
    quizzes,
    deleteQuiz,
    duplicateQuiz,
    setDraftQuiz,
    setDraftCodingQuiz,
    setPage,
    addToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [subjectFilter, setSubjectFilter] = useState('All subjects');
  const [typeFilter, setTypeFilter] = useState<'All' | 'mcq' | 'coding'>('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteConfirmQuiz, setDeleteConfirmQuiz] = useState<Quiz | null>(null);
  const [newQuizMenuOpen, setNewQuizMenuOpen] = useState(false);

  const subjects = ['All subjects', ...Array.from(new Set(quizzes.map((q) => q.subject)))];

  const filtered = quizzes.filter((q) => {
    const matchesSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'All status' || q.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSubject =
      subjectFilter === 'All subjects' || q.subject.toLowerCase() === subjectFilter.toLowerCase();
    const matchesType =
      typeFilter === 'All' || (q.quizType || 'mcq') === typeFilter;

    return matchesSearch && matchesStatus && matchesSubject && matchesType;
  });

  const handleEdit = (quiz: Quiz) => {
    if (quiz.quizType === 'coding') {
      setDraftCodingQuiz({
        ...quiz,
        codingProblemIds: quiz.codingProblemIds ? [...quiz.codingProblemIds] : [],
        codingProblemMarks: { ...(quiz.codingProblemMarks || {}) },
      });
      setActiveMenuId(null);
      setPage('createCoding');
    } else {
      setDraftQuiz({ ...quiz, questions: quiz.questions.map((q) => ({ ...q })) });
      setActiveMenuId(null);
      setPage('create');
    }
  };

  const handleExport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quizzes, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'uzonequiz-export.json');
    dlAnchor.click();
    addToast('Results exported', 'Downloaded quiz dataset as JSON.', 'download');
  };

  return (
    <section
      className="page"
      onClick={() => {
        setActiveMenuId(null);
        setNewQuizMenuOpen(false);
      }}
    >
      <div className="page-head">
        <div>
          <span className="eyebrow">Quiz management</span>
          <h2>Build once. Inspire many.</h2>
          <p>Manage MCQ quizzes and LeetCode-style coding assessments.</p>
        </div>

        <div className="page-actions" style={{ position: 'relative' }}>
          <button type="button" className="btn btn-secondary" onClick={handleExport}>
            <Download size={14} />
            Export results
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              setNewQuizMenuOpen(!newQuizMenuOpen);
            }}
          >
            <Plus size={14} />
            New quiz
          </button>

          {newQuizMenuOpen && (
            <div
              className="context-menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                zIndex: 60,
                minWidth: '190px',
                padding: '6px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setNewQuizMenuOpen(false);
                  setPage('create');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px' }}
              >
                <CheckSquare size={14} style={{ color: 'var(--blue-2)' }} />
                <span>New MCQ Quiz</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewQuizMenuOpen(false);
                  setPage('createCoding');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px' }}
              >
                <Code2 size={14} style={{ color: 'var(--green)' }} />
                <span>New Coding Quiz</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="glass-card filters-bar"
        onClick={(e) => e.stopPropagation()}
        style={{ flexWrap: 'wrap', gap: '8px' }}
      >
        <label className="search-field">
          <Search size={15} />
          <input
            className="form-control"
            placeholder="Search quiz name or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {/* Quiz Type filter */}
        <select
          className="form-select filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          style={{ width: '135px' }}
        >
          <option value="All">All types</option>
          <option value="mcq">MCQ Quizzes</option>
          <option value="coding">Coding Quizzes</option>
        </select>

        <select
          className="form-select filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All status</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Scheduled</option>
        </select>

        <select
          className="form-select filter-select"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn-secondary btn-icon"
          aria-label="Sort quizzes"
          title="Toggle sort"
        >
          <ArrowUpDown size={15} />
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="quiz-grid">
          {filtered.map((q) => {
            const isCoding = q.quizType === 'coding';
            const statusClass = q.status.toLowerCase();
            const itemCount = isCoding
              ? q.codingProblemIds?.length || 0
              : q.questions?.length || 0;

            return (
              <article
                key={q.id}
                className="glass-card quiz-card"
                style={{ '--card-color': q.color || (isCoding ? '#60c99f' : '#4d94ff'), position: 'relative' } as any}
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
                      {isCoding ? 'Coding' : 'MCQ'}
                    </span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="card-menu"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === q.id ? null : q.id);
                      }}
                      aria-label="Quiz options"
                    >
                      <Ellipsis size={15} />
                    </button>

                    {activeMenuId === q.id && (
                      <div
                        className="context-menu"
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '100%',
                          zIndex: 50,
                          minWidth: '140px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button type="button" onClick={() => handleEdit(q)}>
                          <Pencil size={13} />
                          Edit quiz
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            duplicateQuiz(q.id);
                            setActiveMenuId(null);
                          }}
                        >
                          <Copy size={13} />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            setPage('analytics');
                          }}
                        >
                          <ArrowUpRight size={13} />
                          View analytics
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            setActiveMenuId(null);
                            setDeleteConfirmQuiz(q);
                          }}
                        >
                          <Trash2 size={13} />
                          Delete quiz
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3>{q.title}</h3>
                <p>
                  {q.topic} · Semester {q.semester}
                </p>

                <div className="quiz-meta">
                  <span>
                    {isCoding ? <Code2 size={13} /> : <ListChecks size={13} />}
                    {itemCount} {isCoding ? 'problems' : 'questions'}
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
                  <span className={`chip ${statusClass}`}>{q.status}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPage('analytics')}
                  >
                    Results <ArrowUpRight size={13} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-card empty-state" style={{ marginTop: '14px' }}>
          <div className="empty-toy" aria-hidden="true">
            <div className="empty-box"></div>
            <div className="empty-face"></div>
            <span className="empty-spark one">✦</span>
            <span className="empty-spark two">✧</span>
          </div>
          <h3>No quizzes found</h3>
          <p>Try a different search or create a fresh assessment for your class.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setPage('createCoding')}
          >
            <Plus size={14} />
            Create coding quiz
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmQuiz && (
        <div id="modal-root">
          <div
            className="modal-backdrop"
            onClick={() => setDeleteConfirmQuiz(null)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h3>Delete this quiz?</h3>
                  <p>{deleteConfirmQuiz.title}</p>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setDeleteConfirmQuiz(null)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body">
                <div
                  className="quiz-health"
                  style={{
                    borderColor: 'rgba(255,108,130,.18)',
                    background: 'rgba(255,108,130,.05)',
                  }}
                >
                  <div className="health-head">
                    This can’t be undone{' '}
                    <span style={{ color: 'var(--red)' }}>
                      <AlertTriangle size={15} />
                    </span>
                  </div>
                  <p style={{ marginTop: '8px' }}>
                    The quiz and its questions will be removed. Existing score records remain
                    available in analytics.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirmQuiz(null)}
                >
                  Keep quiz
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    deleteQuiz(deleteConfirmQuiz.id);
                    setDeleteConfirmQuiz(null);
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
