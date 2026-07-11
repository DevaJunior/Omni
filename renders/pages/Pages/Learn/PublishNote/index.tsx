import { useToastStore } from '../../../../../src/stores/toastStore';
import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Bold, Italic, List, Link as LinkIcon, Image, Send,
  Heading1, Heading2, Heading3, Quote, Highlighter, ListOrdered, FileText,
  Eye, Edit2, User, Clock, Save, Sigma, SquareSigma,
  SeparatorHorizontal, Subscript, Superscript, Code, Strikethrough, Table, SquareTerminal
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../../src/contexts/AuthContext';
import { learnService } from '../../../../../src/services/learnService';
import type { StudyNote } from '../../../../../src/types/learn';
import MarkdownRenderer from '../../../../../src/components/MarkdownRenderer';
import './styles.css';
import Footer from '../../../../menus/Footer';

// Listas simuladas para o sistema
const RESEARCH_AREAS = ['Biotecnologia', 'Matemática', 'Química', 'Biologia', 'Nutrição', 'Medicina', 'Computação', 'Engenharia'];
const DISCIPLINES = ['Biologia Molecular', 'Genética', 'Biologia Celular', 'Bioquímica', 'Fisiologia', 'Cálculo', 'Lógica Fuzzy', 'Estruturas de Dados'];

