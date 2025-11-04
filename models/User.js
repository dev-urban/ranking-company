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
      // Tenta buscar da tabela Corretores (incluindo senha se existir)
      const [rows] = await db.execute(
        `SELECT 
          id_bitrix as id, 
          CONCAT(IFNULL(nome, ''), ' ', IFNULL(sobrenome, '')) as username, 
          email,
          3 as role_id,
          IFNULL(password, '') as password
        FROM Corretores WHERE email = ?`,
        [email]
      );
      
      if (rows && rows.length > 0) {
        const user = rows[0];
        // Se não tem senha no banco e é admin, usa senha padrão hasheada
        if (!user.password && email === 'mkt@urban.imb.br') {
          // Hash fixo para @Gabriela12345
          user.password = '$2b$12$U/Iore0C2qarh0ENU1u/HO3PvJXJKWMT0EKCf/o2oIHSIECvnx4bW';
        }
        return user;
      }
    } catch (error) {
      console.log('Erro ao buscar usuário da tabela Corretores:', error.message);
    }

    // Fallback: retorna dados mockados para os emails permitidos
    // Para admin, usa senha padrão hasheada (hash fixo para @Gabriela12345)
    // Hash: $2b$12$U/Iore0C2qarh0ENU1u/HO3PvJXJKWMT0EKCf/o2oIHSIECvnx4bW
    const adminPasswordHash = '$2b$12$U/Iore0C2qarh0ENU1u/HO3PvJXJKWMT0EKCf/o2oIHSIECvnx4bW';

    const mockUsers = {
      'jessica.vigolo@urban.imb.br': { id: 1, username: 'Jessica Vigolo', email: 'jessica.vigolo@urban.imb.br', role_id: 3, password: '' },
      'luis.rosa@urban.imb.br': { id: 2, username: 'Luis Rosa', email: 'luis.rosa@urban.imb.br', role_id: 3, password: '' },
      'romario.lorenco@urban.imb.br': { id: 3, username: 'Romário Lorenço', email: 'romario.lorenco@urban.imb.br', role_id: 3, password: '' },
      'joao.menezes@urban.imb.br': { id: 4, username: 'João Menezes', email: 'joao.menezes@urban.imb.br', role_id: 3, password: '' },
      'mkt@urban.imb.br': { id: 5, username: 'Marketing', email: 'mkt@urban.imb.br', role_id: 1, password: adminPasswordHash }
    };

    return mockUsers[email] || null;
  }

  static async validatePassword(password, hashedPassword) {
    // Se não tem senha hasheada, retorna false
    if (!hashedPassword || hashedPassword === '') {
      return false;
    }

    const bcrypt = require('bcryptjs');

    // Tenta verificar com bcrypt
    if (hashedPassword.startsWith('$2')) {
      return await bcrypt.compare(password, hashedPassword);
    }

    // Se não for bcrypt, retorna false
    return false;
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