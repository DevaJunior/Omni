import React from 'react';
import { ArrowRight } from 'lucide-react';
import './styles.css';

export interface Experiment {
  id: string;
  badge: string;
  title: string;
  description: string;
}

interface BenchWorkProps {
  experiments?: Experiment[];
  onViewAll?: () => void;
  onOpenNotebook?: (id: string) => void;
  onViewProtocol?: (id: string) => void;
}

const defaultExperiments: Experiment[] = [
  {
    id: '1',
    badge: 'EXPERIMENTO EM CURSO',
    title: 'Análise Cinética de Enzimas (Lote C)',
    description: 'O protocolo de extração foi iniciado com sucesso. O espectrofotômetro encontra-se reservado para leitura das amostras em aproximadamente 30 minutos.'
  }
];

const BenchWork: React.FC<BenchWorkProps> = ({
  experiments = defaultExperiments,
  onViewAll,
  onOpenNotebook,
  onViewProtocol
}) => {
  return (
    <section className="mybench-section">
      <div className="mybench-section-header">
        <h2>Trabalho em Bancada</h2>
        <button className="mybench-link-action" onClick={onViewAll} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Ver tudo <ArrowRight size={16} />
        </button>
      </div>

      {experiments.map((exp) => (
        <div key={exp.id} className="mybench-card mybench-experiment-card">
          <div className="experiment-badge">{exp.badge}</div>
          <h3>{exp.title}</h3>
          <p>{exp.description}</p>
          <div className="experiment-actions">
            <button className="btn-dark" onClick={() => onOpenNotebook?.(exp.id)}>Abrir Caderno</button>
            <button className="btn-outline" onClick={() => onViewProtocol?.(exp.id)}>Ver Protocolo</button>
          </div>
        </div>
      ))}
    </section>
  );
};

export default BenchWork;
