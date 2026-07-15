import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import CardProjectOportunity from '../../../components/CardProjectOportunity';
import EmptyStateSearch from '../../../../renders/components/EmptyStateSearch';
import CreateProjectModal from '../../../../renders/modals/CreateProjectModal';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { useCommunityStore } from '../../../../src/store/useCommunityStore';
import './styles.css';

interface ProjectsTabProps {
  searchQuery?: string;
  onClear?: () => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ searchQuery = '', onClear }) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { projects, setProjects, appendProjects } = useCommunityStore();

  const canCreateProject = /pesquisador|professor|laboratório|admin/i.test(userProfile?.role || '');

  const [loadingMore, setLoadingMore] = useState(false);

  // Mapeamento dinâmico de ícones com base no tipo vindo do banco
  const getIconForProjectType = (type: string) => {
    switch (type) {
      case 'Bolsa de Estudos': return <Briefcase size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const fetchProjects = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);

    try {
      const response = await communityService.getProjectsPaginated(6, isLoadMore ? projects.lastDoc : null);
      if (isLoadMore) {
        appendProjects(response.data.map(p => ({ ...p, icon: getIconForProjectType(p.type) })), response.lastDoc, response.data.length === 6 && response.lastDoc !== null);
      } else {
        setProjects(response.data.map((p: any) => ({ ...p, icon: getIconForProjectType(p.type) })), response.lastDoc, response.data.length === 6 && response.lastDoc !== null);
      }
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!projects.isLoaded) {
      fetchProjects();
    }
  }, [projects.isLoaded]);

  if (!projects.isLoaded && projects.data.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Projetos...</div>;

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

  const filteredProjects = [...projects.data]
    .map(p => ({ ...p, _searchScore: getSearchScore(p) }))
    .filter(p => p._searchScore > 0)
    .sort((a, b) => {
      if (searchQuery) return b._searchScore - a._searchScore;
      return b.id.localeCompare(a.id);
    });

  return (
    <div className="cmmt-projects-list">
      {canCreateProject && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            className="cmmt-btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Briefcase size={18} style={{ marginRight: '8px' }} />
            Criar Projeto
          </button>
        </div>
      )}

      {projects.hasMore && !searchQuery && (
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
          <CardProjectOportunity key={project.id} project={project} onViewProject={handleViewProject} />
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