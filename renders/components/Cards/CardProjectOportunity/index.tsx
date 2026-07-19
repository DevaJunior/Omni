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
    <article className={`carrd_oportunity-project-card-new ${project.status === 'Fechado' ? 'carrd_oportunity-project-closed' : ''}`} ref={forwardedRef}>
      <div className="carrd_oportunity-project-content-left">
        <div className="carrd_oportunity-project-header-top-new">
          <span className="carrd_oportunity-project-type-new">
            {project.icon || <Microscope size={14} />} {project.type || "PROJETO"}
          </span>
          <span className={`carrd_oportunity-project-status-new ${project.status === 'Aberto' ? 'carrd_oportunity-status-open-new' : 'carrd_oportunity-status-closed'}`}>
            <span className="carrd_oportunity-status-dot"></span> {project.status}
          </span>
        </div>

        <div className="carrd_oportunity-project-title-wrapper">
          <div className="carrd_oportunity-project-avatar">
            {getInitials(project.institution || project.title)}
          </div>
          <div className="carrd_oportunity-project-title-info">
            <h3 className="carrd_oportunity-project-title-new">{project.title}</h3>
            <h4 className="carrd_oportunity-project-institution-new">
              <Building2 size={14} /> {project.institution}
            </h4>
          </div>
        </div>

        <p className="carrd_oportunity-project-desc-new">
          {project.description}
        </p>

        <div className="carrd_oportunity-project-tags-new">
          {project.tags?.map((tag: string) => (
            <span key={tag} className="carrd_oportunity-project-tag-item-new">{tag}</span>
          ))}
        </div>
      </div>

      <div className="carrd_oportunity-project-content-right">
        <div className="carrd_oportunity-project-details-row">
          <span className="carrd_oportunity-detail-label">
            <span className="co-desktop-text">PRAZO DE SUBMISSÃO</span>
            <span className="co-mobile-text">SUBMISSÃO ATÉ</span>
          </span>
          <span className="carrd_oportunity-detail-value">
            <span className="co-calendar-icon"><Calendar size={16} /></span> {project.deadline || "Fluxo Contínuo"}
          </span>
        </div>

        <div className="carrd_oportunity-project-details-row display-none">
          <span className="carrd_oportunity-detail-label">BOLSA / AUXÍLIO</span>
          <span className="carrd_oportunity-detail-value"><FileText size={16} /> {project.scholarship || "Bolsa CNPq"}</span>
        </div>

        <button
          className="carrd_oportunity-btn-apply-new"
          onClick={() => onViewProject(project.id)}
        >
          Candidatar-se <ArrowUpRight size={16} />
        </button>

        <button
          className="carrd_oportunity-btn-details-new display-none"
          onClick={() => onViewProject(project.id)}
        >
          Ver mais detalhes
        </button>
      </div>
    </article>
  );
};

export default CardProjectOportunity;