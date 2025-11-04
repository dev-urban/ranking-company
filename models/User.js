const db = require('../config/database');

class User {
  static async findByEmail(email) {
    const allowedEmails = [
      'jessica.vigolo@urban.imb.br',
      'luis.rosa@urban.imb.br',
      'romario.lorenco@urban.imb.br',
      'joao.menezes@urban.imb.br',
      'mkt@urban.imb.br'
    ];

    if (!allowedEmails.includes(email)) {
      return null;
    }

    const [rows] = await db.execute(
      'SELECT id, username, password, role_id, email FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async validatePassword(password, hashedPassword) {
    // Para compatibilidade com senhas hasheadas pelo PHP password_hash()
    const bcrypt = require('bcryptjs');

    // Primeiro tenta verificar com bcrypt (caso seja uma senha nova)
    if (hashedPassword.startsWith('$2')) {
      return bcrypt.compare(password, hashedPassword);
    }

    // Se não for bcrypt, pode ser password_hash do PHP
    // Como não temos acesso direto ao password_verify do PHP no Node.js,
    // vamos assumir que as senhas serão migradas para bcrypt
    return bcrypt.compare(password, hashedPassword);
  }

  static async getAllDirectors() {
    // Apenas diretores, sem incluir admins
    const directorEmails = [
      'jessica.vigolo@urban.imb.br',
      'luis.rosa@urban.imb.br',
      'romario.lorenco@urban.imb.br',
      'joao.menezes@urban.imb.br'
    ];

    try {
      // Tenta buscar do banco MySQL (produção)
      const placeholders = directorEmails.map(() => '?').join(',');
      const [rows] = await db.execute(
        `SELECT id, username, email FROM users WHERE email IN (${placeholders})`,
        directorEmails
      );

      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (error) {
      console.log('Usando dados mockados dos diretores:', error.message);
    }

    // Fallback para dados fixos (desenvolvimento ou erro no DB)
    return [
      { id: 1, username: 'Jessica', email: 'jessica.vigolo@urban.imb.br' },
      { id: 2, username: 'Luis', email: 'luis.rosa@urban.imb.br' },
      { id: 3, username: 'Romário', email: 'romario.lorenco@urban.imb.br' },
      { id: 4, username: 'João', email: 'joao.menezes@urban.imb.br' }
    ];
  }

  static async getAllUsers() {
    // Todos os usuários permitidos (diretores + admins)
    const allowedEmails = [
      'jessica.vigolo@urban.imb.br',
      'luis.rosa@urban.imb.br',
      'romario.lorenco@urban.imb.br',
      'joao.menezes@urban.imb.br',
      'mkt@urban.imb.br'
    ];

    const placeholders = allowedEmails.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT id, username, email FROM users WHERE email IN (${placeholders})`,
      allowedEmails
    );
    return rows;
  }

  static async isAdmin(email) {
    return email === 'mkt@urban.imb.br';
  }

  static async getRoleName(roleId) {
    try {
      const [rows] = await db.execute(
        'SELECT name FROM roles WHERE id = ?',
        [roleId]
      );
      return rows[0]?.name || null;
    } catch (error) {
      // Se a tabela roles não existir, retorna null
      return null;
    }
  }
}

module.exports = User;