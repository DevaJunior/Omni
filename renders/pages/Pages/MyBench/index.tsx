import React from 'react';
import { 
  ArrowRight, 
  Plus, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  FileText
} from 'lucide-react';
import Navbar from '../../../menus/Navbar';
import './styles.css';

const MyBench: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="mybench-page">
        <div className="mybench-container">
          
          {/* HEADER */}
          <header className="mybench-header">
            <span className="mybench-header-kicker">VISÃO GERAL</span>
            <h1 className="mybench-header-title">Bem-vindo de volta ao<br/>Laboratório, Devair.</h1>
            <p className="mybench-header-subtitle">
              Seu espaço de trabalho está pronto. Você tem agendamentos próximos e<br/>experimentos aguardando atualização na bancada.
            </p>
            
            <div className="mybench-status-badge">
              <div className="mybench-status-indicator">
                <span className="status-dot"></span>
                <span className="status-text">Lab Aberto</span>
              </div>
              <div className="mybench-status-divider"></div>
              <div className="mybench-status-members">
                <span className="members-text">4 Membros Online</span>
                <div className="members-avatars">
                  <div className="avatar-circle"></div>
                  <div className="avatar-circle"></div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN GRID */}
          <div className="mybench-grid">
            
            {/* LEFT COLUMN */}
            <div className="mybench-left-col">
              
              {/* TRABALHO EM BANCADA */}
              <section className="mybench-section">
                <div className="mybench-section-header">
                  <h2>Trabalho em Bancada</h2>
                  <a href="#" className="mybench-link-action">Ver tudo <ArrowRight size={16} /></a>
                </div>
                
                <div className="mybench-card mybench-experiment-card">
                  <div className="experiment-badge">EXPERIMENTO EM CURSO</div>
                  <h3>Análise Cinética de Enzimas (Lote C)</h3>
                  <p>
                    O protocolo de extração foi iniciado com sucesso. O espectrofotômetro encontra-se
                    reservado para leitura das amostras em aproximadamente 30 minutos.
                  </p>
                  <div className="experiment-actions">
                    <button className="btn-dark">Abrir Caderno</button>
                    <button className="btn-outline">Ver Protocolo</button>
                  </div>
                </div>
              </section>

              {/* ANOTAÇÕES RECENTES */}
              <section className="mybench-section">
                <div className="mybench-section-header">
                  <h2>Anotações Recentes</h2>
                  <button className="btn-icon-circular"><Plus size={18} /></button>
                </div>
                
                <div className="mybench-notes-grid">
                  <div className="mybench-card mybench-note-card">
                    <div className="note-icon icon-orange">
                      <FileText size={20} />
                    </div>
                    <h4>Resultados Preliminares PCR</h4>
                    <span>Editado hoje às 10:45</span>
                  </div>
                  
                  <div className="mybench-card mybench-note-card">
                    <div className="note-icon icon-blue">
                      <FileText size={20} />
                    </div>
                    <h4>Estrutura Artigo Principal</h4>
                    <span>Editado há 3 dias</span>
                  </div>
                </div>
              </section>

              {/* IMAGENS DO LAB */}
              <section className="mybench-section">
                <div className="mybench-section-header">
                  <h2>Imagens do Lab</h2>
                </div>
                <div className="mybench-images-grid">
                  <div className="lab-image-box">
                    <img src="/src/assets/wallapapers/wpp_cience_000.png" alt="Cells" />
                  </div>
                  <div className="lab-image-box">
                    {/* Placeholder for second image */}
                    <div className="lab-image-placeholder"></div>
                  </div>
                  <div className="lab-image-box lab-image-more">
                    <span>+12 Fotos</span>
                  </div>
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN */}
            <div className="mybench-right-col">
              
              {/* AVISO DE ESTOQUE */}
              <div className="mybench-card mybench-alert-card">
                <div className="alert-header">
                  <AlertTriangle size={20} className="alert-icon" />
                  <h4>Aviso de Estoque</h4>
                </div>
                <p>O Tampão TAE 50x está com volume crítico (restam apenas 2L).</p>
                <a href="#" className="alert-link">SOLICITAR REPOSIÇÃO</a>
              </div>

              {/* A SUA AGENDA */}
              <div className="mybench-card mybench-schedule-card">
                <div className="schedule-header">
                  <h4>A sua Agenda</h4>
                  <CalendarIcon size={18} className="schedule-icon" />
                </div>
                
                <div className="schedule-list">
                  <div className="schedule-item">
                    <div className="schedule-date date-blue">
                      <span className="date-month">HOJE</span>
                      <span className="date-day">19</span>
                    </div>
                    <div className="schedule-info">
                      <h5>Uso do Espectrofotômetro</h5>
                      <span>14:00 - 16:00</span>
                    </div>
                  </div>
                  
                  <div className="schedule-item">
                    <div className="schedule-date date-gray">
                      <span className="date-month">SEG</span>
                      <span className="date-day">20</span>
                    </div>
                    <div className="schedule-info">
                      <h5>Reunião LBA</h5>
                      <span>09:00 - 10:30</span>
                    </div>
                  </div>
                </div>

                <div className="schedule-divider"></div>

                <div className="reminders-section">
                  <span className="reminders-title">LEMBRETES</span>
                  <div className="reminder-item">
                    <input type="checkbox" id="rem1" />
                    <label htmlFor="rem1">Calibrar pHmetro (bancada 2)</label>
                  </div>
                  <div className="reminder-item">
                    <input type="checkbox" id="rem2" />
                    <label htmlFor="rem2">Revisar protocolo extração</label>
                  </div>
                </div>
              </div>

              {/* COMUNICAÇÕES */}
              <div className="mybench-card mybench-comms-card">
                <div className="comms-header">
                  <h4>Comunicações</h4>
                  <span className="comms-dot"></span>
                </div>
                
                <div className="comms-list">
                  <div className="comm-item">
                    <div className="comm-avatar avatar-gray">G</div>
                    <div className="comm-content">
                      <div className="comm-meta">
                        <h5>Grupo Lab</h5>
                        <span className="comm-time">Agora</span>
                      </div>
                      <p>Carlos: As fotos já estão na pasta partilhada.</p>
                    </div>
                  </div>

                  <div className="comm-item">
                    <div className="comm-avatar avatar-img">
                      <img src="https://ui-avatars.com/api/?name=Ana+Silva&background=8b0000&color=fff" alt="Ana Silva" />
                    </div>
                    <div className="comm-content">
                      <div className="comm-meta">
                        <h5>Ana Silva</h5>
                        <span className="comm-time">10:42</span>
                      </div>
                      <p>Deixei os reagentes na tua bancada.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyBench;
