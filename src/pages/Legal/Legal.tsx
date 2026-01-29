import { useState, useRef, useMemo, useCallback } from "react";
import { AppLayout } from "../../layouts/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  CheckCircle2,
  Building2,
  Paperclip,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Plus,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Globe,
  Flag,
  Filter,
  Play,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  users,
  suppliers,
  supplierDocuments,
  contractRequests,
} from "@/data/mockdata";
import { ContractRequestDialog } from "@/components/shared/ContractRequestDialog";
import {
  LegalKPICards,
  FinishRequestDialog,
  ReplaceContractDialog,
  type RequestSortableColumn,
  type ContractSortableColumn,
  type StatusFilter,
  type SortDirection,
  isContractExpired as isContractExpiredHelper,
  isContractExpiringSoon as isContractExpiringSoonHelper,
  getDaysUntilExpiry,
} from "./components";
import type {
  SupplierDocument,
  ContractRequest,
  ContractRequestStatus,
} from "@/types/domain";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Legal() {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<"requests" | "contracts">(
    "requests",
  );

  // Request tab states
  const [requestSupplierFilter, setRequestSupplierFilter] = useState("all");
  const [requestScopeFilter, setRequestScopeFilter] = useState<
    "all" | "NATIONAL" | "INTERNATIONAL"
  >("all");
  const [requestStatusFilter, setRequestStatusFilter] =
    useState<StatusFilter>("all");
  const [requestCurrentPage, setRequestCurrentPage] = useState(1);
  const [requestPageSize, setRequestPageSize] = useState(10);
  const [requestSortColumn, setRequestSortColumn] =
    useState<RequestSortableColumn>("requestedAt");
  const [requestSortDirection, setRequestSortDirection] =
    useState<SortDirection>("desc");

  // Contract tab states
  const [contractSupplierFilter, setContractSupplierFilter] = useState("all");
  const [contractScopeFilter, setContractScopeFilter] = useState<
    "all" | "NATIONAL" | "INTERNATIONAL"
  >("all");
  const [contractCurrentPage, setContractCurrentPage] = useState(1);
  const [contractPageSize, setContractPageSize] = useState(10);
  const [contractSortColumn, setContractSortColumn] =
    useState<ContractSortableColumn>("validUntil");
  const [contractSortDirection, setContractSortDirection] =
    useState<SortDirection>("asc");
  const [showExpiredContracts, setShowExpiredContracts] = useState(true);

  // Dialog states
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [showFinishRequestDialog, setShowFinishRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ContractRequest | null>(null);
  const [showUploadContractDialog, setShowUploadContractDialog] =
    useState(false);
  const [selectedContract, setSelectedContract] =
    useState<SupplierDocument | null>(null);

  // Form states for finish request
  const [finishContractFile, setFinishContractFile] = useState<File | null>(
    null,
  );
  const [finishValidUntil, setFinishValidUntil] = useState("");
  const [finishHasValidity, setFinishHasValidity] = useState(true);

  // Helper functions
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || "-";
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.legalName || supplier?.tradeName || "-";
  };

  const formatDate = (dateStr: string) => {
    return format(
      new Date(dateStr),
      language === "pt" ? "dd/MM/yyyy" : "MM/dd/yyyy",
    );
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  // Use helper functions from components
  const isContractExpired = useCallback(
    (dateStr: string) => isContractExpiredHelper(dateStr),
    [],
  );
  const isContractExpiringSoon = useCallback(
    (dateStr: string, days: number = 30) =>
      isContractExpiringSoonHelper(dateStr, days),
    [],
  );

  // Get contracts (only documents with category "contract")
  const allContracts = useMemo(() => {
    return supplierDocuments.filter((doc) => doc.categoryCode === "contract");
  }, []);

  // KPI calculations
  const kpiData = useMemo(() => {
    const pendingRequests = contractRequests.filter(
      (r) => r.status === "pendente",
    ).length;
    const inProgressRequests = contractRequests.filter(
      (r) => r.status === "em_confeccao",
    ).length;
    const activeContracts = allContracts.filter(
      (c) => c.validUntil && !isContractExpired(c.validUntil),
    ).length;
    const expiringSoon = allContracts.filter(
      (c) => c.validUntil && isContractExpiringSoon(c.validUntil, 30),
    ).length;
    const expiredContracts = allContracts.filter(
      (c) => c.validUntil && isContractExpired(c.validUntil),
    ).length;

    return {
      pendingRequests,
      inProgressRequests,
      activeContracts,
      expiringSoon,
      expiredContracts,
    };
  }, [allContracts, isContractExpired, isContractExpiringSoon]);

  // Request filtering and sorting
  const filteredRequests = useMemo(() => {
    let filtered = [...contractRequests];

    // Supplier filter
    if (requestSupplierFilter !== "all") {
      filtered = filtered.filter(
        (req) => req.supplierId === requestSupplierFilter,
      );
    }

    // Scope filter
    if (requestScopeFilter !== "all") {
      filtered = filtered.filter(
        (req) => req.supplierScope === requestScopeFilter,
      );
    }

    // Status filter
    if (requestStatusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === requestStatusFilter);
    }

    // Sorting
    if (requestSortColumn && requestSortDirection) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (requestSortColumn) {
          case "supplierLegalName":
            comparison = a.supplierLegalName.localeCompare(b.supplierLegalName);
            break;
          case "requestedAt":
            comparison =
              new Date(a.requestedAt).getTime() -
              new Date(b.requestedAt).getTime();
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "supplierScope":
            comparison = a.supplierScope.localeCompare(b.supplierScope);
            break;
        }
        return requestSortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [
    requestSupplierFilter,
    requestScopeFilter,
    requestStatusFilter,
    requestSortColumn,
    requestSortDirection,
  ]);

  // Contract filtering and sorting
  const filteredContracts = useMemo(() => {
    let filtered = [...allContracts];

    // Hide expired if toggle is off
    if (!showExpiredContracts) {
      filtered = filtered.filter(
        (c) => !c.validUntil || !isContractExpired(c.validUntil),
      );
    }

    // Supplier filter
    if (contractSupplierFilter !== "all") {
      filtered = filtered.filter(
        (contract) => contract.supplierId === contractSupplierFilter,
      );
    }

    // Scope filter
    if (contractScopeFilter !== "all") {
      // Filter contracts based on supplier's scope
      filtered = filtered.filter((contract) => {
        const contractSupplier = suppliers.find(
          (s) => s.id === contract.supplierId,
        );
        if (!contractSupplier) return false;
        // Access supplierScope which exists on all Supplier union variants
        return (
          (contractSupplier as unknown as { supplierScope: string })
            .supplierScope === contractScopeFilter
        );
      });
    }

    // Sorting
    if (contractSortColumn && contractSortDirection) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (contractSortColumn) {
          case "fileName":
            comparison = a.fileName.localeCompare(b.fileName);
            break;
          case "supplierName":
            comparison = getSupplierName(a.supplierId).localeCompare(
              getSupplierName(b.supplierId),
            );
            break;
          case "validUntil":
            comparison =
              new Date(a.validUntil || "9999-12-31").getTime() -
              new Date(b.validUntil || "9999-12-31").getTime();
            break;
          case "createdAt":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }
        return contractSortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [
    allContracts,
    contractSupplierFilter,
    contractScopeFilter,
    contractSortColumn,
    contractSortDirection,
    showExpiredContracts,
    isContractExpired,
  ]);

  // Pagination for requests
  const requestTotalPages = Math.ceil(
    filteredRequests.length / requestPageSize,
  );
  const requestValidCurrentPage = Math.min(
    Math.max(1, requestCurrentPage),
    requestTotalPages || 1,
  );
  const paginatedRequests = useMemo(() => {
    const startIndex = (requestValidCurrentPage - 1) * requestPageSize;
    return filteredRequests.slice(startIndex, startIndex + requestPageSize);
  }, [filteredRequests, requestValidCurrentPage, requestPageSize]);

  // Pagination for contracts
  const contractTotalPages = Math.ceil(
    filteredContracts.length / contractPageSize,
  );
  const contractValidCurrentPage = Math.min(
    Math.max(1, contractCurrentPage),
    contractTotalPages || 1,
  );
  const paginatedContracts = useMemo(() => {
    const startIndex = (contractValidCurrentPage - 1) * contractPageSize;
    return filteredContracts.slice(startIndex, startIndex + contractPageSize);
  }, [filteredContracts, contractValidCurrentPage, contractPageSize]);

  // Sort handlers
  const handleRequestSort = (column: RequestSortableColumn) => {
    if (requestSortColumn === column) {
      setRequestSortDirection(
        requestSortDirection === "asc"
          ? "desc"
          : requestSortDirection === "desc"
            ? null
            : "asc",
      );
    } else {
      setRequestSortColumn(column);
      setRequestSortDirection("asc");
    }
  };

  const handleContractSort = (column: ContractSortableColumn) => {
    if (contractSortColumn === column) {
      setContractSortDirection(
        contractSortDirection === "asc"
          ? "desc"
          : contractSortDirection === "desc"
            ? null
            : "asc",
      );
    } else {
      setContractSortColumn(column);
      setContractSortDirection("asc");
    }
  };

  const getSortIcon = (
    column: RequestSortableColumn | ContractSortableColumn,
    type: "request" | "contract",
  ) => {
    const sortColumn =
      type === "request" ? requestSortColumn : contractSortColumn;
    const sortDirection =
      type === "request" ? requestSortDirection : contractSortDirection;

    if (sortColumn !== column || !sortDirection) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="h-4 w-4 text-primary" />;
  };

  // Status badge renderer
  const renderRequestStatusBadge = (status: ContractRequestStatus) => {
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
      case "cancelamento_solicitado":
        return (
          <Badge
            variant="outline"
            className="border-warning/30 bg-warning/10 text-warning gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {t("legal.statusCancelRequested")}
          </Badge>
        );
      case "cancelada":
        return (
          <Badge
            variant="outline"
            className="border-muted/50 bg-muted/50 text-muted-foreground gap-1"
          >
            <X className="h-3 w-3" />
            {t("legal.statusCancelled")}
          </Badge>
        );
    }
  };

  // Contract validity badge renderer
  const renderContractValidityBadge = (validUntil?: string) => {
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

  // Actions
  const handleStartRequest = (request: ContractRequest) => {
    toast.success(t("legal.requestStarted"), {
      description: t("legal.requestStartedDescription", {
        supplier: request.supplierLegalName,
      }),
    });
  };

  const handleFinishRequest = () => {
    if (!finishContractFile) {
      toast.error(t("legal.contractFileRequired"));
      return;
    }
    if (finishHasValidity && !finishValidUntil) {
      toast.error(t("legal.validUntilRequired"));
      return;
    }

    toast.success(t("legal.requestFinished"), {
      description: t("legal.requestFinishedDescription"),
    });

    setShowFinishRequestDialog(false);
    setSelectedRequest(null);
    setFinishContractFile(null);
    setFinishValidUntil("");
    setFinishHasValidity(true);
  };

  const handleDownloadContract = (contract: SupplierDocument) => {
    toast.success(t("legal.downloadStarted"), {
      description: contract.fileName,
    });
  };

  const handleReplaceContract = (contract: SupplierDocument) => {
    setSelectedContract(contract);
    setShowUploadContractDialog(true);
  };

  // Render pagination
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setCurrentPage: (page: number) => void,
    pageSize: number,
    setPageSize: (size: number) => void,
    totalItems: number,
  ) => (
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
          {t("common.of")} {totalItems} {t("common.records")}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-3 text-sm text-text-secondary">
          {t("common.page")} {currentPage} {t("common.of")} {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(Math.min(totalPages || 1, currentPage + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages || 1)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("legal.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("legal.subtitle")}
            </p>
          </div>
          <Button
            onClick={() => setShowNewRequestDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("legal.newRequest")}
          </Button>
        </div>

        {/* KPI Cards */}
        <LegalKPICards kpiData={kpiData} />

        {/* Main Content with Tabs */}
        <Card>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "requests" | "contracts")}
          >
            <CardHeader className="pb-0">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                <TabsTrigger
                  value="requests"
                  className="gap-1 h-8 px-2 py-1 text-xs whitespace-nowrap data-[state=inactive]:text-white"
                >
                  <FileText className="h-4 w-4" />
                  {t("legal.tabRequests")}
                  {kpiData.pendingRequests + kpiData.inProgressRequests > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                      {kpiData.pendingRequests + kpiData.inProgressRequests}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="contracts"
                  className="gap-1 h-8 px-2 py-1 text-xs whitespace-nowrap data-[state=inactive]:text-white"
                >
                  <Paperclip className="h-4 w-4" />
                  {t("legal.tabContracts")}
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                    {allContracts.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* Requests Tab */}
            <TabsContent value="requests" className="mt-0">
              <CardContent className="p-0">
                {/* Filters */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border-b">
                  <Select
                    value={requestSupplierFilter}
                    onValueChange={(v) => {
                      setRequestSupplierFilter(v);
                      setRequestCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full md:w-64 text-left">
                      <Building2 className="h-4 w-4 mr-2 shrink-0" />
                      <SelectValue placeholder={t("legal.filterBySupplier")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("legal.allSuppliers")}
                      </SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.legalName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={requestScopeFilter}
                    onValueChange={(v) => {
                      setRequestScopeFilter(
                        v as "all" | "NATIONAL" | "INTERNATIONAL",
                      );
                      setRequestCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full md:w-64 text-left">
                      <Globe className="h-4 w-4 mr-2 shrink-0" />
                      <SelectValue placeholder={t("legal.filterByScope")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("legal.allScopes")}
                      </SelectItem>
                      <SelectItem value="NATIONAL">
                        {t("legal.scopeNational")}
                      </SelectItem>
                      <SelectItem value="INTERNATIONAL">
                        {t("legal.scopeInternational")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={requestStatusFilter}
                    onValueChange={(v) => {
                      setRequestStatusFilter(v as StatusFilter);
                      setRequestCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full md:w-64 text-left">
                      <Filter className="h-4 w-4 mr-2 shrink-0" />
                      <SelectValue placeholder={t("legal.filterByStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("legal.allStatuses")}
                      </SelectItem>
                      <SelectItem value="pendente">
                        {t("legal.statusPending")}
                      </SelectItem>
                      <SelectItem value="em_confeccao">
                        {t("legal.statusInProgress")}
                      </SelectItem>
                      <SelectItem value="finalizada">
                        {t("legal.statusFinished")}
                      </SelectItem>
                      <SelectItem value="cancelamento_solicitado">
                        {t("legal.statusCancelRequested")}
                      </SelectItem>
                      <SelectItem value="cancelada">
                        {t("legal.statusCancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                {filteredRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">
                      {t("legal.noRequestsFound")}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {t("legal.noRequestsFoundDescription")}
                    </p>
                    <Button onClick={() => setShowNewRequestDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("legal.newRequest")}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto px-4 py-4">
                      <div className="rounded-t-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-subtle-fill/50 hover:bg-subtle-fill/50">
                              <TableHead
                                className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                                onClick={() =>
                                  handleRequestSort("supplierLegalName")
                                }
                              >
                                <div className="flex items-center gap-2">
                                  {t("legal.supplier")}
                                  {getSortIcon(
                                    "supplierLegalName",
                                    "request",
                                  )}
                                </div>
                              </TableHead>
                              <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider">
                                {t("legal.taxId")}
                              </TableHead>
                              <TableHead
                                className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                                onClick={() =>
                                  handleRequestSort("supplierScope")
                                }
                              >
                                <div className="flex items-center gap-2">
                                  {t("legal.scope")}
                                  {getSortIcon("supplierScope", "request")}
                                </div>
                              </TableHead>
                              <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider">
                                {t("legal.requester")}
                              </TableHead>
                              <TableHead
                                className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleRequestSort("requestedAt")}
                              >
                                <div className="flex items-center gap-2">
                                  {t("legal.requestDate")}
                                  {getSortIcon("requestedAt", "request")}
                                </div>
                              </TableHead>
                              <TableHead
                                className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleRequestSort("status")}
                              >
                                <div className="flex items-center gap-2">
                                  Status
                                  {getSortIcon("status", "request")}
                                </div>
                              </TableHead>
                              <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider text-right">
                                {t("legal.actions")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedRequests.map((request) => (
                              <TableRow
                                key={request.id}
                                className="hover:bg-subtle-fill/30"
                              >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="font-medium text-foreground">
                                    {request.supplierLegalName}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground font-mono">
                                  {request.supplierTaxId}
                                </span>
                              </TableCell>
                              <TableCell>
                                {request.supplierScope === "NATIONAL" ? (
                                  <Badge variant="outline" className="gap-1">
                                    <Flag className="h-3 w-3" />
                                    {t("legal.national")}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="gap-1">
                                    <Globe className="h-3 w-3" />
                                    {t("legal.international")}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="text-foreground">
                                    {getUserName(request.requestedBy)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-foreground">
                                    {formatDate(request.requestedAt)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {getDaysAgo(request.requestedAt)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {renderRequestStatusBadge(request.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  {request.status === "pendente" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleStartRequest(request)
                                      }
                                      className="gap-1 text-info hover:text-info hover:bg-info/10"
                                    >
                                      <Play className="h-4 w-4" />
                                      {t("legal.start")}
                                    </Button>
                                  )}
                                  {request.status === "em_confeccao" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setShowFinishRequestDialog(true);
                                      }}
                                      className="gap-1 text-success hover:text-success hover:bg-success/10"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      {t("legal.finish")}
                                    </Button>
                                  )}
                                  {request.status === "finalizada" &&
                                    request.resultDocumentId && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const doc = supplierDocuments.find(
                                            (d) =>
                                              d.id === request.resultDocumentId,
                                          );
                                          if (doc) handleDownloadContract(doc);
                                        }}
                                        className="gap-1"
                                      >
                                        <Download className="h-4 w-4" />
                                        {t("legal.download")}
                                      </Button>
                                    )}
                                </div>
                              </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Mobile Cards - Visible only on mobile */}
                    <div className="md:hidden divide-y divide-border">
                      {paginatedRequests.map((request) => (
                        <div
                          key={request.id}
                          className="p-2 hover:bg-subtle-fill/30 active:bg-subtle-fill/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="p-1 rounded-md bg-primary/10 shrink-0">
                                <Building2 className="h-3 w-3 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-text-primary text-[13px] truncate">
                                  {request.supplierLegalName}
                                </p>
                                <p className="text-[10px] text-text-secondary font-mono truncate">
                                  {request.supplierTaxId}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {renderRequestStatusBadge(request.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1 mb-2 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              {request.supplierScope === "NATIONAL" ? (
                                <Flag className="h-2.5 w-2.5 text-text-secondary shrink-0" />
                              ) : (
                                <Globe className="h-2.5 w-2.5 text-text-secondary shrink-0" />
                              )}
                              <span className="text-text-primary">
                                {request.supplierScope === "NATIONAL"
                                  ? t("legal.national")
                                  : t("legal.international")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="h-2.5 w-2.5 text-text-secondary shrink-0" />
                              <span className="text-text-primary truncate">
                                {getUserName(request.requestedBy)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 col-span-2">
                              <Clock className="h-2.5 w-2.5 text-text-secondary shrink-0" />
                              <span className="text-text-secondary">
                                {formatDate(request.requestedAt)} {" • "}
                                <span className="text-warning">
                                  {getDaysAgo(request.requestedAt)}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {request.status === "pendente" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartRequest(request)}
                                className="flex-1 h-7 text-xs gap-1 text-info hover:text-info hover:border-info/50"
                              >
                                <Play className="h-3 w-3" />
                                {t("legal.start")}
                              </Button>
                            )}
                            {request.status === "em_confeccao" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowFinishRequestDialog(true);
                                }}
                                className="flex-1 h-7 text-xs gap-1 text-success hover:text-success hover:border-success/50"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                {t("legal.finish")}
                              </Button>
                            )}
                            {request.status === "finalizada" &&
                              request.resultDocumentId && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const doc = supplierDocuments.find(
                                      (d) =>
                                        d.id === request.resultDocumentId,
                                    );
                                    if (doc) handleDownloadContract(doc);
                                  }}
                                  className="flex-1 h-7 text-xs gap-1"
                                >
                                  <Download className="h-3 w-3" />
                                  {t("legal.download")}
                                </Button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {renderPagination(
                      requestValidCurrentPage,
                      requestTotalPages,
                      setRequestCurrentPage,
                      requestPageSize,
                      setRequestPageSize,
                      filteredRequests.length,
                    )}
                  </>
                )}
              </CardContent>
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="mt-0">
              <CardContent className="p-0">
                {/* Filters */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border-b">
                  <Select
                    value={contractSupplierFilter}
                    onValueChange={(v) => {
                      setContractSupplierFilter(v);
                      setContractCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full md:w-64 text-left">
                      <Building2 className="h-4 w-4 mr-2 shrink-0" />
                      <SelectValue placeholder={t("legal.filterBySupplier")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("legal.allSuppliers")}
                      </SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.legalName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={contractScopeFilter}
                    onValueChange={(v) => {
                      setContractScopeFilter(
                        v as "all" | "NATIONAL" | "INTERNATIONAL",
                      );
                      setContractCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full md:w-64 text-left">
                      <Globe className="h-4 w-4 mr-2 shrink-0" />
                      <SelectValue placeholder={t("legal.filterByScope")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("legal.allScopes")}
                      </SelectItem>
                      <SelectItem value="NATIONAL">
                        {t("legal.scopeNational")}
                      </SelectItem>
                      <SelectItem value="INTERNATIONAL">
                        {t("legal.scopeInternational")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={showExpiredContracts ? "secondary" : "outline"}
                    onClick={() =>
                      setShowExpiredContracts(!showExpiredContracts)
                    }
                    className="gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {showExpiredContracts
                      ? t("legal.hideExpired")
                      : t("legal.showExpired")}
                  </Button>
                </div>

                {/* Table */}
                {filteredContracts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Paperclip className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">
                      {t("legal.noContractsFound")}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t("legal.noContractsFoundDescription")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto px-4 py-4">
                      <div className="rounded-t-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-subtle-fill/50 hover:bg-subtle-fill/50">
                              <TableHead
                                className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                                onClick={() =>
                                  handleContractSort("supplierName")
                                }
                              >
                                <div className="flex items-center gap-2">
                                  {t("legal.supplier")}
                                  {getSortIcon("supplierName", "contract")}
                                </div>
                              </TableHead>
                              <TableHead
                                className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleContractSort("fileName")}
                              >
                                <div className="flex items-center gap-2">
                                  {t("legal.contract")}
                                  {getSortIcon("fileName", "contract")}
                                </div>
                              </TableHead>
                              <TableHead
                                className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                                onClick={() =>
                                  handleContractSort("validUntil")
                                }
                              >
                                <div className="flex items-center gap-2">
                                  {t("legal.validity")}
                                  {getSortIcon("validUntil", "contract")}
                                </div>
                              </TableHead>
                              <TableHead
                                className="text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleContractSort("createdAt")}
                              >
                                <div className="flex items-center gap-2">
                                  {t("legal.uploadedAt")}
                                  {getSortIcon("createdAt", "contract")}
                                </div>
                              </TableHead>
                              <TableHead className="text-text-secondary font-medium text-xs uppercase tracking-wider text-right">
                                {t("legal.actions")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedContracts.map((contract) => {
                              const isExpired =
                                contract.validUntil &&
                                isContractExpired(contract.validUntil);
                              return (
                                <TableRow
                                  key={contract.id}
                                  className={`hover:bg-subtle-fill/30 ${isExpired ? "opacity-60" : ""}`}
                                >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="font-medium text-foreground">
                                      {getSupplierName(contract.supplierId)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-foreground">
                                        {contract.fileName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(contract.fileSize)}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    {renderContractValidityBadge(
                                      contract.validUntil,
                                    )}
                                    {contract.validUntil && (
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(contract.validUntil)}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm text-foreground">
                                      {formatDate(contract.createdAt)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {getUserName(contract.uploadedBy)}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDownloadContract(contract)
                                      }
                                      className="h-8 w-8"
                                      title={t("legal.download")}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleReplaceContract(contract)
                                      }
                                      className="h-8 w-8"
                                      title={t("legal.replace")}
                                    >
                                      <RefreshCw className="h-4 w-4" />
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
                      {paginatedContracts.map((contract) => {
                        const isExpired =
                          contract.validUntil &&
                          isContractExpired(contract.validUntil);
                        return (
                          <div
                            key={contract.id}
                            className={`p-2 hover:bg-subtle-fill/30 active:bg-subtle-fill/50 transition-colors ${isExpired ? "opacity-60" : ""}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="p-1 rounded-md bg-primary/10 shrink-0">
                                  <Paperclip className="h-3 w-3 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-text-primary text-[13px] truncate">
                                    {contract.fileName}
                                  </p>
                                  <p className="text-[10px] text-text-secondary truncate">
                                    {getSupplierName(contract.supplierId)}
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0">
                                {renderContractValidityBadge(
                                  contract.validUntil,
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1 mb-2 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <User className="h-2.5 w-2.5 text-text-secondary shrink-0" />
                                <span className="text-text-primary truncate">
                                  {getUserName(contract.uploadedBy)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-2.5 w-2.5 text-text-secondary shrink-0" />
                                <span className="text-text-secondary">
                                  {formatDate(contract.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 col-span-2">
                                <AlertCircle className="h-2.5 w-2.5 text-text-secondary shrink-0" />
                                <span className="text-text-secondary">
                                  {contract.validUntil
                                    ? formatDate(contract.validUntil)
                                    : t("legal.noExpiry")}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownloadContract(contract)
                                }
                                className="flex-1 h-7 text-xs gap-1"
                              >
                                <Download className="h-3 w-3" />
                                {t("legal.download")}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleReplaceContract(contract)
                                }
                                className="flex-1 h-7 text-xs gap-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                {t("legal.replace")}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {renderPagination(
                      contractValidCurrentPage,
                      contractTotalPages,
                      setContractCurrentPage,
                      contractPageSize,
                      setContractPageSize,
                      filteredContracts.length,
                    )}
                  </>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* New Request Dialog */}
      <ContractRequestDialog
        open={showNewRequestDialog}
        onOpenChange={setShowNewRequestDialog}
        origin="legal_manual"
      />

      {/* Finish Request Dialog */}
      <FinishRequestDialog
        open={showFinishRequestDialog}
        onOpenChange={setShowFinishRequestDialog}
        selectedRequest={selectedRequest}
        finishContractFile={finishContractFile}
        setFinishContractFile={setFinishContractFile}
        finishValidUntil={finishValidUntil}
        setFinishValidUntil={setFinishValidUntil}
        finishHasValidity={finishHasValidity}
        setFinishHasValidity={setFinishHasValidity}
        onFinish={handleFinishRequest}
        fileInputRef={fileInputRef}
      />

      {/* Replace Contract Dialog */}
      <ReplaceContractDialog
        open={showUploadContractDialog}
        onOpenChange={setShowUploadContractDialog}
        selectedContract={selectedContract}
        onClose={() => {
          setShowUploadContractDialog(false);
          setSelectedContract(null);
        }}
      />
    </AppLayout>
  );
}
