import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Send, CheckCircle } from 'lucide-react';
import Navbar from '../../../../menus/Navbar';
import Footer from '../../../../menus/Footer';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import { communityService } from '../../../../../src/services/communityService';
import './styles.css';

const PublishArticle: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    authors: userProfile?.name || currentUser?.displayName || '',
    journal: '',
    impactFactor: '',
    doi: '',
    abstract: '',
    tags: '',
    content: '',
    isFree: 'true'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.abstract) {
      setError('Por favor, preencha pelo menos o título e o resumo.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const newArticle = {
        title: formData.title,
        authors: formData.authors,
        journal: formData.journal || 'Publicação Independente (Omni)',
        date: new Date().toLocaleDateString('pt-BR'),
        impactFactor: parseFloat(formData.impactFactor) || 0,
        abstract: formData.abstract,
        tags: tagsArray,
        doi: formData.doi || 'N/A',
        isFree: formData.isFree === 'true',
        likes: 0,
        content: formData.content
      };

      await communityService.createArticle(newArticle);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/community');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao publicar o artigo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="publish-article-container">
        <div className="publish-article-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} /> Voltar
          </button>
          <h1><BookOpen size={28} /> Publicar Artigo Científico</h1>
          <p>Compartilhe suas descobertas, artigos e revisões bibliográficas com a comunidade Omni.</p>
        </div>

        {success ? (
          <div className="publish-success">
            <CheckCircle size={48} color="#059669" />
            <h2>Artigo Publicado com Sucesso!</h2>
            <p>Sua pesquisa já está disponível na plataforma.</p>
            <p className="redirect-text">Redirecionando para a comunidade...</p>
          </div>
        ) : (
          <form className="publish-article-form" onSubmit={handleSubmit}>
            {error && <div className="publish-error">{error}</div>}

            <div className="form-section">
              <h3>1. Metadados Principais</h3>
              
              <div className="form-group">
                <label>Título do Artigo *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="Ex: Análise Genômica de Variantes..." 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Autores *</label>
                  <input 
                    type="text" 
                    name="authors" 
                    value={formData.authors} 
                    onChange={handleChange} 
                    placeholder="João Silva, Maria Souza..." 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Periódico / Revista (Opcional)</label>
                  <input 
                    type="text" 
                    name="journal" 
                    value={formData.journal} 
                    onChange={handleChange} 
                    placeholder="Nature, Science, Omni..." 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>DOI (Opcional)</label>
                  <input 
                    type="text" 
                    name="doi" 
                    value={formData.doi} 
                    onChange={handleChange} 
                    placeholder="10.1038/s41586-020..." 
                  />
                </div>
                <div className="form-group">
                  <label>Fator de Impacto (Opcional)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="impactFactor" 
                    value={formData.impactFactor} 
                    onChange={handleChange} 
                    placeholder="Ex: 5.4" 
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>2. Resumo e Conteúdo</h3>
              
              <div className="form-group">
                <label>Resumo (Abstract) *</label>
                <textarea 
                  name="abstract" 
                  value={formData.abstract} 
                  onChange={handleChange} 
                  rows={4} 
                  placeholder="Resuma os principais achados, metodologia e conclusões da sua pesquisa..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Tags (Separadas por vírgula)</label>
                <input 
                  type="text" 
                  name="tags" 
                  value={formData.tags} 
                  onChange={handleChange} 
                  placeholder="Biotecnologia, CRISPR, Genética..." 
                />
              </div>

              <div className="form-group">
                <label>Conteúdo Completo (Opcional)</label>
                <textarea 
                  name="content" 
                  value={formData.content} 
                  onChange={handleChange} 
                  rows={8} 
                  placeholder="Cole aqui o texto completo da pesquisa se desejar que seja legível diretamente na plataforma Omni..."
                />
              </div>
            </div>

            <div className="form-section">
              <h3>3. Acesso</h3>
              <div className="form-group">
                <label>Disponibilidade do Artigo</label>
                <select name="isFree" value={formData.isFree} onChange={handleChange}>
                  <option value="true">Open Access (Acesso Livre)</option>
                  <option value="false">Paywall / Acesso Restrito (Requer link externo)</option>
                </select>
              </div>
            </div>

            <div className="publish-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Publicando...' : <><Send size={18} /> Publicar Artigo</>}
              </button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PublishArticle;
