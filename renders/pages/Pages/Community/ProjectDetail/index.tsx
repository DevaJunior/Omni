import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  CheckCircle2,
  Send,
  Building2,
  DollarSign,
  UserCircle
} from 'lucide-react';
import './styles.css';

const ProjectDetail: React.FC = () => {
  const navigate = useNavigate();
  // Capturando o ID da rota
  const { id } = useParams();

  // Banco de dados mockado simulando o backend para Projetos
  const projectsDatabase = [
    {
      id: "101",
      title: "Projeto de Pesquisa: Rizo Filtração de Metais Pesados",
      institution: "Phyton Research & UNIFAL-MG",
      type: "Pesquisa Acadêmica",
      location: "Alfenas-MG (Híbrido)",
      deadline: "Fluxo Contínuo",
      status: "Aberto",
      coordinator: "Dra. Helena Ribeiro",
      grant: "Bolsa FAPEMIG (R$ 2.100,00/mês)",
      description: "O Laboratório de Biotecnologia Ambiental está recrutando pesquisadores para integrar um projeto multidisciplinar focado na fitorremediação de águas contaminadas. O objetivo central é desenvolver e validar um modelo preditivo utilizando Lógica P-Fuzzy para otimizar a taxa de absorção radicular de metais pesados em biorreatores.",
      requirements: [
        "Estar matriculado em programa de Mestrado ou Doutorado em Biotecnologia, Química, ou áreas correlatas.",
        "Conhecimento sólido em programação Python (bibliotecas de análise de dados e skfuzzy).",
        "Experiência prévia em laboratório de química analítica ou biologia molecular.",
        "Disponibilidade de 20 horas semanais."
      ],
      responsibilities: [
        "Coletar e tabular dados de crescimento de biomassa e concentração de metais.",
        "Desenvolver scripts em Python para modelagem matemática dos dados.",
        "Participar das reuniões semanais do grupo de pesquisa.",
        "Auxiliar na redação de artigos científicos e relatórios técnicos."
      ],
      tags: ["Rizofiltração", "P-Fuzzy", "Python", "Biotecnologia"]
    },
    {
      id: "102",
      title: "Bolsa de Mestrado em Biotecnologia",
      institution: "Laboratório Neurolab",
      type: "Bolsa de Estudos",
      location: "Presencial",
      deadline: "30 de Novembro, 2026",
      status: "Aberto",
      coordinator: "Prof. Dr. Rafael Mendes",
      grant: "Bolsa CAPES",
      description: "Oportunidade para desenvolver plataformas integradas de auxílio laboratorial e bioinformática. O projeto exige a criação de interfaces web responsivas para a visualização de dados de sequenciamento genético em tempo real.",
      requirements: [
        "Graduação completa em Ciência da Computação, Engenharia de Software ou Biotecnologia.",
        "Proficiência em React, TypeScript e Zustand.",
        "Inglês técnico avançado para leitura."
      ],
      responsibilities: [
        "Desenhar e implementar a arquitetura frontend da plataforma.",
        "Integrar APIs RESTful e WebSockets.",
        "Escrever testes automatizados para os componentes."
      ],
      tags: ["Mestrado", "React", "TypeScript", "Bioinformática"]
    },
    {
      id: "103",
      title: "Chamada de Artigos: Controle de Qualidade em Laboratórios",
      institution: "Revista Científica Omni",
      type: "Publicação",
      location: "Submissão Online",
      deadline: "Encerrado",
      status: "Fechado",
      coordinator: "Comitê Editorial Omni",
      grant: null,
      description: "Edição especial focada na interseção entre tecnologia da informação e processos laboratoriais, englobando biologia, química e controle de qualidade de vacinas. Buscamos artigos originais e revisões sistemáticas.",
      requirements: [
        "Artigos não publicados em outros meios.",
        "Aderência ao template padrão de formatação IEEE.",
        "Foco na área de qualidade laboratorial e sistemas inteligentes."
      ],
      responsibilities: [
        "Submissão do manuscrito via portal.",
        "Ajustes conforme retorno dos revisores paritários (Peer Review)."
      ],
      tags: ["Artigo", "Controle de Qualidade", "Publicação"]
    }
  ];

  // APLICAÇÃO CORRETA DO 'id': Busca o projeto correspondente ao ID da URL.
  const project = projectsDatabase.find(p => p.id === id) || projectsDatabase[0];

  return (
    <div className="prj-detail-container">

      {/* Botão de Voltar */}
      <button className="prj-btn-back" onClick={() => navigate('/community')}>
        <ArrowLeft size={20} />
        Voltar para Projetos
      </button>

      <div className="prj-detail-layout">

        {/* COLUNA PRINCIPAL: DESCRIÇÃO DO PROJETO */}
        <main className="prj-main-content">

          <header className="prj-header">
            <div className="prj-header-meta">
              <span className="prj-type-badge">
                {project.type === "Pesquisa Acadêmica" ? <FileText size={16} /> : <Briefcase size={16} />}
                {project.type}
              </span>
              <span className={`prj-status-badge ${project.status === 'Aberto' ? 'status-open' : 'status-closed'}`}>
                {project.status}
              </span>
            </div>

            <h1 className="prj-title">{project.title}</h1>

            <div className="prj-institution">
              <Building2 size={20} className="prj-icon-muted" />
              <h2>{project.institution}</h2>
            </div>
          </header>

          <hr className="prj-divider" />

          <article className="prj-body">
            <section className="prj-section">
              <h3>Sobre o Projeto</h3>
              <p>{project.description}</p>
            </section>

            <section className="prj-section">
              <h3>Requisitos e Qualificações</h3>
              <ul className="prj-check-list">
                {project.requirements.map((req, index) => (
                  <li key={index}>
                    <CheckCircle2 size={20} className="prj-icon-check" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="prj-section">
              <h3>Responsabilidades e Atribuições</h3>
              <ul className="prj-bullet-list">
                {project.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </section>

            <section className="prj-section">
              <h3>Tags Relacionadas</h3>
              <div className="prj-tags-list">
                {project.tags.map(tag => (
                  <span key={tag} className="prj-tag">{tag}</span>
                ))}
              </div>
            </section>
          </article>
        </main>

        {/* BARRA LATERAL: CARD DE RESUMO E AÇÃO (STICKY) */}
        <aside className="prj-sidebar">
          <div className="prj-sticky-wrapper">

            <div className="prj-summary-card">
              <h3>Resumo da Oportunidade</h3>

              <div className="prj-summary-info">
                <div className="prj-info-row">
                  <MapPin size={20} className="prj-icon-muted" />
                  <div>
                    <strong>Localização</strong>
                    <span>{project.location}</span>
                  </div>
                </div>

                <div className="prj-info-row">
                  <Calendar size={20} className="prj-icon-muted" />
                  <div>
                    <strong>Prazo de Inscrição</strong>
                    <span>{project.deadline}</span>
                  </div>
                </div>

                <div className="prj-info-row">
                  <UserCircle size={20} className="prj-icon-muted" />
                  <div>
                    <strong>Coordenador/Orientador</strong>
                    <span>{project.coordinator}</span>
                  </div>
                </div>

                {project.grant && (
                  <div className="prj-info-row">
                    <DollarSign size={20} className="prj-icon-muted" />
                    <div>
                      <strong>Remuneração / Bolsa</strong>
                      <span>{project.grant}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="prj-action-box">
                {project.status === 'Aberto' ? (
                  <>
                    <button className="prj-btn-apply-giant">
                      Candidatar-se
                      <Send size={18} />
                    </button>
                    <p className="prj-action-hint">Ao clicar, seu perfil da Omni será enviado para o coordenador do projeto.</p>
                  </>
                ) : (
                  <button className="prj-btn-closed" disabled>
                    Inscrições Encerradas
                  </button>
                )}
              </div>
            </div>

            {/* Alerta Institucional */}
            <div className="prj-alert-card">
              <p>
                <strong>Importante:</strong> As bolsas e projetos divulgados na Omni são de inteira responsabilidade das instituições parceiras. Fique atento às datas dos editais oficiais.
              </p>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default ProjectDetail;