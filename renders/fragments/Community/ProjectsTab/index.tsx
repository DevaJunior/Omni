import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, MapPin, Calendar, ExternalLink } from 'lucide-react';
import './styles.css';

const ProjectsTab: React.FC = () => {
  const navigate = useNavigate();

  const projectsList = [
    {
      id: 101,
      title: "Projeto de Pesquisa: Rizo Filtração de Metais Pesados",
      institution: "Phyton Research",
      type: "Pesquisa Acadêmica",
      icon: <FileText size={16} />,
      location: "Alfenas-MG (Híbrido)",
      deadline: "Fluxo Contínuo",
      description: "Buscamos colaboradores para análise de dados laboratoriais focados em rizofiltração. O projeto exige conhecimento em modelagem matemática e aplicação de Lógica P-Fuzzy utilizando Python.",
      tags: ["Rizofiltração", "P-Fuzzy", "Python"],
      status: "Aberto"
    },
    {
      id: 102,
      title: "Bolsa de Mestrado em Biotecnologia",
      institution: "Laboratório Neurolab",
      type: "Bolsa de Estudos",
      icon: <Briefcase size={16} />,
      location: "Presencial",
      deadline: "Até 30 de Novembro",
      description: "Oportunidade de bolsa integral para desenvolvimento de plataformas de auxílio laboratorial. Requisitos: Experiência prévia com desenvolvimento Web (React/TS) e interesse em bioinformática.",
      tags: ["Mestrado", "Bolsa", "Desenvolvimento Web"],
      status: "Aberto"
    },
    {
      id: 103,
      title: "Chamada de Artigos: Controle de Qualidade em Laboratórios",
      institution: "Revista Científica Omni",
      type: "Publicação",
      icon: <FileText size={16} />,
      location: "Submissão Online",
      deadline: "Encerrado",
      description: "Edição especial focada na interseção entre tecnologia da informação e processos laboratoriais, englobando biologia, química e controle de qualidade de vacinas.",
      tags: ["Artigo", "Controle de Qualidade", "Publicação"],
      status: "Fechado"
    }
  ];

  const handleViewProject = (id: number) => {
    // Salva scroll antes de ir pro detalhe
    sessionStorage.setItem('omni_scroll_pos', window.scrollY.toString());
    navigate(`/project/${id}`);
  };

  return (
    <div className="cmmt-projects-list">
      {projectsList.map(project => (
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
              {project.tags.map(tag => (
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