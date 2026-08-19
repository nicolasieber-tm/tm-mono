import { Quote } from "lucide-react";
import { testimonial } from "@/lib/content";
import ScrollReveal from "./ScrollReveal";

/**
 * Referenz. `compact` ist die Variante für die Opt-in-Seite: dort soll das
 * Testimonial den Eintrag stützen, ihn aber nicht mit einem eigenen Kapitel
 * vom Formular wegziehen.
 */
const Testimonial = ({ compact = false }: { compact?: boolean }) => {
  // Die kompakte Variante steht auf der Opt-in-Seite neben dem Formular und
  // wird bewusst OHNE Einblenden gerendert: dort darf kein Inhalt von einer
  // Animation abhängen, die auf trägen Geräten womöglich nie auslöst.
  const figure = (
    <figure
      className={`rounded-2xl border border-border bg-white shadow-sm ${
        compact ? "p-5 md:p-6" : "p-6 md:p-9"
      }`}
    >
      {!compact && (
        <Quote className="mb-4 h-8 w-8 fill-accent-soft text-accent-soft" aria-hidden />
      )}

      <blockquote
        className={`text-text-primary ${
          compact
            ? "text-[1.0625rem] font-medium leading-relaxed"
            : "text-xl font-medium leading-relaxed md:text-2xl"
        }`}
      >
        „{testimonial.quote}"
      </blockquote>

      <figcaption className="mt-5 flex items-center gap-3">
        <img
          src={testimonial.image}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          decoding="async"
          className="h-11 w-11 rounded-full object-cover"
        />
        <div className="text-sm leading-tight">
          <p className="font-semibold text-text-primary">{testimonial.name}</p>
          <p className="text-text-muted">{testimonial.role}</p>
        </div>
      </figcaption>

      {compact && (
        <p className="mt-4 border-t border-border pt-4 text-sm font-medium text-accent-deep">
          {testimonial.highlight}
        </p>
      )}
    </figure>
  );

  return compact ? figure : <ScrollReveal>{figure}</ScrollReveal>;
};

export default Testimonial;
