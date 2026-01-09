-- Adicionar coluna zip_url na tabela jobs
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS zip_url TEXT;

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'jobs' AND column_name = 'zip_url';
