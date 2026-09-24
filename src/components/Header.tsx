import React from 'react';
import { Plus, Sun, Moon } from 'lucide-react';
import type { Theme } from '../types';

interface HeaderProps {
  onNewNote: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isInsideNote?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewNote,
  theme,
  onToggleTheme,
  isInsideNote = false,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-dot" />
        <span className="brand-name">Flow</span>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {!isInsideNote && (
          <button
            type="button"
            className="new-note-btn"
            onClick={onNewNote}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>New Note</span>
          </button>
        )}
      </div>
    </header>
  );
};
