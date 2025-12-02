import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Settings, Calendar, Building2, FileText, Save, User, LogOut } from 'lucide-react';

function Admin() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Verificar se é admin
    if (user?.email !== 'mkt@urban.imb.br') {
      navigate('/dashboard');
      return;
    }

    loadDirectors();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDirectors = async () => {
    try {
      setLoading(true);
      console.log('Iniciando busca de corretores...');
      console.log('Token:', authService.getToken());

      const response = await fetch('/api/admin/directors', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na resposta:', errorData);
        throw new Error(`Erro ao carregar corretores: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      console.log('Corretores:', data.directors);
      console.log('Quantidade de corretores:', data.directors?.length);

      if (data.directors && data.directors.length > 0) {
        setDirectors(data.directors);
        console.log('State directors atualizado com:', data.directors);
      } else {
        console.warn('Nenhum corretor retornado da API');
        setDirectors([]);
      }
    } catch (error) {
      console.error('Erro ao carregar corretores:', error);
      setMessage('Erro ao carregar corretores');
    } finally {
      setLoading(false);
    }
  };

  const handleMetricChange = (corretorId, field, value) => {
    // Permitir string vazia para poder apagar e redigitar
    let processedValue;
    if (value === '') {
      processedValue = '';
    } else {
      const parsed = parseFloat(value);
      processedValue = isNaN(parsed) ? '' : Math.max(0, parsed);
    }

    setDirectors(prev => prev.map(corretor =>
      corretor.id === corretorId
        ? {
            ...corretor,
            metrics: { ...corretor.metrics, [field]: processedValue }
          }
        : corretor
    ));
  };

  const saveMetrics = async (corretorId) => {
    try {
      setSaving(prev => ({ ...prev, [corretorId]: true }));
      setMessage('');

      const corretor = directors.find(d => d.id === corretorId);
      const metrics = {
        videos: corretor.metrics.videos === '' ? 0 : parseFloat(corretor.metrics.videos) || 0,
        visitas: corretor.metrics.visitas === '' ? 0 : parseFloat(corretor.metrics.visitas) || 0,
        vendas: corretor.metrics.vendas === '' ? 0 : parseFloat(corretor.metrics.vendas) || 0
      };

      const response = await fetch(`/api/admin/directors/${corretorId}/metrics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(metrics)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar métricas');
      }

      setMessage(`Métricas de ${corretor.username} atualizadas com sucesso!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
      setMessage('Erro ao salvar métricas');
    } finally {
      setSaving(prev => ({ ...prev, [corretorId]: false }));
    }
  };

  const calculatePoints = (metrics) => {
    const videos = metrics.videos === '' ? 0 : parseFloat(metrics.videos) || 0;
    const visitas = metrics.visitas === '' ? 0 : parseFloat(metrics.visitas) || 0;
    const vendas = metrics.vendas === '' ? 0 : parseFloat(metrics.vendas) || 0;

    const pontosVideos = videos * 10;
    const pontosVisitas = visitas * 20;
    const pontosVendas = vendas * 100;
    const total = pontosVideos + pontosVisitas + pontosVendas;

    return { pontosVideos, pontosVisitas, pontosVendas, total };
  };

  console.log('Estado atual - loading:', loading);
  console.log('Estado atual - directors:', directors);
  console.log('Estado atual - directors.length:', directors.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Painel Administrativo
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie as métricas dos corretores no ranking
              </p>
            </div>
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

        {message && (
          <div className={`mb-6 text-sm p-3 rounded-md border animate-in slide-in-from-bottom-1 duration-200 ${
            message.includes('sucesso')
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-destructive bg-destructive/10 border-destructive/20'
          }`}>
            {message}
          </div>
        )}

        <div className="grid gap-6">
          {console.log('Renderizando directors:', directors)}
          {directors && directors.length > 0 ? (
            directors.map((corretor) => {
              const points = calculatePoints(corretor.metrics);
              const isSaving = saving[corretor.id];
              console.log('Renderizando corretor:', corretor);

              return (
                <Card key={`corretor-${corretor.id}`} className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {corretor.username}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{corretor.email}</p>
                  {corretor.gerente && (
                    <p className="text-xs text-muted-foreground">Gerente: {corretor.gerente} | Diretor: {corretor.diretor}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Vídeos (10 pts cada)
                      </label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={corretor.metrics.videos}
                          onChange={(e) => handleMetricChange(corretor.id, 'videos', e.target.value)}
                          min="0"
                          step="0.5"
                          disabled={isSaving}
                          className="h-10"
                        />
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 block text-center">
                          {points.pontosVideos} pontos
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Visitas (20 pts cada)
                      </label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={corretor.metrics.visitas}
                          onChange={(e) => handleMetricChange(corretor.id, 'visitas', e.target.value)}
                          min="0"
                          step="0.5"
                          disabled={isSaving}
                          className="h-10"
                        />
                        <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 block text-center">
                          {points.pontosVisitas} pontos
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Vendas (100 pts cada)
                      </label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={corretor.metrics.vendas}
                          onChange={(e) => handleMetricChange(corretor.id, 'vendas', e.target.value)}
                          min="0"
                          step="0.5"
                          disabled={isSaving}
                          className="h-10"
                        />
                        <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200 block text-center">
                          {points.pontosVendas} pontos
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-4">
                      <Card className="border-primary/20 bg-primary/5 p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            {points.total}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total de Pontos
                          </div>
                        </div>
                      </Card>

                      <Button
                        onClick={() => saveMetrics(corretor.id)}
                        disabled={isSaving}
                        className="w-full gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
          ) : (
            <p className="text-center text-muted-foreground">Nenhum corretor para exibir</p>
          )}
        </div>

        {directors.length === 0 && (
          <Card className="border text-center p-8">
            <CardContent>
              <p className="text-muted-foreground">
                Nenhum corretor encontrado para administrar.
              </p>
            </CardContent>
          </Card>
        )}

        {directors.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                💡 <strong>Nota:</strong> Como administradora, você não participa do ranking.
                Esta página permite gerenciar as métricas dos corretores que competem no ranking.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Admin;