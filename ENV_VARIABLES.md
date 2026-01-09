# 🔐 Variáveis de Ambiente - HookScale

## ⚡ MUDOU E SIMPLIFICOU!

### ❌ ANTES (7 variáveis Stripe):
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PREMIUM=price_...
STRIPE_PRICE_ID_SCALE=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ✅ AGORA (2 variáveis Stripe):
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Produtos criados automaticamente! 🎉
```

---

## 📋 Arquivo `.env.local` Completo

Crie o arquivo `.env.local` na raiz do projeto com:

```bash
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# ============================================
# VERCEL BLOB STORAGE
# ============================================
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx

# ============================================
# STRIPE - APENAS 2 VARIÁVEIS!
# ============================================
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# APP URL
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📍 Onde Obter Cada Variável

### 🗄️ Supabase

1. Ir para [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecionar seu projeto
3. Ir em **Settings** → **API**
4. Copiar:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 📦 Vercel Blob

1. Ir para [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecionar projeto (ou criar)
3. Ir em **Storage** → **Create** → **Blob**
4. Copiar token → `BLOB_READ_WRITE_TOKEN`

### 💳 Stripe Secret Key

1. Ir para [Stripe Dashboard](https://dashboard.stripe.com)
2. Ir em **Developers** → **API keys**
3. Copiar **Secret key** → `STRIPE_SECRET_KEY`
   - Test mode: `sk_test_...`
   - Live mode: `sk_live_...`

### 🔔 Stripe Webhook Secret

**Para Desenvolvimento (Local):**

```bash
# Instalar Stripe CLI (se ainda não tem)
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe

# Login
stripe login

# Iniciar listener
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

O CLI vai mostrar algo como:
```
> Ready! Your webhook signing secret is whsec_xxxxx...
```

Copie esse `whsec_xxxxx` → `STRIPE_WEBHOOK_SECRET`

**Para Produção:**

1. Ir em **Developers** → **Webhooks**
2. Clicar **Add endpoint**
3. URL: `https://seudominio.com/api/stripe-webhook`
4. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiar **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## 🎉 O Que Mudou?

### Removido (não precisa mais!):
- ❌ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ❌ `STRIPE_PRICE_ID_STARTER`
- ❌ `STRIPE_PRICE_ID_PREMIUM`
- ❌ `STRIPE_PRICE_ID_SCALE`

### Por quê?

**Produtos Stripe agora são criados DINAMICAMENTE no código!**

Quando um usuário assina um plano pela primeira vez:
```typescript
// lib/stripe.ts
export async function getOrCreatePrice(planId) {
  // 1. Procura produto "HookScale [Plan]" no Stripe
  // 2. Se não existe → cria o produto
  // 3. Procura price do produto
  // 4. Se não existe → cria o price
  // 5. Retorna price ID
}
```

**Vantagens:**
- ✅ Zero configuração manual
- ✅ Menos variáveis de ambiente
- ✅ Funciona em qualquer ambiente
- ✅ Produtos sempre consistentes

---

## ✅ Checklist de Setup

- [ ] Criar arquivo `.env.local` na raiz
- [ ] Adicionar variáveis do Supabase (3)
- [ ] Adicionar token do Vercel Blob (1)
- [ ] Adicionar Stripe Secret Key (1)
- [ ] Adicionar Stripe Webhook Secret (1)
- [ ] Adicionar App URL (1)
- [ ] **Total: 7 variáveis** (antes eram 10!)

---

## 🧪 Testar

```bash
# Terminal 1: Iniciar app
npm run dev

# Terminal 2: Iniciar webhook listener (só desenvolvimento)
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Acessar: http://localhost:3000

---

## 🚀 Produção

Para deploy, use os mesmos nomes de variáveis mas com valores de **produção**:

- `STRIPE_SECRET_KEY=sk_live_...` (não test)
- `STRIPE_WEBHOOK_SECRET=whsec_...` (do webhook de produção)
- `NEXT_PUBLIC_APP_URL=https://seudominio.com`

---

**Muito mais simples agora! 🎉**
