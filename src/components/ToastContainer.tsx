import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  Trash2,
  Copy,
  Send,
  Save,
  BookmarkCheck,
  BookmarkX,
  LogIn,
  LogOut,
  Sparkles,
  CheckCheck,
  ArrowLeftRight,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  const getIcon = (name?: string) => {
    switch (name) {
      case 'circle-check':
      case 'check':
        return <CheckCircle size={15} />;
      case 'circle-alert':
      case 'alert':
        return <AlertCircle size={15} />;
      case 'trash-2':
        return <Trash2 size={15} />;
      case 'copy':
        return <Copy size={15} />;
      case 'send':
        return <Send size={15} />;
      case 'save':
        return <Save size={15} />;
      case 'bookmark-check':
        return <BookmarkCheck size={15} />;
      case 'bookmark-x':
        return <BookmarkX size={15} />;
      case 'log-in':
        return <LogIn size={15} />;
      case 'log-out':
        return <LogOut size={15} />;
      case 'sparkles':
        return <Sparkles size={15} />;
      case 'check-check':
        return <CheckCheck size={15} />;
      case 'arrow-left-right':
        return <ArrowLeftRight size={15} />;
      default:
        return <Info size={15} />;
    }
  };

  return (
    <div id="toast-root" className="toast-root" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast" onClick={() => removeToast(t.id)}>
          <span className="toast-icon">{getIcon(t.icon)}</span>
          <span>
            <strong>{t.title}</strong>
            {t.message && <span>{t.message}</span>}
          </span>
        </div>
      ))}
    </div>
  );
};
