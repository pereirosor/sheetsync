# SheetSync

VTT (Virtual Tabletop) para campanhas de RPG de mesa com painel do Mestre, criação de personagens, rastreador de iniciativa e sincronização em tempo real. Suporta múltiplos sistemas de jogo.

## Sistemas suportados

| Sistema | Status |
|---|---|
| **Tormenta 20** | Disponível |
| **Call of Cthulhu 7ª Ed.** (PT-BR Retropunk) | Disponível — eras 1920s e Moderna |
| D&D 5E | Em breve |
| Ordem Paranormal | Em breve |

---

## Funcionalidades

### Criação de campanha
- Seletor visual de sistema de jogo ao criar a campanha
- Código de 6 caracteres para convidar jogadores
- Configurações por campanha (sanidade, unidade de movimento, era para CoC)

### Tormenta 20

**Criação de personagem**
- Wizard passo a passo: raça → classe → origem → atributos → perícias → equipamentos → magias
- Aplicação automática de bônus de raça, habilidades de classe e perícias treinadas
- Escolha de poderes (Caminhos do Arcanista, Mago, Ilusionista etc.)
- Atributos por compra de pontos ou rolagem

**Ficha do jogador**
- Abas: Identidade, Atributos, Perícias, Equipamentos, Magias, Notas
- Upload de avatar
- Barras de HP / Mana / Sanidade com rastreamento visual
- Condições de T20 (Abalado, Lento, Paralisado…) com tooltips e efeito visual
- Rolagem de dados com log sincronizado com o Mestre
- Modal de combate (ataque + dano em um clique)
- Popup de rolagem de iniciativa (d20 + mod DES)
- Wizard de level-up: PV, poderes, magias novas, habilidades fixas de nível

**Sistema de morte**
- Máquina de estados: alive → dying → stabilized / dead
- Rolagens de salvaguarda de morte com rastreamento de sucessos/falhas
- DeathModal pós-morte com opções de substituir personagem ou abandonar a campanha

### Call of Cthulhu 7ª Ed.

**Criação de investigador**
- Três métodos: Dados (3D6×5), Distribuição Rápida (quickstart), Compra de Pontos
- 8 características: FOR, CON, TAM, DES, APA, INT, POD, EDU
- 39 ocupações com filtro por era (1920s / Moderna); cálculo automático de pontos de perícia
- 78 perícias com valores base e suporte a perícias dinâmicas (Esquivar = DES/2, Língua Nativa = EDU)
- Campos de background: ideologia, pessoa importante, lugar significativo, posse, traço pessoal

**Ficha do investigador**
- Aba de Características com valores normais, ½ e ⅕ para cada atributo
- Derivados automáticos: PV, PM, SAN, MOV, Bônus de Dano, Construção
- Aba de Perícias com rolagem d100 e cálculo automático de nível de sucesso (Extremo / Difícil / Regular / Falha / Fumble)
- Banners de estado: Morrendo, Inconsciente (Estável), Morto, Ferimento Grave, Insanidade Temporária / Indefinida

**Mecânicas de morte e sanidade**
- Check de morte por turno: d100 ≤ CON para sobreviver em 0 PV
- Ferimento Grave (dano único ≥ HP máx/2) — flag visual na ficha
- Perda de sanidade aplicada pelo Mestre via modal; insanidade temporária (≥ 5 pts) e indefinida (SAN = 0)

### Painel do Mestre (ambos os sistemas)

- Cards de jogadores com HP, condições e estado de morte
- Rastreador de iniciativa (T20: d20 + mod DES com rolagem dos jogadores; CoC: DES direto, sem rolagem)
- Rastreador de combate com ordem de turnos e controle de rodadas
- Descansos em massa (T20: Curto / Longo; CoC: Primeiros Socorros / Cura Natural)
- Perda de sanidade em massa (CoC)
- Liberação de level-up pelo Mestre (T20)
- NPCs/Monstros: criação, edição, toggle "Na cena"; modal específico por sistema
- Chat de campanha e rolador de dados
- Bloco de notas com múltiplas anotações e auto-save

