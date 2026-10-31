import React, { useState } from 'react';
import {
  Swords,
  Users,
  Flame,
  Clock,
  Calendar,
  Check,
  X,
  Play,
  Award,
  ChevronRight,
  ShieldAlert,
  Search,
  MessageSquare,
  Lock,
  Trophy,
  History,
  TrendingUp,
  FileCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PeerBattle, BattleSet } from '../types';
import { canBattle } from '../data/battleEngine';

export const PeerBattleHub: React.FC = () => {
  const {
    user,
    students,
    battleSets,
    battles,
    createBattleRequest,
    acceptBattleRequest,
    rejectBattleRequest,
    cancelBattleRequest,
    startBattle,
    setActiveBattleResult,
    setPage,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'classmates' | 'requests' | 'battleSets' | 'history'>('classmates');
  const [search, setSearch] = useState('');

  // Challenge Modal State
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<{ id: string; name: string; batch: string } | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [battleType, setBattleType] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledDate, setScheduledDate] = useState('Today, 5:00 PM');
  const [wagerNote, setWagerNote] = useState('Ready for a DSA sprint? Let the best coder win!');

  const userBatch = user?.batch || '5.0';
  const currentUserName = user?.name || 'Aarav Sharma';

  // Only battle sets published for this student's enrolled course/batch
  const availableBattleSets = battleSets.filter(
    (s) => s.status === 'Published' && s.batch === userBatch
  );

  // Enrolled classmates (students with matching batch, excluding current user)
  const enrolledClassmates = students.filter(
    (s) => s.batch === userBatch && s.name.toLowerCase() !== currentUserName.toLowerCase()
  );

  // Other students in different batches (for enrollment restriction display)
  const otherBatchStudents = students.filter(
    (s) => s.batch !== userBatch
  );

  // Battles categorized for current student
  const incomingRequests = battles.filter(
    (b) =>
      b.status === 'pending' &&
      (b.targetName.toLowerCase() === currentUserName.toLowerCase() ||
        b.targetStudentId === user?.id ||
        b.targetName === 'You')
  );

  const outgoingPending = battles.filter(
    (b) =>
      b.status === 'pending' &&
      (b.initiatorName.toLowerCase() === currentUserName.toLowerCase() ||
        b.initiatorStudentId === user?.id ||
        b.initiatorName === 'You')
  );

  const activeOrUpcomingBattles = battles.filter(
    (b) =>
      (b.status === 'accepted' || b.status === 'in_progress') &&
      (b.initiatorName.toLowerCase() === currentUserName.toLowerCase() ||
        b.targetName.toLowerCase() === currentUserName.toLowerCase() ||
        b.targetName === 'You' ||
        b.initiatorName === 'You')
  );

  const completedBattles = battles.filter(
    (b) =>
      b.status === 'completed' &&
      (b.initiatorName.toLowerCase() === currentUserName.toLowerCase() ||
        b.targetName.toLowerCase() === currentUserName.toLowerCase() ||
        b.targetName === 'You' ||
        b.initiatorName === 'You')
  );

  const openChallengeModal = (opponent: { name: string; batch: string }) => {
    if (!canBattle({ batch: userBatch }, { batch: opponent.batch })) {
      addToast(
        'Classroom Restriction',
        `Cannot challenge students outside your enrolled batch (${userBatch} vs ${opponent.batch}).`,
        'lock'
      );
      return;
    }
    if (availableBattleSets.length === 0) {
      addToast('No Battle Sets', `No published battle sets found for Batch ${userBatch}.`, 'circle-alert');
      return;
    }
    setSelectedOpponent({ id: `student-${opponent.name.toLowerCase().replace(/\s+/g, '')}`, name: opponent.name, batch: opponent.batch });
    setSelectedSetId(availableBattleSets[0]?.id || '');
    setBattleType('instant');
    setChallengeModalOpen(true);
  };

  const handleSendChallenge = () => {
    if (!selectedOpponent || !selectedSetId) return;

    createBattleRequest({
      battleSetId: selectedSetId,
      targetStudentId: selectedOpponent.id,
      targetName: selectedOpponent.name,
      isScheduled: battleType === 'scheduled',
      scheduledFor: battleType === 'scheduled' ? scheduledDate : undefined,
      note: wagerNote,
    });

    setChallengeModalOpen(false);
    setActiveTab('requests');
  };

  const handleViewAnalysis = (battle: PeerBattle) => {
    setActiveBattleResult(battle);
    setPage('battleResult');
  };

  // Class battle statistics
  const myCompletedBattles = completedBattles;
  const myWins = myCompletedBattles.filter(
    (b) => b.winner && (b.winner.toLowerCase() === currentUserName.toLowerCase() || b.winner === 'You')
  ).length;
  const myLosses = myCompletedBattles.filter(
    (b) => b.winner && b.winner !== 'tie' && b.winner.toLowerCase() !== currentUserName.toLowerCase() && b.winner !== 'You'
  ).length;

  return (
    <section className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Swords size={13} style={{ color: 'var(--amber)' }} />
            Peer Coding Arena · Batch {userBatch}
          </span>
          <h2>Compete With Your Classmates</h2>
          <p>
            Challenge fellow students in your class to real-time coding duels with identical problems,
            synchronized timers, and deep side-by-side performance analytics.
          </p>
        </div>

        <div className="page-actions">
          {incomingRequests.length > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab('requests')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Flame size={14} style={{ color: '#ffc93d' }} />
              {incomingRequests.length} Pending Challenge{incomingRequests.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="lc-toolbar" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={`lc-chip ${activeTab === 'classmates' ? 'active' : ''}`}
          onClick={() => setActiveTab('classmates')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={13} />
          Enrolled Classmates ({enrolledClassmates.length})
        </button>

        <button
          type="button"
          className={`lc-chip ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Swords size={13} />
          Active & Requests ({incomingRequests.length + activeOrUpcomingBattles.length})
        </button>

        <button
          type="button"
          className={`lc-chip ${activeTab === 'battleSets' ? 'active' : ''}`}
          onClick={() => setActiveTab('battleSets')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <FileCode size={13} />
          Available Battle Sets ({availableBattleSets.length})
        </button>

        <button
          type="button"
          className={`lc-chip ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <History size={13} />
          Battle History & Leaderboard ({completedBattles.length})
        </button>
      </div>

      {/* TAB 1: ENROLLED CLASSMATES */}
      {activeTab === 'classmates' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Classmates in Batch {userBatch}</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                Only peers enrolled in your exact class/course can be challenged to coding duels.
              </p>
            </div>
            <div className="lc-search" style={{ width: '240px' }}>
              <Search size={13} />
              <input
                type="text"
                placeholder="Search classmates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Classmates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {enrolledClassmates
              .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))
              .map((classmate, i) => (
                <div
                  key={i}
                  className="paper-card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: `linear-gradient(135deg, ${classmate.color[0]}, ${classmate.color[1]})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '15px',
                        }}
                      >
                        {classmate.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {classmate.name}
                        </h4>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '8.5px', padding: '1px 6px' }}>
                            Batch {classmate.batch}
                          </span>
                          <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                            {classmate.accuracy}% Acc
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--green)',
                          boxShadow: '0 0 6px rgba(32, 141, 104, 0.6)',
                        }}
                        title="Online in course arena"
                      />
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        padding: '8px 10px',
                        background: 'var(--surface-2)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        marginBottom: '14px',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--muted)', fontSize: '10px', display: 'block' }}>Score</span>
                        <strong>{classmate.score}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)', fontSize: '10px', display: 'block' }}>Total Solved</span>
                        <strong>{classmate.attempts} problems</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => openChallengeModal(classmate)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Swords size={13} />
                    Challenge to Battle
                  </button>
                </div>
              ))}
          </div>

          {/* Different Batches / Locked Section (Rule 6 enforcement) */}
          <div style={{ opacity: 0.75, borderTop: '1px dashed var(--line)', paddingTop: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Lock size={14} style={{ color: 'var(--muted)' }} />
              <h4 style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--muted)' }}>
                Other Batches (Course Isolation Enforced)
              </h4>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted-2)', marginBottom: '12px' }}>
              Students from different academic tracks or semesters cannot be challenged to maintain fair syllabus parity.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {otherBatchStudents.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'var(--surface-2)',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    fontSize: '11px',
                    color: 'var(--muted)',
                  }}
                >
                  <Lock size={11} />
                  <span>{s.name}</span>
                  <span className="badge" style={{ fontSize: '8px', background: 'var(--surface-solid)' }}>
                    Batch {s.batch}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE & REQUESTS */}
      {activeTab === 'requests' && (
        <div style={{ display: 'grid', gap: '22px' }}>
          {/* Incoming Battle Requests */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Flame size={16} style={{ color: 'var(--amber)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Incoming Challenges ({incomingRequests.length})</h3>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="lc-empty" style={{ background: 'var(--surface)', borderRadius: '12px' }}>
                No pending incoming challenges at the moment. Challenge a classmate from the list!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {incomingRequests.map((battle) => (
                  <div
                    key={battle.id}
                    className="paper-card"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: '4px solid var(--amber)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '14px' }}>{battle.initiatorName}</strong>
                        <span className="badge badge-primary" style={{ fontSize: '8.5px' }}>
                          Batch {battle.batch}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                          challenged you!
                        </span>
                      </div>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '4px' }}>
                        {battle.battleSetTitle}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {battle.duration} mins · {battle.totalMarks} marks · {battle.codingProblemIds.length} problems
                        {battle.note ? ` · "${battle.note}"` : ''}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#e14e68' }}
                        onClick={() => rejectBattleRequest(battle.id)}
                      >
                        <X size={14} />
                        Decline
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => acceptBattleRequest(battle.id)}
                      >
                        <Check size={14} />
                        Accept Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active & Scheduled Battles */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={16} style={{ color: 'var(--blue)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                Accepted & Upcoming Battles ({activeOrUpcomingBattles.length})
              </h3>
            </div>

            {activeOrUpcomingBattles.length === 0 ? (
              <div className="lc-empty" style={{ background: 'var(--surface)', borderRadius: '12px' }}>
                No active or scheduled battles right now.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {activeOrUpcomingBattles.map((battle) => {
                  const opponentName =
                    battle.initiatorName.toLowerCase() === currentUserName.toLowerCase()
                      ? battle.targetName
                      : battle.initiatorName;

                  return (
                    <div
                      key={battle.id}
                      className="paper-card"
                      style={{
                        padding: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderLeft: '4px solid var(--blue)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '8.5px' }}>
                            {battle.isScheduled ? 'Scheduled Battle' : 'Ready to Duel'}
                          </span>
                          <strong style={{ fontSize: '14px' }}>
                            vs. {opponentName}
                          </strong>
                          {battle.scheduledFor && (
                            <span style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 600 }}>
                              {battle.scheduledFor}
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '4px' }}>
                          {battle.battleSetTitle}
                        </h4>
                        <p style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                          {battle.duration} mins countdown · {battle.totalMarks} total points · Same problems & start time
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => startBattle(battle.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Play size={14} />
                        Enter Battle Arena
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Sent Requests */}
          {outgoingPending.length > 0 && (
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '10px' }}>
                Awaiting Opponent Acceptance ({outgoingPending.length})
              </h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {outgoingPending.map((battle) => (
                  <div
                    key={battle.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--surface-2)',
                      borderRadius: '10px',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
                        Challenge sent to {battle.targetName}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>
                        ({battle.battleSetTitle} · {battle.duration}m)
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => cancelBattleRequest(battle.id)}
                      style={{ fontSize: '11px' }}
                    >
                      Withdraw Request
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AVAILABLE BATTLE SETS */}
      {activeTab === 'battleSets' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Teacher-Curated Battle Sets for Batch {userBatch}</h3>
            <p style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
              Sets created specifically for your course by your professors. Select any set to initiate a challenge.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {availableBattleSets.map((bSet) => (
              <div
                key={bSet.id}
                className="paper-card"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `3px solid ${
                    bSet.difficulty === 'Easy' ? '#1f9e8e' : bSet.difficulty === 'Medium' ? '#eab234' : '#e14e68'
                  }`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={`lc-diff ${bSet.difficulty.toLowerCase()}`}>
                      {bSet.difficulty}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {bSet.duration} mins · {bSet.marks} pts
                    </span>
                  </div>

                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, marginBottom: '6px' }}>
                    {bSet.title}
                  </h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginBottom: '14px' }}>
                    {bSet.subject} · {bSet.topic}
                  </p>

                  <div style={{ fontSize: '11px', color: 'var(--text-soft)', marginBottom: '14px' }}>
                    <strong>{bSet.codingProblemIds.length} Synchronized Problems:</strong>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {bSet.codingProblemIds.map((id) => (
                        <span key={id} className="lc-tag" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          {id.replace(/^lc-(easy|medium|hard)-/, '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedSetId(bSet.id);
                    setSelectedOpponent(enrolledClassmates[0] ? {
                      id: `student-${enrolledClassmates[0].name.toLowerCase()}`,
                      name: enrolledClassmates[0].name,
                      batch: enrolledClassmates[0].batch,
                    } : null);
                    setChallengeModalOpen(true);
                  }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Swords size={13} />
                  Choose Opponent for this Set
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BATTLE HISTORY & CLASS LEADERBOARD */}
      {activeTab === 'history' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '22px' }}>
          {/* History List */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
              Past Duel Records ({completedBattles.length})
            </h3>

            {completedBattles.length === 0 ? (
              <div className="lc-empty" style={{ background: 'var(--surface)', borderRadius: '12px' }}>
                No completed battles recorded yet. Finish a duel to see head-to-head analysis!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {completedBattles.map((battle) => {
                  const isWinner =
                    battle.winner &&
                    (battle.winner.toLowerCase() === currentUserName.toLowerCase() || battle.winner === 'You');
                  const isTie = battle.winner === 'tie' || battle.winner === 'Tie';

                  const opponentName =
                    battle.initiatorName.toLowerCase() === currentUserName.toLowerCase()
                      ? battle.targetName
                      : battle.initiatorName;

                  return (
                    <div
                      key={battle.id}
                      className="paper-card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            className="badge"
                            style={{
                              background: isWinner
                                ? 'rgba(32, 141, 104, 0.15)'
                                : isTie
                                ? 'rgba(234, 178, 52, 0.15)'
                                : 'rgba(225, 78, 104, 0.15)',
                              color: isWinner ? 'var(--green)' : isTie ? 'var(--amber)' : '#ff7b93',
                              fontWeight: 700,
                              fontSize: '9px',
                            }}
                          >
                            {isWinner ? 'VICTORY' : isTie ? 'TIE' : 'DEFEAT'}
                          </span>
                          <strong style={{ fontSize: '13.5px' }}>
                            vs. {opponentName}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {battle.endedAt ? new Date(battle.endedAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '12.5px', color: 'var(--text-soft)', marginBottom: '4px' }}>
                          {battle.battleSetTitle}
                        </h4>

                        <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Score: {battle.initiatorProgress.score} vs {battle.opponentProgress.score} pts ·{' '}
                          {Math.floor(battle.initiatorProgress.timeSpentSec / 60)}m time spent
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewAnalysis(battle)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <TrendingUp size={13} />
                        View Side-by-Side Analysis
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Class Battle Leaderboard */}
          <div className="paper-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Trophy size={16} style={{ color: 'var(--amber)' }} />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Batch {userBatch} Battle Ranks</h4>
                <p style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Based on peer duels & accuracy</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              {[
                { name: 'Ananya Gupta', wins: 8, losses: 1, acc: 95, pts: 480 },
                { name: 'Priya Patel', wins: 6, losses: 2, acc: 93, pts: 410 },
                { name: currentUserName, wins: myWins || 5, losses: myLosses || 2, acc: 88, pts: 360, isMe: true },
                { name: 'Sneha Reddy', wins: 4, losses: 3, acc: 86, pts: 290 },
                { name: 'Aarav Sharma', wins: 3, losses: 4, acc: 84, pts: 240 },
              ]
                .sort((a, b) => b.pts - a.pts)
                .map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: row.isMe ? 'rgba(61, 87, 214, 0.12)' : 'var(--surface-2)',
                      border: row.isMe ? '1px solid rgba(61, 87, 214, 0.3)' : '1px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          font: '700 11px "DM Mono", monospace',
                          width: '18px',
                          color: idx === 0 ? 'var(--amber)' : 'var(--muted)',
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <strong style={{ fontSize: '12.5px', color: row.isMe ? 'var(--blue)' : 'var(--text)' }}>
                          {row.name} {row.isMe && '(You)'}
                        </strong>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                          {row.wins}W - {row.losses}L · {row.acc}% Accuracy
                        </div>
                      </div>
                    </div>

                    <strong style={{ font: '600 12px "DM Mono", monospace' }}>
                      {row.pts} pts
                    </strong>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Challenge Configuration Modal */}
      {challengeModalOpen && (
        <div className="modal-backdrop" onClick={() => setChallengeModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--amber)' }}>Send Battle Request</span>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                  Challenge {selectedOpponent?.name || 'Classmate'}
                </h3>
              </div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setChallengeModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Opponent Confirmation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                background: 'var(--surface-2)',
                borderRadius: '10px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: 'var(--blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {selectedOpponent?.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{selectedOpponent?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Enrolled in Batch {selectedOpponent?.batch} · Equal Syllabus & Problem Access
                </div>
              </div>
            </div>

            {/* Select Battle Set */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                Select Teacher Battle Set *
              </label>
              <select
                className="input"
                value={selectedSetId}
                onChange={(e) => setSelectedSetId(e.target.value)}
                style={{ width: '100%' }}
              >
                {availableBattleSets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.duration} mins · {s.marks} pts · {s.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {/* Duel Scheduling */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                Battle Timing
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button
                  type="button"
                  className={`lc-chip ${battleType === 'instant' ? 'active' : ''}`}
                  onClick={() => setBattleType('instant')}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Instant Battle (Now)
                </button>
                <button
                  type="button"
                  className={`lc-chip ${battleType === 'scheduled' ? 'active' : ''}`}
                  onClick={() => setBattleType('scheduled')}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Schedule for Later
                </button>
              </div>

              {battleType === 'scheduled' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Today at 5:30 PM, or Tomorrow 11:00 AM"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              )}
            </div>

            {/* Friendly Note */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                Friendly Note / Matchup Message
              </label>
              <input
                type="text"
                className="input"
                value={wagerNote}
                onChange={(e) => setWagerNote(e.target.value)}
                placeholder="Add a battle cheer..."
                style={{ width: '100%' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setChallengeModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendChallenge}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Swords size={14} />
                Send Battle Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
