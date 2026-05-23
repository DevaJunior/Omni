import React, { useEffect, useState } from 'react';
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../src/config/firebaseConfig';
import './styles.css';
import ShareMenu from '../../../../components/ShareMenu';

const ProjectDetail: React.FC = () => {
  const navigate = useNavigate();
  // Capturando o ID da rota
  const { id } = useParams();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, "projects", id));
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Erro ao carregar projeto", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Projeto...</div>;
  if (!project) return <div style={{ padding: '40px', textAlign: 'center' }}>Projeto não encontrado.</div>;



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
                {project.requirements.map((req: string, index: number) => (
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
                {project.responsibilities.map((resp: string, index: number) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </section>

            <section className="prj-section">
              <h3>Tags Relacionadas</h3>
              <div className="prj-tags-list">
                {project.tags.map((tag: string) => (
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
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <ShareMenu text={`Confira a oportunidade: ${project.title} na Omni!`}
                  url={`${window.location.origin}/project/${project.id}`} />
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