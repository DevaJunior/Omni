import React, { useState } from 'react';
import { X, Search, Plus, FileText, Edit2, Trash2, Save, XCircle, Image as ImageIcon } from 'lucide-react';
import './styles.css';

export interface NoteImage {
  id: string;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: 'orange' | 'blue' | 'green' | 'purple' | 'red';
  editedAt: string;
  images?: NoteImage[];
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Resultados Preliminares PCR',
    content: 'Amostras de 1 a 10 apresentaram amplificação adequada. Banda esperada em ~400bp. Amostra 3 teve rendimento menor, considerar repetir extração.',
    editedAt: 'Hoje às 10:45',
    color: 'orange'
  },
  {
    id: '2',
    title: 'Estrutura Artigo Principal',
    content: 'Introdução:\n- Contexto do problema\n- Abordagens atuais\n\nMétodos:\n- Descrição da técnica de purificação\n- Análises estatísticas\n\nResultados esperados...',
    editedAt: 'Há 3 dias',
    color: 'blue'
  },
  {
    id: '3',
    title: 'Ideias para novo reagente',
    content: 'Testar novo tampão de lise celular, talvez substituir Triton X-100 por Tween 20 para ser mais ameno com certas proteínas de membrana.',
    editedAt: '12 de Outubro',
    color: 'green'
  }
];

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNoteId?: string | null;
}

