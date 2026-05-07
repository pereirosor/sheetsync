import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
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
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'sheetsync_session';

const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const genId = () => Math.random().toString(36).slice(2, 9);

const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;

// ── Persistence (Supabase) ────────────────────────────────────────────────────

async function saveCampaign(c: Campaign): Promise<void> {
  await supabase.from('campaigns').upsert({
    code: c.code,
    created_at: c.createdAt,
    settings: c.settings,
    player_names: c.playerNames,
    gm_character_names: c.gmCharacterNames,
  });
}

async function loadCampaign(code: string): Promise<Campaign | null> {
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('code', code)
    .single();
  if (!data) return null;
  return {
    code: data.code as string,
    createdAt: data.created_at as number,
    settings: data.settings as CampaignSettings,
    playerNames: (data.player_names as string[]) ?? [],
    gmCharacterNames: (data.gm_character_names as string[]) ?? [],
  };
}

async function saveCharacter(ch: Character): Promise<void> {
  await supabase.from('characters').upsert(
    { campaign_code: ch.campaignCode, name: ch.name, owner: ch.owner, data: ch },
    { onConflict: 'campaign_code,name' },
  );
}

const normalizeCharacter = (ch: Character): Character => ({
  ...ch,
  owner: ch.owner ?? 'player',
  inScene: ch.inScene ?? false,
  originBenefits: ch.originBenefits ?? [],
});

async function loadAllCharacters(campaign: Campaign): Promise<Record<string, Character>> {
  const { data } = await supabase
    .from('characters')
    .select('data')
    .eq('campaign_code', campaign.code)
    .eq('owner', 'player');
  if (!data) return {};
  return Object.fromEntries(
    (data as { data: Character }[]).map((r) => [r.data.name, normalizeCharacter(r.data)]),
  );
}

async function loadAllGMCharacters(campaign: Campaign): Promise<Record<string, Character>> {
  const { data } = await supabase
    .from('characters')
    .select('data')
    .eq('campaign_code', campaign.code)
    .eq('owner', 'gm');
  if (!data) return {};
  return Object.fromEntries(
    (data as { data: Character }[]).map((r) => [r.data.name, normalizeCharacter(r.data)]),
  );
}

// ── Default character factory ─────────────────────────────────────────────────

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
  originBenefits: [],
  owner: 'player',
  inScene: false,
});

// ── Store ─────────────────────────────────────────────────────────────────────

interface AppState {
  role: Role | null;
  loading: boolean;
  pendingGMCode: string | null;
  campaign: Campaign | null;
  currentPlayerName: string | null;
  characters: Record<string, Character>;
  channel: RealtimeChannel | null;
  toasts: ToastItem[];
  diceLog: DiceRollEntry[];

  initChannel: (campaignCode: string) => void;
  createCampaign: () => Promise<void>;
  confirmGMEntry: () => Promise<void>;
  joinCampaign: (code: string, characterName: string) => Promise<'ok' | 'not_found'>;
  leaveCampaign: () => void;
  updateCharacter: (name: string, updates: Partial<Character>) => void;
  updateVital: (characterName: string, field: VitalKey, delta: number) => void;
  setVitalMax: (characterName: string, field: VitalKey, max: number) => void;
  applyRest: (characterName: string, restType: 'short' | 'long') => void;
  updateSettings: (settings: Partial<CampaignSettings>) => void;
  handleSyncMessage: (msg: SyncMessage) => void;
  restoreSession: () => Promise<void>;
  addToast: (message: string, type: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  createGMCharacter: (data: GMCharacterFormData) => void;
  updateGMCharacter: (originalName: string, data: GMCharacterFormData) => void;
  deleteGMCharacter: (name: string) => void;
  deleteCampaign: () => void;
  toggleNPCInScene: (name: string) => void;
  rollDice: (entry: Omit<DiceRollEntry, 'id' | 'timestamp'>) => void;
}

const buildChannel = (campaignCode: string, onMessage: (msg: SyncMessage) => void) =>
  supabase
    .channel(`campaign:${campaignCode}`)
    .on('broadcast', { event: 'sync' }, ({ payload }) => onMessage(payload as SyncMessage));

const broadcast = (channel: RealtimeChannel | null, msg: SyncMessage) => {
  if (!channel) return;
  void channel.send({ type: 'broadcast', event: 'sync', payload: msg });
};

export const useStore = create<AppState>((set, get) => ({
  role: null,
  loading: true,
  pendingGMCode: null,
  campaign: null,
  currentPlayerName: null,
  characters: {},
  channel: null,
  toasts: [],
  diceLog: [],

  initChannel: (campaignCode: string) => {
    if (get().channel) return;
    const ch = buildChannel(campaignCode, (msg) => get().handleSyncMessage(msg)).subscribe();
    set({ channel: ch });
  },

  createCampaign: async () => {
    const code = generateCode();
    const campaign: Campaign = {
      code,
      createdAt: Date.now(),
      settings: { sanityEnabled: false, speedUnit: 'squares' },
      playerNames: [],
      gmCharacterNames: [],
    };
    await saveCampaign(campaign);
    set({ campaign, pendingGMCode: code, characters: {} });
  },

  confirmGMEntry: async () => {
    const { pendingGMCode, campaign } = get();
    if (!pendingGMCode || !campaign) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role: 'gm', campaignCode: pendingGMCode }));
    set({ role: 'gm', pendingGMCode: null });
    const [playerChars, gmChars] = await Promise.all([
      loadAllCharacters(campaign),
      loadAllGMCharacters(campaign),
    ]);
    set({ characters: { ...playerChars, ...gmChars } });
  },

