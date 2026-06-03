-- Migration: add game_system column to campaigns
-- Run this in the Supabase SQL editor on production before deploying the new frontend.
alter table campaigns
  add column if not exists game_system text not null default 'tormenta20';
