import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RotateCcw,
  Eye,
  Clock,
  FileText,
  User,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import {
  pendingApprovals,
  users,
  costCenters,
  companies,
} from "@/data/mockdata";
import type { PurchaseOrderExpanded } from "@/types/domain";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { ApproveDialog } from "./dialogs/ApproveDialog";
import { RejectDialog } from "./dialogs/RejectDialog";
import { ReturnDialog } from "./dialogs/ReturnDialog";

// TODO: Substituir pendingApprovals por chamada à API que retorna:
// - Todas as POs com status 'aguardando_aprovacao', 'aprovada' ou 'reprovada'
// - Filtrar apenas POs onde o usuário logado é um dos aprovadores
// - Exemplo: GET /api/approvals?userId={currentUser.id}

type ActionType = "approve" | "reject" | "return" | null;
type StatusFilter = "all" | "aguardando_aprovacao" | "aprovada" | "reprovada";
type SortDirection = "asc" | "desc" | null;
type SortableColumn =
  | "externalId"
  | "supplier"
  | "requester"
  | "totalValue"
  | "createdAt";

export default function Approvals() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderExpanded | null>(
    null,
  );
  const [actionType, setActionType] = useState<ActionType>(null);
  const [reason, setReason] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    "aguardando_aprovacao",
  );
  const [approvalComment, setApprovalComment] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [costCenterFilter, setCostCenterFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<SortableColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const formatCurrency = (value: number, currencyCode: string = "BRL") => {
    return new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(
      new Date(dateStr),
      language === "pt" ? "dd/MM/yyyy" : "MM/dd/yyyy",
    );
  };

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return t("common.today");
    if (diff === 1) return t("common.yesterday");
    return `${diff} ${t("common.daysAgo")}`;
  };

  const getCreatedByName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || "-";
  };

  const getAllocationDetails = (po: PurchaseOrderExpanded) => {
    return po.allocations.map((alloc) => {
      const costCenter = costCenters.find((cc) => cc.id === alloc.costCenterId);
      const company = companies.find((c) => c.id === alloc.payerCompanyId);
      return {
        ...alloc,
        costCenterName: costCenter?.name || "-",
        costCenterCode: costCenter?.code || "-",
        companyName: company?.name || "-",
      };
    });
  };

  const renderAllocationTable = (po: PurchaseOrderExpanded) => {
    const allocations = getAllocationDetails(po);
    if (allocations.length === 0) return null;

    return (
      <div className="mt-3 border border-border rounded-lg overflow-x-auto w-full min-w-0">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow className="bg-subtle-fill/50">
              <TableHead className="text-text-secondary text-xs w-[45%]">
                {t("approvals.costCenter")}
              </TableHead>
              <TableHead className="text-text-secondary text-xs w-[45%]">
                {t("approvals.payingCompany")}
              </TableHead>
              <TableHead className="text-left text-text-secondary text-xs whitespace-nowrap w-[10%]">
                %
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map((alloc) => (
              <TableRow key={alloc.id}>
                <TableCell className="text-left text-text-primary text-sm font-medium whitespace-normal wrap-break-word ">
                  {alloc.costCenterCode} - {alloc.costCenterName}
                </TableCell>
                <TableCell className="text-left text-text-primary text-sm whitespace-normal wrap-break-word ">
                  <div title={alloc.companyName}>{alloc.companyName}</div>
                </TableCell>
                <TableCell className="text-left text-text-primary text-sm font-medium whitespace-nowrap">
                  {alloc.allocationPercentage}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const handleAction = (po: PurchaseOrderExpanded, action: ActionType) => {
    setSelectedPO(po);
    setActionType(action);
    setReason("");

    if (action === "approve") {
      setShowApproveDialog(true);
    }
  };

  const handleConfirmApprove = () => {
    if (selectedPO) {
      toast.success(
        `PO ${selectedPO.externalId} ${t("approvals.approvedSuccess")}`,
      );
      setShowApproveDialog(false);
      setSelectedPO(null);
      setActionType(null);
      setApprovalComment("");
    }
  };

  const handleConfirmRejectReturn = () => {
    if (!reason.trim()) {
      toast.error(t("approvals.reasonRequired"));
      return;
    }

    if (selectedPO && actionType) {
      const successMessage =
        actionType === "reject"
          ? t("approvals.rejectedSuccess")
          : t("approvals.returnedSuccess");
      toast.success(`PO ${selectedPO.externalId} ${successMessage}`);
      setSelectedPO(null);
      setActionType(null);
      setReason("");
    }
  };

  const handleCloseDialog = () => {
    setSelectedPO(null);
    setActionType(null);
    setReason("");
  };

  // Sorting functions
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn("createdAt");
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-text-secondary" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="h-4 w-4 text-primary" />;
  };

  const supplierOptions = useMemo(() => {
    const names = new Set<string>();
    pendingApprovals.forEach((po) => {
      const name = po.supplier?.legalName || po.supplier?.tradeName;
      if (name) names.add(name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, []);

  const costCenterOptions = useMemo(() => {
    return costCenters
      .map((cc) => `${cc.code} - ${cc.name}`)
      .sort((a, b) => a.localeCompare(b));
  }, []);

  const companyOptions = useMemo(() => {
    return companies.map((c) => c.name).sort((a, b) => a.localeCompare(b));
  }, []);

  // Filter POs based on selected status and extra filters
  const filteredApprovals = useMemo(() => {
    let filtered = pendingApprovals;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((po) => po.status === statusFilter);
    }

    if (supplierFilter !== "all") {
      filtered = filtered.filter((po) => {
        const name = po.supplier?.legalName || po.supplier?.tradeName;
        return name === supplierFilter;
      });
    }

    if (costCenterFilter !== "all") {
      filtered = filtered.filter((po) => {
        const allocations = getAllocationDetails(po);
        return allocations.some(
          (alloc) =>
            `${alloc.costCenterCode} - ${alloc.costCenterName}` ===
            costCenterFilter,
        );
      });
    }

    if (companyFilter !== "all") {
      filtered = filtered.filter((po) => {
        const allocations = getAllocationDetails(po);
        return allocations.some((alloc) => alloc.companyName === companyFilter);
      });
    }

    // Sort data
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortColumn) {
          case "externalId":
            aValue = a.externalId;
            bValue = b.externalId;
            break;
          case "supplier":
            aValue = a.supplier?.legalName || "";
            bValue = b.supplier?.legalName || "";
            break;
          case "requester":
            aValue = getCreatedByName(a.createdBy);
            bValue = getCreatedByName(b.createdBy);
            break;
          case "totalValue":
            aValue = a.totalValue;
            bValue = b.totalValue;
            break;
          case "createdAt":
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        // Handle null/undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirection === "asc" ? 1 : -1;
        if (bValue == null) return sortDirection === "asc" ? -1 : 1;

        // Compare strings
        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue, undefined, {
            sensitivity: "base",
          });
          return sortDirection === "asc" ? comparison : -comparison;
        }

        // Compare numbers
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [
    statusFilter,
    supplierFilter,
    costCenterFilter,
    companyFilter,
    sortColumn,
    sortDirection,
  ]);

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredApprovals.length / pageSize),
  );

  // Count by status from filtered approvals
  const pendingCount = filteredApprovals.filter(
    (po) => po.status === "aguardando_aprovacao",
  ).length;
  const approvedCount = filteredApprovals.filter(
    (po) => po.status === "aprovada",
  ).length;
  const rejectedCount = filteredApprovals.filter(
    (po) => po.status === "reprovada",
  ).length;

  // Ensure current page is valid
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedApprovals = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredApprovals.slice(startIndex, startIndex + pageSize);
  }, [filteredApprovals, validCurrentPage, pageSize]);

  const poSubtype: Record<string, string> = {
    produto: t("newPO.subtypeProduct"),
    servico: t("newPO.subtypeService"),
    padrao: t("newPO.subtypeDefault") || "Default",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {t("approvals.title")}
          </h1>
          <p className="text-text-secondary mt-1">
            {pendingApprovals.length}{" "}
            {pendingApprovals.length === 1 ? "PO" : "POs"}{" "}
            {t("approvals.subtitle").split(" ").slice(1).join(" ")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {pendingCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("approvals.pending")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {approvedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("approvals.approved")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {rejectedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("approvals.rejected")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approvals Queue */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-medium text-text-primary mb-4">
              {t("approvals.queue")}
            </CardTitle>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="hidden sm:inline h-4 w-4 text-text-secondary" />
                <Select
                  value={statusFilter}
                  onValueChange={(value: StatusFilter) =>
                    setStatusFilter(value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-56 h-9">
                    <SelectValue placeholder={t("approvals.filterByStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("approvals.allStatuses")}
                    </SelectItem>
                    <SelectItem value="aguardando_aprovacao">
                      {t("approvals.pending")}
                    </SelectItem>
                    <SelectItem value="aprovada">
                      {t("approvals.approved")}
                    </SelectItem>
                    <SelectItem value="reprovada">
                      {t("approvals.rejected")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={supplierFilter}
                  onValueChange={(value) => setSupplierFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-56 h-9">
                    <SelectValue placeholder={t("approvals.supplier")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos fornecedores</SelectItem>
                    {supplierOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={costCenterFilter}
                  onValueChange={(value) => setCostCenterFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-56 h-9">
                    <SelectValue placeholder={t("approvals.costCenter")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos centros de custo</SelectItem>
                    {costCenterOptions.map((cc) => (
                      <SelectItem key={cc} value={cc}>
                        {cc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={companyFilter}
                  onValueChange={(value) => setCompanyFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-60 h-9">
                    <SelectValue placeholder={t("approvals.payingCompany")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Todas empresas pagadoras
                    </SelectItem>
                    {companyOptions.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto px-4 py-4">
              <div className="rounded-t-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-subtle-fill/50 hover:bg-subtle-fill/50">
                      <TableHead
                        className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                        onClick={() => handleSort("externalId")}
                      >
                        <div className="flex items-center gap-2">
                          {t("approvals.po")}
                          {getSortIcon("externalId")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                        onClick={() => handleSort("supplier")}
                      >
                        <div className="flex items-center gap-2">
                          {t("approvals.supplier")}
                          {getSortIcon("supplier")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                        onClick={() => handleSort("requester")}
                      >
                        <div className="flex items-center gap-2">
                          {t("approvals.requester")}
                          {getSortIcon("requester")}
                        </div>
                      </TableHead>
                      <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider text-center">
                        {t("approvals.costCenter")}
                      </TableHead>
                      <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider">
                        {t("approvals.payingCompany")}
                      </TableHead>
                      <TableHead
                        className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                        onClick={() => handleSort("totalValue")}
                      >
                        <div className="flex items-center gap-2">
                          {t("approvals.value")}
                          {getSortIcon("totalValue")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center gap-2">
                          {t("approvals.submitted")}
                          {getSortIcon("createdAt")}
                        </div>
                      </TableHead>
                      <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider text-right">
                        {t("approvals.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApprovals.map((po) => {
                      return (
                        <TableRow
                          key={po.id}
                          className="hover:bg-subtle-fill/30"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-text-secondary" />
                              <div>
                                <p className="font-medium text-text-primary">
                                  {po.externalId}
                                </p>
                                <p className="text-xs text-text-secondary line-clamp-1">
                                  {poSubtype[po.subtypeOfPO]}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-text-secondary" />
                              <span className="text-text-primary">
                                {po.supplier?.legalName || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-text-secondary" />
                              <p className="text-text-primary">
                                {getCreatedByName(po.createdBy)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-start text-text-primary text-sm">
                              {getAllocationDetails(po).map((alloc) => (
                                <div key={alloc.id}>
                                  {alloc.costCenterCode} -{" "}
                                  {alloc.costCenterName}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-48">
                            <div className="text-text-primary text-sm">
                              {getAllocationDetails(po).map((alloc) => (
                                <div
                                  key={alloc.id}
                                  className="truncate"
                                  title={alloc.companyName}
                                >
                                  {alloc.companyName}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-text-primary">
                              {formatCurrency(
                                po.totalValue,
                                po.currency?.code || "BRL",
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-text-primary">
                                {formatDate(po.createdAt)}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {getDaysAgo(po.createdAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={po.status} size="sm" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-text-secondary hover:text-text-primary"
                                onClick={() =>
                                  navigate(`/pos/${po.id}`, {
                                    state: { from: "approvals" },
                                  })
                                }
                                title={t("approvals.viewDetails")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-warning hover:text-warning hover:bg-warning/10"
                                onClick={() => handleAction(po, "return")}
                                title={t("common.return")}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleAction(po, "reject")}
                                title={t("common.reject")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                                onClick={() => handleAction(po, "approve")}
                                title={t("common.approve")}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Cards - Visible only on mobile */}
            <div className="md:hidden divide-y divide-border">
              {paginatedApprovals.map((po) => (
                <div
                  key={po.id}
                  className="p-4 hover:bg-subtle-fill/30 active:bg-subtle-fill/50 transition-colors"
                >
                  {/* Header: PO Number, Status & Value */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary">
                          {po.externalId}
                        </p>
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {po.notes || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-lg">
                        {formatCurrency(
                          po.totalValue,
                          po.currency?.code || "BRL",
                        )}
                      </p>
                      <StatusBadge status={po.status} size="sm" />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                      <span className="text-text-primary truncate">
                        {po.supplier?.tradeName ||
                          po.supplier?.legalName ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                      <span className="text-text-primary truncate">
                        {getCreatedByName(po.createdBy)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Calendar className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                      <span className="text-text-secondary">
                        {formatDate(po.createdAt)} •{" "}
                        <span className="text-warning">
                          {getDaysAgo(po.createdAt)}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/pos/${po.id}`, {
                          state: { from: "approvals" },
                        })
                      }
                      className="flex-1 gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      {t("common.view")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(po, "return")}
                      className="gap-1 text-warning border-warning/50 hover:bg-warning/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(po, "reject")}
                      className="gap-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(po, "approve")}
                      className="gap-1 bg-success hover:bg-success/90"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {paginatedApprovals.length === 0 && (
                <div className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-success/50 mx-auto mb-3" />
                  <p className="text-text-secondary">
                    {t("approvals.noApprovalsFound")}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredApprovals.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>{t("common.showing")}</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>
                    {t("common.of")} {filteredApprovals.length}{" "}
                    {t("common.records")}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(1)}
                    disabled={validCurrentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={validCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="px-3 text-sm text-text-secondary">
                    {t("common.page")} {validCurrentPage} {t("common.of")}{" "}
                    {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={validCurrentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={validCurrentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ApproveDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        selectedPO={selectedPO}
        approvalComment={approvalComment}
        onApprovalCommentChange={setApprovalComment}
        onConfirm={handleConfirmApprove}
        formatCurrency={formatCurrency}
        getCreatedByName={getCreatedByName}
        renderAllocationTable={renderAllocationTable}
      />

      <RejectDialog
        open={actionType === "reject"}
        onOpenChange={(open) => !open && handleCloseDialog()}
        selectedPO={selectedPO}
        reason={reason}
        onReasonChange={setReason}
        onConfirm={handleConfirmRejectReturn}
        formatCurrency={formatCurrency}
        getCreatedByName={getCreatedByName}
        renderAllocationTable={renderAllocationTable}
      />

      <ReturnDialog
        open={actionType === "return"}
        onOpenChange={(open) => !open && handleCloseDialog()}
        selectedPO={selectedPO}
        reason={reason}
        onReasonChange={setReason}
        onConfirm={handleConfirmRejectReturn}
        formatCurrency={formatCurrency}
        getCreatedByName={getCreatedByName}
        renderAllocationTable={renderAllocationTable}
      />
    </AppLayout>
  );
}
