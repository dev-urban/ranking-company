const bcrypt = require('bcryptjs');

const password = '@Gabriela12345';
const hash = '$2b$12$U/Iore0C2qarh0ENU1u/HO3PvJXJKWMT0EKCf/o2oIHSIECvnx4bW';

console.log('Testando senha:', password);
console.log('Hash do banco:', hash);

bcrypt.compare(password, hash)
  .then(result => {
    console.log('Resultado da comparação:', result);
    if (result) {
      console.log('✅ Senha CORRETA!');
    } else {
      console.log('❌ Senha INCORRETA!');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
  });

// Vamos também tentar gerar um novo hash para comparar
bcrypt.hash(password, 12)
  .then(newHash => {
    console.log('Novo hash gerado:', newHash);
    return bcrypt.compare(password, newHash);
  })
  .then(result => {
    console.log('Teste com novo hash:', result);
  })
  .catch(error => {
    console.error('Erro ao gerar novo hash:', error);
  });