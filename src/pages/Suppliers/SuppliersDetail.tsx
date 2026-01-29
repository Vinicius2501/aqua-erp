import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Shield,
  ShieldCheck,
  ShieldX,
  Tag,
  Calendar,
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ContractRequestDialog,
  type ContractRequestSupplierData,
} from "@/components/shared/ContractRequestDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppLayout } from "@/layouts/AppLayout";
import {
  suppliers,
  supplierDocuments,
  contractRequests,
} from "@/data/mockdata";
import type {
  Supplier,
  SupplierOfferingType,
  SupplierDocument,
  ContractRequest,
} from "@/types/domain";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const dateLocale = language === "pt" ? ptBR : enUS;

  const supplier = suppliers.find((s) => s.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>(supplier || {});

  // Contract request dialog state
  const [showContractRequestDialog, setShowContractRequestDialog] =
    useState(false);

  // Get supplier's contracts and pending requests
  const supplierContracts = useMemo(() => {
    if (!supplier) return [];
    return supplierDocuments.filter(
      (doc) =>
        doc.supplierId === supplier.id && doc.categoryCode === "contract",
    );
  }, [supplier]);

  const supplierContractRequests = useMemo(() => {
    if (!supplier) return [];
    return contractRequests.filter(
      (req) => req.supplierId === supplier.id && req.status !== "finalizada",
    );
  }, [supplier]);

  const hasPendingRequest = supplierContractRequests.length > 0;

  const getContractValidityBadge = (doc: SupplierDocument) => {
    if (!doc.validUntil) return null;
    const validUntil = new Date(doc.validUntil);
    const daysRemaining = differenceInDays(validUntil, new Date());

    if (isPast(validUntil)) {
      return (
        <Badge variant="destructive" className="text-xs">
          {t("supplierDetail.contractExpired")}
        </Badge>
      );
    }
    if (daysRemaining <= 30) {
      return (
        <Badge
          variant="outline"
          className="text-xs border-amber-500 text-amber-500"
        >
          {t("supplierDetail.contractExpiringSoon", { days: daysRemaining })}
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-xs border-green-500 text-green-500"
      >
        {t("supplierDetail.contractValid")}
      </Badge>
    );
  };

  const getRequestStatusBadge = (status: ContractRequest["status"]) => {
    switch (status) {
      case "pendente":
        return (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {t("supplierDetail.requestPending")}
          </Badge>
        );
      case "em_confeccao":
        return (
          <Badge className="text-xs bg-blue-500">
            <FileText className="h-3 w-3 mr-1" />
            {t("supplierDetail.requestInProgress")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!supplier) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {t("supplierDetail.notFound")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("supplierDetail.notFoundDescription")}
          </p>
          <Button onClick={() => navigate("/suppliers")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.backToList")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleStartEdit = () => {
    setFormData(supplier);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(supplier);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Em uma aplicação real, isso chamaria uma API
    toast.success(
      language === "pt"
        ? "Fornecedor atualizado com sucesso!"
        : "Supplier updated successfully!",
    );
    setIsEditing(false);
  };

  const updateField = <K extends keyof Supplier>(
    field: K,
    value: Supplier[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePrimaryContact = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      primaryContact: {
        name: prev.primaryContact?.name || "",
        phone: prev.primaryContact?.phone || "",
        email: prev.primaryContact?.email || "",
        [field]: value,
      },
    }));
  };

  const getOfferingTypeLabel = (type: string) => {
    switch (type) {
      case "produto":
        return t("supplierDetail.offeringProduct");
      case "servico":
        return t("supplierDetail.offeringService");
      case "produtos_e_servicos":
        return t("supplierDetail.offeringBoth");
      default:
        return type;
    }
  };

  const displayData = isEditing ? formData : supplier;

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    className = "",
  }: {
    icon?: React.ElementType;
    label: string;
    value: string | null | undefined;
    className?: string;
  }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
      <span className="text-foreground font-medium">{value || "-"}</span>
    </div>
  );

  const EditableField = ({
    label,
    value,
    onChange,
    type = "text",
    icon: Icon,
    className = "",
  }: {
    label: string;
    value: string | null | undefined;
    onChange: (value: string) => void;
    type?: "text" | "email" | "tel" | "textarea";
    icon?: React.ElementType;
    className?: string;
  }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label className="text-sm text-muted-foreground flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </Label>
      {type === "textarea" ? (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-25"
        />
      ) : (
        <Input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/suppliers")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {displayData.tradeName || displayData.legalName}
              </h1>
              <p className="text-muted-foreground">{displayData.taxId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={displayData.isApproved ? "default" : "destructive"}
              className="flex items-center gap-1.5"
            >
              {displayData.isApproved ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("common.approved")}
                </>
              ) : (
                <>
                  <ShieldX className="h-3.5 w-3.5" />
                  {t("common.notApproved")}
                </>
              )}
            </Badge>
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  {t("common.save")}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleStartEdit}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                {t("common.edit")}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações da Empresa */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  {t("supplierDetail.companyInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <EditableField
                      label={t("suppliers.companyName")}
                      value={formData.legalName}
                      onChange={(v) => updateField("legalName", v)}
                    />
                    <EditableField
                      label={t("suppliers.tradeName")}
                      value={formData.tradeName}
                      onChange={(v) => updateField("tradeName", v)}
                    />
                    <EditableField
                      label={t("suppliers.cnpj")}
                      value={formData.taxId}
                      onChange={(v) => updateField("taxId", v)}
                    />
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm text-muted-foreground">
                        {t("supplierDetail.companyType")}
                      </Label>
                      <Select
                        value={formData.companySize || ""}
                        onValueChange={(v) => updateField("companySize", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              language === "pt"
                                ? "Selecione o porte"
                                : "Select size"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEI">
                            {t("supplierDetail.sizeMEI")}
                          </SelectItem>
                          <SelectItem value="ME">
                            {t("supplierDetail.sizeME")}
                          </SelectItem>
                          <SelectItem value="EPP">
                            {t("supplierDetail.sizeEPP")}
                          </SelectItem>
                          <SelectItem value="Média">
                            {t("supplierDetail.sizeMedium")}
                          </SelectItem>
                          <SelectItem value="Grande">
                            {t("supplierDetail.sizeLarge")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm text-muted-foreground">
                        {t("supplierDetail.companySize")}
                      </Label>
                      <Input
                        value={formData.companySize || ""}
                        onChange={(e) =>
                          updateField("companySize", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm text-muted-foreground">
                        {t("supplierDetail.offeringType")}
                      </Label>
                      <Select
                        value={formData.offeringType}
                        onValueChange={(v) =>
                          updateField("offeringType", v as SupplierOfferingType)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="produto">
                            {t("supplierDetail.offeringProduct")}
                          </SelectItem>
                          <SelectItem value="servico">
                            {t("supplierDetail.offeringService")}
                          </SelectItem>
                          <SelectItem value="produtos_e_servicos">
                            {t("supplierDetail.offeringBoth")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InfoItem
                      label={t("suppliers.companyName")}
                      value={supplier.legalName}
                    />
                    <InfoItem
                      label={t("suppliers.tradeName")}
                      value={supplier.tradeName}
                    />
                    <InfoItem
                      label={t("suppliers.cnpj")}
                      value={supplier.taxId}
                    />
                    <InfoItem
                      label={t("supplierDetail.companyType")}
                      value={supplier.companyType}
                    />
                    <InfoItem
                      label={t("supplierDetail.companySize")}
                      value={supplier.companySize}
                    />
                    <InfoItem
                      label={t("supplierDetail.offeringType")}
                      value={getOfferingTypeLabel(supplier.offeringType)}
                    />
                  </div>
                )}

                {displayData.offeringTags &&
                  displayData.offeringTags.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          {t("supplierDetail.tags")}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {displayData.offeringTags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
              </CardContent>
            </Card>

            {/* Informações de Contato */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  {t("supplierDetail.contactInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <EditableField
                      icon={Mail}
                      label={t("suppliers.email")}
                      value={formData.generalEmail}
                      onChange={(v) => updateField("generalEmail", v)}
                      type="email"
                    />
                    <EditableField
                      icon={Phone}
                      label={t("suppliers.phone")}
                      value={formData.phone}
                      onChange={(v) => updateField("phone", v)}
                      type="tel"
                    />
                    <EditableField
                      icon={MapPin}
                      label={t("suppliers.address")}
                      value={formData.address}
                      onChange={(v) => updateField("address", v)}
                      className="sm:col-span-2"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InfoItem
                      icon={Mail}
                      label={t("suppliers.email")}
                      value={supplier.generalEmail}
                    />
                    <InfoItem
                      icon={Phone}
                      label={t("suppliers.phone")}
                      value={supplier.phone}
                    />
                    <InfoItem
                      icon={MapPin}
                      label={t("suppliers.address")}
                      value={supplier.address}
                      className="sm:col-span-2"
                    />
                  </div>
                )}

                {(displayData.primaryContact || isEditing) && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">
                        {t("supplierDetail.primaryContact")}
                      </h4>
                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/50 p-4 rounded-lg">
                          <EditableField
                            label={t("supplierDetail.contactName")}
                            value={formData.primaryContact?.name}
                            onChange={(v) => updatePrimaryContact("name", v)}
                          />
                          <EditableField
                            label={t("suppliers.phone")}
                            value={formData.primaryContact?.phone}
                            onChange={(v) => updatePrimaryContact("phone", v)}
                            type="tel"
                          />
                          <EditableField
                            label={t("suppliers.email")}
                            value={formData.primaryContact?.email}
                            onChange={(v) => updatePrimaryContact("email", v)}
                            type="email"
                          />
                        </div>
                      ) : displayData.primaryContact ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/50 p-4 rounded-lg">
                          <InfoItem
                            label={t("supplierDetail.contactName")}
                            value={displayData.primaryContact.name}
                          />
                          <InfoItem
                            label={t("suppliers.phone")}
                            value={displayData.primaryContact.phone}
                          />
                          <InfoItem
                            label={t("suppliers.email")}
                            value={displayData.primaryContact.email}
                          />
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("supplierDetail.additionalInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={formData.additionalInfo || ""}
                    onChange={(e) =>
                      updateField("additionalInfo", e.target.value)
                    }
                    placeholder={
                      language === "pt"
                        ? "Informações adicionais..."
                        : "Additional information..."
                    }
                    className="min-h-30"
                  />
                ) : (
                  <p className="text-foreground whitespace-pre-wrap">
                    {supplier.additionalInfo || "-"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Barra Lateral */}
          <div className="space-y-6">
            {/* Status de Aprovação - Seção Separada */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  {t("supplierDetail.approvalStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-6">
                    {/* Alternância de Aprovação */}
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">
                          {t("supplierDetail.isApproved")}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {language === "pt"
                            ? "Marque se o fornecedor está homologado"
                            : "Check if the supplier is approved"}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isApproved || false}
                        onCheckedChange={(checked) =>
                          updateField("isApproved", checked)
                        }
                      />
                    </div>

                    {formData.isApproved && (
                      <div className="space-y-4 p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                        {/* Aprovado Em */}
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {t("supplierDetail.approvedAt")}
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.approvedAt &&
                                    "text-muted-foreground",
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {formData.approvedAt
                                  ? format(
                                      new Date(formData.approvedAt),
                                      "PPP",
                                      { locale: dateLocale },
                                    )
                                  : language === "pt"
                                    ? "Selecione a data"
                                    : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={
                                  formData.approvedAt
                                    ? new Date(formData.approvedAt)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  updateField(
                                    "approvedAt",
                                    date?.toISOString() || null,
                                  )
                                }
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Válido Até */}
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {t("supplierDetail.validUntil")}
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.approvalValidUntil &&
                                    "text-muted-foreground",
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {formData.approvalValidUntil
                                  ? format(
                                      new Date(formData.approvalValidUntil),
                                      "PPP",
                                      { locale: dateLocale },
                                    )
                                  : language === "pt"
                                    ? "Selecione a data"
                                    : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={
                                  formData.approvalValidUntil
                                    ? new Date(formData.approvalValidUntil)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  updateField(
                                    "approvalValidUntil",
                                    date?.toISOString() || null,
                                  )
                                }
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className={`flex items-center gap-3 p-4 rounded-lg ${
                        displayData.isApproved
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-red-500/10 border border-red-500/20"
                      }`}
                    >
                      {displayData.isApproved ? (
                        <ShieldCheck className="h-8 w-8 text-green-500" />
                      ) : (
                        <ShieldX className="h-8 w-8 text-red-500" />
                      )}
                      <div>
                        <p
                          className={`font-semibold ${
                            displayData.isApproved
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {displayData.isApproved
                            ? t("supplierDetail.approved")
                            : t("supplierDetail.notApproved")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {displayData.isApproved
                            ? t("supplierDetail.approvedDescription")
                            : t("supplierDetail.notApprovedDescription")}
                        </p>
                      </div>
                    </div>

                    {displayData.isApproved && (
                      <div className="space-y-3">
                        <InfoItem
                          icon={Calendar}
                          label={t("supplierDetail.approvedAt")}
                          value={
                            displayData.approvedAt
                              ? format(
                                  new Date(displayData.approvedAt),
                                  "PPP",
                                  { locale: dateLocale },
                                )
                              : null
                          }
                        />
                        <InfoItem
                          icon={Calendar}
                          label={t("supplierDetail.validUntil")}
                          value={
                            displayData.approvalValidUntil
                              ? format(
                                  new Date(displayData.approvalValidUntil),
                                  "PPP",
                                  { locale: dateLocale },
                                )
                              : null
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Requisitos de Contrato */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("supplierDetail.contractRequirement")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div className="space-y-1">
                        <Label>{t("supplierDetail.requiresContract")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("supplierDetail.requiresContractDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={formData.requiresContract || false}
                        onCheckedChange={(checked) =>
                          updateField("requiresContract", checked)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {displayData.requiresContract ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Tag className="h-8 w-8 text-amber-500" />
                        <div>
                          <p className="font-semibold text-amber-500">
                            {t("supplierDetail.contractRequired")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("supplierDetail.contractRequiredDescription")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Shield className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-semibold text-green-500">
                            {t("supplierDetail.contractNotRequired")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("supplierDetail.contractNotRequiredDescription")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Existing Contracts */}
                    {supplierContracts.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            {t("supplierDetail.activeContracts")}
                          </h4>
                          <div className="space-y-2">
                            {supplierContracts.map((contract) => (
                              <div
                                key={contract.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                              >
                                <div className="space-y-1">
                                  <p className="font-medium text-sm">
                                    {contract.fileName}
                                  </p>
                                  {contract.validUntil && (
                                    <p className="text-xs text-muted-foreground">
                                      {t("supplierDetail.validUntil")}:{" "}
                                      {format(
                                        new Date(contract.validUntil),
                                        "PPP",
                                        {
                                          locale: dateLocale,
                                        },
                                      )}
                                    </p>
                                  )}
                                </div>
                                {getContractValidityBadge(contract)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Pending Contract Requests */}
                    {supplierContractRequests.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {t("supplierDetail.pendingRequests")}
                          </h4>
                          <div className="space-y-2">
                            {supplierContractRequests.map((request) => (
                              <div
                                key={request.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                              >
                                <div className="space-y-1">
                                  <p className="font-medium text-sm">
                                    {t("supplierDetail.contractRequestLabel")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(request.requestedAt),
                                      "PPP",
                                      {
                                        locale: dateLocale,
                                      },
                                    )}
                                  </p>
                                </div>
                                {getRequestStatusBadge(request.status)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Request Contract Button */}
                    {displayData.requiresContract && !hasPendingRequest && (
                      <>
                        <Separator />
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => setShowContractRequestDialog(true)}
                        >
                          <Plus className="h-4 w-4" />
                          {t("supplierDetail.requestContract")}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            {!isEditing && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    {t("supplierDetail.quickActions")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {t("supplierDetail.viewPOs")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleStartEdit}
                  >
                    <Edit className="h-4 w-4" />
                    {t("supplierDetail.editSupplier")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Contract Request Dialog */}
      <ContractRequestDialog
        open={showContractRequestDialog}
        onOpenChange={setShowContractRequestDialog}
        origin="supplier_registration"
        supplier={{
          id: supplier.id,
          legalName: supplier.legalName,
          taxId: supplier.taxId,
          scope: supplier.supplierScope || "NATIONAL",
        }}
      />
    </AppLayout>
  );
};

export default SupplierDetail;
