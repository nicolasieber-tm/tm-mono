-- =================================================================
-- 5-Tage-Minikurs «KI & Automation im Handwerk» (trendingmedia.ch/kurs)
-- Supabase-Projekt Orbit (uzsyjoicirquqjejmutf)
--
--   kurs_leads   eine Zeile pro Teilnehmer, mit geheimem Kurs-Token
--   kurs_mails   Versandprotokoll der Sequenz (eine Zeile je Lead und Stufe)
--   kurs_events  was der Teilnehmer auf der Kursseite tut (Lektion offen,
--                Rechner, Aufgaben gespeichert, Check-Klick, Abmeldung)
--
-- Schreiben nur über die Edge Function `kurs` (Service-Role, über die
-- security-definer-Funktionen unten). Lesen: angemeldete Orbit-Nutzer.
--
-- Mail-Stufen (Tage nach der Anmeldung):
--   1 sofort  Willkommen + Lektion 1
--   2..5      +1..+4 Tage, je die nächste Lektion
--   6         +6 Tage (Tag 7)   Fallstudie Kohler Elektro
--   7         +9 Tage (Tag 10)  Einwände / was der Check ist
--   8         +13 Tage (Tag 14) letzte, kurze Nachfrage
-- Stufen 6 bis 8 gehen nur an Leads ohne Buchung.
--
-- «Gebucht» = kurs_leads.gebucht_am gesetzt ODER der verknüpfte
-- Orbit-Kontakt steht auf meeting_gebucht / meeting_abgeschlossen /
-- kunde_gewonnen. Das Buchungstool meldet Buchungen (noch) nicht zurück;
-- wer den Kontakt in Orbit verschiebt, stoppt damit die Follow-ups.
-- =================================================================

create table public.kurs_leads (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  name text not null,
  email text not null,
  firma text not null,
  branche text,
  quelle text,
  utm jsonb not null default '{}'::jsonb,
  client_id uuid references public.clients(id) on delete set null,
  aufgaben jsonb,
  created_at timestamptz not null default now(),
  letzte_aktivitaet timestamptz,
  abgemeldet_am timestamptz,
  gebucht_am timestamptz,
  heiss_gemeldet_am timestamptz
);
create unique index kurs_leads_email_key on public.kurs_leads (lower(email));
comment on table public.kurs_leads is 'Teilnehmer des 5-Tage-Minikurses (trendingmedia.ch/kurs). token = nicht öffentlicher Kurslink.';

create table public.kurs_mails (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.kurs_leads(id) on delete cascade,
  stufe smallint not null check (stufe between 1 and 8),
  gesendet_am timestamptz not null default now(),
  resend_id text,
  unique (lead_id, stufe)
);
comment on table public.kurs_mails is 'Versandprotokoll der Minikurs-Sequenz. Unique (lead_id, stufe) verhindert Doppelversand.';

