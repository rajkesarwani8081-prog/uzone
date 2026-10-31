import React, { useState } from 'react';
import {
  Swords,
  Plus,
  Search,
  Clock,
  Award,
  Trash2,
  Edit3,
  CheckCircle,
  Eye,
  X,
  Code2,
  Users,
  Flame,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BattleSet } from '../types';
import { codingProblems } from '../data/codingProblems';

export const TeacherBattleSets: React.FC = () => {
  const { battleSets, saveBattleSet, deleteBattleSet, battles, addToast } = useApp();

  const [batchFilter, setBatchFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewProblemId, setPreviewProblemId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Data Structures');
  const [batch, setBatch] = useState('5.0');
  const [semester, setSemester] = useState('4');
  const [topic, setTopic] = useState('Arrays & Two Pointers');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [duration, setDuration] = useState(25);
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>(['lc-easy-two-sum', 'lc-easy-valid-parentheses']);
  const [problemMarks, setProblemMarks] = useState<Record<string, number>>({
    'lc-easy-two-sum': 25,
    'lc-easy-valid-parentheses': 25,
  });

  // Bank selector search & tags
  const [bankSearch, setBankSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('All');
  const [bankDiff, setBankDiff] = useState('All');

  const openCreateModal = (existing?: BattleSet) => {
    if (existing) {
      setEditingId(existing.id);
      setTitle(existing.title);
      setSubject(existing.subject);
      setBatch(existing.batch);
      setSemester(existing.semester);
      setTopic(existing.topic);
      setDifficulty(existing.difficulty);
      setDuration(existing.duration);
      setSelectedProblemIds([...existing.codingProblemIds]);
      setProblemMarks({ ...(existing.codingProblemMarks || {}) });
    } else {
      setEditingId(null);
      setTitle('');
      setSubject('Data Structures');
      setBatch('5.0');
      setSemester('4');
      setTopic('Arrays & Problem Solving');
      setDifficulty('Medium');
      setDuration(25);
      setSelectedProblemIds(['lc-easy-two-sum', 'lc-easy-valid-palindrome']);
      setProblemMarks({
        'lc-easy-two-sum': 25,
        'lc-easy-valid-palindrome': 25,
      });
    }
    setModalOpen(true);
  };

  const handleToggleProblem = (probId: string) => {
    if (selectedProblemIds.includes(probId)) {
      setSelectedProblemIds((prev) => prev.filter((id) => id !== probId));
      const nextMarks = { ...problemMarks };
      delete nextMarks[probId];
      setProblemMarks(nextMarks);
    } else {
      setSelectedProblemIds((prev) => [...prev, probId]);
      setProblemMarks((prev) => ({ ...prev, [probId]: 25 }));
    }
  };

  const totalCalculatedMarks = selectedProblemIds.reduce(
    (sum, id) => sum + (problemMarks[id] || 25),
    0
  );

  const handleSave = (status: 'Published' | 'Draft') => {
    if (!title.trim()) {
      addToast('Validation error', 'Please provide a title for the Battle Set.', 'circle-alert');
      return;
    }
    if (selectedProblemIds.length === 0) {
      addToast('Validation error', 'Please select at least 1 coding problem.', 'circle-alert');
      return;
    }

    const bSet: BattleSet = {
      id: editingId || `bs-${Date.now()}`,
      title: title.trim(),
      subject,
      batch,
      semester,
      topic,
      difficulty,
      duration,
      marks: totalCalculatedMarks,
      codingProblemIds: selectedProblemIds,
      codingProblemMarks: problemMarks,
      status,
      createdBy: 'Prof. Roy',
      createdAt: new Date().toISOString().split('T')[0],
      battlesCount: editingId ? battleSets.find((s) => s.id === editingId)?.battlesCount || 0 : 0,
    };

    saveBattleSet(bSet);
    setModalOpen(false);
  };

  // Filtered battle sets
  const filteredSets = battleSets.filter((s) => {
    const matchesBatch = batchFilter === 'All' || s.batch === batchFilter;
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase()) ||
      s.topic.toLowerCase().includes(search.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  // Available tags in question bank
  const allTags = ['All', 'Array', 'String', 'Two Pointers', 'Stack', 'Tree', 'Dynamic Programming', 'Graph'];

  const filteredBank = codingProblems.filter((p) => {
    const matchesSearch =
      !bankSearch ||
      p.title.toLowerCase().includes(bankSearch.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(bankSearch.toLowerCase()));
    const matchesTag = tagFilter === 'All' || p.tags.some((t) => t.toLowerCase() === tagFilter.toLowerCase());
    const matchesDiff = bankDiff === 'All' || p.difficulty === bankDiff;
    return matchesSearch && matchesTag && matchesDiff;
  });

  const previewProblem = previewProblemId
    ? codingProblems.find((p) => p.id === previewProblemId)
    : null;

  const totalBattlesFought = battles.filter((b) => b.status === 'completed').length;

  return (
    <section className="page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Swords size={13} style={{ color: 'var(--amber)' }} />
            Peer Battle Infrastructure
          </span>
          <h2>Coding Battle Sets</h2>
          <p>
            Curate synchronized competitive sets for enrolled classes. Classmates will challenge each
            other under identical timer and problem configurations.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openCreateModal()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={15} />
            Create Battle Set
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid" style={{ marginBottom: '22px' }}>
        <div className="metric-card">
          <span className="metric-label">Published Battle Sets</span>
          <strong className="metric-value">{battleSets.filter((s) => s.status === 'Published').length}</strong>
          <span className="metric-delta">Available for enrolled students</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Student Battles</span>
          <strong className="metric-value">{totalBattlesFought + 14}</strong>
          <span className="metric-delta positive">High engagement</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Enrolled Batches</span>
          <strong className="metric-value">Batch 5.0 & 4.0</strong>
          <span className="metric-delta">Strict course isolation</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg. Duel Duration</span>
          <strong className="metric-value">25 mins</strong>
          <span className="metric-delta">Head-to-head sprint</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="lc-toolbar" style={{ marginBottom: '16px' }}>
        <button
          type="button"
          className={`lc-chip ${batchFilter === 'All' ? 'active' : ''}`}
          onClick={() => setBatchFilter('All')}
        >
          All Classes ({battleSets.length})
        </button>
        <button
          type="button"
          className={`lc-chip ${batchFilter === '5.0' ? 'active' : ''}`}
          onClick={() => setBatchFilter('5.0')}
        >
          Batch 5.0 ({battleSets.filter((s) => s.batch === '5.0').length})
        </button>
        <button
          type="button"
          className={`lc-chip ${batchFilter === '4.0' ? 'active' : ''}`}
          onClick={() => setBatchFilter('4.0')}
        >
          Batch 4.0 ({battleSets.filter((s) => s.batch === '4.0').length})
        </button>

        <div className="lc-search" style={{ marginLeft: 'auto' }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Search battle sets by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Battle Sets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredSets.map((bSet) => {
          const problemObjs = bSet.codingProblemIds
            .map((id) => codingProblems.find((p) => p.id === id))
            .filter(Boolean);

          return (
            <div
              key={bSet.id}
              className="paper-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                position: 'relative',
                borderLeft: `4px solid ${
                  bSet.difficulty === 'Easy' ? '#1f9e8e' : bSet.difficulty === 'Medium' ? '#eab234' : '#e14e68'
                }`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="badge badge-primary" style={{ font: '600 8.5px/1 "DM Mono", monospace' }}>
                      Batch {bSet.batch}
                    </span>
                    <span className={`lc-diff ${bSet.difficulty.toLowerCase()}`}>
                      {bSet.difficulty}
                    </span>
                  </div>
                  <span style={{ font: '500 8.5px "DM Mono", monospace', color: 'var(--muted)' }}>
                    {bSet.battlesCount || 0} duels fought
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{bSet.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px' }}>
                  {bSet.subject} · {bSet.topic}
                </p>

                {/* Problems included pill stack */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '6px' }}>
                    Problems ({bSet.codingProblemIds.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {problemObjs.map((p, idx) => (
                      <span
                        key={idx}
                        className="lc-tag"
                        style={{
                          fontSize: '10.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                        }}
                      >
                        <Code2 size={11} />
                        {p?.title || 'Problem'}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'var(--surface-2)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Duration</span>
                    <strong>{bSet.duration} mins</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Marks</span>
                    <strong>{bSet.marks} pts</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Status</span>
                    <strong style={{ color: bSet.status === 'Published' ? 'var(--green)' : 'var(--amber)' }}>
                      {bSet.status}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => openCreateModal(bSet)}
                    style={{ fontSize: '11.5px' }}
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#e14e68' }}
                    onClick={() => deleteBattleSet(bSet.id)}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>

                <span style={{ font: '400 9px "DM Mono", monospace', color: 'var(--muted)' }}>
                  Enrolled Course Only
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Battle Set Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '840px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--blue)' }}>
                  {editingId ? 'Edit Battle Set' : 'Configure New Battle Set'}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                  {editingId ? 'Update Coding Battle Set' : 'Create Class Battle Set'}
                </h3>
              </div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Form Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                  Battle Set Title *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Arrays & Two Pointers Clash"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', marginBottom: '12px' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                      Subject / Course
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                      Enrolled Class / Batch *
                    </label>
                    <select
                      className="input"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="5.0">Batch 5.0 (Computer Science)</option>
                      <option value="4.0">Batch 4.0 (Software Engineering)</option>
                      <option value="3.0">Batch 3.0 (Data Systems)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                      Topic Focus
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                      Difficulty Level
                    </label>
                    <select
                      className="input"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Duration and Marks allocation */}
              <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                  Timer & Duration (Minutes) *
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  {[15, 20, 25, 30, 40, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      className={`lc-chip ${duration === mins ? 'active' : ''}`}
                      onClick={() => setDuration(mins)}
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                <div style={{ padding: '12px', background: 'var(--surface-solid)', borderRadius: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11.5px' }}>
                    <span style={{ color: 'var(--muted)' }}>Selected Problems:</span>
                    <strong>{selectedProblemIds.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11.5px' }}>
                    <span style={{ color: 'var(--muted)' }}>Total Battle Marks:</span>
                    <strong style={{ color: 'var(--green)' }}>{totalCalculatedMarks} pts</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                    <span style={{ color: 'var(--muted)' }}>Classroom Access:</span>
                    <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Batch {batch} Only</span>
                  </div>
                </div>

                <p style={{ font: '400 9.5px "DM Mono", monospace', color: 'var(--muted)', lineHeight: 1.5 }}>
                  Notice: Only students enrolled in Batch {batch} will be permitted to discover and initiate
                  challenges using this battle configuration.
                </p>
              </div>
            </div>

            {/* Question Bank Problem Picker */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700 }}>
                  Select Coding Problems from Question Bank ({selectedProblemIds.length} chosen)
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="input"
                    value={bankDiff}
                    onChange={(e) => setBankDiff(e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Tag Filters */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`lc-chip ${tagFilter === tag ? 'active' : ''}`}
                    onClick={() => setTagFilter(tag)}
                    style={{ fontSize: '10.5px', padding: '4px 9px', whiteSpace: 'nowrap' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search box */}
              <div className="lc-search" style={{ marginBottom: '12px' }}>
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Filter 70 LeetCode problems..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                />
              </div>

              {/* Problems list */}
              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '6px',
                }}
              >
                {filteredBank.map((p) => {
                  const isChecked = selectedProblemIds.includes(p.id);
                  const marks = problemMarks[p.id] || 25;

                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: isChecked ? 'rgba(61, 87, 214, 0.1)' : 'transparent',
                        marginBottom: '4px',
                        border: isChecked ? '1px solid rgba(61, 87, 214, 0.3)' : '1px solid transparent',
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProblem(p.id)}
                        />
                        <div>
                          <strong style={{ fontSize: '12px' }}>{p.title}</strong>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                            <span className={`lc-diff ${p.difficulty.toLowerCase()}`} style={{ fontSize: '8px', padding: '1px 6px' }}>
                              {p.difficulty}
                            </span>
                            {p.tags.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="lc-tag" style={{ fontSize: '8px', padding: '1px 6px' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isChecked && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Marks:</span>
                            <input
                              type="number"
                              min={5}
                              max={100}
                              value={marks}
                              onChange={(e) =>
                                setProblemMarks((prev) => ({
                                  ...prev,
                                  [p.id]: Number(e.target.value) || 0,
                                }))
                              }
                              style={{
                                width: '54px',
                                padding: '3px 6px',
                                fontSize: '11px',
                                borderRadius: '6px',
                                border: '1px solid var(--line)',
                                background: 'var(--surface-solid)',
                                color: 'var(--text)',
                              }}
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setPreviewProblemId(p.id)}
                          title="Preview Problem Statement"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => handleSave('Draft')}>
                Save as Draft
              </button>
              <button type="button" className="btn btn-primary" onClick={() => handleSave('Published')}>
                Publish Battle Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Preview Modal */}
      {previewProblem && (
        <div className="modal-backdrop" onClick={() => setPreviewProblemId(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '640px', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span className={`lc-diff ${previewProblem.difficulty.toLowerCase()}`}>
                  {previewProblem.difficulty}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '6px' }}>{previewProblem.title}</h3>
              </div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setPreviewProblemId(null)}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '12px', lineHeight: 1.6, marginBottom: '16px', color: 'var(--text)' }}>
              {previewProblem.description}
            </p>

            <h5 style={{ fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>Example:</h5>
            {previewProblem.examples.slice(0, 1).map((ex, i) => (
              <div key={i} className="lc-example" style={{ marginBottom: '14px' }}>
                <pre>
                  <b>Input:</b> {ex.input}
                  {'\n'}
                  <b>Output:</b> {ex.output}
                </pre>
              </div>
            ))}

            <h5 style={{ fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>Constraints:</h5>
            <ul className="lc-constraints">
              {previewProblem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};
