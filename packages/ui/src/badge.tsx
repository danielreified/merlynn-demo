import React, { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        high: "bg-red-500/15 text-red-400 border border-red-500/30",
        medium: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        low: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        default: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, className, children }: BadgeProps): React.JSX.Element {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}
