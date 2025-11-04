const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const db = require('../config/database');

// Buscar estrutura de corretores, gerentes e diretores
router.get('/', authMiddleware, async (req, res) => {
  try {
    const structureQuery = `
      SELECT
        CONCAT(IFNULL(c.nome, ''), ' ', IFNULL(c.sobrenome, '')) AS corretor,
        CONCAT(IFNULL(g.nome, ''), ' ', IFNULL(g.sobrenome, '')) AS gerente,
        CONCAT(IFNULL(dir.nome, IFNULL(g.nome, '')), ' ', IFNULL(dir.sobrenome, IFNULL(g.sobrenome, ''))) AS diretor,
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
      LEFT JOIN Corretores dir 
        ON (CASE WHEN direcao.gerente IS NULL THEN d.gerente ELSE direcao.gerente END) = dir.id_bitrix
      WHERE
        c.status = 'Ativo'
        AND IFNULL(c.cargo, '') NOT LIKE '%Diretor%'
        AND IFNULL(c.cargo, '') NOT LIKE '%Gerente%'
      ORDER BY corretor
    `;

    const [rows] = await db.execute(structureQuery);

    const corretores = rows
      .filter(row => row.email_corretor && row.email_corretor.trim() !== '')
      .map(row => ({
        name: row.corretor.trim(),
        email: row.email_corretor.trim(),
        gerente: row.gerente.trim(),
        gerenteEmail: row.email_gerente,
        diretor: row.diretor.trim(),
        diretorEmail: row.email_diretor,
        cargo: row.cargo
      }));

    res.json({ corretores });
  } catch (error) {
    console.error('Erro ao buscar estrutura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

