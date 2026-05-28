import { ArrowRight } from "lucide-react";

interface CtaButtonProps {
  text: string;
  size?: "default" | "xl";
  className?: string;
}

const CtaButton = ({ text, size = "default", className = "" }: CtaButtonProps) => {
  const sizeClasses = size === "xl"
    ? "px-8 py-4 text-lg"
    : "px-6 py-3.5 text-base";

  return (
    <a
      href="#erstgespraech"
      className={`inline-flex items-center gap-3 bg-accent text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-accent-deep hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-soft focus:ring-offset-2 ${sizeClasses} ${className}`}
      aria-label={text}
    >
      {text}
      <ArrowRight className="w-5 h-5" />
    </a>
  );
};

export default CtaButton;
