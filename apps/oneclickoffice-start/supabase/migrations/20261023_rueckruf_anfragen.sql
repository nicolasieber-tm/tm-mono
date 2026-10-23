-- Rückruf-Anfragen von trendingmedia.ch (z. B. /handwerk).
-- Ablauf: Website → Edge Function `rueckruf` (prüft Eingaben, sendet Telegram)
-- → rueckruf_anfordern() mit Service-Role. Die Funktion legt den Kontakt in der
-- Orbit-Pipeline an (bzw. ergänzt einen bestehenden mit gleicher Nummer) und
-- schreibt einen Verlaufseintrag.

create table if not exists public.rueckruf_anfragen (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  betrieb text not null,
  telefon text not null,
  seite text,
  utm jsonb not null default '{}'::jsonb,
  client_id uuid references public.clients(id) on delete set null
);
alter table public.rueckruf_anfragen enable row level security;
create policy "angemeldete koennen rueckrufe lesen" on public.rueckruf_anfragen
  for select to authenticated using (true);
revoke all on public.rueckruf_anfragen from anon;

create or replace function public.rueckruf_anfordern(
  p_name text, p_betrieb text, p_telefon text,
  p_seite text default null, p_utm jsonb default '{}'::jsonb
) returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_name text := left(btrim(coalesce(p_name, '')), 120);
  v_betrieb text := left(btrim(coalesce(p_betrieb, '')), 160);
  v_tel text := left(btrim(coalesce(p_telefon, '')), 40);
  v_digits text := regexp_replace(coalesce(p_telefon, ''), '\D', '', 'g');
  v_seite text := left(coalesce(p_seite, ''), 200);
  v_utm jsonb := case when jsonb_typeof(p_utm) = 'object' then p_utm else '{}'::jsonb end;
  v_client uuid;
  v_neu boolean := false;
begin
  if length(v_name) < 2 or length(v_betrieb) < 2 or length(v_digits) < 9 or length(v_digits) > 15 then
    raise exception 'ungueltige_eingabe' using errcode = '22023';
  end if;

  -- gleiche Nummer innerhalb 10 Minuten nur einmal, höchstens 30 Anfragen pro Stunde
  if exists (select 1 from rueckruf_anfragen
             where regexp_replace(telefon, '\D', '', 'g') = v_digits
               and created_at > now() - interval '10 minutes') then
    return 'doppelt';
  end if;
  if (select count(*) from rueckruf_anfragen where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'zu_viele_anfragen' using errcode = '54000';
  end if;

  -- bestehenden Kontakt über die letzten 9 Ziffern der Nummer finden
  select id into v_client from clients
   where right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = right(v_digits, 9)
      or right(regexp_replace(coalesce(mobile_phone, ''), '\D', '', 'g'), 9) = right(v_digits, 9)
   limit 1;

  if v_client is null then
    insert into clients (company_name, contact_name, phone, pipeline_status, quelle, zustaendig, follow_up_datum)
    values (v_betrieb, v_name, v_tel, 'interessiert', 'website', 'nicola', current_date)
    returning id into v_client;
    v_neu := true;
  else
    update clients set follow_up_datum = current_date, zustaendig = coalesce(zustaendig, 'nicola')
     where id = v_client;
  end if;

  insert into client_events (client_id, typ, text, autor, meta)
  values (v_client, 'system',
          concat('Rückruf angefordert über trendingmedia.ch', nullif(v_seite, ''), ': ', v_name, ', ', v_betrieb, ', ', v_tel),
          'Website', jsonb_build_object('rueckruf', true, 'seite', v_seite, 'utm', v_utm));

  insert into rueckruf_anfragen (name, betrieb, telefon, seite, utm, client_id)
  values (v_name, v_betrieb, v_tel, v_seite, v_utm, v_client);

  return case when v_neu then 'neu' else 'bestehend' end;
end;
$$;

revoke all on function public.rueckruf_anfordern(text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.rueckruf_anfordern(text, text, text, text, jsonb) to service_role;
