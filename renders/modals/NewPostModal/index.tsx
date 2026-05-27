import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import './styles.css';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
    onClose();
  };

  return (
    <div className="npm-modal-overlay" onClick={onClose}>
      <div className="npm-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="npm-btn-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="npm-header">
          <div className="npm-icon-box npm-icon-orange">
            <MessageSquare size={24} />
          </div>
          <h2>Novo Post no Mural</h2>
          <p>Compartilhe atualizações, avisos e dúvidas com a equipe.</p>
        </div>

        <form className="npm-form" onSubmit={handleSubmit}>
          <div className="npm-form-group">
            <div className="npm-label-row">
              <label>MENSAGEM <span className="npm-required">*</span></label>
              <span className="npm-char-counter">{content.length}/500</span>
            </div>
            <textarea
              placeholder="Escreva sua mensagem aqui..."
              rows={4}
              maxLength={500}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="npm-textarea-vertical"
              required
            />
          </div>

          <div className="npm-modal-actions-row">
            <button type="button" className="npm-modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="npm-modal-btn-submit" disabled={!content.trim()}>
              Publicar Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPostModal;
