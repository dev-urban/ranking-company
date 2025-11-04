const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Metrics = require('../models/Metrics');

router.get('/', async (req, res) => {
  try {
    const directors = await User.getAllDirectors();
    const allMetrics = await Metrics.getAll();

    const ranking = directors.map(director => {
      const metrics = allMetrics[director.id] || {
        agendamentos: 0,
        visitasRealizadas: 0,
        contratosAssinados: 0
      };

      const score = Metrics.calculateScore(metrics);

      return {
        id: director.id,
        username: director.username,
        email: director.email,
        agendamentos: metrics.agendamentos,
        visitasRealizadas: metrics.visitasRealizadas,
        contratosAssinados: metrics.contratosAssinados,
        pontuacaoTotal: score,
        detalhePontos: {
          pontosAgendamentos: metrics.agendamentos * 5,
          pontosVisitas: metrics.visitasRealizadas * 20,
          pontosContratos: metrics.contratosAssinados * 50
        }
      };
    });

    ranking.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);

    ranking.forEach((item, index) => {
      item.posicao = index + 1;
    });

    res.json(ranking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

module.exports = router;