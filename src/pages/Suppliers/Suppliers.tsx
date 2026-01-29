import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Filter,
  Building2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import { AppLayout } from "@/layouts/AppLayout";
import { DataGrid, type Column } from "@/components/shared/DataGrid";
import { KPICard } from "@/components/shared/KPICard";
import { useLanguage } from "@/contexts/LanguageContext";
import { suppliers as mockSuppliers } from "@/data/mockdata";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SupplierFormDialog } from "@/components/suppliers/SupplierFormDialog";
import type { Supplier } from "@/types/domain";

const Suppliers = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Cálculos de KPI
  const totalSuppliers = mockSuppliers.length;
  const activeSuppliers = mockSuppliers.filter(() => true).length; // Mock: todos estão ativos
  const inactiveSuppliers = 0; // Mock: nenhum está inativo
  const approvedSuppliers = mockSuppliers.filter((s) => s.isApproved).length;
  const notApprovedSuppliers = mockSuppliers.filter(
    (s) => !s.isApproved,
  ).length;

  // Filtra fornecedores baseado no termo de busca e status de aprovação
  const filteredSuppliers = mockSuppliers.filter((supplier) => {
    const matchesSearch =
      supplier.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      supplier.taxId.includes(searchQuery) ||
      (supplier.generalEmail
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false);

    const matchesApproval =
      approvalFilter === "all" ||
      (approvalFilter === "approved" && supplier.isApproved) ||
      (approvalFilter === "notApproved" && !supplier.isApproved);

    const matchesStatus =
      statusFilter === "all" ||
      statusFilter === "active" || // Mock: todos estão ativos
      (statusFilter === "inactive" && false);

    return matchesSearch && matchesApproval && matchesStatus;
  });

  const columns: Column<Supplier>[] = [
    {
      key: "taxId",
      header: t("suppliers.cnpj"),
      sortable: true,
      render: (supplier) => (
        <span className="font-mono text-sm font-medium text-primary">
          {supplier.taxId}
        </span>
      ),
    },
    {
      key: "legalName",
      header: t("suppliers.companyName"),
      sortable: true,
      render: (supplier) => (
        <div>
          <p className="font-medium text-foreground line-clamp-1">
            {supplier.legalName}
          </p>
          {supplier.tradeName && (
            <p className="text-xs text-text-secondary">{supplier.tradeName}</p>
          )}
        </div>
      ),
    },
    {
      key: "generalEmail",
      header: t("suppliers.email"),
      render: (supplier) => (
        <span className="text-sm text-text-secondary">
          {supplier.generalEmail ?? "-"}
        </span>
      ),
    },
    {
      key: "isApproved",
      header: t("suppliers.approval"),
      render: (supplier) => (
        <Badge
          variant="outline"
          className={
            supplier.isApproved
              ? "bg-success/10 text-success border-success/30"
              : "bg-warning/10 text-warning border-warning/30"
          }
        >
          {supplier.isApproved ? t("common.approved") : t("common.notApproved")}
        </Badge>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: () => (
        <Badge
          variant="default"
          className="bg-success/10 text-success hover:bg-success/20"
        >
          {t("suppliers.active")}
        </Badge>
      ),
    },
    {
      key: "requiresContract",
      header: t("suppliers.contractRequirement"),
      render: (supplier) => (
        <Badge
          variant="outline"
          className={
            supplier.requiresContract
              ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
              : "bg-green-500/10 text-green-600 border-green-500/30"
          }
        >
          {supplier.requiresContract
            ? t("suppliers.contractRequired")
            : t("suppliers.contractNotRequired")}
        </Badge>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("suppliers.title")}
          </h1>
          <p className="text-text-secondary">{t("suppliers.subtitle")}</p>
        </div>

        {/* Cards de KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <KPICard
            title={t("suppliers.totalSuppliers")}
            value={totalSuppliers}
            icon={Building2}
            variant="default"
          />
          <KPICard
            title={t("suppliers.activeSuppliers")}
            value={activeSuppliers}
            icon={CheckCircle}
            variant="success"
          />
          <KPICard
            title={t("suppliers.inactiveSuppliers")}
            value={inactiveSuppliers}
            icon={XCircle}
            variant="danger"
          />
          <KPICard
            title={t("suppliers.approvedSuppliers")}
            value={approvedSuppliers}
            icon={ShieldCheck}
            variant="primary"
          />
          <KPICard
            title={t("suppliers.notApprovedSuppliers")}
            value={notApprovedSuppliers}
            icon={ShieldX}
            variant="warning"
          />
        </div>
        {/* Filtros e Botão Novo Fornecedor */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {t("common.filters")}:
              </span>
            </div>
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("suppliers.filterByApproval")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="approved">{t("common.approved")}</SelectItem>
                <SelectItem value="notApproved">
                  {t("common.notApproved")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("suppliers.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="active">{t("suppliers.active")}</SelectItem>
                <SelectItem value="inactive">
                  {t("suppliers.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => navigate("/suppliers/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("suppliers.newSupplier")}
          </Button>
        </div>
        {/* Grade de Dados */}
        <DataGrid
          data={filteredSuppliers}
          columns={columns}
          searchPlaceholder={t("suppliers.searchPlaceholder")}
          onSearch={setSearchQuery}
          searchValue={searchQuery}
          onRowClick={(supplier) => navigate(`/suppliers/${supplier.id}`)}
        />
      </div>

      {/* Diálogo de Formulário de Fornecedor */}
      <SupplierFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          // Em uma aplicação real, isso atualizaria a lista de fornecedores
        }}
      />
    </AppLayout>
  );
};

export default Suppliers;
