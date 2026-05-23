# SheetSync

Ficha de Tormenta20 online com painel do Mestre, criação de personagens, rastreador de iniciativa e sincronização em tempo real.

## Funcionalidades

### Criação de personagem
- Wizard guiado passo a passo: raça → classe → origem → atributos → perícias → equipamentos → magias
- Aplicação automática de bônus de raça, habilidades de classe e perícias treinadas
- Escolha de poderes exclusivos do Caminho do Arcanista (Mago, Ilusionista, Necromante etc.)
- Suporte a atributos por compra de pontos ou rolagem

### Ficha do jogador
- Abas: Identidade, Atributos, Perícias, Equipamentos, Magias, Notas
- Upload de avatar do personagem
- Rastreador de HP/MP/SAN com barras visuais
- Condições de Tormenta20 (Abalado, Lento, Paralisado etc.) com efeito visual
- Rolagem de dados com log sincronizado com o Mestre
- Modal de rolagem de combate (ataque + dano em um clique)
- Popup de rolagem de iniciativa quando o Mestre inicia o combate
- Wizard de level-up: pontos de vida, poderes, magias novas e habilidades fixas de nível

### Painel do Mestre
- Visão de todos os jogadores com cards resumidos (HP, condições, nível)
- Rastreador de iniciativa: solicita rolagem aos jogadores, coleta resultados e ordena o combate
- Rastreador de combate com ordem de turnos
- Ações de descanso em massa (curto ou longo) para a cena inteira
- Chat de campanha fixo e rolador de dados do Mestre
- Bloco de notas com múltiplas anotações e auto-save
- Gerenciamento de NPCs (criar, editar ficha, adicionar à cena)
- Liberação de level-up: o Mestre sobe o nível e os jogadores recebem o wizard no cliente deles
- Configurações de campanha

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 18 + TypeScript (Vite) |
| Estado | Zustand |
| Backend / DB | Supabase (PostgreSQL) |
| Sync em tempo real | Supabase Realtime Broadcast |
| Deploy | GitHub Pages |

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) com um projeto criado

## Configuração

### 1. Clonar e instalar

```bash
git clone https://github.com/pereirosor/sheetsync.git
cd sheetsync
npm install
```

### 2. Criar tabelas no Supabase

Execute no **SQL Editor** do seu projeto Supabase:

```sql
create table campaigns (
  code              text primary key,
  created_at        bigint not null,
  settings          jsonb  not null default '{}',
  player_names      text[] not null default '{}',
  gm_character_names text[] not null default '{}'
);

create table characters (
  id             uuid primary key default gen_random_uuid(),
  campaign_code  text not null references campaigns(code) on delete cascade,
  name           text not null,
  owner          text not null,
  data           jsonb not null,
  unique (campaign_code, name)
);

create table gm_notes (
  id             uuid primary key default gen_random_uuid(),
  campaign_code  text not null references campaigns(code) on delete cascade,
  title          text not null default '',
  body           text not null default '',
  created_at     bigint not null
);
```

### 3. Variáveis de ambiente

Crie `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key-publica>
```

> Use a **anon key** (pública), não a `service_role`. Encontre em *Project Settings → API*.

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173/sheetsync/`.

## Como usar o multiplayer

1. Abra o app em qualquer dispositivo/navegador.
2. Clique em **Criar Campanha (Mestre)** — um código de 6 caracteres será gerado.
3. Compartilhe o código com os jogadores.
4. Os jogadores clicam em **Entrar em Campanha**, informam o código e criam seu personagem pelo wizard.
5. O painel do Mestre atualiza automaticamente conforme jogadores entram e editam suas fichas.
6. Qualquer alteração (atributos, HP, magias, equipamentos, condições) é sincronizada em tempo real entre todos os dispositivos.

## Deploy no GitHub Pages

```bash
npm run deploy
```

Ou via GitHub Actions — crie `.github/workflows/deploy.yml`:

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

Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` como **Repository Secrets** no GitHub para que o build funcione em CI.

## Arquitetura

| Caminho | Responsabilidade |
|---|---|
| `src/lib/supabase.ts` | Cliente Supabase (inicializado com variáveis de ambiente) |
| `src/types/index.ts` | Todas as interfaces TypeScript |
| `src/systems/tormenta20.ts` | Dados de T20: raças, classes, origens, divindades, equipamentos, magias, poderes |
| `src/store/index.ts` | Zustand store — estado global, persistência Supabase, Realtime Broadcast |
| `src/components/creation/` | Wizard de criação de personagem (8 passos) |
| `src/components/levelup/` | Wizard de level-up (HP, poderes, magias, habilidades fixas) |
| `src/components/sheet/` | Ficha de personagem com abas |
| `src/components/gm/` | Painel do Mestre: cards, iniciativa, combate, notas, NPCs |
| `src/components/ui/` | Componentes reutilizáveis (ProgressBar, Badge, Toast, AutocompleteInput) |
