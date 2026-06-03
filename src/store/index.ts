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
  DeathStatus,
  DiceRollEntry,
  GMCharacterFormData,
  GMCharacterFormDataCoC,
  GMNote,
  Role,
  SyncMessage,
  ToastItem,
  VitalKey,
} from '../types';
import tormenta20 from '../systems/tormenta20';
import { getSystem } from '../systems';
import { supabase } from '../lib/supabase';

const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const genId = () => Math.random().toString(36).slice(2, 9);

const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;

// ── Death system helpers ──────────────────────────────────────────────────────

const DEATH_CONDITIONS = ['Inconsciente', 'Sangrando', 'Estabilizado', 'Morto'] as const;

/** HP threshold below which the character dies (the more negative of -10 vs -hpMax/2) */
const deathThresholdFor = (hpMax: number): number =>
  Math.min(-10, -Math.floor(hpMax / 2));

const addCondUnique = (arr: string[], c: string): string[] =>
  arr.includes(c) ? arr : [...arr, c];

const removeDeathConds = (arr: string[]): string[] =>
  arr.filter((c) => !(DEATH_CONDITIONS as readonly string[]).includes(c));

// ── Persistence (Supabase) ────────────────────────────────────────────────────

async function saveCampaign(c: Campaign): Promise<void> {
  await supabase.from('campaigns').upsert({
    code: c.code,
    owner_id: c.ownerId,
    created_at: c.createdAt,
    settings: c.settings,
    game_system: c.gameSystemId,
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
    gameSystemId: (data.game_system as string | undefined) ?? 'tormenta20',
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
  deathState: ch.deathState ?? 'alive',
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
    size: 0,
    power: 0,
    appearance: 0,
    education: 0,
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
  createCampaign: (systemId: string, settings?: Partial<CampaignSettings>) => Promise<void>;
  openCampaign: (code: string) => Promise<void>;
  joinCampaign: (code: string, characterName: string) => Promise<'ok' | 'not_found' | 'name_taken' | 'already_gm' | string>;
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
  createGMCharacterCoC: (data: GMCharacterFormDataCoC) => void;
  updateGMCharacter: (originalName: string, data: GMCharacterFormData) => void;
  deleteGMCharacter: (name: string) => void;
  deleteCampaign: () => Promise<void>;
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
  releaseLevelUpFor: (name: string) => void;
  resetLevelUp: () => void;
  applyLevelUp: (name: string, patch: Partial<Character>) => void;

  // Death system
  rollDeathSave: (characterName: string) => void;
  rollCoCDeathCheck: (characterName: string) => void;
  applySanityLoss: (characterName: string, amount: number) => void;
  forceStabilize: (characterName: string) => void;
  revive: (characterName: string, hp?: number) => void;
  replaceDeadCharacter: (newName: string) => Promise<'ok' | 'name_taken' | 'error'>;
  abandonAfterDeath: () => Promise<void>;
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
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (data.session?.user) {
      const user: AuthUser = { id: data.session.user.id, email: data.session.user.email ?? '' };
      set({ user });
      void get().loadMyCampaigns();
    }
    return null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    const ch = get().channel;
    if (ch) void supabase.removeChannel(ch);
    set({
      user: null,
      myCampaigns: [],
      role: null,
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

  createCampaign: async (systemId: string, extraSettings?: Partial<CampaignSettings>) => {
    const { user } = get();
    if (!user) return;
    const code = generateCode();
    const campaign: Campaign = {
      code,
      ownerId: user.id,
      createdAt: Date.now(),
      settings: { sanityEnabled: false, speedUnit: 'squares', ...extraSettings },
      playerNames: [],
      gmCharacterNames: [],
      gameSystemId: systemId,
    };
    await saveCampaign(campaign);
    await supabase.from('campaign_members').insert({ campaign_code: code, user_id: user.id, role: 'gm' });
    await get().loadMyCampaigns();
    await get().openCampaign(code);
    get().addToast(`Campanha criada! Código: ${code} — compartilhe com seus jogadores.`, 'success');
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
      // 0. Block dual-role: check if user is already a member with a different role
      const { data: existing_membership } = await supabase
        .from('campaign_members')
        .select('role')
        .eq('campaign_code', code)
        .eq('user_id', user.id)
        .maybeSingle();
      if (existing_membership?.role === 'gm') return 'already_gm';

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

    // HP can go negative (death mechanics). Other vitals clamped at 0.
    const newCurrent =
      field === 'hp'
        ? Math.min(vital.max, vital.current + delta)
        : Math.max(0, Math.min(vital.max, vital.current + delta));

    let updated: Character = {
      ...char,
      vitals: { ...char.vitals, [field]: { ...vital, current: newCurrent } },
    };

    // ── Death state transitions (HP only) ───────────────────────────────────
    let deathStateChanged = false;
    if (field === 'hp') {
      const prevState: DeathStatus = char.deathState ?? 'alive';
      const threshold = deathThresholdFor(char.vitals.hp.max);
      let nextState: DeathStatus = prevState;

      if (newCurrent <= threshold) {
        nextState = 'dead';
      } else if (newCurrent <= 0 && (prevState === 'alive')) {
        nextState = 'dying';
      } else if (newCurrent <= 0 && prevState === 'stabilized') {
        nextState = 'dying'; // took damage while stabilized
      } else if (newCurrent > 0 && (prevState === 'dying' || prevState === 'stabilized')) {
        nextState = 'alive'; // healed back to positive
      }

      if (nextState !== prevState) {
        deathStateChanged = true;
        let conditions = removeDeathConds(updated.conditions ?? []);
        if (nextState === 'dying') {
          conditions = addCondUnique(addCondUnique(conditions, 'Inconsciente'), 'Sangrando');
        } else if (nextState === 'stabilized') {
          conditions = addCondUnique(conditions, 'Inconsciente');
        } else if (nextState === 'dead') {
          conditions = addCondUnique(removeDeathConds(conditions), 'Morto');
        }
        // 'alive': conditions already cleaned above

        updated = { ...updated, deathState: nextState, conditions };

        if (nextState === 'dead' && campaign) {
          broadcast(channel, { type: 'CHARACTER_DIED', payload: { campaignCode: campaign.code, characterName } });
        }
        // Send full character so all clients sync the death state
        if (campaign) {
          broadcast(channel, { type: 'SHEET_UPDATE', payload: { campaignCode: campaign.code, character: updated } });
        }
      }
    }

    void saveCharacter(updated);
    set({ characters: { ...characters, [characterName]: updated } });

    // For non-death transitions, use lightweight broadcast
    if (campaign && !deathStateChanged) {
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

    // Block rest for dead/dying/stabilized characters
    const ds: DeathStatus = char.deathState ?? 'alive';
    if (ds !== 'alive') {
      const label = ds === 'dead' ? 'Morto' : ds === 'dying' ? 'inconsciente e sangrando' : 'inconsciente';
      get().addToast(`${char.name} não pode descansar — está ${label}.`, 'warning');
      return;
    }

    const system = getSystem(campaign.gameSystemId ?? 'tormenta20');
    const gains =
      restType === 'long'
        ? system.longRestFormula(char, campaign)
        : system.shortRestFormula(char, campaign);

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
        const prev = characters[char.name];
        set({ characters: { ...characters, [char.name]: char } });
        // Notify player of death state transitions
        if (role === 'player' && char.name === get().currentPlayerName) {
          const prevState: DeathStatus = prev?.deathState ?? 'alive';
          const nextState: DeathStatus = char.deathState ?? 'alive';
          if (nextState === 'dying' && prevState === 'alive') {
            addToast('Você caiu inconsciente e está sangrando! Faça um teste de Constituição CD 15.', 'damage');
          } else if (nextState === 'stabilized' && prevState === 'dying') {
            addToast('Você estabilizou — continua inconsciente, mas não está mais sangrando.', 'info');
          }
        }
        break;
      }
      case 'GM_VITAL_UPDATE': {
        if (role !== 'player') break;
        const { characterName, field, delta } = msg.payload;
        const char = characters[characterName];
        if (!char) break;
        const vital = char.vitals[field];
        // HP can go negative (death); other vitals clamped at 0
        const newCurrent =
          field === 'hp'
            ? Math.min(vital.max, vital.current + delta)
            : Math.max(0, Math.min(vital.max, vital.current + delta));
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
        if (characterName === get().currentPlayerName) {
          addToast(restType === 'long' ? 'Descanso longo aplicado!' : 'Descanso curto aplicado!', 'heal');
        }
        break;
      }
      case 'CAMPAIGN_SETTINGS_UPDATE': {
        set({ campaign: { ...campaign, settings: msg.payload.settings } });
        break;
      }
      case 'DICE_ROLL': {
        const { rollerName, label, diceExpr, breakdown, total, diceSum, diceMax } = msg.payload;
        const entry: DiceRollEntry = { id: genId(), rollerName, label, diceExpr, breakdown, total, diceSum, diceMax, timestamp: Date.now() };
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
        const targetName = msg.payload.characterName;
        if (targetName && targetName !== currentPlayerName) break;
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
      case 'CAMPAIGN_DELETED': {
        addToast('A campanha foi encerrada pelo mestre.', 'warning');
        get().leaveCampaign();
        break;
      }
      case 'CHARACTER_DIED': {
        const { characterName } = msg.payload;
        if (role === 'gm') addToast(`${characterName} morreu!`, 'damage');
        break;
      }
      case 'DEATH_SAVE_ROLLED': {
        const { characterName, total, success } = msg.payload;
        if (role === 'gm') {
          addToast(
            `${characterName}: teste de CON ${total} — ${success ? '✓ Estabilizou' : `✗ Falhou (${total})`}`,
            success ? 'info' : 'damage',
          );
        }
        break;
      }
      case 'PLAYER_REPLACED_CHARACTER': {
        if (role !== 'gm') break;
        const { oldName, newCharacter } = msg.payload;
        const newChars = { ...characters };
        delete newChars[oldName];
        newChars[newCharacter.name] = newCharacter;
        const replacedCampaign: Campaign = {
          ...campaign,
          playerNames: [...campaign.playerNames.filter((n) => n !== oldName), newCharacter.name],
        };
        set({ characters: newChars, campaign: replacedCampaign });
        addToast(`${oldName} morreu. ${newCharacter.name} está criando um novo personagem.`, 'info');
        break;
      }
      case 'PLAYER_ABANDONED': {
        if (role !== 'gm') break;
        const { characterName } = msg.payload;
        const newChars2 = { ...characters };
        delete newChars2[characterName];
        const abandonedCampaign: Campaign = {
          ...campaign,
          playerNames: campaign.playerNames.filter((n) => n !== characterName),
        };
        set({ characters: newChars2, campaign: abandonedCampaign });
        addToast(`${characterName} abandonou a campanha.`, 'warning');
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
        size: 0, power: 0, appearance: 0, education: 0,
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
        size: 0, power: 0, appearance: 0, education: 0,
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

  createGMCharacterCoC: (data: GMCharacterFormDataCoC) => {
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
      race: '',
      class: data.npcType,
      origin: data.npcType,
      level: 1,
      alignment: '',
      deity: '',
      size: 'Médio',
      speed: data.speed,
      vitals: {
        hp: { current: data.hpMax, max: data.hpMax },
        mana: { current: 0, max: 0 },
        sanity: { current: data.sanMax, max: data.sanMax },
        ac: 0,
      },
      attributes: {
        strength: data.strength, dexterity: data.dexterity, constitution: data.constitution,
        intelligence: data.intelligence, wisdom: 0, charisma: 0,
        size: data.size, power: data.power, appearance: data.appearance, education: data.education,
      },
      skills: {},
      equipment: [],
      spells: [],
      notes: data.skillsText,
      originBenefits: [],
      actions: data.actions,
      owner: 'gm',
      inScene: false,
      avatarDataUrl: undefined,
      created: true,
    };
    const updatedCampaign: Campaign = {
      ...campaign,
      gmCharacterNames: [...(campaign.gmCharacterNames ?? []), data.name],
    };
    void saveCharacter(ch);
    set({ campaign: updatedCampaign, characters: { ...characters, [data.name]: ch } });
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

  deleteCampaign: async () => {
    const { campaign, channel, addToast } = get();
    if (!campaign) return;
    broadcast(channel, { type: 'CAMPAIGN_DELETED', payload: { campaignCode: campaign.code } });
    const { error } = await supabase.from('campaigns').delete().eq('code', campaign.code);
    if (error) throw new Error(error.message);
    addToast('Campanha excluída com sucesso.', 'success');
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
    if (!entry.hidden) {
      addToast(`${entry.label}: ${entry.breakdown} = ${entry.total}`, 'info');
      if (channel) {
        const msg: SyncMessage = {
          type: 'DICE_ROLL',
          payload: { campaignCode: campaign.code, rollerName: entry.rollerName, label: entry.label, diceExpr: entry.diceExpr, breakdown: entry.breakdown, total: entry.total, diceSum: entry.diceSum, diceMax: entry.diceMax },
        };
        broadcast(channel, msg);
      }
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

  releaseLevelUpFor: (name: string) => {
    const { campaign, channel, characters } = get();
    if (!campaign) return;
    const char = characters[name];
    if (!char || char.owner !== 'player') return;
    const updated = { ...char, pendingLevelUp: true };
    set({ characters: { ...characters, [name]: updated } });
    void saveCharacter(updated);
    broadcast(channel, { type: 'LEVEL_UP_RELEASED', payload: { campaignCode: campaign.code, characterName: name } });
    get().addToast(`Level Up liberado para ${char.name}!`, 'success');
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

  // ── Death system ──────────────────────────────────────────────────────────

  rollDeathSave: (characterName: string) => {
    const { characters, campaign, channel } = get();
    const char = characters[characterName];
    if (!char || (char.deathState ?? 'alive') !== 'dying') return;

    // d20 + CON modifier + ⌊level / 2⌋ vs CD 15
    const conMod = Math.floor((char.attributes.constitution - 10) / 2);
    const levelBonus = Math.floor(char.level / 2);
    const d20Roll = rollDie(20);
    const total = d20Roll + conMod + levelBonus;
    const success = total >= 15;

    const rollerName = get().role === 'gm' ? 'Mestre' : characterName;
    const bonusStr = conMod + levelBonus >= 0 ? `+${conMod + levelBonus}` : `${conMod + levelBonus}`;
    const entry: DiceRollEntry = {
      id: genId(),
      rollerName,
      label: `Teste de Constituição — Morte (${char.name})`,
      diceExpr: `1d20${bonusStr}`,
      breakdown: `${d20Roll}${bonusStr} = ${total}`,
      total,
      diceSum: d20Roll,
      diceMax: 20,
      timestamp: Date.now(),
    };
    set((s) => ({ diceLog: [entry, ...s.diceLog].slice(0, 100) }));

    if (campaign) {
      broadcast(channel, { type: 'DICE_ROLL', payload: { campaignCode: campaign.code, rollerName: entry.rollerName, label: entry.label, diceExpr: entry.diceExpr, breakdown: entry.breakdown, total: entry.total, diceSum: entry.diceSum, diceMax: entry.diceMax } });
      broadcast(channel, { type: 'DEATH_SAVE_ROLLED', payload: { campaignCode: campaign.code, characterName, roll: d20Roll, total, success } });
    }

    if (success) {
      get().forceStabilize(characterName);
      get().addToast(`${char.name} estabilizou! (${total} ≥ 15)`, 'success');
    } else {
      const dmg = rollDie(6);
      get().addToast(`${char.name} falhou no teste (${total} < 15) — perde ${dmg} PV!`, 'damage');
      get().updateVital(characterName, 'hp', -dmg);
    }
  },

  rollCoCDeathCheck: (characterName: string) => {
    const { characters, campaign, channel } = get();
    const char = characters[characterName];
    if (!char || (char.deathState ?? 'alive') !== 'dying') return;

    const con = char.attributes.constitution;
    const roll = rollDie(100);
    const success = roll <= con;
    const rollerName = get().role === 'gm' ? 'Mestre' : characterName;

    const entry: DiceRollEntry = {
      id: genId(),
      rollerName,
      label: `Check de Constituição — Morte CoC (${char.name})`,
      diceExpr: '1d100',
      breakdown: `${roll} vs CON ${con} — ${success ? 'Sobreviveu' : 'Morreu'}`,
      total: roll,
      diceSum: roll,
      diceMax: 100,
      timestamp: Date.now(),
    };
    set((s) => ({ diceLog: [entry, ...s.diceLog].slice(0, 100) }));
    if (campaign) {
      broadcast(channel, { type: 'DICE_ROLL', payload: { campaignCode: campaign.code, rollerName: entry.rollerName, label: entry.label, diceExpr: entry.diceExpr, breakdown: entry.breakdown, total: entry.total, diceSum: entry.diceSum, diceMax: entry.diceMax } });
    }

    if (success) {
      get().forceStabilize(characterName);
      get().addToast(`${char.name} sobreviveu! (${roll} ≤ ${con})`, 'success');
    } else {
      get().addToast(`${char.name} morreu. (${roll} > ${con})`, 'damage');
      get().updateCharacter(characterName, { deathState: 'dead', conditions: addCondUnique(removeDeathConds(char.conditions ?? []), 'Morto') });
      if (campaign) broadcast(channel, { type: 'CHARACTER_DIED', payload: { campaignCode: campaign.code, characterName } });
    }
  },

  applySanityLoss: (characterName: string, amount: number) => {
    const { characters } = get();
    const char = characters[characterName];
    if (!char || amount <= 0) return;

    const sanVital = char.vitals.sanity;
    const newCurrent = Math.max(0, sanVital.current - amount);

    const tempInsanity = amount >= 5;
    // Indefinite insanity: SAN reaches 0, or lost ≥ 1/5 of starting SAN (max) in a session
    const indef = newCurrent <= 0;

    const patch: Partial<Character> = {
      vitals: { ...char.vitals, sanity: { ...sanVital, current: newCurrent } },
    };
    if (tempInsanity) patch.temporaryInsanity = true;
    if (indef) patch.indefiniteInsanity = true;

    get().updateCharacter(characterName, patch);

    const label = indef
      ? `${char.name} sofreu insanidade indefinida! (SAN ${sanVital.current} → ${newCurrent})`
      : tempInsanity
        ? `${char.name} sofreu insanidade temporária! (SAN −${amount})`
        : `${char.name}: SAN −${amount} (${sanVital.current} → ${newCurrent})`;
    get().addToast(label, indef || tempInsanity ? 'damage' : 'info');
  },

  forceStabilize: (characterName: string) => {
    const { characters } = get();
    const char = characters[characterName];
    if (!char) return;
    const conditions = addCondUnique(removeDeathConds(char.conditions ?? []), 'Inconsciente');
    get().updateCharacter(characterName, { deathState: 'stabilized', conditions });
  },

  revive: (characterName: string, hp = 1) => {
    const { characters } = get();
    const char = characters[characterName];
    if (!char) return;
    const safeHp = Math.max(1, hp);
    const conditions = removeDeathConds(char.conditions ?? []);
    get().updateCharacter(characterName, {
      deathState: 'alive',
      conditions,
      vitals: {
        ...char.vitals,
        hp: { ...char.vitals.hp, current: safeHp },
      },
    });
    get().addToast(`${char.name} foi ressuscitado com ${safeHp} PV.`, 'heal');
  },

  replaceDeadCharacter: async (newName: string) => {
    const { user, campaign, characters, currentPlayerName, channel } = get();
    if (!user || !campaign || !currentPlayerName) return 'error';
    const oldName = currentPlayerName;

    // Check name uniqueness in this campaign
    const { data: existing } = await supabase
      .from('characters')
      .select('name')
      .eq('campaign_code', campaign.code)
      .eq('name', newName)
      .maybeSingle();
    if (existing) return 'name_taken';

    // Delete old character (DB trigger updates playerNames)
    await supabase.from('characters').delete().eq('campaign_code', campaign.code).eq('name', oldName);

    // Create fresh default character
    const newChar = createDefaultCharacter(campaign.code, newName, user.id);
    await saveCharacter(newChar);

    // Update local state
    const newChars = { ...characters };
    delete newChars[oldName];
    newChars[newName] = newChar;
    const updatedCampaign: Campaign = {
      ...campaign,
      playerNames: [...campaign.playerNames.filter((n) => n !== oldName), newName],
    };
    set({ characters: newChars, currentPlayerName: newName, campaign: updatedCampaign });

    broadcast(channel, {
      type: 'PLAYER_REPLACED_CHARACTER',
      payload: { campaignCode: campaign.code, oldName, newCharacter: newChar },
    });

    return 'ok';
  },

  abandonAfterDeath: async () => {
    const { user, campaign, currentPlayerName, channel } = get();
    if (!user || !campaign || !currentPlayerName) return;
    const characterName = currentPlayerName;

    // Broadcast first so GM is notified before the data disappears
    broadcast(channel, { type: 'PLAYER_ABANDONED', payload: { campaignCode: campaign.code, characterName } });

    // Remove character from DB (trigger updates playerNames)
    await supabase.from('characters').delete()
      .eq('campaign_code', campaign.code)
      .eq('name', characterName);

    // Remove campaign membership so they can rejoin as a new player later
    await supabase.from('campaign_members').delete()
      .eq('campaign_code', campaign.code)
      .eq('user_id', user.id);

    get().leaveCampaign();
  },
}));
