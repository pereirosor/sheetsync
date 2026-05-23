-- SheetSync — Schema completo com RLS
-- Rodar no SQL Editor do Supabase após descartar tabelas antigas (se houver).
-- Config obrigatória no painel: Authentication → Providers → Email → desligar "Confirm email".

-- ── Tabelas ──────────────────────────────────────────────────────────────────

create table campaigns (
  code               text primary key,
  owner_id           uuid not null references auth.users(id) on delete cascade,
  created_at         bigint not null,
  settings           jsonb  not null default '{}',
  player_names       text[] not null default '{}',
  gm_character_names text[] not null default '{}'
);

create table campaign_members (
  campaign_code text not null references campaigns(code) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null,  -- 'gm' | 'player'
  primary key (campaign_code, user_id)
);

create table characters (
  id            uuid primary key default gen_random_uuid(),
  campaign_code text not null references campaigns(code) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  owner         text not null,  -- 'player' (PC) | 'gm' (NPC)
  data          jsonb not null,
  unique (campaign_code, name)
);

create table gm_notes (
  id            uuid primary key default gen_random_uuid(),
  campaign_code text not null references campaigns(code) on delete cascade,
  title         text not null default '',
  body          text not null default '',
  created_at    bigint not null
);

-- ── Funções helper SECURITY DEFINER (evitam recursão no RLS) ─────────────────

create or replace function public.is_member(p_code text)
returns boolean language sql security definer set search_path = public stable as $$
  select exists(
    select 1 from campaign_members
    where campaign_code = p_code and user_id = auth.uid()
  );
$$;

create or replace function public.is_gm(p_code text)
returns boolean language sql security definer set search_path = public stable as $$
  select exists(
    select 1 from campaigns
    where code = p_code and owner_id = auth.uid()
  );
$$;

-- ── RPC: entrar por código sem expor a tabela campaigns inteira ───────────────

create or replace function public.join_campaign(p_code text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from campaigns where code = p_code) then
    return false;
  end if;
  insert into campaign_members(campaign_code, user_id, role)
  values (p_code, auth.uid(), 'player')
  on conflict (campaign_code, user_id) do nothing;
  return true;
end;
$$;

-- ── Trigger: mantém player_names / gm_character_names em sync ────────────────

create or replace function public.sync_campaign_names()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_code text := coalesce(new.campaign_code, old.campaign_code);
begin
  update campaigns c set
    player_names = coalesce(
      (select array_agg(name order by name)
       from characters where campaign_code = v_code and owner = 'player'), '{}'),
    gm_character_names = coalesce(
      (select array_agg(name order by name)
       from characters where campaign_code = v_code and owner = 'gm'), '{}')
  where c.code = v_code;
  return null;
end;
$$;

create trigger trg_sync_names
after insert or update or delete on characters
for each row execute function public.sync_campaign_names();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table campaigns        enable row level security;
alter table campaign_members enable row level security;
alter table characters       enable row level security;
alter table gm_notes         enable row level security;

-- campaigns: membros leem; só o dono (GM) cria / edita / apaga
create policy camp_sel on campaigns for select using (owner_id = auth.uid() or is_member(code));
create policy camp_ins on campaigns for insert with check (owner_id = auth.uid());
create policy camp_upd on campaigns for update using (owner_id = auth.uid());
create policy camp_del on campaigns for delete using (owner_id = auth.uid());

-- campaign_members: cada um vê/gerencia a própria linha; GM vê/gerencia todas da campanha
create policy mem_sel on campaign_members for select using (user_id = auth.uid() or is_gm(campaign_code));
create policy mem_ins on campaign_members for insert with check (user_id = auth.uid());
create policy mem_del on campaign_members for delete using (user_id = auth.uid() or is_gm(campaign_code));

-- characters: membros leem todos; dono do PC edita o seu; GM edita qualquer um da campanha
create policy chr_sel on characters for select using (is_member(campaign_code));
create policy chr_ins on characters for insert with check (is_member(campaign_code) and user_id = auth.uid());
create policy chr_upd on characters for update using (user_id = auth.uid() or is_gm(campaign_code));
create policy chr_del on characters for delete using (user_id = auth.uid() or is_gm(campaign_code));

-- gm_notes: só o GM da campanha
create policy note_all on gm_notes for all
  using (is_gm(campaign_code))
  with check (is_gm(campaign_code));
