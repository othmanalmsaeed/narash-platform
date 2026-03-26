import { cn } from "@/lib/utils";
import { LucideIcon, Inbox, Search, FileX, AlertCircle } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant?: "default" | "search" | "error" | "empty";
  className?: string;
}

const variantIcons: Record<string, LucideIcon> = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
  empty: FileX,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <div className={cn("empty-state animate-fade-in", className)}>
      <div className="relative mb-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
          <Icon className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-primary/5 -z-10 blur-xl" />
      </div>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <Button variant="outline" size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
