import React, { useState } from 'react';
import {
  Upload,
  UserPlus,
  UserCheck,
  AlertCircle,
  Activity,
  Medal,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpRight,
  X,
  Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StudentsView: React.FC = () => {
  const { students, addToast } = useApp();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');

  const activeCount = students.filter((s) => s.status === 'Active').length;
  const needAttentionCount = students.filter((s) => s.status === 'At risk').length;
  const avgAccuracy = Math.round(
    students.reduce((sum, s) => sum + s.accuracy, 0) / (students.length || 1)
  );

  const filtered =
    batchFilter === 'All' ? students : students.filter((s) => s.batch === batchFilter);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      addToast('Invite sent', `Invitation dispatched to ${inviteEmail}.`, 'send');
      setInviteEmail('');
      setInviteModalOpen(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Learner directory</span>
          <h2>Every student, in focus.</h2>
          <p>Review participation, scores, and learners who need support.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => addToast('List imported', 'Imported batch 5.0 roster.', 'upload')}
          >
            <Upload size={14} />
            Import list
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setInviteModalOpen(true)}
          >
            <UserPlus size={14} />
            Invite students
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <article className="glass-card stat-card" style={{ '--stat-color': '#4de3a3' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <UserCheck size={16} />
            </span>
            <span className="stat-trend">—</span>
          </div>
          <div className="stat-number">{activeCount}</div>
          <div className="stat-label">Active students</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#ff7d91' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <AlertCircle size={16} />
            </span>
            <span className="stat-trend down">—</span>
          </div>
          <div className="stat-number">{needAttentionCount}</div>
          <div className="stat-label">Need attention</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#4d94ff' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Activity size={16} />
            </span>
            <span className="stat-trend">—</span>
          </div>
          <div className="stat-number">{avgAccuracy}%</div>
          <div className="stat-label">Avg. participation</div>
        </article>

        <article className="glass-card stat-card" style={{ '--stat-color': '#ffbf62' } as any}>
          <div className="stat-head">
            <span className="stat-icon">
              <Medal size={16} />
            </span>
            <span className="stat-trend">—</span>
          </div>
          <div className="stat-number">Batch 5.0</div>
          <div className="stat-label">Top batch</div>
        </article>
      </div>

      <article className="glass-card panel">
        <div className="panel-head">
          <div className="panel-title">
            <h3>Student performance</h3>
            <p>All enrolled learners · updated live</p>
          </div>
          <div className="page-actions">
            <select
              className="btn btn-secondary btn-sm"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="All">All batches</option>
              <option value="5.0">Batch 5.0</option>
              <option value="4.0">Batch 4.0</option>
              <option value="3.0">Batch 3.0</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Batch</th>
                <th>Attempts</th>
                <th>Total score</th>
                <th>Accuracy</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="table-user">
                      <span
                        className="mini-avatar"
                        style={
                          {
                            '--av1': s.color[0],
                            '--av2': s.color[1],
                          } as any
                        }
                      >
                        {getInitials(s.name)}
                      </span>
                      {s.name}
                    </div>
                  </td>
                  <td>Batch {s.batch}</td>
                  <td>{s.attempts}</td>
                  <td className="table-score">{s.score}</td>
                  <td>
                    <div className="accuracy-bar">
                      <span>{s.accuracy}%</span>
                      <i className="accuracy-track">
                        <i style={{ width: `${s.accuracy}%` }}></i>
                      </i>
                    </div>
                  </td>
                  <td>
                    <span className={`chip ${s.status === 'Active' ? 'published' : 'draft'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="card-menu"
                      onClick={() =>
                        addToast(`Student Details: ${s.name}`, `Batch ${s.batch} · ${s.accuracy}% accuracy`, 'users')
                      }
                      aria-label="View learner"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div id="modal-root">
          <div className="modal-backdrop" onClick={() => setInviteModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h3>Invite learners</h3>
                  <p>Send an invitation link or email directly to students.</p>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setInviteModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSendInvite}>
                <div className="modal-body">
                  <div className="field">
                    <label>Student email address</label>
                    <input
                      className="form-control"
                      type="email"
                      placeholder="student@uzone.edu"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field" style={{ marginTop: '12px' }}>
                    <label>Target batch</label>
                    <select className="form-select">
                      <option>Batch 5.0 (Current)</option>
                      <option>Batch 4.0</option>
                      <option>Batch 3.0</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setInviteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Mail size={14} />
                    Send invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
