import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import type { Project } from '../../../../src/types/community';
import EmptyStateSearch from '../../../../renders/components/EmptyStateSearch';
import CreateProjectModal from '../../../../renders/modals/CreateProjectModal';
import './styles.css';

interface ProjectsTabProps {
  searchQuery?: string;
  onClear?: () => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ searchQuery = '', onClear }) => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [projectsList, setProjectsList] = useState<(Project & { icon: React.ReactNode })[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // Mapeamento dinâmico de ícones com base no tipo vindo do banco
  const getIconForProjectType = (type: string) => {
    switch (type) {
      case 'Bolsa de Estudos': return <Briefcase size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const fetchProjects = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await communityService.getProjectsPaginated(6, isLoadMore ? lastVisible : null);
      if (isLoadMore) {
        setProjectsList(prev => {
          const newItems = response.data.filter(p => !prev.find((ext: any) => ext.id === p.id));
          return [...prev, ...newItems].map(p => ({ ...p, icon: getIconForProjectType(p.type) })) as any;
        });
      } else {
        setProjectsList(response.data.map((p: any) => ({ ...p, icon: getIconForProjectType(p.type) })) as any);
      }
      
      setLastVisible(response.lastDoc);
      setHasMore(response.data.length === 6 && response.lastDoc !== null);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Projetos...</div>;

  const handleViewProject = (id: string | number) => {
    // Salva scroll antes de ir pro detalhe
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/project/${id}`);
  };

  const getSearchScore = (project: any) => {
    if (!searchQuery) return 1;
    const q = searchQuery.toLowerCase();
    let score = 0;
    if (project.title.toLowerCase().includes(q)) score += 10;
    if (project.description.toLowerCase().includes(q)) score += 5;
    if (project.institution.toLowerCase().includes(q)) score += 3;
    if (project.tags.some((tag: string) => tag.toLowerCase().includes(q))) score += 1;
    return score;
  };

  const filteredProjects = [...projectsList]
    .map(p => ({ ...p, _searchScore: getSearchScore(p) }))
    .filter(p => p._searchScore > 0)
    .sort((a, b) => {
      if (searchQuery) return b._searchScore - a._searchScore;
      return b.id.localeCompare(a.id);
    });

  return (
    <div className="cmmt-projects-list">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
      <button
        className="cmmt-btn-primary"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <Briefcase size={18} style={{ marginRight: '8px' }} />
        Criar Projeto
      </button>
    </div>
      
      {hasMore && !searchQuery && (
        <button 
          className="btn-primary" 
          onClick={() => fetchProjects(true)}
          disabled={loadingMore}
          style={{ width: '100%', padding: '12px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}
        >
          {loadingMore ? 'Carregando...' : 'Carregar Mais Projetos'}
        </button>
      )}
      
      {filteredProjects.length === 0 ? (
      <EmptyStateSearch
        searchQuery={searchQuery}
        onClear={onClear || (() => { })}
        showTabSuggestion={true}
        suggestions={['Bolsa de Estudos', 'Iniciação Científica', 'Biotecnologia', 'Ciência de Dados']}
      />
    ) : (
      filteredProjects.map((project: any) => (
        <article key={project.id} className={`cmmt-project-card ${project.status === 'Fechado' ? 'cmmt-project-closed' : ''}`}>
          <div className="cmmt-project-header-top">
            <span className="cmmt-project-type">{project.icon} {project.type}</span>
            <span className={`cmmt-project-status ${project.status === 'Aberto' ? 'cmmt-status-open' : 'cmmt-status-closed'}`}>
              {project.status}
            </span>
          </div>

          <h3 className="cmmt-project-title">{project.title}</h3>
          <h4 className="cmmt-project-institution">{project.institution}</h4>

          <div className="cmmt-project-meta">
            <span><MapPin size={16} /> {project.location}</span>
            <span><Calendar size={16} /> {project.deadline}</span>
          </div>

          <p className="cmmt-project-desc">{project.description}</p>

          <div className="cmmt-project-footer">
            <div className="cmmt-project-tags">
              {project.tags.map((tag: any) => (
                <span key={tag} className="cmmt-project-tag-item">{tag}</span>
              ))}
            </div>
            {project.status === 'Aberto' && (
              <button
                className="cmmt-btn-apply"
                onClick={() => handleViewProject(project.id)}
              >
                Acessar Detalhes <ExternalLink size={16} />
              </button>
            )}
          </div>
        </article>
      ))
    )}

    <CreateProjectModal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      onSuccess={() => alert('Projeto criado com sucesso!')}
    />
  </div>
  );
};

export default ProjectsTab;