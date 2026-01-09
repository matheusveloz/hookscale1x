# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-09

### Adicionado
- Configuração inicial do projeto Next.js 14+ com App Router
- Sistema de upload drag & drop para vídeos de hooks e bodies
- Validação de arquivos (formato .mp4, tamanho máximo)
- Preview de vídeos após upload com informações de duração
- Integração com Vercel Blob Storage para armazenamento de vídeos
- Integração com Vercel Postgres para persistência de dados
- Processamento automático de combinações usando FFmpeg
- Concatenação de vídeos com método copy (sem re-encoding) e fallback para re-encoding
- Processamento em lotes para otimização e respeito aos limites da Vercel
- Progresso em tempo real via Server-Sent Events (SSE)
- Barra de progresso animada com informações do arquivo atual
- Download individual de vídeos processados
- Download em lote (ZIP) com streaming
- Dark mode completo com toggle
- Interface responsiva para mobile e desktop
- Componentes UI customizados baseados em Tailwind CSS
- Sistema de tipos TypeScript completo
- Tratamento de erros abrangente
- Limpeza automática de arquivos temporários
- Nomenclatura descritiva para vídeos gerados (hook01_body01.mp4)

### Documentação
- README.md completo com instruções de instalação e uso
- API_DOCUMENTATION.md com todos os endpoints
- DEPLOYMENT.md com guia passo a passo para deploy na Vercel
- FFMPEG_SETUP.md com instruções de configuração do FFmpeg
- CONTRIBUTING.md com diretrizes para contribuições
- Comentários inline no código

### Configuração
- next.config.ts com bodyParser limit aumentado
- vercel.json com maxDuration para funções
- .gitignore atualizado
- Scripts npm para desenvolvimento e produção
- Script de inicialização do banco de dados

### Estrutura
- Arquitetura modular e escalável
- Separação clara entre componentes, lib e API routes
- Reutilização de componentes
- Helpers para operações comuns (FFmpeg, Blob, DB)

## [Unreleased]

### Planejado
- [ ] Testes automatizados (Jest + React Testing Library)
- [ ] Retry logic para uploads e processamento
- [ ] Histórico de jobs com paginação
- [ ] Suporte a outros formatos de vídeo (mov, avi, webm)
- [ ] Preview de vídeos antes do processamento
- [ ] Estimativa de tempo de processamento
- [ ] Configuração de qualidade de output
- [ ] Efeitos de transição entre vídeos
- [ ] Internacionalização (i18n)
- [ ] Autenticação de usuários
- [ ] API rate limiting
- [ ] Webhook notifications
- [ ] Cron job para limpeza de jobs antigos

### Em Consideração
- [ ] Suporte a legendas
- [ ] Marca d'água customizável
- [ ] Redimensionamento automático de vídeos
- [ ] Compressão de vídeos
- [ ] Thumbnails automáticos
- [ ] Busca e filtros de jobs
- [ ] Compartilhamento de vídeos via link
- [ ] Integração com cloud storage externo (S3, Google Cloud)

---

## Como Usar Este Changelog

### Categorias
- **Adicionado** - Novas funcionalidades
- **Modificado** - Mudanças em funcionalidades existentes
- **Depreciado** - Funcionalidades que serão removidas
- **Removido** - Funcionalidades removidas
- **Corrigido** - Correções de bugs
- **Segurança** - Correções de vulnerabilidades

### Versionamento
- **MAJOR** (X.0.0) - Mudanças incompatíveis com versões anteriores
- **MINOR** (0.X.0) - Novas funcionalidades compatíveis
- **PATCH** (0.0.X) - Correções de bugs compatíveis

---

Para ver todas as releases, visite: https://github.com/seu-usuario/hookscale/releases
