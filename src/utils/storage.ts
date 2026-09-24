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

export const SEED_NOTES: Note[] = [
  {
    id: 'seed-note-1',
    title: 'Product Design & Setup',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    updatedAt: Date.now() - 1000 * 60 * 25,
    tasks: [
      { id: 't1-1', title: 'Review user specifications & goals', completed: true, createdAt: 1 },
      { id: 't1-2', title: 'Set up split layout and midnight theme', completed: true, createdAt: 2 },
      { id: 't1-3', title: 'Configure neon blue gradient progress bar', completed: false, createdAt: 3 },
      { id: 't1-4', title: 'Implement 2-item list view with expander', completed: false, createdAt: 4 },
      { id: 't1-5', title: 'Test persistence across browser sessions', completed: false, createdAt: 5 },
    ],
  },
  {
    id: 'seed-note-2',
    title: 'Weekly Focus & Deliverables',
    createdAt: Date.now() - 1000 * 60 * 60 * 28,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    tasks: [
      { id: 't2-1', title: 'Review open pull requests and feedback', completed: true, createdAt: 1 },
      { id: 't2-2', title: 'Refactor local storage persistence hook', completed: true, createdAt: 2 },
      { id: 't2-3', title: 'Fine-tune smooth neon progress animation', completed: true, createdAt: 3 },
      { id: 't2-4', title: 'Optimize typography and spacious layout', completed: false, createdAt: 4 },
      { id: 't2-5', title: 'Conduct cross-browser verification', completed: false, createdAt: 5 },
      { id: 't2-6', title: 'Audit contrast and keyboard shortcuts', completed: false, createdAt: 6 },
      { id: 't2-7', title: 'Package production build artifacts', completed: false, createdAt: 7 },
      { id: 't2-8', title: 'Summarize weekly release highlights', completed: false, createdAt: 8 },
    ],
  },
  {
    id: 'seed-note-3',
    title: 'Reading & Research Notes',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    tasks: [
      { id: 't3-1', title: 'Read "The Design of Everyday Things"', completed: false, createdAt: 1 },
      { id: 't3-2', title: 'Explore minimalist UI patterns and micro-interactions', completed: false, createdAt: 2 },
    ],
  },
];

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveNotes(SEED_NOTES);
      return SEED_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array in storage, still return it (user deleted all)
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return SEED_NOTES;
  } catch (err) {
    console.error('Failed to load notes from localStorage', err);
    return SEED_NOTES;
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
