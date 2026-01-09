# Guia de Início Rápido - HookScale

Comece a usar o HookScale em minutos!

## 🚀 Setup Rápido (Desenvolvimento Local)

### 1. Clone e Instale

```bash
# Clone o repositório
git clone <seu-repo>
cd hookscale

# Instale as dependências
npm install
```

### 2. Configure as Variáveis de Ambiente

**Este é o passo mais importante!** Sem isso, você verá o erro:
```
VercelPostgresError: 'missing_connection_string'
```

#### Passo 2.1: Criar Vercel Blob Storage

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **Storage** (no menu lateral)
3. Clique em **Create Database**
4. Selecione **Blob**
5. Dê um nome (ex: `hookscale-blob-dev`)
6. Clique em **Create**
7. **Copie o token** que aparece (começa com `vercel_blob_rw_`)

#### Passo 2.2: Criar Vercel Postgres

1. Ainda em **Storage**, clique em **Create Database** novamente
2. Selecione **Postgres**
3. Dê um nome (ex: `hookscale-db-dev`)
4. Clique em **Create** e aguarde (~2 minutos)
5. Quando criado, clique no banco
6. Vá na aba **Settings**
7. Role até **Environment Variables**
8. **Copie todas as variáveis** que começam com `POSTGRES_`

#### Passo 2.3: Criar o arquivo .env.local

Na raiz do projeto (pasta `hookscale`), crie um arquivo chamado `.env.local`:

```env
# Cole aqui o token do Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# Cole aqui TODAS as variáveis do Postgres
POSTGRES_URL=postgres://default:XXX@XXX-pooler.us-east-1.postgres.vercel-storage.com/verceldb
POSTGRES_PRISMA_URL=postgres://default:XXX@XXX-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://default:XXX@XXX.us-east-1.postgres.vercel-storage.com/verceldb
POSTGRES_USER=default
POSTGRES_HOST=XXX-pooler.us-east-1.postgres.vercel-storage.com
POSTGRES_PASSWORD=XXXXXXXXXX
POSTGRES_DATABASE=verceldb

# Opcionais (pode deixar assim)
MAX_FILE_SIZE_MB=100
BATCH_SIZE=8
```

**⚠️ IMPORTANTE**: 
- Substitua os `XXX` pelos valores reais copiados do Vercel
- O arquivo deve estar na raiz do projeto
- NÃO commite este arquivo no Git (já está no .gitignore)

**📖 Mais detalhes**: Veja [SETUP_LOCAL.md](./SETUP_LOCAL.md)

### 3. Configure o FFmpeg

#### Mac (Homebrew)
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows (Chocolatey)
```bash
choco install ffmpeg
```

Ou baixe de: https://ffmpeg.org/download.html

### 4. Inicie o Servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📝 Uso Básico

1. **Upload**: 
   - Arraste vídeos de "hooks" para a primeira área
   - Arraste vídeos de "bodies" para a segunda área
   - Apenas arquivos .mp4 são aceitos

2. **Processar**:
   - Clique em "Gerar Combinações"
   - Aguarde o processamento (acompanhe o progresso)

3. **Download**:
   - Baixe vídeos individuais
   - Ou baixe todos em um ZIP

## 🎯 Exemplo de Teste

Para testar rapidamente:

1. Crie 2 vídeos curtos de teste (5-10 segundos cada)
2. Faça upload de 1 como hook e 1 como body
3. Isso gerará 1 combinação (1×1 = 1)
4. Perfeito para testar o fluxo completo!

## 🐛 Problemas Comuns

### "Cannot connect to database"
```bash
# Verifique se as variáveis do Postgres estão corretas
# Teste a conexão:
npm run db:init
```

### "FFmpeg not found"
```bash
# Verifique se está instalado:
ffmpeg -version

# Se não estiver, instale conforme instruções acima
```

### "Upload failed"
```bash
# Verifique se BLOB_READ_WRITE_TOKEN está configurado
# Teste se o token é válido no Vercel Dashboard
```

## 📚 Próximos Passos

- ✅ Leia o [README.md](./README.md) completo
- ✅ Consulte a [API Documentation](./API_DOCUMENTATION.md)
- ✅ Prepare para [Deploy](./DEPLOYMENT.md)
- ✅ Configure [FFmpeg na Vercel](./FFMPEG_SETUP.md)

## 💡 Dicas

- Use vídeos pequenos (5-20s) para testes
- Comece com poucas combinações (2×2 = 4)
- Monitore os logs no terminal durante processamento
- Use o Dark Mode! (toggle no canto superior direito)

## 🆘 Precisa de Ajuda?

- 📖 Leia a documentação completa
- 🐛 Abra uma issue no GitHub
- 💬 Consulte o [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Tempo estimado para setup**: 10-15 minutos

**Pronto para usar em produção?** Veja [DEPLOYMENT.md](./DEPLOYMENT.md)
