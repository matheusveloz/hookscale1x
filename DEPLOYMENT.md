# Guia de Deploy - HookScale

Este guia explica como fazer deploy do HookScale na Vercel.

## Pré-requisitos

- Conta Vercel (recomendado: Plano Pro)
- Repositório Git (GitHub, GitLab, ou Bitbucket)
- Node.js 18+ para desenvolvimento local

## Passo 1: Preparar o Projeto

1. **Commit todas as alterações:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Verifique o build localmente:**
```bash
npm run build
```

## Passo 2: Configurar Vercel Blob Storage

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Storage** → **Create Database** → **Blob**
3. Dê um nome (ex: "hookscale-storage")
4. Copie o `BLOB_READ_WRITE_TOKEN`

## Passo 3: Configurar Vercel Postgres

1. No Vercel Dashboard, vá em **Storage** → **Create Database** → **Postgres**
2. Dê um nome (ex: "hookscale-db")
3. Aguarde a criação do banco
4. As variáveis de ambiente serão geradas automaticamente

## Passo 4: Criar Projeto na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione seu repositório
4. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build` (padrão)
   - **Install Command**: `npm install` (padrão)

## Passo 5: Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione as seguintes variáveis de ambiente:

### Vercel Blob (obrigatório)
```
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### Vercel Postgres (obrigatório)
As seguintes variáveis são criadas automaticamente quando você conecta o Postgres:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

### Opcionais
```
FFMPEG_PATH=/opt/ffmpeg/ffmpeg
MAX_FILE_SIZE_MB=100
BATCH_SIZE=8
```

## Passo 6: Conectar Storage ao Projeto

1. No projeto na Vercel, vá em **Storage**
2. Clique em **Connect Store**
3. Selecione o Blob Storage criado
4. Selecione o Postgres criado
5. As variáveis de ambiente serão adicionadas automaticamente

## Passo 7: Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Acesse a URL fornecida

## Passo 8: Verificar FFmpeg (Importante!)

O FFmpeg pode não estar disponível por padrão na Vercel. Você tem duas opções:

### Opção A: Usar @ffmpeg-installer/ffmpeg
```bash
npm install @ffmpeg-installer/ffmpeg
```

Então atualize `lib/ffmpeg.ts`:
```typescript
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
```

### Opção B: Incluir binário estático
1. Baixe FFmpeg static binary
2. Adicione ao projeto em `public/ffmpeg/`
3. Configure `FFMPEG_PATH` na Vercel

Veja [FFMPEG_SETUP.md](./FFMPEG_SETUP.md) para mais detalhes.

## Passo 9: Testar

1. Acesse a URL do projeto
2. Faça upload de alguns vídeos de teste
3. Verifique se o processamento funciona
4. Teste o download individual e em lote

## Troubleshooting

### Build falha
- Verifique os logs de build na Vercel
- Certifique-se de que todas as dependências estão no `package.json`
- Execute `npm run build` localmente para reproduzir

### "Cannot connect to database"
- Verifique se as variáveis do Postgres estão configuradas
- Certifique-se de que o Postgres está conectado ao projeto
- Verifique os logs da função na Vercel

### "FFmpeg not found"
- Instale `@ffmpeg-installer/ffmpeg`
- Ou configure um binário estático
- Veja [FFMPEG_SETUP.md](./FFMPEG_SETUP.md)

### Timeout durante processamento
- **Certifique-se de estar no Vercel Pro** (hobby tem limite de 10s)
- Reduza o `BATCH_SIZE`
- Use vídeos menores para teste

### Upload falha
- Verifique se o Blob Storage está conectado
- Verifique o `BLOB_READ_WRITE_TOKEN`
- Verifique os limites de tamanho de arquivo

## Monitoramento

### Logs
- Acesse o projeto na Vercel
- Vá em **Deployments** → Selecione o deployment → **Functions**
- Clique em uma função para ver os logs

### Métricas
- Vá em **Analytics** para ver uso
- Monitore timeouts e erros
- Acompanhe o uso de banda

## Custos Estimados

### Vercel Pro ($20/mês)
- Functions: 1000 GB-Hrs incluído
- Bandwidth: 1 TB incluído
- Serverless Functions até 300s

### Vercel Blob Storage
- $0.15/GB armazenado por mês
- $0.30/GB transferido
- 500 MB grátis

### Vercel Postgres
- Variável de acordo com uso
- Veja preços em: https://vercel.com/docs/storage/vercel-postgres/usage-and-pricing

## Otimizações de Custo

1. **Limite tempo de retenção**: Delete jobs antigos
2. **Compressão**: Os vídeos já são comprimidos
3. **Cache**: Use CDN do Vercel para downloads
4. **Processamento eficiente**: Use `-c copy` no FFmpeg

## Deploy de Atualizações

```bash
# 1. Fazer alterações
git add .
git commit -m "Update feature X"

# 2. Push para repositório
git push origin main

# 3. Vercel faz deploy automaticamente
# Monitore em: https://vercel.com/dashboard
```

## Rollback

Se algo der errado:

1. Vá em **Deployments**
2. Encontre um deployment anterior funcional
3. Clique nos 3 pontos → **Promote to Production**

## Domínio Customizado

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde propagação (pode levar até 48h)

## CI/CD Avançado

Para controle mais granular:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Checklist de Deploy

- [ ] Código commitado e no repositório
- [ ] Build local funciona (`npm run build`)
- [ ] Vercel Blob Storage criado e conectado
- [ ] Vercel Postgres criado e conectado
- [ ] Variáveis de ambiente configuradas
- [ ] FFmpeg configurado
- [ ] Deploy realizado com sucesso
- [ ] Testes de upload funcionando
- [ ] Testes de processamento funcionando
- [ ] Downloads funcionando
- [ ] Logs verificados
- [ ] Plano Vercel Pro ativo (se necessário)

## Suporte

Se encontrar problemas:

1. Verifique os logs na Vercel
2. Consulte a documentação: https://vercel.com/docs
3. Abra uma issue no repositório
4. Entre em contato com suporte da Vercel

---

**Última atualização**: Janeiro 2026
