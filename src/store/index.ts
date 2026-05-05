import { create } from 'zustand';
import type {
  Campaign,
  CampaignSettings,
  Character,
  DiceRollEntry,
  GMCharacterFormData,
  Role,
  SyncMessage,
  ToastItem,
  VitalKey,
} from '../types';
import tormenta20 from '../systems/tormenta20';

const CHANNEL_NAME = 'sheetsync';
const SESSION_KEY = 'sheetsync_session';

const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const genId = () => Math.random().toString(36).slice(2, 9);

const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;

const saveCampaign = (c: Campaign) =>
  localStorage.setItem(`sheetsync_campaign_${c.code}`, JSON.stringify(c));

const loadCampaign = (code: string): Campaign | null => {
  const raw = localStorage.getItem(`sheetsync_campaign_${code}`);
  return raw ? (JSON.parse(raw) as Campaign) : null;
};

const saveCharacter = (ch: Character) =>
  localStorage.setItem(`sheetsync_player_${ch.campaignCode}_${ch.name}`, JSON.stringify(ch));

const normalizeCharacter = (ch: Character): Character => ({
  ...ch,
  owner: ch.owner ?? 'player',
  inScene: ch.inScene ?? false,
});

const loadCharacter = (campaignCode: string, name: string): Character | null => {
  const raw = localStorage.getItem(`sheetsync_player_${campaignCode}_${name}`);
  return raw ? normalizeCharacter(JSON.parse(raw) as Character) : null;
};

const loadAllCharacters = (campaign: Campaign): Record<string, Character> => {
  const chars: Record<string, Character> = {};
  for (const name of campaign.playerNames) {
    const ch = loadCharacter(campaign.code, name);
    if (ch) chars[name] = ch;
  }
  return chars;
};

const loadAllGMCharacters = (campaign: Campaign): Record<string, Character> => {
  const chars: Record<string, Character> = {};
  for (const name of (campaign.gmCharacterNames ?? [])) {
    const ch = loadCharacter(campaign.code, name);
    if (ch) chars[name] = ch;
  }
  return chars;
};

export const createDefaultCharacter = (campaignCode: string, name: string): Character => ({
  id: `${campaignCode}_${name}`,
  campaignCode,
  name,
  race: '',
  class: '',
  origin: '',
  level: 1,
  alignment: '',
  deity: '',
  size: 'Médio',
  speed: 9,
  vitals: {
    hp: { current: 10, max: 10 },
    mana: { current: 0, max: 0 },
    sanity: { current: 20, max: 20 },
    ac: 10,
  },
  attributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  skills: Object.fromEntries(tormenta20.skillList.map((s) => [s.id, false])),
  equipment: [],
  spells: [],
  notes: '',
  owner: 'player',
  inScene: false,
});

interface AppState {
  role: Role | null;
  pendingGMCode: string | null;
  campaign: Campaign | null;
  currentPlayerName: string | null;
  characters: Record<string, Character>;
  channel: BroadcastChannel | null;
  toasts: ToastItem[];
  diceLog: DiceRollEntry[];

  initChannel: () => void;
  createCampaign: () => void;
  confirmGMEntry: () => void;
  joinCampaign: (code: string, characterName: string) => 'ok' | 'not_found';
  leaveCampaign: () => void;
  updateCharacter: (name: string, updates: Partial<Character>) => void;
  updateVital: (characterName: string, field: VitalKey, delta: number) => void;
  setVitalMax: (characterName: string, field: VitalKey, max: number) => void;
  applyRest: (characterName: string, restType: 'short' | 'long') => void;
  updateSettings: (settings: Partial<CampaignSettings>) => void;
  handleSyncMessage: (msg: SyncMessage) => void;
  restoreSession: () => boolean;
  addToast: (message: string, type: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  createGMCharacter: (data: GMCharacterFormData) => void;
  updateGMCharacter: (originalName: string, data: GMCharacterFormData) => void;
  deleteGMCharacter: (name: string) => void;
  toggleNPCInScene: (name: string) => void;
  rollDice: (entry: Omit<DiceRollEntry, 'id' | 'timestamp'>) => void;
}

export const useStore = create<AppState>((set, get) => ({
  role: null,
  pendingGMCode: null,
  campaign: null,
  currentPlayerName: null,
  characters: {},
  channel: null,
  toasts: [],
  diceLog: [],

  initChannel: () => {
    if (get().channel) return;
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = (e) => get().handleSyncMessage(e.data as SyncMessage);
    set({ channel: ch });
  },

  createCampaign: () => {
    const code = generateCode();
    const campaign: Campaign = {
      code,
      createdAt: Date.now(),
      settings: { sanityEnabled: false, speedUnit: 'squares' },
      playerNames: [],
      gmCharacterNames: [],
    };
    saveCampaign(campaign);
    set({ campaign, pendingGMCode: code, characters: {} });
  },

  confirmGMEntry: () => {
    const { pendingGMCode } = get();
    if (!pendingGMCode) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role: 'gm', campaignCode: pendingGMCode }));
    set({ role: 'gm', pendingGMCode: null });
  },

