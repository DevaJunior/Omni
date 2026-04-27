import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { communityService } from '../../../../src/services/communityService';
import type { Project } from '../../../../src/types/community';
import './styles.css';

const ProjectsTab: React.FC = () => {
  const navigate = useNavigate();

  const [projectsList, setProjectsList] = useState<(Project & { icon: React.ReactNode })[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapeamento dinâmico de ícones com base no tipo vindo do banco
  const getIconForProjectType = (type: string) => {
    switch (type) {
      case 'Bolsa de Estudos': return <Briefcase size={16} />;
      default: return <FileText size={16} />;
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await communityService.getProjects();
        setProjectsList(data.map(p => ({
          ...p,
          icon: getIconForProjectType(p.type)
        })));
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Projetos...</div>;

  const handleViewProject = (id: string | number) => {
    // Salva scroll antes de ir pro detalhe
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/project/${id}`);
  };

  return (
    <div className="cmmt-projects-list">
      {projectsList.map((project: any) => (
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
      ))}
    </div>
  );
};

export default ProjectsTab;