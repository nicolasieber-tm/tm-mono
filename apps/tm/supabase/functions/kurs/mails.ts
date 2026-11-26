// Mail-Texte der Minikurs-Sequenz (8 Stufen). Siehe index.ts für den Versand.
//
// Ton: persönlich, Sie-Form, Schweizer Rechtschreibung (ss statt ß).
// Lektionstitel identisch zu apps/tm/src/data/kurs.ts halten.
//
// Layout bewusst schlicht (sieht aus wie eine persönliche Mail mit einem
// Knopf): landet seltener im Promotions-Tab und passt zum Absender Nicola.

export type MailLead = {
  token: string;
  name: string;
  firma: string;
  aufgaben: string[] | null;
};

export type MailCtx = {
  site: string; // https://trendingmedia.ch
  bookingUrl: string; // direkter Link aufs Buchungs-Widget
};

export type Mail = { subject: string; preheader: string; html: string; text: string };

const LOGO = "https://trendingmedia.ch/logo-schwarz.png";
const SIGNATUR_TEXT = "Freundliche Grüsse\nNicola Sieber\nTrending Media, Solothurn";

const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** HTML-Schnipsel → Klartext (Links als «Text: URL», Entities aufgelöst) */
const plain = (s: string) =>
  s
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, (_m, href: string, t: string) => `${t}: ${href.replace(/&amp;/g, "&")}`)
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&rarr;/g, "→").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

export const lektionUrl = (c: MailCtx, l: MailLead, nr: number, stufe: number) =>
  `${c.site}/kurs/k/${l.token}/${nr}?m=${stufe}`;
export const checkUrl = (c: MailCtx, l: MailLead, stufe: number) =>
  `${c.site}/kurs/k/${l.token}/5?m=${stufe}#book-widget`;
export const abmeldeUrl = (c: MailCtx, l: MailLead) => `${c.site}/kurs/abmelden?t=${l.token}`;

/* ---------------- Bausteine ---------------- */

type Block =
  | { p: string } // Absatz, darf <b>/<i> enthalten (nur aus unseren Texten!)
  | { btn: string; href: string }
  | { liste: string[] } // nur feste Texte, wird nicht escaped
  | { aufgaben: true };

