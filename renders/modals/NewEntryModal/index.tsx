import React, { useState } from 'react';
import { X, Book, Tag } from 'lucide-react';
import './styles.css';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

const NewEntryModal: React.FC<NewEntryModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== '')
    });
    setTitle('');
    setContent('');
    setTags('');
    onClose();
  };

  return (
    <div className="nem-modal-overlay" onClick={onClose}>
      <div className="nem-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="nem-btn-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="nem-header">
          <div className="nem-icon-box nem-icon-blue">
            <Book size={24} />
          </div>
          <h2>Nova Entrada no Caderno</h2>
          <p>Registre seus experimentos e observações.</p>
        </div>

        <form className="nem-form" onSubmit={handleSubmit}>
          <div className="nem-form-group">
            <label>TÍTULO DA ENTRADA <span className="nem-required">*</span></label>
            <input
              type="text"
              placeholder="Ex: Extração de RNA - Lote 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="nem-form-group">
            <label>CONTEÚDO <span className="nem-required">*</span></label>
            <textarea
              placeholder="Descreva o procedimento, observações e resultados..."
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="nem-textarea-vertical"
              required
            />
          </div>

          <div className="nem-form-group">
            <label>TAGS <span className="nem-optional">(separadas por vírgula)</span></label>
            <div className="nem-input-with-icon-wrapper">
              <Tag size={18} className="nem-input-icon" />
              <input
                type="text"
                placeholder="BIOTECNOLOGIA, EXTRAÇÃO, RNA"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="nem-input-with-icon"
              />
            </div>
          </div>

          <div className="nem-modal-actions-row">
            <button type="button" className="nem-modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="nem-modal-btn-submit" disabled={!title.trim() || !content.trim()}>
              Salvar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryModal;
