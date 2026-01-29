import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Receipt,
  CreditCard,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Ban,
  Send,
  CalendarClock,
  DollarSign,
  Paperclip,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  InstallmentWithPaymentHistory,
  InstallmentPaymentEvent,
  InstallmentPaymentStatus,
  InstallmentPaymentEventType,
  Currency,
} from "@/types/domain";

interface PaymentTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installments: InstallmentWithPaymentHistory[];
  currency?: Currency;
  poExternalId?: string;
}

const getStatusConfig = (status: InstallmentPaymentStatus) => {
  const configs: Record<
    InstallmentPaymentStatus,
    { label: string; className: string; icon: typeof CheckCircle2 }
  > = {
    pendente: {
      label: "Pendente",
      className: "bg-muted text-white",
      icon: Clock,
    },
    agendado: {
      label: "Agendado",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-300/30 dark:text-blue-400",
      icon: CalendarClock,
    },
    aguardando_pagamento: {
      label: "Aguardando Pagamento",
      className: "bg-amber-500/10 text-amber-800 dark:text-amber-700",
      icon: Send,
    },
    pago: {
      label: "Pago",
      className: "bg-success/10 text-success",
      icon: CheckCircle2,
    },
    cancelado: {
      label: "Cancelado",
      className: "bg-destructive/10 text-destructive",
      icon: Ban,
    },
  };
  return configs[status];
};

const getEventConfig = (eventType: InstallmentPaymentEventType) => {
  const configs: Record<
    InstallmentPaymentEventType,
    {
      icon: typeof CheckCircle2;
      bgClassName: string;
      iconClassName: string;
      lineClassName: string;
    }
  > = {
    created: {
      icon: FileText,
      bgClassName: "bg-muted",
      iconClassName: "text-white",
      lineClassName: "bg-muted-foreground/30",
    },
    scheduled: {
      icon: CalendarClock,
      bgClassName: "bg-blue-100 dark:bg-blue-900/30",
      iconClassName: "text-blue-600 dark:text-blue-400",
      lineClassName: "bg-blue-300 dark:bg-blue-700",
    },
    payment_request_sent: {
      icon: Send,
      bgClassName: "bg-amber-100 dark:bg-amber-900/30",
      iconClassName: "text-amber-600 dark:text-amber-700",
      lineClassName: "bg-amber-300 dark:bg-amber-800",
    },
    payment_approved: {
      icon: CheckCircle2,
      bgClassName: "bg-green-100 dark:bg-green-900/30",
      iconClassName: "text-green-600 dark:text-green-400",
      lineClassName: "bg-green-300 dark:bg-green-700",
    },
    payment_rejected: {
      icon: XCircle,
      bgClassName: "bg-destructive/10",
      iconClassName: "text-destructive",
      lineClassName: "bg-destructive/30",
    },
    payment_completed: {
      icon: DollarSign,
      bgClassName: "bg-success/10",
      iconClassName: "text-success",
      lineClassName: "bg-success/30",
    },
    boleto_added: {
      icon: Receipt,
      bgClassName: "bg-purple-100 dark:bg-purple-900/30",
      iconClassName: "text-purple-600 dark:text-purple-400",
      lineClassName: "bg-purple-300 dark:bg-purple-700",
    },
    invoice_added: {
      icon: FileText,
      bgClassName: "bg-indigo-100 dark:bg-indigo-900/30",
      iconClassName: "text-indigo-600 dark:text-indigo-400",
      lineClassName: "bg-indigo-300 dark:bg-indigo-700",
    },
    attachment_added: {
      icon: Paperclip,
      bgClassName: "bg-slate-100 dark:bg-slate-900/30",
      iconClassName: "text-slate-600 dark:text-slate-400",
      lineClassName: "bg-slate-300 dark:bg-slate-700",
    },
    due_date_changed: {
      icon: Calendar,
      bgClassName: "bg-orange-100 dark:bg-orange-900/30",
      iconClassName: "text-orange-600 dark:text-orange-400",
      lineClassName: "bg-orange-300 dark:bg-orange-700",
    },
    amount_adjusted: {
      icon: CreditCard,
      bgClassName: "bg-cyan-100 dark:bg-cyan-900/30",
      iconClassName: "text-cyan-600 dark:text-cyan-400",
      lineClassName: "bg-cyan-300 dark:bg-cyan-700",
    },
    cancelled: {
      icon: Ban,
      bgClassName: "bg-destructive/10",
      iconClassName: "text-destructive",
      lineClassName: "bg-destructive/30",
    },
  };
  return configs[eventType];
};

