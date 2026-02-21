import { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-brand-primary/15 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-brand-primary">
      {children}
    </span>
  );
}

