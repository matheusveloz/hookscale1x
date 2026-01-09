-- Atualização do banco de dados para adicionar coluna aspect_ratio
-- Execute este SQL no Supabase SQL Editor

-- Adicionar coluna aspect_ratio na tabela jobs
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(10) DEFAULT '16:9';

-- Verificar se foi adicionado
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'jobs' AND column_name = 'aspect_ratio';
