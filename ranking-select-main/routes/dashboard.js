const express = require('express');
const { pool } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const calculateRankingData = async () => {
  try {
    const startDate = process.env.START_DATE;
    const endDate = process.env.END_DATE;
    const globalGoal = parseInt(process.env.GLOBAL_GOAL);


    const query = `
      SELECT
        a.codigo_imovel,
        a.email_corretor,
        a.data_liberacao,
        REPLACE(
          CONCAT(
            UPPER(SUBSTRING(SUBSTRING_INDEX(REPLACE(SUBSTRING_INDEX(a.email_corretor, '@', 1), '.', ' '), ' ', 1), 1, 1)),
            LOWER(SUBSTRING(SUBSTRING_INDEX(REPLACE(SUBSTRING_INDEX(a.email_corretor, '@', 1), '.', ' '), ' ', 1), 2)),
            ' ',
            UPPER(SUBSTRING(SUBSTRING_INDEX(REPLACE(SUBSTRING_INDEX(a.email_corretor, '@', 1), '.', ' '), ' ', -1), 1, 1)),
            LOWER(SUBSTRING(SUBSTRING_INDEX(REPLACE(SUBSTRING_INDEX(a.email_corretor, '@', 1), '.', ' '), ' ', -1), 2))
          ), '  ', ' '
        ) AS corretor_name,
        CONCAT(IFNULL(g.nome, ''), ' ', IFNULL(g.sobrenome, '')) AS gerente,
        CONCAT(IFNULL(dir.nome, ''), ' ', IFNULL(dir.sobrenome, '')) AS diretor,
        c.cargo AS corretor_cargo,
        g.cargo AS gerente_cargo
    FROM
        agenciamentos a
    LEFT JOIN Corretores c ON a.email_corretor = c.email
    LEFT JOIN Departamentos d ON d.id = c.departamento
    LEFT JOIN railway.Corretores g ON d.gerente = g.id_bitrix
    LEFT JOIN railway.Departamentos direcao ON d.diretoria = direcao.id
    LEFT JOIN railway.Corretores dir ON direcao.gerente = dir.id_bitrix
    WHERE
        a.data_liberacao >= '2025-09-18'
        AND a.data_liberacao <= '2025-11-30'
        AND a.email_corretor IS NOT NULL
        AND a.email_corretor != ''
        AND a.email_corretor NOT LIKE 'agenciamento%'
        AND a.email_corretor NOT LIKE 'secvendas%'
        AND CONCAT(IFNULL(dir.nome, ''), ' ', IFNULL(dir.sobrenome, '')) IN (
            'Alexandre Fonseca Jr',
            'Thiago Simoes Santos',
            'Monica Andreotti Dos Santos'
        )
        AND a.status = 'Venda'
        -- Exclui categorias de terrenos e Sala
        AND a.Categoria NOT IN ('Terreno', 'Terrenos', 'Terreno Comercial', 'Terreno em condomínio', 'Terreno Industrial', 'Sala')
        AND a.valor > 500000
        -- Filtro especial para Loft: só incluir se metragem > 30
        AND (a.Categoria != 'Loft' OR (a.Categoria = 'Loft' AND a.metragem > 30))
        -- Filtro de bairros e Casa em Condomínio
        AND (
            a.Categoria = 'Casa em Condomínio' -- OU a categoria é 'Casa em Condomínio' (em qualquer bairro)
            OR a.bairro IN ( -- OU o bairro está na lista a seguir (para as outras categorias permitidas)
                'Auxiliadora', 'Bela Vista', 'Boa Vista', 'Bom Fim', 'Central Parque', 'Central Park',
                'Chácara da Pedras', 'Chácara Das Pedras', 'Passo da Areia', 'Três Figueiras', 'Menino Deus',
                'Higienópolis', 'Independência', 'Jardim Carvalho', 'Jardim Botânico', 'Jardim Europa',
                'Moinhos de Vento', 'Mont Serrat', 'Petrópolis', 'Rio Branco',
                'Vila Ipiranga', 'Jardim Lindóia', 'Centro Histórico', 'Cidade Baixa',
                'Floresta', 'Santana', 'Praia de Belas', 'São João', 'Jardim Planalto',
                'Jardim Itu', 'Jardim Itu Sabará', 'Cristo Redentor', 'Centro', 'Santa Cecília'
            )
        );
    `;

    const [rows] = await pool.execute(query, [startDate, endDate]);

    // Calculate proportion based on number of corretores per codigo_imovel
    const imovelCount = {};
    rows.forEach(row => {
      if (!imovelCount[row.codigo_imovel]) {
        imovelCount[row.codigo_imovel] = 0;
      }
      imovelCount[row.codigo_imovel]++;
    });

    // Add proportion to each row
    rows.forEach(row => {
      row.proporcao = 1 / imovelCount[row.codigo_imovel];
    });

    // Calculate top 15 corretores
    const corretorStats = {};
    rows.forEach(row => {
      if (row.email_corretor && row.email_corretor.trim() !== '') {
        const corretorName = row.corretor_name || row.email_corretor;
        if (!corretorStats[row.email_corretor]) {
          corretorStats[row.email_corretor] = {
            name: corretorName,
            ages: 0,
            gerente: row.gerente,
            diretor: row.diretor,
            cargo: row.corretor_cargo
          };
        }
        corretorStats[row.email_corretor].ages += row.proporcao;
      }
    });

    const topCorretores = Object.values(corretorStats)
      .filter(corretor => {
        // Exclude if corretor cargo contains "Gerente" or "Diretor"
        const cargo = (corretor.cargo || '').toLowerCase();
        return !cargo.includes('gerente') && !cargo.includes('diretor');
      })
      .sort((a, b) => b.ages - a.ages)
      .slice(0, 15)
      .map((corretor, index) => ({
        position: index + 1,
        ...corretor,
        ages: Math.round(corretor.ages * 100) / 100
      }));

    // Calculate top 5 gerentes (based on corretor performance)
    const gerenteStats = {};
    rows.forEach(row => {
      if (row.gerente && row.gerente.trim() !== '') {
        if (!gerenteStats[row.gerente]) {
          gerenteStats[row.gerente] = {
            name: row.gerente,
            ages: 0,
            diretor: row.diretor,
            cargo: row.gerente_cargo
          };
        }
        gerenteStats[row.gerente].ages += row.proporcao;
      }
    });

    const topGerentes = Object.values(gerenteStats)
      .filter(gerente => {
        // Exclude if gerente cargo contains "Diretor"
        const cargo = (gerente.cargo || '').toLowerCase();
        return !cargo.includes('diretor');
      })
      .sort((a, b) => b.ages - a.ages)
      .slice(0, 5)
      .map((gerente, index) => ({
        position: index + 1,
        ...gerente,
        ages: Math.round(gerente.ages * 100) / 100
      }));

    // Calculate top 5 diretores (plataformas)
    const diretorStats = {};
    rows.forEach(row => {
      if (row.diretor && row.diretor.trim() !== '') {
        if (!diretorStats[row.diretor]) {
          diretorStats[row.diretor] = {
            name: row.diretor,
            ages: 0
          };
        }
        diretorStats[row.diretor].ages += row.proporcao;
      }
    });

    const topDiretores = Object.values(diretorStats)
      .sort((a, b) => b.ages - a.ages)
      .slice(0, 5)
      .map((diretor, index) => ({
        position: index + 1,
        ...diretor,
        ages: Math.round(diretor.ages * 100) / 100
      }));

    // Calculate total achieved
    const totalAtingido = Math.round(rows.reduce((sum, row) => sum + row.proporcao, 0) * 100) / 100;

    // Debug info
    const uniqueImoveis = new Set(rows.map(r => r.codigo_imovel)).size;
    console.log('Debug Stats:');
    console.log('- Total rows from query:', rows.length);
    console.log('- Unique codigo_imovel:', uniqueImoveis);
    console.log('- Total atingido (with proportions):', totalAtingido);

    // Calculate progress percentage
    const progressPercentage = Math.round((totalAtingido / globalGoal) * 100 * 100) / 100;

    const rankingData = {
      topCorretores,
      topGerentes,
      topDiretores,
      totalAtingido,
      metaGlobal: globalGoal,
      progressPercentage,
      lastUpdated: new Date().toISOString(),
      period: {
        startDate,
        endDate
      }
    };

    // Save to JSON file
    const dataPath = path.join(__dirname, '../data/ranking.json');
    await fs.writeFile(dataPath, JSON.stringify(rankingData, null, 2));

    return rankingData;
  } catch (error) {
    console.error('Error calculating ranking data:', error);
    throw error;
  }
};

// Get ranking data
router.get('/ranking', async (req, res) => {
  try {
    const rankingData = await calculateRankingData();
    res.json(rankingData);
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cached ranking data from JSON
router.get('/ranking/cached', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/ranking.json');
    const data = await fs.readFile(dataPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading cached data:', error);
    // If no cached data, calculate fresh data
    const rankingData = await calculateRankingData();
    res.json(rankingData);
  }
});

// Force refresh ranking data
router.post('/ranking/refresh', async (req, res) => {
  try {
    const rankingData = await calculateRankingData();
    res.json({ message: 'Ranking data refreshed successfully', data: rankingData });
  } catch (error) {
    console.error('Error refreshing ranking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