const formatEventDate = (dateStr: string) => {
  return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
};

const formatEventTime = (dateStr: string) => {
  return format(new Date(dateStr), "HH:mm", { locale: ptBR });
};

const InstallmentEventTimeline = ({
  events,
}: {
  events: InstallmentPaymentEvent[];
}) => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-0 pl-2">
      {sortedEvents.map((event, index) => {
        const config = getEventConfig(event.eventType);
        const Icon = config.icon;
        const isLast = index === sortedEvents.length - 1;

        return (
          <div key={event.id} className="relative">
            <div className="flex gap-2.5">
              {/* Timeline node */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                    config.bgClassName
                  )}
                >
                  <Icon
                    className={cn(
                      "cursor-pointer h-2.5 w-2.5",
                      config.iconClassName
                    )}
                  />
                </div>
                {!isLast && (
                  <div
                    className={cn("w-0.5 h-full min-h-4", config.lineClassName)}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-2.5 flex-1 min-w-0", isLast && "pb-0")}>
                <p className="text-xs font-medium text-foreground leading-tight">
                  {event.title}
                </p>
                {event.description && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                  <span>{formatEventDate(event.createdAt)}</span>
                  <span>•</span>
                  <span>{formatEventTime(event.createdAt)}</span>
                  <span>•</span>
                  <span className="font-medium">
                    {event.performedByUserName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const InstallmentCard = ({
  installment,
  currency,
  defaultExpanded = false,
}: {
  installment: InstallmentWithPaymentHistory;
  currency?: Currency;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const statusConfig = getStatusConfig(installment.status);
  const StatusIcon = statusConfig.icon;

  const formatCurrency = (value: number) => {
    if (!currency) return `R$ ${value.toFixed(2)}`;
    return new Intl.NumberFormat(currency.language || "pt-BR", {
      style: "currency",
      currency: currency.code || "BRL",
    }).format(value);
  };

  const formatDueDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold">
              Parcela {installment.installmentNumber}
            </span>
          </div>
          <Badge className={cn("text-xs", statusConfig.className)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDueDate(installment.dueDate)}</span>
          </div>
          <span className="font-semibold">
            {formatCurrency(installment.amount)}
          </span>
        </div>
      </button>

      {isExpanded && installment.paymentHistory.length > 0 && (
        <div className="border-t bg-muted/20 p-3">
          <InstallmentEventTimeline events={installment.paymentHistory} />
        </div>
      )}

      {isExpanded && installment.paymentHistory.length === 0 && (
        <div className="border-t bg-muted/20 p-4 flex items-center justify-center gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">Nenhum evento registrado</span>
        </div>
      )}
    </div>
  );
};

export const PaymentTimelineDialog = ({
  open,
  onOpenChange,
  installments,
  currency,
  poExternalId,
}: PaymentTimelineDialogProps) => {
  const sortedInstallments = [...installments].sort(
    (a, b) => a.installmentNumber - b.installmentNumber
  );

  const totalPaid = installments
    .filter((i) => i.status === "pago")
    .reduce((acc, i) => acc + i.amount, 0);

  const totalPending = installments
    .filter((i) => i.status !== "pago" && i.status !== "cancelado")
    .reduce((acc, i) => acc + i.amount, 0);

  const formatCurrency = (value: number) => {
    if (!currency) return `R$ ${value.toFixed(2)}`;
    return new Intl.NumberFormat(currency.language || "pt-BR", {
      style: "currency",
      currency: currency.code || "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Timeline de Pagamentos
            {poExternalId && (
              <Badge variant="outline" className="ml-2 font-normal">
                {poExternalId}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Parcelas</p>
            <p className="text-lg font-semibold">{installments.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Pago</p>
            <p className="text-lg font-semibold text-success">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">A Pagar</p>
            <p className="text-lg font-semibold text-amber-600">
              {formatCurrency(totalPending)}
            </p>
          </div>
        </div>

        {/* Lista de Parcelas */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-2">
          {sortedInstallments.length > 0 ? (
            sortedInstallments.map((installment, index) => (
              <InstallmentCard
                key={installment.id}
                installment={installment}
                currency={currency}
                defaultExpanded={index === 0}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma parcela encontrada</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
