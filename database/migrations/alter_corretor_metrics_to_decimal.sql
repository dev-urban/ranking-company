-- Migration para alterar os campos de métricas para aceitar valores decimais (0.5)
-- Execute este SQL no seu banco de dados MySQL/Railway

ALTER TABLE corretor_metrics 
  MODIFY COLUMN videos DECIMAL(10, 2) NOT NULL DEFAULT 0,
  MODIFY COLUMN visitas DECIMAL(10, 2) NOT NULL DEFAULT 0,
  MODIFY COLUMN vendas DECIMAL(10, 2) NOT NULL DEFAULT 0,
  MODIFY COLUMN pontos DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Comentários:
-- DECIMAL(10, 2) permite valores até 99999999.99
-- Isso permite que o diretor insira valores como 0.5, 1.5, etc.

