import React, { useState } from 'react';
import { X, Briefcase, Building2, MapPin, Calendar, FileText } from 'lucide-react';
import './styles.css';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    institution: '',
    type: 'Pesquisa Acadêmica',
    location: '',
    deadline: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simula a criação do projeto
    setTimeout(() => {
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="cp-modal-overlay">
      <div className="cp-modal-content">
        <div className="cp-modal-header">
          <h2>Criar Nova Oportunidade/Projeto</h2>
          <button className="cp-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="cp-modal-body" onSubmit={handleSubmit}>
          <p className="cp-modal-desc">
            Vincule este projeto ao seu laboratório, professor orientador ou instituição para recrutar novos talentos.
          </p>

          <div className="cp-form-group">
            <label>Título do Projeto</label>
            <div className="cp-input-wrapper">
              <FileText size={18} className="cp-input-icon" />
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Bolsa de IC em Biologia Molecular" required />
            </div>
          </div>

          <div className="cp-form-row">
            <div className="cp-form-group">
              <label>Instituição / Laboratório</label>
              <div className="cp-input-wrapper">
                <Building2 size={18} className="cp-input-icon" />
                <input type="text" name="institution" value={formData.institution} onChange={handleChange} placeholder="Ex: Phyton Research" required />
              </div>
            </div>

            <div className="cp-form-group">
              <label>Tipo de Oportunidade</label>
              <div className="cp-input-wrapper">
                <Briefcase size={18} className="cp-input-icon" />
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="Pesquisa Acadêmica">Pesquisa Acadêmica</option>
                  <option value="Bolsa de Estudos">Bolsa de Estudos</option>
                  <option value="Iniciação Científica">Iniciação Científica</option>
                  <option value="Estágio">Estágio</option>
                </select>
              </div>
            </div>
          </div>

          <div className="cp-form-row">
            <div className="cp-form-group">
              <label>Localização</label>
              <div className="cp-input-wrapper">
                <MapPin size={18} className="cp-input-icon" />
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Remoto ou São Paulo, SP" required />
              </div>
            </div>

            <div className="cp-form-group">
              <label>Prazo de Inscrição</label>
              <div className="cp-input-wrapper">
                <Calendar size={18} className="cp-input-icon" />
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="cp-form-group">
            <label>Descrição e Requisitos</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Descreva o escopo do projeto, responsabilidades e habilidades necessárias..." 
              rows={4}
              required 
            />
          </div>

          <div className="cp-modal-footer">
            <button type="button" className="cp-btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="cp-btn-submit" disabled={loading}>
              {loading ? "Criando..." : "Publicar Projeto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
