import React, { useState } from 'react';
import {
  Save,
  Send,
  CalendarClock,
  Search,
  Check,
  Plus,
  Trash2,
  CalendarCheck,
  X,
  SlidersHorizontal,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { useApp, createFreshCodingDraft } from '../context/AppContext';
import { codingProblems } from '../data/codingProblems';
import { CodingProblem } from '../types';

export const CodingQuizBuilder: React.FC = () => {
  const { draftCodingQuiz, setDraftCodingQuiz, saveQuiz, setPage, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [previewProblem, setPreviewProblem] = useState<CodingProblem | null>(null);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().slice(0, 16);
  });

  // Extract all distinct tags/topics from codingProblems
  const allTopics = ['All', ...Array.from(new Set(codingProblems.flatMap((p) => p.tags))).sort()];

  const selectedIds = draftCodingQuiz.codingProblemIds || [];
  const marksMap = draftCodingQuiz.codingProblemMarks || {};

  // Compute total marks from selected problems
  const totalMarks = selectedIds.reduce((sum, id) => sum + (marksMap[id] ?? 20), 0);

  const filteredProblems = codingProblems.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
    const matchesTopic = topicFilter === 'All' || p.tags.includes(topicFilter);
    const matchesDiff = diffFilter === 'All' || p.difficulty === diffFilter;
    return matchesSearch && matchesTopic && matchesDiff;
  });

  const handleFieldChange = (field: string, value: any) => {
    setDraftCodingQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleSelectProblem = (id: string) => {
    setDraftCodingQuiz((prev) => {
      const current = prev.codingProblemIds || [];
      const marks = { ...(prev.codingProblemMarks || {}) };
      if (current.includes(id)) {
        const next = current.filter((x) => x !== id);
        delete marks[id];
        return { ...prev, codingProblemIds: next, codingProblemMarks: marks, marks: totalMarks };
      } else {
        const next = [...current, id];
        marks[id] = 20; // default 20 marks
        return { ...prev, codingProblemIds: next, codingProblemMarks: marks, marks: totalMarks + 20 };
      }
    });
  };

  const handleMarkChange = (id: string, value: number) => {
    setDraftCodingQuiz((prev) => {
      const marks = { ...(prev.codingProblemMarks || {}) };
      marks[id] = Math.max(1, value);
      const newTotal = (prev.codingProblemIds || []).reduce((s, x) => s + (marks[x] || 20), 0);
      return { ...prev, codingProblemMarks: marks, marks: newTotal };
    });
  };

  const handleRemoveProblem = (id: string) => {
    handleToggleSelectProblem(id);
    addToast('Problem removed', 'Removed from this coding quiz.', 'trash-2');
  };

  const handleSave = (status: 'Published' | 'Draft' | 'Scheduled', scheduledDate?: string) => {
    if (!draftCodingQuiz.title.trim()) {
      addToast('Title missing', 'Provide an assessment title before saving.', 'circle-alert');
      return;
    }
    if (!selectedIds.length) {
      addToast('No problems selected', 'Add at least one coding problem from the bank.', 'circle-alert');
      return;
    }

    const finalQuiz = {
      ...draftCodingQuiz,
      id: draftCodingQuiz.id || `coding-quiz-${Date.now()}`,
      status,
      quizType: 'coding' as const,
      marks: totalMarks || 60,
      date: scheduledDate || 'Just now',
    };

    saveQuiz(finalQuiz);
    setDraftCodingQuiz(createFreshCodingDraft());
    setPage('quizzes');
    addToast(
      status === 'Published'
        ? 'Coding Quiz published!'
        : status === 'Scheduled'
        ? 'Coding Quiz scheduled'
        : 'Draft saved',
      status === 'Published'
        ? 'Students can now attempt this LeetCode-style challenge in the library.'
        : status === 'Scheduled'
        ? `Scheduled for ${scheduledDate}.`
        : 'Draft saved in your quizzes list.',
      status === 'Published' ? 'send' : 'save'
    );
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Coding Quiz Builder</span>
          <h2>Craft a LeetCode-style assessment.</h2>
          <p>Select problems from the question bank, set marks, timer, and scheduling.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSave('Draft')}
          >
            <Save size={14} />
            Save draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSave('Published')}
          >
            <Send size={14} />
            Publish quiz
          </button>
        </div>
      </div>

      <div className="stepper">
        <span className="step done">
          <i className="step-number">
            <Check size={12} />
          </i>
          Quiz Details
        </span>
        <i className="step-line"></i>
        <span className="step active">
          <i className="step-number">2</i>Select Problems ({selectedIds.length})
        </span>
        <i className="step-line"></i>
        <span className="step">
          <i className="step-number">3</i>Settings & Schedule
        </span>
      </div>

      <div className="builder-layout">
        <div className="builder-main">
          {/* Quiz Details Panel */}
          <article className="glass-card panel">
            <div className="panel-head">
              <div className="panel-title">
                <h3>Assessment parameters</h3>
                <p>Define target classroom, duration and scope</p>
              </div>
              <span className="chip" style={{ background: 'rgba(96,201,159,.15)', color: 'var(--green)' }}>
                Coding Quiz
              </span>
            </div>

            <div className="form-grid">
              <div className="field wide">
                <label>Quiz title</label>
                <input
                  className="form-control"
                  placeholder="e.g. Data Structures Midterm Coding Exam"
                  value={draftCodingQuiz.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                />
              </div>

              <div className="field">
                <label>Subject</label>
                <input
                  className="form-control"
                  placeholder="Data Structures & Algorithms"
                  value={draftCodingQuiz.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                />
              </div>

              <div className="field">
                <label>Batch</label>
                <select
                  className="form-select"
                  value={draftCodingQuiz.batch}
                  onChange={(e) => handleFieldChange('batch', e.target.value)}
                >
                  {['5.0', '4.0', '3.0', '2.0'].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Semester</label>
                <select
                  className="form-select"
                  value={draftCodingQuiz.semester}
                  onChange={(e) => handleFieldChange('semester', e.target.value)}
                >
                  {['1', '2', '3', '4', '5', '6', '7', '8'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Primary topic</label>
                <input
                  className="form-control"
                  placeholder="e.g. Arrays, Trees & DP"
                  value={draftCodingQuiz.topic}
                  onChange={(e) => handleFieldChange('topic', e.target.value)}
                />
              </div>

              <div className="field">
                <label>Difficulty level</label>
                <select
                  className="form-select"
                  value={draftCodingQuiz.difficulty}
                  onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div className="field">
                <label>Overall Duration (minutes)</label>
                <input
                  className="form-control"
                  type="number"
                  min="5"
                  max="180"
                  value={draftCodingQuiz.timer}
                  onChange={(e) => handleFieldChange('timer', Number(e.target.value))}
                />
              </div>

              <div className="field wide">
                <label>Instructions for students</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe language choices, submission policy, etc."
                  value={draftCodingQuiz.instructions}
                  onChange={(e) => handleFieldChange('instructions', e.target.value)}
                />
              </div>
            </div>
          </article>

          {/* Question Bank Picker */}
          <article className="glass-card panel" style={{ marginTop: '14px' }}>
            <div className="panel-head">
              <div className="panel-title">
                <h3>Coding Question Bank</h3>
                <p>Pick problems across topics and difficulties</p>
              </div>
              <span style={{ fontSize: '9px', color: 'var(--muted)' }}>
                {selectedIds.length} problem{selectedIds.length === 1 ? '' : 's'} added
              </span>
            </div>

            <div className="glass-card filters-bar" style={{ margin: '0 0 14px' }}>
              <label className="search-field">
                <Search size={15} />
                <input
                  className="form-control"
                  placeholder="Search problem name or tag..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              <select
                className="form-select filter-select"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
              >
                {allTopics.map((t) => (
                  <option key={t} value={t}>
                    {t === 'All' ? 'All topics' : t}
                  </option>
                ))}
              </select>

              <select
                className="form-select filter-select"
                value={diffFilter}
                onChange={(e) => setDiffFilter(e.target.value)}
              >
                <option value="All">All difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div style={{ display: 'grid', gap: '8px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredProblems.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="glass-card"
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderColor: isSelected ? 'rgba(77, 227, 163, 0.4)' : undefined,
                      background: isSelected ? 'rgba(77, 227, 163, 0.05)' : undefined,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`lc-diff ${p.difficulty.toLowerCase()}`}>
                          {p.difficulty}
                        </span>
                        <strong style={{ fontSize: '11px' }}>{p.title}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {p.tags.map((t) => (
                          <span key={t} className="lc-tag" style={{ fontSize: '8px' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPreviewProblem(p)}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          background: isSelected ? 'var(--green)' : undefined,
                          borderColor: isSelected ? 'var(--green)' : undefined,
                          color: isSelected ? '#06080c' : undefined,
                        }}
                        onClick={() => handleToggleSelectProblem(p.id)}
                      >
                        {isSelected ? (
                          <>
                            <Check size={12} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={12} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>

        {/* Builder Sidebar */}
        <aside className="builder-side">
          <article className="glass-card panel">
            <div className="panel-head">
              <div className="panel-title">
                <h3>Selected Problems</h3>
                <p>Set marks per question</p>
              </div>
              <Code2 size={16} />
            </div>

            {selectedIds.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '9px', padding: '12px 0' }}>
                No problems selected yet. Use the bank on the left to add coding problems to this quiz.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {selectedIds.map((id, index) => {
                  const prob = codingProblems.find((p) => p.id === id);
                  if (!prob) return null;
                  const marks = marksMap[id] ?? 20;
                  return (
                    <div
                      key={id}
                      className="glass-card"
                      style={{ padding: '10px 12px', background: 'var(--surface-2)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--blue-2)' }}>
                          Q{index + 1} · {prob.difficulty}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleRemoveProblem(id)}
                          aria-label="Remove"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <strong style={{ fontSize: '10px', display: 'block', marginBottom: '8px' }}>
                        {prob.title}
                      </strong>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '8px', color: 'var(--muted)' }}>Marks allocated:</span>
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: '65px', height: '28px', padding: '0 8px', fontSize: '9px' }}
                          min="5"
                          max="100"
                          value={marks}
                          onChange={(e) => handleMarkChange(id, Number(e.target.value))}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <article className="glass-card panel" style={{ marginTop: '14px' }}>
            <div className="panel-head">
              <div className="panel-title">
                <h3>Quiz Settings</h3>
                <p>Submission rules</p>
              </div>
              <SlidersHorizontal size={15} />
            </div>

            <div className="setting-list">
              <div className="setting-row">
                <span className="setting-copy">
                  <strong>Leaderboard</strong>
                  <span>Publish ranked scores</span>
                </span>
                <button
                  type="button"
                  className={`toggle ${draftCodingQuiz.leaderboard ? 'active' : ''}`}
                  onClick={() => handleFieldChange('leaderboard', !draftCodingQuiz.leaderboard)}
                >
                  <i></i>
                </button>
              </div>

              <div className="setting-row">
                <span className="setting-copy">
                  <strong>Retry mode</strong>
                  <span>Allow reattempt</span>
                </span>
                <button
                  type="button"
                  className={`toggle ${draftCodingQuiz.retry ? 'active' : ''}`}
                  onClick={() => handleFieldChange('retry', !draftCodingQuiz.retry)}
                >
                  <i></i>
                </button>
              </div>
            </div>
          </article>

          <article className="glass-card panel" style={{ marginTop: '14px' }}>
            <div className="panel-title">
              <h3>Summary</h3>
              <p>Live calculated</p>
            </div>
            <div style={{ display: 'grid', gap: '9px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span style={{ color: 'var(--muted)' }}>Type</span>
                <strong style={{ color: 'var(--green)' }}>Coding Quiz</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span style={{ color: 'var(--muted)' }}>Selected problems</span>
                <strong style={{ fontFamily: 'DM Mono' }}>{selectedIds.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span style={{ color: 'var(--muted)' }}>Total marks</span>
                <strong style={{ fontFamily: 'DM Mono' }}>{totalMarks}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span style={{ color: 'var(--muted)' }}>Total timer</span>
                <strong style={{ fontFamily: 'DM Mono' }}>{draftCodingQuiz.timer} min</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '14px' }}
              onClick={() => setScheduleModalOpen(true)}
            >
              <CalendarClock size={14} />
              Schedule release
            </button>
          </article>
        </aside>
      </div>

      {/* Problem Preview Modal */}
      {previewProblem && (
        <div id="modal-root">
          <div className="modal-backdrop" onClick={() => setPreviewProblem(null)}>
            <div className="modal wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h3>{previewProblem.title}</h3>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span className={`lc-diff ${previewProblem.difficulty.toLowerCase()}`}>
                      {previewProblem.difficulty}
                    </span>
                    {previewProblem.tags.map((t) => (
                      <span key={t} className="lc-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setPreviewProblem(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '10px' }}>
                  {previewProblem.description}
                </p>

                <h4 style={{ margin: '14px 0 6px', fontSize: '11px' }}>Example 1</h4>
                <pre style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '8px', fontSize: '9px' }}>
                  Input: {previewProblem.examples[0]?.input}
                  {'\n'}Output: {previewProblem.examples[0]?.output}
                </pre>

                <h4 style={{ margin: '14px 0 6px', fontSize: '11px' }}>Test cases ({previewProblem.tests.length})</h4>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {previewProblem.tests.map((t, i) => (
                    <div key={i} style={{ fontSize: '9px', color: 'var(--muted)' }}>
                      Case {i + 1}: expected {JSON.stringify(t.expected)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPreviewProblem(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (!selectedIds.includes(previewProblem.id)) {
                      handleToggleSelectProblem(previewProblem.id);
                    }
                    setPreviewProblem(null);
                  }}
                >
                  <CheckCircle2 size={14} />
                  {selectedIds.includes(previewProblem.id) ? 'Already Added' : 'Add to Quiz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div id="modal-root">
          <div className="modal-backdrop" onClick={() => setScheduleModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h3>Schedule Coding Quiz</h3>
                  <p>Choose when this coding assessment becomes accessible to learners.</p>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setScheduleModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body">
                <div className="field">
                  <label>Release date & time</label>
                  <input
                    className="form-control"
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setScheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setScheduleModalOpen(false);
                    handleSave('Scheduled', scheduleDate);
                  }}
                >
                  <CalendarCheck size={14} />
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
