# SheetSync

Fichas de personagem para **Tormenta 20** com sincronização em tempo real entre dispositivos, via Supabase.

## Funcionalidades

- **Painel do Mestre** — cria campanhas, visualiza e edita fichas de todos os jogadores em tempo real
- **Ficha completa de personagem** — atributos, HP/MP, perícias, habilidades de classe, magias, equipamentos
- **Seleção de raça, classe e origem** — com aplicação automática de bônus, habilidades e perícias treinadas
- **Referência integrada** — painéis de consulta de raças, classes e divindades de T20
- **Equipamentos e magias** — autocomplete com dados do sistema e referência rápida
- **Log de dados** — rolagem de dados sincronizada entre Mestre e jogadores
- **Sincronização online** — cross-device via Supabase Realtime; funciona em celular, tablet e PC simultaneamente

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
  code        text primary key,
  created_at  bigint not null,
  settings    jsonb  not null default '{}',
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
4. Os jogadores clicam em **Entrar em Campanha**, informam o código e um nome de personagem.
5. O painel do Mestre atualiza automaticamente conforme jogadores entram e editam suas fichas.
6. Qualquer alteração (atributos, HP, magias, equipamentos) é sincronizada em tempo real entre todos os dispositivos.

> Diferente da versão anterior, a sincronização funciona **entre dispositivos e navegadores diferentes** — não apenas entre abas do mesmo navegador.

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
| `src/systems/tormenta20.ts` | Dados de T20: raças, classes, origens, divindades, equipamentos, magias |
| `src/store/index.ts` | Zustand store — estado global, persistência Supabase, Realtime Broadcast |
| `src/hooks/useSync.ts` | Inicializa o canal Realtime quando há campanha ativa |
| `src/components/sheet/` | Ficha de personagem com abas |
| `src/components/gm/` | Painel do Mestre e cards de jogadores |
| `src/components/ui/` | Componentes reutilizáveis (ProgressBar, Badge, Toast) |
