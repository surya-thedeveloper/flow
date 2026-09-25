import { useState, useEffect } from 'react';
import type { Note } from './types';
import { loadNotes, saveNotes, loadSelectedNoteId, saveSelectedNoteId } from './utils/storage';
import { NoteList } from './components/NoteList';
import { NoteDetail } from './components/NoteDetail';
import { Plus } from 'lucide-react';
import './App.css';

export function App() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    const initial = loadNotes();
    const savedId = loadSelectedNoteId();
    if (savedId && initial.some((n) => n.id === savedId)) {
      return savedId;
    }
    return initial.length > 0 ? initial[0].id : null;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth <= 768);

  // Always force dark mode midnight theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Save notes and active note to localStorage
  useEffect(() => {
    saveNotes(notes);
    if (selectedNoteId && !notes.some((n) => n.id === selectedNoteId)) {
      const nextId = notes.length > 0 ? notes[0].id : null;
      setSelectedNoteId(nextId);
      saveSelectedNoteId(nextId);
    } else {
      saveSelectedNoteId(selectedNoteId);
    }
  }, [notes, selectedNoteId]);

  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tasks: [],
    };

    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    saveSelectedNoteId(newNote.id);
  };

  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setDeletingNoteId(noteId);
    setTimeout(() => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setDeletingNoteId(null);
    }, 260);
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="flow-midnight-app">
      <div className="app-split-layout">
        {/* Left Sidebar: Notes List */}
        <NoteList
          notes={notes}
          selectedNoteId={selectedNoteId}
          deletingNoteId={deletingNoteId}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          onSelectNote={(id) => setSelectedNoteId(id)}
          onCreateNote={handleCreateNewNote}
        />

        {/* Center Workspace: Selected Note */}
        <main className={`main-center-pane ${isSidebarCollapsed ? 'expanded-center' : ''}`}>
          {selectedNote ? (
            <NoteDetail
              note={selectedNote}
              isDeleting={selectedNote.id === deletingNoteId}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          ) : (
            <div className="empty-center-view">
              <h2>No Selection</h2>
              <p>Select from the sidebar or add new.</p>
              <button
                type="button"
                className="empty-create-btn"
                onClick={handleCreateNewNote}
              >
                <Plus size={16} />
                <span>Add New</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
