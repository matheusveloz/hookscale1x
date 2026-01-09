# 🔑 Como Obter a Service Role Key do Supabase

## Passo a Passo Visual

### 1. Acesse o Dashboard
Abra: **https://supabase.com/dashboard/project/gemrbwbadcqeiuoyenrd/settings/api**

### 2. Encontre "Project API keys"

Na página, você verá uma seção chamada **"Project API keys"** com duas chaves:

```
┌─────────────────────────────────────────────┐
│ Project API keys                            │
├─────────────────────────────────────────────┤
│                                             │
│ anon (public)                               │
│ ┌─────────────────────────────────────┐     │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX... │  ← ❌ NÃO É ESTA!
│ └─────────────────────────────────────┘     │
│                                             │
│ service_role (secret)                       │
│ ┌─────────────────────────────────────┐     │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX... │  ← ✅ É ESTA AQUI!
│ └─────────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. Copiar a Chave Correta

1. Clique no ícone de **copiar** ao lado da chave **"service_role"**
2. A chave começa com `eyJ...` e é BEM LONGA (várias linhas)
3. **NÃO copie** a chave "anon" (essa é pública)

### 4. Colar no .env.local

Abra o arquivo `.env.local` e substitua:

**ANTES:**
```env
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_A_SERVICE_ROLE_KEY
```

**DEPOIS:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbXJid2JhZGNxZWl1b3llbnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjQ1MTYwMCwiZXhwIjoyMDUyMDI3NjAwfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

(sua chave será diferente, use a que você copiou!)

### 5. Salvar e Recarregar

1. **Salve** o arquivo `.env.local`
2. **Pare** o servidor (Ctrl+C no terminal)
3. **Inicie** novamente: `npm run dev`

## ⚡ Atalho Rápido

**Link direto**: https://supabase.com/dashboard/project/gemrbwbadcqeiuoyenrd/settings/api

**O que fazer**:
1. Copie a chave "service_role" (a segunda)
2. Cole no `.env.local` substituindo `COLE_AQUI_A_SERVICE_ROLE_KEY`
3. Salve
4. Reinicie o servidor

## ✅ Como Saber se Funcionou

Após reiniciar, execute:
```bash
npm run db:test
```

Se der certo, você verá:
```
✓ Conexão estabelecida com sucesso!
```

## ❌ Ainda com Erro?

Se continuar dando erro "Invalid API key":

1. **Verifique** se copiou a chave **service_role** (não a anon)
2. **Verifique** se colou a chave COMPLETA (ela é bem longa!)
3. **Verifique** se não tem espaços antes/depois da chave
4. **Salve** o arquivo
5. **Reinicie** o servidor

---

**Próximo passo**: Após isso funcionar, você ainda precisará do **Vercel Blob Token**!
