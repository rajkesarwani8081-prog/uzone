import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Flame,
  Search,
  Plus,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Code2,
  FileText,
  Lightbulb,
  ExternalLink,
  Trash2,
  Edit3,
  X,
  Copy,
  Check,
  Tag,
  ShieldCheck,
  Terminal,
  CheckSquare,
  Sparkles,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  LearningItem,
  LearningSection,
  LearningStatus,
  LearningResource,
} from '../types';
import {
  calculateMasteryStats,
  filterLearningItems,
  getUniqueCategories,
} from '../utils/learningSpaceUtils';

export const LearningSpaceView: React.FC = () => {
  const {
    learningItems,
    learningStreak,
    revisionDueCount,
    addLearningItem,
    updateLearningItem,
    deleteLearningItem,
    toggleLearningBookmark,
    updateLearningStatus,
    markItemRevised,
    user,
  } = useApp();

  // Active section tab
  const [activeSection, setActiveSection] = useState<LearningSection>('mistakes');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LearningStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [onlyDueRevision, setOnlyDueRevision] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<LearningResource | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Card view mode (diff mode toggle per card id)
  const [codeViewModes, setCodeViewModes] = useState<Record<string, 'solution' | 'buggy' | 'split'>>({});

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Quick stats
  const totalMistakes = learningItems.filter((i) => i.section === 'mistakes').length;
  const totalLearnings = learningItems.filter((i) => i.section === 'learnings').length;
  const totalIdeas = learningItems.filter((i) => i.section === 'ideas').length;
  const totalNotes = learningItems.filter((i) => i.section === 'notes').length;

  const mastery = useMemo(() => calculateMasteryStats(learningItems), [learningItems]);

  // Unique categories in current section
  const availableCategories = useMemo(() => {
    return getUniqueCategories(learningItems, activeSection);
  }, [learningItems, activeSection]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return filterLearningItems(learningItems, {
      section: activeSection,
      search,
      status: statusFilter,
      category: categoryFilter,
      onlyBookmarked,
      onlyDueRevision,
      selectedDate: selectedCalendarDate,
      todayStr,
    });
  }, [
    learningItems,
    activeSection,
    search,
    statusFilter,
    categoryFilter,
    onlyBookmarked,
    onlyDueRevision,
    selectedCalendarDate,
    todayStr,
  ]);

  // Items due for revision in current or all sections
  const revisionDeck = useMemo(() => {
    const due = learningItems.filter(
      (item) => item.status === 'Need Revision' || (item.nextRevisionDate && item.nextRevisionDate <= todayStr)
    );
    return due.length > 0 ? due : learningItems.slice(0, 8);
  }, [learningItems, todayStr]);

  // Calendar dates generation (last 28 days)
  const calendarDays = useMemo(() => {
    const days: Array<{ dateStr: string; label: string; count: number }> = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const count = learningStreak.activityMap[dateStr] || 0;
      days.push({
        dateStr,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }
    return days;
  }, [learningStreak]);

  // Copy code handler
  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: LearningItem) => {
    setEditingItem(item);
    setIsCreateModalOpen(true);
  };

  const hasActiveFilters = Boolean(
    search ||
    statusFilter !== 'All' ||
    categoryFilter !== 'All' ||
    onlyBookmarked ||
    onlyDueRevision ||
    selectedCalendarDate
  );

  return (
    <div className="ls-container">
      {/* ========================================================= */}
      {/* 1. HERO HEADER WITH RADIANT GLOW                          */}
      {/* ========================================================= */}
      <section className="ls-hero">
        <div className="ls-hero-ambient-1" aria-hidden="true" />
        <div className="ls-hero-ambient-2" aria-hidden="true" />

        <div className="ls-hero-content">
          <div className="ls-hero-text">
            {/* Unboxed Metadata Tagline */}
            <div className="ls-metadata-row">
              <span className="ls-meta-pill private">
                <ShieldCheck size={13} /> Private Space
              </span>
              <span className="ls-meta-sep">·</span>
              <span>Batch {user?.batch || '5.0'}</span>
              <span className="ls-meta-sep">·</span>
              <span style={{ color: 'var(--blue-2)' }}>Spaced Recall Active</span>
              <span className="ls-meta-sep">·</span>
              <span style={{ fontFamily: "'DM Mono', monospace" }}>{learningItems.length} entries cataloged</span>
            </div>

            <h1 className="ls-hero-title">
              <span>My Learning Space</span>
              <Sparkles size={22} style={{ color: 'var(--amber)' }} />
            </h1>

            <p className="ls-hero-desc">
              Your engineering notebook & bug journal. Review coding errors captured from practice, master algorithmic patterns, document experimental hacks, and maintain active recall consistency.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="ls-hero-actions">
            <button
              type="button"
              className={`ls-btn-practice ${revisionDueCount === 0 ? 'empty' : ''}`}
              onClick={() => setIsRevisionModalOpen(true)}
              title="Start Spaced Recall Flashcard Session"
            >
              <RotateCcw size={15} />
              <span>Practice Deck</span>
              {revisionDueCount > 0 ? (
                <span className="ls-practice-badge">
                  {revisionDueCount} due
                </span>
              ) : (
                <span className="ls-practice-badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}>
                  All clear
                </span>
              )}
            </button>

            <button
              type="button"
              className="ls-btn-new"
              onClick={() => {
                setEditingItem(null);
                setIsCreateModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>New Entry</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. THREE-CARD COMMAND TELEMETRY DECK                     */}
      {/* ========================================================= */}
      <div className="ls-stats-grid">
        {/* Card 1: Practice Streak */}
        <div className="ls-stat-card">
          <div>
            <div className="ls-stat-top">
              <span className="ls-stat-label">Daily Practice Streak</span>
              <span className="ls-stat-meta">Best: {learningStreak.longestStreak}d</span>
            </div>

            <div className="ls-streak-row">
              <div className="ls-streak-icon-wrap">
                <Flame size={24} />
              </div>
              <div>
                <div className="ls-streak-number">
                  {learningStreak.currentStreak} <small>Days</small>
                </div>
                <div className="ls-streak-subtext">
                  {learningStreak.todayCount > 0
                    ? `${learningStreak.todayCount} actions logged today · Streak active`
                    : 'Log 1 entry today to protect your streak'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Concept Mastery Matrix */}
        <div className="ls-stat-card">
          <div>
            <div className="ls-stat-top">
              <span className="ls-stat-label">Concept Mastery Matrix</span>
              <span className="ls-mastery-number">{mastery.masteryPercentage}% Solved</span>
            </div>

            <div className="ls-progress-bar-track">
              <div
                className="ls-bar-slice understood"
                style={{ width: `${mastery.masteryPercentage}%` }}
                title={`${mastery.understood} Understood`}
              />
              <div
                className="ls-bar-slice learning"
                style={{ width: `${mastery.total ? Math.round((mastery.learning / mastery.total) * 100) : 0}%` }}
                title={`${mastery.learning} In Progress`}
              />
              <div
                className="ls-bar-slice review"
                style={{ width: `${mastery.total ? Math.round((mastery.needRevision / mastery.total) * 100) : 0}%` }}
                title={`${mastery.needRevision} Need Revision`}
              />
            </div>

            <div className="ls-mastery-legend">
              <span className="ls-legend-pill understood">
                <span className="ls-dot" />
                <span>{mastery.understood} Mastered</span>
              </span>
              <span className="ls-legend-pill learning">
                <span className="ls-dot" />
                <span>{mastery.learning} Learning</span>
              </span>
              <span className="ls-legend-pill review">
                <span className="ls-dot" />
                <span>{mastery.needRevision} Review</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: 28-Day Consistency Calendar */}
        <div className="ls-stat-card">
          <div>
            <div className="ls-stat-top">
              <span className="ls-stat-label">Consistency Calendar</span>
              {selectedCalendarDate ? (
                <button
                  type="button"
                  onClick={() => setSelectedCalendarDate(null)}
                  className="ls-reset-link"
                >
                  Clear ({selectedCalendarDate})
                </button>
              ) : (
                <span className="ls-stat-meta">Past 28 Days</span>
              )}
            </div>

            <div className="ls-calendar-grid">
              {calendarDays.map((day) => {
                const isSelected = selectedCalendarDate === day.dateStr;
                let lvlClass = '';
                if (day.count >= 4) lvlClass = 'lvl-3';
                else if (day.count >= 2) lvlClass = 'lvl-2';
                else if (day.count >= 1) lvlClass = 'lvl-1';

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setSelectedCalendarDate(isSelected ? null : day.dateStr)}
                    title={`${day.label}: ${day.count} activities logged`}
                    className={`ls-cal-day ${lvlClass} ${isSelected ? 'selected' : ''}`}
                    aria-label={`${day.label}: ${day.count} activities`}
                  />
                );
              })}
            </div>

            <div className="ls-cal-footer">
              <span>Consistent daily habit</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Less</span>
                <span style={{ width: '6px', height: '6px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '2px', background: 'rgba(77,227,163,0.45)' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '2px', background: 'var(--green)' }} />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SEGMENTED NAVIGATION & FILTER SYSTEM                  */}
      {/* ========================================================= */}
      <div className="ls-nav-deck">
        <div className="ls-tabs-bar">
          <div className="ls-tabs-group">
            {[
              { id: 'mistakes', label: 'Mistake Book', count: totalMistakes, icon: AlertCircle },
              { id: 'learnings', label: 'New Learning', count: totalLearnings, icon: BookOpen },
              { id: 'ideas', label: 'My Ideas', count: totalIdeas, icon: Lightbulb },
              { id: 'notes', label: 'Saved Notes', count: totalNotes, icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(tab.id as LearningSection);
                    setCategoryFilter('All');
                  }}
                  className={`ls-tab-btn ${tab.id} ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  <span className="ls-tab-badge">{tab.count}</span>
                </button>
              );
            })}
          </div>

          {/* Grid vs List layout switch */}
          <div className="ls-layout-toggle">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`ls-layout-btn ${viewLayout === 'grid' ? 'active' : ''}`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('list')}
              className={`ls-layout-btn ${viewLayout === 'list' ? 'active' : ''}`}
              title="Compact list view"
              aria-label="Compact list view"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="ls-filter-strip">
          <div className="ls-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="ls-search-input"
              placeholder={`Search in ${activeSection === 'mistakes' ? 'Mistake Book' : activeSection}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="ls-search-clear"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            className="ls-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="Learning">Learning</option>
            <option value="Understood">Understood (Mastered)</option>
            <option value="Need Revision">Need Revision</option>
          </select>

          {availableCategories.length > 0 && (
            <select
              className="ls-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className={`ls-filter-toggle starred ${onlyBookmarked ? 'active' : ''}`}
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
          >
            <Star size={13} style={{ fill: onlyBookmarked ? 'currentColor' : 'none' }} />
            <span>Starred</span>
          </button>

          <button
            type="button"
            className={`ls-filter-toggle review ${onlyDueRevision ? 'active' : ''}`}
            onClick={() => setOnlyDueRevision(!onlyDueRevision)}
          >
            <Clock size={13} />
            <span>Review Due</span>
          </button>
        </div>

        {/* Filter Results Info */}
        <div className="ls-active-info">
          <div>
            Showing <strong style={{ color: 'var(--text)' }}>{filteredItems.length}</strong>{' '}
            {filteredItems.length === 1 ? 'entry' : 'entries'} in{' '}
            <strong style={{ color: 'var(--text)', textTransform: 'capitalize' }}>
              {activeSection === 'mistakes' ? 'Mistake Book' : activeSection}
            </strong>
            {selectedCalendarDate && (
              <span> · Logged on <strong style={{ color: 'var(--blue-2)' }}>{selectedCalendarDate}</strong></span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="ls-reset-link"
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setCategoryFilter('All');
                setOnlyBookmarked(false);
                setOnlyDueRevision(false);
                setSelectedCalendarDate(null);
              }}
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. CONTENT CARDS (GRID OR DENSE LIST)                     */}
      {/* ========================================================= */}
      {filteredItems.length === 0 ? (
        <div className="ls-empty-state">
          <div className="ls-empty-icon">
            <BookOpen size={26} />
          </div>
          <h3 className="ls-empty-title">No entries found</h3>
          <p className="ls-empty-desc">
            {hasActiveFilters
              ? 'No entries match your search query and filters. Try adjusting your search criteria or resetting filters.'
              : `Your ${activeSection === 'mistakes' ? 'Mistake Book' : activeSection} is completely clear. Log an edge case or create a new entry below.`}
          </p>
          <button
            type="button"
            className="ls-btn-new"
            onClick={() => {
              setEditingItem(null);
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Create New {activeSection === 'mistakes' ? 'Mistake Post-Mortem' : 'Entry'}</span>
          </button>
        </div>
      ) : (
        <div className={viewLayout === 'grid' ? 'ls-cards-grid' : 'ls-cards-list'}>
          {filteredItems.map((item) => {
            const cardViewMode = codeViewModes[item.id] || (item.buggyCode && item.correctedSolution ? 'split' : 'solution');

            return (
              <article key={item.id} className={`ls-card ${item.section}`}>
                <div>
                  {/* Card Header Strip */}
                  <div className="ls-card-head">
                    <div className="ls-card-meta">
                      <span className="ls-card-category">
                        <i />
                        {item.category}
                      </span>
                      <span className="ls-meta-sep">·</span>
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>{item.date}</span>
                      {item.failureType && (
                        <>
                          <span className="ls-meta-sep">·</span>
                          <span className="ls-card-failure-tag">
                            {item.failureType}
                          </span>
                        </>
                      )}
                      {item.revisionCount !== undefined && item.revisionCount > 0 && (
                        <>
                          <span className="ls-meta-sep">·</span>
                          <span style={{ fontFamily: "'DM Mono', monospace" }}>
                            Revised {item.revisionCount}x
                          </span>
                        </>
                      )}
                    </div>

                    {/* Quick Action Toolbar */}
                    <div className="ls-card-actions">
                      <select
                        className={`ls-status-select ${item.status.replace(/\s+/g, '')}`}
                        value={item.status}
                        onChange={(e) => updateLearningStatus(item.id, e.target.value as LearningStatus)}
                        aria-label="Update mastery status"
                      >
                        <option value="Learning">Learning</option>
                        <option value="Need Revision">Need Revision</option>
                        <option value="Understood">Understood</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => toggleLearningBookmark(item.id)}
                        className={`ls-icon-btn star ${item.bookmarked ? 'active' : ''}`}
                        title={item.bookmarked ? 'Remove bookmark' : 'Bookmark entry'}
                        aria-label="Bookmark entry"
                      >
                        <Star size={14} style={{ fill: item.bookmarked ? 'currentColor' : 'none' }} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="ls-icon-btn"
                        title="Edit entry"
                        aria-label="Edit entry"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${item.title}" from your learning space?`)) {
                            deleteLearningItem(item.id);
                          }
                        }}
                        className="ls-icon-btn danger"
                        title="Delete entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Origin */}
                  <h3 className="ls-card-title">
                    <span>{item.title}</span>
                    {item.problemTitle && (
                      <small>(Origin: {item.problemTitle})</small>
                    )}
                  </h3>

                  {/* Summary / Description */}
                  <p className="ls-card-desc">{item.description}</p>

                  {/* =================================================== */}
                  {/* MISTAKE BOOK: TEST EXECUTION TRACE                  */}
                  {/* =================================================== */}
                  {item.section === 'mistakes' && (item.failedInput || item.expectedOutput || item.actualOutput) && (
                    <div className="ls-trace-box">
                      <div className="ls-trace-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Terminal size={13} style={{ color: 'var(--red)' }} />
                          <span>Test Execution Trace</span>
                        </div>
                        <div className="ls-terminal-dots">
                          <span className="d1" />
                          <span className="d2" />
                          <span className="d3" />
                        </div>
                      </div>

                      {item.failedInput && (
                        <div className="ls-trace-row">
                          <span className="ls-trace-kicker input">Input:</span>
                          <span className="ls-trace-val">{item.failedInput}</span>
                        </div>
                      )}

                      {item.actualOutput && (
                        <div className="ls-trace-row">
                          <span className="ls-trace-kicker actual">Actual:</span>
                          <span className="ls-trace-val actual">{item.actualOutput}</span>
                        </div>
                      )}

                      {item.expectedOutput && (
                        <div className="ls-trace-row">
                          <span className="ls-trace-kicker expected">Expected:</span>
                          <span className="ls-trace-val expected">{item.expectedOutput}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* =================================================== */}
                  {/* CODE INSPECTOR: BUGGY VS WORKING FIX               */}
                  {/* =================================================== */}
                  {item.buggyCode && item.correctedSolution ? (
                    <div className="ls-code-box">
                      <div className="ls-code-nav">
                        <div className="ls-code-modes">
                          <button
                            type="button"
                            onClick={() => setCodeViewModes((prev) => ({ ...prev, [item.id]: 'split' }))}
                            className={`ls-mode-btn split ${cardViewMode === 'split' ? 'active' : ''}`}
                          >
                            Side-by-side
                          </button>
                          <button
                            type="button"
                            onClick={() => setCodeViewModes((prev) => ({ ...prev, [item.id]: 'buggy' }))}
                            className={`ls-mode-btn buggy ${cardViewMode === 'buggy' ? 'active' : ''}`}
                          >
                            Faulty Code
                          </button>
                          <button
                            type="button"
                            onClick={() => setCodeViewModes((prev) => ({ ...prev, [item.id]: 'solution' }))}
                            className={`ls-mode-btn solution ${cardViewMode === 'solution' ? 'active' : ''}`}
                          >
                            Fix Solution
                          </button>
                        </div>

                        <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", color: 'var(--muted-2)', textTransform: 'uppercase' }}>
                          {item.codeLanguage || 'code'}
                        </span>
                      </div>

                      {cardViewMode === 'split' ? (
                        <div className="ls-code-split-pane">
                          <div className="ls-code-column">
                            <div className="ls-code-col-head faulty">
                              <span>Faulty Implementation</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(`bug-${item.id}`, item.buggyCode || '')}
                                className={`ls-copy-btn ${copiedCodeId === `bug-${item.id}` ? 'copied' : ''}`}
                                title="Copy faulty snippet"
                              >
                                {copiedCodeId === `bug-${item.id}` ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedCodeId === `bug-${item.id}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <pre className="ls-pre buggy">{item.buggyCode}</pre>
                          </div>

                          <div className="ls-code-column">
                            <div className="ls-code-col-head solution">
                              <span>Working Solution</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(`sol-${item.id}`, item.correctedSolution || '')}
                                className={`ls-copy-btn ${copiedCodeId === `sol-${item.id}` ? 'copied' : ''}`}
                                title="Copy working solution"
                              >
                                {copiedCodeId === `sol-${item.id}` ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedCodeId === `sol-${item.id}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <pre className="ls-pre solution">{item.correctedSolution}</pre>
                          </div>
                        </div>
                      ) : cardViewMode === 'buggy' ? (
                        <div style={{ padding: '12px' }}>
                          <div className="ls-code-col-head faulty" style={{ marginBottom: '6px' }}>
                            <span>Faulty Implementation</span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(`bug-${item.id}`, item.buggyCode || '')}
                              className={`ls-copy-btn ${copiedCodeId === `bug-${item.id}` ? 'copied' : ''}`}
                            >
                              {copiedCodeId === `bug-${item.id}` ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedCodeId === `bug-${item.id}` ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="ls-pre buggy">{item.buggyCode}</pre>
                        </div>
                      ) : (
                        <div style={{ padding: '12px' }}>
                          <div className="ls-code-col-head solution" style={{ marginBottom: '6px' }}>
                            <span>Working Solution</span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(`sol-${item.id}`, item.correctedSolution || '')}
                              className={`ls-copy-btn ${copiedCodeId === `sol-${item.id}` ? 'copied' : ''}`}
                            >
                              {copiedCodeId === `sol-${item.id}` ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedCodeId === `sol-${item.id}` ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="ls-pre solution">{item.correctedSolution}</pre>
                        </div>
                      )}
                    </div>
                  ) : item.codeSnippet ? (
                    <div className="ls-code-box" style={{ padding: '12px' }}>
                      <div className="ls-code-nav" style={{ margin: '-12px -12px 10px', background: 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-2)', fontSize: '11px', fontWeight: 700 }}>
                          <Code2 size={14} />
                          <span>Syntax Cheatsheet / Pattern</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", color: 'var(--muted-2)', textTransform: 'uppercase' }}>
                            {item.codeLanguage || 'code'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(`code-${item.id}`, item.codeSnippet || '')}
                            className={`ls-copy-btn ${copiedCodeId === `code-${item.id}` ? 'copied' : ''}`}
                          >
                            {copiedCodeId === `code-${item.id}` ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedCodeId === `code-${item.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                      <pre className="ls-pre neutral">{item.codeSnippet}</pre>
                    </div>
                  ) : null}

                  {/* Cognitive Blueprint & Prevention Rule */}
                  {item.fixExplanation && (
                    <div className="ls-callout">
                      <Lightbulb size={16} style={{ color: 'var(--blue-2)', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>Cognitive Blueprint & Prevention Rule:</strong>
                        {item.fixExplanation}
                      </div>
                    </div>
                  )}

                  {/* Interactive Milestones Checklist (Ideas) */}
                  {item.section === 'ideas' && item.actionItems && item.actionItems.length > 0 && (
                    <div className="ls-action-box">
                      <div className="ls-action-head">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckSquare size={14} style={{ color: 'var(--violet)' }} />
                          <span>Action Items & Milestones</span>
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--violet)' }}>
                          {item.actionItems.filter((a) => a.done).length} of {item.actionItems.length} complete
                        </span>
                      </div>

                      <div>
                        {item.actionItems.map((act) => (
                          <label key={act.id} className={`ls-action-item ${act.done ? 'done' : ''}`}>
                            <input
                              type="checkbox"
                              checked={act.done}
                              onChange={() => {
                                const updatedActs = item.actionItems?.map((a) =>
                                  a.id === act.id ? { ...a, done: !a.done } : a
                                );
                                updateLearningItem({ ...item, actionItems: updatedActs });
                              }}
                            />
                            <span>{act.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {item.resources && item.resources.length > 0 && (
                    <div className="ls-resources-strip">
                      <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Resources:</span>
                      {item.resources.map((res) => (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => setPreviewResource(res)}
                          className="ls-resource-btn"
                        >
                          {res.type === 'pdf' ? (
                            <FileText size={13} style={{ color: 'var(--red)' }} />
                          ) : (
                            <ExternalLink size={13} style={{ color: 'var(--blue-2)' }} />
                          )}
                          <span>{res.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Tags & Revision Trigger */}
                <div className="ls-card-footer">
                  <div className="ls-tags-row">
                    <Tag size={12} style={{ color: 'var(--muted-2)' }} />
                    {item.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearch(tag)}
                        className="ls-tag-btn"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  {item.status === 'Need Revision' ? (
                    <button
                      type="button"
                      onClick={() => markItemRevised(item.id, 'Understood')}
                      className="ls-review-btn due"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Understood</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markItemRevised(item.id, 'Understood')}
                      className="ls-review-btn record"
                      title="Record practice session"
                    >
                      <RotateCcw size={13} />
                      <span>Record Review</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SPACED REPETITION FLASHCARD MODAL                     */}
      {/* ========================================================= */}
      {isRevisionModalOpen && (
        <RevisionPracticeModal
          deck={revisionDeck}
          onClose={() => setIsRevisionModalOpen(false)}
          onRate={(itemId, status) => {
            markItemRevised(itemId, status);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* 6. CREATE / EDIT MODAL                                    */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <CreateOrEditLearningModal
          initialItem={editingItem}
          defaultSection={activeSection}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingItem(null);
          }}
          onSave={(itemData) => {
            if (editingItem) {
              updateLearningItem({ ...editingItem, ...itemData });
            } else {
              addLearningItem(itemData);
            }
            setIsCreateModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* 7. RESOURCE PREVIEW MODAL                                 */}
      {/* ========================================================= */}
      {previewResource && (
        <div className="ls-modal-backdrop">
          <div className="ls-modal-box" style={{ maxWidth: '520px' }}>
            <div className="ls-modal-head">
              <div className="ls-modal-title">
                <FileText size={18} style={{ color: 'var(--red)' }} />
                <span>{previewResource.label}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewResource(null)}
                className="ls-close-btn"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              This document is linked to your personal learning space. You can open the external reference or research documentation below.
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.35)', border: '1px solid var(--line)', fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--text)', wordBreak: 'break-all', marginBottom: '20px' }}>
              {previewResource.url}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPreviewResource(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
              <a
                href={previewResource.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm"
              >
                <ExternalLink size={13} />
                <span>Open Reference</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================================================= */
/* SUB-COMPONENT: SPACED REVISION FLASHCARD DECK             */
/* ========================================================= */
interface RevisionModalProps {
  deck: LearningItem[];
  onClose: () => void;
  onRate: (itemId: string, status: LearningStatus) => void;
}

const RevisionPracticeModal: React.FC<RevisionModalProps> = ({ deck, onClose, onRate }) => {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const cur = deck[index];

  // Spacebar to reveal solution
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !revealed) {
        e.preventDefault();
        setRevealed(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed]);

  const advanceNext = () => {
    if (index < deck.length - 1) {
      setIndex((i) => i + 1);
      setRevealed(false);
    } else {
      onClose();
    }
  };

  if (!cur) {
    return (
      <div className="ls-modal-backdrop">
        <div className="ls-modal-box" style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(77,227,163,0.15)', color: 'var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800 }}>Deck Cleared!</h3>
          <p style={{ margin: '0 0 24px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>
            All pending cards for today have been reviewed. Outstanding consistency!
          </p>
          <button type="button" onClick={onClose} className="btn btn-primary w-full">
            Back to Learning Space
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ls-modal-backdrop">
      <div className="ls-modal-box">
        {/* Modal Header */}
        <div className="ls-modal-head">
          <div className="ls-modal-title">
            <RotateCcw size={18} style={{ color: 'var(--amber)' }} />
            <div>
              <span>Spaced Revision Deck</span>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>
                Card {index + 1} of {deck.length} · {cur.category}
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="ls-close-btn" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Progress track */}
        <div className="ls-progress-bar-track" style={{ margin: '0 0 16px' }}>
          <div
            className="ls-bar-slice understood"
            style={{ width: `${((index + 1) / deck.length) * 100}%` }}
          />
        </div>

        {/* Prompt Card Front */}
        <div className="ls-flashcard-front">
          <div className="ls-metadata-row">
            <span style={{ color: 'var(--blue-2)', fontWeight: 700, textTransform: 'uppercase' }}>
              {cur.section}
            </span>
            <span className="ls-meta-sep">·</span>
            <span>{cur.category}</span>
            {cur.failureType && (
              <>
                <span className="ls-meta-sep">·</span>
                <span style={{ color: 'var(--red)' }}>{cur.failureType}</span>
              </>
            )}
          </div>

          <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
            {cur.title}
          </h4>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>
            {cur.description}
          </p>

          {cur.failedInput && (
            <div className="ls-trace-box" style={{ margin: 0 }}>
              <div className="ls-trace-row">
                <span className="ls-trace-kicker input">Failed Input:</span>
                <span className="ls-trace-val">{cur.failedInput}</span>
              </div>
            </div>
          )}
        </div>

        {/* Solution / Back */}
        {!revealed ? (
          <div className="ls-flashcard-reveal-prompt">
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--muted)' }}>
              Test your recall! How would you solve or fix this edge case without looking?
            </p>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="btn btn-primary"
            >
              <span>Reveal Solution & Explanation</span>
              <kbd style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.25)', borderRadius: '4px', fontSize: '10px', marginLeft: '4px' }}>Space</kbd>
            </button>
          </div>
        ) : (
          <div className="ls-flashcard-back">
            {cur.correctedSolution && (
              <div>
                <span style={{ fontSize: '11px', fontWeight: 750, color: 'var(--green)', display: 'block', marginBottom: '4px' }}>
                  Working Solution:
                </span>
                <pre className="ls-pre solution">{cur.correctedSolution}</pre>
              </div>
            )}

            {cur.codeSnippet && !cur.correctedSolution && (
              <div>
                <span style={{ fontSize: '11px', fontWeight: 750, color: 'var(--blue-2)', display: 'block', marginBottom: '4px' }}>
                  Implementation Cheatsheet:
                </span>
                <pre className="ls-pre neutral">{cur.codeSnippet}</pre>
              </div>
            )}

            {cur.fixExplanation && (
              <div className="ls-callout" style={{ margin: 0 }}>
                <Lightbulb size={16} style={{ color: 'var(--blue-2)', flexShrink: 0 }} />
                <div>
                  <strong>Key Takeaway:</strong>
                  {cur.fixExplanation}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="ls-flashcard-foot">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => {
                setIndex((i) => Math.max(0, i - 1));
                setRevealed(false);
              }}
              className="ls-icon-btn"
              title="Previous card"
              aria-label="Previous card"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={index === deck.length - 1}
              onClick={() => {
                setIndex((i) => Math.min(deck.length - 1, i + 1));
                setRevealed(false);
              }}
              className="ls-icon-btn"
              title="Next card"
              aria-label="Next card"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {revealed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  onRate(cur.id, 'Need Revision');
                  advanceNext();
                }}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--red)', borderColor: 'rgba(255,108,130,0.3)' }}
              >
                Needs Review
              </button>
              <button
                type="button"
                onClick={() => {
                  onRate(cur.id, 'Understood');
                  advanceNext();
                }}
                className="btn btn-primary btn-sm"
              >
                Mastered!
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--muted-2)', fontFamily: "'DM Mono', monospace" }}>
              Press Space to reveal
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================= */
/* SUB-COMPONENT: CREATE OR EDIT ITEM MODAL                  */
/* ========================================================= */
interface CreateModalProps {
  initialItem: LearningItem | null;
  defaultSection: LearningSection;
  onClose: () => void;
  onSave: (itemData: Omit<LearningItem, 'id' | 'date'>) => void;
}

const CreateOrEditLearningModal: React.FC<CreateModalProps> = ({
  initialItem,
  defaultSection,
  onClose,
  onSave,
}) => {
  const [section, setSection] = useState<LearningSection>(
    initialItem?.section || defaultSection
  );
  const [title, setTitle] = useState(initialItem?.title || '');
  const [category, setCategory] = useState(initialItem?.category || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [status, setStatus] = useState<LearningStatus>(
    initialItem?.status || 'Learning'
  );
  const [tagsInput, setTagsInput] = useState(
    initialItem?.tags ? initialItem.tags.join(', ') : ''
  );
  const [bookmarked, setBookmarked] = useState(initialItem?.bookmarked || false);

  // Mistake specific
  const [problemTitle, setProblemTitle] = useState(initialItem?.problemTitle || '');
  const [failureType, setFailureType] = useState(
    initialItem?.failureType || 'Wrong Logic / Edge Case'
  );
  const [failedInput, setFailedInput] = useState(initialItem?.failedInput || '');
  const [expectedOutput, setExpectedOutput] = useState(initialItem?.expectedOutput || '');
  const [actualOutput, setActualOutput] = useState(initialItem?.actualOutput || '');
  const [buggyCode, setBuggyCode] = useState(initialItem?.buggyCode || '');
  const [correctedSolution, setCorrectedSolution] = useState(
    initialItem?.correctedSolution || ''
  );
  const [fixExplanation, setFixExplanation] = useState(
    initialItem?.fixExplanation || ''
  );

  // Code snippet & Resources
  const [codeSnippet, setCodeSnippet] = useState(initialItem?.codeSnippet || '');
  const [codeLanguage, setCodeLanguage] = useState(initialItem?.codeLanguage || 'javascript');
  const [resourceLabel, setResourceLabel] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resources, setResources] = useState<LearningResource[]>(
    initialItem?.resources || []
  );

  // Idea action steps
  const [actionInput, setActionInput] = useState('');
  const [actionItems, setActionItems] = useState<Array<{ id: string; text: string; done: boolean }>>(
    initialItem?.actionItems || []
  );

  const handleAddResource = () => {
    if (!resourceLabel.trim() || !resourceUrl.trim()) return;
    setResources((prev) => [
      ...prev,
      {
        id: `res-${Date.now()}`,
        label: resourceLabel.trim(),
        url: resourceUrl.trim(),
        type: resourceUrl.endsWith('.pdf') ? 'pdf' : 'link',
      },
    ]);
    setResourceLabel('');
    setResourceUrl('');
  };

  const handleAddActionItem = () => {
    if (!actionInput.trim()) return;
    setActionItems((prev) => [
      ...prev,
      { id: `act-${Date.now()}`, text: actionInput.trim(), done: false },
    ]);
    setActionInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onSave({
      studentId: initialItem?.studentId || 'student-current',
      section,
      title: title.trim(),
      category: category.trim() || (section === 'mistakes' ? 'Coding Practice' : 'General'),
      description: description.trim(),
      tags: tags.length > 0 ? tags : ['learning'],
      status,
      bookmarked,
      nextRevisionDate: initialItem?.nextRevisionDate,
      lastRevisedDate: initialItem?.lastRevisedDate,
      revisionCount: initialItem?.revisionCount || 0,
      problemTitle: problemTitle.trim() || undefined,
      failureType: section === 'mistakes' ? failureType : undefined,
      failedInput: failedInput.trim() || undefined,
      expectedOutput: expectedOutput.trim() || undefined,
      actualOutput: actualOutput.trim() || undefined,
      buggyCode: buggyCode.trim() || undefined,
      correctedSolution: correctedSolution.trim() || undefined,
      fixExplanation: fixExplanation.trim() || undefined,
      codeSnippet: codeSnippet.trim() || undefined,
      codeLanguage,
      resources: resources.length > 0 ? resources : undefined,
      actionItems: section === 'ideas' ? actionItems : undefined,
    });
  };

  return (
    <div className="ls-modal-backdrop">
      <div className="ls-modal-box">
        <div className="ls-modal-head">
          <h3 className="ls-modal-title">
            {initialItem ? 'Edit Entry' : 'Create New Learning Entry'}
          </h3>
          <button type="button" onClick={onClose} className="ls-close-btn" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section Selector */}
          <div className="ls-field">
            <label className="ls-label">Target Section</label>
            <div className="ls-section-toggle-deck">
              {[
                { id: 'mistakes', label: 'Mistake Book', icon: AlertCircle },
                { id: 'learnings', label: 'New Learning', icon: BookOpen },
                { id: 'ideas', label: 'My Ideas', icon: Lightbulb },
                { id: 'notes', label: 'Saved Notes', icon: FileText },
              ].map((s) => {
                const Icon = s.icon;
                const isCur = section === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id as LearningSection)}
                    className={`ls-section-choice ${isCur ? 'active' : ''}`}
                  >
                    <Icon size={14} />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Category */}
          <div className="ls-form-grid cols-2">
            <div className="ls-field">
              <label className="ls-label">Title *</label>
              <input
                type="text"
                required
                className="ls-input"
                placeholder="e.g. Off-by-one in Binary Search"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="ls-field">
              <label className="ls-label">Category / Domain</label>
              <input
                type="text"
                className="ls-input"
                placeholder="e.g. DSA - Binary Search, Python - Pandas"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="ls-field">
            <label className="ls-label">Summary / Explanation *</label>
            <textarea
              rows={3}
              required
              className="ls-textarea"
              placeholder="Explain the concept, bug discovery, or observation in your own words..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* SECTION SPECIFIC: Mistake Book */}
          {section === 'mistakes' && (
            <div className="ls-trace-box" style={{ padding: '16px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--red)', fontSize: '12px', fontWeight: 750 }}>
                <AlertCircle size={14} />
                <span>Mistake Post-Mortem Details</span>
              </div>

              <div className="ls-form-grid cols-2">
                <div className="ls-field">
                  <label className="ls-label">Problem Name / Origin</label>
                  <input
                    type="text"
                    className="ls-input"
                    placeholder="e.g. Two Sum, Valid Parentheses"
                    value={problemTitle}
                    onChange={(e) => setProblemTitle(e.target.value)}
                  />
                </div>

                <div className="ls-field">
                  <label className="ls-label">Failure Classification</label>
                  <select
                    className="ls-select"
                    value={failureType}
                    onChange={(e) => setFailureType(e.target.value)}
                  >
                    <option value="Off-by-one Error">Off-by-one Error</option>
                    <option value="Time Limit Exceeded">Time Limit Exceeded (TLE)</option>
                    <option value="Memory Limit Exceeded">Memory Limit Exceeded</option>
                    <option value="Null / Undefined Pointer">Null / Undefined Pointer</option>
                    <option value="Recursion Stack Overflow">Recursion Stack Overflow</option>
                    <option value="Wrong Logic / Edge Case">Wrong Logic / Edge Case</option>
                    <option value="Type Coercion / Precision">Type Coercion / Precision</option>
                  </select>
                </div>
              </div>

              <div className="ls-form-grid cols-3">
                <div className="ls-field">
                  <label className="ls-label">Failed Input</label>
                  <input
                    type="text"
                    className="ls-input"
                    placeholder="nums=[1, 2], target=3"
                    value={failedInput}
                    onChange={(e) => setFailedInput(e.target.value)}
                  />
                </div>
                <div className="ls-field">
                  <label className="ls-label" style={{ color: '#ff8598' }}>Actual Output</label>
                  <input
                    type="text"
                    className="ls-input"
                    placeholder="-1 or Error"
                    value={actualOutput}
                    onChange={(e) => setActualOutput(e.target.value)}
                  />
                </div>
                <div className="ls-field">
                  <label className="ls-label" style={{ color: 'var(--green)' }}>Expected Output</label>
                  <input
                    type="text"
                    className="ls-input"
                    placeholder="[0, 1]"
                    value={expectedOutput}
                    onChange={(e) => setExpectedOutput(e.target.value)}
                  />
                </div>
              </div>

              <div className="ls-form-grid cols-2">
                <div className="ls-field">
                  <label className="ls-label" style={{ color: '#ff8598' }}>Faulty Code</label>
                  <textarea
                    rows={4}
                    className="ls-textarea code"
                    placeholder="Your faulty code block..."
                    value={buggyCode}
                    onChange={(e) => setBuggyCode(e.target.value)}
                  />
                </div>
                <div className="ls-field">
                  <label className="ls-label" style={{ color: 'var(--green)' }}>Corrected Solution</label>
                  <textarea
                    rows={4}
                    className="ls-textarea code"
                    placeholder="The working bug fix..."
                    value={correctedSolution}
                    onChange={(e) => setCorrectedSolution(e.target.value)}
                  />
                </div>
              </div>

              <div className="ls-field">
                <label className="ls-label">Cognitive Root Cause & Takeaway</label>
                <input
                  type="text"
                  className="ls-input"
                  placeholder="e.g. Always check if middle element index causes overflow with right bounds"
                  value={fixExplanation}
                  onChange={(e) => setFixExplanation(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* SECTION SPECIFIC: Code Snippet (for Learnings, Notes) */}
          {section !== 'mistakes' && (
            <div className="ls-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="ls-label">Code Snippet / Pattern (Optional)</label>
                <select
                  className="ls-select"
                  style={{ width: 'auto', padding: '3px 8px', height: '28px' }}
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <textarea
                rows={4}
                className="ls-textarea code"
                placeholder="Paste reference syntax, algorithm pattern, or template..."
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
              />
            </div>
          )}

          {/* SECTION SPECIFIC: Ideas checklist */}
          {section === 'ideas' && (
            <div className="ls-action-box" style={{ padding: '16px' }}>
              <span className="ls-label" style={{ color: 'var(--violet)', marginBottom: '8px', display: 'block' }}>
                Action Items & Milestones
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="ls-input"
                  placeholder="e.g. Benchmark with 10^5 elements"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddActionItem();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddActionItem}
                  className="btn btn-secondary btn-sm"
                >
                  Add Step
                </button>
              </div>
              {actionItems.map((act) => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', fontSize: '11.5px', color: 'var(--muted)' }}>
                  <span>• {act.text}</span>
                  <button
                    type="button"
                    onClick={() => setActionItems((prev) => prev.filter((a) => a.id !== act.id))}
                    className="ls-icon-btn danger"
                    style={{ width: '22px', height: '22px' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Common Resources */}
          <div className="ls-field">
            <label className="ls-label">Add Reference Link / PDF Resource</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                style={{ width: '35%' }}
                className="ls-input"
                placeholder="Label (e.g. MIT 6.006 PDF)"
                value={resourceLabel}
                onChange={(e) => setResourceLabel(e.target.value)}
              />
              <input
                type="url"
                style={{ flex: 1 }}
                className="ls-input"
                placeholder="https://..."
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddResource}
                className="btn btn-secondary btn-sm"
              >
                Attach
              </button>
            </div>
            {resources.length > 0 && (
              <div className="ls-resources-strip" style={{ marginTop: '8px' }}>
                {resources.map((res) => (
                  <span
                    key={res.id}
                    className="ls-resource-btn"
                  >
                    <span>{res.label}</span>
                    <button
                      type="button"
                      onClick={() => setResources((prev) => prev.filter((r) => r.id !== res.id))}
                      style={{ background: 'transparent', border: 0, color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status, Tags & Bookmark */}
          <div className="ls-form-grid cols-3" style={{ borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
            <div className="ls-field">
              <label className="ls-label">Mastery Status</label>
              <select
                className="ls-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as LearningStatus)}
              >
                <option value="Learning">Learning</option>
                <option value="Need Revision">Need Revision</option>
                <option value="Understood">Understood</option>
              </select>
            </div>

            <div className="ls-field">
              <label className="ls-label">Tags (comma separated)</label>
              <input
                type="text"
                className="ls-input"
                placeholder="dsa, binary-search, python"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px', color: 'var(--text)', fontWeight: 650 }}>
                <input
                  type="checkbox"
                  checked={bookmarked}
                  onChange={(e) => setBookmarked(e.target.checked)}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={13} style={{ fill: bookmarked ? 'var(--amber)' : 'none', color: 'var(--amber)' }} />
                  <span>Priority Bookmark</span>
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {initialItem ? 'Save Changes' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
