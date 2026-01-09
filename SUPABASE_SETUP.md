# Setup com Supabase

Guia completo para configurar o HookScale com Supabase.

## 🚀 Configuração Rápida

### 1. Criar Projeto no Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Clique em **New Project**
3. Preencha:
   - **Name**: hookscale
   - **Database Password**: (crie uma senha forte)
   - **Region**: Escolha a mais próxima
4. Clique em **Create new project**
5. Aguarde ~2 minutos

### 2. Criar as Tabelas

1. No dashboard do projeto, vá em **SQL Editor** (menu lateral)
2. Clique em **New query**
3. Cole o SQL abaixo e clique em **Run**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  total_combinations INTEGER,
  processed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL,
  filename VARCHAR(255),
  blob_url TEXT,
  duration FLOAT,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Combinations table
CREATE TABLE combinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  hook_id UUID REFERENCES videos(id),
  body_id UUID REFERENCES videos(id),
  output_filename VARCHAR(255),
  blob_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_videos_job_id ON videos(job_id);
CREATE INDEX idx_videos_type ON videos(type);
CREATE INDEX idx_combinations_job_id ON combinations(job_id);
CREATE INDEX idx_combinations_status ON combinations(status);

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE combinations ENABLE ROW LEVEL SECURITY;

-- Create policies (permitir tudo para service role)
CREATE POLICY "Enable all for service role" ON jobs FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON videos FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON combinations FOR ALL USING (true);
```

### 3. Obter as Credenciais

1. Vá em **Settings** → **API** (menu lateral)
2. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **service_role** key (em "Project API keys" → service_role)

### 4. Configurar Storage (Opcional - se não usar Vercel Blob)

Se quiser usar Supabase Storage em vez de Vercel Blob:

1. Vá em **Storage** (menu lateral)
2. Clique em **New bucket**
3. Nome: `videos`
4. **Public bucket**: ✅ (marque)
5. Clique em **Create bucket**

### 5. Configurar Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

#### Opção A: Supabase + Vercel Blob

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Vercel Blob (para vídeos)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# Configurações
MAX_FILE_SIZE_MB=100
BATCH_SIZE=8
```

#### Opção B: Só Supabase (Storage + Database)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Usar Supabase Storage
USE_SUPABASE_STORAGE=true

# Configurações
MAX_FILE_SIZE_MB=100
BATCH_SIZE=8
```

### 6. Iniciar o Servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🔍 Verificar Configuração

### Testar Conexão com Supabase

Crie `test-supabase.ts`:

```typescript
import { supabase } from './lib/supabase';

async function test() {
  const { data, error } = await supabase.from('jobs').select('count');
  
  if (error) {
    console.error('✗ Erro:', error);
  } else {
    console.log('✓ Supabase conectado!');
    console.log('Jobs na tabela:', data);
  }
  
  process.exit(0);
}

test();
```

Execute:
```bash
npx tsx test-supabase.ts
```

## 📊 Monitoramento

### Ver dados em tempo real

1. Dashboard Supabase → **Table Editor**
2. Selecione a tabela (jobs, videos, combinations)
3. Veja os dados conforme são inseridos

### Ver logs

1. Dashboard Supabase → **Logs**
2. Filtre por API, Realtime, etc.

## 🎯 Supabase Storage vs Vercel Blob

### Vercel Blob (Recomendado)
✅ Mais rápido para deploy na Vercel  
✅ Integração nativa  
✅ Simples de configurar  
❌ Custos podem ser maiores  

### Supabase Storage
✅ Tudo em um lugar (DB + Storage)  
✅ Pode ser mais barato  
✅ Controle total  
❌ Requer mais configuração  

## 🔒 Segurança

### Service Role Key

⚠️ **IMPORTANTE**: 
- O `service_role` key tem acesso total ao banco
- **NUNCA** exponha no frontend
- Sempre use no backend (API Routes)
- O código já está configurado corretamente

### Row Level Security (RLS)

As tabelas têm RLS ativado, mas com políticas que permitem tudo para o service role.

Se quiser adicionar autenticação de usuários no futuro, você pode:
1. Implementar Supabase Auth
2. Atualizar as políticas RLS
3. Filtrar dados por usuário

## 🐛 Troubleshooting

### "Invalid API key"

**Causa**: Key incorreta ou não configurada

**Solução**:
```bash
# Verifique se as variáveis estão no .env.local
cat .env.local | grep SUPABASE

# Copie novamente do Supabase Dashboard
# Settings → API → Project API keys → service_role
```

### "relation does not exist"

**Causa**: Tabelas não foram criadas

**Solução**:
1. Vá no SQL Editor do Supabase
2. Execute o SQL de criação das tabelas (Passo 2)
3. Verifique em Table Editor se aparecem

### "Row Level Security policy violation"

**Causa**: Políticas RLS muito restritivas

**Solução**:
1. SQL Editor → Execute:
```sql
DROP POLICY IF EXISTS "Enable all for service role" ON jobs;
CREATE POLICY "Enable all for service role" ON jobs FOR ALL USING (true);
```

## 📚 Recursos Adicionais

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)

## 🚀 Deploy na Vercel

Ao fazer deploy na Vercel:

1. Adicione as mesmas variáveis de ambiente
2. Settings → Environment Variables
3. Cole:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `BLOB_READ_WRITE_TOKEN` (se usar Vercel Blob)

---

**Pronto!** Seu HookScale agora usa Supabase! 🎉
