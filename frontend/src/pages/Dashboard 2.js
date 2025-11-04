import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, metricsService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

function Dashboard() {
  const [metrics, setMetrics] = useState({
    agendamentos: 0,
    visitasRealizadas: 0,
    contratosAssinados: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadMetrics();
  }, [navigate]);

  const loadMetrics = async () => {
    try {
      const response = await metricsService.getMetrics();
      setMetrics({
        agendamentos: response.data.agendamentos || 0,
        visitasRealizadas: response.data.visitasRealizadas || 0,
        contratosAssinados: response.data.contratosAssinados || 0
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const handleChange = (field, value) => {
    setMetrics(prev => ({
      ...prev,
      [field]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await metricsService.updateMetrics(metrics);
      setMessage('Métricas atualizadas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erro ao atualizar métricas');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = () => {
    const pontosAgendamentos = metrics.agendamentos * 5;
    const pontosVisitas = metrics.visitasRealizadas * 20;
    const pontosContratos = metrics.contratosAssinados * 50;
    const total = pontosAgendamentos + pontosVisitas + pontosContratos;

    return {
      pontosAgendamentos,
      pontosVisitas,
      pontosContratos,
      total
    };
  };

  const points = calculatePoints();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Painel de Métricas</h1>
        <div className="user-info">
          <span>Olá, {user?.username}</span>
          <button onClick={authService.logout} className="logout-btn">
            Sair
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="metrics-form">
          <h2>Atualizar Métricas</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Agendamentos (5 pontos cada)
                <input
                  type="number"
                  value={metrics.agendamentos}
                  onChange={(e) => handleChange('agendamentos', e.target.value)}
                  min="0"
                  disabled={loading}
                />
              </label>
              <span className="points-preview">{points.pontosAgendamentos} pontos</span>
            </div>

            <div className="form-group">
              <label>
                Visitas Realizadas (20 pontos cada)
                <input
                  type="number"
                  value={metrics.visitasRealizadas}
                  onChange={(e) => handleChange('visitasRealizadas', e.target.value)}
                  min="0"
                  disabled={loading}
                />
              </label>
              <span className="points-preview">{points.pontosVisitas} pontos</span>
            </div>

            <div className="form-group">
              <label>
                Contratos Assinados (50 pontos cada)
                <input
                  type="number"
                  value={metrics.contratosAssinados}
                  onChange={(e) => handleChange('contratosAssinados', e.target.value)}
                  min="0"
                  disabled={loading}
                />
              </label>
              <span className="points-preview">{points.pontosContratos} pontos</span>
            </div>

            <div className="total-points">
              <h3>Total de Pontos: {points.total}</h3>
            </div>

            {message && (
              <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Métricas'}
            </button>
          </form>
        </div>

        <div className="dashboard-links">
          <a href="/ranking" target="_blank" rel="noopener noreferrer">
            Ver Ranking Público
          </a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;