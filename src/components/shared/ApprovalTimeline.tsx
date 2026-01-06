import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { POApprovalStep, POApprovalStatus } from "@/types/domain";

interface ApprovalTimelineProps {
  steps: POApprovalStep[];
  className?: string;
}

const getStatusConfig = (status: POApprovalStatus) => {
  switch (status) {
    case "aprovado":
      return {
        icon: CheckCircle2,
        iconClassName: "text-success",
        bgClassName: "bg-success/10",
        lineClassName: "bg-success",
        label: "Aprovado",
      };
    case "rejeitado":
      return {
        icon: XCircle,
        iconClassName: "text-destructive",
        bgClassName: "bg-destructive/10",
        lineClassName: "bg-destructive",
        label: "Rejeitado",
      };
    case "pendente":
    default:
      return {
        icon: Clock,
        iconClassName: "text-warning",
        bgClassName: "bg-warning/10",
        lineClassName: "bg-border",
        label: "Pendente",
      };
  }
};

export function ApprovalTimeline({ steps, className }: ApprovalTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  if (sortedSteps.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-8 text-muted-foreground",
          className
        )}
      >
        <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
        <p className="text-sm">Nenhuma etapa de aprovação encontrada</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {sortedSteps.map((step, index) => {
        const config = getStatusConfig(step.status);
        const Icon = config.icon;
        const isLast = index === sortedSteps.length - 1;
        const isRejected = step.status === "rejeitado";

        return (
          <div key={step.id} className="relative">
            <div className="flex gap-3">
              {/* Timeline node - smaller */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all",
                    config.bgClassName,
                    isRejected && "ring-2 ring-destructive/30"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", config.iconClassName)} />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 h-full min-h-6 transition-colors",
                      config.lineClassName
                    )}
                  />
                )}
              </div>

              {/* Content - more compact */}
              <div className={cn("pb-4 flex-1 min-w-0", isLast && "pb-0")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {step.approverName}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0",
                      step.status === "aprovado" &&
                        "bg-success/10 text-success",
                      step.status === "rejeitado" &&
                        "bg-destructive/10 text-destructive",
                      step.status === "pendente" && "bg-warning/10 text-warning"
                    )}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Timestamp */}
                {step.decidedAt && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {format(new Date(step.decidedAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                )}

                {/* Comment - compact */}
                {step.comments && (
                  <div
                    className={cn(
                      "mt-1.5 p-2 rounded text-xs",
                      isRejected
                        ? "bg-destructive/5 border border-destructive/20"
                        : "bg-muted/50"
                    )}
                  >
                    <p className="text-foreground italic line-clamp-2">
                      "{step.comments}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
