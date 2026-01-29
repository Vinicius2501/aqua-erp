import { useState, useMemo, useRef } from "react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { enUS, ptBR } from "date-fns/locale";
import {
  Filter,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Upload,
  FileText,
  X,
  Eye,
  Download,
  Receipt,
  Check,
  Edit2,
  CheckCircle2,
  CreditCard,
  Clock,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { POAllocation, Currency } from "@/types/domain";
import { companies as allCompanies } from "@/data/mockdata";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";

interface AttachmentData {
  id: string;
  name: string;
  type: "boleto" | "nota_fiscal";
  url: string;
  uploadedAt: string;
}

type PaymentStatus = "provisionado" | "agendado" | "pago";

// Informações de pagamento para transferência
interface PaymentInfo {
  bank?: string;
  agency?: string;
  accountNumber?: string;
  confirmed?: boolean;
}

interface InstallmentData {
  id: string;
  installmentNumber: number;
  dueDate: string;
  payerCompanyId: string;
  payerCompanyName: string;
  amount: number;
  status: PaymentStatus;
  attachments: AttachmentData[];
  paymentInfo?: PaymentInfo;
}

interface InstallmentAllocationTableProps {
  allocations: POAllocation[];
  totalValue: number;
  currency: Currency;
  installmentCount?: number | null;
  className?: string;
  readOnly?: boolean;
  paymentMethodCode?: string;
  defaultPaymentInfo?: PaymentInfo;
}

function getStatusConfig(
  t: (key: string) => string
): Record<
  PaymentStatus,
  { label: string; className: string; description: string }
> {
  return {
    provisionado: {
      label: t("installment.provisioned"),
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-700",
      description: t("installment.provisionedDesc"),
    },
    agendado: {
      label: t("installment.scheduled"),
      className: "bg-info/10 text-info",
      description: t("installment.scheduledDesc"),
    },
    pago: {
      label: t("installment.paid"),
      className: "bg-success/10 text-success",
      description: t("installment.paidDesc"),
    },
  };
}

// Gera dados mock de parcelas a partir das alocações
function generateInstallmentData(
  allocations: POAllocation[],
  installmentCount: number,
  defaultPaymentInfo?: PaymentInfo
): InstallmentData[] {
  const data: InstallmentData[] = [];
  const today = new Date();

  // Agrupa alocações por empresa
  const allocationsByCompany = allocations.reduce((acc, alloc) => {
    if (!acc[alloc.payerCompanyId]) {
      acc[alloc.payerCompanyId] = [];
    }
    acc[alloc.payerCompanyId].push(alloc);
    return acc;
  }, {} as Record<string, POAllocation[]>);

  // Para cada empresa, cria parcelas
  Object.entries(allocationsByCompany).forEach(
    ([companyId, companyAllocations]) => {
      const company = allCompanies.find((c) => c.id === companyId);
      const totalAmount = companyAllocations.reduce(
        (sum, a) => sum + a.allocationAmount,
        0
      );
      const amountPerInstallment = totalAmount / installmentCount;

      for (let i = 1; i <= installmentCount; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(dueDate.getMonth() + i);

        // Mock de alguns anexos para parcelas pagas
        const mockAttachments: AttachmentData[] =
          i <= 1
            ? [
                {
                  id: `att-${companyId}-${i}-1`,
                  name: `boleto_parcela_${i}.pdf`,
                  type: "boleto",
                  url: "#",
                  uploadedAt: new Date().toISOString(),
                },
              ]
            : [];

        // Determina status baseado em anexos e pagamento
        let status: PaymentStatus = "provisionado";
        if (i === 1) {
          status = "pago";
        } else if (i === 2) {
          status = "agendado";
        }

        data.push({
          id: `inst-${companyId}-${i}`,
          installmentNumber: i,
          dueDate: dueDate.toISOString(),
          payerCompanyId: companyId,
          payerCompanyName: company?.name || "Empresa Desconhecida",
          amount: amountPerInstallment,
          status,
          attachments: mockAttachments,
          paymentInfo: defaultPaymentInfo
            ? { ...defaultPaymentInfo, confirmed: i <= 2 }
            : undefined,
        });
      }
    }
  );

  return data.sort((a, b) => a.installmentNumber - b.installmentNumber);
}

// Componente de upload de anexo
function AttachmentUploader({
  installmentId,
  onUpload,
  t,
}: {
  installmentId: string;
  onUpload: (id: string, file: File, type: "boleto" | "nota_fiscal") => void;
  t: (key: string) => string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<"boleto" | "nota_fiscal">(
    "boleto"
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(installmentId, file, selectedType);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedType}
        onValueChange={(v) => setSelectedType(v as "boleto" | "nota_fiscal")}
      >
        <SelectTrigger className="w-32.5 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="boleto">{t("installment.boleto")}</SelectItem>
          <SelectItem value="nota_fiscal">
            {t("installment.invoice")}
          </SelectItem>
        </SelectContent>
      </Select>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-3 w-3" />
        {t("installment.attach")}
      </Button>
    </div>
  );
}

// Componente de lista de anexos
function AttachmentList({
  attachments,
  onRemove,
  readOnly = false,
  isPaid = false,
  t,
  language,
}: {
  attachments: AttachmentData[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
  isPaid?: boolean;
  t: (key: string) => string;
  language: "pt" | "en";
}) {
  const dateLocale = language === "pt" ? ptBR : enUS;

  if (attachments.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic">Nenhum anexo</span>
    );
  }

  const canRemove = !readOnly && !isPaid;

  return (
    <div className="flex flex-wrap gap-1">
      {attachments.map((att) => (
        <Tooltip key={att.id}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                att.type === "boleto"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {att.type === "boleto" ? (
                <Receipt className="h-3 w-3" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              <span className="max-w-20 truncate">{att.name}</span>
              <div className="flex items-center gap-0.5 ml-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => toast.info(t("installment.viewFile"))}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => toast.info(t("installment.downloadFile"))}
                >
                  <Download className="h-3 w-3" />
                </Button>
                {canRemove && onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
                    onClick={() => onRemove(att.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {att.type === "boleto"
                ? t("installment.boleto")
                : t("installment.invoice")}
              : {att.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("installment.uploadedOn")}
              {format(new Date(att.uploadedAt), "dd/MM/yyyy", {
                locale: dateLocale,
              })}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

function PaymentConfirmDialog({
  installment,
  isTransfer,
  onConfirm,
  onUpdate,
  readOnly = false,
}: {
  installment: InstallmentData;
  isTransfer: boolean;
  onConfirm: (id: string) => void;
  onUpdate: (id: string, paymentInfo: PaymentInfo) => void;
  readOnly?: boolean;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PaymentInfo>({
    bank: installment.paymentInfo?.bank || "",
    agency: installment.paymentInfo?.agency || "",
    accountNumber: installment.paymentInfo?.accountNumber || "",
    confirmed: installment.paymentInfo?.confirmed || false,
  });

  const handleConfirm = () => {
    onConfirm(installment.id);
    setOpen(false);
    toast.success(`Parcela ${installment.installmentNumber}ª confirmada`);
  };

  const handleSave = () => {
    onUpdate(installment.id, { ...formData, confirmed: true });
    setIsEditing(false);
    setOpen(false);
    toast.success("Dados de pagamento atualizados");
  };

  const isConfirmed = installment.paymentInfo?.confirmed;
  const isPaid = installment.status === "pago";

  if (isPaid) {
    return (
      <div className="flex items-center gap-1 text-xs text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>{t("installment.paid")}</span>
      </div>
    );
  }

  if (!isTransfer) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isConfirmed ? "ghost" : "outline"}
          size="sm"
          className={cn(
            "h-7 text-xs gap-1.5",
            isConfirmed && "text-success hover:text-success"
          )}
          disabled={readOnly}
        >
          {isConfirmed ? (
            <>
              <Check className="h-3 w-3" />
              {t("installment.confirmed")}
            </>
          ) : (
            <>
              <CreditCard className="h-3 w-3" />
              {t("installment.confirmData")}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t("installment.paymentinfoMessage", {
              "installment.installmentNumber": installment.installmentNumber,
            })}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("installment.editPaymentData")
              : t("installment.confirmPaymentData")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informação da Parcela */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">Vencimento</p>
              <p className="text-sm font-medium">
                {format(new Date(installment.dueDate), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-sm font-medium">
                R${" "}
                {installment.amount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Informação Bancária */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bank" className="text-sm">
                Banco
              </Label>
              <Input
                id="bank"
                value={formData.bank}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bank: e.target.value }))
                }
                placeholder="Ex: Banco do Brasil"
                disabled={!isEditing && isConfirmed}
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="agency" className="text-sm">
                  Agência
                </Label>
                <Input
                  id="agency"
                  value={formData.agency}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, agency: e.target.value }))
                  }
                  placeholder="0000"
                  disabled={!isEditing && isConfirmed}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm">
                  Conta
                </Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                  placeholder="00000-0"
                  disabled={!isEditing && isConfirmed}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isConfirmed && !isEditing ? (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Editar dados
            </Button>
          ) : isEditing ? (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-1.5">
                <Check className="h-3.5 w-3.5" />
                Salvar alterações
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Ajustar dados
              </Button>
              <Button onClick={handleConfirm} className="gap-1.5">
                <Check className="h-3.5 w-3.5" />
                Confirmar dados
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente de ícone de status
function PaymentStatusIcon({ status }: { status: PaymentStatus }) {
  const iconClass = "h-3.5 w-3.5";

  switch (status) {
    case "pago":
      return <CheckCircle2 className={cn(iconClass, "text-success")} />;
    case "agendado":
      return <Clock className={cn(iconClass, "text-info")} />;
    case "provisionado":
      return <CircleDollarSign className={cn(iconClass, "text-warning")} />;
  }
}

export function InstallmentAllocationTable({
  allocations,
  totalValue,
  currency,
  installmentCount = 1,
  className,
  readOnly = true,
  paymentMethodCode = "TRANSFERENCIA",
  defaultPaymentInfo,
}: InstallmentAllocationTableProps) {
  const { t, language } = useLanguage();
  const statusConfig = getStatusConfig(t);
  const dateLocale = language === "pt" ? ptBR : enUS;
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [installmentFilter, setInstallmentFilter] = useState<string>("all");
  /*const [expandedInstallments, setExpandedInstallments] = useState<Set<number>>(
    new Set()
  );*/
  const [installmentData, setInstallmentData] = useState<InstallmentData[]>(
    () =>
      generateInstallmentData(
        allocations,
        installmentCount || 1,
        defaultPaymentInfo
      )
  );
  
  // Estado para anexos globais (compartilhados entre todas as parcelas)
  const [globalAttachments, setGlobalAttachments] = useState<AttachmentData[]>([]);
  const globalFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedGlobalType, setSelectedGlobalType] = useState<"boleto" | "nota_fiscal">("nota_fiscal");

  const isTransferPayment = paymentMethodCode === "TRANSFERENCIA";

  // Obtém empresas e parcelas únicas para filtros
  const uniqueCompanies = useMemo(() => {
    const companies = new Map<string, string>();
    installmentData.forEach((item) => {
      companies.set(item.payerCompanyId, item.payerCompanyName);
    });
    return Array.from(companies.entries());
  }, [installmentData]);

  const uniqueInstallments = useMemo(() => {
    const installments = new Set<number>();
    installmentData.forEach((item) => installments.add(item.installmentNumber));
    return Array.from(installments).sort((a, b) => a - b);
  }, [installmentData]);

  // Aplicar filtros
  const filteredData = useMemo(() => {
    return installmentData.filter((item) => {
      if (companyFilter !== "all" && item.payerCompanyId !== companyFilter)
        return false;
      if (
        installmentFilter !== "all" &&
        item.installmentNumber !== parseInt(installmentFilter)
      )
        return false;
      return true;
    });
  }, [installmentData, companyFilter, installmentFilter]);

  // Agrupar por parcela para visualização expansível
  /*const groupedByInstallment = useMemo(() => {
    const groups: Record<number, InstallmentData[]> = {};
    filteredData.forEach((item) => {
      if (!groups[item.installmentNumber]) {
        groups[item.installmentNumber] = [];
      }
      groups[item.installmentNumber].push(item);
    });
    return groups;
  }, [filteredData]);*/

  // Agrupar por empresa (alocação) para visualização agrupada
  const groupedByCompany = useMemo(() => {
    const groups: Record<string, { name: string; items: InstallmentData[] }> =
      {};
    filteredData.forEach((item) => {
      if (!groups[item.payerCompanyId]) {
        groups[item.payerCompanyId] = {
          name: item.payerCompanyName,
          items: [],
        };
      }
      groups[item.payerCompanyId].items.push(item);
    });
    // Ordena itens por número de parcela dentro de cada grupo
    Object.values(groups).forEach((group) => {
      group.items.sort((a, b) => a.installmentNumber - b.installmentNumber);
    });
    return groups;
  }, [filteredData]);

  // Verifica se há múltiplas alocações
  const hasMultipleAllocations = uniqueCompanies.length > 1;

  // Estado para empresas expandidas
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(
    () => new Set(allocations.map((a) => a.payerCompanyId))
  );

  const toggleCompany = (companyId: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  };

  // Calcular totais
  const totalsByCompany = useMemo(() => {
    const totals: Record<string, { name: string; amount: number }> = {};
    filteredData.forEach((item) => {
      if (!totals[item.payerCompanyId]) {
        totals[item.payerCompanyId] = {
          name: item.payerCompanyName,
          amount: 0,
        };
      }
      totals[item.payerCompanyId].amount += item.amount;
    });
    return totals;
  }, [filteredData]);

  const grandTotal = useMemo(() => {
    return Object.values(totalsByCompany).reduce((sum, t) => sum + t.amount, 0);
  }, [totalsByCompany]);

  const hasDivergence = Math.abs(grandTotal - totalValue) > 0.01;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currency.language || "pt-BR", {
      style: "currency",
      currency: currency.code || "BRL",
    }).format(value);
  };

  /*const toggleInstallment = (num: number) => {
    setExpandedInstallments((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  };*/

  const handleUpload = (
    installmentId: string,
    file: File,
    type: "boleto" | "nota_fiscal"
  ) => {
    const newAttachment: AttachmentData = {
      id: `att-${Date.now()}`,
      name: file.name,
      type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    };

    setInstallmentData((prev) =>
      prev.map((item) => {
        if (item.id === installmentId) {
          // Atualiza status para 'agendado' se atualmente 'provisionado' e anexo for adicionado
          const newStatus: PaymentStatus =
            item.status === "provisionado" ? "agendado" : item.status;
          return {
            ...item,
            attachments: [...item.attachments, newAttachment],
            status: newStatus,
          };
        }
        return item;
      })
    );
    toast.success(
      `${
        type === "boleto" ? t("installment.boleto") : t("installment.invoice")
      } ${t("installment.attachedSuccess")}`
    );
  };

  const handleRemoveAttachment = (
    installmentId: string,
    attachmentId: string
  ) => {
    setInstallmentData((prev) =>
      prev.map((item) => {
        if (item.id === installmentId) {
          const newAttachments = item.attachments.filter(
            (a) => a.id !== attachmentId
          );
          // Se não restarem anexos e não estiver pago, reverte para 'provisionado'
          const newStatus: PaymentStatus =
            newAttachments.length === 0 && item.status !== "pago"
              ? "provisionado"
              : item.status;
          return {
            ...item,
            attachments: newAttachments,
            status: newStatus,
          };
        }
        return item;
      })
    );
    toast.success(t("installment.attachmentRemoved"));
  };

  // Handler para remover anexo global
  const handleRemoveGlobalAttachment = (attachmentId: string) => {
    setGlobalAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    toast.success("Anexo global removido de todos os pagamentos");
  };

  // Aplicar anexos globais automaticamente quando adicionados
  const handleGlobalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newAttachment: AttachmentData = {
        id: `global-att-${Date.now()}`,
        name: file.name,
        type: selectedGlobalType,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      };
      
      setGlobalAttachments((prev) => [...prev, newAttachment]);
      
      // Aplicar a todos os pagamentos imediatamente
      setInstallmentData((prev) =>
        prev.map((item) => {
          const newStatus: PaymentStatus =
            item.status === "provisionado" ? "agendado" : item.status;
          return {
            ...item,
            attachments: [...item.attachments, newAttachment],
            status: newStatus,
          };
        })
      );
      
      toast.success(
        `${selectedGlobalType === "boleto" ? t("installment.boleto") : t("installment.invoice")} anexado a todos os ${installmentCount || 1} pagamento(s)`
      );
      
      if (globalFileInputRef.current) {
        globalFileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmPayment = (installmentId: string) => {
    setInstallmentData((prev) =>
      prev.map((item) =>
        item.id === installmentId
          ? { ...item, paymentInfo: { ...item.paymentInfo, confirmed: true } }
          : item
      )
    );
  };

  const handleUpdatePaymentInfo = (
    installmentId: string,
    paymentInfo: PaymentInfo
  ) => {
    setInstallmentData((prev) =>
      prev.map((item) =>
        item.id === installmentId ? { ...item, paymentInfo } : item
      )
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Seção de Anexos Globais (para todos os pagamentos) */}
      {!readOnly && (installmentCount || 1) > 1 && (
        <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">
                    Anexos para Todos os Pagamentos
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Documentos que serão aplicados a todas as {installmentCount || 1} parcelas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedGlobalType}
                  onValueChange={(v) => setSelectedGlobalType(v as "boleto" | "nota_fiscal")}
                >
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto">{t("installment.boleto")}</SelectItem>
                    <SelectItem value="nota_fiscal">
                      {t("installment.invoice")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <input
                  ref={globalFileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleGlobalFileSelect}
                  className="hidden"
                />
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => globalFileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Anexar para Todos
                </Button>
              </div>
            </div>
          </CardHeader>
          {globalAttachments.length > 0 && (
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {globalAttachments.map((att) => (
                  <div
                    key={att.id}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs border-2",
                      att.type === "boleto"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    )}
                  >
                    {att.type === "boleto" ? (
                      <Receipt className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="font-medium">{att.name}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {installmentCount || 1} pagamentos
                    </Badge>
                    <div className="flex items-center gap-1 ml-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 hover:bg-transparent"
                        onClick={() => toast.info(t("installment.viewFile"))}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 hover:bg-transparent"
                        onClick={() => toast.info(t("installment.downloadFile"))}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 hover:bg-transparent hover:text-destructive"
                        onClick={() => handleRemoveGlobalAttachment(att.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t("installment.filters")}
          </span>
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-50 h-9">
            <SelectValue placeholder={t("installment.allCompanies")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("installment.allCompanies")}</SelectItem>
            {uniqueCompanies.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={installmentFilter} onValueChange={setInstallmentFilter}>
          <SelectTrigger className="w-44.5 h-9">
            <SelectValue placeholder="Parcela" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("installment.allInstallments")}
            </SelectItem>
            {uniqueInstallments.map((num) => (
              <SelectItem key={num} value={String(num)}>
                {t("installment.installmentN")} {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerta de Divergência */}
      {hasDivergence && (
        <Alert
          variant="destructive"
          className="bg-destructive/10 border-destructive/30"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t("installment.divergenceTitle")}</strong>{" "}
            {t("installment.divergenceDesc")
              .replace("{total}", formatCurrency(grandTotal))
              .replace("{poTotal}", formatCurrency(totalValue))}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela - Agrupada por Empresa quando múltiplas alocações */}
      {hasMultipleAllocations ? (
        <div className="space-y-4">
          {Object.entries(groupedByCompany).map(
            ([companyId, { name, items }]) => {
              const isExpanded = expandedCompanies.has(companyId);
              const companyTotal = items.reduce(
                (sum, item) => sum + item.amount,
                0
              );
              const paidCount = items.filter((i) => i.status === "pago").length;

              return (
                <Collapsible
                  key={companyId}
                  open={isExpanded}
                  onOpenChange={() => toggleCompany(companyId)}
                >
                  <div className="border rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <h4 className="font-medium">{name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {items.length}{" "}
                              {items.length > 1
                                ? t("installment.installmentsPlural")
                                : t("installment.installments")}{" "}
                              • {paidCount}{" "}
                              {paidCount !== 1
                                ? t("installment.paidPlural")
                                : t("installment.paidSingular")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            {formatCurrency(companyTotal)}
                          </span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-background">
                              <TableHead className="w-20">
                                {t("installment.installment")}
                              </TableHead>
                              <TableHead className="w-27.5">
                                {t("installment.dueDate")}
                              </TableHead>
                              <TableHead className="text-right w-30">
                                {t("installment.value")}
                              </TableHead>
                              <TableHead className="text-center w-22.5">
                                {t("installment.status")}
                              </TableHead>
                              <TableHead className="min-w-50">
                                {t("installment.attachments")}
                              </TableHead>
                              {!readOnly && (
                                <TableHead className="text-center w-45">
                                  {t("installment.actions")}
                                </TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item) => (
                              <TableRow
                                key={item.id}
                                className="hover:bg-muted/30"
                              >
                                <TableCell className="font-medium">
                                  {item.installmentNumber}ª
                                </TableCell>
                                <TableCell>
                                  {format(
                                    new Date(item.dueDate),
                                    language === "pt"
                                      ? "dd/MM/yyyy"
                                      : "MM/dd/yyyy",
                                    { locale: dateLocale }
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(item.amount)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    className={
                                      statusConfig[item.status]?.className ||
                                      "bg-muted text-muted-foreground"
                                    }
                                  >
                                    {statusConfig[item.status]?.label ||
                                      item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <AttachmentList
                                    attachments={item.attachments}
                                    onRemove={(attId) =>
                                      handleRemoveAttachment(item.id, attId)
                                    }
                                    readOnly={readOnly}
                                    isPaid={item.status === "pago"}
                                    t={t}
                                    language={language}
                                  />
                                </TableCell>
                                {!readOnly && (
                                  <TableCell>
                                    {item.status === "pago" ? (
                                      <span className="text-xs text-muted-foreground italic">
                                        {t("installment.paid")}
                                      </span>
                                    ) : (
                                      <AttachmentUploader
                                        installmentId={item.id}
                                        onUpload={handleUpload}
                                        t={t}
                                      />
                                    )}
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            }
          )}
        </div>
      ) : (
        /* Single allocation - flat table */
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-20">
                    {t("installment.installment")}
                  </TableHead>
                  <TableHead className="w-27.5">
                    {t("installment.dueDate")}
                  </TableHead>
                  <TableHead className="text-right w-30">
                    {t("installment.value")}
                  </TableHead>
                  <TableHead className="text-center w-22.5">
                    {t("installment.status")}
                  </TableHead>
                  {isTransferPayment && (
                    <TableHead className="w-35">
                      {t("installment.paymentData")}
                    </TableHead>
                  )}
                  <TableHead className="min-w-50">
                    {t("installment.attachments")}
                  </TableHead>
                  {!readOnly && (
                    <TableHead className="w-45">
                      {t("installment.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {item.installmentNumber}ª
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(item.dueDate),
                        language === "pt" ? "dd/MM/yyyy" : "MM/dd/yyyy",
                        {
                          locale: dateLocale,
                        }
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            className={cn(
                              "gap-1",
                              statusConfig[item.status]?.className ||
                                "bg-muted text-muted-foreground"
                            )}
                          >
                            <PaymentStatusIcon status={item.status} />
                            {statusConfig[item.status]?.label || item.status}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{statusConfig[item.status]?.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    {isTransferPayment && (
                      <TableCell>
                        <PaymentConfirmDialog
                          installment={item}
                          isTransfer={isTransferPayment}
                          onConfirm={handleConfirmPayment}
                          onUpdate={handleUpdatePaymentInfo}
                          readOnly={readOnly}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <AttachmentList
                        attachments={item.attachments}
                        onRemove={(attId) =>
                          handleRemoveAttachment(item.id, attId)
                        }
                        readOnly={readOnly}
                        isPaid={item.status === "pago"}
                        t={t}
                        language={language}
                      />
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.status === "pago" ? (
                            <span className="text-xs text-success flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {t("installment.paid")}
                            </span>
                          ) : (
                            <>
                              <AttachmentUploader
                                installmentId={item.id}
                                onUpload={handleUpload}
                                t={t}
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Rodapé de Totais */}
      <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          {t("installment.summaryByCompany")}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(totalsByCompany).map(([id, { name, amount }]) => (
            <div
              key={id}
              className="flex items-center justify-between p-3 rounded-lg bg-background border"
            >
              <span className="text-sm truncate mr-2">{name}</span>
              <span className="font-medium text-sm whitespace-nowrap">
                {formatCurrency(amount)}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t flex items-center justify-between">
          <span className="font-medium">{t("installment.grandTotal")}</span>
          <span
            className={cn(
              "text-lg font-bold",
              hasDivergence ? "text-destructive" : "text-foreground"
            )}
          >
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
