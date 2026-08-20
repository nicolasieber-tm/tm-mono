-- ============================================================================
-- Follow-up-Strecke für den Funnel lp-start
-- ============================================================================
-- Ausgangslage: Es gab genau eine automatische Mail (send-video-email), danach
-- nichts. Wer das Video nie öffnete, wer es zur Hälfte sah oder wer es zu Ende
-- sah und trotzdem nicht buchte, wurde nie wieder angesprochen — obwohl der
-- Klick, der ihn hergebracht hat, bereits bezahlt war.
--
-- Teil 1 und 2 sind am 20.08.2026 auf uzsyjoicirquqjejmutf angewendet
-- (Migration `followup_strecke_lp_start`):
--   1. eine Abmeldespalte an leads (Pflicht, sobald mehr als eine Mail geht)
--   2. eine Protokolltabelle, die Doppelversand ausschliesst
--
-- Teil 3 (der stündliche Job) steht unten als Anleitung und ist NOCH NICHT
-- eingeplant — er setzt voraus, dass die Edge Function deployt und das
-- Shared-Secret im Vault hinterlegt ist.
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

-- --- 3. Stündlicher Aufruf ---------------------------------------------
-- Dieser Abschnitt ist NICHT Teil der oben angewendeten Migration.
-- Er wird erst ausgeführt, wenn die Edge Function send-followup deployt ist —
-- sonst klopft der Job stündlich gegen eine Adresse, die es nicht gibt.
--
-- Das Shared-Secret steht bewusst nicht in dieser Datei. Es liegt derzeit
-- hartcodiert in den Trigger-Funktionen (send_video_email_on_lead und andere);
-- sauberer ist der Vault, deshalb liest der Job es von dort.
--
-- SCHRITT 1 — Secret einmalig im Vault ablegen (im SQL-Editor ausführen,
--             <SECRET> durch dasselbe Secret ersetzen, das die bestehenden
--             Trigger verwenden):
--
--   select vault.create_secret('<SECRET>', 'oco_webhook_secret',
--                              'Shared-Secret der lp-start Edge Functions');
--
-- SCHRITT 2 — Job einplanen:
--
--   select cron.schedule(
--     'followup-lp-start',
--     '17 * * * *',                    -- stündlich, bewusst nicht zur vollen Stunde
--     $job$
--     select net.http_post(
--       url     := 'https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/send-followup',
--       headers := jsonb_build_object(
--                    'Content-Type',     'application/json',
--                    'x-webhook-secret', (select decrypted_secret
--                                           from vault.decrypted_secrets
--                                          where name = 'oco_webhook_secret')
--                  ),
--       body    := '{}'::jsonb
--     );
--     $job$
--   );
--
-- Anhalten:  select cron.unschedule('followup-lp-start');
-- Nachsehen: select * from cron.job_run_details
--            where jobid = (select jobid from cron.job where jobname = 'followup-lp-start')
--            order by start_time desc limit 10;
