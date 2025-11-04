const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const CorretorMetrics = require('../models/CorretorMetrics');
const db = require('../config/database');

// Middleware para todas as rotas admin
router.use(auth);
router.use(adminAuth);

// Buscar todos os corretores com suas métricas
router.get('/directors', async (req, res) => {
  try {
    console.log('Admin buscando corretores...');
    
    // Buscar estrutura de corretores
    const structureQuery = `
      SELECT
        CONCAT(IFNULL(c.nome, ''), ' ', IFNULL(c.sobrenome, '')) AS corretor,
        CONCAT(IFNULL(g.nome, ''), ' ', IFNULL(g.sobrenome, '')) AS gerente,
        CONCAT(IFNULL(dir.nome, IFNULL(g.nome, '')), ' ', IFNULL(dir.sobrenome, IFNULL(g.sobrenome, ''))) AS diretor,
        IFNULL(c.email, '') AS email_corretor,
        IFNULL(g.email, '') AS email_gerente,
        IFNULL(dir.email, IFNULL(g.email, '')) AS email_diretor,
        IFNULL(c.status, '') AS status_corretor,
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
        c.status = 'Ativo'
        AND IFNULL(c.cargo, '') NOT LIKE '%Diretor%'
        AND IFNULL(c.cargo, '') NOT LIKE '%Gerente%'
      ORDER BY corretor
    `;

    const [rows] = await db.execute(structureQuery);
    const allMetrics = await CorretorMetrics.getAll();

    const corretoresWithMetrics = rows
      .filter(row => row.email_corretor && row.email_corretor.trim() !== '')
      .map(row => {
        const email = row.email_corretor.toLowerCase().trim();
        const metrics = allMetrics[email] || {
          videos: 0,
          visitas: 0,
          vendas: 0
        };

        return {
          id: email, // Usando email como ID
          username: row.corretor.trim(),
          email: row.email_corretor.trim(),
          gerente: row.gerente.trim(),
          diretor: row.diretor.trim(),
          metrics: {
            videos: metrics.videos || 0,
            visitas: metrics.visitas || 0,
            vendas: metrics.vendas || 0
          }
        };
      });

    console.log('Enviando corretores com métricas:', corretoresWithMetrics.length);
    res.json({ directors: corretoresWithMetrics }); // Mantendo "directors" para compatibilidade com frontend
  } catch (error) {
    console.error('Erro ao buscar corretores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar métricas de um corretor específico
router.put('/directors/:id/metrics', async (req, res) => {
  try {
    const corretorEmail = req.params.id; // ID é o email do corretor
    const { videos, visitas, vendas } = req.body;

    // Validação dos dados
    if (videos < 0 || visitas < 0 || vendas < 0) {
      return res.status(400).json({ error: 'Os valores não podem ser negativos' });
    }

    // Atualizar ou criar métricas do corretor
    await CorretorMetrics.updateOrCreate(corretorEmail, {
      videos: parseInt(videos) || 0,
      visitas: parseInt(visitas) || 0,
      vendas: parseInt(vendas) || 0
    }, req.user.email || req.user.username);

    res.json({ message: 'Métricas atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar métricas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;