-- Auswertung der Branchen-Landingpages von trendingmedia.ch (/handwerk …).
-- Die Seiten schreiben in dieselbe Tabelle lp_events, source = 'tm-<slug>'
-- (apps/tm/src/lib/track.ts). Gezählt werden Besuche (session_id), nicht Ereignisse.
create or replace view public.v_tm_nischen
with (security_invoker = true) as
select
  source,
  coalesce(utm ->> 'utm_campaign', '(ohne Kampagne)') as kampagne,
  min((created_at at time zone 'Europe/Zurich')::date) as erster_tag,
  max((created_at at time zone 'Europe/Zurich')::date) as letzter_tag,
  count(distinct session_id) filter (where event = 'page_view') as besuche,
  count(distinct session_id) filter (where event = 'page_view' and device = 'mobile') as besuche_mobile,
  count(distinct session_id) filter (where event = 'calc_use') as rechner_genutzt,
  count(distinct session_id) filter (where event = 'cta_click' and meta ->> 'cta_id' like 'booking%') as buchung_geklickt,
  count(distinct session_id) filter (where event = 'cta_click' and meta ->> 'cta_id' like 'phone%') as telefon_geklickt,
  count(distinct session_id) filter (where event = 'cta_click' and meta ->> 'cta_id' like 'mail%') as mail_geklickt,
  count(distinct session_id) filter (where event = 'cta_click' and meta ->> 'cta_id' = 'fallstudie') as fallstudie_geklickt,
  round(100.0 * count(distinct session_id) filter (where event = 'cta_click' and meta ->> 'cta_id' like 'booking%')
        / nullif(count(distinct session_id) filter (where event = 'page_view'), 0), 1) as quote_buchung_pct,
  count(distinct session_id) filter (where event = 'cta_click' and meta ->> 'cta_id' like 'callback%') as rueckruf_geoeffnet,
  count(distinct session_id) filter (where event = 'callback_submit') as rueckruf_angefordert
from public.lp_events
where source like 'tm-%'
group by source, coalesce(utm ->> 'utm_campaign', '(ohne Kampagne)')
order by source, besuche desc;

revoke all on public.v_tm_nischen from anon;
grant select on public.v_tm_nischen to authenticated;
