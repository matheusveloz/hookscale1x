# Setup Local - Desenvolvimento sem Vercel

## Opção 1: Usar Vercel Storage Localmente (Recomendado)

### Passo 1: Criar Storage na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Crie um novo projeto ou use um existente
3. Vá em **Storage** → **Create Database**

### Passo 2: Criar Vercel Blob Storage

1. Selecione **Blob**
2. Dê um nome: `hookscale-blob-dev`
3. Clique em **Create**
4. Copie o **BLOB_READ_WRITE_TOKEN**

### Passo 3: Criar Vercel Postgres

1. Volte em **Storage** → **Create Database**
2. Selecione **Postgres**
3. Dê um nome: `hookscale-db-dev`
4. Aguarde a criação (1-2 minutos)
5. Vá na aba **Settings** → **Environment Variables**
6. Copie todas as variáveis que começam com `POSTGRES_`

### Passo 4: Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# Vercel Postgres
POSTGRES_URL=postgres://default:XXXXX@XXXXX-pooler.us-east-1.postgres.vercel-storage.com/verceldb
POSTGRES_PRISMA_URL=postgres://default:XXXXX@XXXXX-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://default:XXXXX@XXXXX.us-east-1.postgres.vercel-storage.com/verceldb
POSTGRES_USER=default
POSTGRES_HOST=XXXXX-pooler.us-east-1.postgres.vercel-storage.com
POSTGRES_PASSWORD=XXXXX
POSTGRES_DATABASE=verceldb

# Opcionais
MAX_FILE_SIZE_MB=100
BATCH_SIZE=8
```

### Passo 5: Iniciar o Servidor

```bash
npm run dev
```

---

## Opção 2: Usar PostgreSQL Local

Se você preferir usar PostgreSQL local em vez do Vercel Postgres:

### Passo 1: Instalar PostgreSQL

#### Mac
```bash
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
Baixe de: https://www.postgresql.org/download/windows/

### Passo 2: Criar Banco de Dados

```bash
# Entre no PostgreSQL
psql postgres

# Crie um usuário e banco
CREATE USER hookscale WITH PASSWORD 'sua_senha';
CREATE DATABASE hookscale OWNER hookscale;
\q
```

### Passo 3: Configurar .env.local

```env
# PostgreSQL Local
POSTGRES_URL=postgres://hookscale:sua_senha@localhost:5432/hookscale
POSTGRES_PRISMA_URL=postgres://hookscale:sua_senha@localhost:5432/hookscale
POSTGRES_URL_NON_POOLING=postgres://hookscale:sua_senha@localhost:5432/hookscale
POSTGRES_USER=hookscale
POSTGRES_HOST=localhost
POSTGRES_PASSWORD=sua_senha
POSTGRES_DATABASE=hookscale

# Vercel Blob - ainda precisa do Vercel
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# Opcionais
MAX_FILE_SIZE_MB=100
BATCH_SIZE=8
```

### Passo 4: Inicializar Banco

```bash
npm run db:init
```

---

## Opção 3: Usar Storage Local (Apenas para Testes)

**AVISO**: Esta opção requer modificações no código e não é recomendada para produção.

Se você quiser testar sem Vercel Blob, precisará:

1. Modificar `lib/blob-storage.ts` para usar sistema de arquivos local
2. Modificar `app/api/upload/route.ts` para salvar localmente
3. Não é coberto neste guia - use as opções 1 ou 2

---

## Verificando a Configuração

### Teste 1: Verificar Conexão com Postgres

Crie um arquivo `test-db.ts`:

```typescript
import { sql } from '@vercel/postgres';

async function test() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✓ Postgres conectado:', result.rows[0]);
  } catch (error) {
    console.error('✗ Erro:', error);
  }
  process.exit(0);
}

test();
```

Execute:
```bash
npx tsx test-db.ts
```

### Teste 2: Verificar Blob Storage

Acesse a aplicação em `http://localhost:3000` e tente fazer upload de um vídeo pequeno.

---

## Troubleshooting

### "missing_connection_string"

**Causa**: `.env.local` não existe ou está vazio

**Solução**:
1. Certifique-se de que o arquivo `.env.local` está na raiz do projeto
2. Verifique se as variáveis `POSTGRES_URL` está definida
3. Reinicie o servidor: `Ctrl+C` e `npm run dev`

### "SASL authentication failed"

**Causa**: Senha incorreta do PostgreSQL

**Solução**:
1. Verifique a senha no `.env.local`
2. Se for Vercel Postgres, copie novamente do dashboard
3. Se for local, redefina a senha do usuário

### "Database does not exist"

**Causa**: Banco de dados não foi criado

**Solução**:
```bash
npm run db:init
```

### "BLOB_READ_WRITE_TOKEN" inválido

**Causa**: Token do Blob expirou ou está incorreto

**Solução**:
1. Vá no Vercel Dashboard
2. Storage → Blob → Settings
3. Copie um novo token
4. Atualize o `.env.local`

---

## Dicas Importantes

1. **Nunca commite o `.env.local`** - ele está no `.gitignore`
2. **Use dados de teste** - não use dados sensíveis em desenvolvimento
3. **Reinicie o servidor** após alterar variáveis de ambiente
4. **Vercel Blob é necessário** - não há alternativa local fácil
5. **Postgres local funciona** - mas Vercel Postgres é mais fácil

---

## Próximos Passos

Após configurar:

1. ✅ Acesse `http://localhost:3000`
2. ✅ Faça upload de vídeos de teste (5-10s)
3. ✅ Teste o processamento
4. ✅ Teste os downloads

Para produção, siga o [DEPLOYMENT.md](./DEPLOYMENT.md)
