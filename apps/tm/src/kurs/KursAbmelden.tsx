import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import { KURS } from "@/data/kurs";
import { WIDGET_KURS } from "@/lib/booking";
import { kursEvent } from "./api";
import { useNoindex } from "./noindex";

/* Abmeldelink aus den Kurs-Mails: /kurs/abmelden?t=<token> */
export default function KursAbmelden() {
  const [state, setState] = useState<"laeuft" | "ok" | "fehler">("laeuft");
  const [token, setToken] = useState("");
  useNoindex();

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t") || "";
    setToken(t);
    if (!/^[0-9a-f]{32}$/.test(t)) { setState("fehler"); return; }
    kursEvent(t, "abmelden")
      .then((r) => setState(r.ok ? "ok" : "fehler"))
      .catch(() => setState("fehler"));
  }, []);

  return (
    <SiteLayout title="Abmeldung Minikurs · Trending Media" widgetId={WIDGET_KURS} slimNav={{ links: [] }}>
      <section className="ap-hero ap-hero-sub">
        <div className="wrap">
          <div className="kick">Minikurs</div>
          {state === "laeuft" && <h1>Einen Moment …</h1>}
          {state === "ok" && (
            <>
              <h1>Sie sind <span className="g">abgemeldet.</span></h1>
              <p className="sub">Sie bekommen keine weiteren Kurs-Mails von uns. Ihr Kurslink bleibt gültig, falls Sie die Lektionen später noch anschauen möchten.</p>
              <div className="acts">
                <Link className="p" to={`/kurs/k/${token}/1`}>Zum Kurs</Link>
                <Link className="s" to="/">Zur Startseite</Link>
              </div>
            </>
          )}
          {state === "fehler" && (
            <>
              <h1>Das hat leider <span className="g">nicht geklappt.</span></h1>
              <p className="sub">Der Abmeldelink ist unvollständig. Schreiben Sie uns kurz an {KURS.person.mail}, dann tragen wir Sie von Hand aus.</p>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
