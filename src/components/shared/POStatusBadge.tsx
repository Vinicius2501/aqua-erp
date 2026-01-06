import { cn } from "@/lib/utils";
import type { POStatus } from "@/types/domain";
import { useLanguage } from "@/contexts/LanguageContext";

interface POStatusBadgeProps {
  status: POStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<
  POStatus,
  { className: string; dotClassName: string }
> = {
  rascunho: {
    className: "bg-muted/30 text-muted-foreground border-muted/50",
    dotClassName: "bg-muted-foreground",
  },
  aguardando_aprovacao: {
    className: "bg-info/10 text-info border-info/30",
    dotClassName: "bg-info",
  },
  aprovada: {
    className: "bg-success/10 text-success border-success/30",
    dotClassName: "bg-success",
  },
  reprovada: {
    className: "bg-destructive/10 text-destructive border-destructive/30",
    dotClassName: "bg-destructive",
  },
  finalizada: {
    className: "bg-primary/10 text-primary border-primary/30",
    dotClassName: "bg-primary",
  },
};

export function POStatusBadge({
  status,
  size = "md",
  className,
}: POStatusBadgeProps) {
  const config = statusConfig[status];
  const { t } = useLanguage();

  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium border",
          size === "sm" && "px-2 py-0.5 text-[10px]",
          size === "md" && "px-2.5 py-1 text-xs",
          size === "lg" && "px-3 py-1.5 text-sm",
          "bg-muted/20 text-muted-foreground border-muted/30",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        {String(status)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm",
        config.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClassName)} />
      {t(`status.${status}`)}
    </span>
  );
}
