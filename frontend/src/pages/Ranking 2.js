import React, { useState, useEffect, useCallback } from 'react';
import { rankingService } from '../services/api';
import './Ranking.css';

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await rankingService.getRanking();
      setRanking(response.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Erro ao carregar ranking');
      console.error('Erro ao carregar ranking:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRanking();

    const interval = setInterval(loadRanking, 30000);

    return () => clearInterval(interval);
  }, [loadRanking]);

  const getPositionEmoji = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getPositionClass = (position) => {
    switch (position) {
      case 1: return 'first-place';
      case 2: return 'second-place';
      case 3: return 'third-place';
      default: return '';
    }
  };

  if (loading && ranking.length === 0) {
    return (
      <div className="ranking-container">
        <div className="ranking-header">
          <h1>🏆 Ranking de Diretores</h1>
        </div>
        <div className="loading">Carregando ranking...</div>
      </div>
    );
  }

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h1>🏆 Ranking de Diretores</h1>
        {lastUpdate && (
          <div className="last-update">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="ranking-content">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadRanking} className="retry-btn">
              Tentar novamente
            </button>
          </div>
        )}

        {ranking.length === 0 && !loading ? (
          <div className="no-data">
            Nenhum diretor encontrado no ranking.
          </div>
        ) : (
          <div className="ranking-list">
            {ranking.map((director) => (
              <div
                key={director.id}
                className={`ranking-item ${getPositionClass(director.posicao)}`}
              >
                <div className="position">
                  <span className="position-number">#{director.posicao}</span>
                  <span className="position-emoji">{getPositionEmoji(director.posicao)}</span>
                </div>

                <div className="director-info">
                  <h3>Plataforma {director.username}</h3>
                  <p>{director.email}</p>
                </div>

                <div className="metrics">
                  <div className="metric">
                    <span className="metric-label">Agendamentos</span>
                    <span className="metric-value">{director.agendamentos}</span>
                    <span className="metric-points">({director.detalhePontos.pontosAgendamentos}pts)</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Visitas</span>
                    <span className="metric-value">{director.visitasRealizadas}</span>
                    <span className="metric-points">({director.detalhePontos.pontosVisitas}pts)</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Contratos</span>
                    <span className="metric-value">{director.contratosAssinados}</span>
                    <span className="metric-points">({director.detalhePontos.pontosContratos}pts)</span>
                  </div>
                </div>

                <div className="total-score">
                  <span className="score-label">Total</span>
                  <span className="score-value">{director.pontuacaoTotal}</span>
                  <span className="score-unit">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="ranking-footer">
          <p className="auto-update-info">
            📱 Esta página atualiza automaticamente a cada 30 segundos
          </p>
        </div>
      </div>
    </div>
  );
}

export default Ranking;