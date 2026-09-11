import type { ReactNode } from "react";

export function PageHeading({
  eyebrow = "YOUR CLUBHOUSE",
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex items-start justify-between gap-6 max-md:flex-col max-md:gap-4">
      <div>
        <p className="mb-2 text-xs font-medium tracking-widest text-muted">{eyebrow}</p>
        <h1 className="text-2xl lg:text-3xl font-medium leading-tight tracking-tight">{title}</h1>
        <p className="mt-2 text-xs leading-loose text-muted ">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Status({ children }: { children: ReactNode }) {
  const colors = children === "Pending" || children === "Outstanding"
    ? "bg-warning text-warning-foreground"
    : children === "Paid" || children === "Complete"
      ? "bg-success text-success-foreground"
      : "bg-surface-muted text-muted";
  return (
    <span
      className={`inline-block rounded-md px-2 py-1 text-xs ${colors}`}
    >
      {children}
    </span>
  );
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(date));
}
