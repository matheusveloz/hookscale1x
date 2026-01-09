-- Atualização para suportar estruturas customizadas e múltiplos vídeos
-- Execute no Supabase SQL Editor

-- 1. Adicionar coluna para armazenar IDs dos vídeos (JSON array)
ALTER TABLE combinations
ADD COLUMN IF NOT EXISTS video_ids TEXT;

-- 2. Adicionar coluna para estrutura do job (JSON)
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS structure TEXT;

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'combinations' AND column_name = 'video_ids';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'jobs' AND column_name = 'structure';
