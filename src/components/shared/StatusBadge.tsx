import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { POStatus } from "@/types/domain";

type BadgeStatus = POStatus;

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<
  BadgeStatus,
  { labelkey: string; className: string }
> = {
  rascunho: {
    labelkey: "status.rascunho",
    className: "bg-muted/20 text-muted-foreground border-muted/30",
  },
  aguardando_aprovacao: {
    labelkey: "status.aguardando_aprovacao",
    className: "bg-info/10 text-info border-info/30",
  },
  aprovada: {
    labelkey: "status.aprovada",
    className: "bg-success/10 text-success border-success/30",
  },
  reprovada: {
    labelkey: "status.reprovada",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  finalizada: {
    labelkey: "status.finalizada",
    className: "bg-success/10 text-success border-success/30",
  },
};

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const { t } = useLanguage();
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        config.className,
        className
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}
