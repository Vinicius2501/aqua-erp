import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeft,
  Download,
  Printer,
  Building2,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Receipt,
  Hash,
  Tag,
  Globe,
  Banknote,
  FileCheck,
  Briefcase,
  Info,
} from "lucide-react";

import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { POStatusBadge } from "@/components/shared/POStatusBadge";
import { POHistoryTimeline } from "@/components/shared/POHistoryTimeline";
import { InstallmentAllocationTable } from "@/components/shared/InstallmentAllocationTable";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  purchaseOrders,
  users,
  costCenters,
  glAccounts,
  companies,
  poHistoryEvents,
} from "@/data/mockdata";
import type { POHistoryEvent, PurchaseOrderExpanded } from "@/types/domain";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Chamada de API simulada
const fetchPOById = async (
  id: string
): Promise<PurchaseOrderExpanded | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return purchaseOrders.find((po) => po.id === id) || null;
};

const fetchPOHistoryByPOId = async (
  poId: string
): Promise<POHistoryEvent[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return poHistoryEvents.filter((po) => po.purchaseOrderId === poId);
};

// Componente de item de informação - versão mais compacta
const InfoItem = ({
  icon,
  label,
  value,
  highlight = false,
  badge,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  badge?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex items-start gap-2", className)}>
    {icon && (
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <p
          className={cn(
            "font-medium",
            highlight ? "text-primary text-lg" : "text-foreground text-sm"
          )}
        >
          {value}
        </p>
        {badge}
      </div>
    </div>
  </div>
);

// Componente de cabeçalho de seção
const SectionHeader = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 mb-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

// Skeleton de carregamento
const PODetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <Skeleton className="h-32 w-full rounded-lg" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
    <Skeleton className="h-80 w-full rounded-lg" />
  </div>
);

const PODetailView = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [po, setPo] = useState<PurchaseOrderExpanded | null>(null);
  const [poHistory, setPoHistory] = useState<POHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPO = async () => {
      if (!id) {
        setError("ID da PO não informado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchPOById(id);
        const poHistory = await fetchPOHistoryByPOId(id);

        if (!data) {
          setError("PO não encontrada");
          setLoading(false);
          return;
        }

        // Se for rascunho, redirecionar para modo de edição
        if (data.status === "rascunho") {
          navigate(`/pos/${id}/edit`, { replace: true });
          return;
        }

        setPo(data);
        setPoHistory(poHistory);
      } catch (err) {
        setError("Erro ao carregar PO");
        toast.error("Erro ao carregar os dados da PO");
      } finally {
        setLoading(false);
      }
    };

    loadPO();
  }, [id, navigate]);

  const formatCurrency = (value: number) => {
    if (!po?.currency) return `R$ ${value.toFixed(2)}`;
    return new Intl.NumberFormat(po.currency.language || "pt-BR", {
      style: "currency",
      currency: po.currency.code || "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string, withTime = true) => {
    if (withTime) {
      if (language === "pt") {
        return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", {
          locale: ptBR,
        });
      } else {
        return format(new Date(dateStr), "MM/dd/yyyy 'at' HH:mm");
      }
    }
    if (language === "pt") {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
    }
    return format(new Date(dateStr), "MM/dd/yyyy");
  };

  const getPaymentTermsLabel = (terms: string) => {
    const labels: Record<string, string> = {
      unico: "Pagamento Único",
      parcelado: "Parcelado",
      recorrente: "Recorrente",
    };
    return labels[terms] || terms;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      produtos_servicos: t("poDetail.typeProductsServices"),
      reembolso: t("poDetail.reimbursement"),
    };
    return labels[type] || type;
  };

  const getSubtypeLabel = (subtype: string) => {
    const labels: Record<string, string> = {
      produto: t("poDetail.subtypeProduct"),
      servico: t("poDetail.subtypeService"),
      padrao: t("poDetail.subtypeStandard"),
    };
    return labels[subtype] || subtype;
  };

  const getStepLabel = (step: string) => {
    const labels: Record<string, string> = {
      rascunho: "Rascunho",
      aguardando_aprovacao: "Aguardando Aprovação",
      aguardando_contrato: "Aguardando Contrato",
      realizando_pagamentos: "Realizando Pagamentos",
      reprovada: "Reprovada",
      baixada: "Baixada",
    };
    return labels[step] || step;
  };

  if (loading) {
    return (
      <AppLayout>
        <PODetailSkeleton />
      </AppLayout>
    );
  }

  if (error || !po) {
    return (
      <AppLayout>
        <EmptyState
          icon={AlertTriangle}
          title="PO não encontrada"
          description={error || "Não foi possível encontrar a PO solicitada."}
          action={{
            label: "Voltar para lista",
            onClick: () => navigate("/pos"),
          }}
        />
      </AppLayout>
    );
  }

  const createdByUser = users.find((u) => u.id === po.createdBy);
  const isInternational = po.paymentScope === "INTERNATIONAL";

  const getUserNameById = (userId: unknown) => {
    const normalizedId = userId == null ? "" : String(userId);
    return users.find((u) => String(u.id) === normalizedId)?.name || "-";
  };

  // Obtém detalhes de alocação
  const allocationDetails = po.allocations.map((alloc) => {
    const costCenter = costCenters.find((cc) => cc.id === alloc.costCenterId);
    const glAccount = glAccounts.find((gl) => gl.id === alloc.glAccountId);
    const company = companies.find((c) => c.id === alloc.payerCompanyId);
    return {
      ...alloc,
      costCenterName: costCenter?.name || "-",
      costCenterCode: costCenter?.code || "-",
      glAccountName: glAccount?.name || "-",
      glAccountCode: glAccount?.code || "-",
      companyName: company?.name || "-",
    };
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      rascunho: t("status.rascunho"),
      aguardando_aprovacao: t("status.aguardando_aprovacao"),
      aprovada: t("status.aprovada"),
      reprovada: t("status.reprovada"),
      finalizada: t("status.finalizada"),
    };
    return labels[status] || status;
  };

  const translateEventTitle = (event: POHistoryEvent) => {
    const { eventType, title, newStatus, newStep, performedByUserName } = event;

    switch (eventType) {
      case "created":
        return t("history.title.poCreated");
      case "submitted":
        return t("history.title.sentForApproval");
      case "approved":
        return `${t("history.title.approvedBy")} ${performedByUserName}`;
      case "rejected":
        return `${t("history.title.rejectedBy")} ${performedByUserName}`;
      case "status_changed":
        return `${t("history.title.statusChangedTo")} ${getStatusLabel(
          newStatus || ""
        )}`;
      case "step_changed":
        return `${t("history.title.stepChangedTo")} ${getStepLabel(
          newStep || ""
        )}`;
      case "finalized":
        return t("history.title.poFinalized");
      default:
        return title;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        {/* Cabeçalho - Fixo */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 -mx-6 px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/pos")}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">
                    PO #{po.externalId}
                  </h1>
                  <POStatusBadge status={po.status} size="lg" />
                  {isInternational && (
                    <Badge variant="outline" className="gap-1">
                      <Globe className="h-3 w-3" />
                      Internacional
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getTypeLabel(po.typeOfPO)} •{" "}
                  {getSubtypeLabel(po.subtypeOfPO)}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Exportar em desenvolvimento")}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Imprimir em desenvolvimento")}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>

        {/* Card de Destaque de Valor */}
        <Card className="bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("poDetail.totalValue")}
                </p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(po.totalValue)}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("poDetail.supplier")}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {po.supplier?.tradeName || po.supplier?.legalName || "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {po.supplier?.taxId}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("poDetail.paymentCondition")}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {getPaymentTermsLabel(po.paymentTerms)}
                </p>
                {po.installmentCount && po.installmentCount > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {po.installmentCount} {t("poDetail.installments")}
                  </p>
                )}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground mb-1">
                  {t("poDetail.currency")}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {po.currency?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {po.currency?.code}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade de Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Gerais */}
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader
                  icon={<FileText className="h-5 w-5" />}
                  title={t("poDetail.generalInfo")}
                  description={t("poDetail.generalInfoDescription")}
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={<Hash className="h-4 w-4" />}
                    label={t("poDetail.externalId")}
                    value={po.externalId}
                  />
                  <InfoItem
                    icon={<Tag className="h-4 w-4" />}
                    label={t("poDetail.poType")}
                    value={getTypeLabel(po.typeOfPO)}
                    badge={
                      <Badge variant="secondary" className="text-xs">
                        {getSubtypeLabel(po.subtypeOfPO)}
                      </Badge>
                    }
                  />
                  <InfoItem
                    icon={<Briefcase className="h-4 w-4" />}
                    label={t("poDetail.expenseNature")}
                    value={
                      po.expenseNature?.name === "deal_expense"
                        ? "Deal Expense"
                        : "Ongoing"
                    }
                  />
                  <InfoItem
                    icon={<Building2 className="h-4 w-4" />}
                    label={t("poDetail.beneficiary")}
                    value={
                      po.beneficiary?.name === "FUNDO_GP"
                        ? "Fundo GP"
                        : "PortCo"
                    }
                  />
                  <InfoItem
                    icon={<User className="h-4 w-4" />}
                    label={t("poDetail.requester")}
                    value={createdByUser?.name || "-"}
                  />
                  <InfoItem
                    icon={<Calendar className="h-4 w-4" />}
                    label={t("poDetail.createdAt")}
                    value={formatDate(po.createdAt)}
                  />
                  <InfoItem
                    icon={<Calendar className="h-4 w-4" />}
                    label={t("poDetail.lastUpdate")}
                    value={formatDate(po.updatedAt)}
                  />
                  <InfoItem
                    icon={<FileCheck className="h-4 w-4" />}
                    label={t("poDetail.icApproval")}
                    value={
                      po.isIcApproved ? t("poDetail.yes") : t("poDetail.no")
                    }
                    badge={
                      po.isIcApproved ? (
                        <Badge className="bg-success/10 text-success text-xs">
                          Aprovado
                        </Badge>
                      ) : null
                    }
                  />
                </div>

                {/* Observações */}
                {po.notes && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {t("poDetail.observations")}
                      </p>
                      <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">
                        {po.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Informações do Fornecedor */}
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader
                  icon={<Building2 className="h-5 w-5" />}
                  title={t("poDetail.supplier")}
                  description={t("poDetail.supplierDescription")}
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    label={t("poDetail.legalName")}
                    value={po.supplier?.legalName || "-"}
                  />
                  <InfoItem
                    label={t("poDetail.tradeName")}
                    value={po.supplier?.tradeName || "-"}
                  />
                  <InfoItem
                    label={t("poDetail.taxId")}
                    value={po.supplier?.taxId || "-"}
                  />
                  <InfoItem
                    label={t("poDetail.companyType")}
                    value={po.supplier?.companyType || "-"}
                  />
                  <InfoItem
                    label={t("poDetail.email")}
                    value={po.supplier?.generalEmail || "-"}
                    className="sm:col-span-2"
                  />
                  <InfoItem
                    label={t("poDetail.address")}
                    value={po.supplier?.address || "-"}
                    className="sm:col-span-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informações de Pagamento */}
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader
                  icon={<Banknote className="h-5 w-5" />}
                  title={t("poDetail.payment")}
                  description={t("poDetail.paymentDescription")}
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={<CreditCard className="h-4 w-4" />}
                    label={t("poDetail.paymentCondition")}
                    value={getPaymentTermsLabel(po.paymentTerms)}
                  />
                  {po.installmentCount && po.installmentCount > 1 && (
                    <InfoItem
                      icon={<Hash className="h-4 w-4" />}
                      label={t("poDetail.numberOfInstallments")}
                      value={`${po.installmentCount}x`}
                    />
                  )}
                  <InfoItem
                    icon={<Wallet className="h-4 w-4" />}
                    label={t("poDetail.currency")}
                    value={`${po.currency?.name} (${po.currency?.prefix})`}
                  />
                  <InfoItem
                    icon={<Globe className="h-4 w-4" />}
                    label={t("poDetail.scope")}
                    value={isInternational ? "Internacional" : "Nacional"}
                    badge={
                      isInternational ? (
                        <Badge variant="outline" className="text-xs">
                          Exterior
                        </Badge>
                      ) : null
                    }
                  />
                  <InfoItem
                    icon={<Clock className="h-4 w-4" />}
                    label={t("poDetail.paymentWindow")}
                    value={`${po.paymentWindowDays} dias`}
                  />
                  <InfoItem
                    icon={<DollarSign className="h-4 w-4" />}
                    label={t("poDetail.grossUp")}
                    value={po.hasGrossUp ? t("poDetail.yes") : t("poDetail.no")}
                  />
                </div>

                {/* Alerta Fora da Janela de Pagamento */}
                {po.isOutsidePaymentWindow && (
                  <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning">
                          Fora da Janela de Pagamento
                        </p>
                        {po.outsidePaymentJustification && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Justificativa:</strong>{" "}
                            {po.outsidePaymentJustification}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rateio de Centro de Custo */}
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader
                  icon={<Receipt className="h-5 w-5" />}
                  title={t("poDetail.accountingAllocation")}
                  description={t("poDetail.accountingAllocationDescription")}
                />
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                            {t("poDetail.costCenter")}
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                            {t("poDetail.accountingAccount")}
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                            {t("poDetail.company")}
                          </th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">
                            {t("poDetail.value")}
                          </th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">
                            %
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allocationDetails.map((alloc, idx) => (
                          <tr
                            key={alloc.id}
                            className={cn(
                              "border-b last:border-0",
                              idx % 2 === 0 && "bg-muted/20"
                            )}
                          >
                            <td className="py-2 px-3">
                              <p className="text-sm font-medium">
                                {alloc.costCenterName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {alloc.costCenterCode}
                              </p>
                            </td>
                            <td className="py-2 px-3">
                              <p className="text-sm font-medium">
                                {alloc.glAccountName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {alloc.glAccountCode}
                              </p>
                            </td>
                            <td className="py-2 px-3 text-sm">
                              {alloc.companyName}
                            </td>
                            <td className="py-2 px-3 text-right text-sm font-medium">
                              {formatCurrency(alloc.allocationAmount)}
                            </td>
                            <td className="py-2 px-3 text-right text-sm text-muted-foreground">
                              {alloc.allocationPercentage.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parcelas e Anexos */}
            <Card>
              <CardHeader className="pb-3">
                <SectionHeader
                  icon={<Receipt className="h-5 w-5" />}
                  title={t("poDetail.installmentsAttachments")}
                  description={t("poDetail.installmentsAttachmentsDescription")}
                />
              </CardHeader>
              <CardContent>
                <InstallmentAllocationTable
                  allocations={po.allocations}
                  totalValue={po.totalValue}
                  currency={po.currency}
                  installmentCount={po.installmentCount}
                  readOnly={false}
                  paymentMethodCode={
                    po.payment?.details?.methodCode || "TRANSFERENCIA"
                  }
                  defaultPaymentInfo={
                    po.payment?.details?.methodCode === "TRANSFERENCIA"
                      ? {
                          bank: (po.payment.details as any).bank || "",
                          agency: (po.payment.details as any).agency || "",
                          accountNumber:
                            (po.payment.details as any).accountNumber || "",
                        }
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Timeline */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-3 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            {/* Timeline de Aprovação - Compacto */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("poDetail.poHistory")}
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-3">
                <POHistoryTimeline events={poHistory || []} />
              </CardContent>
            </Card>

            {/* Card de Observações/Detalhes */}
            <Card>
              <CardContent className="pt-0 px-4 pb-3 space-y-3">
                {/* Informação de Status/Etapa */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {t("poDetail.currentStatus")}
                    </span>
                    <POStatusBadge status={po.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {t("poDetail.currentStep")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getStepLabel(po.step)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Detalhamento das etapas - formato timeline */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-foreground">
                    {t("poDetail.stepDetails")}
                  </p>

                  {/* Filtrar eventos relevantes para mostrar detalhamento */}
                  {(() => {
                    const relevantEvents = poHistory
                      .filter((event) =>
                        [
                          "approved",
                          "rejected",
                          "step_changed",
                          "status_changed",
                          "submitted",
                          "created",
                        ].includes(event.eventType)
                      )
                      .sort(
                        (a, b) =>
                          new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                      );

                    if (relevantEvents.length === 0) {
                      return (
                        <p className="text-xs text-muted-foreground italic">
                          {t("poDetail.noEventsRecorded")}
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {relevantEvents.map((event) => {
                          const isApprovalOrContract =
                            ["approved", "rejected"].includes(
                              event.eventType
                            ) ||
                            (event.eventType === "step_changed" &&
                              (event.newStep === "aguardando_contrato" ||
                                event.newStep === "aguardando_aprovacao"));

                          const eventDate = new Date(event.createdAt);
                          const formattedDate = format(
                            eventDate,
                            language === "pt" ? "dd/MM/yyyy" : "MM/dd/yyyy",
                            { locale: language === "pt" ? ptBR : undefined }
                          );
                          const formattedTime = format(eventDate, "HH:mm", {
                            locale: language === "pt" ? ptBR : undefined,
                          });

                          const getEventIcon = () => {
                            switch (event.eventType) {
                              case "approved":
                                return (
                                  <CheckCircle2 className="h-3 w-3 text-success" />
                                );
                              case "rejected":
                                return (
                                  <AlertTriangle className="h-3 w-3 text-destructive" />
                                );
                              case "step_changed":
                              case "status_changed":
                                return (
                                  <Clock className="h-3 w-3 text-primary" />
                                );
                              case "submitted":
                                return (
                                  <FileCheck className="h-3 w-3 text-warning" />
                                );
                              case "created":
                                return (
                                  <FileText className="h-3 w-3 text-muted-foreground" />
                                );
                              default:
                                return (
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                );
                            }
                          };

                          return (
                            <div
                              key={event.id}
                              className="relative pl-5 pb-2 border-l-2 border-border last:border-l-transparent"
                            >
                              {/* Ponto do timeline */}
                              <div className="absolute -left-2.25 top-0 p-1 bg-background rounded-full border-2 border-border">
                                {getEventIcon()}
                              </div>

                              <div className="space-y-0.5">
                                <p className="text-xs font-medium text-foreground">
                                  {translateEventTitle(event)}
                                </p>

                                {isApprovalOrContract ? (
                                  // Para aprovação/contrato: data, horário e comentários
                                  <>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                      <span>{formattedDate}</span>
                                      <span>•</span>
                                      <span>{formattedTime}</span>
                                    </div>
                                    {event.description && (
                                      <p className="text-[10px] text-muted-foreground mt-1 bg-muted/50 rounded px-2 py-1">
                                        {event.description}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  // Para os demais: quando e quem alterou
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-wrap">
                                    <span>
                                      {formattedDate} às {formattedTime}
                                    </span>
                                    <span>
                                      {language === "pt" ? "por" : "by"}
                                    </span>
                                    <span className="font-medium">
                                      {getUserNameById(event.performedByUserId)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PODetailView;