---

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 18 + TypeScript (Vite) |
| Estado | Zustand |
| Backend / DB | Supabase (PostgreSQL) |
| Sync em tempo real | Supabase Realtime Broadcast |
| Deploy | GitHub Pages |

---

## Configuração

### 1. Clonar e instalar

```bash
git clone https://github.com/pereirosor/sheetsync.git
cd sheetsync
npm install
```

### 2. Configurar autenticação no Supabase

No painel do Supabase: **Authentication → Providers → Email** — deixe habilitado e **desligue "Confirm email"** para que o cadastro funcione sem depender de entrega de e-mail.

### 3. Criar tabelas no Supabase

Execute o conteúdo de **`supabase/schema.sql`** no **SQL Editor** do seu projeto. O arquivo cria as tabelas, habilita RLS com políticas completas, funções auxiliares (SECURITY DEFINER) e um trigger que mantém os arrays de nomes sincronizados.

```sql
campaigns        -- code (PK), owner_id (GM), game_system, settings (JSONB)
campaign_members -- (campaign_code, user_id)
characters       -- campaign_code, user_id, name, owner ('player'|'gm'), data JSONB
gm_notes         -- id, campaign_code, title, body
```

Se você já tem um banco existente com campanhas em Tormenta 20, rode a migration de adição da coluna:

```bash
-- supabase/migrations/0001_add_game_system.sql
alter table campaigns
  add column if not exists game_system text not null default 'tormenta20';
```

### 4. Variáveis de ambiente

Crie `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key-publica>
```

> Use a **anon key** (pública), não a `service_role`. Encontre em *Project Settings → API*.

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173/sheetsync/`.

---

## Como usar o multiplayer

1. Abra o app em qualquer dispositivo/navegador.
2. Clique em **Criar Campanha (Mestre)** — escolha o sistema de jogo e um código de 6 caracteres será gerado.
3. Compartilhe o código com os jogadores.
4. Os jogadores clicam em **Entrar em Campanha**, informam o código e criam seu personagem pelo wizard do sistema correspondente.
5. O painel do Mestre atualiza automaticamente conforme jogadores entram e editam suas fichas.
6. Qualquer alteração (atributos, HP, magias, equipamentos, condições) é sincronizada em tempo real entre todos os dispositivos.

---

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

Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` como **Repository Secrets** no GitHub.

---

## Arquitetura

| Caminho | Responsabilidade |
|---|---|
| `src/lib/supabase.ts` | Cliente Supabase |
| `src/types/index.ts` | Todas as interfaces TypeScript |
| `src/systems/index.ts` | Registry de sistemas (`SYSTEMS`, `SYSTEM_CATALOG`, `getSystem()`) |
| `src/systems/tormenta20/` | Dados de T20 em módulos: origens, raças, classes, perícias, poderes, equipamentos, magias |
| `src/systems/coc7e/` | Dados de CoC 7e: características, perícias, ocupações, fórmulas derivadas |
| `src/hooks/useActiveSystem.ts` | Hook que retorna o `GameSystem` da campanha ativa |
| `src/store/index.ts` | Zustand store — estado global, persistência Supabase, Realtime Broadcast |
| `src/components/SystemSelectorModal.tsx` | Seletor visual de sistema ao criar campanha |
| `src/components/creation/` | Wizard de criação T20 (8 passos) |
| `src/components/creation/coc/` | Wizard de criação CoC (5 passos) |
| `src/components/levelup/` | Wizard de level-up T20 |
| `src/components/sheet/` | Ficha de personagem T20 |
| `src/components/sheet/coc/` | Ficha de investigador CoC |
| `src/components/gm/` | Painel do Mestre (ambos os sistemas) |
| `src/components/gm/coc/` | Modais específicos de CoC (NPCs, iniciativa) |
| `src/components/ui/` | Componentes reutilizáveis (ProgressBar, Badge, Toast) |
| `supabase/schema.sql` | Schema completo do banco |
| `supabase/migrations/` | Migrations incrementais |
