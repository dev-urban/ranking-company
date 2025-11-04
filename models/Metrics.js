const fs = require('fs').promises;
const path = require('path');

class Metrics {
  static metricsPath = process.env.DATA_PATH
    ? path.join(process.env.DATA_PATH, 'metrics.json')
    : path.join(__dirname, '..', 'data', 'metrics.json');

  static async getAll() {
    try {
      const data = await fs.readFile(this.metricsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  static async getByUserId(userId) {
    const metrics = await this.getAll();
    return metrics[userId] || {
      agendamentos: 0,
      visitasRealizadas: 0,
      contratosAssinados: 0,
      lastUpdate: null
    };
  }

  static async update(userId, data) {
    const metrics = await this.getAll();
    metrics[userId] = {
      ...data,
      lastUpdate: new Date().toISOString()
    };
    await fs.writeFile(this.metricsPath, JSON.stringify(metrics, null, 2));
    return metrics[userId];
  }

  static async updateOrCreate(userId, data) {
    return this.update(userId, data);
  }

  static calculateScore(metrics) {
    const agendamentosPontos = (metrics.agendamentos || 0) * 5;
    const visitasPontos = (metrics.visitasRealizadas || 0) * 20;
    const contratosPontos = (metrics.contratosAssinados || 0) * 50;

    return agendamentosPontos + visitasPontos + contratosPontos;
  }
}

module.exports = Metrics;