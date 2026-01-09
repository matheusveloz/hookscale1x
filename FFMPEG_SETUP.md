# FFmpeg Setup para Vercel

Este documento explica como configurar o FFmpeg para funcionar na Vercel.

## Opção 1: FFmpeg Layer (Recomendado)

A maneira mais fácil é usar um layer do FFmpeg pré-compilado para a Vercel.

### Usando @ffmpeg-installer/ffmpeg

1. Instale o pacote:
```bash
npm install @ffmpeg-installer/ffmpeg
```

2. Atualize `lib/ffmpeg.ts` para usar o instalador:
```typescript
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Set FFmpeg path from installer
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
```

## Opção 2: FFmpeg Static Binary

Você pode incluir um binário estático do FFmpeg no projeto.

1. Baixe o FFmpeg static binary para Linux:
   - Acesse: https://johnvansickle.com/ffmpeg/
   - Baixe a versão "ffmpeg-release-amd64-static.tar.xz"

2. Extraia e copie o binário `ffmpeg` para `public/ffmpeg/`

3. Configure no `lib/ffmpeg.ts`:
```typescript
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

const ffmpegPath = process.env.FFMPEG_PATH || path.join(process.cwd(), 'public', 'ffmpeg', 'ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
```

4. Atualize o `.gitignore` se necessário (binários podem ser grandes)

## Opção 3: Vercel Edge Functions com FFmpeg WASM

Se você quiser rodar no Edge, pode usar ffmpeg-wasm:

1. Instale:
```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

2. Crie um wrapper no cliente (browser) em vez do servidor

**Nota**: Esta opção é mais lenta e transfere o processamento para o cliente.

## Verificando a Instalação

Adicione um endpoint de teste em `app/api/test-ffmpeg/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';

export async function GET() {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err, formats) => {
      if (err) {
        resolve(NextResponse.json({ 
          error: err.message,
          available: false 
        }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ 
          available: true,
          formats: Object.keys(formats).slice(0, 10) 
        }));
      }
    });
  });
}
```

Acesse `/api/test-ffmpeg` para verificar se está funcionando.

## Troubleshooting

### "ffmpeg exited with code 1"
- Verifique se o caminho do FFmpeg está correto
- Certifique-se de que o binário tem permissões de execução
- Verifique os logs do Vercel para mais detalhes

### "Cannot find module 'ffmpeg'"
- Reinstale as dependências: `npm install`
- Certifique-se de que `fluent-ffmpeg` está no `package.json`

### Timeout na Vercel
- Reduza o tamanho dos vídeos
- Use o método de concatenação com `-c copy` (sem re-encode)
- Processe menos vídeos por lote
- Certifique-se de estar no Vercel Pro (5 min timeout vs 10s no hobby)

## Recomendações de Performance

1. **Use `-c copy` quando possível**: Evita re-encoding, é muito mais rápido
2. **Processe em lotes**: Não tente processar 100 vídeos de uma vez
3. **Monitore o uso de memória**: `/tmp` na Vercel tem limite de 512MB
4. **Limpe arquivos temporários**: Sempre delete após processar

## Alternativas

Se o FFmpeg na Vercel for problemático, considere:

1. **Usar um serviço dedicado**: AWS Lambda, Railway, Render
2. **Processar no cliente**: ffmpeg-wasm (mais lento)
3. **API externa**: Cloudinary, Mux, etc.
