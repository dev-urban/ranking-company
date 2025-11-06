import React, { useState, useEffect, useRef } from 'react';
import { Video, Building2, DollarSign, Target } from 'lucide-react';
import { useRanking } from '../hooks/useRanking';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';

export const Ranking: React.FC = () => {
  const { data, loading, error } = useRanking();

  // Animation states
  const [skeletonMode, setSkeletonMode] = useState(false);
  const [statsGlow, setStatsGlow] = useState(false);
  const prevLastUpdatedRef = useRef<string | null>(null);

  // Monitor data changes to trigger animations on auto-refresh
  useEffect(() => {
    if (data?.lastUpdated) {
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
  }, [data?.lastUpdated, data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-500 font-medium">Carregando dados...</p>
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
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen p-1 md:p-2 bg-white">
      <div className="w-full flex flex-col space-y-2">
        {/* Progress Bar - Meta de Vendas */}
        <Card className={`bg-white border-gray-200 shadow-lg transition-all duration-1000 ${statsGlow ? 'shadow-gold-500/30 shadow-2xl border-gold-200' : ''}`}>
          <CardContent className="p-2">
            <h3 className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1">
              <Target className="w-3 h-3 text-gray-700" />
              Meta de Vendas
            </h3>
            <div className="space-y-1">
              <Progress
                value={data.progressPercentage}
                className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-gold-400 [&>div]:to-gold-600"
              />
              <div className="flex justify-between text-xs text-gray-700">
                <span className="text-navy-900 font-bold">{data.totalVendas} vendas</span>
                <span>{data.metaVendas} vendas (meta)</span>
              </div>
              <div className="text-center text-sm font-bold text-navy-900">
                {data.progressPercentage.toFixed(1)}% da meta atingida
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2">
          {/* Left: Top 10 Corretores */}
          <div className="lg:col-span-9">
            <Card className="bg-white border-gray-200 shadow-lg h-full">
              <CardHeader className="pb-2 border-b border-gray-200">
                <CardTitle className="text-base text-gray-900 flex items-center gap-1">
                  🏆 Top 10 Corretores
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Primeira Coluna - Top 1-5 */}
                  <div className="border-r border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-gray-900 font-bold">#</TableHead>
                          <TableHead className="text-gray-900 font-bold">Corretor</TableHead>
                          <TableHead className="text-gray-900 font-bold text-center">Métricas</TableHead>
                          <TableHead className="text-gray-900 font-bold text-right">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skeletonMode ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`skeleton-1-${index}`} className="border-gray-100">
                              <TableCell colSpan={4}>
                                <div className="h-16 bg-gray-200 rounded animate-pulse" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <>
                            {data.topCorretores.slice(0, 5).map((corretor) => (
                              <CorretorTableRow key={corretor.position} corretor={corretor} />
                            ))}
                            {Array.from({ length: Math.max(0, 5 - data.topCorretores.slice(0, 5).length) }).map((_, index) => (
                              <CorretorSkeletonRow key={`empty-1-${index}`} />
                            ))}
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Segunda Coluna - Top 6-10 */}
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-gray-900 font-bold">#</TableHead>
                          <TableHead className="text-gray-900 font-bold">Corretor</TableHead>
                          <TableHead className="text-gray-900 font-bold text-center">Métricas</TableHead>
                          <TableHead className="text-gray-900 font-bold text-right">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skeletonMode ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`skeleton-2-${index}`} className="border-gray-100">
                              <TableCell colSpan={4}>
                                <div className="h-16 bg-gray-200 rounded animate-pulse" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <>
                            {data.topCorretores.slice(5, 10).map((corretor) => (
                              <CorretorTableRow key={corretor.position} corretor={corretor} />
                            ))}
                            {Array.from({ length: Math.max(0, 5 - data.topCorretores.slice(5, 10).length) }).map((_, index) => (
                              <CorretorSkeletonRow key={`empty-2-${index}`} />
                            ))}
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Top 5 Gerentes and Top 5 Diretores - Reduzido de col-span-4 para col-span-3 */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            {/* Top 5 Gerentes */}
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader className="pb-1 border-b border-gray-200">
                <CardTitle className="text-xs text-gray-900 flex items-center gap-1">
                  🥇 Top 5 Gerentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 hover:bg-transparent">
                      <TableHead className="text-gray-900 font-bold w-10">#</TableHead>
                      <TableHead className="text-gray-900 font-bold">Gerente</TableHead>
                      <TableHead className="text-gray-900 font-bold text-right">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skeletonMode ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-gerente-${index}`} className="border-gray-100">
                          <TableCell colSpan={3}>
                            <div className="h-16 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <>
                        {data.topGerentes.map((gerente) => (
                          <GerenteTableRow key={gerente.position} gerente={gerente} />
                        ))}
                        {Array.from({ length: Math.max(0, 5 - data.topGerentes.length) }).map((_, index) => (
                          <GerenteSkeletonRow key={`empty-gerente-${index}`} />
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top 5 Diretores */}
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader className="pb-1 border-b border-gray-200">
                <CardTitle className="text-xs text-gray-900 flex items-center gap-1">
                  🏆 Top 5 Diretores
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 hover:bg-transparent">
                      <TableHead className="text-gray-900 font-bold w-10">#</TableHead>
                      <TableHead className="text-gray-900 font-bold">Diretor</TableHead>
                      <TableHead className="text-gray-900 font-bold text-right">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skeletonMode ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-diretor-${index}`} className="border-gray-100">
                          <TableCell colSpan={3}>
                            <div className="h-16 bg-gray-200 rounded animate-pulse" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <>
                        {data.topDiretores?.map((diretor) => (
                          <DiretorTableRow key={diretor.position} diretor={diretor} />
                        ))}
                        {Array.from({ length: Math.max(0, 5 - (data.topDiretores?.length || 0)) }).map((_, index) => (
                          <DiretorSkeletonRow key={`empty-diretor-${index}`} />
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para Linha de Corretor na Table
const CorretorTableRow = ({ corretor }: any) => {
  const isTopThree = corretor.position <= 3;
  
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600"; // gold sólido
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500"; // silver sólido
      case 3: return "bg-gradient-to-r from-orange-400 to-amber-700"; // bronze sólido
      default: return "bg-gray-100 hover:bg-gray-200";
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

  const getMetricColor = () => "text-navy-900";
  const getTextColor = () => isTopThree ? "text-gray-900" : "text-gray-900";

  return (
    <TableRow className={`border-gray-100 ${getPositionStyles(corretor.position)}`}>
      <TableCell className="w-8 py-1">
        <div className={`w-6 h-6 rounded-full ${isTopThree ? 'bg-white/20 border-white/30' : 'bg-gray-100 border-gray-300'} border flex items-center justify-center text-xs font-bold ${isTopThree ? 'text-white' : 'text-navy-900'}`}>
          {getPositionIcon(corretor.position)}
        </div>
      </TableCell>
      <TableCell className="py-1">
        <div className="space-y-0">
          <p className={`font-bold ${getTextColor()} text-xs leading-tight`}>{corretor.name}</p>
          <p className={`text-[10px] ${isTopThree ? 'text-gray-800' : 'text-gray-600'} leading-tight`}>{corretor.gerente}</p>
          <p className={`text-[10px] ${isTopThree ? 'text-gray-700' : 'text-gray-500'} leading-tight`}>{corretor.diretor}</p>
        </div>
      </TableCell>
      <TableCell className="text-center py-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-center gap-0.5">
            <Video className={`w-2.5 h-2.5 ${getMetricColor()}`} />
            <span className={`text-[10px] ${getMetricColor()} font-bold`}>{corretor.videos || 0}</span>
          </div>
          <div className="flex items-center justify-center gap-0.5">
            <Building2 className={`w-2.5 h-2.5 ${getMetricColor()}`} />
            <span className={`text-[10px] ${getMetricColor()} font-bold`}>{corretor.visitas || 0}</span>
          </div>
          <div className="flex items-center justify-center gap-0.5">
            <DollarSign className={`w-2.5 h-2.5 ${getMetricColor()}`} />
            <span className={`text-[10px] ${getMetricColor()} font-bold`}>{corretor.vendas || 0}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <div className={`text-sm font-bold ${getMetricColor()}`}>{corretor.pontos}</div>
      </TableCell>
    </TableRow>
  );
};

// Componente para Linha de Gerente na Table
const GerenteTableRow = ({ gerente }: any) => {
  const isTopThree = gerente.position <= 3;
  
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600"; // gold sólido
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500"; // silver sólido
      case 3: return "bg-gradient-to-r from-orange-400 to-amber-700"; // bronze sólido
      default: return "bg-gray-100 hover:bg-gray-200";
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

  const getMetricColor = () => "text-navy-900";
  const getTextColor = () => isTopThree ? "text-gray-900" : "text-gray-900";

  return (
    <TableRow className={`border-gray-100 ${getPositionStyles(gerente.position)}`}>
      <TableCell className="w-8 py-1">
        <div className={`w-5 h-5 rounded-full ${isTopThree ? 'bg-white/20 border-white/30' : 'bg-gray-100 border-gray-300'} border flex items-center justify-center text-[10px] font-bold ${isTopThree ? 'text-white' : 'text-navy-900'}`}>
          {getPositionIcon(gerente.position)}
        </div>
      </TableCell>
      <TableCell className="py-1">
        <div className="space-y-0">
          <p className={`font-bold ${getTextColor()} text-[11px] leading-tight`}>{gerente.name}</p>
          <p className={`text-[9px] ${isTopThree ? 'text-gray-800' : 'text-gray-600'} leading-tight`}>{gerente.diretor}</p>
          {/* Métricas inline */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Video className={`w-2 h-2 ${getMetricColor()}`} />
              <span className={`text-[9px] ${getMetricColor()} font-bold`}>{gerente.videos || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Building2 className={`w-2 h-2 ${getMetricColor()}`} />
              <span className={`text-[9px] ${getMetricColor()} font-bold`}>{gerente.visitas || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <DollarSign className={`w-2 h-2 ${getMetricColor()}`} />
              <span className={`text-[9px] ${getMetricColor()} font-bold`}>{gerente.vendas || 0}</span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <div className={`text-xs font-bold ${getMetricColor()}`}>{gerente.pontos}</div>
      </TableCell>
    </TableRow>
  );
};

// Componente para Linha de Diretor na Table
const DiretorTableRow = ({ diretor }: any) => {
  const isTopThree = diretor.position <= 3;
  
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600"; // gold sólido
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500"; // silver sólido
      case 3: return "bg-gradient-to-r from-orange-400 to-amber-700"; // bronze sólido
      default: return "bg-gray-100 hover:bg-gray-200";
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

  const getMetricColor = () => "text-navy-900";
  const getTextColor = () => isTopThree ? "text-gray-900" : "text-gray-900";

  return (
    <TableRow className={`border-gray-100 ${getPositionStyles(diretor.position)}`}>
      <TableCell className="w-8 py-1">
        <div className={`w-5 h-5 rounded-full ${isTopThree ? 'bg-white/20 border-white/30' : 'bg-gray-100 border-gray-300'} border flex items-center justify-center text-[10px] font-bold ${isTopThree ? 'text-white' : 'text-navy-900'}`}>
          {getPositionIcon(diretor.position)}
        </div>
      </TableCell>
      <TableCell className="py-1">
        <div className="space-y-0">
          <p className={`font-bold ${getTextColor()} text-[11px] leading-tight`}>{diretor.name}</p>
          {/* Métricas inline */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Video className={`w-2 h-2 ${getMetricColor()}`} />
              <span className={`text-[9px] ${getMetricColor()} font-bold`}>{diretor.videos || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Building2 className={`w-2 h-2 ${getMetricColor()}`} />
              <span className={`text-[9px] ${getMetricColor()} font-bold`}>{diretor.visitas || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <DollarSign className={`w-2 h-2 ${getMetricColor()}`} />
              <span className={`text-[9px] ${getMetricColor()} font-bold`}>{diretor.vendas || 0}</span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <div className={`text-xs font-bold ${getMetricColor()}`}>{diretor.pontos}</div>
      </TableCell>
    </TableRow>
  );
};

// Componente Skeleton para Corretor
const CorretorSkeletonRow = () => {
  return (
    <TableRow className="border-gray-100">
      <TableCell className="w-8 py-1">
        <Skeleton className="w-6 h-6 rounded-full bg-gray-300" />
      </TableCell>
      <TableCell className="py-1">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24 bg-gray-300" />
          <Skeleton className="h-2 w-20 bg-gray-300" />
          <Skeleton className="h-2 w-20 bg-gray-300" />
        </div>
      </TableCell>
      <TableCell className="text-center py-1">
        <div className="flex flex-col gap-0.5 items-center">
          <Skeleton className="h-2.5 w-8 bg-gray-300" />
          <Skeleton className="h-2.5 w-8 bg-gray-300" />
          <Skeleton className="h-2.5 w-8 bg-gray-300" />
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <Skeleton className="h-4 w-8 ml-auto bg-gray-300" />
      </TableCell>
    </TableRow>
  );
};

// Componente Skeleton para Gerente
const GerenteSkeletonRow = () => {
  return (
    <TableRow className="border-gray-100">
      <TableCell className="w-8 py-1">
        <Skeleton className="w-5 h-5 rounded-full bg-gray-300" />
      </TableCell>
      <TableCell className="py-1">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24 bg-gray-300" />
          <Skeleton className="h-2 w-20 bg-gray-300" />
          <Skeleton className="h-2 w-16 bg-gray-300" />
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <Skeleton className="h-3 w-8 ml-auto bg-gray-300" />
      </TableCell>
    </TableRow>
  );
};

// Componente Skeleton para Diretor
const DiretorSkeletonRow = () => {
  return (
    <TableRow className="border-gray-100">
      <TableCell className="w-8 py-1">
        <Skeleton className="w-5 h-5 rounded-full bg-gray-300" />
      </TableCell>
      <TableCell className="py-1">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24 bg-gray-300" />
          <Skeleton className="h-2 w-16 bg-gray-300" />
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <Skeleton className="h-3 w-8 ml-auto bg-gray-300" />
      </TableCell>
    </TableRow>
  );
};
