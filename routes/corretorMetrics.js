const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const CorretorMetrics = require('../models/CorretorMetrics');

// Buscar métricas de um corretor específico
router.get('/:email', authMiddleware, async (req, res) => {
  try {
    const email = req.params.email;
    const metrics = await CorretorMetrics.getByCorretorEmail(email);
    res.json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar métricas do corretor' });
  }
});

// Atualizar métricas de um corretor específico
router.put('/:email', authMiddleware, async (req, res) => {
  try {
    const email = req.params.email;
    const { videos, visitas, vendas } = req.body;
    const user = req.user;

    const updatedMetrics = await CorretorMetrics.update(email, {
      videos: parseInt(videos) || 0,
      visitas: parseInt(visitas) || 0,
      vendas: parseInt(vendas) || 0
    }, user.email || user.username);

    res.json(updatedMetrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar métricas do corretor' });
  }
});

// Buscar todas as métricas (para dashboard)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const allMetrics = await CorretorMetrics.getAll();
    res.json(allMetrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

module.exports = router;

