import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "open" | "partial" | "closed";
}

const variantClasses = {
  default: "bg-zinc-100 text-zinc-700",
  open: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  closed: "bg-zinc-200 text-zinc-500",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
