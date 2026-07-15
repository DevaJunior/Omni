import React from 'react';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';

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
}

interface CardProjectProps {
  project: ProjectData;
  onViewProject: (id: string | number) => void;
}

const CardProject: React.FC<CardProjectProps> = ({ project, onViewProject }) => {
  return (
    <article className={`cmmt-project-card ${project.status === 'Fechado' ? 'cmmt-project-closed' : ''}`}>
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
          {project.tags.map((tag: string) => (
            <span key={tag} className="cmmt-project-tag-item">{tag}</span>
          ))}
        </div>
        {project.status === 'Aberto' && (
          <button
            className="cmmt-btn-apply"
            onClick={() => onViewProject(project.id)}
          >
            Acessar Detalhes <ExternalLink size={16} />
          </button>
        )}
      </div>
    </article>
  );
};

export default CardProject;
