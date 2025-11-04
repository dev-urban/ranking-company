export interface Corretor {
  position: number;
  name: string;
  ages: number;
  gerente: string;
  diretor: string;
}

export interface Gerente {
  position: number;
  name: string;
  ages: number;
  diretor: string;
}

export interface Diretor {
  position: number;
  name: string;
  ages: number;
}

export interface RankingData {
  topCorretores: Corretor[];
  topGerentes: Gerente[];
  topDiretores?: Diretor[];
  totalAtingido: number;
  metaGlobal: number;
  progressPercentage: number;
  lastUpdated: string;
  period: {
    startDate: string;
    endDate: string;
  };
}