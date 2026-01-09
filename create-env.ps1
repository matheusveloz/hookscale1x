# Script para criar o arquivo .env.local
# Execute: .\create-env.ps1

$envContent = @"
# ============================================
# HOOKSCALE - Variáveis de Ambiente
# ============================================

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://gemrbwbadcqeiuoyenrd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_A_SERVICE_ROLE_KEY

# VERCEL BLOB
BLOB_READ_WRITE_TOKEN=COLE_AQUI_O_TOKEN_DO_VERCEL_BLOB

# CONFIGURAÇÕES
MAX_FILE_SIZE_MB=100
BATCH_SIZE=8
"@

# Criar arquivo .env.local
$envContent | Out-File -FilePath ".env.local" -Encoding utf8

Write-Host "✓ Arquivo .env.local criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Você precisa editar o .env.local e adicionar:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SERVICE ROLE KEY do Supabase:" -ForegroundColor Cyan
Write-Host "   - Acesse: https://supabase.com/dashboard/project/gemrbwbadcqeiuoyenrd/settings/api"
Write-Host "   - Copie a chave 'service_role' (não a 'anon')"
Write-Host ""
Write-Host "2. TOKEN do Vercel Blob:" -ForegroundColor Cyan
Write-Host "   - Acesse: https://vercel.com/dashboard"
Write-Host "   - Storage → Create Database → Blob"
Write-Host "   - Copie o BLOB_READ_WRITE_TOKEN"
Write-Host ""
Write-Host "Após editar, execute: npm run db:test" -ForegroundColor Green
