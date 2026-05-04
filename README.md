# SheetSync

Fichas de RPG em tempo real para Tormenta 20, com sincronização entre abas via BroadcastChannel API.

## Stack

- React + TypeScript (Vite)
- Zustand (estado global)
- BroadcastChannel API (sincronização entre abas, sem servidor)
- localStorage (persistência)

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173/sheetsync/`.

## Como testar o multiplayer

1. Abra `http://localhost:5173/sheetsync/` na primeira aba.
2. Clique em **Criar Campanha (Mestre)** — anote o código de 6 caracteres.
3. Abra uma segunda aba no **mesmo navegador** com o mesmo endereço.
4. Clique em **Entrar em Campanha (Jogador)**, informe o código e um nome de personagem.
5. O painel do Mestre na primeira aba atualizará automaticamente.
6. Editar a ficha do jogador ou aplicar dano/descanso na aba do mestre sincroniza em tempo real.

> A sincronização usa BroadcastChannel, que funciona apenas entre abas do mesmo navegador na mesma origem.

## Deploy no GitHub Pages

1. Configure o `homepage` no `package.json` ou ajuste `base` no `vite.config.ts` para `/nome-do-repositorio/`.
2. Execute:

```bash
npm run deploy
```

Isso faz `npm run build` e publica a pasta `dist` na branch `gh-pages` via `gh-pages`.

### Via GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Arquitetura

| Caminho | Responsabilidade |
|---|---|
| `src/types/index.ts` | Todas as interfaces TypeScript |
| `src/systems/tormenta20.ts` | Config do sistema Tormenta 20 (implementa `GameSystem`) |
| `src/store/index.ts` | Zustand store — estado global, localStorage, BroadcastChannel |
| `src/hooks/useSync.ts` | Inicializa o canal de sincronização |
| `src/components/sheet/` | Ficha de personagem com abas |
| `src/components/gm/` | Painel do Mestre e cards de jogadores |
| `src/components/ui/` | Componentes reutilizáveis (ProgressBar, Badge, Toast) |

### Adicionar novos sistemas de RPG

Crie um novo arquivo em `src/systems/` implementando a interface `GameSystem`:

```typescript
import type { GameSystem } from '../types';

const dnd5e: GameSystem = {
  systemId: 'dnd5e',
  name: 'D&D 5e',
  classList: [...],
  skillList: [...],
  vitalFields: [...],
  shortRestFormula: (char) => ({ hp: /* hit dice */ }),
  longRestFormula: (char) => ({ hp: char.vitals.hp.max, ... }),
};

export default dnd5e;
```
