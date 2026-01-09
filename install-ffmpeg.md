# 🎬 Instalar FFmpeg no Windows

## Opção 1: Download Manual (Recomendado)

### Passo 1: Baixar FFmpeg

1. Acesse: https://www.gyan.dev/ffmpeg/builds/
2. Baixe: **ffmpeg-release-essentials.zip** (link direto: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip)
3. Tamanho: ~70MB

### Passo 2: Extrair

1. Extraia o ZIP para `C:\`
2. Renomeie a pasta para `C:\ffmpeg`
3. Dentro dela deve ter: `bin`, `doc`, `presets`

### Passo 3: Adicionar ao PATH

1. Pressione `Win + R`
2. Digite: `sysdm.cpl` → Enter
3. Aba **"Avançado"** → Botão **"Variáveis de Ambiente"**
4. Em **"Variáveis do usuário"**, selecione **Path** → **Editar**
5. Clique em **Novo**
6. Adicione: `C:\ffmpeg\bin`
7. Clique em **OK** em todas as janelas

### Passo 4: Verificar

Abra um **NOVO** terminal PowerShell e execute:

```powershell
ffmpeg -version
```

Deve mostrar a versão do FFmpeg!

---

## Opção 2: Via Winget (Windows 11)

Se você tem Windows 11 com winget:

```powershell
winget install ffmpeg
```

---

## Opção 3: Via Scoop

```powershell
# Instalar Scoop (se não tiver)
irm get.scoop.sh | iex

# Instalar FFmpeg
scoop install ffmpeg
```

---

## ✅ Após Instalar

1. **Feche TODOS os terminais** (incluindo VSCode/Cursor)
2. **Abra novamente**
3. **Teste**: `ffmpeg -version`
4. **Reinicie o servidor**: `npm run dev`

---

## 🚨 Se ainda não funcionar

Adicione no `.env.local`:

```env
FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe
```

E reinicie o servidor.
