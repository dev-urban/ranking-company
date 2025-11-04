-- Tabela para armazenar as métricas dos corretores
-- Esta tabela substitui o arquivo JSON corretorMetrics.json
-- Execute este SQL no seu banco de dados MySQL/Railway

CREATE TABLE IF NOT EXISTS corretor_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  videos INT NOT NULL DEFAULT 0,
  visitas INT NOT NULL DEFAULT 0,
  vendas INT NOT NULL DEFAULT 0,
  pontos INT NOT NULL DEFAULT 0,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_pontos (pontos DESC),
  INDEX idx_last_update (last_update)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentários sobre as colunas:
-- id: ID único auto-incremental
-- email: Email do corretor (único, usado como chave)
-- videos: Quantidade de vídeos postados
-- visitas: Quantidade de visitas realizadas
-- vendas: Quantidade de vendas realizadas
-- pontos: Pontuação calculada (videos*10 + visitas*20 + vendas*100)
-- last_update: Timestamp da última atualização (atualiza automaticamente)
-- updated_by: Usuário que fez a última atualização
-- created_at: Timestamp de criação do registro

-- Índices para otimizar consultas:
-- idx_email: Busca rápida por email
-- idx_pontos: Ordenação rápida por pontuação (ranking)
-- idx_last_update: Consultas por data de atualização
