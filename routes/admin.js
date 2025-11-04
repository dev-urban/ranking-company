const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Metrics = require('../models/Metrics');
const User = require('../models/User');

// Middleware para todas as rotas admin
router.use(auth);
router.use(adminAuth);

// Buscar todos os diretores com suas métricas
router.get('/directors', async (req, res) => {
  try {
    console.log('Admin buscando diretores...');
    const directors = await User.getAllDirectors(); // Já exclui admins
    console.log('Diretores encontrados:', directors);

    const directorsWithMetrics = [];

    for (const director of directors) {
      const metrics = await Metrics.getByUserId(director.id);
      console.log(`Métricas do diretor ${director.username} (ID: ${director.id}):`, metrics);

      directorsWithMetrics.push({
        id: director.id,
        username: director.username,
        email: director.email,
        metrics: metrics || {
          agendamentos: 0,
          visitasRealizadas: 0,
          contratosAssinados: 0
        }
      });
    }

    console.log('Enviando diretores com métricas:', directorsWithMetrics);
    res.json({ directors: directorsWithMetrics });
  } catch (error) {
    console.error('Erro ao buscar diretores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar métricas de um diretor específico
router.put('/directors/:id/metrics', async (req, res) => {
  try {
    const directorId = req.params.id;
    const { agendamentos, visitasRealizadas, contratosAssinados } = req.body;

    // Validação dos dados
    if (agendamentos < 0 || visitasRealizadas < 0 || contratosAssinados < 0) {
      return res.status(400).json({ error: 'Os valores não podem ser negativos' });
    }

    // Verificar se o diretor existe
    const directors = await User.getAllDirectors(); // Já exclui admins
    const director = directors.find(d => d.id == directorId);

    if (!director) {
      return res.status(404).json({ error: 'Diretor não encontrado' });
    }

    // Atualizar ou criar métricas
    await Metrics.updateOrCreate(directorId, {
      agendamentos: parseInt(agendamentos) || 0,
      visitasRealizadas: parseInt(visitasRealizadas) || 0,
      contratosAssinados: parseInt(contratosAssinados) || 0
    });

    res.json({ message: 'Métricas atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar métricas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;