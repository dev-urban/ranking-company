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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-orange-500 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Erro ao carregar dados</div>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen p-1 md:p-2 bg-gray-50">
      <div className="w-full flex flex-col space-y-2">
        {/* Progress Bar - Meta de Vendas */}
        <Card className={`bg-white border-orange-500/30 shadow-lg transition-all duration-1000 ${statsGlow ? 'shadow-orange-500/30 shadow-2xl border-orange-500/60' : ''}`}>
          <CardContent className="p-2">
            <h3 className="text-xs font-bold text-orange-600 mb-1 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Meta de Vendas
            </h3>
            <div className="space-y-1">
              <Progress
                value={data.progressPercentage}
                className="h-2 bg-gray-200 [&>div]:bg-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-700">
                <span className="text-orange-600 font-bold">{data.totalVendas} vendas</span>
                <span>{data.metaVendas} vendas (meta)</span>
              </div>
              <div className="text-center text-sm font-bold text-orange-600">
                {data.progressPercentage.toFixed(1)}% da meta atingida
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2">
          {/* Left: Top 15 Corretores - Aumentado em 10% (de col-span-8 para col-span-9) */}
          <div className="lg:col-span-9">
            <Card className="bg-white border-orange-500/30 shadow-lg h-full">
              <CardHeader className="pb-2 border-b border-orange-300">
                <CardTitle className="text-base text-orange-600 flex items-center gap-1">
                  <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                  🏆 Top 15 Corretores
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Primeira Coluna - Top 1-8 */}
                  <div className="border-r border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-orange-600 font-bold">#</TableHead>
                          <TableHead className="text-orange-600 font-bold">Corretor</TableHead>
                          <TableHead className="text-orange-600 font-bold text-center">Métricas</TableHead>
                          <TableHead className="text-orange-600 font-bold text-right">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skeletonMode ? (
                          Array.from({ length: 8 }).map((_, index) => (
                            <TableRow key={`skeleton-1-${index}`} className="border-gray-100">
                              <TableCell colSpan={4}>
                                <div className="h-16 bg-gray-200 rounded animate-pulse" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <>
                            {data.topCorretores.slice(0, 8).map((corretor) => (
                              <CorretorTableRow key={corretor.position} corretor={corretor} />
                            ))}
                            {Array.from({ length: Math.max(0, 8 - data.topCorretores.slice(0, 8).length) }).map((_, index) => (
                              <CorretorSkeletonRow key={`empty-1-${index}`} />
                            ))}
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Segunda Coluna - Top 9-15 */}
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-orange-600 font-bold">#</TableHead>
                          <TableHead className="text-orange-600 font-bold">Corretor</TableHead>
                          <TableHead className="text-orange-600 font-bold text-center">Métricas</TableHead>
                          <TableHead className="text-orange-600 font-bold text-right">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {skeletonMode ? (
                          Array.from({ length: 7 }).map((_, index) => (
                            <TableRow key={`skeleton-2-${index}`} className="border-gray-100">
                              <TableCell colSpan={4}>
                                <div className="h-16 bg-gray-200 rounded animate-pulse" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <>
                            {data.topCorretores.slice(8, 15).map((corretor) => (
                              <CorretorTableRow key={corretor.position} corretor={corretor} />
                            ))}
                            {Array.from({ length: Math.max(0, 7 - data.topCorretores.slice(8, 15).length) }).map((_, index) => (
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
            <Card className="bg-white border-orange-500/30 shadow-lg">
              <CardHeader className="pb-1 border-b border-orange-300">
                <CardTitle className="text-xs text-orange-600 flex items-center gap-1">
                  <div className="w-1 h-3 bg-orange-500 rounded-full" />
                  🥇 Top 5 Gerentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 hover:bg-transparent">
                      <TableHead className="text-orange-600 font-bold w-10">#</TableHead>
                      <TableHead className="text-orange-600 font-bold">Gerente</TableHead>
                      <TableHead className="text-orange-600 font-bold text-right">Pts</TableHead>
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
            <Card className="bg-white border-orange-500/30 shadow-lg">
              <CardHeader className="pb-1 border-b border-orange-300">
                <CardTitle className="text-xs text-orange-600 flex items-center gap-1">
                  <div className="w-1 h-3 bg-orange-500 rounded-full" />
                  🏆 Top 5 Diretores
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 hover:bg-transparent">
                      <TableHead className="text-orange-600 font-bold w-10">#</TableHead>
                      <TableHead className="text-orange-600 font-bold">Diretor</TableHead>
                      <TableHead className="text-orange-600 font-bold text-right">Pts</TableHead>
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
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-l-yellow-500";
      case 2: return "bg-gradient-to-r from-gray-100 to-gray-200 border-l-4 border-l-gray-400";
      case 3: return "bg-gradient-to-r from-orange-100 to-orange-200 border-l-4 border-l-orange-600";
      default: return "hover:bg-gray-50";
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
    <TableRow className={`border-gray-100 ${getPositionStyles(corretor.position)}`}>
      <TableCell className="w-8 py-1">
        <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-xs font-bold text-orange-600">
          {getPositionIcon(corretor.position)}
        </div>
      </TableCell>
      <TableCell className="py-1">
        <div className="space-y-0">
          <p className="font-bold text-gray-900 text-xs leading-tight">{corretor.name}</p>
          <p className="text-[10px] text-gray-600 leading-tight">{corretor.gerente}</p>
          <p className="text-[10px] text-gray-500 leading-tight">{corretor.diretor}</p>
        </div>
      </TableCell>
      <TableCell className="text-center py-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-center gap-0.5">
            <Video className="w-2.5 h-2.5 text-orange-600" />
            <span className="text-[10px] text-orange-600 font-bold">{corretor.videos || 0}</span>
          </div>
          <div className="flex items-center justify-center gap-0.5">
            <Building2 className="w-2.5 h-2.5 text-orange-600" />
            <span className="text-[10px] text-orange-600 font-bold">{corretor.visitas || 0}</span>
          </div>
          <div className="flex items-center justify-center gap-0.5">
            <DollarSign className="w-2.5 h-2.5 text-orange-600" />
            <span className="text-[10px] text-orange-600 font-bold">{corretor.vendas || 0}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <div className="text-sm font-bold text-orange-600">{corretor.pontos}</div>
      </TableCell>
    </TableRow>
  );
};

// Componente para Linha de Gerente na Table
const GerenteTableRow = ({ gerente }: any) => {
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-l-yellow-500";
      case 2: return "bg-gradient-to-r from-gray-100 to-gray-200 border-l-4 border-l-gray-400";
      case 3: return "bg-gradient-to-r from-orange-100 to-orange-200 border-l-4 border-l-orange-600";
      default: return "hover:bg-gray-50";
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
    <TableRow className={`border-gray-100 ${getPositionStyles(gerente.position)}`}>
      <TableCell className="w-8 py-1">
        <div className="w-5 h-5 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-[10px] font-bold text-orange-600">
          {getPositionIcon(gerente.position)}
        </div>
      </TableCell>
      <TableCell className="py-1">
        <div className="space-y-0">
          <p className="font-bold text-gray-900 text-[11px] leading-tight">{gerente.name}</p>
          <p className="text-[9px] text-gray-600 leading-tight">{gerente.diretor}</p>
          {/* Métricas inline */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Video className="w-2 h-2 text-orange-600" />
              <span className="text-[9px] text-orange-600 font-bold">{gerente.videos || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Building2 className="w-2 h-2 text-orange-600" />
              <span className="text-[9px] text-orange-600 font-bold">{gerente.visitas || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <DollarSign className="w-2 h-2 text-orange-600" />
              <span className="text-[9px] text-orange-600 font-bold">{gerente.vendas || 0}</span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <div className="text-xs font-bold text-orange-600">{gerente.pontos}</div>
      </TableCell>
    </TableRow>
  );
};

// Componente para Linha de Diretor na Table
const DiretorTableRow = ({ diretor }: any) => {
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-l-yellow-500";
      case 2: return "bg-gradient-to-r from-gray-100 to-gray-200 border-l-4 border-l-gray-400";
      case 3: return "bg-gradient-to-r from-orange-100 to-orange-200 border-l-4 border-l-orange-600";
      default: return "hover:bg-gray-50";
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
    <TableRow className={`border-gray-100 ${getPositionStyles(diretor.position)}`}>
      <TableCell className="w-8 py-1">
        <div className="w-5 h-5 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-[10px] font-bold text-orange-600">
          {getPositionIcon(diretor.position)}
        </div>
      </TableCell>
      <TableCell className="py-1">
        <div className="space-y-0">
          <p className="font-bold text-gray-900 text-[11px] leading-tight">{diretor.name}</p>
          {/* Métricas inline */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Video className="w-2 h-2 text-orange-600" />
              <span className="text-[9px] text-orange-600 font-bold">{diretor.videos || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Building2 className="w-2 h-2 text-orange-600" />
              <span className="text-[9px] text-orange-600 font-bold">{diretor.visitas || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <DollarSign className="w-2 h-2 text-orange-600" />
              <span className="text-[9px] text-orange-600 font-bold">{diretor.vendas || 0}</span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        <div className="text-xs font-bold text-orange-600">{diretor.pontos}</div>
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
