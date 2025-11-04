import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Target, TrendingUp, Calendar, Video, Building2, DollarSign } from 'lucide-react';
import { useRanking } from '../hooks/useRanking';
import { formatDate } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RankingCardSkeleton } from '../components/RankingCardSkeleton';
import { Progress } from '../components/ui/progress';

export const Ranking: React.FC = () => {
  const { data, loading, error, refreshRanking } = useRanking();

  // Animation states
  const [skeletonMode, setSkeletonMode] = useState(false);
  const [statsGlow, setStatsGlow] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevLastUpdatedRef = useRef<string | null>(null);

  // Handle refresh with animations
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSkeletonMode(true);
    setStatsGlow(true);

    try {
      await refreshRanking();
    } finally {
      setTimeout(() => {
        setSkeletonMode(false);
        setStatsGlow(false);
        setIsRefreshing(false);
      }, 1500);
    }
  };

  // Monitor data changes to trigger animations on auto-refresh
  useEffect(() => {
    if (data?.lastUpdated && !isRefreshing) {
      if (prevLastUpdatedRef.current && prevLastUpdatedRef.current !== data.lastUpdated) {
        setSkeletonMode(true);
        setStatsGlow(true);

        setTimeout(() => {
          setSkeletonMode(false);
          setStatsGlow(false);
        }, 1500);
      }

      prevLastUpdatedRef.current = data.lastUpdated;
    }
  }, [data?.lastUpdated, isRefreshing, data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-orange-400 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Erro ao carregar dados</div>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={refreshRanking}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen p-2 md:p-4 bg-black">
      <div className="w-full flex flex-col space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-orange-500 mb-2">
              🏆 Ranking de Vendas
            </h1>
            <p className="text-sm text-gray-400">
              {formatDate(data.period.startDate)} - {formatDate(data.period.endDate)}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
            <div className="text-xs text-gray-400">
              Atualizado: {new Date(data.lastUpdated).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 text-orange-500 rounded-lg border border-orange-500/30 hover:bg-orange-500/30 transition-colors text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar - Meta de Vendas */}
        <Card className={`bg-zinc-900 border-orange-500/20 shadow-xl transition-all duration-1000 ${statsGlow ? 'shadow-orange-500/50 shadow-2xl border-orange-500/50' : ''}`}>
          <CardContent className="p-4">
            <h3 className="text-base font-bold text-orange-500 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Meta de Vendas
            </h3>
            <div className="space-y-2">
              <Progress
                value={data.progressPercentage}
                className="h-4 bg-zinc-800 [&>div]:bg-orange-500"
              />
              <div className="flex justify-between text-sm text-gray-300">
                <span className="text-orange-400 font-bold">{data.totalVendas} vendas</span>
                <span>{data.metaVendas} vendas (meta)</span>
              </div>
              <div className="text-center text-lg font-bold text-orange-500">
                {data.progressPercentage.toFixed(1)}% da meta atingida
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 md:gap-4">
          {/* Left: Top 15 Corretores */}
          <div className="lg:col-span-8">
            <Card className="bg-zinc-900 border-orange-500/30 shadow-xl h-full">
              <CardHeader className="pb-4 border-b border-orange-500/20">
                <CardTitle className="text-xl text-orange-500 flex items-center gap-2">
                  <div className="w-2 h-6 bg-orange-500 rounded-full" />
                  🏆 Top 15 Corretores
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col lg:grid lg:grid-cols-3 gap-3 p-4 pt-4 h-full">
                {/* Primeira coluna - Posições 1-5 */}
                <div className="space-y-2">
                  {skeletonMode ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={`skeleton-1-${index}`} className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
                    ))
                  ) : (
                    <>
                      {data.topCorretores.slice(0, 5).map((corretor) => (
                        <CorretorCard key={corretor.position} corretor={corretor} />
                      ))}
                      {/* Mobile: Mostrar todos */}
                      <div className="lg:hidden space-y-2">
                        {data.topCorretores.slice(5, 15).map((corretor) => (
                          <CorretorCard key={corretor.position} corretor={corretor} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Segunda coluna - Posições 6-10 (desktop only) */}
                <div className="hidden lg:block space-y-2">
                  {skeletonMode ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={`skeleton-2-${index}`} className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
                    ))
                  ) : (
                    data.topCorretores.slice(5, 10).map((corretor) => (
                      <CorretorCard key={corretor.position} corretor={corretor} />
                    ))
                  )}
                </div>

                {/* Terceira coluna - Posições 11-15 (desktop only) */}
                <div className="hidden lg:block space-y-2">
                  {skeletonMode ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={`skeleton-3-${index}`} className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
                    ))
                  ) : (
                    data.topCorretores.slice(10, 15).map((corretor) => (
                      <CorretorCard key={corretor.position} corretor={corretor} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Top 5 Gerentes and Top 5 Diretores */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Top 5 Gerentes */}
            <Card className="bg-zinc-900 border-orange-500/30 shadow-xl">
              <CardHeader className="pb-3 border-b border-orange-500/20">
                <CardTitle className="text-base text-orange-500 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                  🥇 Top 5 Gerentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4">
                {skeletonMode ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={`skeleton-gerente-${index}`} className="h-20 bg-zinc-800 rounded-lg animate-pulse" />
                  ))
                ) : (
                  data.topGerentes.map((gerente) => (
                    <GerenteCard key={gerente.position} gerente={gerente} />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Top 5 Diretores */}
            <Card className="bg-zinc-900 border-orange-500/30 shadow-xl">
              <CardHeader className="pb-3 border-b border-orange-500/20">
                <CardTitle className="text-base text-orange-500 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                  🏆 Top 5 Diretores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4">
                {skeletonMode ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={`skeleton-diretor-${index}`} className="h-20 bg-zinc-800 rounded-lg animate-pulse" />
                  ))
                ) : (
                  data.topDiretores?.map((diretor) => (
                    <DiretorCard key={diretor.position} diretor={diretor} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para Card de Corretor
const CorretorCard = ({ corretor }: any) => {
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-orange-700/20 to-orange-800/20 border-orange-700/50";
      default:
        return "bg-zinc-800 border-zinc-700";
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return position.toString();
    }
  };

  return (
    <div className={`p-3 rounded-lg border transition-all duration-300 hover:border-orange-500 ${getPositionStyles(corretor.position)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-500">
            {getPositionIcon(corretor.position)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">{corretor.name}</p>
            <p className="text-xs text-gray-400">{corretor.gerente}</p>
            <p className="text-xs text-gray-500">{corretor.diretor}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-orange-500">{corretor.pontos}</div>
          <div className="text-xs text-gray-400">pontos</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-700/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Video className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-orange-400 font-bold">{corretor.videos || 0}</span>
          </div>
          <div className="text-xs text-gray-500">vídeos</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Building2 className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-orange-400 font-bold">{corretor.visitas || 0}</span>
          </div>
          <div className="text-xs text-gray-500">visitas</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-orange-400 font-bold">{corretor.vendas || 0}</span>
          </div>
          <div className="text-xs text-gray-500">vendas</div>
        </div>
      </div>
    </div>
  );
};

// Componente para Card de Gerente
const GerenteCard = ({ gerente }: any) => {
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
      case 2: return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 3: return "bg-gradient-to-r from-orange-700/20 to-orange-800/20 border-orange-700/50";
      default: return "bg-zinc-800 border-zinc-700";
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return position.toString();
    }
  };

  return (
    <div className={`p-3 rounded-lg border transition-all duration-300 hover:border-orange-500 ${getPositionStyles(gerente.position)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-500">
            {getPositionIcon(gerente.position)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">{gerente.name}</p>
            <p className="text-xs text-gray-400">{gerente.diretor}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-orange-500">{gerente.pontos}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-700/50">
        <div className="text-center">
          <div className="text-xs text-orange-400 font-bold">{gerente.videos || 0}</div>
          <div className="text-xs text-gray-500">vídeos</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-orange-400 font-bold">{gerente.visitas || 0}</div>
          <div className="text-xs text-gray-500">visitas</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-orange-400 font-bold">{gerente.vendas || 0}</div>
          <div className="text-xs text-gray-500">vendas</div>
        </div>
      </div>
    </div>
  );
};

// Componente para Card de Diretor
const DiretorCard = ({ diretor }: any) => {
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
      case 2: return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 3: return "bg-gradient-to-r from-orange-700/20 to-orange-800/20 border-orange-700/50";
      default: return "bg-zinc-800 border-zinc-700";
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return position.toString();
    }
  };

  return (
    <div className={`p-3 rounded-lg border transition-all duration-300 hover:border-orange-500 ${getPositionStyles(diretor.position)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-500">
            {getPositionIcon(diretor.position)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">{diretor.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-orange-500">{diretor.pontos}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-700/50">
        <div className="text-center">
          <div className="text-xs text-orange-400 font-bold">{diretor.videos || 0}</div>
          <div className="text-xs text-gray-500">vídeos</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-orange-400 font-bold">{diretor.visitas || 0}</div>
          <div className="text-xs text-gray-500">visitas</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-orange-400 font-bold">{diretor.vendas || 0}</div>
          <div className="text-xs text-gray-500">vendas</div>
        </div>
      </div>
    </div>
  );
};
