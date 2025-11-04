const fs = require('fs').promises;
const path = require('path');

class CorretorMetrics {
  static metricsPath = process.env.DATA_PATH
    ? path.join(process.env.DATA_PATH, 'corretorMetrics.json')
    : path.join(__dirname, '..', 'data', 'corretorMetrics.json');

  static async getAll() {
    try {
      const data = await fs.readFile(this.metricsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Se o arquivo não existir, retornar objeto vazio
      return {};
    }
  }

  static async getByCorretorEmail(email) {
    const metrics = await this.getAll();
    const emailKey = email.toLowerCase().trim();
    return metrics[emailKey] || {
      videos: 0,
      visitas: 0,
      vendas: 0,
      lastUpdate: null,
      updatedBy: null
    };
  }

  static async update(email, data, updatedBy) {
    const metrics = await this.getAll();
    const emailKey = email.toLowerCase().trim();

    metrics[emailKey] = {
      videos: parseInt(data.videos) || 0,
      visitas: parseInt(data.visitas) || 0,
      vendas: parseInt(data.vendas) || 0,
      lastUpdate: new Date().toISOString(),
      updatedBy: updatedBy || 'system'
    };

    // Criar diretório se não existir
    const dir = path.dirname(this.metricsPath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      // Ignorar se já existir
    }

    await fs.writeFile(this.metricsPath, JSON.stringify(metrics, null, 2));
    return metrics[emailKey];
  }

  static async updateOrCreate(email, data, updatedBy) {
    return this.update(email, data, updatedBy);
  }

  static async calculatePoints(metrics) {
    const videos = metrics.videos || 0;
    const visitas = metrics.visitas || 0;
    const vendas = metrics.vendas || 0;

    return (videos * 10) + (visitas * 20) + (vendas * 100);
  }

  static async getPointsByEmail(email) {
    const metrics = await this.getByCorretorEmail(email);
    return this.calculatePoints(metrics);
  }
}

module.exports = CorretorMetrics;

