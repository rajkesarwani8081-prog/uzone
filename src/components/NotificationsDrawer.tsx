import React from 'react';
import { X, CheckCheck, FileText, Trophy, Flame, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsDrawer: React.FC = () => {
  const {
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    markNotificationsRead,
  } = useApp();

  if (!notificationsOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'file-text':
        return <FileText size={16} />;
      case 'trophy':
        return <Trophy size={16} />;
      case 'flame':
        return <Flame size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <div id="drawer-root">
      <div
        className="drawer-backdrop"
        onClick={() => setNotificationsOpen(false)}
        aria-hidden="true"
      />
      <aside className="drawer">
        <div className="drawer-head">
          <div>
            <h3>Notifications</h3>
            <span style={{ color: 'var(--muted)', fontSize: '8px' }}>
              {unreadCount ? `${unreadCount} new update${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
            </span>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={() => setNotificationsOpen(false)}
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ margin: '0 0 11px auto', display: 'flex' }}
            onClick={markNotificationsRead}
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}

        <div className="notification-list">
          {notifications.map((n) => (
            <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
              <span className="notification-icon">{getIcon(n.icon)}</span>
              <span className="notification-copy">
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <span>{n.time}</span>
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
