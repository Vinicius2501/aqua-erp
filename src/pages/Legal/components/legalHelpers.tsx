import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import type { ContractRequestStatus } from "@/types/domain";
import { differenceInDays, isPast, format } from "date-fns";

export type RequestSortableColumn =
  | "supplierLegalName"
  | "requestedAt"
  | "status"
  | "supplierScope";

export type ContractSortableColumn =
  | "fileName"
  | "supplierName"
  | "validUntil"
  | "createdAt";

export type StatusFilter = "all" | "pendente" | "em_confeccao" | "finalizada";

export type SortDirection = "asc" | "desc" | null;

// Date helpers
export const getDaysUntilExpiry = (dateStr: string) => {
  const date = new Date(dateStr);
  return differenceInDays(date, new Date());
};

export const isContractExpired = (dateStr: string) => {
  return isPast(new Date(dateStr));
};

export const isContractExpiringSoon = (dateStr: string, days: number = 30) => {
  const daysUntil = getDaysUntilExpiry(dateStr);
  return daysUntil >= 0 && daysUntil <= days;
};

export const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), "dd/MM/yyyy");
};

export const getDaysAgo = (dateStr: string, t: (key: string) => string) => {
  const diff = differenceInDays(new Date(), new Date(dateStr));
  if (diff === 0) return t("common.today");
  if (diff === 1) return t("common.yesterday");
  return `${diff} ${t("common.daysAgo")}`;
};

// Status badge renderer
export const renderRequestStatusBadge = (
  status: ContractRequestStatus,
  t: (key: string) => string,
) => {
  switch (status) {
    case "pendente":
      return (
        <Badge
          variant="outline"
          className="border-warning/30 bg-warning/10 text-warning gap-1"
        >
          <Clock className="h-3 w-3" />
          {t("legal.statusPending")}
        </Badge>
      );
    case "em_confeccao":
      return (
        <Badge
          variant="outline"
          className="border-info/30 bg-info/10 text-info gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          {t("legal.statusInProgress")}
        </Badge>
      );
    case "finalizada":
      return (
        <Badge
          variant="outline"
          className="border-success/30 bg-success/10 text-success gap-1"
        >
          <CheckCircle2 className="h-3 w-3" />
          {t("legal.statusFinished")}
        </Badge>
      );
  }
};

// Contract validity badge renderer
export const renderContractValidityBadge = (
  validUntil: string | undefined,
  t: (key: string) => string,
) => {
  if (!validUntil) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {t("legal.noExpiry")}
      </Badge>
    );
  }

  if (isContractExpired(validUntil)) {
    return (
      <Badge
        variant="outline"
        className="border-critical/30 bg-critical/10 text-critical gap-1"
      >
        <AlertCircle className="h-3 w-3" />
        {t("legal.expired")}
      </Badge>
    );
  }

  if (isContractExpiringSoon(validUntil, 30)) {
    const days = getDaysUntilExpiry(validUntil);
    return (
      <Badge
        variant="outline"
        className="border-warning/30 bg-warning/10 text-warning gap-1"
      >
        <Clock className="h-3 w-3" />
        {days} {t("legal.days")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-success/30 bg-success/10 text-success gap-1"
    >
      <CheckCircle2 className="h-3 w-3" />
      {t("legal.valid")}
    </Badge>
  );
};