  joinCampaign: (code: string, characterName: string) => {
    const campaign = loadCampaign(code);
    if (!campaign) return 'not_found';

    let character = loadCharacter(code, characterName);
    if (!character) character = createDefaultCharacter(code, characterName);

    if (!campaign.playerNames.includes(characterName)) {
      campaign.playerNames = [...campaign.playerNames, characterName];
      saveCampaign(campaign);
    }
    saveCharacter(character);

    const playerChars = loadAllCharacters(campaign);
    const gmChars = loadAllGMCharacters(campaign);
    const characters = { ...playerChars, ...gmChars };

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ role: 'player', campaignCode: code, characterName }),
    );
    set({ campaign, role: 'player', currentPlayerName: characterName, characters });

    const ch = get().channel;
    if (ch) {
      const msg: SyncMessage = { type: 'PLAYER_JOIN', payload: { campaignCode: code, character } };
      ch.postMessage(msg);
    }

    return 'ok';
  },

  leaveCampaign: () => {
    get().channel?.close();
    sessionStorage.removeItem(SESSION_KEY);
    set({ role: null, campaign: null, currentPlayerName: null, characters: {}, channel: null });
  },

  updateCharacter: (name: string, updates: Partial<Character>) => {
    const { characters, campaign, channel } = get();
    const existing = characters[name];
    if (!existing) return;
    const updated = { ...existing, ...updates };
    saveCharacter(updated);
    set({ characters: { ...characters, [name]: updated } });
    if (channel && campaign) {
      const msg: SyncMessage = {
        type: 'SHEET_UPDATE',
        payload: { campaignCode: campaign.code, character: updated },
      };
      channel.postMessage(msg);
    }
  },

  updateVital: (characterName: string, field: VitalKey, delta: number) => {
    const { characters, campaign, channel } = get();
    const char = characters[characterName];
    if (!char) return;
    const vital = char.vitals[field];
    const newCurrent = Math.max(0, Math.min(vital.max, vital.current + delta));
    const updated: Character = {
      ...char,
      vitals: { ...char.vitals, [field]: { ...vital, current: newCurrent } },
    };
    saveCharacter(updated);
    set({ characters: { ...characters, [characterName]: updated } });
    if (channel && campaign) {
      const msg: SyncMessage = {
        type: 'GM_VITAL_UPDATE',
        payload: { campaignCode: campaign.code, characterName, field, delta },
      };
      channel.postMessage(msg);
    }
  },

  setVitalMax: (characterName: string, field: VitalKey, max: number) => {
    const { characters } = get();
    const char = characters[characterName];
    if (!char) return;
    const vital = char.vitals[field];
    const updated: Character = {
      ...char,
      vitals: {
        ...char.vitals,
        [field]: { current: Math.min(vital.current, max), max },
      },
    };
    get().updateCharacter(characterName, { vitals: updated.vitals });
  },

  applyRest: (characterName: string, restType: 'short' | 'long') => {
    const { characters, campaign, channel } = get();
    const char = characters[characterName];
    if (!char || !campaign) return;

    const gains =
      restType === 'long'
        ? tormenta20.longRestFormula(char, campaign)
        : tormenta20.shortRestFormula(char, campaign);

    const newVitals = { ...char.vitals };
    for (const [k, v] of Object.entries(gains) as [VitalKey, number][]) {
      if (v === undefined) continue;
      const vital = newVitals[k];
      newVitals[k] =
        restType === 'long'
          ? { ...vital, current: Math.min(vital.max, v) }
          : { ...vital, current: Math.min(vital.max, vital.current + v) };
    }

    const updated = { ...char, vitals: newVitals };
    saveCharacter(updated);
    set({ characters: { ...characters, [characterName]: updated } });

    if (channel) {
      const msg: SyncMessage = {
        type: 'REST_APPLIED',
        payload: { campaignCode: campaign.code, characterName, restType },
      };
      channel.postMessage(msg);
    }
  },

  updateSettings: (settings: Partial<CampaignSettings>) => {
    const { campaign, channel } = get();
    if (!campaign) return;
    const updated = { ...campaign, settings: { ...campaign.settings, ...settings } };
    saveCampaign(updated);
    set({ campaign: updated });
    if (channel) {
      const msg: SyncMessage = {
        type: 'CAMPAIGN_SETTINGS_UPDATE',
        payload: { campaignCode: campaign.code, settings: updated.settings },
      };
      channel.postMessage(msg);
    }
  },

  handleSyncMessage: (msg: SyncMessage) => {
    const { campaign, characters, role, addToast } = get();
    if (!campaign) return;
    if (msg.payload.campaignCode !== campaign.code) return;

    switch (msg.type) {
      case 'PLAYER_JOIN': {
        const char = msg.payload.character;
        // Não sobrescrever NPC/Monstro do mestre com jogador de mesmo nome
        if (characters[char.name]?.owner === 'gm') break;
        const updatedCampaign: Campaign = {
          ...campaign,
          playerNames: campaign.playerNames.includes(char.name)
            ? campaign.playerNames
            : [...campaign.playerNames, char.name],
        };
        saveCampaign(updatedCampaign);
        saveCharacter(char);
        set({ campaign: updatedCampaign, characters: { ...characters, [char.name]: char } });
        if (role === 'gm') addToast(`${char.name} entrou na campanha!`, 'info');
        break;
      }
      case 'SHEET_UPDATE': {
        const char = msg.payload.character;
        saveCharacter(char);
        set({ characters: { ...characters, [char.name]: char } });
        break;
      }
      case 'GM_VITAL_UPDATE': {
        if (role !== 'player') break;
        const { characterName, field, delta } = msg.payload;
        const char = characters[characterName];
        if (!char) break;
        const vital = char.vitals[field];
        const newCurrent = Math.max(0, Math.min(vital.max, vital.current + delta));
        const updated = {
          ...char,
          vitals: { ...char.vitals, [field]: { ...vital, current: newCurrent } },
        };
        saveCharacter(updated);
        set({ characters: { ...characters, [characterName]: updated } });
        const label = field === 'hp' ? 'PV' : field === 'mana' ? 'Mana' : 'Sanidade';
        if (delta < 0)
          addToast(`Mestre aplicou ${Math.abs(delta)} de dano (${label})`, 'damage');
        else addToast(`Mestre recuperou ${delta} de ${label}`, 'heal');
        break;
      }
      case 'REST_APPLIED': {
        if (role !== 'player') break;
        const { characterName, restType } = msg.payload;
        const char = characters[characterName];
        if (!char) break;
        const gains =
          restType === 'long'
            ? tormenta20.longRestFormula(char, campaign)
            : tormenta20.shortRestFormula(char, campaign);
        const newVitals = { ...char.vitals };
        for (const [k, v] of Object.entries(gains) as [VitalKey, number][]) {
          if (v === undefined) continue;
          const vital = newVitals[k];
          newVitals[k] =
            restType === 'long'
              ? { ...vital, current: Math.min(vital.max, v) }
              : { ...vital, current: Math.min(vital.max, vital.current + v) };
        }
        const updated = { ...char, vitals: newVitals };
        saveCharacter(updated);
        set({ characters: { ...characters, [characterName]: updated } });
        addToast(restType === 'long' ? 'Descanso longo aplicado!' : 'Descanso curto aplicado!', 'heal');
        break;
      }
      case 'CAMPAIGN_SETTINGS_UPDATE': {
        const updated = { ...campaign, settings: msg.payload.settings };
        saveCampaign(updated);
        set({ campaign: updated });
        break;
      }
      case 'DICE_ROLL': {
        const { rollerName, label, diceExpr, breakdown, total } = msg.payload;
        const entry: DiceRollEntry = { id: genId(), rollerName, label, diceExpr, breakdown, total, timestamp: Date.now() };
        set((s) => ({ diceLog: [entry, ...s.diceLog].slice(0, 100) }));
        break;
      }
    }
  },

  restoreSession: () => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw) as {
      role: Role;
      campaignCode: string;
      characterName?: string;
    };
    const campaign = loadCampaign(session.campaignCode);
    if (!campaign) return false;
    const playerChars = loadAllCharacters(campaign);
    const gmChars = loadAllGMCharacters(campaign);
    set({
      role: session.role,
      campaign,
      characters: { ...playerChars, ...gmChars },
      currentPlayerName: session.characterName ?? null,
    });
    return true;
  },

  createGMCharacter: (data: GMCharacterFormData) => {
    const { campaign, characters } = get();
    if (!campaign) return;
    const allNames = [...campaign.playerNames, ...(campaign.gmCharacterNames ?? [])];
    if (allNames.includes(data.name)) {
      get().addToast(`Já existe um personagem com o nome "${data.name}".`, 'warning');
      return;
    }
    const ch: Character = {
      id: `${campaign.code}_gm_${data.name}`,
      campaignCode: campaign.code,
      name: data.name,
      race: data.race,
      class: data.charClass,
      origin: data.npcType,
      level: data.level,
      alignment: '',
      deity: '',
      size: 'Médio',
      speed: data.speed,
      vitals: {
        hp: { current: data.hpMax, max: data.hpMax },
        mana: { current: data.manaMax, max: data.manaMax },
        sanity: { current: 20, max: 20 },
        ac: data.ac,
      },
      attributes: {
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
      },
      skills: Object.fromEntries(tormenta20.skillList.map((s) => [s.id, false])),
      equipment: [],
      spells: [],
      notes: '',
      actions: data.actions,
      items: data.items,
      owner: 'gm',
      inScene: false,
    };
    const updatedCampaign: Campaign = {
      ...campaign,
      gmCharacterNames: [...(campaign.gmCharacterNames ?? []), data.name],
    };
    saveCampaign(updatedCampaign);
    saveCharacter(ch);
    set({ campaign: updatedCampaign, characters: { ...characters, [data.name]: ch } });
  },

  updateGMCharacter: (originalName: string, data: GMCharacterFormData) => {
    const { campaign, characters } = get();
    if (!campaign) return;
    const existing = characters[originalName];
    if (!existing) return;
    if (data.name !== originalName) {
      const allNames = [...campaign.playerNames, ...(campaign.gmCharacterNames ?? [])];
      if (allNames.includes(data.name)) {
        get().addToast(`Já existe um personagem com o nome "${data.name}".`, 'warning');
        return;
      }
      localStorage.removeItem(`sheetsync_player_${campaign.code}_${originalName}`);
    }
    const updated: Character = {
      ...existing,
      name: data.name,
      race: data.race,
      class: data.charClass,
      origin: data.npcType,
      level: data.level,
      speed: data.speed,
      vitals: {
        ...existing.vitals,
        hp: { current: Math.min(existing.vitals.hp.current, data.hpMax), max: data.hpMax },
        mana: { current: Math.min(existing.vitals.mana.current, data.manaMax), max: data.manaMax },
        ac: data.ac,
      },
      attributes: {
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
      },
      actions: data.actions,
      items: data.items,
    };
    const gmNames = (campaign.gmCharacterNames ?? []).map((n) =>
      n === originalName ? data.name : n,
    );
    const updatedCampaign = { ...campaign, gmCharacterNames: gmNames };
    saveCampaign(updatedCampaign);
    saveCharacter(updated);
    const newChars = { ...characters };
    if (data.name !== originalName) delete newChars[originalName];
    newChars[data.name] = updated;
    set({ campaign: updatedCampaign, characters: newChars });
  },

  deleteGMCharacter: (name: string) => {
    const { campaign, characters } = get();
    if (!campaign) return;
    localStorage.removeItem(`sheetsync_player_${campaign.code}_${name}`);
    const updatedCampaign: Campaign = {
      ...campaign,
      gmCharacterNames: (campaign.gmCharacterNames ?? []).filter((n) => n !== name),
    };
    saveCampaign(updatedCampaign);
    const newChars = { ...characters };
    delete newChars[name];
    set({ campaign: updatedCampaign, characters: newChars });
  },

  toggleNPCInScene: (name: string) => {
    const { characters } = get();
    const char = characters[name];
    if (!char || char.owner !== 'gm') return;
    const updated = { ...char, inScene: !char.inScene };
    saveCharacter(updated);
    set({ characters: { ...characters, [name]: updated } });
  },

  addToast: (message: string, type: ToastItem['type']) => {
    const id = genId();
    const toast: ToastItem = { id, message, type };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    setTimeout(() => get().removeToast(id), 4500);
  },

  removeToast: (id: string) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  rollDice: (entry) => {
    const { campaign, channel, addToast } = get();
    if (!campaign) return;
    const full: DiceRollEntry = { ...entry, id: genId(), timestamp: Date.now() };
    set((s) => ({ diceLog: [full, ...s.diceLog].slice(0, 100) }));
    addToast(`${entry.label}: ${entry.breakdown} = ${entry.total}`, 'info');
    if (channel) {
      const msg: SyncMessage = {
        type: 'DICE_ROLL',
        payload: { campaignCode: campaign.code, rollerName: entry.rollerName, label: entry.label, diceExpr: entry.diceExpr, breakdown: entry.breakdown, total: entry.total },
      };
      channel.postMessage(msg);
    }
  },
}));
