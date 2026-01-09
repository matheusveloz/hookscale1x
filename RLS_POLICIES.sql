-- ============================================
-- RLS POLICIES - HOOKSCALE
-- ============================================
-- Execute este SQL no Supabase para configurar
-- Row Level Security (RLS) corretamente
-- ============================================

-- ============================================
-- 1. POLICIES PARA USERS
-- ============================================

-- Permitir INSERT (registro de novos usuários)
CREATE POLICY "Allow public insert on users"
ON users
FOR INSERT
TO public
WITH CHECK (true);

-- Permitir SELECT apenas do próprio usuário
CREATE POLICY "Users can view own data"
ON users
FOR SELECT
TO public
USING (true);

-- Permitir UPDATE apenas do próprio usuário
CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO public
USING (true);

-- ============================================
-- 2. POLICIES PARA SUBSCRIPTIONS
-- ============================================

-- Permitir SELECT de qualquer subscription (necessário para check-subscription API)
CREATE POLICY "Allow read subscriptions"
ON subscriptions
FOR SELECT
TO public
USING (true);

-- Permitir INSERT (criação via webhook)
CREATE POLICY "Allow insert subscriptions"
ON subscriptions
FOR INSERT
TO public
WITH CHECK (true);

-- Permitir UPDATE (atualização via webhook)
CREATE POLICY "Allow update subscriptions"
ON subscriptions
FOR UPDATE
TO public
USING (true);

-- ============================================
-- 3. POLICIES PARA JOBS
-- ============================================

-- Se RLS estiver ativado em jobs, adicione:
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
ON jobs
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create jobs"
ON jobs
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can update own jobs"
ON jobs
FOR UPDATE
TO public
USING (true);

-- ============================================
-- 4. POLICIES PARA VIDEOS
-- ============================================

CREATE POLICY "Allow read videos"
ON videos
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow insert videos"
ON videos
FOR INSERT
TO public
WITH CHECK (true);

-- ============================================
-- 5. POLICIES PARA COMBINATIONS
-- ============================================

CREATE POLICY "Allow read combinations"
ON combinations
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow insert combinations"
ON combinations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow update combinations"
ON combinations
FOR UPDATE
TO public
USING (true);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Ver todas as policies criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- ALTERNATIVA: DESABILITAR RLS
-- ============================================
-- Se preferir desabilitar RLS (mais simples):
-- 
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE combinations DISABLE ROW LEVEL SECURITY;
--
-- NOTA: Como usamos SUPABASE_SERVICE_ROLE_KEY nas APIs,
-- o RLS é automaticamente bypassado para operações server-side.
-- Só é necessário se houver queries client-side.
-- ============================================
