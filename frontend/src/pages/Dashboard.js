import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Video, Building2, DollarSign, Save, LogOut, User, Search } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Dashboard() {
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
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
      setHasChanges(false);
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
      const parsed = parseInt(value, 10);
      processedValue = isNaN(parsed) ? '' : Math.max(0, parsed);
    }

    setCorretores(prev => prev.map(corretor =>
      corretor.email.toLowerCase() === corretorEmail.toLowerCase()
        ? {
            ...corretor,
            metrics: { ...corretor.metrics, [field]: processedValue },
            pontos: calculatePoints({ ...corretor.metrics, [field]: processedValue })
          }
        : corretor
    ));
    setHasChanges(true);
  };

  const saveAllMetrics = async () => {
    try {
      setSaving(true);
      setMessage('');

      // Salvar todos os corretores em paralelo
      const savePromises = corretores.map(async (corretor) => {
        const metrics = {
          videos: corretor.metrics.videos === '' ? 0 : parseInt(corretor.metrics.videos) || 0,
          visitas: corretor.metrics.visitas === '' ? 0 : parseInt(corretor.metrics.visitas) || 0,
          vendas: corretor.metrics.vendas === '' ? 0 : parseInt(corretor.metrics.vendas) || 0
        };

        const response = await fetch(`${API_URL}/corretor-metrics/${corretor.email}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify(metrics)
        });

        if (!response.ok) {
          throw new Error(`Erro ao salvar métricas de ${corretor.name}`);
        }

        return { success: true, corretor: corretor.name };
      });

      await Promise.all(savePromises);

      setMessage('Todas as métricas foram atualizadas com sucesso!');
      setHasChanges(false);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
      setMessage(`Erro ao salvar métricas: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredCorretores = corretores.filter(corretor =>
    corretor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corretor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corretor.gerente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corretor.diretor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center text-gray-400">Carregando corretores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
              <User className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gerenciar Corretores
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Preencha as métricas dos corretores (Vídeo: 10pts, Visita: 20pts, Venda: 100pts)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Olá, {user?.username}</span>
            <Button
              onClick={authService.logout}
              variant="outline"
              size="sm"
              className="gap-2 border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 text-sm p-3 rounded-md border animate-in slide-in-from-bottom-1 duration-200 ${
            message.includes('sucesso')
              ? 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30'
              : 'text-red-400 bg-red-950/50 border-red-500/30'
          }`}>
            {message}
          </div>
        )}

        {/* Search and Actions */}
        <Card className="mb-6 bg-zinc-900 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, email, gerente ou diretor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black border-orange-500/20 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                onClick={saveAllMetrics}
                disabled={saving || !hasChanges}
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white min-w-[150px]"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Tudo'}
              </Button>
            </div>
            {hasChanges && (
              <p className="text-xs text-orange-400 mt-2">
                Você tem alterações não salvas
              </p>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-zinc-900 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center justify-between">
              <span>Corretores ({filteredCorretores.length})</span>
              <span className="text-sm text-gray-400 font-normal">
                Total de pontos: {filteredCorretores.reduce((sum, c) => sum + (c.pontos || 0), 0)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCorretores.length > 0 ? (
              <div className="rounded-md border border-orange-500/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-orange-500/20 bg-zinc-950 hover:bg-zinc-950">
                      <TableHead className="text-orange-500 font-bold">Corretor</TableHead>
                      <TableHead className="text-orange-500 font-bold">Gerente</TableHead>
                      <TableHead className="text-orange-500 font-bold">Diretor</TableHead>
                      <TableHead className="text-orange-500 font-bold text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Video className="h-4 w-4" />
                          Vídeos
                        </div>
                      </TableHead>
                      <TableHead className="text-orange-500 font-bold text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Visitas
                        </div>
                      </TableHead>
                      <TableHead className="text-orange-500 font-bold text-center">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Vendas
                        </div>
                      </TableHead>
                      <TableHead className="text-orange-500 font-bold text-right">Pontos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCorretores.map((corretor) => (
                      <TableRow
                        key={corretor.email}
                        className="border-orange-500/10 hover:bg-orange-500/5"
                      >
                        <TableCell className="font-medium">
                          <div className="space-y-0.5">
                            <p className="text-white text-sm">{corretor.name}</p>
                            <p className="text-xs text-gray-500">{corretor.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {corretor.gerente || '-'}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {corretor.diretor || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Input
                              type="number"
                              value={corretor.metrics.videos}
                              onChange={(e) => handleMetricChange(corretor.email, 'videos', e.target.value)}
                              min="0"
                              disabled={saving}
                              className="h-8 w-20 text-center bg-black border-orange-500/30 text-white"
                            />
                            <span className="text-xs text-orange-400">
                              {(corretor.metrics.videos || 0) * 10}pts
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Input
                              type="number"
                              value={corretor.metrics.visitas}
                              onChange={(e) => handleMetricChange(corretor.email, 'visitas', e.target.value)}
                              min="0"
                              disabled={saving}
                              className="h-8 w-20 text-center bg-black border-orange-500/30 text-white"
                            />
                            <span className="text-xs text-blue-400">
                              {(corretor.metrics.visitas || 0) * 20}pts
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Input
                              type="number"
                              value={corretor.metrics.vendas}
                              onChange={(e) => handleMetricChange(corretor.email, 'vendas', e.target.value)}
                              min="0"
                              disabled={saving}
                              className="h-8 w-20 text-center bg-black border-orange-500/30 text-white"
                            />
                            <span className="text-xs text-purple-400">
                              {(corretor.metrics.vendas || 0) * 100}pts
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-lg font-bold text-orange-500">
                            {corretor.pontos || 0}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 text-gray-400">
                {searchTerm ? 'Nenhum corretor encontrado com a busca.' : 'Nenhum corretor encontrado.'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="mt-6 bg-zinc-900 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Button
                asChild
                variant="outline"
                className="w-full border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
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
  );
}

export default Dashboard;
