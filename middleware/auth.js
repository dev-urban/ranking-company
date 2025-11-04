const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};