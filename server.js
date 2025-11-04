require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const metricsRoutes = require('./routes/metrics');
const corretorMetricsRoutes = require('./routes/corretorMetrics');
const structureRoutes = require('./routes/structure');
const rankingRoutes = require('./routes/ranking');
const rankingCompanyRoutes = require('./routes/rankingCompany');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/corretor-metrics', corretorMetricsRoutes);
app.use('/api/dashboard/structure', structureRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/dashboard', rankingCompanyRoutes);
app.use('/api/admin', adminRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Frontend servido em http://localhost:${PORT}`);
  }
});