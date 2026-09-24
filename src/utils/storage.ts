import type { Note } from '../types';

const STORAGE_KEY = 'flow_notes_data_v1';
const SELECTED_NOTE_KEY = 'flow_selected_note_id';
const THEME_KEY = 'flow_theme_pref';

export function loadSelectedNoteId(): string | null {
  try {
    return localStorage.getItem(SELECTED_NOTE_KEY);
  } catch {
    return null;
  }
}

export function saveSelectedNoteId(noteId: string | null): void {
  try {
    if (noteId) {
      localStorage.setItem(SELECTED_NOTE_KEY, noteId);
    } else {
      localStorage.removeItem(SELECTED_NOTE_KEY);
    }
  } catch (err) {
    console.error('Failed to save selected note id to localStorage', err);
  }
}

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load notes from localStorage', err);
    return [];
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes to localStorage', err);
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // fallback
  }
  return 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme', err);
  }
}
