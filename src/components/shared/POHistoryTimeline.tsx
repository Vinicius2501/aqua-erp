import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Edit3,
  Send,
  Paperclip,
  CreditCard,
  Receipt,
  Flag,
  MessageSquare,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { POHistoryEvent, POHistoryEventType } from "@/types/domain";
import { useLanguage } from "@/contexts/LanguageContext";

interface POHistoryTimelineProps {
  events: POHistoryEvent[];
  className?: string;
}

const getEventConfig = (eventType: POHistoryEventType) => {
  switch (eventType) {
    case "created":
      return {
        icon: Plus,
        iconClassName: "text-primary",
        bgClassName: "bg-primary/10",
        lineClassName: "bg-primary/30",
      };
    case "submitted":
      return {
        icon: Send,
        iconClassName: "text-info",
        bgClassName: "bg-info/10",
        lineClassName: "bg-info/30",
      };
    case "approved":
      return {
        icon: CheckCircle2,
        iconClassName: "text-success",
        bgClassName: "bg-success/10",
        lineClassName: "bg-success/30",
      };
    case "rejected":
      return {
        icon: XCircle,
        iconClassName: "text-destructive",
        bgClassName: "bg-destructive/10",
        lineClassName: "bg-destructive/30",
      };
    case "status_changed":
    case "step_changed":
      return {
        icon: Flag,
        iconClassName: "text-warning",
        bgClassName: "bg-warning/10",
        lineClassName: "bg-warning/30",
      };
    case "edited":
      return {
        icon: Edit3,
        iconClassName: "text-muted-foreground",
        bgClassName: "bg-muted",
        lineClassName: "bg-border",
      };
    case "comment_added":
      return {
        icon: MessageSquare,
        iconClassName: "text-primary",
        bgClassName: "bg-primary/10",
        lineClassName: "bg-primary/30",
      };
    case "attachment_added":
    case "boleto_added":
    case "invoice_added":
      return {
        icon: Paperclip,
        iconClassName: "text-secondary-foreground",
        bgClassName: "bg-secondary",
        lineClassName: "bg-secondary/50",
      };
    case "payment_scheduled":
      return {
        icon: Clock,
        iconClassName: "text-info",
        bgClassName: "bg-info/10",
        lineClassName: "bg-info/30",
      };
    case "payment_completed":
      return {
        icon: CreditCard,
        iconClassName: "text-success",
        bgClassName: "bg-success/10",
        lineClassName: "bg-success/30",
      };
    case "finalized":
      return {
        icon: Receipt,
        iconClassName: "text-success",
        bgClassName: "bg-success/10",
        lineClassName: "bg-success/30",
      };
    default:
      return {
        icon: FileText,
        iconClassName: "text-muted-foreground",
        bgClassName: "bg-muted",
        lineClassName: "bg-border",
      };
  }
};

export function POHistoryTimeline({
  events,
  className,
}: POHistoryTimelineProps) {
  const { t } = useLanguage();
  const getEventTitle = (event: POHistoryEvent): string => {
    const translatedType = t(`history.eventType.${event.eventType}`);
    // Se a tradução existe e é diferente da chave, usa ela
    if (translatedType && !translatedType.includes("history.eventType.")) {
      return translatedType;
    }
    return event.title;
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (sortedEvents.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-6 text-muted-foreground",
          className
        )}
      >
        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-xs">{t("history.noEvents")}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {sortedEvents.map((event, index) => {
        const config = getEventConfig(event.eventType);
        const Icon = config.icon;
        const isLast = index === sortedEvents.length - 1;
        const isRejection = event.eventType === "rejected";

        return (
          <div key={event.id} className="relative">
            <div className="flex gap-2.5">
              {/* Timeline node */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-all",
                    config.bgClassName,
                    isRejection && "ring-2 ring-destructive/30"
                  )}
                >
                  <Icon className={cn("h-3 w-3", config.iconClassName)} />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 h-full min-h-5 transition-colors",
                      config.lineClassName
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-3 flex-1 min-w-0", isLast && "pb-0")}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-foreground leading-tight">
                    {getEventTitle(event)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