const PublishNote: React.FC = () => {
  const { addToast } = useToastStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do Formulário
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [content, setContent] = useState<string>('');

  // Estado de Visualização
  const [isPreview, setIsPreview] = useState<boolean>(false);

  // Carregar dados caso seja edição
  useEffect(() => {
    if (id && currentUser) {
      const loadNote = async () => {
        try {
          const note = await learnService.getNoteById(id);
          if (note) {
            if (note.authorId !== currentUser.uid) {
              addToast("Você não tem permissão para editar esta publicação.", 'error');
              navigate('/learn');
              return;
            }
            setTitle(note.title);
            setSubtitle(note.subtitle || '');
            setContent(note.content);
            setSelectedAreas(note.subjects || (note.subject ? [note.subject] : []));
            setSelectedDisciplines(note.disciplines || []);
          }
        } catch (err) {
          addToast("Erro ao carregar os dados da publicação.", 'error');
        }
      };
      loadNote();
    }
  }, [id, currentUser, navigate, addToast]);

  // Lógica de Seleção com Limite de 3 e Pesos (Ordem)
  const handleAddArea = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !selectedAreas.includes(value) && selectedAreas.length < 3) {
      setSelectedAreas([...selectedAreas, value]);
    }
    e.target.value = ""; // Reseta o select
  };

  const handleAddDiscipline = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value && !selectedDisciplines.includes(value) && selectedDisciplines.length < 3) {
      setSelectedDisciplines([...selectedDisciplines, value]);
    }
    e.target.value = ""; // Reseta o select
  };

  const removeArea = (areaToRemove: string) => {
    setSelectedAreas(selectedAreas.filter(a => a !== areaToRemove));
  };

  const removeDiscipline = (discToRemove: string) => {
    setSelectedDisciplines(selectedDisciplines.filter(d => d !== discToRemove));
  };

  // Motor de Formatação Markdown Interativo
  const applyFormatting = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);

    // Devolve o foco e reposiciona o cursor para dentro da formatação
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + before.length, end + before.length);
      }
    }, 0);
  };

  const insertSummary = () => {
    const summaryMarkdown = "\n## Sumário\n1. [Introdução](#)\n2. [Desenvolvimento](#)\n3. [Conclusão](#)\n---\n";
    applyFormatting(summaryMarkdown);
  };

  // Ações de Salvamento / Publicação
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || selectedAreas.length === 0 || selectedDisciplines.length === 0 || !content) {
      addToast("Preencha o título, ao menos uma área, uma disciplina e o conteúdo antes de publicar.", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newNote: Omit<StudyNote, 'id'> = {
        title,
        subtitle,
        excerpt: content.substring(0, 150) + '...',
        content,
        author: currentUser?.displayName || 'Usuário Omni',
        authorId: currentUser?.uid || 'anonymous',
        subject: selectedAreas[0], // Pega a primeira área como principal
        subjects: selectedAreas,
        disciplines: selectedDisciplines,
        date: new Date().toLocaleDateString('pt-BR'),
        likes: 0,
        readTime: `${Math.max(1, Math.ceil(content.length / 800))} min`
      };

      if (id) {
        await learnService.updateNote(id, newNote);
        addToast("Resumo atualizado com sucesso!", 'success');
      } else {
        await learnService.createNote(newNote);
        addToast("Resumo publicado com sucesso na Comunidade Omni!", 'success');
      }
      navigate('/learn');
    } catch (err) {
      console.error("Erro ao publicar nota", err);
      addToast("Erro ao publicar resumo. Tente novamente.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    if (!title) {
      addToast("Dê pelo menos um título ao seu resumo antes de salvá-mo como rascunho.", 'info');
      return;
    }
    addToast("Resumo salvo nos rascunhos locais com sucesso!", 'success');
    navigate('/learn'); // Pode optar por não navegar caso queira que o usuário continue na tela
  };

  // Parser Dinâmico de Markdown para o Preview

  return (
    <>
      <div className="publish-note-wrapper">
        <div className="publish-note-container">

          <button className="btn-back-learn" onClick={() => navigate('/learn')}>
            <ArrowLeft size={18} /> Cancelar e Voltar
          </button>

          <form className="publish-form" onSubmit={handlePublish}>
            <div className="publish-header">
              <h1>{isPreview ? 'Visualização do Resumo' : (id ? 'Editar Resumo de Estudo' : 'Novo Resumo de Estudo')}</h1>

              <div className="publish-actions-group">
                <button
                  type="button"
                  className="btn-preview-toggle"
                  onClick={() => setIsPreview(!isPreview)}
                >
                  {isPreview ? <><Edit2 size={16} /> Editar</> : <><Eye size={16} /> Visualizar</>}
                </button>

                <button
                  type="button"
                  className="btn-save-draft"
                  onClick={handleSaveDraft}
                >
                  Rascunho <Save size={16} />
                </button>

                <button type="submit" className="btn-publish-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Publicando...' : 'Publicar'} <Send size={16} />
                </button>
              </div>
            </div>

            {/* ====== MODO DE EDIÇÃO ====== */}
            {!isPreview && (
              <div className="editor-mode anim-fade-in">
                {/* METADADOS DO RESUMO */}
                <div className="publish-meta-inputs">
                  <input
                    type="text"
                    className="input-title-large"
                    placeholder="Título do seu resumo (Ex: Anotações Aula de Genética)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    autoFocus
                  />
                  <input
                    type="text"
                    className="input-subtitle"
                    placeholder="Subtítulo ou breve descrição do escopo..."
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                  />

                  <div className="selectors-row">
                    {/* Seleção de Áreas */}
                    <div className="selector-group">
                      <label>Áreas de Pesquisa (Máx 3 - Ordem define prioridade)</label>
                      <select className="select-dropdown" onChange={handleAddArea} disabled={selectedAreas.length >= 3} value="">
                        <option value="" disabled>Selecione uma área...</option>
                        {RESEARCH_AREAS.filter(a => !selectedAreas.includes(a)).map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                      <div className="tags-container">
                        {selectedAreas.map((area, index) => (
                          <span key={area} className="tag-pill area-tag">
                            <span className="tag-weight">{index + 1}º</span> {area}
                            <button type="button" onClick={() => removeArea(area)}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Seleção de Disciplinas */}
                    <div className="selector-group">
                      <label>Disciplinas Associadas (Máx 3)</label>
                      <select className="select-dropdown" onChange={handleAddDiscipline} disabled={selectedDisciplines.length >= 3} value="">
                        <option value="" disabled>Selecione uma disciplina...</option>
                        {DISCIPLINES.filter(d => !selectedDisciplines.includes(d)).map(disc => (
                          <option key={disc} value={disc}>{disc}</option>
                        ))}
                      </select>
                      <div className="tags-container">
                        {selectedDisciplines.map((disc, index) => (
                          <span key={disc} className="tag-pill disc-tag">
                            <span className="tag-weight">{index + 1}º</span> {disc}
                            <button type="button" onClick={() => removeDiscipline(disc)}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EDITOR MARKDOWN */}
                <div className="editor-container">
                  <div className="editor-toolbar">
                    <div className="toolbar-group">
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('# ', '')} title="Título (H1)"><Heading1 size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('## ', '')} title="Subtítulo (H2)"><Heading2 size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('### ', '')} title="Capítulo (H3)"><Heading3 size={18} /></button>
                    </div>

                    <div className="toolbar-divider"></div>

                    <div className="toolbar-group">
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('**', '**')} title="Negrito"><Bold size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('*', '*')} title="Itálico"><Italic size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('==', '==')} title="Destacar"><Highlighter size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('~~', '~~')} title="Tachado"><Strikethrough size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('~', '~')} title="Subscrito"><Subscript size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('^', '^')} title="Sobrescrito"><Superscript size={18} /></button>
                    </div>

                    <div className="toolbar-divider"></div>

                    <div className="toolbar-group">
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('\n- ', '')} title="Lista Não Ordenada"><List size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('\n1. ', '')} title="Lista Ordenada"><ListOrdered size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('\n> ', '')} title="Observação / Citação"><Quote size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('\n---\n', '')} title="Linha Divisória"><SeparatorHorizontal size={18} /></button>
                    </div>

                    <div className="toolbar-divider"></div>

                    <div className="toolbar-group">
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('$', '$')} title="Fórmula Matemática em Linha"><Sigma size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('\n$$\n', '\n$$\n')} title="Bloco de Fórmula Matemática"><SquareSigma size={18} /></button>
                    </div>

                    <div className="toolbar-divider"></div>

                    <div className="toolbar-group">
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('`', '`')} title="Código em Linha"><Code size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('\n```\n', '\n```\n')} title="Bloco de Código"><SquareTerminal size={18} /></button>
                    </div>

                    <div className="toolbar-divider"></div>

                    <div className="toolbar-group">
                      <button type="button" className="toolbar-btn" onClick={insertSummary} title="Gerar Sumário"><FileText size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('\n| Coluna 1 | Coluna 2 |\n|---|---|\n| Dado 1 | Dado 2 |\n', '')} title="Inserir Tabela"><Table size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('[Texto do Link](', ')')} title="Inserir Link"><LinkIcon size={18} /></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('![Texto Alternativo](', ')')} title="Inserir Imagem"><Image size={18} /></button>
                    </div>
                  </div>

                  <textarea
                    ref={textareaRef}
                    className="editor-textarea"
                    placeholder="Escreva seu resumo aqui... (Você pode usar formatação Markdown)"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  ></textarea>

                  <div className="editor-footer">
                    <span>Suporta formatação Markdown. (Use 'Visualizar' para conferir o resultado)</span>
                    <span>{content.length} caracteres</span>
                  </div>
                </div>
              </div>
            )}

            {/* ====== MODO DE VISUALIZAÇÃO (PREVIEW) ====== */}
            {isPreview && (
              <div className="preview-mode anim-fade-in">
                <article className="preview-article">
                  <header className="preview-article-header">
                    <div className="preview-tags-row">
                      {selectedAreas.map(a => <span key={a} className="preview-tag area">{a}</span>)}
                      {selectedDisciplines.map(d => <span key={d} className="preview-tag disc">{d}</span>)}
                      {selectedAreas.length === 0 && selectedDisciplines.length === 0 && (
                        <span className="preview-tag empty">Sem tags definidas</span>
                      )}
                    </div>

                    <h1 className="preview-title">{title || 'Título do Resumo não definido...'}</h1>
                    {subtitle && <h2 className="preview-subtitle">{subtitle}</h2>}

                    <div className="preview-author-bar">
                      <div className="author-info-left">
                        <div className="author-avatar"><User size={20} /></div>
                        <div>
                          <strong>{currentUser?.displayName || 'Usuário Omni'}</strong>
                          <div className="preview-meta">
                            <span>Agora mesmo</span>
                            <span className="dot">•</span>
                            <span><Clock size={14} /> {Math.max(1, Math.ceil(content.length / 800))} min de leitura</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </header>

                  <div className="preview-content-body">
                    {content ? <MarkdownRenderer content={content} /> : (
                      <div className="empty-preview-state">
                        <FileText size={40} />
                        <p>O conteúdo do seu resumo aparecerá aqui...</p>
                      </div>
                    )}
                  </div>
                </article>
              </div>
            )}

          </form>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default PublishNote;