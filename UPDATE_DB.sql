-- Atualização do banco de dados
-- Execute este SQL no Supabase SQL Editor

-- Adicionar coluna aspect_ratio na tabela jobs
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(10) DEFAULT '16:9';

-- Adicionar coluna video_ids para suportar N vídeos por combinação
ALTER TABLE combinations
ADD COLUMN IF NOT EXISTS video_ids TEXT;

-- Verificar se foi adicionado
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'combinations' AND column_name = 'video_ids';
