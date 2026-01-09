# Contribuindo para o HookScale

Obrigado por considerar contribuir para o HookScale! Este documento fornece diretrizes para contribuições.

## Como Contribuir

### Reportando Bugs

Se você encontrou um bug:

1. Verifique se já existe uma issue aberta sobre o problema
2. Se não existir, crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs. comportamento atual
   - Screenshots (se aplicável)
   - Versão do Node.js e sistema operacional

### Sugerindo Melhorias

Para sugerir uma nova funcionalidade:

1. Abra uma issue descrevendo:
   - O que você gostaria de adicionar
   - Por que isso seria útil
   - Como deveria funcionar (se possível)

### Pull Requests

1. **Fork o repositório**
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```

3. **Faça suas alterações** seguindo os padrões do projeto

4. **Teste suas alterações**:
   ```bash
   npm run dev
   npm run build
   npm run type-check
   ```

5. **Commit suas alterações**:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

6. **Push para seu fork**:
   ```bash
   git push origin feature/minha-feature
   ```

7. **Abra um Pull Request**

## Padrões de Código

### TypeScript

- Use TypeScript para todos os arquivos
- Defina tipos explícitos sempre que possível
- Evite `any`, use tipos específicos

### Naming Conventions

- **Componentes**: PascalCase (ex: `UploadZone.tsx`)
- **Funções/Variáveis**: camelCase (ex: `handleUpload`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`)
- **Arquivos**: kebab-case para utils, PascalCase para componentes

### Estrutura de Componentes

```typescript
"use client"; // se necessário

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { MyType } from "@/types";

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState<string>("");

  return (
    <div>
      {/* JSX aqui */}
    </div>
  );
}
```

### API Routes

```typescript
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ou "edge"
export const maxDuration = 300; // se necessário

export async function GET(request: NextRequest) {
  try {
    // lógica
    return NextResponse.json({ data: "success" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error message" },
      { status: 500 }
    );
  }
}
```

## Commit Messages

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alterações em documentação
- `style:` Formatação, sem mudanças de código
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes
- `chore:` Manutenção, dependências, etc.

Exemplos:
```
feat: adiciona upload de múltiplos arquivos
fix: corrige erro no processamento de vídeos grandes
docs: atualiza README com instruções de deploy
```

## Testes

Atualmente o projeto não tem testes automatizados, mas isso é uma contribuição bem-vinda!

Se você adicionar testes:

1. Use Jest + React Testing Library
2. Coloque testes em `__tests__` ou ao lado do arquivo como `.test.ts`
3. Execute com `npm test`

## Estrutura de Branches

- `main` - Branch principal, sempre deployável
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Documentação
- `refactor/*` - Refatorações

## Checklist para PR

Antes de abrir um PR, certifique-se de que:

- [ ] O código compila sem erros (`npm run build`)
- [ ] Type checking passa (`npm run type-check`)
- [ ] Não há erros de lint
- [ ] A funcionalidade foi testada localmente
- [ ] A documentação foi atualizada (se necessário)
- [ ] Commit messages seguem o padrão
- [ ] O código segue os padrões do projeto

## Áreas que Precisam de Ajuda

Algumas áreas onde contribuições são especialmente bem-vindas:

### High Priority
- [ ] Testes automatizados (Jest + React Testing Library)
- [ ] Tratamento de erros melhorado
- [ ] Retry logic para uploads/processamento
- [ ] Progress persistence (salvar progresso no localStorage)

### Medium Priority
- [ ] Suporte a outros formatos de vídeo (mov, avi, etc.)
- [ ] Preview de vídeos antes do processamento
- [ ] Estimativa de tempo de processamento
- [ ] Histórico de jobs (página de listagem)

### Low Priority
- [ ] Internacionalização (i18n)
- [ ] Temas customizáveis
- [ ] Configuração de qualidade de output
- [ ] Efeitos de transição entre vídeos

## Código de Conduta

### Nossas Promessas

- Ser respeitoso e inclusivo
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros

### Comportamentos Inaceitáveis

- Linguagem ofensiva ou imagens inadequadas
- Trolling ou comentários insultuosos
- Assédio público ou privado
- Publicação de informações privadas de terceiros

## Dúvidas?

Se tiver dúvidas sobre como contribuir:

1. Abra uma issue com a tag `question`
2. Entre em contato com os mantenedores
3. Consulte a documentação existente

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

Obrigado por contribuir! 🎉