function render(c: MailCtx, l: MailLead, preheader: string, blocks: Block[]): { html: string; text: string } {
  const P = (s: string) =>
    `<p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1b1a1e;">${s}</p>`;
  const aufgaben = (l.aufgaben ?? []).filter(Boolean);
  const html: string[] = [];
  const text: string[] = [];

  html.push(P(`Guten Tag ${esc(l.name)},`));
  text.push(`Guten Tag ${l.name},`, "");

  for (const b of blocks) {
    if ("p" in b) {
      html.push(P(b.p));
      text.push(plain(b.p), "");
    } else if ("btn" in b) {
      html.push(
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px;"><tr>` +
          `<td bgcolor="#1b1a1e" style="border-radius:999px;">` +
          `<a href="${esc(b.href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${b.btn}</a>` +
          `</td></tr></table>`,
      );
      text.push(`${plain(b.btn).replace("→", "").trim()}: ${b.href}`, "");
    } else if ("liste" in b) {
      html.push(
        `<ul style="margin:0 0 16px;padding-left:22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1b1a1e;">` +
          b.liste.map((x) => `<li style="margin:0 0 6px;">${x}</li>`).join("") +
          `</ul>`,
      );
      text.push(...b.liste.map((x) => `- ${plain(x)}`), "");
    } else if ("aufgaben" in b && aufgaben.length) {
      html.push(
        P("Ihre drei Aufgaben aus Lektion 1:") +
          `<ol style="margin:0 0 16px;padding-left:22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1b1a1e;">` +
          aufgaben.map((a) => `<li style="margin:0 0 4px;">${esc(a)}</li>`).join("") +
          `</ol>`,
      );
      text.push("Ihre drei Aufgaben aus Lektion 1:", ...aufgaben.map((a, i) => `${i + 1}. ${a}`), "");
    }
  }

  html.push(P(`Freundliche Grüsse<br><b>Nicola Sieber</b><br><span style="color:#6b6a70;">Trending Media, Solothurn</span>`));
  text.push(SIGNATUR_TEXT, "", "—", `Sie erhalten diese Mail, weil Sie sich für den kostenlosen Minikurs von Trending Media angemeldet haben.`, `Abmelden: ${abmeldeUrl(c, l)}`);

  const doc = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Minikurs</title></head>
<body style="margin:0;padding:0;background:#fdfbf8;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fdfbf8;">
<tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;border:1px solid #efe9e2;">
<tr><td style="height:3px;line-height:3px;font-size:0;border-radius:18px 18px 0 0;background:#8b5cf6;background-image:linear-gradient(105deg,#ff9a3c,#ff6a2c 24%,#8b5cf6 58%,#2f9fd6 88%,#6cc6f5);">&nbsp;</td></tr>
<tr><td style="padding:26px 32px 4px;"><img src="${LOGO}" alt="Trending Media" height="26" style="height:26px;width:auto;display:block;border:0;"></td></tr>
<tr><td style="padding:18px 32px 8px;">${html.join("\n")}</td></tr>
<tr><td style="padding:16px 32px 26px;border-top:1px solid #f1ece6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#9a979f;">
Sie erhalten diese Mail, weil Sie sich für den kostenlosen Minikurs von Trending Media angemeldet haben.<br>
Trending Media · Solothurn · <a href="${c.site}" style="color:#9a979f;">trendingmedia.ch</a> · <a href="${esc(abmeldeUrl(c, l))}" style="color:#9a979f;">Vom Minikurs abmelden</a>
</td></tr>
</table></td></tr></table></body></html>`;

  return { html: doc, text: text.join("\n") };
}

/* ---------------- die 8 Mails ---------------- */

export function kursMail(stufe: number, l: MailLead, c: MailCtx): Mail {
  const L = (nr: number) => lektionUrl(c, l, nr, stufe);
  let subject = "";
  let preheader = "";
  let blocks: Block[] = [];

  switch (stufe) {
    case 1:
      subject = "Ihr Minikurs startet: Lektion 1 von 5";
      preheader = "Wo KI im Handwerksbetrieb wirklich Zeit spart, in 6 Minuten.";
      blocks = [
        { p: "schön, dass Sie dabei sind. Der Kurs hat fünf kurze Lektionen, zusammen gut eine halbe Stunde, ohne Fachchinesisch. Alle sind schon freigeschaltet: Sie können alles an einem Abend schauen oder jeden Tag eine. Ich erinnere Sie die nächsten Tage per Mail an die nächste Lektion." },
        { p: "Heute geht es um die Frage, wo KI in einem Handwerksbetrieb wirklich Zeit spart. Kleiner Vorgriff: nicht auf der Baustelle, sondern im Büro. Bei Mails, Rapporten, Offerten und Administration." },
        { btn: "Lektion 1 ansehen &rarr;", href: L(1) },
        { p: "<b>Ihre Aufgabe für heute:</b> Notieren Sie die drei nervigsten Aufgaben, die in Ihrem Betrieb jede Woche wiederkommen. Sie können sie direkt in der Lektion eintragen. Sie brauchen sie in Lektion 4 und 5." },
        { p: "PS: Wenn Sie eine Frage haben, antworten Sie einfach auf diese Mail. Sie landet direkt bei mir." },
      ];
      break;

    case 2:
      subject = "Lektion 2: Ihr erster Quick Win mit KI";
      preheader = "Ein fertiger Prompt für Offertentexte. Kopieren, einfügen, fertig.";
      blocks = [
        { p: "gestern ging es darum, wo im Betrieb die Zeit liegt. Heute machen Sie selbst den ersten Schritt: ChatGPT schreibt aus ein paar Stichworten den Begleittext zu einer Offerte." },
        { p: "Ich gebe Ihnen den fertigen Prompt zum Kopieren. Das dauert fünf Minuten, und Sie sehen sofort, ob es für Sie funktioniert." },
        { btn: "Lektion 2 ansehen &rarr;", href: L(2) },
        { p: "Ein Hinweis vorab: Geben Sie in Gratis-Tools keine Kundennamen oder Adressen ein. In der Lektion zeige ich, wie Sie das einfach umgehen." },
      ];
      break;

    case 3:
      subject = "Lektion 3: Wenn die Arbeit von allein passiert";
      preheader = "Live-Demo: Aus jeder Projekt-Mail wird automatisch ein Zeitrapport.";
      blocks = [
        { p: "ChatGPT hilft, aber Sie müssen immer noch jedes Mal selbst etwas eintippen. Heute zeige ich Ihnen den Schritt danach: eine Automation, die im Hintergrund läuft, ohne dass jemand daran denken muss." },
        { p: "Konkret sehen Sie, wie bei Kohler Elektro Bern aus jeder Projekt-Mail automatisch ein Zeitrapport wird, beim richtigen Projekt. Ergebnis: <b>CHF 2'000 bis 3'000 mehr verrechnet, jeden Monat.</b>" },
        { btn: "Lektion 3 ansehen &rarr;", href: L(3) },
      ];
      break;

    case 4:
      subject = "Lektion 4: Was bringt das in Franken?";
      preheader = "Stunden pro Woche × Stundenansatz × 46 Wochen. Rechnen Sie mit.";
      blocks = [
        { p: "heute wird es konkret. Nehmen Sie Ihre drei Aufgaben aus Lektion 1 und rechnen Sie nach, was sie Ihren Betrieb pro Jahr kosten." },
        { p: "Die Rechnung ist einfach: Stunden pro Woche × Stundenansatz × 46 Arbeitswochen. Ein Beispiel: 3 Stunden pro Woche bei CHF 95 sind über das Jahr <b>CHF 13'110</b>." },
        { aufgaben: true },
        { btn: "Zum Rechner in Lektion 4 &rarr;", href: L(4) },
        { p: "Die meisten Inhaber sind überrascht, wie schnell ein fünfstelliger Betrag zusammenkommt." },
      ];
      break;

    case 5:
      subject = "Lektion 5: Wie die Umsetzung wirklich aussieht";
      preheader = "Schnittstellen, Datenschutz, Tests, Schulung, Wartung. Ehrlich erklärt.";
      blocks = [
        { p: "in der letzten Lektion bin ich ehrlich mit Ihnen: Eine Automation, auf die sich Ihr Betrieb jeden Tag verlassen kann, ist mehr als ein guter Prompt." },
        { p: "Dazu gehören Schnittstellen zu Ihrer Software, Datenschutz nach DSG, Tests mit echten Fällen, eine Schulung für Ihr Team und Wartung. Ich zeige Ihnen, was dabei auf Sie zukommt und was wir Ihnen abnehmen." },
        { btn: "Lektion 5 ansehen &rarr;", href: L(5) },
        { p: "Am Ende der Lektion finden Sie den Link zum kostenlosen <b>20-Minuten-Automations-Check</b>. Bringen Sie Ihre drei Aufgaben mit. Ich sage Ihnen ehrlich, welche sich lohnt und welche nicht." },
      ];
      break;

    case 6:
      subject = "Wie Kohler Elektro CHF 2'000 bis 3'000 pro Monat mehr verrechnet";
      preheader = "Ein Praxisbeispiel aus dem Kurs, ausführlich erzählt.";
      blocks = [
        { p: `Sie haben den Minikurs jetzt eine Woche. Heute noch das Praxisbeispiel aus Lektion 3, etwas ausführlicher.` },
        { p: "<b>Die Ausgangslage:</b> Bei Kohler Elektro Bern passiert ein Teil der Projektarbeit per Mail. Die Zeit dafür musste von Hand dem richtigen Projekt zugeordnet werden. Im Alltag geschah das oft nachträglich, geschätzt oder gar nicht. Verrechenbare Leistungen gingen verloren." },
        { p: "<b>Die Lösung:</b> Eine Automation liest Betreff und Text jeder relevanten Mail aus Outlook, erkennt die Projektnummer und übergibt die Zeit direkt an die bestehende Zeiterfassung. Von der Idee bis zum Einsatz dauerte es rund drei bis vier Wochen." },
        { p: "<b>Das Ergebnis:</b> Exakte Rapporte statt Schätzungen und CHF 2'000 bis 3'000 mehr verrechnet, jeden Monat. Die Automation hatte sich nach kurzer Zeit bezahlt gemacht." },
        { btn: "Ganze Fallstudie lesen &rarr;", href: `${c.site}/kundenstimmen/kohler-elektro` },
        { p: `Wenn Sie wissen möchten, ob so etwas bei ${esc(l.firma)} auch funktioniert: Im 20-Minuten-Check schauen wir uns Ihre drei Aufgaben gemeinsam an. <a href="${esc(checkUrl(c, l, stufe))}" style="color:#1b1a1e;font-weight:600;">Hier können Sie einen Termin wählen</a>` },
      ];
      break;

    case 7:
      subject = "Was im 20-Minuten-Check passiert (und was nicht)";
      preheader = "Kein Verkaufsgespräch. Eine ehrliche Einschätzung Ihrer drei Aufgaben.";
      blocks = [
        { p: "vielleicht zögern Sie mit dem Automations-Check, weil Sie ein Verkaufsgespräch befürchten. Deshalb kurz und ehrlich, wie die 20 Minuten ablaufen:" },
        {
          liste: [
            "Sie schildern Ihre drei Aufgaben aus Lektion 1.",
            "Ich sage Ihnen, welche sich automatisieren lässt und was das ungefähr bringt.",
            "Wenn sich nichts lohnt, sage ich Ihnen das auch.",
          ],
        },
        { aufgaben: true },
        { p: "Per Video-Call, kostenlos, ohne Verpflichtung und ohne Folgekosten." },
        { btn: "20-Minuten-Check buchen &rarr;", href: checkUrl(c, l, stufe) },
      ];
      break;

    case 8:
      subject = "Kurze Frage zum Minikurs";
      preheader = "Haben Sie den Prompt aus Lektion 2 ausprobiert?";
      blocks = [
        { p: "darf ich kurz nachfragen: Haben Sie aus dem Kurs etwas mitgenommen? Wenn Sie den Prompt aus Lektion 2 ausprobiert haben, würde mich interessieren, wie es lief. Eine kurze Antwort auf diese Mail genügt." },
        { p: "Und falls die drei Aufgaben aus Lektion 1 immer noch Zeit fressen: Der 20-Minuten-Check steht weiterhin offen." },
        { btn: "Termin wählen &rarr;", href: checkUrl(c, l, stufe) },
        { p: "Das ist meine letzte Mail zum Kurs. Ihren Kurslink können Sie natürlich weiterhin nutzen." },
      ];
      break;

    default:
      throw new Error(`unbekannte Stufe ${stufe}`);
  }

  const { html, text } = render(c, l, preheader, blocks);
  return { subject, preheader, html, text };
}
