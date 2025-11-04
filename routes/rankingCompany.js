const express = require('express');
const router = express.Router();
const db = require('../config/database');
const CorretorMetrics = require('../models/CorretorMetrics');

// Sistema de pontos
const PONTOS_VIDEO = 10;
const PONTOS_VISITA = 20;
const PONTOS_VENDA = 100;

const calculateRankingData = async () => {
  try {
    console.log('📊 [RANKING] Starting ranking calculation...');

    // Datas do período atual (ano corrente)
    const now = new Date();
    const startDate = `${now.getFullYear()}-01-01`;
    const endDate = `${now.getFullYear()}-12-31`;
    const globalGoal = 60; // Meta de 60 vendas

    // Lista de diretores permitidos
    const ALLOWED_DIRECTORS = [
      'luis.rosa@urban.imb.br',
      'jessica.vigolo@urban.imb.br',
      'romario.lorenco@urban.imb.br',
      'joao.menezes@urban.imb.br',
      'marcos.gasparini@urban.imb.br'
    ];

    console.log('📊 [RANKING] Querying database for structure data...');

    // Query para buscar estrutura de corretores, gerentes e diretores
    const structureQuery = `
      SELECT
        TRIM(CONCAT(IFNULL(c.nome, ''), ' ', IFNULL(c.sobrenome, ''))) AS corretor,
        TRIM(CONCAT(IFNULL(g.nome, ''), ' ', IFNULL(g.sobrenome, ''))) AS gerente,
        TRIM(CONCAT(IFNULL(dir.nome, IFNULL(g.nome, '')), ' ', IFNULL(dir.sobrenome, IFNULL(g.sobrenome, '')))) AS diretor,
        IFNULL(c.email, '') AS email_corretor,
        IFNULL(g.email, '') AS email_gerente,
        IFNULL(dir.email, IFNULL(g.email, '')) AS email_diretor,
        IFNULL(c.status, '') AS status_corretor,
        UPPER(SUBSTRING_INDEX(IFNULL(c.email, ''), '@', 1)) AS corretor_map,
        UPPER(SUBSTRING_INDEX(IFNULL(g.email, ''), '@', 1)) AS gerente_map,
        UPPER(SUBSTRING_INDEX(IFNULL(dir.email, IFNULL(g.email, '')), '@', 1)) AS diretor_map,
        IFNULL(c.cargo, '') AS cargo
      FROM
        Corretores c
      LEFT JOIN Departamentos d ON
        d.id = c.departamento
      LEFT JOIN railway.Corretores g ON
        d.gerente = g.id_bitrix
      LEFT JOIN railway.Departamentos direcao ON
        d.diretoria = direcao.id
      LEFT JOIN railway.Corretores dir
        ON (CASE WHEN direcao.gerente IS NULL THEN d.gerente ELSE direcao.gerente END) = dir.id_bitrix
      WHERE
        c.status = 'true'
        AND IFNULL(c.cargo, '') NOT LIKE '%Diretor%'
        AND IFNULL(c.cargo, '') NOT LIKE '%Gerente%'
        AND LOWER(TRIM(IFNULL(dir.email, IFNULL(g.email, '')))) IN (${ALLOWED_DIRECTORS.map(() => '?').join(',')})
    `;

    const [structureRows] = await db.execute(structureQuery, ALLOWED_DIRECTORS);
    console.log(`📊 [RANKING] Found ${structureRows.length} corretores in structure`);

    // TODO: Buscar dados de vídeos, visitas e vendas de cada corretor
    // Por enquanto, vamos usar uma estrutura que permite buscar esses dados
    // Assumindo que existe uma tabela ou fonte de dados com essas informações
    
    // Mapa de corretores com seus pontos
    const corretorPoints = {};
    const corretorStructure = {};

    // Primeiro, mapear a estrutura
    structureRows.forEach(row => {
      if (row.email_corretor && row.email_corretor.trim() !== '') {
        const corretorKey = row.email_corretor.toLowerCase();
        corretorStructure[corretorKey] = {
          name: row.corretor.trim(),
          email: row.email_corretor,
          gerente: row.gerente.trim(),
          gerenteEmail: row.email_gerente,
          diretor: row.diretor.trim(),
          diretorEmail: row.email_diretor,
          cargo: row.cargo
        };

        // Inicializar pontos
        if (!corretorPoints[corretorKey]) {
          corretorPoints[corretorKey] = {
            videos: 0,
            visitas: 0,
            vendas: 0,
            pontos: 0
          };
        }
      }
    });

    // Buscar dados de vídeos, visitas e vendas do banco
    console.log('📊 [RANKING] Fetching corretor metrics from database...');
    const allCorretorMetrics = await CorretorMetrics.getAll();
    console.log(`📊 [RANKING] Found metrics for ${Object.keys(allCorretorMetrics).length} corretores`);

    Object.keys(corretorStructure).forEach(emailKey => {
      const metrics = allCorretorMetrics[emailKey] || {
        videos: 0,
        visitas: 0,
        vendas: 0
      };
      
      if (corretorPoints[emailKey]) {
        corretorPoints[emailKey].videos = metrics.videos || 0;
        corretorPoints[emailKey].visitas = metrics.visitas || 0;
        corretorPoints[emailKey].vendas = metrics.vendas || 0;
        
        // Calcular pontos totais
        corretorPoints[emailKey].pontos = 
          (corretorPoints[emailKey].videos * PONTOS_VIDEO) +
          (corretorPoints[emailKey].visitas * PONTOS_VISITA) +
          (corretorPoints[emailKey].vendas * PONTOS_VENDA);
      }
    });

    // Calcular top 15 corretores
    console.log('📊 [RANKING] Calculating top corretores ranking...');
    const corretorRanking = Object.keys(corretorPoints)
      .filter(key => {
        const corretor = corretorStructure[key];
        const cargo = (corretor?.cargo || '').toLowerCase();
        return corretor && !cargo.includes('gerente') && !cargo.includes('diretor');
      })
      .map(key => ({
        ...corretorStructure[key],
        ...corretorPoints[key],
        email: key
      }))
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 15)
      .map((corretor, index) => ({
        position: index + 1,
        name: corretor.name,
        ages: corretor.pontos, // Usando pontos como "ages" para compatibilidade
        gerente: corretor.gerente,
        diretor: corretor.diretor,
        pontos: corretor.pontos,
        videos: corretor.videos,
        visitas: corretor.visitas,
        vendas: corretor.vendas
      }));
    console.log(`📊 [RANKING] Top corretores calculated: ${corretorRanking.length} positions`);

    // Calcular pontos de gerentes (soma dos corretores abaixo)
    console.log('📊 [RANKING] Calculating gerentes ranking...');
    const gerentePoints = {};
    Object.keys(corretorPoints).forEach(key => {
      const corretor = corretorStructure[key];
      if (corretor && corretor.gerenteEmail) {
        const gerenteKey = corretor.gerenteEmail.toLowerCase();
        if (!gerentePoints[gerenteKey]) {
          gerentePoints[gerenteKey] = {
            name: corretor.gerente,
            pontos: 0,
            videos: 0,
            visitas: 0,
            vendas: 0,
            diretor: corretor.diretor
          };
        }
        gerentePoints[gerenteKey].pontos += corretorPoints[key].pontos;
        gerentePoints[gerenteKey].videos += corretorPoints[key].videos;
        gerentePoints[gerenteKey].visitas += corretorPoints[key].visitas;
        gerentePoints[gerenteKey].vendas += corretorPoints[key].vendas;
      }
    });

    const topGerentes = Object.values(gerentePoints)
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 5)
      .map((gerente, index) => ({
        position: index + 1,
        name: gerente.name,
        ages: gerente.pontos,
        diretor: gerente.diretor,
        pontos: gerente.pontos,
        videos: gerente.videos,
        visitas: gerente.visitas,
        vendas: gerente.vendas
      }));
    console.log(`📊 [RANKING] Top gerentes calculated: ${topGerentes.length} positions`);

    // Calcular pontos de diretores (soma dos corretores abaixo)
    console.log('📊 [RANKING] Calculating diretores ranking...');
    const diretorPoints = {};
    Object.keys(corretorPoints).forEach(key => {
      const corretor = corretorStructure[key];
      if (corretor && corretor.diretorEmail) {
        const diretorKey = corretor.diretorEmail.toLowerCase();
        if (!diretorPoints[diretorKey]) {
          diretorPoints[diretorKey] = {
            name: corretor.diretor,
            pontos: 0,
            videos: 0,
            visitas: 0,
            vendas: 0
          };
        }
        diretorPoints[diretorKey].pontos += corretorPoints[key].pontos;
        diretorPoints[diretorKey].videos += corretorPoints[key].videos;
        diretorPoints[diretorKey].visitas += corretorPoints[key].visitas;
        diretorPoints[diretorKey].vendas += corretorPoints[key].vendas;
      }
    });

    const topDiretores = Object.values(diretorPoints)
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 5)
      .map((diretor, index) => ({
        position: index + 1,
        name: diretor.name,
        ages: diretor.pontos,
        pontos: diretor.pontos,
        videos: diretor.videos,
        visitas: diretor.visitas,
        vendas: diretor.vendas
      }));
    console.log(`📊 [RANKING] Top diretores calculated: ${topDiretores.length} positions`);

    // Calcular total de vendas atingido
    const totalVendas = Object.values(corretorPoints)
      .reduce((sum, pontos) => sum + pontos.vendas, 0);

    // Calcular progresso em relação à meta
    const progressPercentage = globalGoal > 0 ? Math.min((totalVendas / globalGoal) * 100, 100) : 0;

    console.log(`📊 [RANKING] Total vendas: ${totalVendas}/${globalGoal} (${progressPercentage.toFixed(1)}%)`);

    const rankingData = {
      topCorretores: corretorRanking,
      topGerentes,
      topDiretores,
      totalVendas,
      metaVendas: globalGoal,
      progressPercentage,
      lastUpdated: new Date().toISOString(),
      period: {
        startDate,
        endDate
      }
    };

    // Save to database cache
    try {
      console.log('📊 [RANKING] Saving cache to database...');
      // Limpar tabela e inserir novo cache (sempre mantém apenas 1 registro)
      await db.query('TRUNCATE ranking_cache');
      await db.query(
        'INSERT INTO ranking_cache (data) VALUES (?)',
        [JSON.stringify(rankingData)]
      );
      console.log('✅ [RANKING] Cache saved to database successfully');
    } catch (dbError) {
      console.error('⚠️  [RANKING] Error saving cache to database:', dbError);
      console.error('⚠️  [RANKING] Error details:', dbError.message);
      console.error('⚠️  [RANKING] Error stack:', dbError.stack);
      // Não falhar se não conseguir salvar cache, apenas logar o erro
    }

    console.log('✅ [RANKING] Ranking calculation completed successfully');
    return rankingData;
  } catch (error) {
    console.error('❌ [RANKING] Error calculating ranking data:', error);
    console.error('❌ [RANKING] Error message:', error.message);
    console.error('❌ [RANKING] Error stack:', error.stack);
    throw error;
  }
};

