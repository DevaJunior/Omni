import React from 'react';
import { Plus, FileText } from 'lucide-react';
import './styles.css';

export interface Note {
  id: string;
  title: string;
  editedAt: string;
  color: 'orange' | 'blue'; // Extendable
}

interface RecentNotesProps {
  notes?: Note[];
  onAddNote?: () => void;
  onOpenNote?: (id: string) => void;
}

const defaultNotes: Note[] = [
  {
    id: '1',
    title: 'Resultados Preliminares PCR',
    editedAt: 'Editado hoje às 10:45',
    color: 'orange'
  },
  {
    id: '2',
    title: 'Estrutura Artigo Principal',
    editedAt: 'Editado há 3 dias',
    color: 'blue'
  }
];

const RecentNotes: React.FC<RecentNotesProps> = ({
  notes = defaultNotes,
  onAddNote,
  onOpenNote
}) => {
  return (
    <section className="mybench-section">
      <div className="mybench-section-header">
        <h2>Anotações Recentes</h2>
        <button className="btn-icon-circular" onClick={onAddNote}>
          <Plus size={18} />
        </button>
      </div>

      <div className="mybench-notes-grid">
        {notes.map(note => (
          <div 
            key={note.id} 
            className="mybench-card mybench-note-card"
            onClick={() => onOpenNote?.(note.id)}
            style={{ cursor: onOpenNote ? 'pointer' : 'default' }}
          >
            <div className={`note-icon icon-${note.color}`}>
              <FileText size={20} />
            </div>
            <h4>{note.title}</h4>
            <span>{note.editedAt}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentNotes;
