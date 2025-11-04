import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Target, TrendingUp, Calendar } from 'lucide-react';
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

    // Start skeleton animation
    setSkeletonMode(true);

    // Start stats glow effect
    setStatsGlow(true);

    try {
      await refreshRanking();
    } finally {
      // End animations after refresh
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
      // Check if lastUpdated actually changed
      if (prevLastUpdatedRef.current && prevLastUpdatedRef.current !== data.lastUpdated) {
        // Trigger animation cycle when data updates from auto-refresh
        setSkeletonMode(true);
        setStatsGlow(true);

        setTimeout(() => {
          setSkeletonMode(false);
          setStatsGlow(false);
        }, 1500);
      }

      // Update the ref
      prevLastUpdatedRef.current = data.lastUpdated;
    }
  }, [data?.lastUpdated, isRefreshing, data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Erro ao carregar dados</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refreshRanking}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen p-2 md:p-3 bg-white">
      <div className="w-full flex flex-col space-y-2 md:space-y-3">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 md:gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
              Campanha Square Garden Multistay 🏆
            </h1>
            <p className="text-xs text-gray-600">
              {formatDate(data.period.startDate)} - {formatDate(data.period.endDate)}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
            <div className="text-xs text-gray-600">
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
              className="flex items-center gap-2 px-2 md:px-3 py-2 bg-blue-100 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-200 transition-colors text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className={`bg-white border-gray-200 shadow-xl transition-all duration-1000 ${statsGlow ? 'shadow-blue-500/30 shadow-2xl border-blue-200' : ''}`}>
          <CardContent className="p-2 md:p-3">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
              Progresso da Meta Global
            </h3>
            <div className="space-y-2">
              <Progress
                value={(data.totalAtingido / data.metaGlobal) * 100}
                className="h-3 bg-gray-100"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{data.totalAtingido.toLocaleString('pt-BR')}</span>
                <span>{data.metaGlobal.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          <Card className={`bg-white border-gray-200 shadow-xl transition-all duration-1000 ${statsGlow ? 'shadow-blue-500/30 shadow-2xl border-blue-200' : ''}`}>
            <CardContent className="p-2 md:p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Atingido</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalAtingido.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-600">agenciamentos</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-white border-gray-200 shadow-xl transition-all duration-1000 ${statsGlow ? 'shadow-blue-500/30 shadow-2xl border-blue-200' : ''}`}>
            <CardContent className="p-2 md:p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">Meta Global</p>
                  <p className="text-2xl font-bold text-gray-900">{data.metaGlobal.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-600">agenciamentos</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-white border-gray-200 shadow-xl transition-all duration-1000 ${statsGlow ? 'shadow-blue-500/30 shadow-2xl border-blue-200' : ''}`}>
            <CardContent className="p-2 md:p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">Progresso</p>
                  <p className="text-2xl font-bold text-gray-900">{data.progressPercentage.toFixed(1)}%</p>
                  <p className="text-xs text-gray-600">da meta</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2 md:gap-4">
          {/* Left: Top 15 Corretores */}
          <div className="lg:col-span-8">
            <Card className="bg-white border-gray-200 shadow-xl h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-6 bg-blue-500 rounded-full" />
                  🏆 Top 15 Corretores
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col lg:grid lg:grid-cols-3 gap-2 md:gap-3 p-2 md:p-4 pt-0 h-full">
                {/* Mobile: Todos os corretores | Desktop: Primeira coluna - Posições 1-5 */}
                <div className="space-y-2 flex flex-col">
                  {skeletonMode ? (
                    <>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <RankingCardSkeleton key={`skeleton-1-${index}`} />
                      ))}
                      {/* Mobile: 10 cards adicionais */}
                      <div className="lg:hidden">
                        {Array.from({ length: 10 }).map((_, index) => (
                          <RankingCardSkeleton key={`skeleton-mobile-${index}`} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {data.topCorretores.slice(0, 5).map((corretor) => {
                    const getPositionStyles = (position: number) => {
                      switch (position) {
                        case 1:
                          return "bg-gradient-to-r from-[#FFD700] to-[#FFA500] border-[#FFD700]";
                        case 2:
                          return "bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] border-[#C0C0C0]";
                        case 3:
                          return "bg-gradient-to-r from-[#CD7F32] to-[#B8860B] border-[#CD7F32]";
                        default:
                          return "bg-gray-50 border-gray-200";
                      }
                    };

                    const getPositionIcon = (position: number) => {
                      switch (position) {
                        case 1:
                          return "🥇";
                        case 2:
                          return "🥈";
                        case 3:
                          return "🥉";
                        default:
                          return position.toString();
                      }
                    };

                    return (
                      <div
                        key={corretor.position}
                        className={`flex items-start justify-between p-2 md:p-3 lg:p-3 rounded-lg hover:border-blue-300 transition-all duration-500 ${getPositionStyles(corretor.position)} min-w-0 w-full`}
                      >
                        <div className="flex items-start gap-1 md:gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 md:w-8 md:h-8 lg:w-7 lg:h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs md:text-xs lg:text-sm font-bold text-blue-600 flex-shrink-0">
                            {getPositionIcon(corretor.position)}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="font-semibold text-gray-900 text-xs md:text-xs lg:text-sm leading-tight break-words">{corretor.name}</p>
                            <p className="text-xs md:text-xs lg:text-sm text-gray-600 leading-tight break-words">{corretor.gerente}</p>
                            <p className="text-xs md:text-xs lg:text-sm text-gray-500 leading-tight break-words">{corretor.diretor}</p>
                          </div>
                        </div>
                        <div className="text-right ml-1 md:ml-1 flex-shrink-0">
                          <div className="text-sm md:text-base lg:text-xl font-bold text-blue-600">
                            {corretor.ages.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs md:text-xs text-gray-600">pontos</div>
                        </div>
                      </div>
                    );
                    })}

                      {/* Mobile: Mostrar corretores 6-15 */}
                      <div className="lg:hidden space-y-2">
                        {data.topCorretores.slice(5, 15).map((corretor) => {
                          const getPositionStyles = (position: number) => {
                            switch (position) {
                              case 1:
                                return "bg-gradient-to-r from-[#FFD700] to-[#FFA500] border-[#FFD700]";
                              case 2:
                                return "bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] border-[#C0C0C0]";
                              case 3:
                                return "bg-gradient-to-r from-[#CD7F32] to-[#B8860B] border-[#CD7F32]";
                              default:
                                return "bg-gray-50 border-gray-200";
                            }
                          };

                          const getPositionIcon = (position: number) => {
                            switch (position) {
                              case 1:
                                return "🥇";
                              case 2:
                                return "🥈";
                              case 3:
                                return "🥉";
                              default:
                                return position.toString();
                            }
                          };

                          return (
                            <div
                              key={corretor.position}
                              className={`flex items-start justify-between p-2 md:p-3 lg:p-3 rounded-lg hover:border-blue-300 transition-all duration-500 ${getPositionStyles(corretor.position)} min-w-0 w-full`}
                            >
                              <div className="flex items-start gap-1 md:gap-2 flex-1 min-w-0">
                                <div className="w-6 h-6 md:w-8 md:h-8 lg:w-7 lg:h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs md:text-xs lg:text-sm font-bold text-blue-600 flex-shrink-0">
                                  {getPositionIcon(corretor.position)}
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <p className="font-semibold text-gray-900 text-xs md:text-xs lg:text-sm leading-tight break-words">{corretor.name}</p>
                                  <p className="text-xs md:text-xs lg:text-sm text-gray-600 leading-tight break-words">{corretor.gerente}</p>
                                  <p className="text-xs md:text-xs lg:text-sm text-gray-500 leading-tight break-words">{corretor.diretor}</p>
                                </div>
                              </div>
                              <div className="text-right ml-1 md:ml-1 flex-shrink-0">
                                <div className="text-sm md:text-base lg:text-xl font-bold text-blue-600">
                                  {corretor.ages.toLocaleString('pt-BR')}
                                </div>
                                <div className="text-xs md:text-xs text-gray-600">agenc.</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Linha divisória - apenas desktop */}
                <div className="relative hidden lg:block">
                  <div className="absolute -left-1.5 top-0 bottom-0 w-px bg-gray-300"></div>
                  <div className="space-y-2 flex flex-col">
                    {/* Segunda coluna - Posições 6-10 */}
                    {skeletonMode ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <RankingCardSkeleton key={`skeleton-2-${index}`} />
                      ))
                    ) : (
                      data.topCorretores.slice(5, 10).map((corretor) => (
                        <div
                          key={corretor.position}
                          className="flex items-start justify-between p-2 md:p-3 lg:p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-all duration-500 min-w-0 w-full"
                        >
                        <div className="flex items-start gap-1 md:gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 md:w-8 md:h-8 lg:w-7 lg:h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs md:text-xs lg:text-sm font-bold text-blue-600 flex-shrink-0">
                            {corretor.position}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="font-semibold text-gray-900 text-xs md:text-xs lg:text-sm leading-tight break-words">{corretor.name}</p>
                            <p className="text-xs md:text-xs lg:text-sm text-gray-600 leading-tight break-words">{corretor.gerente}</p>
                            <p className="text-xs md:text-xs lg:text-sm text-gray-500 leading-tight break-words">{corretor.diretor}</p>
                          </div>
                        </div>
                        <div className="text-right ml-1 md:ml-1 flex-shrink-0">
                          <div className="text-sm md:text-base lg:text-xl font-bold text-blue-600">
                            {corretor.ages.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs md:text-xs text-gray-600">pontos</div>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Terceira coluna - apenas desktop */}
                <div className="relative hidden lg:block">
                  <div className="absolute -left-1.5 top-0 bottom-0 w-px bg-gray-300"></div>
                  <div className="space-y-2 flex flex-col">
                    {/* Terceira coluna - Posições 11-15 */}
                    {skeletonMode ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <RankingCardSkeleton key={`skeleton-3-${index}`} />
                      ))
                    ) : (
                      data.topCorretores.slice(10, 15).map((corretor) => (
                        <div
                          key={corretor.position}
                          className="flex items-start justify-between p-2 md:p-3 lg:p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-all duration-500 min-w-0 w-full"
                        >
                        <div className="flex items-start gap-1 md:gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 md:w-8 md:h-8 lg:w-7 lg:h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs md:text-xs lg:text-sm font-bold text-blue-600 flex-shrink-0">
                            {corretor.position}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="font-semibold text-gray-900 text-xs md:text-xs lg:text-sm leading-tight break-words">{corretor.name}</p>
                            <p className="text-xs md:text-xs lg:text-sm text-gray-600 leading-tight break-words">{corretor.gerente}</p>
                            <p className="text-xs md:text-xs lg:text-sm text-gray-500 leading-tight break-words">{corretor.diretor}</p>
                          </div>
                        </div>
                        <div className="text-right ml-1 md:ml-1 flex-shrink-0">
                          <div className="text-sm md:text-base lg:text-xl font-bold text-blue-600">
                            {corretor.ages.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs md:text-xs text-gray-600">pontos</div>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Top 5 Gerentes and Top 5 Diretores */}
          <div className="lg:col-span-4 flex flex-col gap-3 h-full">
            {/* Top 5 Gerentes */}
            <Card className="bg-white border-gray-200 shadow-xl flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-3 bg-blue-500 rounded-full" />
                  🥇 Top 5 Gerentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-3 pt-0 flex-1 flex flex-col">
                <div className="flex-1 flex flex-col justify-center">
                  {skeletonMode ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <RankingCardSkeleton key={`skeleton-gerente-${index}`} />
                    ))
                  ) : (
                    data.topGerentes.map((gerente, index) => {
                    const getGerentePositionStyles = (position: number) => {
                      switch (position) {
                        case 1:
                          return "bg-gradient-to-r from-[#FFD700] to-[#FFA500] border-[#FFD700]";
                        case 2:
                          return "bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] border-[#C0C0C0]";
                        case 3:
                          return "bg-gradient-to-r from-[#CD7F32] to-[#B8860B] border-[#CD7F32]";
                        default:
                          return "bg-gray-50 border-gray-200";
                      }
                    };

                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 md:p-3 rounded-lg hover:border-blue-300 transition-all duration-500 ${getGerentePositionStyles(gerente.position)}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs md:text-sm font-bold text-blue-600">
                            {gerente.position === 1 ? "🥇" : gerente.position === 2 ? "🥈" : gerente.position === 3 ? "🥉" : gerente.position}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-xs md:text-sm break-words">{gerente.name}</p>
                            <p className="text-xs text-gray-600 break-words">{gerente.diretor}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-base md:text-lg font-bold text-blue-600">
                            {gerente.ages.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Diretores */}
            <Card className="bg-white border-gray-200 shadow-xl flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-3 bg-blue-500 rounded-full" />
                  🏆 Top 5 Diretores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-3 pt-0 flex-1 flex flex-col">
                <div className="flex-1 flex flex-col justify-center">
                  {skeletonMode ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <RankingCardSkeleton key={`skeleton-diretor-${index}`} />
                    ))
                  ) : (
                    data.topDiretores?.map((diretor, index) => {
                    const getDiretorPositionStyles = (position: number) => {
                      switch (position) {
                        case 1:
                          return "bg-gradient-to-r from-[#FFD700] to-[#FFA500] border-[#FFD700]";
                        case 2:
                          return "bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] border-[#C0C0C0]";
                        case 3:
                          return "bg-gradient-to-r from-[#CD7F32] to-[#B8860B] border-[#CD7F32]";
                        default:
                          return "bg-gray-50 border-gray-200";
                      }
                    };

                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg hover:border-blue-300 transition-all duration-500 ${getDiretorPositionStyles(diretor.position)}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs md:text-sm font-bold text-blue-600">
                            {diretor.position === 1 ? "🥇" : diretor.position === 2 ? "🥈" : diretor.position === 3 ? "🥉" : diretor.position}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-xs md:text-sm break-words">{diretor.name}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-base md:text-lg font-bold text-blue-600">
                            {diretor.ages.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

