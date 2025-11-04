const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const db = require('../config/database');

// Buscar estrutura de corretores, gerentes e diretores
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Se for admin, retorna todos os corretores. Se for diretor, filtra por email_diretor
    const isAdmin = userEmail === 'mkt@urban.imb.br';
    
    console.log('Buscando estrutura - Email do usuário:', userEmail, 'É admin?', isAdmin);
    
    let structureQuery;
    let queryParams = [];
    
    if (isAdmin) {
      // Admin vê todos os corretores
      structureQuery = `
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
        LEFT JOIN railway.Corretores dir ON
          direcao.gerente = dir.id_bitrix
        WHERE
          c.status = 'Ativo'
          AND IFNULL(c.cargo, '') NOT LIKE '%Diretor%'
          AND IFNULL(c.cargo, '') NOT LIKE '%Gerente%'
        ORDER BY corretor
      `;
    } else {
      // Primeiro, vamos verificar se o diretor existe no banco
      try {
        const [dirCheck] = await db.execute(
          `SELECT id_bitrix, email, nome, sobrenome FROM railway.Corretores WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))`,
          [userEmail]
        );
        console.log('Verificando diretor no banco:', dirCheck.length, 'encontrados');
        if (dirCheck.length > 0) {
          console.log('Diretor encontrado:', JSON.stringify(dirCheck[0], null, 2));
        }
      } catch (err) {
        console.error('Erro ao verificar diretor:', err);
      }

      // Diretor vê apenas seus corretores - usando query simplificada que funciona
      structureQuery = `
        SELECT
          CONCAT(c.nome, ' ', c.sobrenome) AS corretor,
          CONCAT(g.nome, ' ', g.sobrenome) AS gerente,
          CONCAT(dir.nome, ' ', dir.sobrenome) AS diretor,
          c.email AS email_corretor,
          g.email AS email_gerente,
          dir.email AS email_diretor,
          c.status AS status_corretor,
          UPPER(SUBSTRING_INDEX(c.email, '@', 1)) AS corretor_map,
          UPPER(SUBSTRING_INDEX(g.email, '@', 1)) AS gerente_map,
          UPPER(SUBSTRING_INDEX(dir.email, '@', 1)) AS diretor_map,
          c.cargo AS cargo
        FROM
          Corretores c
        LEFT JOIN Departamentos d ON
          d.id = c.departamento
        LEFT JOIN railway.Corretores g ON
          d.gerente = g.id_bitrix
        LEFT JOIN railway.Departamentos direcao ON
          d.diretoria = direcao.id
        LEFT JOIN railway.Corretores dir ON
          direcao.gerente = dir.id_bitrix
        WHERE
          c.status = 'Ativo'
          AND (c.cargo IS NULL OR c.cargo NOT LIKE '%Diretor%')
          AND (c.cargo IS NULL OR c.cargo NOT LIKE '%Gerente%')
          AND LOWER(TRIM(dir.email)) = LOWER(TRIM(?))
        ORDER BY corretor
      `;
      queryParams = [userEmail];
    }

    console.log('Executando query com filtro para email:', userEmail);
    console.log('Query:', structureQuery);
    console.log('Params:', queryParams);
    const [rows] = await db.execute(structureQuery, queryParams);
    console.log('Resultados encontrados:', rows.length);
    
    if (rows.length > 0) {
      console.log('Primeiro resultado:', JSON.stringify(rows[0], null, 2));
    } else {
      // Vamos tentar verificar se há corretores sem o filtro de diretor
      try {
        const [testRows] = await db.execute(`
          SELECT COUNT(*) as total FROM Corretores c
          LEFT JOIN Departamentos d ON d.id = c.departamento
          LEFT JOIN railway.Departamentos direcao ON d.diretoria = direcao.id
          LEFT JOIN railway.Corretores dir ON direcao.gerente = dir.id_bitrix
          WHERE c.status = 'Ativo'
          AND (c.cargo IS NULL OR c.cargo NOT LIKE '%Diretor%')
          AND (c.cargo IS NULL OR c.cargo NOT LIKE '%Gerente%')
        `);
        console.log('Total de corretores ativos:', testRows[0]?.total);
        
        // Verificar quantos têm diretor com esse email
        const [dirRows] = await db.execute(`
          SELECT COUNT(*) as total FROM Corretores c
          LEFT JOIN Departamentos d ON d.id = c.departamento
          LEFT JOIN railway.Departamentos direcao ON d.diretoria = direcao.id
          LEFT JOIN railway.Corretores dir ON direcao.gerente = dir.id_bitrix
          WHERE c.status = 'Ativo'
          AND (c.cargo IS NULL OR c.cargo NOT LIKE '%Diretor%')
          AND (c.cargo IS NULL OR c.cargo NOT LIKE '%Gerente%')
          AND dir.email IS NOT NULL
          AND LOWER(TRIM(dir.email)) = LOWER(TRIM(?))
        `, [userEmail]);
        console.log('Corretores com diretor', userEmail, ':', dirRows[0]?.total);
      } catch (err) {
        console.error('Erro ao verificar totais:', err);
      }
    }

    const corretores = rows
      .filter(row => row.email_corretor && row.email_corretor.trim() !== '')
      .map(row => ({
        name: (row.corretor || '').trim(),
        email: (row.email_corretor || '').trim(),
        gerente: (row.gerente || '').trim(),
        gerenteEmail: row.email_gerente || '',
        diretor: (row.diretor || '').trim(),
        diretorEmail: row.email_diretor || '',
        cargo: row.cargo || ''
      }));

    res.json({ corretores });
  } catch (error) {
    console.error('Erro ao buscar estrutura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

