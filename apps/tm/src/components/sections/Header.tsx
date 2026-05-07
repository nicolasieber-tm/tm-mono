import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

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
          <img src={logo} alt="Trending Media Logo" className="h-7 w-auto" />
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
