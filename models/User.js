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

    try {
      // Tenta buscar da tabela Corretores (se tiver as colunas necessárias)
      const [rows] = await db.execute(
        `SELECT 
          id_bitrix as id, 
          CONCAT(IFNULL(nome, ''), ' ', IFNULL(sobrenome, '')) as username, 
          email,
          3 as role_id,
          '' as password
        FROM Corretores WHERE email = ?`,
        [email]
      );
      
      if (rows && rows.length > 0) {
        return rows[0];
      }
    } catch (error) {
      console.log('Erro ao buscar usuário da tabela Corretores:', error.message);
    }

    // Fallback: retorna dados mockados para os emails permitidos
    const mockUsers = {
      'jessica.vigolo@urban.imb.br': { id: 1, username: 'Jessica Vigolo', email: 'jessica.vigolo@urban.imb.br', role_id: 3, password: '' },
      'luis.rosa@urban.imb.br': { id: 2, username: 'Luis Rosa', email: 'luis.rosa@urban.imb.br', role_id: 3, password: '' },
      'romario.lorenco@urban.imb.br': { id: 3, username: 'Romário Lorenço', email: 'romario.lorenco@urban.imb.br', role_id: 3, password: '' },
      'joao.menezes@urban.imb.br': { id: 4, username: 'João Menezes', email: 'joao.menezes@urban.imb.br', role_id: 3, password: '' },
      'mkt@urban.imb.br': { id: 5, username: 'Marketing', email: 'mkt@urban.imb.br', role_id: 1, password: '' }
    };

    return mockUsers[email] || null;
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
      // Tenta buscar da tabela Corretores
      const placeholders = directorEmails.map(() => '?').join(',');
      const [rows] = await db.execute(
        `SELECT 
          id_bitrix as id, 
          CONCAT(IFNULL(nome, ''), ' ', IFNULL(sobrenome, '')) as username, 
          email
        FROM Corretores WHERE email IN (${placeholders})`,
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
      { id: 1, username: 'Jessica Vigolo', email: 'jessica.vigolo@urban.imb.br' },
      { id: 2, username: 'Luis Rosa', email: 'luis.rosa@urban.imb.br' },
      { id: 3, username: 'Romário Lorenço', email: 'romario.lorenco@urban.imb.br' },
      { id: 4, username: 'João Menezes', email: 'joao.menezes@urban.imb.br' }
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

    try {
      const placeholders = allowedEmails.map(() => '?').join(',');
      const [rows] = await db.execute(
        `SELECT 
          id_bitrix as id, 
          CONCAT(IFNULL(nome, ''), ' ', IFNULL(sobrenome, '')) as username, 
          email
        FROM Corretores WHERE email IN (${placeholders})`,
        allowedEmails
      );
      return rows || [];
    } catch (error) {
      console.log('Erro ao buscar usuários:', error.message);
      return [];
    }
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