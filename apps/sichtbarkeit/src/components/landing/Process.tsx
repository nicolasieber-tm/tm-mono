const steps = [
  {
    n: "01",
    title: "Kostenlose Analyse",
    text: "Wir schauen uns Ihren aktuellen Auftritt an und sagen Ihnen ehrlich, was gut funktioniert und wo Anfragen verloren gehen.",
  },
  {
    n: "02",
    title: "Klares Konzept",
    text: "Sie erhalten verständliche Empfehlungen und einen konkreten Vorschlag, abgestimmt auf Ihr Unternehmen und Ihr Budget.",
  },
  {
    n: "03",
    title: "Saubere Umsetzung",
    text: "Wir setzen die Website um, mit klaren Abstimmungen, festen Terminen und ohne, dass Sie sich um Technik kümmern müssen.",
  },
];

export const Process = () => {
  return (
    <section id="ablauf" className="bg-gradient-soft py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">Ablauf</p>
          <h2 className="text-3xl sm:text-4xl">In drei einfachen Schritten</h2>
          <p className="mt-4 text-muted-foreground">
            Unkompliziert, transparent und ohne Verpflichtung. Sie entscheiden nach jedem Schritt selbst.
          </p>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-border bg-background text-sm font-semibold text-primary">
                {s.n}
              </div>
              <h3 className="text-lg">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
