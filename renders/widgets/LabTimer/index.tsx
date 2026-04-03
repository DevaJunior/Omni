import React, { useState, useEffect } from 'react';
import { ArrowLeft, Timer, Play, Pause, RotateCcw, Trash2, Plus, BellRing, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import Footer from '../../menus/Footer';

// Tipagem de cada cronômetro individual
type TimerItem = {
  id: string;
  name: string;
  initialSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
};

const LabTimer: React.FC = () => {
  const navigate = useNavigate();

  // Estado para a lista de cronômetros
  const [timers, setTimers] = useState<TimerItem[]>([]);

  // Estados para o formulário de "Novo Cronômetro"
  const [newName, setNewName] = useState('');
  const [newHours, setNewHours] = useState('');
  const [newMinutes, setNewMinutes] = useState('');
  const [newSeconds, setNewSeconds] = useState('');

  // Efeito principal: O "Coração" do relógio que bate a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.isRunning && timer.remainingSeconds > 0) {
            const nextRemaining = timer.remainingSeconds - 1;
            // Se chegou a zero neste exato momento
            if (nextRemaining === 0) {
              return { ...timer, remainingSeconds: 0, isRunning: false, isFinished: true };
            }
            return { ...timer, remainingSeconds: nextRemaining };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Formata os segundos totais para HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    // Esconde a hora se for 0 para ficar mais limpo, mas mantém se for > 0
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calcula o progresso (0 a 100%) para a barra visual
  const calculateProgress = (remaining: number, total: number) => {
    if (total === 0) return 0;
    return ((total - remaining) / total) * 100;
  };

  // Adicionar um novo cronômetro
  const handleAddTimer = (e: React.FormEvent) => {
    e.preventDefault();
    
    const h = parseInt(newHours || '0', 10);
    const m = parseInt(newMinutes || '0', 10);
    const s = parseInt(newSeconds || '0', 10);
    
    const totalSeconds = (h * 3600) + (m * 60) + s;

    if (totalSeconds <= 0) return;

    const newTimer: TimerItem = {
      id: Date.now().toString(),
      name: newName.trim() || `Timer ${timers.length + 1}`,
      initialSeconds: totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: false,
      isFinished: false
    };

    setTimers([...timers, newTimer]);
    
    // Limpa o formulário
    setNewName('');
    setNewHours('');
    setNewMinutes('');
    setNewSeconds('');
  };

  // Controles Individuais
  const toggleTimer = (id: string) => {
    setTimers(timers.map(t => {
      if (t.id === id && !t.isFinished) {
        return { ...t, isRunning: !t.isRunning };
      }
      return t;
    }));
  };

  const resetTimer = (id: string) => {
    setTimers(timers.map(t => {
      if (t.id === id) {
        return { ...t, remainingSeconds: t.initialSeconds, isRunning: false, isFinished: false };
      }
      return t;
    }));
  };

  const deleteTimer = (id: string) => {
    setTimers(timers.filter(t => t.id !== id));
  };

  return (
    <>
      <div className="tool-page-wrapper">
        <div className="tool-container">
          
          <button className="tool-btn-back" onClick={() => navigate('/lab')}>
            <ArrowLeft size={18} />
            Voltar para Bancada
          </button>

          <div className="tool-grid-layout">
            
            {/* Coluna Principal: Lista de Cronômetros */}
            <div className="tool-main-panel">
              <div className="tool-header">
                <div className="tool-icon-large amber-theme">
                  <Timer size={32} />
                </div>
                <div>
                  <h1>Cronômetro Múltiplo</h1>
                  <p>Acompanhe simultaneamente o tempo de incubações, reações e processos de bancada.</p>
                </div>
              </div>

              <div className="tool-card-content">
                
                {/* Formulário de Adição */}
                <form className="timer-add-form" onSubmit={handleAddTimer}>
                  <div className="timer-input-name">
                    <label>Rótulo (Ex: PCR Amostra A)</label>
                    <input 
                      type="text" 
                      placeholder="Nome do processo..." 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  
                  <div className="timer-input-time-group">
                    <div className="timer-time-box">
                      <label>Horas</label>
                      <input type="number" min="0" max="99" value={newHours} onChange={(e) => setNewHours(e.target.value)} placeholder="00" />
                    </div>
                    <span className="time-separator">:</span>
                    <div className="timer-time-box">
                      <label>Min</label>
                      <input type="number" min="0" max="59" value={newMinutes} onChange={(e) => setNewMinutes(e.target.value)} placeholder="00" />
                    </div>
                    <span className="time-separator">:</span>
                    <div className="timer-time-box">
                      <label>Seg</label>
                      <input type="number" min="0" max="59" value={newSeconds} onChange={(e) => setNewSeconds(e.target.value)} placeholder="00" />
                    </div>
                    <button type="submit" className="tool-btn-primary btn-amber btn-add-timer">
                      <Plus size={20} />
                    </button>
                  </div>
                </form>

                <hr className="timer-divider" />

                {/* Lista Ativa de Cronômetros */}
                <div className="timers-list-container">
                  {timers.length === 0 ? (
                    <div className="timers-empty-state">
                      <Timer size={40} />
                      <p>Nenhum cronômetro ativo.<br/>Adicione um acima para começar.</p>
                    </div>
                  ) : (
                    timers.map(timer => (
                      <div key={timer.id} className={`timer-item-card ${timer.isFinished ? 'timer-finished' : ''}`}>
                        
                        <div className="timer-info">
                          <h4>{timer.name}</h4>
                          <span className="timer-original-time">Original: {formatTime(timer.initialSeconds)}</span>
                        </div>

                        <div className="timer-display-area">
                          <div className={`timer-countdown ${timer.isFinished ? 'blinking' : ''}`}>
                            {timer.isFinished && <BellRing size={24} className="ring-icon" />}
                            {formatTime(timer.remainingSeconds)}
                          </div>
                          
                          {/* Barra de Progresso */}
                          <div className="timer-progress-bar-bg">
                            <div 
                              className="timer-progress-bar-fill" 
                              style={{ width: `${calculateProgress(timer.remainingSeconds, timer.initialSeconds)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="timer-controls">
                          {!timer.isFinished && (
                            <button 
                              className={`ctrl-btn ${timer.isRunning ? 'btn-pause' : 'btn-play'}`}
                              onClick={() => toggleTimer(timer.id)}
                              title={timer.isRunning ? "Pausar" : "Iniciar"}
                            >
                              {timer.isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                            </button>
                          )}
                          <button className="ctrl-btn btn-reset" onClick={() => resetTimer(timer.id)} title="Zerar">
                            <RotateCcw size={18} />
                          </button>
                          <button className="ctrl-btn btn-delete" onClick={() => deleteTimer(timer.id)} title="Excluir">
                            <Trash2 size={18} />
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

            {/* Coluna Lateral: Informações */}
            <aside className="tool-sidebar-panel">
              <div className="tool-info-card">
                <h3><Info size={18} /> Como utilizar</h3>
                <p>Configure múltiplos cronômetros para acompanhar processos paralelos na sua bancada sem depender de aparelhos externos.</p>
                <ul className="tool-info-list timer-tips">
                  <li><strong>1. Nomeie:</strong> Dê um nome claro (ex: "Centrífuga 1").</li>
                  <li><strong>2. Configure:</strong> Insira horas, minutos e segundos.</li>
                  <li><strong>3. Inicie:</strong> Adicione à lista e clique no ícone de Play (<Play size={14}/>).</li>
                </ul>
                <div className="info-alert alert-amber">
                  <BellRing size={16}/>
                  <small>Quando o tempo zerar, o card piscará indicando que o processo foi concluído.</small>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LabTimer;