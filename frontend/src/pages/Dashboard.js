import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, metricsService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar, Building2, FileText, Trophy, LogOut, User } from 'lucide-react';

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

    // Se for admin (mkt), redireciona para /admin
    if (user?.email === 'mkt@urban.imb.br') {
      navigate('/admin');
      return;
    }

    loadMetrics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    // Permitir string vazia para poder apagar e redigitar
    let processedValue;
    if (value === '') {
      processedValue = '';
    } else {
      const parsed = parseInt(value, 10);
      processedValue = isNaN(parsed) ? '' : Math.max(0, parsed);
    }

    setMetrics(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Converte valores vazios em 0 antes de enviar
      const metricsToSend = {
        agendamentos: metrics.agendamentos === '' ? 0 : parseInt(metrics.agendamentos) || 0,
        visitasRealizadas: metrics.visitasRealizadas === '' ? 0 : parseInt(metrics.visitasRealizadas) || 0,
        contratosAssinados: metrics.contratosAssinados === '' ? 0 : parseInt(metrics.contratosAssinados) || 0
      };

      await metricsService.updateMetrics(metricsToSend);
      setMessage('Métricas atualizadas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erro ao atualizar métricas');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = useMemo(() => {
    const agendamentos = metrics.agendamentos === '' ? 0 : parseInt(metrics.agendamentos) || 0;
    const visitas = metrics.visitasRealizadas === '' ? 0 : parseInt(metrics.visitasRealizadas) || 0;
    const contratos = metrics.contratosAssinados === '' ? 0 : parseInt(metrics.contratosAssinados) || 0;

    const pontosAgendamentos = agendamentos * 5;
    const pontosVisitas = visitas * 20;
    const pontosContratos = contratos * 50;
    const total = pontosAgendamentos + pontosVisitas + pontosContratos;

    return {
      pontosAgendamentos,
      pontosVisitas,
      pontosContratos,
      total
    };
  }, [metrics.agendamentos, metrics.visitasRealizadas, metrics.contratosAssinados]);

  const points = calculatePoints;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Painel de Métricas
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Olá, {user?.username}</span>
            <Button
              onClick={authService.logout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="border shadow-sm animate-in slide-in-from-bottom-4 duration-200">
            <CardHeader>
              <CardTitle className="text-xl text-foreground font-semibold">Atualizar Métricas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie suas métricas de performance
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Agendamentos (5 pontos cada)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={metrics.agendamentos}
                        onChange={(e) => handleChange('agendamentos', e.target.value)}
                        min="0"
                        disabled={loading}
                        className="h-10"
                      />
                      <span className="text-sm text-emerald-700 font-medium min-w-[100px] bg-emerald-50 px-3 py-2 rounded-md border border-emerald-200">
                        {points.pontosAgendamentos} pontos
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Visitas Realizadas (20 pontos cada)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={metrics.visitasRealizadas}
                        onChange={(e) => handleChange('visitasRealizadas', e.target.value)}
                        min="0"
                        disabled={loading}
                        className="h-10"
                      />
                      <span className="text-sm text-blue-700 font-medium min-w-[100px] bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
                        {points.pontosVisitas} pontos
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Contratos Assinados (50 pontos cada)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={metrics.contratosAssinados}
                        onChange={(e) => handleChange('contratosAssinados', e.target.value)}
                        min="0"
                        disabled={loading}
                        className="h-10"
                      />
                      <span className="text-sm text-purple-700 font-medium min-w-[100px] bg-purple-50 px-3 py-2 rounded-md border border-purple-200">
                        {points.pontosContratos} pontos
                      </span>
                    </div>
                  </div>
                </div>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-bold text-foreground">
                          Total: {points.total} pontos
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sua pontuação atual no ranking
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {message && (
                  <div className={`text-sm p-3 rounded-md border animate-in slide-in-from-bottom-1 duration-200 ${
                    message.includes('sucesso')
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-destructive bg-destructive/10 border-destructive/20'
                  }`}>
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? 'Salvando...' : 'Salvar Métricas'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border shadow-sm animate-in slide-in-from-bottom-6 duration-300">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Button
                  onClick={() => navigate('/corretores')}
                  className="w-full gap-2"
                >
                  <User className="h-4 w-4" />
                  Gerenciar Corretores
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a href="/ranking" target="_blank" rel="noopener noreferrer">
                    Ver Ranking Público
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;