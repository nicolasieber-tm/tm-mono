import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const nav = [
  { label: "Leistungen", href: "#leistungen" },
  { label: "Vorgehen", href: "#vorgehen" },
  { label: "Produkte", href: "#produkte" },
  { label: "FAQ", href: "#faq" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
            <span className="absolute inset-0 rounded-full accent-gradient-anim" />
            <span
              className="relative inline-flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-full"
              style={{ backgroundColor: "hsl(var(--c-bg))" }}
            >
              <img
                src="/logo-weiss.png"
                alt="Trending Media"
                className="h-5 w-5 object-contain"
              />
            </span>
          </span>
          <span>Trending Media</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#kontakt">Erstgespräch buchen</a>
          </Button>
          <button
            type="button"
            aria-label="Menü öffnen"
            aria-expanded={open}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container flex flex-col py-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Button asChild size="sm" className="mt-3">
              <a href="#kontakt" onClick={() => setOpen(false)}>
                Erstgespräch buchen
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};