// Get ranking data
router.get('/ranking', async (req, res) => {
  try {
    console.log('🌐 [API] GET /ranking - Request received');
    const rankingData = await calculateRankingData();
    console.log('🌐 [API] GET /ranking - Sending response');
    res.json(rankingData);
  } catch (error) {
    console.error('❌ [API] GET /ranking - Error:', error);
    console.error('❌ [API] Error message:', error.message);
    console.error('❌ [API] Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to calculate ranking',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get cached ranking data from database
router.get('/ranking/cached', async (req, res) => {
  try {
    console.log('🌐 [API] GET /ranking/cached - Request received');
    const [rows] = await db.query('SELECT data FROM ranking_cache ORDER BY id DESC LIMIT 1');

    if (rows.length > 0) {
      console.log('🌐 [API] GET /ranking/cached - Cache found, sending cached data');
      // Parse JSON do banco de dados
      const cachedData = typeof rows[0].data === 'string'
        ? JSON.parse(rows[0].data)
        : rows[0].data;
      res.json(cachedData);
    } else {
      // Se não há cache, calcular fresh data
      console.log('📊 [API] GET /ranking/cached - No cache found, calculating fresh data...');
      const rankingData = await calculateRankingData();
      res.json(rankingData);
    }
  } catch (error) {
    console.error('❌ [API] GET /ranking/cached - Error reading cache:', error);
    console.error('❌ [API] Error message:', error.message);
    // Se erro ao ler cache, calcular fresh data
    try {
      const rankingData = await calculateRankingData();
      res.json(rankingData);
    } catch (calcError) {
      console.error('❌ [API] GET /ranking/cached - Error calculating fallback:', calcError);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve or calculate ranking data'
      });
    }
  }
});

// Force refresh ranking data
router.post('/ranking/refresh', async (req, res) => {
  try {
    console.log('🌐 [API] POST /ranking/refresh - Request received');
    const rankingData = await calculateRankingData();
    console.log('🌐 [API] POST /ranking/refresh - Refresh completed');
    res.json({ message: 'Ranking data refreshed successfully', data: rankingData });
  } catch (error) {
    console.error('❌ [API] POST /ranking/refresh - Error:', error);
    console.error('❌ [API] Error message:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to refresh ranking data'
    });
  }
});

module.exports = router;

