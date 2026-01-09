-- ============================================
-- HOOKSCALE - SETUP COMPLETO DO BANCO DE DADOS
-- ============================================
-- Execute este arquivo completo no Supabase SQL Editor
-- Ele vai criar todas as tabelas e relações necessárias
-- ============================================

-- ============================================
-- 1. TABELAS PRINCIPAIS
-- ============================================

-- Jobs de processamento
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  total_combinations INTEGER,
  processed_count INTEGER DEFAULT 0,
  aspect_ratio VARCHAR(10) DEFAULT '16:9',
  zip_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vídeos (hooks e bodies originais)
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL,
  filename VARCHAR(255),
  blob_url TEXT,
  duration FLOAT,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Combinações geradas
CREATE TABLE IF NOT EXISTS combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  hook_id UUID REFERENCES videos(id),
  body_id UUID REFERENCES videos(id),
  output_filename VARCHAR(255),
  blob_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. TABELA DE USUÁRIOS (AUTENTICAÇÃO)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. TABELA DE ASSINATURAS (STRIPE)
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  subscription_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  video_limit INTEGER NOT NULL DEFAULT 50,
  videos_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. ADICIONAR COLUNAS E RELAÇÕES (se não existirem)
-- ============================================

-- Adicionar customer_id em jobs (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN customer_id TEXT;
  END IF;
END $$;

-- Adicionar user_id em jobs (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Adicionar structure em jobs (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'structure'
  ) THEN
    ALTER TABLE jobs ADD COLUMN structure JSONB;
  END IF;
END $$;

-- Adicionar video_ids em combinations (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'combinations' AND column_name = 'video_ids'
  ) THEN
    ALTER TABLE combinations ADD COLUMN video_ids JSONB;
  END IF;
END $$;

-- Adicionar user_id em subscriptions (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para videos
CREATE INDEX IF NOT EXISTS idx_videos_job_id ON videos(job_id);
CREATE INDEX IF NOT EXISTS idx_videos_type ON videos(type);

-- Índices para combinations
CREATE INDEX IF NOT EXISTS idx_combinations_job_id ON combinations(job_id);
CREATE INDEX IF NOT EXISTS idx_combinations_status ON combinations(status);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Índices para jobs
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);

-- ============================================
-- 6. TRIGGERS PARA UPDATED_AT
-- ============================================

-- Trigger para users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Trigger para subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- ============================================
-- 7. COMENTÁRIOS (DOCUMENTAÇÃO)
-- ============================================

COMMENT ON TABLE jobs IS 'Jobs de processamento de vídeos';
COMMENT ON TABLE videos IS 'Vídeos originais uploadados (hooks, bodies, CTAs, etc)';
COMMENT ON TABLE combinations IS 'Combinações de vídeos geradas';
COMMENT ON TABLE users IS 'Usuários do sistema (autenticação)';
COMMENT ON TABLE subscriptions IS 'Assinaturas Stripe para billing e controle de créditos';

COMMENT ON COLUMN jobs.structure IS 'Estrutura do job em JSON (ordem dos blocos)';
COMMENT ON COLUMN jobs.user_id IS 'Referência ao usuário que criou o job';
COMMENT ON COLUMN jobs.customer_id IS 'ID do customer no Stripe (legacy)';

COMMENT ON COLUMN subscriptions.customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN subscriptions.subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN subscriptions.user_id IS 'Referência ao usuário dono da assinatura';
COMMENT ON COLUMN subscriptions.plan_id IS 'ID do plano (starter, premium, scale)';
COMMENT ON COLUMN subscriptions.video_limit IS 'Limite de vídeos/créditos por período';
COMMENT ON COLUMN subscriptions.videos_used IS 'Quantidade de vídeos/créditos já usados';
COMMENT ON COLUMN subscriptions.status IS 'Status da assinatura (active, past_due, canceled, etc)';

COMMENT ON COLUMN users.email IS 'Email do usuário (único)';
COMMENT ON COLUMN users.password IS 'Senha hasheada com bcrypt';

COMMENT ON COLUMN combinations.video_ids IS 'Array de IDs de vídeos em ordem (para N vídeos)';

-- ============================================
-- 8. VERIFICAÇÃO FINAL
-- ============================================

-- Mostrar todas as tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- FIM DO SETUP
-- ============================================
-- ✅ Banco de dados configurado com sucesso!
-- 
-- Próximos passos:
-- 1. Configurar variáveis de ambiente (.env.local)
-- 2. Instalar dependências (npm install)
-- 3. Executar aplicação (npm run dev)
-- 4. Configurar webhook do Stripe
-- 
-- Consulte: COMPLETE_SETUP_GUIDE.md
-- ============================================
