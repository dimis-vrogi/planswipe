-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text,
  password_hash text not null,
  profile jsonb default '{}'::jsonb,
  email_verified boolean default false,
  verification_token text,
  verification_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists users_email_unique
  on public.users (email)
  where email is not null;

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester text not null,
  receiver text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create table if not exists public.groups (
  code text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.friend_requests enable row level security;
alter table public.groups enable row level security;