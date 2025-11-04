import React, { useState, useEffect, useCallback } from 'react';
import { rankingService } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await rankingService.getRanking();
      setRanking(response.data);
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


  if (loading && ranking.length === 0) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">🏆 Ranking de Plataforma</h1>
          </div>
          <div className="text-center text-white">Carregando ranking...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">🏆 Ranking de Plataforma</h1>
        </div>

        {error && (
          <Card className="mb-6 border-red-500/30 bg-red-900/80 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="text-center text-red-200">
                {error}
                <Button
                  onClick={loadRanking}
                  variant="destructive"
                  className="mt-4"
                >
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {ranking.length === 0 && !loading ? (
          <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="text-center text-slate-300">
                Nenhum diretor encontrado no ranking.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-end justify-center gap-8 min-h-[calc(100vh-200px)] relative px-8">
            {ranking.map((director, index) => {
              const podiumHeight = director.posicao === 1 ? 'h-[562px] md:h-[650px]' :
                                  director.posicao === 2 ? 'h-[480px] md:h-[525px]' :
                                  director.posicao === 3 ? 'h-[400px] md:h-[450px]' : 'h-[316px] md:h-[352px]';

              const podiumOrder = director.posicao === 1 ? 'order-2' :
                                 director.posicao === 2 ? 'order-1' :
                                 director.posicao === 3 ? 'order-3' :
                                 'order-4';

              return (
                <div key={director.id} className={`flex flex-col items-center ${podiumOrder} animate-in column-delay-${index}`}>
                  {/* Pódio Base */}
                  <div className={`w-72 md:w-80 lg:w-96 ${podiumHeight} ${
                    director.posicao === 1
                      ? 'bg-orange-500 border-b-4 border-orange-600'
                      : director.posicao === 2
                      ? 'bg-gray-300 border-b-4 border-gray-400'
                      : director.posicao === 3
                      ? 'bg-amber-600 border-b-4 border-amber-700'
                      : 'bg-slate-500 border-b-4 border-slate-600'
                  } rounded-t-3xl flex flex-col justify-between p-4 relative transition-all duration-500 hover:scale-105 hover:-translate-y-1`}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: 'podiumRise 0.8s ease-out forwards'
                  }}>

                    {/* Card do Diretor no topo do pódio */}
                    <div className={`border-l-4 ${
                      director.posicao === 1
                        ? 'border-l-orange-500'
                        : director.posicao === 2
                        ? 'border-l-gray-300'
                        : director.posicao === 3
                        ? 'border-l-amber-600'
                        : 'border-l-slate-500'
                    } rounded-lg p-4 transition-all duration-200 relative z-10`}
                    style={{
                      backgroundColor: director.posicao === 1 ? '#f8913c' :
                                     director.posicao === 2 ? '#e5e7eb' :
                                     director.posicao === 3 ? '#F59E0B' : '#94A3B8'
                    }}>
                      <div className="text-center">
                        {/* Emoji da Posição */}
                        <div className="flex items-center justify-center mb-3">
                          {director.posicao <= 3 ? (
                            <span className="text-4xl">
                              {getPositionEmoji(director.posicao)}
                            </span>
                          ) : (
                            <span className="text-2xl font-bold text-white">
                              #{director.posicao}
                            </span>
                          )}
                        </div>

                        {/* Nome */}
                        <h3 className={`text-lg font-bold mb-2 ${
                          director.posicao === 1 ? 'text-white' :
                          director.posicao === 2 ? 'text-gray-800' :
                          director.posicao === 3 ? 'text-white' : 'text-white'
                        }`}>
                          Plataforma {director.username}
                        </h3>

                        {/* Pontuação Total */}
                        <div className="rounded-xl px-4 py-2 mb-3 shadow-md bg-white">
                          <div className="text-2xl font-bold text-gray-800">
                            {director.pontuacaoTotal}
                          </div>
                          <div className="text-xs text-gray-600">pontos</div>
                        </div>
                      </div>
                    </div>

                    {/* Métricas no corpo do pódio - lado a lado */}
                    <div className="grid grid-cols-3 gap-3 relative z-10">
                      <div className="bg-white rounded-lg p-3 text-center transition-all duration-200">
                        <div className="text-base font-bold text-gray-800 mb-1">{director.agendamentos}</div>
                        <div className="text-xs text-gray-600 mb-2 leading-tight">Agendamentos</div>
                        <div className="text-xs text-emerald-700 bg-emerald-500/25 rounded-full px-2 py-1">
                          {director.detalhePontos.pontosAgendamentos}pts
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 text-center transition-all duration-200">
                        <div className="text-base font-bold text-gray-800 mb-1">{director.visitasRealizadas}</div>
                        <div className="text-xs text-gray-600 mb-2 leading-tight">Visitas</div>
                        <div className="text-xs text-blue-700 bg-blue-500/25 rounded-full px-2 py-1">
                          {director.detalhePontos.pontosVisitas}pts
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 text-center transition-all duration-200">
                        <div className="text-base font-bold text-gray-800 mb-1">{director.contratosAssinados}</div>
                        <div className="text-xs text-gray-600 mb-2 leading-tight">Contratos</div>
                        <div className="text-xs text-purple-700 bg-purple-500/25 rounded-full px-2 py-1">
                          {director.detalhePontos.pontosContratos}pts
                        </div>
                      </div>
                    </div>

                    {/* Número da posição ao fundo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl md:text-9xl font-bold opacity-10 text-white">
                        {director.posicao}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Ranking;