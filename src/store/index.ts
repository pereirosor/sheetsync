import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  AuthUser,
  Campaign,
  CampaignSettings,
  CampaignSummary,
  Character,
  ChatMessage,
  CombatantEntry,
  CombatState,
  DiceRollEntry,
  GMCharacterFormData,
  GMNote,
  Role,
  SyncMessage,
  ToastItem,
  VitalKey,
} from '../types';
import tormenta20 from '../systems/tormenta20';
import { supabase } from '../lib/supabase';

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
    owner_id: c.ownerId,
    created_at: c.createdAt,
    settings: c.settings,
    // player_names and gm_character_names are managed by DB trigger
  });
}

async function loadCampaign(code: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('code', code)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(`[${error.code}] ${error.message}`);
  if (!data) return null;
  return {
    code: data.code as string,
    ownerId: data.owner_id as string,
    createdAt: data.created_at as number,
    settings: data.settings as CampaignSettings,
    playerNames: (data.player_names as string[]) ?? [],
    gmCharacterNames: (data.gm_character_names as string[]) ?? [],
  };
}

async function saveCharacter(ch: Character): Promise<void> {
  await supabase.from('characters').upsert(
    { campaign_code: ch.campaignCode, user_id: ch.userId, name: ch.name, owner: ch.owner, data: ch },
    { onConflict: 'campaign_code,name' },
  );
}