create table public.kurs_events (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.kurs_leads(id) on delete cascade,
  event text not null check (event in ('besuch', 'lektion', 'video_start', 'video_ende', 'rechner', 'aufgaben', 'check_klick', 'abmelden')),
  lektion smallint check (lektion between 1 and 5),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index kurs_events_lead_idx on public.kurs_events (lead_id, created_at desc);
comment on table public.kurs_events is 'Aktivität auf der Minikurs-Seite, pro Teilnehmer.';

alter table public.kurs_leads enable row level security;
alter table public.kurs_mails enable row level security;
alter table public.kurs_events enable row level security;
create policy "angemeldete koennen kurs_leads lesen" on public.kurs_leads for select to authenticated using (true);
create policy "angemeldete koennen kurs_mails lesen" on public.kurs_mails for select to authenticated using (true);
create policy "angemeldete koennen kurs_events lesen" on public.kurs_events for select to authenticated using (true);
revoke all on public.kurs_leads, public.kurs_mails, public.kurs_events from anon;

-- ---------------------------------------------------------------
-- gebucht?
-- ---------------------------------------------------------------
create or replace function public.kurs_ist_gebucht(p_lead public.kurs_leads)
returns boolean
language sql stable
set search_path = public
as $$
  select p_lead.gebucht_am is not null
      or exists (select 1 from clients c
                  where c.id = p_lead.client_id
                    and c.pipeline_status in ('meeting_gebucht', 'meeting_abgeschlossen', 'kunde_gewonnen'));
$$;

-- ---------------------------------------------------------------
-- Anmeldung
-- ---------------------------------------------------------------
create or replace function public.kurs_anmelden(
  p_name text, p_email text, p_firma text,
  p_branche text default null, p_quelle text default null, p_utm jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_name text := left(btrim(coalesce(p_name, '')), 120);
  v_email text := lower(left(btrim(coalesce(p_email, '')), 200));
  v_firma text := left(btrim(coalesce(p_firma, '')), 160);
  v_branche text := nullif(left(btrim(coalesce(p_branche, '')), 80), '');
  v_quelle text := nullif(left(btrim(coalesce(p_quelle, '')), 200), '');
  v_utm jsonb := case when jsonb_typeof(p_utm) = 'object' then p_utm else '{}'::jsonb end;
  v_lead kurs_leads;
  v_client uuid;
begin
  if length(v_name) < 2 or length(v_firma) < 2 or v_email !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' then
    raise exception 'ungueltige_eingabe' using errcode = '22023';
  end if;
  if (select count(*) from kurs_leads where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'zu_viele_anfragen' using errcode = '54000';
  end if;

  select * into v_lead from kurs_leads where lower(email) = v_email;
  if found then
    -- erneut angemeldet: Abmeldung aufheben, Link nochmals schicken lassen
    update kurs_leads set abgemeldet_am = null where id = v_lead.id;
    return jsonb_build_object('status', 'bestehend', 'lead_id', v_lead.id, 'token', v_lead.token,
      'erneut_senden', not exists (select 1 from kurs_mails where lead_id = v_lead.id and stufe = 1 and gesendet_am > now() - interval '10 minutes'));
  end if;

  -- Orbit-Pipeline: Kontakt über die E-Mail finden oder anlegen
  select id into v_client from clients where lower(btrim(email)) = v_email limit 1;
  if v_client is null then
    insert into clients (company_name, contact_name, email, pipeline_status, quelle, zustaendig)
    values (v_firma, v_name, v_email, 'interessiert', 'minikurs', 'nicola')
    returning id into v_client;
  end if;

  insert into kurs_leads (name, email, firma, branche, quelle, utm, client_id)
  values (v_name, v_email, v_firma, v_branche, v_quelle, v_utm, v_client)
  returning * into v_lead;

  insert into client_events (client_id, typ, text, autor, meta)
  values (v_client, 'system',
          concat('Minikurs angemeldet (trendingmedia.ch/kurs): ', v_name, ', ', v_firma, coalesce(', ' || v_branche, '')),
          'Website', jsonb_build_object('minikurs', true, 'kurs_lead_id', v_lead.id, 'utm', v_utm));

  return jsonb_build_object('status', 'neu', 'lead_id', v_lead.id, 'token', v_lead.token, 'erneut_senden', true);
end;
$$;

-- ---------------------------------------------------------------
-- Ereignis von der Kursseite
-- ---------------------------------------------------------------
create or replace function public.kurs_event(
  p_token text, p_event text, p_lektion int default null, p_meta jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_lead kurs_leads;
  v_meta jsonb := case when jsonb_typeof(p_meta) = 'object' then p_meta else '{}'::jsonb end;
  v_lektion smallint := case when p_lektion between 1 and 5 then p_lektion end;
  v_heiss boolean := false;
  v_aufgaben jsonb;
begin
  select * into v_lead from kurs_leads where token = p_token;
  if not found then
    return jsonb_build_object('ok', false);
  end if;

  -- grobe Bremse gegen Endlosschleifen / Missbrauch
  if (select count(*) from kurs_events where lead_id = v_lead.id and created_at > now() - interval '1 hour') < 300 then
    insert into kurs_events (lead_id, event, lektion, meta)
    values (v_lead.id, p_event, v_lektion, v_meta);
  end if;

  update kurs_leads set letzte_aktivitaet = now() where id = v_lead.id;

  if p_event = 'aufgaben' and jsonb_typeof(v_meta->'aufgaben') = 'array' then
    select jsonb_agg(left(x, 300)) into v_aufgaben
      from (select btrim(value) x from jsonb_array_elements_text(v_meta->'aufgaben') limit 3) s;
    update kurs_leads set aufgaben = v_aufgaben where id = v_lead.id;
    v_lead.aufgaben := v_aufgaben;
  elsif p_event = 'abmelden' then
    update kurs_leads set abgemeldet_am = coalesce(abgemeldet_am, now()) where id = v_lead.id;
  end if;

  -- heisser Lead: Lektion 4 oder 5 gesehen, nicht gebucht, noch nicht gemeldet
  if p_event in ('lektion', 'video_start', 'rechner') and v_lektion >= 4
     and v_lead.heiss_gemeldet_am is null and not kurs_ist_gebucht(v_lead) then
    update kurs_leads set heiss_gemeldet_am = now() where id = v_lead.id;
    if v_lead.client_id is not null then
      update clients set follow_up_datum = current_date, zustaendig = coalesce(zustaendig, 'nicola')
       where id = v_lead.client_id;
      insert into client_events (client_id, typ, text, autor, meta)
      values (v_lead.client_id, 'system',
              concat('Minikurs: Lektion ', v_lektion, ' geöffnet, noch kein Check gebucht. Persönlich nachfassen.'),
              'Website', jsonb_build_object('minikurs', true, 'heiss', true, 'lektion', v_lektion));
    end if;
    v_heiss := true;
  end if;

  return jsonb_build_object(
    'ok', true, 'heiss', v_heiss,
    'name', v_lead.name, 'firma', v_lead.firma, 'email', v_lead.email, 'branche', v_lead.branche,
    'aufgaben', coalesce(v_lead.aufgaben, '[]'::jsonb),
    'abgemeldet', p_event = 'abmelden' or v_lead.abgemeldet_am is not null,
    'lektionen', coalesce((select jsonb_agg(distinct lektion) from kurs_events
                            where lead_id = v_lead.id and event = 'lektion' and lektion is not null), '[]'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------
-- Fällige Mails (vom stündlichen Lauf abgeholt)
-- ---------------------------------------------------------------
create or replace function public.kurs_faellige_mails(p_limit int default 40, p_zeit_ignorieren boolean default false)
returns table (lead_id uuid, stufe int, token text, name text, email text, firma text, branche text, aufgaben jsonb)
language sql stable security definer
set search_path = public
as $$
  with naechste as (
    select l, coalesce((select max(m.stufe) from kurs_mails m where m.lead_id = l.id), 0) + 1 as n
      from kurs_leads l
     where l.abgemeldet_am is null
       and l.created_at > now() - interval '30 days'
  )
  select (x.l).id, x.n, (x.l).token, (x.l).name, (x.l).email, (x.l).firma, (x.l).branche, (x.l).aufgaben
    from naechste x
   where x.n between 2 and 8
     and (x.l).created_at + (case x.n when 6 then 6 when 7 then 9 when 8 then 13 else x.n - 1 end) * interval '1 day' <= now()
     -- höchstens eine Mail pro Lead und 20 Stunden (auch beim Nachholen)
     and not exists (select 1 from kurs_mails m where m.lead_id = (x.l).id and m.gesendet_am > now() - interval '20 hours')
     -- Follow-ups nur ohne Buchung
     and (x.n <= 5 or not kurs_ist_gebucht(x.l))
     -- nur tagsüber verschicken (Zürich 07 bis 19 Uhr)
     and (p_zeit_ignorieren or extract(hour from now() at time zone 'Europe/Zurich') between 7 and 19)
   order by (x.l).created_at
   limit p_limit;
$$;

-- Prüft das Shared-Secret des Cron-Laufs (liegt im Vault, nicht im Code)
create or replace function public.kurs_cron_secret_ok(p_secret text)
returns boolean
language sql stable security definer
set search_path = public, vault
as $$
  select coalesce(p_secret <> '' and p_secret = (select decrypted_secret from vault.decrypted_secrets where name = 'kurs_cron_secret'), false);
$$;

-- Von Hand: Lead als gebucht markieren (stoppt die Follow-ups)
create or replace function public.kurs_gebucht_setzen(p_email text)
returns boolean
language sql security definer
set search_path = public
as $$
  update kurs_leads set gebucht_am = coalesce(gebucht_am, now()) where lower(email) = lower(btrim(p_email)) returning true;
$$;

revoke all on function public.kurs_anmelden(text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.kurs_event(text, text, int, jsonb) from public, anon, authenticated;
revoke all on function public.kurs_faellige_mails(int, boolean) from public, anon, authenticated;
revoke all on function public.kurs_cron_secret_ok(text) from public, anon, authenticated;
revoke all on function public.kurs_gebucht_setzen(text) from public, anon;
grant execute on function public.kurs_anmelden(text, text, text, text, text, jsonb) to service_role;
grant execute on function public.kurs_event(text, text, int, jsonb) to service_role;
grant execute on function public.kurs_faellige_mails(int, boolean) to service_role;
grant execute on function public.kurs_cron_secret_ok(text) to service_role;
grant execute on function public.kurs_gebucht_setzen(text) to service_role, authenticated;

-- ---------------------------------------------------------------
-- Übersicht für die Nachfass-Liste
-- ---------------------------------------------------------------
create or replace view public.v_kurs_funnel
with (security_invoker = true) as
select
  l.created_at::date as angemeldet,
  l.name, l.firma, l.email, l.branche,
  coalesce((select array_agg(distinct e.lektion order by e.lektion) from kurs_events e
             where e.lead_id = l.id and e.event = 'lektion' and e.lektion is not null), '{}') as lektionen_gesehen,
  (select max(e.lektion) from kurs_events e where e.lead_id = l.id and e.event = 'lektion') as hoechste_lektion,
  exists (select 1 from kurs_events e where e.lead_id = l.id and e.event = 'rechner') as rechner_genutzt,
  (select (e.meta->>'franken')::numeric from kurs_events e
    where e.lead_id = l.id and e.event = 'rechner' order by e.created_at desc limit 1) as rechner_franken,
  exists (select 1 from kurs_events e where e.lead_id = l.id and e.event = 'check_klick') as check_geklickt,
  kurs_ist_gebucht(l) as gebucht,
  (l.heiss_gemeldet_am is not null and not kurs_ist_gebucht(l)) as nachfassen,
  l.aufgaben,
  (select max(m.stufe) from kurs_mails m where m.lead_id = l.id) as letzte_mail_stufe,
  l.letzte_aktivitaet,
  l.abgemeldet_am is not null as abgemeldet,
  l.quelle, l.utm->>'utm_source' as utm_source, l.utm->>'utm_campaign' as utm_campaign,
  l.client_id, l.id as lead_id
from kurs_leads l
order by (l.heiss_gemeldet_am is not null and not kurs_ist_gebucht(l)) desc, l.created_at desc;
comment on view public.v_kurs_funnel is 'Minikurs-Übersicht: wer welche Lektion gesehen hat, gebucht ja/nein, nachfassen ja/nein.';
grant select on public.v_kurs_funnel to authenticated;
revoke all on public.v_kurs_funnel from anon;

-- ---------------------------------------------------------------
-- Vault-Secret + stündlicher Versand (separat ausgeführt, 2026-11-26)
-- ---------------------------------------------------------------
-- select vault.create_secret(<zufälliger Wert>, 'kurs_cron_secret', 'Shared-Secret für den stündlichen Minikurs-Mailversand (Edge Function kurs)');
--
-- select cron.schedule('kurs-mails', '23 * * * *', $$
--   select net.http_post(
--     url     := 'https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/kurs',
--     headers := jsonb_build_object('Content-Type','application/json',
--                  'x-webhook-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'kurs_cron_secret')),
--     body    := '{"action":"cron"}'::jsonb
--   );
-- $$);
--
-- Angelegt INAKTIV, bis die Mail-Texte abgenommen sind. Einschalten:
--   select cron.alter_job(job_id := (select jobid from cron.job where jobname = 'kurs-mails'), active := true);
-- Mail 1 (Willkommen) geht unabhängig davon sofort bei der Anmeldung raus.
