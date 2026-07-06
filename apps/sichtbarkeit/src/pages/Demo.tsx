/**
 * /demo — Live-Demo des Buchungstools (Modul 4).
 *
 * Die eigentliche Demo ist eine eigenständige, in sich geschlossene HTML-Seite
 * unter /demo/index.html (public/demo/index.html). Sie wird hier per Vollbild-
 * iframe eingebettet: Das iframe ist die CSS-Isolation gegenüber der App und
 * lässt die verschachtelten Tool-iframes (Kunde/Admin) same-origin, sodass die
 * Demo-Buchung via sessionStorage über die Ansichten hinweg funktioniert.
 *
 * Die Route existiert nur, damit die saubere URL /demo greift (SPA-Fallback
 * **→/index.html, siehe public/serve.json). Der statische Inhalt selbst wird
 * als exakte Datei ausgeliefert.
 */
export default function Demo() {
  return (
    <iframe
      src="/demo/index.html"
      title="Buchungstool Live-Demo"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        background: "#fdfbf8",
      }}
    />
  );
}
