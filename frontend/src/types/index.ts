export interface Corretor {
  position: number;
  name: string;
  ages: number;
  pontos: number;
  gerente: string;
  diretor: string;
  videos?: number;
  visitas?: number;
  vendas?: number;
}

export interface Gerente {
  position: number;
  name: string;
  ages: number;
  pontos: number;
  diretor: string;
  videos?: number;
  visitas?: number;
  vendas?: number;
}

export interface Diretor {
  position: number;
  name: string;
  ages: number;
  pontos: number;
  videos?: number;
  visitas?: number;
  vendas?: number;
}

export interface RankingData {
  topCorretores: Corretor[];
  topGerentes: Gerente[];
  topDiretores?: Diretor[];
  totalVendas: number;
  metaVendas: number;
  progressPercentage: number;
  lastUpdated: string;
  period: {
    startDate: string;
    endDate: string;
  };
}