const normalizeCharacter = (ch: Character): Character => ({
  ...ch,
  userId: ch.userId ?? '',
  owner: ch.owner ?? 'player',
  inScene: ch.inScene ?? false,
  originBenefits: ch.originBenefits ?? [],
  created: ch.created ?? (!!ch.race && !!ch.class && !!ch.origin),
  conditions: ch.conditions ?? [],
  powers: ch.powers ?? [],
  pendingLevelUp: ch.pendingLevelUp ?? false,
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

async function saveGMNote(note: GMNote): Promise<void> {
  await supabase.from('gm_notes').upsert({
    id: note.id,
    campaign_code: note.campaignCode,
    title: note.title,
    body: note.body,
    created_at: note.createdAt,
  });
}

async function loadAllGMNotes(campaignCode: string): Promise<GMNote[]> {
  const { data } = await supabase
    .from('gm_notes')
    .select('*')
    .eq('campaign_code', campaignCode)
    .order('created_at', { ascending: true });
  if (!data) return [];
  return (data as { id: string; campaign_code: string; title: string; body: string; created_at: number }[]).map(
    (r) => ({ id: r.id, campaignCode: r.campaign_code, title: r.title, body: r.body, createdAt: r.created_at }),
  );
}

// ── Default character factory ─────────────────────────────────────────────────

export const createDefaultCharacter = (campaignCode: string, name: string, userId: string): Character => ({
  id: `${campaignCode}_${name}`,
  userId,
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
  created: false,
});

// ── Store ─────────────────────────────────────────────────────────────────────

interface AppState {
  // Auth
  user: AuthUser | null;
  authLoading: boolean;
  myCampaigns: CampaignSummary[];

  // Campaign session
  role: Role | null;
  pendingGMCode: string | null;
  campaign: Campaign | null;
  currentPlayerName: string | null;
  characters: Record<string, Character>;
  channel: RealtimeChannel | null;

  // UI ephemeral
  toasts: ToastItem[];
  diceLog: DiceRollEntry[];
  chatLog: ChatMessage[];
  combatState: CombatState | null;
  combatRollPending: boolean;
  combatPendingRolls: Record<string, number | null> | null;
  gmNotes: GMNote[];

  // Auth actions
  initAuth: () => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;

  // Dashboard
  loadMyCampaigns: () => Promise<void>;

  // Campaign lifecycle
  initChannel: (campaignCode: string) => void;
  createCampaign: () => Promise<void>;
  confirmGMEntry: () => Promise<void>;
  openCampaign: (code: string) => Promise<void>;
  joinCampaign: (code: string, characterName: string) => Promise<'ok' | 'not_found' | 'name_taken' | string>;
  leaveCampaign: () => void;

  // Character mutations
  updateCharacter: (name: string, updates: Partial<Character>) => void;
  updateVital: (characterName: string, field: VitalKey, delta: number) => void;
  setVitalMax: (characterName: string, field: VitalKey, max: number) => void;
  applyRest: (characterName: string, restType: 'short' | 'long') => void;
  updateSettings: (settings: Partial<CampaignSettings>) => void;
  handleSyncMessage: (msg: SyncMessage) => void;

  // Toast
  addToast: (message: string, type: ToastItem['type']) => void;
  removeToast: (id: string) => void;

  // GM characters
  createGMCharacter: (data: GMCharacterFormData) => void;
  updateGMCharacter: (originalName: string, data: GMCharacterFormData) => void;
  deleteGMCharacter: (name: string) => void;
  deleteCampaign: () => void;
  toggleNPCInScene: (name: string) => void;

  // Dice / chat
  rollDice: (entry: Omit<DiceRollEntry, 'id' | 'timestamp'>) => void;
  sendChatMessage: (text: string) => void;

  // Combat
  requestCombat: () => void;
  submitInitiativeRoll: (roll: number) => void;
  cancelCombatRequest: () => void;
  startCombat: (combatants: CombatantEntry[]) => void;
  nextTurn: () => void;
  endCombat: () => void;

  // GM notes
  loadGMNotes: () => Promise<void>;
  createGMNote: () => GMNote;
  updateGMNote: (id: string, patch: Partial<Pick<GMNote, 'title' | 'body'>>) => Promise<void>;
  deleteGMNote: (id: string) => string | null;

  // Conditions / level-up
  toggleCondition: (characterName: string, condition: string) => void;
  releaseLevelUp: () => void;
  resetLevelUp: () => void;
  applyLevelUp: (name: string, patch: Partial<Character>) => void;
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
  user: null,
  authLoading: true,
  myCampaigns: [],
  role: null,
  pendingGMCode: null,
  campaign: null,
  currentPlayerName: null,
  characters: {},
  channel: null,
  toasts: [],
  diceLog: [],
  chatLog: [],
  combatState: null,
  combatRollPending: false,
  combatPendingRolls: null,
  gmNotes: [],

  // ── Auth ──────────────────────────────────────────────────────────────────

  initAuth: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user: AuthUser = { id: session.user.id, email: session.user.email ?? '' };
        set({ user, authLoading: false });
        void get().loadMyCampaigns();
      } else {
        set({ user: null, authLoading: false });
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: AuthUser = { id: session.user.id, email: session.user.email ?? '' };
        set({ user });
        void get().loadMyCampaigns();
      } else {
        set({ user: null, myCampaigns: [] });
      }
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    const ch = get().channel;
    if (ch) void supabase.removeChannel(ch);
    set({
      user: null,
      myCampaigns: [],
      role: null,
      pendingGMCode: null,
      campaign: null,
      currentPlayerName: null,
      characters: {},
      channel: null,
      combatState: null,
      combatRollPending: false,
      combatPendingRolls: null,
      gmNotes: [],
      diceLog: [],
      chatLog: [],
    });
  },

  // ── Dashboard ────────────────────────────────────────────────────────────

  loadMyCampaigns: async () => {
    const { data } = await supabase
      .from('campaign_members')
      .select('role, campaigns(code, created_at)');
    if (!data) { set({ myCampaigns: [] }); return; }
    const summaries: CampaignSummary[] = (data as { role: string; campaigns: unknown }[])
      .map((r) => {
        const camp = r.campaigns as { code: string; created_at: number } | null;
        if (!camp) return null;
        return { code: camp.code, role: r.role as Role, createdAt: camp.created_at };
      })
      .filter((s): s is CampaignSummary => s !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
    set({ myCampaigns: summaries });
  },

  // ── Campaign lifecycle ────────────────────────────────────────────────────

  initChannel: (campaignCode: string) => {
    if (get().channel) return;
    const ch = buildChannel(campaignCode, (msg) => get().handleSyncMessage(msg)).subscribe();
    set({ channel: ch });
  },

  createCampaign: async () => {
    const { user } = get();
    if (!user) return;
    const code = generateCode();
    const campaign: Campaign = {
      code,
      ownerId: user.id,
      createdAt: Date.now(),
      settings: { sanityEnabled: false, speedUnit: 'squares' },
      playerNames: [],
      gmCharacterNames: [],
    };
    await saveCampaign(campaign);
    await supabase.from('campaign_members').insert({ campaign_code: code, user_id: user.id, role: 'gm' });
    set({ campaign, pendingGMCode: code, characters: {} });
    await get().loadMyCampaigns();
  },

  confirmGMEntry: async () => {
    const { pendingGMCode } = get();
    if (!pendingGMCode) return;
    await get().openCampaign(pendingGMCode);
    set({ pendingGMCode: null });
  },

  openCampaign: async (code: string) => {
    const { user, myCampaigns } = get();
    if (!user) return;

    // Determine role (from cached list or query DB as fallback)
    let myRole: Role = 'player';
    const summary = myCampaigns.find((c) => c.code === code);
    if (summary) {
      myRole = summary.role;
    } else {
      const { data } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_code', code)
        .eq('user_id', user.id)
        .single();
      if (data) myRole = data.role as Role;
    }

    const campaign = await loadCampaign(code);
    if (!campaign) return;

    const [playerChars, gmChars] = await Promise.all([
      loadAllCharacters(campaign),
      loadAllGMCharacters(campaign),
    ]);
    const characters = { ...playerChars, ...gmChars };

    let currentPlayerName: string | null = null;
    if (myRole === 'player') {
      const myChar = Object.values(characters).find(
        (c) => c.userId === user.id && c.owner === 'player',
      );
      currentPlayerName = myChar?.name ?? null;
    }

    set({ role: myRole, campaign, characters, currentPlayerName });
    if (myRole === 'gm') await get().loadGMNotes();
    get().initChannel(code);
  },

  joinCampaign: async (code: string, characterName: string) => {
    const { user } = get();
    if (!user) return 'not_found';
    try {
      // 1. Join as member via RPC (SECURITY DEFINER — bypasses RLS)
      const { data: joined } = await supabase.rpc('join_campaign', { p_code: code });
      if (!joined) return 'not_found';

      // 2. If already has a character, just open
      const { data: myChar } = await supabase
        .from('characters')
        .select('name')
        .eq('campaign_code', code)
        .eq('user_id', user.id)
        .eq('owner', 'player')
        .maybeSingle();
      if (myChar) {
        await get().loadMyCampaigns();
        await get().openCampaign(code);
        return 'ok';
      }

      // 3. Check name uniqueness
      const { data: existing } = await supabase
        .from('characters')
        .select('name')
        .eq('campaign_code', code)
        .eq('name', characterName)
        .maybeSingle();
      if (existing) return 'name_taken';

      // 4. Create and save character
      const character = createDefaultCharacter(code, characterName, user.id);
      await saveCharacter(character);

      await get().loadMyCampaigns();
      await get().openCampaign(code);
      return 'ok';
    } catch (e) {
      return e instanceof Error ? e.message : 'unknown error';
    }
  },

  leaveCampaign: () => {
    const ch = get().channel;
    if (ch) void supabase.removeChannel(ch);
    set({
      role: null,
      campaign: null,
      currentPlayerName: null,
      characters: {},
      channel: null,
      combatState: null,
      combatRollPending: false,
      combatPendingRolls: null,
      gmNotes: [],
    });
    // Load updated campaign list for dashboard
    void get().loadMyCampaigns();
  },

  // ── Character mutations ───────────────────────────────────────────────────

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
        // Update in-memory campaign.playerNames for live UX (DB handled by trigger)
        const updatedCampaign: Campaign = {
          ...campaign,
          playerNames: campaign.playerNames.includes(char.name)
            ? campaign.playerNames
            : [...campaign.playerNames, char.name],
        };
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
      case 'CHAT_MESSAGE': {
        const { senderName, text } = msg.payload;
        const entry: ChatMessage = { id: genId(), senderName, text, timestamp: Date.now() };
        set((s) => ({ chatLog: [...s.chatLog, entry].slice(-100) }));
        break;
      }
      case 'COMBAT_REQUEST': {
        if (role === 'player') set({ combatRollPending: true });
        break;
      }
      case 'COMBAT_INITIATIVE_ROLL': {
        if (role === 'gm') {
          const { characterName, roll } = msg.payload;
          set((s) => {
            if (!s.combatPendingRolls) return {};
            return { combatPendingRolls: { ...s.combatPendingRolls, [characterName]: roll } };
          });
        }
        break;
      }
      case 'COMBAT_CANCEL': {
        set({ combatRollPending: false });
        break;
      }
      case 'COMBAT_START': {
        const { combatants } = msg.payload;
        set({ combatState: { active: true, combatants, currentIndex: 0, round: 1 }, combatRollPending: false });
        break;
      }
      case 'COMBAT_NEXT_TURN': {
        const { currentIndex, round } = msg.payload;
        set((s) => s.combatState ? { combatState: { ...s.combatState, currentIndex, round } } : {});
        break;
      }
      case 'COMBAT_END': {
        set({ combatState: null });
        break;
      }
      case 'LEVEL_UP_RELEASED': {
        if (role !== 'player') break;
        const { currentPlayerName, characters } = get();
        if (!currentPlayerName) break;
        const char = characters[currentPlayerName];
        if (!char) break;
        set({ characters: { ...characters, [currentPlayerName]: { ...char, pendingLevelUp: true } } });
        addToast('O mestre liberou o Level Up! Abra o assistente para subir de nível.', 'success');
        break;
      }
      case 'LEVEL_UP_RESET': {
        if (role !== 'player') break;
        const { currentPlayerName, characters } = get();
        if (!currentPlayerName) break;
        const char = characters[currentPlayerName];
        if (!char) break;
        set({ characters: { ...characters, [currentPlayerName]: { ...char, pendingLevelUp: false } } });
        break;
      }
    }
  },

  // ── Toast ─────────────────────────────────────────────────────────────────

  addToast: (message: string, type: ToastItem['type']) => {
    const id = genId();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4500);
  },

  removeToast: (id: string) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  // ── GM characters ─────────────────────────────────────────────────────────

  createGMCharacter: (data: GMCharacterFormData) => {
    const { campaign, characters, user } = get();
    if (!campaign || !user) return;
    const allNames = [...campaign.playerNames, ...(campaign.gmCharacterNames ?? [])];
    if (allNames.includes(data.name)) {
      get().addToast(`Já existe um personagem com o nome "${data.name}".`, 'warning');
      return;
    }
    const ch: Character = {
      id: `${campaign.code}_gm_${data.name}`,
      userId: user.id,
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
      created: true,
    };
    // Trigger will update gm_character_names in DB; update in-memory for live UX
    const updatedCampaign: Campaign = {
      ...campaign,
      gmCharacterNames: [...(campaign.gmCharacterNames ?? []), data.name],
    };
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
    // Trigger handles gm_character_names in DB; update in-memory
    const gmNames = (campaign.gmCharacterNames ?? []).map((n) => (n === originalName ? data.name : n));
    const updatedCampaign = { ...campaign, gmCharacterNames: gmNames };
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
    // Trigger handles gm_character_names in DB; update in-memory
    const updatedCampaign: Campaign = {
      ...campaign,
      gmCharacterNames: (campaign.gmCharacterNames ?? []).filter((n) => n !== name),
    };
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

  // ── Dice / chat ───────────────────────────────────────────────────────────

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

  sendChatMessage: (text: string) => {
    const { campaign, channel, currentPlayerName } = get();
    if (!campaign) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const senderName = currentPlayerName ?? 'Mestre';
    const entry: ChatMessage = { id: genId(), senderName, text: trimmed, timestamp: Date.now() };
    set((s) => ({ chatLog: [...s.chatLog, entry].slice(-100) }));
    broadcast(channel, { type: 'CHAT_MESSAGE', payload: { campaignCode: campaign.code, senderName, text: trimmed } });
  },

  // ── Combat ────────────────────────────────────────────────────────────────

  requestCombat: () => {
    const { campaign, channel } = get();
    if (!campaign) return;
    const playerRolls: Record<string, number | null> = Object.fromEntries(
      campaign.playerNames.map((n) => [n, null]),
    );
    set({ combatPendingRolls: playerRolls });
    broadcast(channel, { type: 'COMBAT_REQUEST', payload: { campaignCode: campaign.code } });
  },

  submitInitiativeRoll: (roll: number) => {
    const { campaign, channel, currentPlayerName } = get();
    if (!campaign || !currentPlayerName) return;
    set({ combatRollPending: false });
    broadcast(channel, {
      type: 'COMBAT_INITIATIVE_ROLL',
      payload: { campaignCode: campaign.code, characterName: currentPlayerName, roll },
    });
  },

  cancelCombatRequest: () => {
    const { campaign, channel } = get();
    if (!campaign) return;
    set({ combatPendingRolls: null });
    broadcast(channel, { type: 'COMBAT_CANCEL', payload: { campaignCode: campaign.code } });
  },

  startCombat: (combatants: CombatantEntry[]) => {
    const { campaign, channel } = get();
    if (!campaign) return;
    const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);
    const state: CombatState = { active: true, combatants: sorted, currentIndex: 0, round: 1 };
    set({ combatState: state, combatPendingRolls: null });
    broadcast(channel, { type: 'COMBAT_START', payload: { campaignCode: campaign.code, combatants: sorted } });
  },

  nextTurn: () => {
    const { combatState, campaign, channel } = get();
    if (!combatState || !campaign) return;
    const len = combatState.combatants.length;
    if (len === 0) return;
    const nextIndex = (combatState.currentIndex + 1) % len;
    const nextRound = nextIndex === 0 ? combatState.round + 1 : combatState.round;
    const updated: CombatState = { ...combatState, currentIndex: nextIndex, round: nextRound };
    set({ combatState: updated });
    broadcast(channel, { type: 'COMBAT_NEXT_TURN', payload: { campaignCode: campaign.code, currentIndex: nextIndex, round: nextRound } });
  },

  endCombat: () => {
    const { campaign, channel } = get();
    if (!campaign) return;
    set({ combatState: null });
    broadcast(channel, { type: 'COMBAT_END', payload: { campaignCode: campaign.code } });
  },

  // ── GM notes ─────────────────────────────────────────────────────────────

  loadGMNotes: async () => {
    const { campaign } = get();
    if (!campaign) return;
    try {
      const notes = await loadAllGMNotes(campaign.code);
      set({ gmNotes: notes });
    } catch {
      // table may not exist yet; degrade gracefully
    }
  },

  createGMNote: (): GMNote => {
    const { campaign, gmNotes } = get();
    if (!campaign) throw new Error('no campaign');
    const note: GMNote = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      campaignCode: campaign.code,
      title: 'Nova nota',
      body: '',
      createdAt: Date.now(),
    };
    void saveGMNote(note);
    set({ gmNotes: [...gmNotes, note] });
    return note;
  },

  updateGMNote: async (id: string, patch: Partial<Pick<GMNote, 'title' | 'body'>>) => {
    const notes = get().gmNotes;
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const updated = { ...note, ...patch };
    set({ gmNotes: notes.map((n) => (n.id === id ? updated : n)) });
    await saveGMNote(updated);
  },

  deleteGMNote: (id: string): string | null => {
    const { gmNotes } = get();
    void supabase.from('gm_notes').delete().eq('id', id);
    const remaining = gmNotes.filter((n) => n.id !== id);
    set({ gmNotes: remaining });
    return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
  },

  // ── Conditions / level-up ─────────────────────────────────────────────────

  toggleCondition: (characterName: string, condition: string) => {
    const { characters } = get();
    const char = characters[characterName];
    if (!char) return;
    const current = char.conditions ?? [];
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    get().updateCharacter(characterName, { conditions: updated });
  },

  releaseLevelUp: () => {
    const { campaign, channel, characters } = get();
    if (!campaign) return;
    const playerNames = campaign.playerNames;
    const newChars = { ...characters };
    for (const name of playerNames) {
      const char = newChars[name];
      if (char && char.owner === 'player') {
        const updated = { ...char, pendingLevelUp: true };
        newChars[name] = updated;
        void saveCharacter(updated);
      }
    }
    set({ characters: newChars });
    broadcast(channel, { type: 'LEVEL_UP_RELEASED', payload: { campaignCode: campaign.code } });
    get().addToast('Level Up liberado para todos os jogadores!', 'success');
  },

  resetLevelUp: () => {
    const { campaign, channel, characters } = get();
    if (!campaign) return;
    const playerNames = campaign.playerNames;
    const newChars = { ...characters };
    for (const name of playerNames) {
      const char = newChars[name];
      if (char && char.owner === 'player') {
        const updated = { ...char, pendingLevelUp: false };
        newChars[name] = updated;
        void saveCharacter(updated);
      }
    }
    set({ characters: newChars });
    broadcast(channel, { type: 'LEVEL_UP_RESET', payload: { campaignCode: campaign.code } });
  },

  applyLevelUp: (name: string, patch: Partial<Character>) => {
    const { characters } = get();
    const char = characters[name];
    if (!char) return;
    const updated: Character = { ...char, ...patch, pendingLevelUp: false };
    get().updateCharacter(name, updated);
  },
}));
