import { useEffect, useRef, useState, type FormEvent } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL, utmParams } from "@/lib/track";
import { StrokeIcon } from "./blocks";

/* =================================================================
   „Rückruf anfordern": Dialog mit Name, Betrieb, Telefon.

   Geht an die Edge Function `rueckruf` (Supabase-Projekt Orbit). Die legt
   den Kontakt in der Orbit-Pipeline an (zuständig Nicola, Follow-up heute)
   und meldet ihn per Telegram. Quelltext: apps/oneclickoffice-start/
   supabase/functions/rueckruf/.

   Geöffnet wird der Dialog über jeden Link mit href="#rueckruf"
   (CallbackDialog hört global darauf, wie SiteLayout beim Buchungs-Widget).
   ================================================================= */

export const CALLBACK_HREF = "#rueckruf";

type State = "form" | "sending" | "done" | "error";

export function CallbackDialog({ onSubmitted }: { onSubmitted?: () => void }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>("form");
  const [err, setErr] = useState("");
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(`a[href="${CALLBACK_HREF}"]`);
      if (!el) return;
      e.preventDefault();
      setState((s) => (s === "done" ? s : "form"));
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => first.current?.focus(), 50);
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [open]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const tel = String(f.get("telefon") || "");
    if (tel.replace(/\D/g, "").length < 9) {
      setErr("Bitte eine vollständige Telefonnummer angeben.");
      return;
    }
    setErr("");
    setState("sending");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/rueckruf`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          name: f.get("name"),
          betrieb: f.get("betrieb"),
          telefon: tel,
          website: f.get("website"),
          seite: window.location.pathname,
          utm: utmParams(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
      onSubmitted?.();
    } catch {
      setState("error");
    }
  }

  if (!open) return null;
  return (
    <div className="cb-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="cb-dialog" role="dialog" aria-modal="true" aria-labelledby="cb-title">
        <button type="button" className="cb-close" aria-label="Schliessen" onClick={() => setOpen(false)}>×</button>
        {state === "done" ? (
          <div className="cb-done">
            <span className="ap-feat-ic"><StrokeIcon name="check" color="url(#tmgrad)" size={26} /></span>
            <h3 id="cb-title">Danke, wir melden uns.</h3>
            <p>Wir rufen Sie in der Regel am selben oder am nächsten Arbeitstag zurück.</p>
            <button type="button" className="ni-btn" onClick={() => setOpen(false)}>Schliessen</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate={false}>
            <span className="ap-feat-ic"><StrokeIcon name="call" color="url(#tmgrad)" size={24} /></span>
            <h3 id="cb-title">Rückruf anfordern</h3>
            <p className="cb-sub">Hinterlassen Sie Ihre Nummer, wir rufen Sie zurück. Kurz, persönlich und unverbindlich.</p>
            <label>
              <span>Name</span>
              <input ref={first} name="name" autoComplete="name" required minLength={2} maxLength={120} />
            </label>
            <label>
              <span>Betrieb</span>
              <input name="betrieb" autoComplete="organization" required minLength={2} maxLength={160} />
            </label>
            <label>
              <span>Telefonnummer</span>
              <input name="telefon" type="tel" inputMode="tel" autoComplete="tel" required placeholder="079 123 45 67" maxLength={40} />
            </label>
            {/* Honeypot: für Menschen unsichtbar */}
            <input className="cb-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            {err && <p className="cb-err">{err}</p>}
            {state === "error" && (
              <p className="cb-err">Das hat leider nicht geklappt. Bitte versuchen Sie es nochmals oder schreiben Sie an info@trendingmedia.ch.</p>
            )}
            <button className="cb-submit" type="submit" disabled={state === "sending"}>
              {state === "sending" ? "Wird gesendet …" : "Rückruf anfordern"}
            </button>
            <small>Wir verwenden Ihre Angaben nur für diesen Rückruf.</small>
          </form>
        )}
      </div>
    </div>
  );
}
