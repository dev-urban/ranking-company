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

// Configuração de CORS para permitir requisições do frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://ranking-company.urban.imb.br',
      'https://rankingfelix-copy-production.up.railway.app'
    ];

    // Permitir requisições sem origin (como Postman, curl, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️  CORS blocked origin:', origin);
      callback(null, true); // Por enquanto permitir todas, mas logar
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma']
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'no origin'}`);
  next();
});

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