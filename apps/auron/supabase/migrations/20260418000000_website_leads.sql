-- AURON Website: Leads from /Anfrage page
-- Populated by submit-lead + cal-booking-webhook Edge Functions.
-- RLS on, no policies: only Service-Role writes/reads.

create extension if not exists "pgcrypto";

create table if not exists public.website_leads (
  id                 uuid primary key default gen_random_uuid(),
  company_name       text,
  employees          text,
  time_tracking      text,
  erp                text,
  pain_points        text[] default '{}'::text[],
  timeline           text,
  booking_status     text not null default 'pending'
                     check (booking_status in ('pending','booked','cancelled')),
  booking_email      text,
  booking_name       text,
  booking_start_time timestamptz,
  booked_at          timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists website_leads_created_at_idx
  on public.website_leads (created_at desc);
create index if not exists website_leads_booking_status_idx
  on public.website_leads (booking_status);

create or replace function public.website_leads_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists website_leads_set_updated_at on public.website_leads;
create trigger website_leads_set_updated_at
  before update on public.website_leads
  for each row execute function public.website_leads_set_updated_at();

alter table public.website_leads enable row level security;
