import React from 'react';
import { Calendar, ArrowUpRight, Building2, Microscope, FileText } from 'lucide-react';
import './styles.css';

export interface ProjectData {
  id: string | number;
  type: string;
  icon?: React.ReactNode;
  status: string;
  title: string;
  institution: string;
  location: string;
  deadline: string;
  description: string;
  tags: string[];
  scholarship?: string;
}

interface CardProjectOportunityProps {
  project: ProjectData;
  onViewProject: (id: string | number) => void;
  forwardedRef?: React.Ref<HTMLElement>;
}

const CardProjectOportunity: React.FC<CardProjectOportunityProps> = ({ project, onViewProject, forwardedRef }) => {
  // Extrair iniciais para o avatar
  const getInitials = (title: string) => {
    if (!title) return 'PR';
    const words = title.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  return (
    <article className={`cmmt-project-card-new ${project.status === 'Fechado' ? 'cmmt-project-closed' : ''}`} ref={forwardedRef}>
      <div className="cmmt-project-content-left">
        <div className="cmmt-project-header-top-new">
          <span className="cmmt-project-type-new">
            {project.icon || <Microscope size={14} />} {project.type || "PROJETO"}
          </span>
          <span className={`cmmt-project-status-new ${project.status === 'Aberto' ? 'cmmt-status-open-new' : 'cmmt-status-closed'}`}>
            <span className="cmmt-status-dot"></span> {project.status}
          </span>
        </div>

        <div className="cmmt-project-title-wrapper">
          <div className="cmmt-project-avatar">
            {getInitials(project.institution || project.title)}
          </div>
          <div className="cmmt-project-title-info">
            <h3 className="cmmt-project-title-new">{project.title}</h3>
            <h4 className="cmmt-project-institution-new">
              <Building2 size={14} /> {project.institution}
            </h4>
          </div>
        </div>

        <p className="cmmt-project-desc-new">
          {project.description && project.description.length > 150 
            ? project.description.substring(0, 150) + '...' 
            : project.description}
        </p>

        <div className="cmmt-project-tags-new">
          {project.tags?.map((tag: string) => (
            <span key={tag} className="cmmt-project-tag-item-new">{tag}</span>
          ))}
        </div>
      </div>

      <div className="cmmt-project-content-right">
        <div className="cmmt-project-details-row">
          <span className="cmmt-detail-label">PRAZO DE SUBMISSÃO</span>
          <span className="cmmt-detail-value"><Calendar size={16} /> {project.deadline || "Fluxo Contínuo"}</span>
        </div>
        
        <div className="cmmt-project-details-row">
          <span className="cmmt-detail-label">BOLSA / AUXÍLIO</span>
          <span className="cmmt-detail-value"><FileText size={16} /> {project.scholarship || "Bolsa CNPq"}</span>
        </div>

        <button
          className="cmmt-btn-apply-new"
          onClick={() => onViewProject(project.id)}
        >
          Candidatar-se <ArrowUpRight size={16} />
        </button>

        <button
          className="cmmt-btn-details-new"
          onClick={() => onViewProject(project.id)}
        >
          Ver mais detalhes
        </button>
      </div>
    </article>
  );
};

export default CardProjectOportunity;
