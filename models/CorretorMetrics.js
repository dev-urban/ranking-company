const db = require('../config/database');

class CorretorMetrics {
  static async getAll() {
    try {
      const [rows] = await db.query(
        'SELECT email, videos, visitas, vendas, pontos, last_update, updated_by FROM corretor_metrics ORDER BY pontos DESC'
      );

      // Converter para formato de objeto com email como chave (compatibilidade)
      const metrics = {};
      rows.forEach(row => {
        const emailKey = row.email.toLowerCase().trim();
        metrics[emailKey] = {
          videos: row.videos,
          visitas: row.visitas,
          vendas: row.vendas,
          pontos: row.pontos,
          lastUpdate: row.last_update,
          updatedBy: row.updated_by
        };
      });

      return metrics;
    } catch (error) {
      console.error('Error getting all metrics:', error);
      return {};
    }
  }

  static async getByCorretorEmail(email) {
    try {
      const emailKey = email.toLowerCase().trim();
      const [rows] = await db.query(
        'SELECT email, videos, visitas, vendas, pontos, last_update, updated_by FROM corretor_metrics WHERE LOWER(TRIM(email)) = ?',
        [emailKey]
      );

      if (rows.length > 0) {
        return {
          videos: rows[0].videos,
          visitas: rows[0].visitas,
          vendas: rows[0].vendas,
          pontos: rows[0].pontos,
          lastUpdate: rows[0].last_update,
          updatedBy: rows[0].updated_by
        };
      }

      return {
        videos: 0,
        visitas: 0,
        vendas: 0,
        pontos: 0,
        lastUpdate: null,
        updatedBy: null
      };
    } catch (error) {
      console.error('Error getting metrics by email:', error);
      return {
        videos: 0,
        visitas: 0,
        vendas: 0,
        pontos: 0,
        lastUpdate: null,
        updatedBy: null
      };
    }
  }

  static async update(email, data, updatedBy) {
    try {
      const emailKey = email.toLowerCase().trim();
      const videos = parseInt(data.videos) || 0;
      const visitas = parseInt(data.visitas) || 0;
      const vendas = parseInt(data.vendas) || 0;
      const pontos = await this.calculatePoints({ videos, visitas, vendas });

      // INSERT ON DUPLICATE KEY UPDATE para criar ou atualizar
      await db.query(
        `INSERT INTO corretor_metrics (email, videos, visitas, vendas, pontos, updated_by)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           videos = VALUES(videos),
           visitas = VALUES(visitas),
           vendas = VALUES(vendas),
           pontos = VALUES(pontos),
           updated_by = VALUES(updated_by),
           last_update = CURRENT_TIMESTAMP`,
        [emailKey, videos, visitas, vendas, pontos, updatedBy || 'system']
      );

      return {
        videos,
        visitas,
        vendas,
        pontos,
        lastUpdate: new Date().toISOString(),
        updatedBy: updatedBy || 'system'
      };
    } catch (error) {
      console.error('Error updating metrics:', error);
      throw error;
    }
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
    return metrics.pontos || this.calculatePoints(metrics);
  }
}

module.exports = CorretorMetrics;
