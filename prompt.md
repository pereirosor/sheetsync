Construa um aplicativo web chamado **SheetSync** para gerenciamento de campanhas de RPG de mesa, focado no sistema Tormenta20, com arquitetura extensível para sistemas futuros.

---

## Stack Tecnológico
- React + TypeScript (Vite)
- localStorage para persistência (fase de protótipo)
- BroadcastChannel API para sincronização em tempo real entre abas (simula multiplayer sem servidor)
- Sem autenticação — identidade estabelecida por código de campanha e seleção de papel
- Configure o projeto para deploy no GitHub Pages via `gh-pages` ou GitHub Actions, com o `base` correto no vite.config.ts

---

## Conceitos Principais

### Papéis
- **Mestre:** Cria a campanha, recebe um código único, acessa o painel do mestre com visão de todos os jogadores
- **Jogador:** Entra na campanha via código, preenche a ficha do personagem e a submete

### Fluxo de Campanha
1. Página inicial com dois botões: "Criar Campanha (Mestre)" e "Entrar em Campanha (Jogador)"
2. Mestre cria a campanha → recebe um código alfanumérico de 6 caracteres (ex: `AB3X9K`) → entra no painel do mestre
3. Jogador digita o código da campanha + nome do personagem → preenche a ficha → submete
4. O painel do mestre atualiza em tempo real quando um jogador entra ou altera a ficha

---

## Ficha de Personagem — Tormenta20 (Completa)

A ficha do jogador deve cobrir tudo abaixo, organizado em abas ou seções:

### 1. Identidade
- Nome, Raça, Classe (dropdown: Arcanista, Bárbaro, Bardo, Clérigo, Druida, Guerreiro, Inventor, Ladino, Paladino, Ranger, Lutador, Nobre, Caçador de Monstros — lista extensível), Origem, Nível, Tendência, Divindade, Tamanho, Deslocamento

### 2. Estatísticas Vitais (campos controlados pelo Mestre)
- **Pontos de Vida:** atual / máximo
- **Mana:** atual / máximo (algumas classes têm 0 de mana — tratar adequadamente)
- **Sanidade:** atual / máximo (campo opcional, ativado por campanha pelo Mestre)
- **Classe de Armadura (CA)**
- **Deslocamento** (em quadrados ou metros, configurável)

### 3. Atributos
- Força, Destreza, Constituição, Inteligência, Sabedoria, Carisma
- Cada um com: valor base + modificador (calculado automaticamente: piso((valor - 10) / 2))

### 4. Perícias
Lista completa de perícias do T20 com: checkbox de treinamento, atributo vinculado, bônus total (calculado automaticamente a partir do modificador + bônus de treinamento).
Perícias: Acrobacia, Adestramento, Atletismo, Atuação, Cavalgar, Conhecimento (Arcano, da Natureza, das Dungeons, do Plano Espiritual, Nobre, Religioso), Cura, Diplomacia, Enganação, Fortitude, Furtividade, Guerra, Iniciativa, Intimidação, Intuição, Investigação, Jogatina, Ladinagem, Luta, Misticismo, Nobreza, Ofício, Percepção, Pilotagem, Pontaria, Reflexos, Religião, Sobrevivência, Vontade

### 5. Equipamentos
- Lista de itens: Nome, Tipo (Arma / Armadura / Item), Bônus ou Dano, Peso, Notas
- Adicionar e remover linhas
- Rastreador de peso total vs. capacidade de carga (baseado em Força)

### 6. Magias e Habilidades
- Lista de magias e habilidades: Nome, Círculo ou Nível, Custo de Mana, Escola, Alcance, Duração, Descrição
- Adicionar e remover linhas

### 7. Notas Gerais
- Campo de texto livre

---

## Painel do Mestre

O Mestre visualiza um card por jogador contendo:
- Nome do Personagem, Raça, Classe, Nível
- **Barra de PV** (barra de progresso visual, atual/máximo)
- **Barra de Mana** (se aplicável)
- **Barra de Sanidade** (se habilitada na campanha)
- CA e Deslocamento exibidos como badges

### Controles do Mestre por Card de Jogador
**Manipulação direta:**
- Botões [ -5 ] [ -1 ] [ PV ] [ +1 ] [ +5 ] para PV (e os mesmos para Mana e Sanidade)
- Campo de entrada personalizado: "Aplicar dano/cura" com alternância +/− e botão de confirmar

**Indireta (descansos):**
- Botão "Descanso Curto": recupera PV por (nível do personagem × modificador de Constituição, mínimo 1) e Mana por (nível × modificador do atributo relevante, mínimo 1) — conforme regras padrão de T20
- Botão "Descanso Longo": recupera PV e Mana totalmente ao máximo

### Configurações da Campanha (somente Mestre)
- Ativar/desativar Sanidade para a campanha (propaga para todas as fichas)
- Exibir o código da campanha para compartilhar com os jogadores
- Botão "Encerrar Campanha"

---

## Sincronização em Tempo Real

Usar a BroadcastChannel API como mecanismo de sincronização para este protótipo (funciona entre abas do mesmo navegador).

- Todas as mudanças de estado (jogador entra, edição de ficha, alterações de PV pelo Mestre) disparam uma mensagem tipada
- Tipos de mensagem: `PLAYER_JOIN`, `SHEET_UPDATE`, `GM_VITAL_UPDATE`, `REST_APPLIED`, `CAMPAIGN_SETTINGS_UPDATE`
- Estado persistido no localStorage com as chaves: `sheetsync_campaign_{codigo}` e `sheetsync_player_{codigo}_{nomePersonagem}`

---

## Notas de Arquitetura (para extensibilidade)

- Definir uma interface `GameSystem` com: `systemId`, `skillList`, `classList`, `vitalFields`, `shortRestFormula`, `longRestFormula`
- Tormenta20 é a primeira implementação dessa interface
- Os componentes da ficha devem ler a partir da config do `GameSystem` ativo, sem hardcode de valores do T20
- Isso permite adicionar D&D 5e, One Piece RPG, Daggerheart etc. futuramente apenas criando uma nova config de sistema

---

## Requisitos de UI/UX
- Tema escuro por padrão (estética de RPG — azuis escuros e pretos com detalhes em âmbar/dourado)
- Interface responsiva para mobile (jogadores frequentemente usam celular na mesa)
- Seções da ficha em layout de abas para evitar scroll excessivo
- Painel do Mestre em grade de cards responsiva
- Barras de PV e Mana com animação ao mudar
- Exibir toast/notificação quando o Mestre aplicar dano ou descanso a um jogador

---

## Entregáveis
- `/src/systems/tormenta20.ts` — config do sistema T20
- `/src/types/` — todas as interfaces TypeScript (Character, Campaign, GameSystem, VitalUpdate, etc.)
- `/src/store/` — gerenciamento de estado (Zustand ou React Context + useReducer)
- `/src/components/sheet/` — ficha de personagem com abas
- `/src/components/gm/` — painel do mestre e cards de jogadores
- `/src/hooks/useSync.ts` — lógica de sincronização via BroadcastChannel
- `/src/hooks/useCampaign.ts` — lógica de entrar/criar campanha
- `README.md` — como rodar o projeto, como testar o multiplayer (abrir duas abas) e como fazer o deploy no GitHub Pages