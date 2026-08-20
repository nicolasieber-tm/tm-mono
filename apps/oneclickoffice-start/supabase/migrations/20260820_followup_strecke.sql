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
-- Stand 20.08.2026: Die Edge Functions send-followup, send-video-email und
-- meta-capi sind deployt. Was noch fehlt, sind die beiden Schritte unten.
--
-- Warum das Secret nicht in dieser Datei steht: Es liegt derzeit hartcodiert
-- in den Trigger-Funktionen (send_video_email_on_lead, meta_capi_on_lead,
-- notify_new_lead - alle drei verwenden denselben Wert). Es hier zu wiederholen
-- hiesse, ein Geheimnis an einer vierten Stelle zu pflegen. Der Vault ist dafür
-- da; SCHRITT 1 holt den Wert von dort, wo er schon steht.

-- SCHRITT 1 - Secret in den Vault übernehmen.
-- Der Ausdruck liest den Wert direkt aus der bestehenden Trigger-Funktion, es
-- muss also nichts von Hand herausgesucht oder eingetippt werden. Geprüft: Das
-- Muster greift bei allen drei Funktionen (48 Zeichen).
-- Rückgabe ist die Secret-ID, nicht der Wert.
--
--   select vault.create_secret(
--     (select (regexp_match(pg_get_functiondef(p.oid),
--              'x-webhook-secret[''"]?\s*[,:]\s*[''"]([^''"]+)[''"]'))[1]
--        from pg_proc p
--       where p.proname = 'send_video_email_on_lead'),
--     'oco_webhook_secret',
--     'Shared-Secret der lp-start Edge Functions'
--   );
--
-- Kontrolle, ohne den Wert zu zeigen:
--   select name, length(decrypted_secret) from vault.decrypted_secrets
--    where name = 'oco_webhook_secret';   -- erwartet: 48

-- SCHRITT 2 - Job einplanen.
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
-- SCHRITT 3 - einmal von Hand auslösen und nachsehen, ob 200 zurückkommt:
--
--   select net.http_post(
--     url     := 'https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/send-followup?diag=1',
--     headers := jsonb_build_object(
--                  'Content-Type',     'application/json',
--                  'x-webhook-secret', (select decrypted_secret
--                                         from vault.decrypted_secrets
--                                        where name = 'oco_webhook_secret')
--                ),
--     body    := '{}'::jsonb
--   );
--   -- kurz warten, dann:
--   select status_code, content from net._http_response order by created desc limit 1;
--   -- 200 = alles steht. 401 = Secret stimmt nicht.
--
-- Anhalten:  select cron.unschedule('followup-lp-start');
-- Nachsehen: select * from cron.job_run_details
--            where jobid = (select jobid from cron.job where jobname = 'followup-lp-start')
--            order by start_time desc limit 10;
