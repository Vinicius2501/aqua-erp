import type { Column } from "@/components/shared/DataGrid";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { purchaseOrders, users } from "@/data/mockdata";
import { AppLayout } from "@/layouts/AppLayout";
import type { PurchaseOrderExpanded } from "@/types/domain";
import { Filter, Package, Plus, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@/components/shared/DataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StepBadge } from "@/components/shared/StepBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const POLists = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stepFilter, setStepFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const userNameById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.name])),
    [users]
  );

  const formatCurrency = (amount: number, currencyPrefix: string) => {
    return new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: currencyPrefix,
    }).format(amount);
  };

  const columns: Column<PurchaseOrderExpanded>[] = [
    {
      key: "externalId",
      header: t("table.number"),
      sortable: true,
      render: (po) => (
        <span className="font-mono text-sm font-medium text-primary">
          {po.externalId}
        </span>
      ),
    },
    {
      key: "title",
      header: t("table.title"),
      sortable: true,
      render: (po) => (
        <div>
          <p className="font-medium text-foreground line-clamp-1">
            {po.beneficiary.name}
          </p>
          <p className="text-xs text-text-secondary">{po.supplier.tradeName}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: t("poType.title"),
      render: (po) => (
        <span className="text-sm">{t(`poType.${po.typeOfPO}`)}</span>
      ),
    },
    {
      key: "status",
      header: t("table.status"),
      render: (po) => <StatusBadge status={po.status} />,
    },
    {
      key: "step",
      header: t("table.step"),
      render: (po) => <StepBadge step={po.step} />,
    },
    {
      key: "totalValue",
      header: t("table.value"),
      sortable: true,
      render: (po) => (
        <span>{formatCurrency(po.totalValue, po.currency.code)}</span>
      ),
    },
    {
      key: "requester",
      header: t("table.requester"),
      sortable: false,
      render: (po) => (
        <span className="text-sm">{userNameById[po.createdBy]}</span>
      ),
    },
    {
      key: "createdAt",
      header: t("table.createdAt"),
      sortable: true,
      render: (po) => (
        <span className="text-sm text-text-secondary">
          {new Date(po.createdAt).toLocaleDateString(
            language === "pt" ? "pt-BR" : "en-US",
            {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </span>
      ),
    },
  ];

  const filteredData = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.externalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.beneficiary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.tradeName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    const matchesStep = stepFilter === "all" || po.step === stepFilter;
    return matchesStatus && matchesStep && matchesSearch;
  });

  return (
    <AppLayout>
      {/* Cabeçalho */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {t("poList.title")}
            </h1>
            <p className="text-text-secondary">{t("poList.subtitle")}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t("poList.newPO")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate("/pos/new?type=produtos_servicos")}
                className="gap-2 cursor-pointer"
              >
                <Package className="h-4 w-4" />
                {t("poType.produtos_servicos")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/pos/new?type=reembolso")}
                className="gap-2 cursor-pointer"
              >
                <Receipt className="h-4 w-4" />
                {t("poType.reembolso")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-secondary">
              {t("common.filters")}:
            </span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t("table.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allStatus")}</SelectItem>
              <SelectItem value="rascunho">{t("status.rascunho")}</SelectItem>
              <SelectItem value="aguardando_aprovacao">
                {t("status.aguardando_aprovacao")}
              </SelectItem>
              <SelectItem value="aprovada">{t("status.aprovada")}</SelectItem>
              <SelectItem value="reprovada">{t("status.reprovada")}</SelectItem>
              <SelectItem value="finalizada">
                {t("status.finalizada")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={stepFilter} onValueChange={setStepFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t("table.step")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allSteps")}</SelectItem>
              <SelectItem value="rascunho">{t("step.rascunho")}</SelectItem>
              <SelectItem value="aguardando_aprovacao">
                {t("step.aguardando_aprovacao")}
              </SelectItem>
              <SelectItem value="aguardando_contrato">
                {t("step.aguardando_contrato")}
              </SelectItem>
              <SelectItem value="realizando_pagamentos">
                {t("step.realizando_pagamentos")}
              </SelectItem>
              <SelectItem value="baixada">{t("step.baixada")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grade de Dados */}
        <DataGrid
          data={filteredData}
          columns={columns}
          searchPlaceholder={t("poList.searchPlaceholder")}
          onSearch={setSearchQuery}
          searchValue={searchQuery}
          onRowClick={(po) => navigate(`/pos/${po.id}`)}
        />
      </div>
    </AppLayout>
  );
};

export default POLists;
