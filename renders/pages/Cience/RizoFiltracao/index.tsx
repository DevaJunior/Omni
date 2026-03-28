import React, { useState } from 'react';
import { Beaker, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import './styles.css';
import { analyzeFuzzyData, type FuzzyInputData, type FuzzyResultData } from '../../../../src/services/fuzzy/fuzzyService';

const RizoFiltracao: React.FC = () => {
  const [formData, setFormData] = useState<FuzzyInputData>({
    ph: 7.0,
    concentration: 50.0,
    biomass: 10.0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FuzzyResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const fuzzyResult = await analyzeFuzzyData(formData);
      setResult(fuzzyResult);
    } catch (err) {
      console.error(err);
      setError('Falha ao comunicar com o servidor de análise. Verifique se o backend Python está rodando.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rizo-container">
      <header className="rizo-header">
        <div className="title-wrapper">
          <Activity size={32} color="var(--primary)" />
          <h1>Análise P-Fuzzy: Rizo Filtração</h1>
        </div>
        <p>Insira os parâmetros do experimento biotecnológico para calcular a eficiência de remoção de contaminantes utilizando lógica nebulosa parametrizada (P-Fuzzy).</p>
      </header>

      <div className="rizo-content">
        <form className="fuzzy-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ph">Nível de pH (0 - 14)</label>
            <div className="input-wrapper">
              <Beaker size={18} className="input-icon" />
              <input
                type="number"
                id="ph"
                name="ph"
                step="0.1"
                min="0"
                max="14"
                value={formData.ph}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="concentration">Concentração Inicial do Contaminante (mg/L)</label>
            <div className="input-wrapper">
              <Beaker size={18} className="input-icon" />
              <input
                type="number"
                id="concentration"
                name="concentration"
                step="0.1"
                min="0"
                value={formData.concentration}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="biomass">Massa da Raiz / Biomassa (g)</label>
            <div className="input-wrapper">
              <Beaker size={18} className="input-icon" />
              <input
                type="number"
                id="biomass"
                name="biomass"
                step="0.1"
                min="0"
                value={formData.biomass}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Processando Lógica P-Fuzzy...' : 'Executar Análise'}
          </button>
        </form>

        <div className="result-panel">
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {!result && !error && !isLoading && (
            <div className="empty-state">
              <Activity size={48} color="var(--border)" />
              <p>Aguardando dados para processar a inferência P-Fuzzy.</p>
            </div>
          )}

          {result && (
            <div className="success-result">
              <div className="result-header">
                <CheckCircle2 size={24} color="var(--primary)" />
                <h2>Resultado da Inferência</h2>
              </div>
              
              <div className="efficiency-display">
                <span className="efficiency-label">Eficiência Prevista de Remoção</span>
                <span className="efficiency-value">{result.efficiency.toFixed(2)}%</span>
              </div>

              <div className="result-details">
                <p><strong>Status Operacional:</strong> {result.status}</p>
                <p><strong>Detalhes P-Fuzzy:</strong> {result.details}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RizoFiltracao;