const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, initialNoteId }) => {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [search, setSearch] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialNoteId || null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Note>>({});

  // Reset state when opened with a specific note
  React.useEffect(() => {
    if (isOpen) {
      if (initialNoteId) {
        setSelectedNoteId(initialNoteId);
        setIsEditing(false);
      } else {
        setSelectedNoteId(null);
        setIsEditing(false);
      }
    }
  }, [isOpen, initialNoteId]);

  if (!isOpen) return null;

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase()) || 
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleCreateNew = () => {
    setSelectedNoteId(null);
    setFormData({
      title: '',
      content: '',
      color: 'blue',
      images: []
    });
    setIsEditing(true);
  };

  const handleEdit = () => {
    if (selectedNote) {
      setFormData({ ...selectedNote });
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    if (selectedNote) {
      if(window.confirm('Tem certeza que deseja excluir esta anotação?')) {
        setNotes(prev => prev.filter(n => n.id !== selectedNote.id));
        setSelectedNoteId(null);
        setIsEditing(false);
      }
    }
  };

  const handleSave = () => {
    if (!formData.title?.trim()) {
      alert('O título não pode ficar vazio.');
      return;
    }

    if (selectedNoteId && notes.some(n => n.id === selectedNoteId)) {
      // Update existing
      setNotes(prev => prev.map(n => n.id === selectedNoteId ? {
        ...n,
        title: formData.title || '',
        content: formData.content || '',
        color: formData.color as any || n.color,
        editedAt: 'Agora mesmo'
      } : n));
    } else {
      // Create new
      const newId = Date.now().toString();
      const newNote: Note = {
        id: newId,
        title: formData.title,
        content: formData.content || '',
        color: formData.color as any || 'blue',
        editedAt: 'Agora mesmo'
      };
      setNotes([newNote, ...notes]);
      setSelectedNoteId(newId);
    }
    
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (selectedNoteId && notes.some(n => n.id === selectedNoteId)) {
      setIsEditing(false);
    } else {
      setSelectedNoteId(null);
      setIsEditing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newId = `img-${Math.random().toString(36).substr(2, 6)}`;
        setFormData(prev => {
          const newImage = { id: newId, url: reader.result as string };
          return {
            ...prev,
            content: `${prev.content || ''}\n\n[Anexo: ${newId}]\n\n`,
            images: [...(prev.images || []), newImage]
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => {
      const imageToRemove = prev.images?.[indexToRemove];
      let newContent = prev.content;
      if (imageToRemove && newContent) {
        // Option to remove the tag from content as well
        newContent = newContent.replace(`[Anexo: ${imageToRemove.id}]`, '');
      }
      return {
        ...prev,
        content: newContent,
        images: prev.images?.filter((_, idx) => idx !== indexToRemove)
      };
    });
  };

  const renderContent = (note: Note) => {
    if (!note.content) return null;
    
    // Expressão regular para encontrar [Anexo: img-xxxx]
    const parts = note.content.split(/(\[Anexo:\s*img-[\w]+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[Anexo:\s*(img-[\w]+)\]/);
      if (match && note.images) {
        const imgId = match[1];
        const imageObj = note.images.find(img => img.id === imgId);
        if (imageObj) {
          return (
            <div key={index} className="notes-inline-image">
              <img src={imageObj.url} alt={`Anexo ${imgId}`} />
            </div>
          );
        }
      }
      // Se for apenas texto (ou uma tag órfã)
      if (part.trim()) {
        return <p key={index}>{part}</p>;
      }
      return null;
    });
  };

  return (
    <div className="notes-modal-overlay" onClick={onClose}>
      <div className="notes-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Left Pane (Sidebar List) */}
        <div className="notes-sidebar">
          <div className="notes-sidebar-header">
            <h2>Anotações</h2>
            <button className="notes-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="notes-sidebar-actions">
            <div className="notes-search-wrapper">
              <Search size={16} className="notes-search-icon" />
              <input 
                type="text" 
                placeholder="Buscar anotações..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="notes-btn-add" onClick={handleCreateNew} aria-label="Nova Anotação">
              <Plus size={20} />
            </button>
          </div>

          <div className="notes-list">
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className={`notes-list-item ${selectedNoteId === note.id && !isEditing ? 'active' : ''}`}
                onClick={() => {
                  setSelectedNoteId(note.id);
                  setIsEditing(false);
                }}
              >
                <div className={`note-icon-small icon-${note.color}`}>
                  <FileText size={16} />
                </div>
                <div className="note-item-info">
                  <h4>{note.title}</h4>
                  <span>Editado {note.editedAt}</span>
                </div>
              </div>
            ))}
            
            {filteredNotes.length === 0 && (
              <div className="notes-list-empty">
                Nenhuma anotação encontrada.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane (Reader / Editor) */}
        <div className="notes-main">
          
          {!isEditing ? (
            /* READ MODE */
            selectedNote ? (
              <>
                <div className="notes-main-header">
                  <div className="notes-main-title">
                    <div className={`note-icon-large icon-${selectedNote.color}`}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3>{selectedNote.title}</h3>
                      <p>Editado {selectedNote.editedAt}</p>
                    </div>
                  </div>
                  <div className="notes-main-actions">
                    <button className="btn-edit" onClick={handleEdit}>
                      <Edit2 size={16} /> Editar
                    </button>
                    <button className="btn-delete" onClick={handleDelete}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="notes-main-content">
                  {renderContent(selectedNote)}
                </div>
              </>
            ) : (
              /* EMPTY STATE */
              <div className="notes-empty-state">
                <div className="empty-state-icon">
                  <FileText size={48} />
                </div>
                <h3>Selecione uma Anotação</h3>
                <p>Escolha uma anotação na lista ao lado para ler ou clique em "Nova" para criar uma anotação em branco.</p>
                <button className="btn-add-empty" onClick={handleCreateNew}>
                  <Plus size={18} /> Criar Nova Anotação
                </button>
              </div>
            )
          ) : (
            /* EDIT MODE */
            <div className="notes-editor-container">
              <div className="notes-main-header">
                <h3>{selectedNoteId && notes.some(n => n.id === selectedNoteId) ? 'Editar Anotação' : 'Nova Anotação'}</h3>
                <div className="notes-main-actions">
                  <button className="btn-cancel" onClick={handleCancelEdit}>
                    <XCircle size={16} /> Cancelar
                  </button>
                  <button className="btn-save" onClick={handleSave}>
                    <Save size={16} /> Salvar
                  </button>
                </div>
              </div>
              <div className="notes-editor-body">
                <input 
                  type="text" 
                  className="editor-title-input" 
                  placeholder="Título da anotação..."
                  value={formData.title || ''}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
                
                <div className="editor-color-picker">
                  <label>Cor da Etiqueta:</label>
                  <div className="color-options">
                    {['orange', 'blue', 'green', 'purple', 'red'].map(color => (
                      <button
                        key={color}
                        className={`color-dot color-${color} ${formData.color === color ? 'selected' : ''}`}
                        onClick={() => setFormData({...formData, color: color as any})}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <textarea 
                  className="editor-content-textarea"
                  placeholder="Escreva sua anotação aqui..."
                  value={formData.content || ''}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>

              <div className="editor-images-section">
                <div className="editor-images-header">
                  <label>Imagens Anexadas:</label>
                  <label className="btn-upload-image">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      style={{ display: 'none' }} 
                      onChange={handleImageUpload}
                    />
                    <ImageIcon size={16} /> Anexar Imagem
                  </label>
                </div>
                
                {formData.images && formData.images.length > 0 && (
                    <div className="editor-images-preview">
                      {formData.images.map((imgObj, idx) => (
                        <div key={idx} className="image-preview-item" title={`Tag: [Anexo: ${imgObj.id}]`}>
                          <img src={imgObj.url} alt="Preview" />
                          <div className="image-preview-tag">
                            {imgObj.id}
                          </div>
                          <button className="btn-remove-image" onClick={() => handleRemoveImage(idx)} title="Remover anexo">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default NotesModal;
