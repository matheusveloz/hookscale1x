# Script de instalação automática do FFmpeg
# Execute: .\install-ffmpeg.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  FFmpeg Auto Installer for Windows  " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Diretório de instalação
$installPath = "C:\ffmpeg"
$downloadUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$zipFile = "$env:TEMP\ffmpeg.zip"

# 1. Baixar FFmpeg
Write-Host "[1/5] Baixando FFmpeg..." -ForegroundColor Yellow
try {
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
    }
    
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "      Download completo!" -ForegroundColor Green
} catch {
    Write-Host "      Erro ao baixar: $_" -ForegroundColor Red
    exit 1
}

# 2. Remover instalação anterior (se existir)
Write-Host "[2/5] Preparando diretório de instalação..." -ForegroundColor Yellow
if (Test-Path $installPath) {
    Write-Host "      Removendo instalação anterior..." -ForegroundColor Gray
    Remove-Item $installPath -Recurse -Force
}

# 3. Extrair arquivo
Write-Host "[3/5] Extraindo arquivos..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipFile -DestinationPath "$env:TEMP\ffmpeg-temp" -Force
    
    # Encontrar a pasta extraída (pode ter nome com versão)
    $extractedFolder = Get-ChildItem "$env:TEMP\ffmpeg-temp" -Directory | Select-Object -First 1
    
    # Mover para C:\ffmpeg
    Move-Item $extractedFolder.FullName $installPath
    
    Write-Host "      Extração completa!" -ForegroundColor Green
} catch {
    Write-Host "      Erro ao extrair: $_" -ForegroundColor Red
    exit 1
}

# 4. Adicionar ao PATH
Write-Host "[4/5] Adicionando ao PATH do sistema..." -ForegroundColor Yellow
try {
    $ffmpegBin = "$installPath\bin"
    
    # PATH do usuário
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    if ($userPath -notlike "*$ffmpegBin*") {
        [Environment]::SetEnvironmentVariable(
            "Path",
            "$userPath;$ffmpegBin",
            "User"
        )
        Write-Host "      PATH atualizado!" -ForegroundColor Green
    } else {
        Write-Host "      FFmpeg já está no PATH" -ForegroundColor Gray
    }
    
    # Atualizar PATH da sessão atual
    $env:Path = "$env:Path;$ffmpegBin"
    
} catch {
    Write-Host "      Erro ao atualizar PATH: $_" -ForegroundColor Red
}

# 5. Limpar arquivos temporários
Write-Host "[5/5] Limpando arquivos temporários..." -ForegroundColor Yellow
Remove-Item $zipFile -Force -ErrorAction SilentlyContinue
Remove-Item "$env:TEMP\ffmpeg-temp" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "      Limpeza completa!" -ForegroundColor Green

# Verificar instalação
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Verificando instalação...          " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$ffmpegExe = "$installPath\bin\ffmpeg.exe"
if (Test-Path $ffmpegExe) {
    Write-Host ""
    & $ffmpegExe -version | Select-Object -First 1
    Write-Host ""
    Write-Host "SUCCESS! FFmpeg instalado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Localização: $installPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "IMPORTANTE:" -ForegroundColor Yellow
    Write-Host "1. Feche TODOS os terminais abertos" -ForegroundColor White
    Write-Host "2. Abra um NOVO terminal" -ForegroundColor White
    Write-Host "3. Execute: ffmpeg -version" -ForegroundColor White
    Write-Host "4. Execute: npm run dev" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERRO: FFmpeg não foi instalado corretamente" -ForegroundColor Red
}
