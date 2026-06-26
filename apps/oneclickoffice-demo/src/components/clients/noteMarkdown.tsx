import type { ReactNode } from "react";

/** Tailwind-gestylte react-markdown components-Map für Sitzungsnotizen. */
export const noteMarkdownComponents = {
  p: (props: { children?: ReactNode }) => (
    <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
  ),
  strong: (props: { children?: ReactNode }) => (
    <strong className="font-semibold" {...props} />
  ),
  em: (props: { children?: ReactNode }) => <em className="italic" {...props} />,
  ul: (props: { children?: ReactNode }) => (
    <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />
  ),
  ol: (props: { children?: ReactNode }) => (
    <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />
  ),
  li: (props: { children?: ReactNode }) => <li className="leading-relaxed" {...props} />,
  code: (props: { children?: ReactNode; className?: string }) => {
    const isBlock = props.className?.includes("language-");
    return isBlock ? (
      <code className="block rounded bg-muted px-3 py-2 font-mono text-sm my-2" {...props} />
    ) : (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]" {...props} />
    );
  },
  a: (props: { href?: string; children?: ReactNode }) => (
    <a
      className="text-primary underline underline-offset-2 hover:text-primary/80"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  h1: (props: { children?: ReactNode }) => (
    <h1 className="text-lg font-semibold mt-3 mb-2" {...props} />
  ),
  h2: (props: { children?: ReactNode }) => (
    <h2 className="text-base font-semibold mt-3 mb-2" {...props} />
  ),
  h3: (props: { children?: ReactNode }) => (
    <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />
  ),
  blockquote: (props: { children?: ReactNode }) => (
    <blockquote
      className="border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground my-2"
      {...props}
    />
  ),
};
