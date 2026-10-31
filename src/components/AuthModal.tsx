import React, { useState } from 'react';
import { Presentation, GraduationCap, ArrowRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, role, login, signup } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<Role>(role);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      signup(name, email || 'user@uzone.edu', password, authRole);
    } else {
      login(email || (authRole === 'teacher' ? 'teacher@uzone.edu' : 'student@uzone.edu'), password, authRole);
    }
  };

  return (
    <div id="modal-root">
      <div
        className="modal-backdrop"
        onClick={() => setAuthModalOpen(false)}
        aria-hidden="true"
      >
        <div className="modal wide" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="modal-close"
            style={{ position: 'absolute', right: '16px', top: '16px', zIndex: 10 }}
            onClick={() => setAuthModalOpen(false)}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
          <div className="auth-modal">
            <section className="auth-art">
              <div className="brand">
                <div className="brand-mark">U</div>
                <div className="brand-copy">
                  Uzone<span>Quiz</span>
                  <small>Learn · Test · Grow</small>
                </div>
              </div>
              <div className="auth-quote">
                <div className="mini-doodle">✦ 〰 ✎</div>
                <h3>Turn every question into a little win.</h3>
                <p>
                  One focused space for teaching, assessment, insight, and joyful learning.
                </p>
              </div>
            </section>

            <section className="auth-form">
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => setMode('login')}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => setMode('signup')}
                >
                  Create account
                </button>
              </div>

              <h2>{mode === 'login' ? 'Welcome back.' : 'Join UzoneQuiz.'}</h2>
              <p>
                {mode === 'login'
                  ? 'Pick up right where you left off.'
                  : 'Start creating or practicing in seconds.'}
              </p>

              <form onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div className="field" style={{ marginBottom: '12px' }}>
                    <label>Full name</label>
                    <input
                      id="auth-name"
                      className="form-control"
                      placeholder="e.g. Professor Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="field" style={{ marginBottom: '12px' }}>
                  <label>Email address</label>
                  <input
                    id="auth-email"
                    className="form-control"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>
                    Password{' '}
                    <span>{mode === 'login' ? 'Forgot password?' : '8+ characters'}</span>
                  </label>
                  <input
                    id="auth-password"
                    className="form-control"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="field" style={{ marginTop: '14px' }}>
                  <label>Continue as</label>
                  <div className="role-cards">
                    <button
                      type="button"
                      className={`role-card ${authRole === 'teacher' ? 'active' : ''}`}
                      onClick={() => setAuthRole('teacher')}
                    >
                      <span className="role-card-icon">
                        <Presentation size={18} />
                      </span>
                      <span>
                        <strong>Teacher</strong>
                        <span>Create & analyze</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`role-card ${authRole === 'student' ? 'active' : ''}`}
                      onClick={() => setAuthRole('student')}
                    >
                      <span className="role-card-icon">
                        <GraduationCap size={18} />
                      </span>
                      <span>
                        <strong>Student</strong>
                        <span>Practice & grow</span>
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  {mode === 'login' ? 'Log in' : 'Create account'} <ArrowRight size={14} />
                </button>
                <p
                  style={{
                    textAlign: 'center',
                    margin: '14px 0 0',
                    color: 'var(--muted-2)',
                    fontSize: '8px',
                  }}
                >
                  Interactive demo mode · State persists in browser
                </p>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
