import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary/5 border-primary/20",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  danger: "bg-destructive/5 border-destructive/20",
};

const iconVariantStyles = {
  default: "bg-subtle-fill text-muted",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-success";
    if (trend.value < 0) return "text-destructive";
    return "text-muted";
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={cn(
        "p-6 rounded-lg border border-border transition-all duration-200 hover:shadow-card-hover",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        {Icon && (
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              iconVariantStyles[variant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-semibold text-foreground tracking-tight">
          {value}
        </p>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>

      {trend && TrendIcon && (
        <div
          className={cn(
            "flex items-center gap-1 mt-3 text-sm",
            getTrendColor()
          )}
        >
          <TrendIcon className="h-4 w-4" />
          <span className="font-medium">
            {trend.value > 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-text-secondary">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
