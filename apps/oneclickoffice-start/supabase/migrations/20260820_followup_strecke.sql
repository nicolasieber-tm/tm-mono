-- ============================================================================
-- Follow-up-Strecke für den Funnel lp-start
-- ============================================================================
-- Ausgangslage: Es gab genau eine automatische Mail (send-video-email), danach
-- nichts. Wer das Video nie öffnete, wer es zur Hälfte sah oder wer es zu Ende
-- sah und trotzdem nicht buchte, wurde nie wieder angesprochen — obwohl der
-- Klick, der ihn hergebracht hat, bereits bezahlt war.
--
-- Diese Migration legt an, was der Versand dafür braucht:
--   1. eine Abmeldespalte an leads (Pflicht, sobald mehr als eine Mail geht)
--   2. eine Protokolltabelle, die Doppelversand ausschliesst
--   3. einen stündlichen Job, der die Versand-Funktion aufruft
--
-- Idempotent: lässt sich gefahrlos erneut ausführen.
-- ============================================================================

-- --- 1. Abmeldung ----------------------------------------------------------
-- Wer sich abmeldet, bekommt keine Folgemail mehr. Die Video-Mail selbst ist
-- davon unberührt: Sie ist die angeforderte Auslieferung, keine Werbung.
alter table public.leads
  add column if not exists followup_abgemeldet_am timestamptz;

comment on column public.leads.followup_abgemeldet_am is
  'Zeitpunkt der Abmeldung von der Follow-up-Strecke. Gesetzt über die Edge Function send-followup (GET ?abmelden=<meta_event_id>).';

-- --- 2. Versandprotokoll ---------------------------------------------------
create table if not exists public.lead_followups (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  stufe       smallint not null check (stufe between 1 and 3),
  gesendet_am timestamptz not null default now(),
  -- Diese Sperre ist der eigentliche Schutz: Selbst wenn der Job doppelt läuft
  -- oder ein Versand mittendrin abbricht, bekommt niemand dieselbe Stufe zweimal.
  constraint lead_followups_einmal_pro_stufe unique (lead_id, stufe)
);

comment on table public.lead_followups is
  'Protokoll der versendeten Follow-up-Mails. Ein Datensatz je Lead und Stufe.';

create index if not exists lead_followups_lead_idx on public.lead_followups (lead_id);

-- Niemand ausser dem Server hat hier etwas zu suchen: RLS an, keine Policy für
-- anon. Die Edge Function arbeitet mit dem Service-Role-Schlüssel und umgeht RLS.
alter table public.lead_followups enable row level security;

-- --- 3. Stündlicher Aufruf -------------------------------------------------
-- Die Funktion selbst entscheidet, welche Leads fällig sind; der Job muss nur
-- regelmässig anklopfen. Stündlich reicht, weil die Abstände in Tagen zählen.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Vorherige Fassung entfernen, damit ein erneuter Lauf nicht doppelt plant.
select cron.unschedule('followup-lp-start')
where exists (select 1 from cron.job where jobname = 'followup-lp-start');

-- HINWEIS ZUM EINSETZEN:
-- <PROJEKT-REF> und <SECRET> vor dem Ausführen ersetzen. Das Secret ist
-- dasselbe, das send-video-email und meta-capi bereits prüfen
-- (VIDEO_EMAIL_SECRET bzw. LEAD_NOTIFY_SECRET).
select cron.schedule(
  'followup-lp-start',
  '17 * * * *',                      -- stündlich zur Minute 17, ausserhalb der vollen Stunde
  $$
  select net.http_post(
    url     := 'https://<PROJEKT-REF>.supabase.co/functions/v1/send-followup',
    headers := jsonb_build_object(
                 'Content-Type',      'application/json',
                 'x-webhook-secret',  '<SECRET>'
               ),
    body    := '{}'::jsonb
  );
  $$
);
