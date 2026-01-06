import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { POStep } from "@/types/domain";

type BadgeStep = POStep;

interface StepBadgeProps {
  step: POStep;
  size?: "sm" | "md";
  className?: string;
}

const stepConfig: Record<BadgeStep, { className: string }> = {
  rascunho: {
    className: "bg-muted/20 text-muted-foreground border-muted/30",
  },
  aguardando_aprovacao: {
    className: "bg-info/10 text-info border-info/30",
  },
  aguardando_contrato: {
    className: "bg-info/10 text-info border-info/30",
  },
  realizando_pagamentos: {
    className: "bg-info/10 text-info border-info/30",
  },
  reprovada: {
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  baixada: {
    className: "bg-success/10 text-success border-success/30",
  },
};

export function StepBadge({ step, size = "md", className }: StepBadgeProps) {
  const config = stepConfig[step];
  const { t } = useLanguage();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        config.className,
        className
      )}
    >
      {t(`step.${step}`)}
    </span>
  );
}
