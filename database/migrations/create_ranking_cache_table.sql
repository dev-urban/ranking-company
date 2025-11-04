-- Tabela para armazenar o cache do ranking calculado
-- Esta tabela substitui o arquivo JSON ranking.json
-- Execute este SQL no seu banco de dados MySQL/Railway

CREATE TABLE IF NOT EXISTS ranking_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data JSON NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_last_updated (last_updated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentários sobre as colunas:
-- id: ID único auto-incremental
-- data: JSON completo do ranking (topCorretores, topGerentes, topDiretores, etc)
-- last_updated: Timestamp da última atualização (atualiza automaticamente)
-- created_at: Timestamp de criação do registro

-- Como funciona:
-- 1. Sempre mantemos apenas 1 registro na tabela (o mais recente)
-- 2. Quando calculamos novo ranking, fazemos TRUNCATE e INSERT
-- 3. Para ler, fazemos SELECT simples do único registro
-- 4. Muito mais rápido que calcular ranking toda vez

-- Exemplo de uso:
-- TRUNCATE ranking_cache;
-- INSERT INTO ranking_cache (data) VALUES ('{"topCorretores": [...], ...}');
-- SELECT data FROM ranking_cache LIMIT 1;