  joinCampaign: async (code: string, characterName: string) => {
    const campaign = await loadCampaign(code);
    if (!campaign) return 'not_found';

    let character = null;
    const { data: existing } = await supabase
      .from('characters')
      .select('data')
      .eq('campaign_code', code)
      .eq('name', characterName)
      .single();
    character = existing ? normalizeCharacter(existing.data as Character) : createDefaultCharacter(code, characterName);

    if (!campaign.playerNames.includes(characterName)) {
      campaign.playerNames = [...campaign.playerNames, characterName];
      await saveCampaign(campaign);
    }
    await saveCharacter(character);

    const [playerChars, gmChars] = await Promise.all([
      loadAllCharacters(campaign),
      loadAllGMCharacters(campaign),
    ]);
    const characters = { ...playerChars, ...gmChars };

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ role: 'player', campaignCode: code, characterName }),
    );

    const joinedCharacter = character;
    const ch = buildChannel(code, (msg) => get().handleSyncMessage(msg)).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        const msg: SyncMessage = {
          type: 'PLAYER_JOIN',
          payload: { campaignCode: code, character: joinedCharacter },
        };
        void ch.send({ type: 'broadcast', event: 'sync', payload: msg });
      }
    });

    set({ campaign, role: 'player', currentPlayerName: characterName, characters, channel: ch });
    return 'ok';
  },

  leaveCampaign: () => {
    const ch = get().channel;
    if (ch) void supabase.removeChannel(ch);
    sessionStorage.removeItem(SESSION_KEY);
    set({ role: null, campaign: null, currentPlayerName: null, characters: {}, channel: null });
  },

  updateCharacter: (name: string, updates: Partial<Character>) => {
    const { characters, campaign, channel } = get();
    const existing = characters[name];
    if (!existing) return;
    const updated = { ...existing, ...updates };
    void saveCharacter(updated);
    set({ characters: { ...characters, [name]: updated } });
    if (campaign) {
      broadcast(channel, { type: 'SHEET_UPDATE', payload: { campaignCode: campaign.code, character: updated } });
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
    void saveCharacter(updated);
    set({ characters: { ...characters, [characterName]: updated } });
    if (campaign) {
      broadcast(channel, { type: 'GM_VITAL_UPDATE', payload: { campaignCode: campaign.code, characterName, field, delta } });
    }
  },

  setVitalMax: (characterName: string, field: VitalKey, max: number) => {
    const { characters } = get();
    const char = characters[characterName];
    if (!char) return;
    const vital = char.vitals[field];
    get().updateCharacter(characterName, {
      vitals: { ...char.vitals, [field]: { current: Math.min(vital.current, max), max } },
    });
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
    void saveCharacter(updated);
    set({ characters: { ...characters, [characterName]: updated } });
    broadcast(channel, { type: 'REST_APPLIED', payload: { campaignCode: campaign.code, characterName, restType } });
  },

  updateSettings: (settings: Partial<CampaignSettings>) => {
    const { campaign, channel } = get();
    if (!campaign) return;
    const updated = { ...campaign, settings: { ...campaign.settings, ...settings } };
    void saveCampaign(updated);
    set({ campaign: updated });
    broadcast(channel, { type: 'CAMPAIGN_SETTINGS_UPDATE', payload: { campaignCode: campaign.code, settings: updated.settings } });
  },

  handleSyncMessage: (msg: SyncMessage) => {
    const { campaign, characters, role, addToast } = get();
    if (!campaign || msg.payload.campaignCode !== campaign.code) return;

    switch (msg.type) {
      case 'PLAYER_JOIN': {
        const char = msg.payload.character;
        if (characters[char.name]?.owner === 'gm') break;
        const updatedCampaign: Campaign = {
          ...campaign,
          playerNames: campaign.playerNames.includes(char.name)
            ? campaign.playerNames
            : [...campaign.playerNames, char.name],
        };
        void saveCampaign(updatedCampaign);
        set({ campaign: updatedCampaign, characters: { ...characters, [char.name]: char } });
        if (role === 'gm') addToast(`${char.name} entrou na campanha!`, 'info');
        break;
      }
      case 'SHEET_UPDATE': {
        const char = msg.payload.character;
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
        const updated = { ...char, vitals: { ...char.vitals, [field]: { ...vital, current: newCurrent } } };
        set({ characters: { ...characters, [characterName]: updated } });
        const label = field === 'hp' ? 'PV' : field === 'mana' ? 'Mana' : 'Sanidade';
        if (delta < 0) addToast(`Mestre aplicou ${Math.abs(delta)} de dano (${label})`, 'damage');
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
        set({ characters: { ...characters, [characterName]: { ...char, vitals: newVitals } } });
        addToast(restType === 'long' ? 'Descanso longo aplicado!' : 'Descanso curto aplicado!', 'heal');
        break;
      }
      case 'CAMPAIGN_SETTINGS_UPDATE': {
        set({ campaign: { ...campaign, settings: msg.payload.settings } });
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

  restoreSession: async () => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) { set({ loading: false }); return; }
    const session = JSON.parse(raw) as { role: Role; campaignCode: string; characterName?: string };
    const campaign = await loadCampaign(session.campaignCode);
    if (!campaign) { sessionStorage.removeItem(SESSION_KEY); set({ loading: false }); return; }
    const [playerChars, gmChars] = await Promise.all([
      loadAllCharacters(campaign),
      loadAllGMCharacters(campaign),
    ]);
    set({
      role: session.role,
      campaign,
      characters: { ...playerChars, ...gmChars },
      currentPlayerName: session.characterName ?? null,
      loading: false,
    });
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
      originBenefits: [],
      actions: data.actions,
      items: data.items,
      owner: 'gm',
      inScene: false,
    };
    const updatedCampaign: Campaign = {
      ...campaign,
      gmCharacterNames: [...(campaign.gmCharacterNames ?? []), data.name],
    };
    void saveCampaign(updatedCampaign);
    void saveCharacter(ch);
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
      void supabase.from('characters')
        .delete()
        .eq('campaign_code', campaign.code)
        .eq('name', originalName);
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
    const gmNames = (campaign.gmCharacterNames ?? []).map((n) => (n === originalName ? data.name : n));
    const updatedCampaign = { ...campaign, gmCharacterNames: gmNames };
    void saveCampaign(updatedCampaign);
    void saveCharacter(updated);
    const newChars = { ...characters };
    if (data.name !== originalName) delete newChars[originalName];
    newChars[data.name] = updated;
    set({ campaign: updatedCampaign, characters: newChars });
  },

  deleteGMCharacter: (name: string) => {
    const { campaign, characters } = get();
    if (!campaign) return;
    void supabase.from('characters').delete().eq('campaign_code', campaign.code).eq('name', name);
    const updatedCampaign: Campaign = {
      ...campaign,
      gmCharacterNames: (campaign.gmCharacterNames ?? []).filter((n) => n !== name),
    };
    void saveCampaign(updatedCampaign);
    const newChars = { ...characters };
    delete newChars[name];
    set({ campaign: updatedCampaign, characters: newChars });
  },

  deleteCampaign: () => {
    const { campaign } = get();
    if (!campaign) return;
    void supabase.from('campaigns').delete().eq('code', campaign.code);
    get().leaveCampaign();
  },

  toggleNPCInScene: (name: string) => {
    const { characters } = get();
    const char = characters[name];
    if (!char || char.owner !== 'gm') return;
    const updated = { ...char, inScene: !char.inScene };
    void saveCharacter(updated);
    set({ characters: { ...characters, [name]: updated } });
  },

  addToast: (message: string, type: ToastItem['type']) => {
    const id = genId();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
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
      broadcast(channel, msg);
    }
  },
}));
