const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Metrics = require('../models/Metrics');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const metrics = await Metrics.getByUserId(req.userId);
    res.json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const { agendamentos, visitasRealizadas, contratosAssinados } = req.body;

    const updatedMetrics = await Metrics.update(req.userId, {
      agendamentos: parseInt(agendamentos) || 0,
      visitasRealizadas: parseInt(visitasRealizadas) || 0,
      contratosAssinados: parseInt(contratosAssinados) || 0
    });

    res.json(updatedMetrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar métricas' });
  }
});

module.exports = router;