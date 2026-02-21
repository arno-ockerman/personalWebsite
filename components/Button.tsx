import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-primary/30";
  const styles: Record<Variant, string> = {
    primary: "bg-brand-primary text-brand-bg shadow-brand hover:opacity-95",
    secondary:
      "border border-brand-primary/20 bg-white text-brand-primary shadow-soft hover:border-brand-primary/40",
    ghost: "text-brand-primary hover:bg-brand-primary/5",
  };

  return (
    <Link href={href} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

