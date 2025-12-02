import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Video, Building2, DollarSign, Save, User, LogOut, ArrowLeft } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function CorretoresDashboard() {
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Se for admin, redireciona para /admin
    if (user?.email === 'mkt@urban.imb.br') {
      navigate('/admin');
      return;
    }

    loadCorretores();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCorretores = async () => {
    try {
      setLoading(true);
      
      // Buscar estrutura de corretores do backend
      const structureResponse = await fetch(`${API_URL}/dashboard/structure`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!structureResponse.ok) {
        throw new Error('Erro ao carregar estrutura de corretores');
      }

      const structureData = await structureResponse.json();
      
      // Buscar métricas de todos os corretores
      const metricsResponse = await fetch(`${API_URL}/corretor-metrics`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const allMetrics = metricsResponse.ok ? await metricsResponse.json() : {};

      // Combinar estrutura com métricas
      const corretoresComMetricas = structureData.corretores.map(corretor => {
        const emailKey = corretor.email.toLowerCase();
        const metrics = allMetrics[emailKey] || { videos: 0, visitas: 0, vendas: 0 };
        
        return {
          ...corretor,
          metrics: {
            videos: metrics.videos || 0,
            visitas: metrics.visitas || 0,
            vendas: metrics.vendas || 0
          },
          pontos: calculatePoints(metrics)
        };
      });

      setCorretores(corretoresComMetricas);
    } catch (error) {
      console.error('Erro ao carregar corretores:', error);
      setMessage('Erro ao carregar corretores');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = (metrics) => {
    const videos = metrics.videos || 0;
    const visitas = metrics.visitas || 0;
    const vendas = metrics.vendas || 0;
    return (videos * 10) + (visitas * 20) + (vendas * 100);
  };

  const handleMetricChange = (corretorEmail, field, value) => {
    let processedValue;
    if (value === '') {
      processedValue = '';
    } else {
      const parsed = parseFloat(value);
      processedValue = isNaN(parsed) ? '' : Math.max(0, parsed);
    }

    setCorretores(prev => prev.map(corretor =>
      corretor.email.toLowerCase() === corretorEmail.toLowerCase()
        ? {
            ...corretor,
            metrics: { ...corretor.metrics, [field]: processedValue },
            pontos: calculatePoints({
              ...corretor.metrics,
              [field]: processedValue === '' ? 0 : processedValue
            })
          }
        : corretor
    ));
  };

  const saveMetrics = async (corretorEmail) => {
    try {
      setSaving(prev => ({ ...prev, [corretorEmail]: true }));
      setMessage('');

      const corretor = corretores.find(c => c.email.toLowerCase() === corretorEmail.toLowerCase());
      const metrics = {
        videos: corretor.metrics.videos === '' ? 0 : parseFloat(corretor.metrics.videos) || 0,
        visitas: corretor.metrics.visitas === '' ? 0 : parseFloat(corretor.metrics.visitas) || 0,
        vendas: corretor.metrics.vendas === '' ? 0 : parseFloat(corretor.metrics.vendas) || 0
      };

      const response = await fetch(`${API_URL}/corretor-metrics/${encodeURIComponent(corretorEmail)}`, {
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

      setMessage(`Métricas de ${corretor.name} atualizadas com sucesso!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
      setMessage('Erro ao salvar métricas');
    } finally {
      setSaving(prev => ({ ...prev, [corretorEmail]: false }));
    }
  };

  const filteredCorretores = corretores.filter(corretor =>
    corretor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corretor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corretor.gerente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-muted-foreground">Carregando corretores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gerenciar Corretores
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha as métricas dos corretores (Vídeo: 10pts, Visita: 20pts, Venda: 100pts)
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

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Input
              type="text"
              placeholder="Buscar por nome, email ou gerente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {filteredCorretores.length > 0 ? (
            filteredCorretores.map((corretor) => {
              const isSaving = saving[corretor.email];
              
              return (
                <Card key={`corretor-${corretor.email}`} className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground font-semibold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {corretor.name}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Email: {corretor.email}</p>
                      <p>Gerente: {corretor.gerente}</p>
                      <p>Diretor: {corretor.diretor}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Vídeos (10 pts cada)
                        </label>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={corretor.metrics.videos}
                            onChange={(e) => handleMetricChange(corretor.email, 'videos', e.target.value)}
                            min="0"
                            step="0.5"
                            disabled={isSaving}
                            className="h-10"
                          />
                          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 block text-center">
                            {corretor.metrics.videos * 10} pontos
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
                            onChange={(e) => handleMetricChange(corretor.email, 'visitas', e.target.value)}
                            min="0"
                            step="0.5"
                            disabled={isSaving}
                            className="h-10"
                          />
                          <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 block text-center">
                            {corretor.metrics.visitas * 20} pontos
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Vendas (100 pts cada)
                        </label>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={corretor.metrics.vendas}
                            onChange={(e) => handleMetricChange(corretor.email, 'vendas', e.target.value)}
                            min="0"
                            step="0.5"
                            disabled={isSaving}
                            className="h-10"
                          />
                          <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200 block text-center">
                            {corretor.metrics.vendas * 100} pontos
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center gap-4">
                        <Card className="border-primary/20 bg-primary/5 p-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-foreground">
                              {corretor.pontos}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total de Pontos
                            </div>
                          </div>
                        </Card>

                        <Button
                          onClick={() => saveMetrics(corretor.email)}
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
            <Card className="border text-center p-8">
              <CardContent>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum corretor encontrado com a busca.' : 'Nenhum corretor encontrado.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default CorretoresDashboard;

