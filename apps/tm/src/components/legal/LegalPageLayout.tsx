import { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

type LegalPageLayoutProps = {
  title: string;
  intro?: string;
  children: ReactNode;
};

export const LegalPageLayout = ({
  title,
  intro,
  children,
}: LegalPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <img src={logo} alt="Trending Media Logo" className="h-7 w-auto" />
            <span>Trending Media</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Zur Startseite
          </Link>
        </div>
      </header>

      <main className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
              {intro}
            </p>
          ) : null}
          <div className="mt-12 space-y-10">{children}</div>
        </div>
      </main>
    </div>
  );
};

type LegalSectionProps = {
  title: string;
  children: ReactNode;
};

export const LegalSection = ({ title, children }: LegalSectionProps) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
};
