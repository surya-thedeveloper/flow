import React, { useEffect, useRef } from 'react';
import type { Note } from '../types';
import { ProgressBar } from './ProgressBar';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  deletingNoteId?: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  deletingNoteId,
  isCollapsed,
  onToggleCollapse,
  onSelectNote,
  onCreateNote,
}) => {
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll sidebar to the active note on reload and selection
  useEffect(() => {
    if (activeItemRef.current && !isCollapsed) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedNoteId, isCollapsed]);

  return (
    <>
      {/* Persistent Flow Brand Header */}
      <div className={`persistent-flow-brand ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="modern-flow-logo">
          <svg
            width="34"
            height="34"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 16C8 5 12 27 16 16C20 5 24 27 28 16"
              stroke="url(#flow-gradient-lg)"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="flow-gradient-lg" x1="4" y1="16" x2="28" y2="16" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00f2fe" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="big-flow-title">Flow</span>
      </div>

      {/* Floating Slogan on Right Side Center when Collapsed */}
      {isCollapsed && (
        <div className="persistent-flow-slogan collapsed">
          <span>Keep Flowing...</span>
        </div>
      )}

      <aside className={`sidebar-pane ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Vertical Wavy Divider along right edge of sidebar */}
        <svg
          className="sidebar-vertical-wave-divider"
          viewBox="0 0 16 1000"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vertical-wave-stroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0, 242, 254, 0.45)" />
              <stop offset="35%" stopColor="rgba(56, 189, 248, 0.3)" />
              <stop offset="70%" stopColor="rgba(37, 99, 235, 0.38)" />
              <stop offset="100%" stopColor="rgba(0, 242, 254, 0.3)" />
            </linearGradient>
          </defs>
          <path
            d="M 8,0 C 14,80 2,160 8,240 C 14,320 2,400 8,480 C 14,560 2,640 8,720 C 14,800 2,880 8,960 L 8,1000"
            fill="none"
            stroke="url(#vertical-wave-stroke)"
            strokeWidth="2"
          />
        </svg>

        {/* Edge Strip Toggle Button at bottom end - blends into sidebar */}
        <button
          type="button"
          className="sidebar-edge-toggle-strip"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          aria-label={isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          {isCollapsed ? <ChevronRight size={15} strokeWidth={2.5} /> : <ChevronLeft size={15} strokeWidth={2.5} />}
        </button>

        {/* Top Section with Add New Button (No inner toggle icon) */}
        <div className="sidebar-top-section">
          <button
            type="button"
            className="sidebar-add-new-btn"
            onClick={onCreateNote}
            title="Add new"
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>Add New</span>
          </button>
        </div>

        {/* Notes List - fully hidden when collapsed with NO icons */}
        {!isCollapsed && (
          <>
            <div className="sidebar-items-list">
              {notes.length === 0 ? (
                <div className="sidebar-empty-state">
                  <p>No items yet.</p>
                  <button
                    type="button"
                    className="sidebar-empty-create-btn"
                    onClick={onCreateNote}
                  >
                    + Add New
                  </button>
                </div>
              ) : (
                notes.map((note) => {
                  const isSelected = note.id === selectedNoteId;
                  const isDeleting = note.id === deletingNoteId;
                  const completedCount = note.tasks.filter((t) => t.completed).length;
                  const totalCount = note.tasks.length;

                  return (
                    <div
                      key={note.id}
                      ref={isSelected ? activeItemRef : null}
                      className={`sidebar-row-item ${isSelected ? 'active' : ''} ${
                        isDeleting ? 'is-deleting-tile' : ''
                      }`}
                      onClick={() => {
                        if (!isDeleting) {
                          onSelectNote(note.id);
                          // Auto-close sidebar drawer on mobile
                          if (window.innerWidth <= 768 && !isCollapsed) {
                            onToggleCollapse();
                          }
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onSelectNote(note.id);
                        }
                      }}
                    >
                      <span className="row-item-title">{note.title || 'Untitled'}</span>
                      <div className="sidebar-item-progress">
                        <ProgressBar
                          completed={completedCount}
                          total={totalCount}
                          size="compact"
                          showLabel={false}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Slogan fixed inside sidebar flex bottom - no scroll overlap */}
            <div className="sidebar-bottom-slogan">
              <span>Keep Flowing...</span>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

