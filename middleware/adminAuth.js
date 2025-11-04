const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verifica se o usuário é admin
    const isAdmin = await User.isAdmin(req.user.email);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso.' });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = adminAuth;