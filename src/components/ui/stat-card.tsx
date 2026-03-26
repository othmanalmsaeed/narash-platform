import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StripColor = "primary" | "success" | "warning" | "info" | "destructive" | "accent";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  strip?: StripColor;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const iconColorMap: Record<StripColor, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
  destructive: "text-destructive",
  accent: "text-accent",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  strip = "primary",
  subtitle,
  className,
  onClick,
  children,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        `stat-strip-${strip} card-interactive`,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50", iconColorMap[strip])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold animate-count-up">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  );
}
