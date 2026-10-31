import React, { useEffect, useRef } from 'react';
import { CodingLanguage } from '../types';

interface LeetCodeEditorProps {
  value: string;
  language: CodingLanguage;
  onChange: (value: string) => void;
  theme?: 'dark' | 'light' | 'aurora';
}

export const LeetCodeEditor: React.FC<LeetCodeEditorProps> = ({
  value,
  language,
  onChange,
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cmInstanceRef = useRef<any>(null);
  const isInternalChangeRef = useRef(false);

  const getCmMode = (lang: CodingLanguage): string => {
    switch (lang) {
      case 'java':
        return 'text/x-java';
      case 'cpp':
        return 'text/x-c++src';
      case 'python':
        return 'python';
      case 'javascript':
      default:
        return 'javascript';
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cm = (window as any).CodeMirror;
    if (cm) {
      container.innerHTML = '';
      const instance = cm(container, {
        value,
        mode: getCmMode(language),
        theme: theme === 'light' ? 'default' : 'material-darker',
        lineNumbers: true,
        tabSize: 4,
        indentUnit: 4,
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
      });

      cmInstanceRef.current = instance;

      instance.on('change', () => {
        isInternalChangeRef.current = true;
        const currentVal = instance.getValue();
        onChange(currentVal);
        setTimeout(() => {
          isInternalChangeRef.current = false;
        }, 0);
      });

      return () => {
        container.innerHTML = '';
        cmInstanceRef.current = null;
      };
    }
  }, [language, theme]);

  // Sync external value changes into CodeMirror without resetting cursor
  useEffect(() => {
    const cm = cmInstanceRef.current;
    if (cm && !isInternalChangeRef.current) {
      if (cm.getValue() !== value) {
        const cursor = cm.getCursor();
        cm.setValue(value);
        cm.setCursor(cursor);
      }
    }
  }, [value]);

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      const next = val.substring(0, start) + '    ' + val.substring(end);
      onChange(next);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      }, 0);
    }
  };

  const hasCodeMirror = typeof (window as any).CodeMirror !== 'undefined';

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {!hasCodeMirror && (
        <textarea
          className="lc-editor-fallback"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder={`Write your ${language.toUpperCase()} solution here...`}
        />
      )}
    </div>
  );
};
