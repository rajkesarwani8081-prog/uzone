import React, { useState } from 'react';
import {
  Eye,
  Save,
  Send,
  Check,
  Sparkles,
  SlidersHorizontal,
  CalendarClock,
  PlusCircle,
  Copy,
  Trash2,
  X,
  CalendarCheck,
} from 'lucide-react';
import { useApp, createFreshDraft } from '../context/AppContext';
import { initialTopicQuestions } from '../data/seedData';
import { QuizQuestion } from '../types';

export const QuizBuilder: React.FC = () => {
  const { draftQuiz, setDraftQuiz, saveQuiz, setPage, addToast } = useApp();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [aiTopic, setAiTopic] = useState('Object-oriented programming');
  const [aiCount, setAiCount] = useState(3);
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().slice(0, 16);
  });

  const assignedMarks = draftQuiz.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const isReady = !!(draftQuiz.title.trim() && draftQuiz.questions.length > 0 && draftQuiz.questions[0].question.trim());

  const handleFieldChange = (field: string, value: any) => {
    setDraftQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
    setDraftQuiz((prev) => {
      const nextQuestions = [...prev.questions];
      nextQuestions[index] = { ...nextQuestions[index], [field]: value };
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setDraftQuiz((prev) => {
      const nextQuestions = [...prev.questions];
      const nextOptions = [...nextQuestions[qIndex].options];
      nextOptions[optIndex] = text;
      nextQuestions[qIndex] = { ...nextQuestions[qIndex], options: nextOptions };
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleSetCorrect = (qIndex: number, optIndex: number) => {
    setDraftQuiz((prev) => {
      const nextQuestions = [...prev.questions];
      nextQuestions[qIndex] = { ...nextQuestions[qIndex], correct: optIndex };
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}-${draftQuiz.questions.length}`,
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      explanation: '',
      solution: '',
      marks: 10,
    };
    setDraftQuiz((prev) => ({ ...prev, questions: [...prev.questions, newQ] }));
    addToast('Question added', `Question ${draftQuiz.questions.length + 1} ready to edit.`, 'circle-check');
  };

  const handleDuplicateQuestion = (index: number) => {
    const target = draftQuiz.questions[index];
    const duplicated: QuizQuestion = {
      ...target,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      options: [...target.options],
    };
    setDraftQuiz((prev) => {
      const nextQuestions = [...prev.questions];
      nextQuestions.splice(index + 1, 0, duplicated);
      return { ...prev, questions: nextQuestions };
    });
    addToast('Question duplicated', `Created a copy of Question ${index + 1}.`, 'copy');
  };

  const handleDeleteQuestion = (index: number) => {
    if (draftQuiz.questions.length <= 1) {
      addToast('Cannot delete', 'A quiz must have at least one question.', 'circle-alert');
      return;
    }
    setDraftQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    addToast('Question removed', `Question ${index + 1} removed.`, 'trash-2');
  };

  const handleSave = (status: 'Published' | 'Draft' | 'Scheduled', scheduledDate?: string) => {
    if (!draftQuiz.title.trim()) {
      addToast('Title missing', 'Please provide a title for your quiz before saving.', 'circle-alert');
      return;
    }
    const finalQuiz = {
      ...draftQuiz,
      id: draftQuiz.id || `quiz-${Date.now()}`,
      status,
      date: scheduledDate || 'Just now',
    };
    saveQuiz(finalQuiz);
    setDraftQuiz(createFreshDraft());
    setPage('quizzes');
    addToast(
      status === 'Published' ? 'Quiz published!' : status === 'Scheduled' ? 'Quiz scheduled' : 'Draft saved',
      status === 'Published'
        ? 'Students can now find this quiz in the library.'
        : status === 'Scheduled'
        ? `Scheduled for ${scheduledDate}.`
        : 'Your progress has been preserved.',
      status === 'Published' ? 'send' : 'save'
    );
  };

  const handleAiGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const pool =
        initialTopicQuestions[draftQuiz.subject] ||
        initialTopicQuestions['Java'] ||
        [];
      const generated = pool.slice(0, aiCount).map((item) => ({
        id: `q-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: item.title || '',
        question: item.question.replace('Java', draftQuiz.subject || 'Java'),
        options: [...item.options],
        correct: item.correct,
        explanation: item.explanation,
        solution: item.solution || '',
        marks: 10,
      }));

      const existingNonEmpty = draftQuiz.questions.filter((q) => q.question.trim());
      setDraftQuiz((prev) => ({
        ...prev,
        questions: existingNonEmpty.length > 0 ? [...existingNonEmpty, ...generated] : generated,
      }));

      setIsGenerating(false);
      setAiModalOpen(false);
      addToast(`${generated.length} questions generated`, 'Review concepts and answers before publishing.', 'sparkles');
    }, 1000);
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">{draftQuiz.id ? 'Editing assessment' : 'New assessment'}</span>
          <h2>{draftQuiz.id ? 'Refine your quiz.' : 'Turn a topic into a challenge.'}</h2>
          <p>Set the details, add questions, and choose how students participate.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye size={14} />
            Preview
          </button>
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

      {/* Quiz Type Selector Tabs */}
      <div
        style={{
          display: 'inline-flex',
          padding: '4px',
          background: 'var(--surface-2)',
          border: '1px solid var(--line)',
          borderRadius: '13px',
          marginBottom: '18px',
          gap: '4px',
        }}
      >
        <button
          type="button"
          className="btn btn-sm btn-primary"
          style={{ height: '30px', fontSize: '9px', padding: '0 12px' }}
        >
          MCQ Quiz
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          style={{ height: '30px', fontSize: '9px', padding: '0 12px' }}
          onClick={() => setPage('createCoding')}
        >
          Coding Quiz (LeetCode-Style)
        </button>
      </div>

      <div className="stepper">
        <span className="step done">
          <i className="step-number">
            <Check size={12} />
          </i>
          Details
        </span>
        <i className="step-line"></i>
        <span className="step active">
          <i className="step-number">2</i>Questions
        </span>
        <i className="step-line"></i>
        <span className="step">
          <i className="step-number">3</i>Settings
        </span>
      </div>

      <div className="builder-layout">
        <div className="builder-main">
          <article className="glass-card panel">
            <div className="panel-head">
              <div className="panel-title">
                <h3>Quiz details</h3>
                <p>Help students know what they’re about to learn</p>
              </div>
              <span className="chip">Autosaved</span>
            </div>

            <div className="form-grid">
              <div className="field wide">
                <label>Quiz title</label>
                <input
                  className="form-control"
                  placeholder="e.g. Java Quiz — Batch 5.0"
                  value={draftQuiz.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                />
              </div>

              <div className="field">
                <label>Subject</label>
                <input
                  className="form-control"
                  placeholder="Java"
                  value={draftQuiz.subject}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                />
              </div>

              <div className="field">
                <label>Batch</label>
                <select
                  className="form-select"
                  value={draftQuiz.batch}
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
                  value={draftQuiz.semester}
                  onChange={(e) => handleFieldChange('semester', e.target.value)}
                >
                  {['1', '2', '3', '4', '5', '6', '7', '8'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Topic</label>
                <input
                  className="form-control"
                  placeholder="e.g. OOP & Collections"
                  value={draftQuiz.topic}
                  onChange={(e) => handleFieldChange('topic', e.target.value)}
                />
              </div>

              <div className="field">
                <label>Difficulty</label>
                <select
                  className="form-select"
                  value={draftQuiz.difficulty}
                  onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div className="field">
                <label>Total marks</label>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={draftQuiz.marks}
                  onChange={(e) => handleFieldChange('marks', Number(e.target.value))}
                />
              </div>

              <div className="field">
                <label>Timer (minutes)</label>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={draftQuiz.timer}
                  onChange={(e) => handleFieldChange('timer', Number(e.target.value))}
                />
              </div>

              <div className="field wide">
                <label>Instructions</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add clear attempt instructions..."
                  value={draftQuiz.instructions}
                  onChange={(e) => handleFieldChange('instructions', e.target.value)}
                />
              </div>
            </div>
          </article>

          <div className="panel-head" style={{ margin: '8px 2px 0' }}>
            <div className="panel-title">
              <h3>
                Questions{' '}
                <span style={{ color: 'var(--muted)', fontWeight: 500 }}>
                  ({draftQuiz.questions.length})
                </span>
              </h3>
              <p>Choose one correct answer for each MCQ</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setAiModalOpen(true)}
            >
              <Sparkles size={14} />
              Generate with AI
            </button>
          </div>

          {draftQuiz.questions.map((q, index) => (
            <article key={q.id || index} className="glass-card question-card">
              <div className="question-head">
                <div className="question-num">
                  <span>{String(index + 1).padStart(2, '0')}</span>Question {index + 1}
                </div>
                <div className="question-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => handleDuplicateQuestion(index)}
                    aria-label="Duplicate question"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => handleDeleteQuestion(index)}
                    aria-label="Delete question"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Question</label>
                <textarea
                  className="form-textarea"
                  placeholder="Type your question here..."
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                />
              </div>

              <div className="option-grid">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`option-input ${q.correct === oi ? 'correct' : ''}`}
                  >
                    <button
                      type="button"
                      className="option-radio"
                      onClick={() => handleSetCorrect(index, oi)}
                      aria-label={`Mark option ${String.fromCharCode(65 + oi)} correct`}
                    />
                    <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                    <input
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(index, oi, e.target.value)}
                    />
                  </label>
                ))}
              </div>

              <div className="form-grid" style={{ marginTop: '12px' }}>
                <div className="field">
                  <label>
                    Teacher explanation <span>Shown after submission</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Explain why this answer is correct..."
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>
                    Reference solution <span>Optional code snippet</span>
                  </label>
                  <textarea
                    className="form-textarea solution-editor"
                    placeholder="Paste reference solution..."
                    value={q.solution || ''}
                    onChange={(e) => handleQuestionChange(index, 'solution', e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Marks</label>
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    value={q.marks}
                    onChange={(e) => handleQuestionChange(index, 'marks', Number(e.target.value))}
                  />
                </div>
              </div>
            </article>
          ))}

          <button
            type="button"
            className="builder-add"
            onClick={handleAddQuestion}
          >
            <PlusCircle size={16} />
            Add another question
          </button>
        </div>

        <aside className="builder-side">
          <article className="glass-card panel">
            <div className="panel-head">
              <div className="panel-title">
                <h3>Quiz settings</h3>
                <p>Control the student experience</p>
              </div>
              <SlidersHorizontal size={16} />
            </div>

            <div className="setting-list">
              <div className="setting-row">
                <span className="setting-copy">
                  <strong>Leaderboard</strong>
                  <span>Show rank after submission</span>
                </span>
                <button
                  type="button"
                  className={`toggle ${draftQuiz.leaderboard ? 'active' : ''}`}
                  onClick={() => handleFieldChange('leaderboard', !draftQuiz.leaderboard)}
                  aria-label="Toggle Leaderboard"
                >
                  <i></i>
                </button>
              </div>

              <div className="setting-row">
                <span className="setting-copy">
                  <strong>Retry mode</strong>
                  <span>Allow another attempt</span>
                </span>
                <button
                  type="button"
                  className={`toggle ${draftQuiz.retry ? 'active' : ''}`}
                  onClick={() => handleFieldChange('retry', !draftQuiz.retry)}
                  aria-label="Toggle Retry mode"
                >
                  <i></i>
                </button>
              </div>

              <div className="setting-row">
                <span className="setting-copy">
                  <strong>Shuffle questions</strong>
                  <span>Different order per student</span>
                </span>
                <button
                  type="button"
                  className={`toggle ${draftQuiz.shuffle ? 'active' : ''}`}
                  onClick={() => handleFieldChange('shuffle', !draftQuiz.shuffle)}
                  aria-label="Toggle Shuffle questions"
                >
                  <i></i>
                </button>
              </div>

              <div className="setting-row">
                <span className="setting-copy">
                  <strong>Show explanations</strong>
                  <span>Reveal after submission</span>
                </span>
                <button
                  type="button"
                  className={`toggle ${draftQuiz.explanations !== false ? 'active' : ''}`}
                  onClick={() => handleFieldChange('explanations', draftQuiz.explanations === false)}
                  aria-label="Toggle Show explanations"
                >
                  <i></i>
                </button>
              </div>
            </div>
          </article>

          <div className="quiz-health">
            <div className="health-head">
              Quiz readiness <span>{isReady ? '95%' : '48%'}</span>
            </div>
            <div className="health-track">
              <i style={{ width: `${isReady ? 95 : 48}%` }}></i>
            </div>
            <p>
              {isReady
                ? 'Looking good! Add any extra questions or publish whenever you’re ready.'
                : 'Add a title and complete question details to reach full readiness.'}
            </p>
          </div>

          <article className="glass-card panel">
            <div className="panel-title">
              <h3>Quick summary</h3>
              <p>Updates as you build</p>
            </div>
            <div style={{ display: 'grid', gap: '11px', marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span style={{ color: 'var(--muted)' }}>Questions</span>
                <strong style={{ fontFamily: 'DM Mono' }}>{draftQuiz.questions.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span style={{ color: 'var(--muted)' }}>Assigned marks</span>
                <strong style={{ fontFamily: 'DM Mono' }}>{assignedMarks}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span style={{ color: 'var(--muted)' }}>Timer</span>
                <strong style={{ fontFamily: 'DM Mono' }}>{draftQuiz.timer} min</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                <span style={{ color: 'var(--muted)' }}>Difficulty</span>
                <strong style={{ fontFamily: 'DM Mono' }}>{draftQuiz.difficulty}</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={() => setScheduleModalOpen(true)}
            >
              <CalendarClock size={14} />
              Schedule instead
            </button>
          </article>
        </aside>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div id="modal-root">
          <div className="modal-backdrop" onClick={() => setPreviewOpen(false)}>
            <div className="modal wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h3>Student preview</h3>
                  <p>This is how your question will appear to learners.</p>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setPreviewOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body">
                <span className="chip scheduled">
                  {draftQuiz.difficulty} · {draftQuiz.timer} min
                </span>
                <h2 style={{ fontSize: '18px', lineHeight: 1.4, margin: '16px 0' }}>
                  {draftQuiz.questions[0]?.question || 'Your question will appear here.'}
                </h2>
                <div className="answer-list">
                  {draftQuiz.questions[0]?.options.map((opt, i) => (
                    <div key={i} className="answer-option">
                      <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
                      <span>{opt || `Option ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPreviewOpen(false)}
                >
                  Looks good
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {aiModalOpen && (
        <div id="modal-root">
          <div className="modal-backdrop" onClick={() => !isGenerating && setAiModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h3>Generate questions with AI</h3>
                  <p>Create editable MCQs from your topic.</p>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  disabled={isGenerating}
                  onClick={() => setAiModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body">
                {isGenerating ? (
                  <div style={{ padding: '38px', textAlign: 'center' }}>
                    <div className="loader-logo" style={{ margin: '0 auto' }}>
                      <span>✦</span>
                    </div>
                    <h3 style={{ margin: '18px 0 6px' }}>Crafting thoughtful questions...</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '9px' }}>
                      Balancing concepts, options, and explanations for {aiTopic}.
                    </p>
                    <div className="loader-track" style={{ margin: '18px auto 0' }}>
                      <i></i>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-grid">
                      <div className="field">
                        <label>Subject</label>
                        <input
                          className="form-control"
                          value={draftQuiz.subject}
                          onChange={(e) => handleFieldChange('subject', e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Topic</label>
                        <input
                          className="form-control"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Number of questions</label>
                        <select
                          className="form-select"
                          value={aiCount}
                          onChange={(e) => setAiCount(Number(e.target.value))}
                        >
                          <option value={3}>3 questions</option>
                          <option value={5}>5 questions</option>
                          <option value={10}>10 questions</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Difficulty</label>
                        <select
                          className="form-select"
                          value={aiDifficulty}
                          onChange={(e) => setAiDifficulty(e.target.value)}
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                    </div>
                    <div className="quiz-health" style={{ marginTop: '16px' }}>
                      <div className="health-head">
                        AI co-pilot <span>✦</span>
                      </div>
                      <p style={{ marginTop: '8px' }}>
                        Generated questions are fully editable. You can adjust options, explanations,
                        and marks before publishing.
                      </p>
                    </div>
                  </>
                )}
              </div>
              {!isGenerating && (
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAiModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAiGenerate}
                  >
                    <Sparkles size={14} />
                    Generate questions
                  </button>
                </div>
              )}
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
                  <h3>Schedule quiz</h3>
                  <p>Choose when this quiz becomes available.</p>
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
                  <label>Publish date & time</label>
                  <input
                    className="form-control"
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="setting-row" style={{ marginTop: '16px' }}>
                  <span className="setting-copy">
                    <strong>Send reminder</strong>
                    <span>Notify students 30 minutes before release</span>
                  </span>
                  <button type="button" className="toggle active">
                    <i></i>
                  </button>
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
