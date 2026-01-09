# 🚀 Início Rápido - HookScale com Supabase

Configure em 5 minutos!

## ✅ Checklist

- [ ] Projeto Supabase criado
- [ ] Tabelas criadas
- [ ] Variáveis de ambiente configuradas
- [ ] FFmpeg instalado
- [ ] Servidor rodando

## 📝 Passo a Passo

### 1️⃣ Criar Projeto Supabase (2 min)

1. https://supabase.com/dashboard → **New Project**
2. Nome: `hookscale`
3. Senha do DB: (crie uma forte)
4. Region: Mais próxima de você
5. **Create** → Aguarde ~2 min

### 2️⃣ Criar Tabelas (1 min)

1. Menu lateral → **SQL Editor**
2. **New query**
3. Cole e **Run**:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  total_combinations INTEGER,
  processed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE INDEX idx_videos_job_id ON videos(job_id);
CREATE INDEX idx_videos_type ON videos(type);
CREATE INDEX idx_combinations_job_id ON combinations(job_id);
CREATE INDEX idx_combinations_status ON combinations(status);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE combinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for service role" ON jobs FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON videos FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON combinations FOR ALL USING (true);
```

### 3️⃣ Copiar Credenciais (30 seg)

Menu lateral → **Settings** → **API**

Copie:
- **Project URL**: `https://xxxxx.supabase.co`
- **service_role**: Em "Project API keys" → `service_role`

### 4️⃣ Criar Vercel Blob (1 min)

1. https://vercel.com/dashboard → **Storage** → **Create Database**
2. Selecione **Blob**
3. Nome: `hookscale-blob`
4. **Create**
5. Copie o `BLOB_READ_WRITE_TOKEN`

### 5️⃣ Configurar .env.local (30 seg)

Na raiz do projeto, crie `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# Configurações
MAX_FILE_SIZE_MB=100
BATCH_SIZE=8
```

### 6️⃣ Instalar FFmpeg (se não tiver)

**Mac:**
```bash
brew install ffmpeg
```

**Ubuntu:**
```bash
sudo apt install ffmpeg
```

**Windows:**
```bash
choco install ffmpeg
```

### 7️⃣ Rodar! (10 seg)

```bash
npm run dev
```

Acesse: **http://localhost:3000** 🎉

## 🧪 Teste Rápido

1. Prepare 2 vídeos curtos (5-10s) em .mp4
2. Upload: 1 como hook, 1 como body
3. Clique em "Gerar Combinações"
4. Aguarde processar
5. Download!

## ⚠️ Problemas?

### "Invalid API key"
- Verifique se copiou o **service_role** (não o anon key)
- Confira se está no `.env.local`

### "relation does not exist"
- Execute o SQL das tabelas novamente no SQL Editor

### "FFmpeg not found"
```bash
ffmpeg -version  # Deve mostrar a versão
```

### Servidor não inicia
```bash
# Reinstale dependências
rm -rf node_modules package-lock.json
npm install
```

## 📚 Mais Info

- **Setup Detalhado**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Deploy**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **FFmpeg**: [FFMPEG_SETUP.md](./FFMPEG_SETUP.md)

---

**Tempo total**: ~5 minutos ⚡
