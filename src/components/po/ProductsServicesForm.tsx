import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
  AlertTriangle,
  Info,
  BrushCleaning,
  Paperclip,
  Upload,
  FileCheck,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CurrencyInput,
  type CurrencyInputLocale,
} from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SupplierFormDialog } from "@/components/suppliers/SupplierFormDialog";
import {
  ContractRequestDialog,
  type ContractRequestSupplierData,
} from "@/components/shared/ContractRequestDialog";
import { ContractSelectorDialog } from "@/components/po/ContractSelectorDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, getNextValidPaymentDate } from "@/lib/utils";

import {
  beneficiaries as beneficiariesMockData,
  currencies as currenciesMockData,
  expenseNatures as expenseNaturesMockData,
  suppliers as suppliersMockData,
  paymentMethods as paymentMethodsMockData,
  costCenters as costCentersMockData,
  glAccounts as glAccountsMockData,
  companies as companiesMockData,
  payerAccountingMatrix as payerAccountingMatrixMockData,
  users as usersMockData,
  costCenterApprovers as costCenterApproversMockData,
  supplierDocuments as supplierDocumentsMockData,
  contractRequests as contractRequestsMockData,
} from "@/data/mockdata";

// Schema de validação do formulário
const costCenterItemSchema = z.object({
  costCenterId: z.string().min(1, "Centro de custo obrigatório"),
  glAccountId: z.string().min(1, "Conta contábil obrigatória"),
  companyId: z.string().min(1, "Empresa obrigatória"),
  balance: z.number(),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  percentage: z.number(),
});

const formSchema = z.object({
  subtypeOfPO: z.string().min(1, "Subtipo de PO obrigatório"),
  beneficiaryId: z.string().min(1, "Beneficiário obrigatório"),
  currencyId: z.string().min(1, "Moeda obrigatória"),
  totalValue: z.number().min(0.01, "Valor total deve ser maior que zero"),
  hasGrossUp: z.boolean(),
  expenseNatureId: z.string().min(1, "Natureza obrigatória"),
  icApproved: z.boolean(),
  supplierId: z.string().min(1, "Fornecedor obrigatório"),
  paymentMethodId: z.string().min(1, "Forma de pagamento obrigatória"),
  // Campos de detalhes de pagamento - Nacional (validados condicionalmente com base no método de pagamento)
  bankName: z.string().optional(),
  bankAgency: z.string().optional(),
  bankAccount: z.string().optional(),
  boletoBarcode: z.string().optional(),
  boletoFile: z.any().optional(),
  // Campos de detalhes de pagamento - Internacional
  beneficiaryName: z.string().optional(),
  beneficiaryAddress: z.string().optional(),
  routingNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  bankNameInt: z.string().optional(),
  bankAddress: z.string().optional(),
  iban: z.string().optional(),
  swiftBic: z.string().optional(),
  intermediaryBank: z.string().optional(),
  contaOrdemReference: z.string().optional(),
  // Aprovadores
  functionalApproverId: z.string().min(1, "Aprovador funcional obrigatório"),
  seniorApproverId: z.string().optional(),
  // Outros campos
  costCenterItems: z
    .array(costCenterItemSchema)
    .min(1, "Adicione pelo menos um centro de custo"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
});

type FormData = z.infer<typeof formSchema>;

// Nomes de exibição dos métodos de pagamento

import type { POSubtype, PurchaseOrderExpanded } from "@/types/domain";
import { Alert, AlertDescription } from "../ui/alert";

type SupplierSearchMode = "taxId" | "name";

type ProductsServicesFormProps = {
  poInitialData?: PurchaseOrderExpanded | null;
};

const ProductsServicesForm = ({ poInitialData }: ProductsServicesFormProps) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  console.log("ProductsServicesForm - poInitialData:", poInitialData);

  // TODO: Estes dados virão de chamadas de API no futuro
  const beneficiaries = beneficiariesMockData;
  const currencies = currenciesMockData;
  const expenseNatures = expenseNaturesMockData;
  const suppliers = suppliersMockData;
  const paymentMethods = paymentMethodsMockData;
  const costCenters = costCentersMockData;
  const glAccounts = glAccountsMockData;
  const companies = companiesMockData;
  const payerAccountingMatrix = payerAccountingMatrixMockData;
  const users = usersMockData;
  const costCenterApprovers = costCenterApproversMockData;
  const supplierDocuments = supplierDocumentsMockData;
  const contractRequests = contractRequestsMockData;

  const paymentMethodNames: Record<string, string> = {
    TRANSFERENCIA: t("newPO.paymentMethodTypes.bankTransfer"),
    BOLETO: t("newPO.paymentMethodTypes.bankSlip"),
    TRANSFER_USA: "Wire Transfer (USA)",
    TRANSFER_NON_USA_SUPPLIER: "Wire Transfer (Internacional)",
    TRANSFER_CONTA_E_ORDEM: "Conta e Ordem",
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [subtype, setSubtype] = useState<POSubtype<"produtos_servicos">>(
    (poInitialData?.subtypeOfPO as POSubtype<"produtos_servicos">) || "produto",
  );
  const [supplierSearchMode, setSupplierSearchMode] =
    useState<SupplierSearchMode>("taxId");

  // Estados de seleção de contrato
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [contractAction, setContractAction] = useState<
    "select" | "request" | ""
  >("");
  const [showContractRequestDialog, setShowContractRequestDialog] =
    useState(false);
  const [showContractSelectorDialog, setShowContractSelectorDialog] =
    useState(false);
  const [contractRequestNotes, setContractRequestNotes] = useState("");
  const [hasLocalContractRequest, setHasLocalContractRequest] = useState(false);
  const [hasRequestedCancellation, setHasRequestedCancellation] =
    useState(false);
  const [hasCancelledPendingRequest, setHasCancelledPendingRequest] =
    useState(false);
  const contractRequestJustSubmittedRef = useRef(false);

  // Estados de aviso PortCo
  const [showPortCoWarning, setShowPortCoWarning] = useState(false);
  const [portCoAcknowledged, setPortCoAcknowledged] = useState(false);
  const [portCoDialogChecked, setPortCoDialogChecked] = useState(false);
  const [leadPartnerId, setLeadPartnerId] = useState("");
  const [portCoJustification, setPortCoJustification] = useState("");
  const pendingBeneficiaryRef = useRef<string>("");

  // Configurações: dias mínimos de antecedência para criar PO e valor mínimo para exigir aprovador senior
  // TODO: Estes valores virão de uma tabela de configurações no futuro
  const MIN_DAYS_ADVANCE = 10;
  const MIN_VALUE_FOR_SENIOR_APPROVER = 100000;

  // Estados do dia de pagamento
  const [paymentDay, setPaymentDay] = useState<string>(
    poInitialData?.paymentWindowDays?.toString() || "",
  );
  const [isOutsidePaymentWindow, setIsOutsidePaymentWindow] = useState(
    poInitialData?.isOutsidePaymentWindow || false,
  );
  const [customPaymentDay, setCustomPaymentDay] = useState(
    poInitialData?.paymentWindowDays?.toString() || "",
  );
  // Estado para rastrear se houve ajuste automático da data de pagamento
  const [paymentDayAdjustment, setPaymentDayAdjustment] = useState<{
    originalDay: string;
    newDay: string;
  } | null>(null);
  const [paymentJustification, setPaymentJustification] = useState(
    poInitialData?.outsidePaymentJustification || "",
  );

  // Estados da frequência de pagamento
  const [paymentFrequency, setPaymentFrequency] = useState<
    "unico" | "parcelado" | "recorrente" | ""
  >(poInitialData?.paymentTerms || "");
  const [installments, setInstallments] = useState<number>(
    poInitialData?.installmentCount || 1,
  );

  // Estado do diálogo de alterações não salvas
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<
    string | null
  >(null);

  // Estados para rastrear seções já alcançadas (para manter visibilidade)
  const [section2Reached, setSection2Reached] = useState(!!poInitialData);
  const [section3Reached, setSection3Reached] = useState(!!poInitialData);
  const [section4Reached, setSection4Reached] = useState(!!poInitialData);
  const [section5Reached, setSection5Reached] = useState(!!poInitialData);
  const [section6Reached, setSection6Reached] = useState(!!poInitialData);
  const [section7Reached, setSection7Reached] = useState(!!poInitialData);

  // Constrói valores padrão a partir de poInitialData
  const getDefaultValues = () => {
    console.log("getDefaultValues - poInitialData:", poInitialData);

    if (!poInitialData) {
      return {
        subtypeOfPO: "",
        beneficiaryId: "",
        currencyId: "cur-001",
        totalValue: 0,
        hasGrossUp: false,
        expenseNatureId: "",
        icApproved: false,
        supplierId: "",
        paymentMethodId: "",
        bankName: "",
        bankAgency: "",
        bankAccount: "",
        boletoBarcode: "",
        boletoFile: null,
        // Campos de transferência internacional
        beneficiaryName: "",
        beneficiaryAddress: "",
        routingNumber: "",
        accountNumber: "",
        bankNameInt: "",
        bankAddress: "",
        iban: "",
        swiftBic: "",
        intermediaryBank: "",
        contaOrdemReference: "",
        costCenterItems: [
          {
            costCenterId: "",
            glAccountId: "",
            companyId: "",
            balance: 0,
            amount: 0,
            percentage: 0,
          },
        ],
        description: "",
        functionalApproverId: "",
        seniorApproverId: "",
      };
    }

    // Extrair detalhes de pagamento
    const paymentDetails = poInitialData.payment?.details;
    let bankName = "";
    let bankAgency = "";
    let bankAccount = "";
    let boletoBarcode = "";
    let beneficiaryName = "";
    let beneficiaryAddress = "";
    let routingNumber = "";
    let accountNumber = "";
    let bankNameInt = "";
    let bankAddress = "";
    let iban = "";
    let swiftBic = "";
    let intermediaryBank = "";
    let contaOrdemReference = "";

    if (paymentDetails) {
      if (paymentDetails.methodCode === "TRANSFERENCIA") {
        bankName = paymentDetails.bank || "";
        bankAgency = paymentDetails.agency || "";
        bankAccount = paymentDetails.accountNumber || "";
      } else if (paymentDetails.methodCode === "BOLETO") {
        boletoBarcode = paymentDetails.barcode || "";
      } else if (
        paymentDetails.methodCode === "TRANSFER_USA" ||
        paymentDetails.methodCode === "TRANSFER_NON_USA_SUPPLIER" ||
        paymentDetails.methodCode === "TRANSFER_CONTA_E_ORDEM"
      ) {
        beneficiaryName = paymentDetails.finalBeneficiaryName || "";
        accountNumber = paymentDetails.finalAccountNumber || "";
        intermediaryBank = paymentDetails.intermediaryBeneficiaryName || "";
      }
    }

    // Mapear alocações para itens de centro de custo
    const costCenterItems = poInitialData.allocations?.length
      ? poInitialData.allocations.map((alloc) => ({
          costCenterId: alloc.costCenterId,
          glAccountId: alloc.glAccountId,
          companyId: alloc.payerCompanyId,
          balance: alloc.availableBalanceSnapshot,
          amount: alloc.allocationAmount,
          percentage: alloc.allocationPercentage,
        }))
      : [
          {
            costCenterId: "",
            glAccountId: "",
            companyId: "",
            balance: 0,
            amount: 0,
            percentage: 0,
          },
        ];
    return {
      subtypeOfPO: poInitialData.subtypeOfPO || "",
      beneficiaryId: poInitialData.beneficiary?.id || "",
      currencyId: poInitialData.currency?.id || "cur-001",
      totalValue: poInitialData.totalValue || 0,
      hasGrossUp: poInitialData.hasGrossUp || false,
      expenseNatureId: poInitialData.expenseNature?.id || "",
      icApproved: poInitialData.isIcApproved || false,
      supplierId: poInitialData.supplier?.id || "",
      paymentMethodId: poInitialData.payment?.paymentMethodId || "",
      bankName,
      bankAgency,
      bankAccount,
      boletoBarcode,
      boletoFile: null,
      beneficiaryName,
      beneficiaryAddress,
      routingNumber,
      accountNumber,
      bankNameInt,
      bankAddress,
      iban,
      swiftBic,
      intermediaryBank,
      contaOrdemReference,
      costCenterItems,
      description: poInitialData.notes || "",
      functionalApproverId: "",
      seniorApproverId: "",
    };
  };

  console.log("Default values:", getDefaultValues());

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  // Atualizar estados quando poInitialData mudar (para casos de cópia de PO)
  useEffect(() => {
    if (poInitialData) {
      // Atualizar subtype
      if (poInitialData.subtypeOfPO) {
        setSubtype(poInitialData.subtypeOfPO as POSubtype<"produtos_servicos">);
      }

      // Atualizar estados de pagamento
      if (poInitialData.paymentWindowDays !== undefined) {
        setPaymentDay(poInitialData.paymentWindowDays.toString());
        setCustomPaymentDay(poInitialData.paymentWindowDays.toString());
      }

      if (poInitialData.isOutsidePaymentWindow !== undefined) {
        setIsOutsidePaymentWindow(poInitialData.isOutsidePaymentWindow);
      }

      if (poInitialData.outsidePaymentJustification) {
        setPaymentJustification(poInitialData.outsidePaymentJustification);
      }

      // Atualizar frequência de pagamento
      if (poInitialData.paymentTerms) {
        setPaymentFrequency(poInitialData.paymentTerms);
      }

      if (poInitialData.installmentCount) {
        setInstallments(poInitialData.installmentCount);
      }

      // Resetar o formulário com os novos valores
      form.reset(getDefaultValues());
    }
  }, [poInitialData]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "costCenterItems",
  });

  const watchTotalValue = form.watch("totalValue");
  const watchCostCenterItems = form.watch("costCenterItems");
  const watchSupplierId = form.watch("supplierId");
  const watchCurrencyId = form.watch("currencyId");
  const watchPaymentMethodId = form.watch("paymentMethodId");
  const watchBeneficiaryId = form.watch("beneficiaryId");
  const watchExpenseNatureId = form.watch("expenseNatureId");
  const watchDescription = form.watch("description");
  const watchBankName = form.watch("bankName");
  const watchBankAgency = form.watch("bankAgency");
  const watchBankAccount = form.watch("bankAccount");
  const watchBeneficiaryName = form.watch("beneficiaryName");
  const watchAccountNumber = form.watch("accountNumber");

  // Calcular totais de alocação e validação
  // Usa JSON.stringify para detectar mudanças profundas no array de itens
  const allocationTotal = useMemo(() => {
    return watchCostCenterItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchCostCenterItems)]);

  const allocationExceedsTotal = useMemo(() => {
    return allocationTotal > watchTotalValue && watchTotalValue > 0;
  }, [allocationTotal, watchTotalValue]);

  // Determinar se a moeda é BRL
  const isBRL = useMemo(() => {
    const selectedCurrency = currencies.find((c) => c.id === watchCurrencyId);
    return selectedCurrency?.code === "BRL";
  }, [watchCurrencyId]);

  // Filtrar métodos de pagamento com base na moeda
  const filteredPaymentMethods = useMemo(() => {
    if (isBRL) {
      return paymentMethods.filter(
        (pm) => pm.code === "TRANSFERENCIA" || pm.code === "BOLETO",
      );
    } else {
      return paymentMethods.filter(
        (pm) =>
          pm.code === "TRANSFER_USA" ||
          pm.code === "TRANSFER_NON_USA_SUPPLIER" ||
          pm.code === "TRANSFER_CONTA_E_ORDEM",
      );
    }
  }, [isBRL]);

  // Obter código do método de pagamento selecionado
  const selectedPaymentMethodCode = useMemo(() => {
    const pm = paymentMethods.find((p) => p.id === watchPaymentMethodId);
    return pm?.code || null;
  }, [watchPaymentMethodId]);

  // Resetar método de pagamento quando a moeda muda
  useEffect(() => {
    const currentPM = paymentMethods.find((p) => p.id === watchPaymentMethodId);
    if (currentPM) {
      const isCurrentPMValid = filteredPaymentMethods.some(
        (pm) => pm.id === currentPM.id,
      );
      if (!isCurrentPMValid) {
        form.setValue("paymentMethodId", "");
        // Também limpar detalhes de pagamento
        form.setValue("bankName", "");
        form.setValue("bankAgency", "");
        form.setValue("bankAccount", "");
        form.setValue("boletoBarcode", "");
        form.setValue("boletoFile", null);
      }
    }
  }, [filteredPaymentMethods, watchPaymentMethodId, form]);

  // Obter detalhes do fornecedor selecionado
  const selectedSupplier = useMemo(() => {
    return suppliers.find((s) => s.id === watchSupplierId);
  }, [watchSupplierId]);

  // Verificar se contrato é obrigatório (fornecedor exige contrato + subtipo é serviço)
  const requiresContractSelection = useMemo(() => {
    if (!selectedSupplier) return false;
    return selectedSupplier.requiresContract && subtype === "servico";
  }, [selectedSupplier, subtype]);

  // Obter TODOS os contratos do fornecedor (válidos e vencidos)
  const supplierAllContracts = useMemo(() => {
    if (!watchSupplierId) return [];
    return supplierDocuments.filter(
      (doc) =>
        doc.supplierId === watchSupplierId &&
        doc.categoryCode === "contract" &&
        doc.isActive &&
        doc.validUntil,
    );
  }, [watchSupplierId]);

  // Obter contratos válidos do fornecedor selecionado
  const supplierValidContracts = useMemo(() => {
    const now = new Date();
    return supplierAllContracts.filter(
      (doc) => new Date(doc.validUntil!) > now,
    );
  }, [supplierAllContracts]);

  // Verificar se já existe uma solicitação de contrato pendente para este fornecedor
  const hasPendingContractRequest = useMemo(() => {
    if (!watchSupplierId) return false;
    return contractRequests.some(
      (req) =>
        req.supplierId === watchSupplierId &&
        (req.status === "pendente" || req.status === "em_confeccao"),
    );
  }, [watchSupplierId]);
  const effectiveHasPendingContractRequest =
    hasPendingContractRequest && !hasCancelledPendingRequest;
  const hasStartPendingContractRequest = useMemo(() => {
    if (!watchSupplierId) return false;
    return contractRequests.some(
      (req) => req.supplierId === watchSupplierId && req.status === "pendente",
    );
  }, [watchSupplierId]);
  const hasPendingOrLocalContractRequest =
    effectiveHasPendingContractRequest || hasLocalContractRequest;
  const hasStartPendingOrLocalContractRequest =
    (hasStartPendingContractRequest && !hasCancelledPendingRequest) ||
    hasLocalContractRequest;

  // Resetar seleção de contrato quando fornecedor muda
  useEffect(() => {
    setSelectedContractId("");
    setContractAction("");
    setHasLocalContractRequest(false);
    setHasRequestedCancellation(false);
    setHasCancelledPendingRequest(false);
    contractRequestJustSubmittedRef.current = false;
  }, [watchSupplierId]);

  const handleRequestCancelContract = () => {
    if (hasRequestedCancellation) return;
    setHasRequestedCancellation(true);
    setHasCancelledPendingRequest(true);
    setHasLocalContractRequest(false);
    setContractAction("");
    toast.success(t("newPO.contractRequestCancelled"), {
      description: t("newPO.contractRequestCancelledDescription"),
    });
    setHasRequestedCancellation(false);
  };

  // Data de abertura fixa (no mount) para tornar a regra determinística
  const openedAtRef = useRef<Date>(new Date());

  // Calcular data de pagamento resolvida considerando a janela e antecedência mínima
  const paymentDateInfo = useMemo(() => {
    if (!paymentDay || isOutsidePaymentWindow) return null;

    const openDate = openedAtRef.current;

    // Determinar tipo de janela baseado na moeda
    const domesticWindows = [5, 15, 25];
    const intlWindows = [10, 20, "ultimo"];
    const windows = isBRL ? domesticWindows : intlWindows;

    // Normalizar valor selecionado
    const selectedDay =
      paymentDay === "ultimo" ? "ultimo" : parseInt(paymentDay, 10);
    if (selectedDay !== "ultimo" && Number.isNaN(selectedDay)) return null;
    if (!windows.includes(selectedDay as any)) return null;

    const resolved = getNextValidPaymentDate({
      openDate,
      selectedDay: selectedDay as any,
      minDaysAdvance: MIN_DAYS_ADVANCE,
      isOutsidePaymentWindow,
      isBRL,
    });

    const isNextMonth =
      resolved.date.getMonth() !== openDate.getMonth() ||
      resolved.date.getFullYear() !== openDate.getFullYear();

    const daysUntil = Math.floor(
      (resolved.date.getTime() - openDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    return { isNextMonth, paymentDate: resolved.date, daysUntil };
  }, [paymentDay, MIN_DAYS_ADVANCE, isOutsidePaymentWindow, isBRL]);

  // Calcular aprovadores necessários baseado nos centros de custo do rateio
  const requiredApprovers = useMemo(() => {
    if (watchCostCenterItems.length === 0) return { funcional: [], senior: [] };

    // Coletar todos os centros de custo únicos do rateio
    const uniqueCostCenterIds = Array.from(
      new Set(
        watchCostCenterItems
          .map((item) => item.costCenterId)
          .filter((id) => id !== ""),
      ),
    );

    // Coletar aprovadores únicos para esses centros de custo
    const functionalApprovers = new Map<string, any>();
    const seniorApprovers = new Map<string, any>();

    uniqueCostCenterIds.forEach((costCenterId) => {
      const approversForCC = costCenterApprovers.filter(
        (approver) =>
          approver.costCenterId === costCenterId && approver.isActive,
      );

      approversForCC.forEach((approver) => {
        const approverUser = users.find((u) => u.id === approver.approverId);
        if (!approverUser) return;

        const approverInfo = {
          userId: approver.approverId,
          name: approverUser.name,
          email: approverUser.email,
          function: approverUser.function,
          level: approver.level as "funcional" | "senior",
        };

        if (approver.level === "funcional") {
          functionalApprovers.set(approver.approverId, approverInfo);
        } else if (approver.level === "senior") {
          seniorApprovers.set(approver.approverId, approverInfo);
        }
      });
    });

    // Verificar se aprovador senior é obrigatório
    const isSeniorRequired = watchTotalValue > MIN_VALUE_FOR_SENIOR_APPROVER;

    return {
      funcional: Array.from(functionalApprovers.values()),
      senior: Array.from(seniorApprovers.values()),
      isSeniorRequired,
    };
  }, [
    watchCostCenterItems,
    watchTotalValue,
    MIN_VALUE_FOR_SENIOR_APPROVER,
    costCenterApprovers,
    users,
  ]);

  // Validador: Seção 1 - Dados Básicos (Beneficiário, Moeda, Valor)
  const isSection1Valid = useMemo(() => {
    return (
      watchBeneficiaryId !== "" &&
      watchCurrencyId !== "" &&
      watchTotalValue > 0 &&
      watchExpenseNatureId !== ""
    );
  }, [
    watchBeneficiaryId,
    watchCurrencyId,
    watchTotalValue,
    watchExpenseNatureId,
  ]);

  // Verificar se seção 1 está completamente vazia (para ocultar seções seguintes)
  const isSection1Empty = useMemo(() => {
    return watchBeneficiaryId === "" && watchTotalValue === 0;
  }, [watchBeneficiaryId, watchTotalValue]);

  // Verificar se seção 2 (Alocação) está completamente vazia
  const isSection2Empty = useMemo(() => {
    return watchExpenseNatureId === "" && allocationTotal === 0;
  }, [watchExpenseNatureId, allocationTotal]);

  // Verificar se seção 3 (Fornecedor) está completamente vazia
  const isSection3Empty = useMemo(() => {
    return watchSupplierId === "";
  }, [watchSupplierId]);

  // Verificar se seção 4 (Forma de Pagamento) está completamente vazia
  const isSection4Empty = useMemo(() => {
    return watchPaymentMethodId === "";
  }, [watchPaymentMethodId]);

  // Verificar se seção 5 (Dia de Pagamento) está completamente vazia
  const isSection5Empty = useMemo(() => {
    return paymentDay === "" && !isOutsidePaymentWindow;
  }, [paymentDay, isOutsidePaymentWindow]);

  // Verificar se seção 6 (Frequência) está completamente vazia
  const isSection6Empty = useMemo(() => {
    return paymentFrequency === "";
  }, [paymentFrequency]);

  // Validador: Seção 2 - Dados Complementares (Natureza Despesa + Alocação)
  const isSection2Valid = useMemo(() => {
    if (!isSection1Valid) return false;
    return (
      watchExpenseNatureId !== "" &&
      allocationTotal === watchTotalValue &&
      watchTotalValue > 0
    );
  }, [isSection1Valid, watchExpenseNatureId, allocationTotal, watchTotalValue]);

  // Validador: Seção 3 - Fornecedor (inclui validação de contrato quando necessário)
  const isSection3Valid = useMemo(() => {
    if (!isSection2Valid) return false;
    if (watchSupplierId === "") return false;

    // Se contrato é obrigatório, verificar se há contrato selecionado ou solicitação criada
    if (requiresContractSelection) {
      // Válido se: tem contrato selecionado OU escolheu solicitar contrato
      if (contractAction === "select" && selectedContractId) return true;
      if (contractAction === "request") return true;
      return false;
    }

    return true;
  }, [
    isSection2Valid,
    watchSupplierId,
    requiresContractSelection,
    contractAction,
    selectedContractId,
  ]);

  // Validador: Seção 4 - Forma de Pagamento (apenas método)
  const isSection4Valid = useMemo(() => {
    if (!isSection3Valid) return false;
    return watchPaymentMethodId !== "";
  }, [isSection3Valid, watchPaymentMethodId]);

  // Validador: Seção 5 - Dia de Pagamento
  const isSection5Valid = useMemo(() => {
    if (!isSection4Valid) return false;

    // Validar dia de pagamento
    const paymentDayValid = isOutsidePaymentWindow
      ? customPaymentDay.trim() !== "" && paymentJustification.trim() !== ""
      : paymentDay !== "";

    return paymentDayValid;
  }, [
    isSection4Valid,
    paymentDay,
    isOutsidePaymentWindow,
    customPaymentDay,
    paymentJustification,
  ]);

  // Validador: Seção 6 - Frequência de Pagamento
  const isSection6Valid = useMemo(() => {
    if (!isSection5Valid) return false;

    if (!paymentFrequency) return false;
    if (paymentFrequency === "parcelado" && installments < 2) return false;

    return true;
  }, [isSection5Valid, paymentFrequency, installments]);

  // Atualizar estados de seções alcançadas quando seção se torna válida
  useEffect(() => {
    if (isSection1Valid && !section2Reached) setSection2Reached(true);
  }, [isSection1Valid, section2Reached]);

  useEffect(() => {
    if (isSection2Valid && !section3Reached) setSection3Reached(true);
  }, [isSection2Valid, section3Reached]);

  useEffect(() => {
    if (isSection3Valid && !section4Reached) setSection4Reached(true);
  }, [isSection3Valid, section4Reached]);

  useEffect(() => {
    if (isSection4Valid && !section5Reached) setSection5Reached(true);
  }, [isSection4Valid, section5Reached]);

  useEffect(() => {
    if (isSection5Valid && !section6Reached) setSection6Reached(true);
  }, [isSection5Valid, section6Reached]);

  useEffect(() => {
    if (isSection6Valid && !section7Reached) setSection7Reached(true);
  }, [isSection6Valid, section7Reached]);

  // Resetar seções alcançadas quando seção anterior é completamente limpa
  useEffect(() => {
    if (isSection1Empty) {
      setSection2Reached(false);
      setSection3Reached(false);
      setSection4Reached(false);
      setSection5Reached(false);
      setSection6Reached(false);
      setSection7Reached(false);
    }
  }, [isSection1Empty]);

  useEffect(() => {
    if (isSection2Empty && !isSection1Empty) {
      setSection3Reached(false);
      setSection4Reached(false);
      setSection5Reached(false);
      setSection6Reached(false);
      setSection7Reached(false);
    }
  }, [isSection2Empty, isSection1Empty]);

  useEffect(() => {
    if (isSection3Empty && !isSection2Empty) {
      setSection4Reached(false);
      setSection5Reached(false);
      setSection6Reached(false);
      setSection7Reached(false);
    }
  }, [isSection3Empty, isSection2Empty]);

  useEffect(() => {
    if (isSection4Empty && !isSection3Empty) {
      setSection5Reached(false);
      setSection6Reached(false);
      setSection7Reached(false);
    }
  }, [isSection4Empty, isSection3Empty]);

  useEffect(() => {
    if (isSection5Empty && !isSection4Empty) {
      setSection6Reached(false);
      setSection7Reached(false);
    }
  }, [isSection5Empty, isSection4Empty]);

  useEffect(() => {
    if (isSection6Empty && !isSection5Empty) {
      setSection7Reached(false);
    }
  }, [isSection6Empty, isSection5Empty]);

  // Determinar visibilidade das seções (válida OU já alcançada e não completamente limpa)
  const showSection2 = isSection1Valid || (section2Reached && !isSection1Empty);
  const showSection3 = isSection2Valid || (section3Reached && !isSection2Empty);
  const showSection4 = isSection3Valid || (section4Reached && !isSection3Empty);
  const showSection5 = isSection4Valid || (section5Reached && !isSection4Empty);
  const showSection6 = isSection5Valid || (section6Reached && !isSection5Empty);
  const showSection7 = isSection6Valid || (section7Reached && !isSection6Empty);

  // Verificar se fornecedor precisa de alerta de verificação (apenas para POs de serviço)
  const showSupplierWarning = useMemo(() => {
    if (subtype !== "servico") return false;
    if (!selectedSupplier) return false;
    return !selectedSupplier.isApproved;
  }, [selectedSupplier, subtype]);

  // Exibir toast quando fornecedor sem homologação é selecionado para PO de serviço
  useEffect(() => {
    if (showSupplierWarning && selectedSupplier) {
      toast.warning(t("newPO.supplierNotApprovedWarning"), {
        description: t("newPO.supplierNotApprovedDescription"),
        duration: 6000,
      });
    }
  }, [showSupplierWarning, selectedSupplier, t]);

  // Função para obter empresa da matriz contábil
  const getCompanyFromMatrix = (
    costCenterId: string,
    glAccountId: string,
  ): string => {
    if (!costCenterId || !glAccountId) return "";

    const matrixEntry = payerAccountingMatrix.find(
      (m) =>
        m.costCenterId === costCenterId &&
        m.glAccountId === glAccountId &&
        m.isNationalPayment === isBRL &&
        m.isActive,
    );

    return matrixEntry?.companyId || "";
  };

  // Atualizar automaticamente empresa quando CC, GL ou moeda muda
  useEffect(() => {
    watchCostCenterItems.forEach((item, index) => {
      const newCompanyId = getCompanyFromMatrix(
        item.costCenterId,
        item.glAccountId,
      );
      if (newCompanyId !== item.companyId) {
        form.setValue(`costCenterItems.${index}.companyId`, newCompanyId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchCostCenterItems, isBRL, form]);

  // Manipular mudança de centro de custo - seleção automática de empresa
  const handleCostCenterChange = (index: number, value: string) => {
    form.setValue(`costCenterItems.${index}.costCenterId`, value);
    const glAccountId = watchCostCenterItems[index]?.glAccountId || "";
    const newCompanyId = getCompanyFromMatrix(value, glAccountId);
    form.setValue(
      `costCenterItems.${index}.balance`,
      getBalanceCompany(value, glAccountId),
    ); // Resetar saldo
    form.setValue(`costCenterItems.${index}.companyId`, newCompanyId);
  };

  // Manipular mudança de conta contábil - seleção automática de empresa
  const handleGLAccountChange = (index: number, value: string) => {
    form.setValue(`costCenterItems.${index}.glAccountId`, value);
    const costCenterId = watchCostCenterItems[index]?.costCenterId || "";
    const newCompanyId = getCompanyFromMatrix(costCenterId, value);
    form.setValue(
      `costCenterItems.${index}.balance`,
      getBalanceCompany(costCenterId, value),
    ); // Resetar saldo
    form.setValue(`costCenterItems.${index}.companyId`, newCompanyId);
  };

  // Manipular mudança de valor com validação de saldo
  const handleAmountChange = (index: number, value: number) => {
    const balance = watchCostCenterItems[index]?.balance || 0;

    if (value > balance) {
      toast.error(t("newPO.amountExceedsBalance"), {
        description: t("newPO.amountExceedsBalanceDescription"),
      });
    }

    form.setValue(`costCenterItems.${index}.amount`, value);
    setTimeout(updatePercentages, 0);
  };

  // Manipular mudança de modo de busca de fornecedor
  const handleSearchModeChange = (mode: SupplierSearchMode) => {
    setSupplierSearchMode(mode);
    form.setValue("supplierId", ""); // Resetar fornecedor ao mudar modo
  };

  // Calcular se o formulário é válido para envio
  const canSubmit = useMemo(() => {
    // Validar subtipo de PO
    if (!subtype) return false;

    // Validar beneficiário
    if (!watchBeneficiaryId) return false;

    // Validar moeda
    if (!watchCurrencyId) return false;

    // Validar natureza de despesa
    if (!watchExpenseNatureId) return false;

    // Validar fornecedor
    if (!watchSupplierId) return false;

    // Validar forma de pagamento
    if (!watchPaymentMethodId) return false;

    // Validar descrição (mínimo 10 caracteres)
    if (!watchDescription?.trim() || watchDescription.trim().length < 10)
      return false;

    // Validar totais de alocação
    const allocationValid =
      allocationTotal === watchTotalValue && watchTotalValue > 0;
    if (!allocationValid) return false;

    // Verifica se algum valor excede o saldo
    const hasBalanceIssue = watchCostCenterItems.some(
      (item) => item.amount > item.balance,
    );
    if (hasBalanceIssue) return false;

    if (allocationExceedsTotal) return false;

    // Bloquear envio se PO de serviço com fornecedor não homologado
    if (showSupplierWarning) return false;

    // Validar dia de pagamento - deve ter dia padrão ou pagamento personalizado com justificativa
    const paymentDayValid = isOutsidePaymentWindow
      ? customPaymentDay.trim() !== "" && paymentJustification.trim() !== ""
      : paymentDay !== "";
    if (!paymentDayValid) return false;

    // Validar frequência de pagamento
    if (!paymentFrequency) return false;

    // Validar parcelas para pagamento parcelado
    if (paymentFrequency === "parcelado" && installments < 2) return false;

    // Validar campos específicos do método de pagamento
    if (selectedPaymentMethodCode === "TRANSFERENCIA") {
      const bankFieldsValid =
        watchBankName?.trim() !== "" &&
        watchBankAgency?.trim() !== "" &&
        watchBankAccount?.trim() !== "";
      if (!bankFieldsValid) return false;
    }

    if (
      selectedPaymentMethodCode === "TRANSFER_USA" ||
      selectedPaymentMethodCode === "TRANSFER_NON_USA_SUPPLIER" ||
      selectedPaymentMethodCode === "TRANSFER_CONTA_E_ORDEM"
    ) {
      const intlFieldsValid =
        watchBeneficiaryName?.trim() !== "" &&
        watchAccountNumber?.trim() !== "";
      if (!intlFieldsValid) return false;
    }

    // Validar que todos os itens de centro de custo têm campos obrigatórios preenchidos
    const allCostCenterItemsValid = watchCostCenterItems.every(
      (item) =>
        item.costCenterId &&
        item.glAccountId &&
        item.companyId &&
        item.amount > 0,
    );
    if (!allCostCenterItemsValid) return false;

    // Validar aprovador funcional
    const functionalApproverId = form.getValues("functionalApproverId");
    if (!functionalApproverId && requiredApprovers.funcional.length > 0)
      return false;

    // Validar aprovador sênior (apenas se obrigatório)
    if (requiredApprovers.isSeniorRequired) {
      const seniorApproverId = form.getValues("seniorApproverId");
      if (!seniorApproverId && requiredApprovers.senior.length > 0)
        return false;
    }

    return true;
  }, [
    subtype,
    watchBeneficiaryId,
    watchCurrencyId,
    watchExpenseNatureId,
    watchSupplierId,
    watchPaymentMethodId,
    watchDescription,
    watchCostCenterItems,
    watchTotalValue,
    showSupplierWarning,
    allocationExceedsTotal,
    allocationTotal,
    isOutsidePaymentWindow,
    customPaymentDay,
    paymentJustification,
    paymentDay,
    paymentFrequency,
    installments,
    selectedPaymentMethodCode,
    watchBankName,
    watchBankAgency,
    watchBankAccount,
    watchBeneficiaryName,
    watchAccountNumber,
    requiredApprovers,
    form,
  ]);

  // Atualizar porcentagens quando valores mudam
  const updatePercentages = () => {
    const items = form.getValues("costCenterItems");
    const total = form.getValues("totalValue");

    if (total > 0) {
      items.forEach((item, index) => {
        const percentage = (item.amount / total) * 100;
        form.setValue(
          `costCenterItems.${index}.percentage`,
          Number(percentage.toFixed(2)),
        );
      });
    }
  };

  // Obter contas contábeis filtradas com base no centro de custo selecionado
  // Exclui combinações já selecionadas em outras linhas, mas permite se houver outras contas disponíveis
  const getFilteredGLAccounts = (
    costCenterId: string,
    currentIndex: number,
  ) => {
    if (!costCenterId) {
      return glAccounts.filter((acc) => acc.isActive);
    }

    // Obter contas contábeis que têm entradas na matriz com este centro de custo
    const linkedGLAccountIds = payerAccountingMatrix
      .filter((m) => m.costCenterId === costCenterId && m.isActive)
      .map((m) => m.glAccountId);

    const availableAccounts = glAccounts.filter(
      (acc) => acc.isActive && linkedGLAccountIds.includes(acc.id),
    );

    // Obter combinações já selecionadas em outras linhas (exceto a linha atual)
    const usedCombinations = watchCostCenterItems
      .filter(
        (item, idx) =>
          idx !== currentIndex &&
          item.costCenterId === costCenterId &&
          item.glAccountId !== "",
      )
      .map((item) => item.glAccountId);

    // Filtrar contas já usadas com este centro de custo
    return availableAccounts.filter(
      (acc) => !usedCombinations.includes(acc.id),
    );
  };

  // Obter centros de custo filtrados com base na conta contábil selecionada
  // Exclui combinações já selecionadas em outras linhas, mas permite se houver outros centros disponíveis
  const getFilteredCostCenters = (
    glAccountId: string,
    currentIndex: number,
  ) => {
    if (!glAccountId) {
      // Se não há conta contábil selecionada, mostrar todos os centros de custo
      // que ainda têm pelo menos uma combinação disponível
      const usedCombinations = watchCostCenterItems
        .filter(
          (item, idx) =>
            idx !== currentIndex &&
            item.costCenterId !== "" &&
            item.glAccountId !== "",
        )
        .map((item) => `${item.costCenterId}-${item.glAccountId}`);

      return costCenters.filter((cc) => {
        if (!cc.isActive) return false;

        // Verificar se este centro de custo tem pelo menos uma conta contábil disponível
        const linkedGLAccountIds = payerAccountingMatrix
          .filter((m) => m.costCenterId === cc.id && m.isActive)
          .map((m) => m.glAccountId);

        // Contar quantas combinações ainda estão disponíveis
        const availableCombinations = linkedGLAccountIds.filter(
          (glId) => !usedCombinations.includes(`${cc.id}-${glId}`),
        );

        return availableCombinations.length > 0;
      });
    }

    // Obter centros de custo que têm entradas na matriz com esta conta contábil
    const linkedCostCenterIds = payerAccountingMatrix
      .filter((m) => m.glAccountId === glAccountId && m.isActive)
      .map((m) => m.costCenterId);

    const availableCostCenters = costCenters.filter(
      (cc) => cc.isActive && linkedCostCenterIds.includes(cc.id),
    );

    // Obter combinações já selecionadas em outras linhas (exceto a linha atual)
    const usedCombinations = watchCostCenterItems
      .filter(
        (item, idx) =>
          idx !== currentIndex &&
          item.glAccountId === glAccountId &&
          item.costCenterId !== "",
      )
      .map((item) => item.costCenterId);

    // Filtrar centros de custo já usados com esta conta contábil
    return availableCostCenters.filter(
      (cc) => !usedCombinations.includes(cc.id),
    );
  };

  const getBalanceCompany = (costCenterId: string, glAccountId: string) => {
    if (!costCenterId || !glAccountId) return 0;
    return (
      payerAccountingMatrix.filter(
        (balance) =>
          balance.costCenterId === costCenterId &&
          balance.glAccountId === glAccountId,
      )[0]?.balance || 0
    );
  };

  const handleAddCostCenter = () => {
    append({
      costCenterId: "",
      glAccountId: "",
      companyId: "",
      balance: 0,
      amount: 0,
      percentage: 0,
    });
  };

  // Verificar se o formulário foi modificado
  const isFormDirty = form.formState.isDirty;

  // Evento beforeunload do navegador para avisar sobre alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFormDirty]);

  const handleConfirmLeave = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigationPath) {
      navigate(pendingNavigationPath);
    }
    setPendingNavigationPath(null);
  };

  const handleCancelLeave = () => {
    setShowUnsavedDialog(false);
    setPendingNavigationPath(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("PO salva como rascunho");
    navigate("/pos");
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("PO enviada para aprovação");
    navigate("/pos");
  };

  const handleCancel = () => {
    if (isFormDirty) {
      setShowUnsavedDialog(true);
      setPendingNavigationPath("/pos");
    } else {
      navigate("/pos");
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Seleção de Subtipo de PO */}
          <Card>
            <CardHeader>
              <CardTitle>{t("newPO.poSubtype")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>
                    {t("newPO.selectSubtype")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={subtype}
                    onValueChange={(value) =>
                      setSubtype(value as POSubtype<"produtos_servicos">)
                    }
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder={t("newPO.selectSubtype")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produto">
                        {t("newPO.subtypeProduct")}
                      </SelectItem>
                      <SelectItem value="servico">
                        {t("newPO.subtypeService")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Principal do Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>{t("newPO.poData")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Linha 1: Beneficiário, Moeda, Valor Total */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="beneficiaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("newPO.beneficiary")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const selectedBen = beneficiaries.find(
                            (b) => b.id === value,
                          );
                          if (selectedBen?.name === "PORTCO") {
                            pendingBeneficiaryRef.current = value;
                            setShowPortCoWarning(true);
                            setPortCoDialogChecked(false);
                          } else {
                            field.onChange(value);
                            setPortCoAcknowledged(false);
                            setLeadPartnerId("");
                            setPortCoJustification("");
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("newPO.selectBeneficiary")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {beneficiaries.map((ben) => (
                            <SelectItem key={ben.id} value={ben.id}>
                              {ben.name === "FUNDO_GP" ? "Fundo/GP" : "PortCo"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campos de Lead Partner e Justificativa PortCo */}
                {portCoAcknowledged && (
                  <div className="col-span-full">
                    <div className="mt-4 p-4 border-2 border-amber-500 bg-orange-300/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <span className="font-semibold  border-amber-500">
                          {t("newPOPortCo.specialApproval")}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground font-medium">
                            {t("newPOPortCo.leadPartnerApproval")}
                          </Label>
                          <Select
                            value={leadPartnerId}
                            onValueChange={setLeadPartnerId}
                          >
                            <SelectTrigger className="border-amber-500 focus:ring-amber-500">
                              <SelectValue placeholder="Selecione o Lead Partner" />
                            </SelectTrigger>
                            <SelectContent>
                              {users
                                .filter(
                                  (u) =>
                                    u.function === "Diretora Financeira" ||
                                    u.function === "CFO" ||
                                    u.function === "Gerente",
                                )
                                .map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name} - {user.function}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <div className="space-y-2">
                            <Label className="text-foreground font-medium w-full">
                              {t("newPOPortCo.justification")}
                            </Label>
                            <Textarea
                              value={portCoJustification}
                              onChange={(e) =>
                                setPortCoJustification(e.target.value)
                              }
                              placeholder={t(
                                "newPOPortCo.justificationPlaceholder",
                              )}
                              className="border-amber-500 focus:ring-amber-500 min-h-20"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="currencyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("newPO.currency")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("newPO.selectCurrency")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((curr) => (
                            <SelectItem key={curr.id} value={curr.id}>
                              {curr.prefix} - {curr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalValue"
                  render={({ field }) => {
                    // Mapeia o idioma do contexto para o locale do CurrencyInput
                    const currencyLocale: CurrencyInputLocale =
                      language === "pt" ? "pt-BR" : "en-US";
                    return (
                      <FormItem>
                        <FormLabel>
                          {t("newPO.totalValue")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl className="w-full">
                          <CurrencyInput
                            value={field.value}
                            locale={currencyLocale}
                            onChange={(value) => {
                              field.onChange(value);
                              setTimeout(updatePercentages, 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* Linha 2: Natureza de Despesa, IC Aprovado, Gross Up */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expenseNatureId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("newPO.expenseNature")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("newPO.selectExpenseNature")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseNatures.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.name === "deal_expense"
                                ? "Deal Expense"
                                : "Ongoing"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icApproved"
                  render={({ field }) => {
                    const selectedExpenseNature = expenseNatures.find(
                      (en) => en.id === watchExpenseNatureId,
                    );
                    return (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            disabled={
                              selectedExpenseNature?.name !== "deal_expense"
                            }
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {t("newPO.icApproved")}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="hasGrossUp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          disabled={subtype !== "servico"}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {t("newPO.hasGrossUp")}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {showSection2 && (
                <>
                  <Separator />
                  {/* Tabela de Centros de Custo - Seção 2 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        {t("newPO.allocation")}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCostCenter}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("common.add")}
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table className="table-fixed">
                        <TableHeader className="bg-accent">
                          <TableRow>
                            <TableHead className="w-45">
                              {t("newPO.costCenter")}{" "}
                              <span className="text-destructive">*</span>
                            </TableHead>
                            <TableHead className="w-45">
                              {t("newPO.accountCode")}{" "}
                              <span className="text-destructive">*</span>
                            </TableHead>
                            <TableHead className="w-45">
                              {t("newPO.company")}{" "}
                              <span className="text-destructive">*</span>
                            </TableHead>
                            <TableHead className="text-right w-25">
                              {t("newPO.balance")}
                            </TableHead>
                            <TableHead className="text-right w-25">
                              {t("newPO.amount")}{" "}
                              <span className="text-destructive">*</span>
                            </TableHead>
                            <TableHead className="text-right w-25">%</TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.map((field, index) => {
                            const currentItem = watchCostCenterItems[index];
                            const selectedCompany = companies.find(
                              (c) => c.id === currentItem?.companyId,
                            );
                            const hasBalanceIssue =
                              (currentItem?.amount || 0) >
                              (currentItem?.balance || 0);

                            // Obtém opções filtradas baseadas nas seleções
                            const filteredCostCentersForRow =
                              getFilteredCostCenters(
                                currentItem?.glAccountId || "",
                                index,
                              );
                            const filteredGLAccountsForRow =
                              getFilteredGLAccounts(
                                currentItem?.costCenterId || "",
                                index,
                              );

                            // Obtém Saldo
                            const getBalanceForRow = getBalanceCompany(
                              currentItem?.costCenterId || "",
                              currentItem?.glAccountId || "",
                            );

                            return (
                              <TableRow key={field.id}>
                                <TableCell>
                                  <Select
                                    value={currentItem?.costCenterId || ""}
                                    onValueChange={(value) =>
                                      handleCostCenterChange(index, value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue
                                        placeholder={t("newPO.select")}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {filteredCostCentersForRow.map((cc) => (
                                        <SelectItem key={cc.id} value={cc.id}>
                                          {cc.code} - {cc.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={currentItem?.glAccountId || ""}
                                    defaultValue={field.glAccountId}
                                    onValueChange={(value) =>
                                      handleGLAccountChange(index, value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue
                                        placeholder={t("newPO.select")}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {filteredGLAccountsForRow.map((acc) => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                          {acc.code} - {acc.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <div className="px-3 py-2 border rounded-md bg-muted/50 text-sm min-w-37.5">
                                    {selectedCompany?.name || (
                                      <span className="text-muted-foreground italic">
                                        {t("newPO.selectCCAndGL")}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {getBalanceForRow.toLocaleString("pt-BR")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col items-end">
                                    {/* CurrencyInput com suporte a internacionalização */}
                                    {(() => {
                                      const currencyLocale: CurrencyInputLocale =
                                        language === "pt" ? "pt-BR" : "en-US";
                                      return (
                                        <CurrencyInput
                                          value={currentItem?.amount || 0}
                                          locale={currencyLocale}
                                          onChange={(value) =>
                                            handleAmountChange(index, value)
                                          }
                                          className={cn(
                                            hasBalanceIssue &&
                                              "border-destructive focus-visible:ring-destructive",
                                          )}
                                        />
                                      );
                                    })()}

                                    {hasBalanceIssue && (
                                      <p className="text-xs text-destructive mt-1">
                                        {t("newPO.exceedsBalance")}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {(currentItem?.percentage || 0).toFixed(2)}%
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {/* Botão limpar linha - sempre visível */}
                                    {(currentItem?.costCenterId ||
                                      currentItem?.glAccountId ||
                                      currentItem?.amount > 0) && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        title="Limpar linha"
                                        onClick={() => {
                                          form.setValue(
                                            `costCenterItems.${index}.costCenterId`,
                                            "",
                                          );
                                          form.setValue(
                                            `costCenterItems.${index}.glAccountId`,
                                            "",
                                          );
                                          form.setValue(
                                            `costCenterItems.${index}.companyId`,
                                            "",
                                          );
                                          form.setValue(
                                            `costCenterItems.${index}.amount`,
                                            0,
                                          );
                                          form.setValue(
                                            `costCenterItems.${index}.percentage`,
                                            0,
                                          );
                                        }}
                                      >
                                        <BrushCleaning className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                    )}
                                    {/* Botão excluir linha - apenas quando múltiplas linhas */}
                                    {fields.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        title="Remover linha"
                                        onClick={() => remove(index)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Alerta quando a soma dos valores excede o valor total */}
                    {allocationExceedsTotal && (
                      <Alert className="border-destructive/50 bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                          {t("newPO.allocationExceedsTotal")}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}

              {showSection3 && (
                <>
                  <Separator />

                  {/* Seção de Fornecedor - Seção 3 */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {t("common.supplier")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>

                    {/* Alternância de Modo de Busca */}
                    <div className="flex items-center gap-6 p-3 border rounded-md bg-muted/30">
                      <span className="text-sm font-medium">
                        {t("newPO.searchBy")}
                      </span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={supplierSearchMode === "taxId"}
                            onCheckedChange={() =>
                              handleSearchModeChange("taxId")
                            }
                          />
                          <span className="text-sm">{t("newPO.cpfCnpj")}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={supplierSearchMode === "name"}
                            onCheckedChange={() =>
                              handleSearchModeChange("name")
                            }
                          />
                          <span className="text-sm">
                            {t("newPO.companyOrTradeName")}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Campo CPF/CNPJ */}
                      <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("newPO.cpfCnpj")}{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            {supplierSearchMode === "taxId" ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "w-full justify-between font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value
                                        ? suppliers.find(
                                            (sup) => sup.id === field.value,
                                          )?.taxId
                                        : t("newPO.select")}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-87.5 p-0"
                                  align="start"
                                >
                                  <Command>
                                    <CommandInput
                                      placeholder={t("newPO.searchTaxId")}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        {t("newPO.noSupplierFound")}
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {[...suppliers]
                                          .sort((a, b) => {
                                            if (a.isApproved && !b.isApproved)
                                              return -1;
                                            if (!a.isApproved && b.isApproved)
                                              return 1;
                                            return 0;
                                          })
                                          .map((sup) => (
                                            <CommandItem
                                              key={sup.id}
                                              value={sup.taxId}
                                              onSelect={() => {
                                                field.onChange(sup.id);
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4 shrink-0",
                                                  sup.id === field.value
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                                )}
                                              />
                                              <div className="flex flex-col flex-1 min-w-0">
                                                <span>{sup.taxId}</span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                  {sup.legalName}
                                                </span>
                                              </div>
                                              <span
                                                className={cn(
                                                  "ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                                                  sup.isApproved
                                                    ? "bg-success/10 text-success border border-success/30"
                                                    : "bg-warning/10 text-warning border border-warning/30",
                                                )}
                                              >
                                                {sup.isApproved
                                                  ? t("common.approved")
                                                  : t("common.notApproved")}
                                              </span>
                                            </CommandItem>
                                          ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <div className="px-3 py-2 border rounded-md bg-muted/50 text-sm text-muted-foreground h-10 flex items-center">
                                {selectedSupplier?.taxId || "-"}
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Campo Razão Social */}
                      <div className="flex flex-col">
                        <Label className="mb-3">
                          {t("newPO.companyName")}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        {supplierSearchMode === "name" ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between font-normal",
                                  !watchSupplierId && "text-muted-foreground",
                                )}
                              >
                                {watchSupplierId
                                  ? suppliers.find(
                                      (sup) => sup.id === watchSupplierId,
                                    )?.legalName
                                  : t("newPO.select")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-87.5 p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder={t("newPO.searchCompanyName")}
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    {t("newPO.noSupplierFound")}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {[...suppliers]
                                      .sort((a, b) => {
                                        if (a.isApproved && !b.isApproved)
                                          return -1;
                                        if (!a.isApproved && b.isApproved)
                                          return 1;
                                        return 0;
                                      })
                                      .map((sup) => (
                                        <CommandItem
                                          key={sup.id}
                                          value={sup.legalName}
                                          onSelect={() => {
                                            form.setValue("supplierId", sup.id);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4 shrink-0",
                                              sup.id === watchSupplierId
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                          <div className="flex flex-col flex-1 min-w-0">
                                            <span>{sup.legalName}</span>
                                            <span className="text-xs text-muted-foreground truncate">
                                              {sup.taxId}
                                            </span>
                                          </div>
                                          <span
                                            className={cn(
                                              "ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                                              sup.isApproved
                                                ? "bg-success/10 text-success border border-success/30"
                                                : "bg-warning/10 text-warning border border-warning/30",
                                            )}
                                          >
                                            {sup.isApproved
                                              ? t("common.approved")
                                              : t("common.notApproved")}
                                          </span>
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <div className="px-3 py-2 border rounded-md bg-muted/50 text-sm h-10 flex items-center">
                            {selectedSupplier?.legalName || "-"}
                          </div>
                        )}
                      </div>

                      {/* Campo Nome Fantasia */}
                      <div className="flex flex-col">
                        <Label className="mb-3">{t("newPO.tradeName")}</Label>
                        {supplierSearchMode === "name" ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between font-normal",
                                  !watchSupplierId && "text-muted-foreground",
                                )}
                              >
                                {watchSupplierId
                                  ? suppliers.find(
                                      (sup) => sup.id === watchSupplierId,
                                    )?.tradeName ||
                                    suppliers.find(
                                      (sup) => sup.id === watchSupplierId,
                                    )?.legalName
                                  : t("newPO.select")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-87.5 p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder={t("newPO.searchTradeName")}
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    {t("newPO.noSupplierFound")}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {[...suppliers]
                                      .sort((a, b) => {
                                        if (a.isApproved && !b.isApproved)
                                          return -1;
                                        if (!a.isApproved && b.isApproved)
                                          return 1;
                                        return 0;
                                      })
                                      .map((sup) => (
                                        <CommandItem
                                          key={sup.id}
                                          value={sup.tradeName || sup.legalName}
                                          onSelect={() => {
                                            form.setValue("supplierId", sup.id);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4 shrink-0",
                                              sup.id === watchSupplierId
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                          <div className="flex flex-col flex-1 min-w-0">
                                            <span>
                                              {sup.tradeName || sup.legalName}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">
                                              {sup.taxId}
                                            </span>
                                          </div>
                                          <span
                                            className={cn(
                                              "ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0",
                                              sup.isApproved
                                                ? "bg-success/10 text-success border border-success/30"
                                                : "bg-warning/10 text-warning border border-warning/30",
                                            )}
                                          >
                                            {sup.isApproved
                                              ? t("common.approved")
                                              : t("common.notApproved")}
                                          </span>
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <div className="px-3 py-2 border rounded-md bg-muted/50 text-sm h-10 flex items-center">
                            {selectedSupplier?.tradeName || "-"}
                          </div>
                        )}
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsSupplierDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t("newPO.registerSupplier")}
                        </Button>
                      </div>
                    </div>

                    {/* Alerta de Aviso do Fornecedor */}
                    {showSupplierWarning && (
                      <div className="flex items-start gap-3 p-4 border border-amber-500/50 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-700">
                            {t("newPO.supplierNotApprovedTitle")}
                          </p>
                          <p className="text-sm text-amber-800 dark:text-amber-700 mt-1">
                            {t("newPO.supplierNotApprovedAlert")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Seleção de Contrato (quando obrigatório) */}
                    {requiresContractSelection && watchSupplierId && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-primary" />
                          <Label className="text-base font-medium">
                            {t("newPO.contractSelection")}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {t("newPO.contractSelectionDescription")}
                        </p>

                        {/* Alerta se já existe solicitação pendente */}
                        {hasPendingOrLocalContractRequest && (
                          <div className="flex items-start gap-3 p-3 border border-info/50 bg-info/10 rounded-lg">
                            <Clock className="h-5 w-5 text-info shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-info">
                                {t("newPO.pendingContractRequestTitle")}
                              </p>
                              <p className="text-sm text-info/80 mt-1">
                                {t("newPO.pendingContractRequestDescription")}
                              </p>
                              {hasStartPendingOrLocalContractRequest && (
                                <div className="mt-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRequestCancelContract}
                                    disabled={hasRequestedCancellation}
                                  >
                                    {hasRequestedCancellation
                                      ? t("newPO.cancelContractRequestProcessing")
                                      : t("newPO.requestCancelContractRequest")}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Contrato selecionado */}
                        {selectedContractId && contractAction === "select" && (
                          <div className="flex items-center gap-3 p-3 border border-success/50 bg-success/10 rounded-lg">
                            <Check className="h-5 w-5 text-success shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-success">
                                {t("newPO.contractSelected")}
                              </p>
                              <p className="text-sm text-success/80 truncate">
                                {supplierAllContracts.find(c => c.id === selectedContractId)?.fileName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setShowContractSelectorDialog(true)
                                }
                              >
                                {t("common.edit")}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedContractId("");
                                  setContractAction("");
                                }}
                              >
                                {t("newPO.clearContractSelection")}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Solicitação de contrato selecionada */}
                        {contractAction === "request" && (
                          <div className="flex items-center gap-3 p-3 border border-primary/50 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-primary">
                                {t("newPO.contractRequestSelected")}
                              </p>
                              <p className="text-sm text-primary/80">
                                {t("newPO.requestNewContractDescription")}
                              </p>
                            </div>
                            {!hasPendingOrLocalContractRequest && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setContractAction("");
                                  setShowContractSelectorDialog(true);
                                }}
                              >
                                {t("common.edit")}
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Botões de ação (quando nenhuma opção selecionada) */}
                        {!selectedContractId &&
                          contractAction !== "request" &&
                          !hasPendingOrLocalContractRequest && (
                            <div className="flex flex-col sm:flex-row gap-3">
                            {supplierAllContracts.length > 0 && supplierValidContracts.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowContractSelectorDialog(true)}
                                className="gap-2 flex-1"
                              >
                                <FileCheck className="h-4 w-4" />
                                {t("contractSelector.selectContract")}
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setContractAction("request");
                                setShowContractRequestDialog(true);
                              }}
                              className="gap-2 flex-1"
                            >
                              <FileText className="h-4 w-4" />
                              {t("newPO.requestNewContract")}
                            </Button>
                            </div>
                          )}

                        {/* Aviso quando não há contratos válidos */}
                        {supplierAllContracts.length > 0 && supplierValidContracts.length === 0 && !contractAction && (
                          <div className="flex items-start gap-3 p-3 border border-warning/50 bg-warning/10 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-warning">
                                {t("newPO.noValidContractsTitle")}
                              </p>
                              <p className="text-sm text-warning/80 mt-1">
                                {t("newPO.noValidContractsDescription")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {showSection4 && (
                <>
                  <Separator />

                  {/* Seção 4 - Forma de Pagamento */}
                  <div className="space-y-4">
                    {/* Método de Pagamento */}
                    <FormField
                      control={form.control}
                      name="paymentMethodId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            {t("newPO.paymentMethod")}{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full md:w-1/2">
                                <SelectValue placeholder={t("newPO.select")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredPaymentMethods.map((pm) => (
                                <SelectItem key={pm.id} value={pm.id}>
                                  {paymentMethodNames[pm.code] || pm.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Campos de Transferência Bancária */}
                    {selectedPaymentMethodCode === "TRANSFERENCIA" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("newPO.bank")}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("newPO.bankPlaceholder")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bankAgency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("newPO.agency")}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("newPO.agencyPlaceholder")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("newPO.account")}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("newPO.accountPlaceholder")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Campos do Boleto */}
                    {selectedPaymentMethodCode === "BOLETO" && (
                      <Alert className="border-primary/30 bg-primary/5">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-sm text-muted-foreground">
                          {t("newPO.boletoInfoMessage")}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Campos de Transferência Internacional - Wire Transfer EUA */}
                    {selectedPaymentMethodCode === "TRANSFER_USA" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Dados para Wire Transfer (USA)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="beneficiaryName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Beneficiary Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do beneficiário"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="beneficiaryAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Beneficiary Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Endereço do beneficiário"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="routingNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Routing Number (ABA)</FormLabel>
                                <FormControl>
                                  <Input placeholder="9 dígitos" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Número da conta"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bankNameInt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do banco"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bankAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Endereço do banco"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Campos de Transferência Internacional - Fora dos EUA */}
                    {selectedPaymentMethodCode ===
                      "TRANSFER_NON_USA_SUPPLIER" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Dados para Wire Transfer (Internacional)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="beneficiaryName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Beneficiary Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do beneficiário"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="beneficiaryAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Beneficiary Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Endereço do beneficiário"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="iban"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IBAN</FormLabel>
                                <FormControl>
                                  <Input placeholder="Código IBAN" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="swiftBic"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SWIFT/BIC</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Código SWIFT/BIC"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bankNameInt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do banco"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bankAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Endereço do banco"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="intermediaryBank"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>
                                  Intermediary Bank (opcional)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Banco intermediário, se houver"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Campos de Transferência Internacional - Conta e Ordem */}
                    {selectedPaymentMethodCode === "TRANSFER_CONTA_E_ORDEM" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Dados para Conta e Ordem
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="beneficiaryName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Beneficiary Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do beneficiário"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="beneficiaryAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Beneficiary Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Endereço do beneficiário"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="iban"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IBAN</FormLabel>
                                <FormControl>
                                  <Input placeholder="Código IBAN" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="swiftBic"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SWIFT/BIC</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Código SWIFT/BIC"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bankNameInt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do banco"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bankAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Endereço do banco"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="contaOrdemReference"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Referência Conta e Ordem</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Referência para conta e ordem"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {showSection5 && (
                <>
                  <Separator />

                  {/* Seção 5 - Dia de Pagamento */}
                  <div className="space-y-4">
                    {/* Dia de Pagamento - Suspenso */}
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        {t("newPO.paymentDay")}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={paymentDay}
                        onValueChange={(value) => {
                          if (!isOutsidePaymentWindow) {
                            const openDate = openedAtRef.current;
                            if (isBRL) {
                              const n = parseInt(value, 10);
                              const windows = [5, 15, 25];
                              if (!Number.isNaN(n) && windows.includes(n)) {
                                const resolved = getNextValidPaymentDate({
                                  openDate,
                                  selectedDay: n as 5 | 15 | 25,
                                  minDaysAdvance: MIN_DAYS_ADVANCE,
                                  isOutsidePaymentWindow,
                                  isBRL: true,
                                });
                                const resolvedDay =
                                  resolved.day === "ultimo"
                                    ? "ultimo"
                                    : resolved.day.toString();
                                // Notificar usuário se a data foi ajustada
                                if (resolved.day !== n) {
                                  setPaymentDayAdjustment({
                                    originalDay: n.toString(),
                                    newDay: resolvedDay,
                                  });
                                  toast.info(t("newPO.paymentDateAdjusted"), {
                                    description: t(
                                      "newPO.paymentDateAdjustedDescription",
                                      {
                                        originalDay: n,
                                        newDay: resolvedDay,
                                        minDays: MIN_DAYS_ADVANCE,
                                      },
                                    ),
                                  });
                                } else {
                                  setPaymentDayAdjustment(null);
                                }
                                setPaymentDay(resolvedDay);
                                return;
                              }
                            } else {
                              // Pagamentos internacionais: 10, 20, ultimo
                              const intlWindows = [10, 20, "ultimo"];
                              const selectedDay =
                                value === "ultimo"
                                  ? "ultimo"
                                  : parseInt(value, 10);
                              if (
                                selectedDay === "ultimo" ||
                                (!Number.isNaN(selectedDay) &&
                                  intlWindows.includes(selectedDay))
                              ) {
                                const resolved = getNextValidPaymentDate({
                                  openDate,
                                  selectedDay: selectedDay as
                                    | 10
                                    | 20
                                    | "ultimo",
                                  minDaysAdvance: MIN_DAYS_ADVANCE,
                                  isOutsidePaymentWindow,
                                  isBRL: false,
                                });
                                const resolvedDay =
                                  resolved.day === "ultimo"
                                    ? "ultimo"
                                    : resolved.day.toString();
                                // Notificar usuário se a data foi ajustada
                                if (resolved.day !== selectedDay) {
                                  const originalLabel =
                                    selectedDay === "ultimo"
                                      ? t("newPO.lastBusinessDay")
                                      : selectedDay.toString();
                                  const newLabel =
                                    resolved.day === "ultimo"
                                      ? t("newPO.lastBusinessDay")
                                      : resolved.day.toString();
                                  setPaymentDayAdjustment({
                                    originalDay: originalLabel,
                                    newDay: newLabel,
                                  });
                                  toast.info(t("newPO.paymentDateAdjusted"), {
                                    description: t(
                                      "newPO.paymentDateAdjustedDescription",
                                      {
                                        originalDay: originalLabel,
                                        newDay: newLabel,
                                        minDays: MIN_DAYS_ADVANCE,
                                      },
                                    ),
                                  });
                                } else {
                                  setPaymentDayAdjustment(null);
                                }
                                setPaymentDay(resolvedDay);
                                return;
                              }
                            }
                          }
                          setPaymentDayAdjustment(null);
                          setPaymentDay(value);
                        }}
                        disabled={isOutsidePaymentWindow}
                      >
                        <SelectTrigger
                          className={`w-full md:w-1/2 ${
                            isOutsidePaymentWindow ? "opacity-50" : ""
                          }`}
                        >
                          <SelectValue placeholder={t("newPO.select")} />
                        </SelectTrigger>
                        <SelectContent>
                          {isBRL ? (
                            <>
                              {/* Dias para pagamentos nacionais */}
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="15">15</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                            </>
                          ) : (
                            <>
                              {/* Dias para pagamentos internacionais */}
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="ultimo">
                                {t("newPO.lastBusinessDay")}
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>

                      {/* Indicador de ajuste automático da data de pagamento */}
                      {paymentDayAdjustment && !isOutsidePaymentWindow && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t("newPO.paymentDateAdjustedDescription", {
                            originalDay: paymentDayAdjustment.originalDay,
                            newDay: paymentDayAdjustment.newDay,
                            minDays: MIN_DAYS_ADVANCE,
                          })}
                        </p>
                      )}

                      {/* Indicador de pagamento no próximo mês */}
                      {paymentDateInfo?.isNextMonth &&
                        !isOutsidePaymentWindow && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {t("newPO.schaduledPaymentDays")}{" "}
                            {paymentDateInfo.paymentDate.toLocaleDateString(
                              language === "pt" ? "pt-BR" : "en-US",
                              {},
                            )}
                          </p>
                        )}
                    </div>

                    {/* Checkbox para pagamento fora da janela */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/30">
                      <Checkbox
                        id="outsidePaymentWindow"
                        checked={isOutsidePaymentWindow}
                        onCheckedChange={(checked) => {
                          setIsOutsidePaymentWindow(!!checked);
                          if (checked) {
                            setPaymentDay("");
                          } else {
                            setCustomPaymentDay("");
                            setPaymentJustification("");
                          }
                        }}
                      />
                      <div className="flex flex-col">
                        <label
                          htmlFor="outsidePaymentWindow"
                          className="text-sm font-medium cursor-pointer"
                        >
                          {t("newPO.outsideWindow")}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {t("newPO.outsideWindowDescription")}
                        </span>
                      </div>
                    </div>

                    {/* Campos de pagamento fora da janela */}
                    {isOutsidePaymentWindow && (
                      <div className="space-y-4 p-4 border-2 border-amber-500/50 rounded-lg bg-amber-500/10">
                        {/* Alerta de aprovação da tesouraria */}
                        <div className="flex items-start gap-3 p-3 border border-amber-600/50 rounded-lg bg-amber-600/10">
                          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-700">
                              {t("newPO.tesasuryApprovalWarning")}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              {t("newPO.treasuryApprovalWarning")}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              {t("newPO.customPaymentDay")}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              value={customPaymentDay}
                              onChange={(e) =>
                                setCustomPaymentDay(e.target.value)
                              }
                              placeholder="Ex: 7"
                              className="border-amber-500/50 focus:border-amber-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              {t("newPO.paymentJustification")}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                              value={paymentJustification}
                              onChange={(e) =>
                                setPaymentJustification(e.target.value)
                              }
                              placeholder={t(
                                "newPO.paymentJustificationPlaceholder",
                              )}
                              className="min-h-20 border-amber-500/50 focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {showSection6 && (
                <>
                  <Separator />

                  {/* Seção 6 - Frequência de Pagamento */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          {t("newPO.paymentFrequency")}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={paymentFrequency}
                          onValueChange={(
                            value: "unico" | "parcelado" | "recorrente",
                          ) => {
                            setPaymentFrequency(value);
                            if (value === "unico") {
                              setInstallments(1);
                            } else if (value === "recorrente") {
                              setInstallments(18);
                            } else {
                              setInstallments(1);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("newPO.select")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unico">
                              {t("newPO.frequencySingle")}
                            </SelectItem>
                            <SelectItem value="parcelado">
                              {t("newPO.frequencyInstallments")}
                            </SelectItem>
                            <SelectItem value="recorrente">
                              {t("newPO.frequencyRecurring")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {paymentFrequency && (
                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {t("newPO.numberOfInstallments")}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max="999"
                            value={installments}
                            onChange={(e) =>
                              setInstallments(parseInt(e.target.value) || 1)
                            }
                            disabled={
                              paymentFrequency === "unico" ||
                              paymentFrequency === "recorrente"
                            }
                            className={cn(
                              (paymentFrequency === "unico" ||
                                paymentFrequency === "recorrente") &&
                                "bg-muted cursor-not-allowed",
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {paymentFrequency === "recorrente" && (
                      <Alert className="border-blue-500/50 bg-blue-500/10">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-700 dark:text-blue-400">
                          {t("newPO.recurringMessage")}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}

              {showSection7 && (
                <>
                  <Separator />

                  {/* Seção 7 - Descrição */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("newPO.description")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("newPO.descriptionPlaceholder")}
                            className="min-h-25"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Fluxo de Aprovação */}
          <Card>
            <CardHeader>
              <CardTitle>{t("newPO.approvalFlow")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Solicitante - Usuário logado atual (somente leitura) */}
                <div>
                  <Label>{t("newPO.requester")}</Label>
                  <Input
                    className="mt-4 bg-muted"
                    value={users[0]?.name || "Usuário Logado"}
                    disabled
                    readOnly
                  />
                </div>

                {/* Aprovador Funcional - Seleção dinâmica baseada em centros de custo */}
                {requiredApprovers.funcional.length > 0 && (
                  <FormField
                    control={form.control}
                    name="functionalApproverId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("newPO.functionalApprover")}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-2 w-full">
                              <SelectValue
                                placeholder={t("newPO.selectApprover")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {requiredApprovers.funcional.map((approver) => (
                              <SelectItem
                                key={approver.userId}
                                value={approver.userId}
                              >
                                {approver.name} - {approver.function}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Aprovador Sênior - Seleção dinâmica (apenas se valor > MIN_VALUE_FOR_SENIOR_APPROVER) */}
                {requiredApprovers.senior.length > 0 &&
                  requiredApprovers.isSeniorRequired && (
                    <FormField
                      control={form.control}
                      name="seniorApproverId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("newPO.seniorApprover")}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="mt-2 w-full">
                                <SelectValue
                                  placeholder={t("newPO.selectApprover")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {requiredApprovers.senior.map((approver) => (
                                <SelectItem
                                  key={approver.userId}
                                  value={approver.userId}
                                >
                                  {approver.name} - {approver.function}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSave}
              disabled={isSaving}
            >
              Salvar Rascunho
            </Button>
            <Button type="submit" disabled={!canSubmit || isSaving}>
              Enviar para Aprovação
            </Button>
          </div>
        </form>
      </Form>

      <SupplierFormDialog
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
        onSuccess={() => {
          setIsSupplierDialogOpen(false);
          toast.success("Fornecedor cadastrado com sucesso!");
        }}
      />

      {/* Diálogo de Alterações Não Salvas */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent className="sm:max-w-112.5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Alterações não salvas
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Você tem alterações que não foram salvas. Se você sair agora,
              essas alterações serão perdidas.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleCancelLeave}>
              Continuar editando
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              Sair sem salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Aviso PortCo */}
      <Dialog
        open={showPortCoWarning}
        onOpenChange={(open) => {
          if (!open) {
            setShowPortCoWarning(false);
            setPortCoDialogChecked(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              {t("newPOPortCo.title")}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              <strong>{t("newPOPortCo.subtitle")}</strong>
              <br />
              <br />
              {t("newPOPortCo.content")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center space-x-3 rounded-lg border p-4 bg-orange-300/20  border-amber-500">
              <Checkbox
                className=" border-amber-500 checked:bg-amber-600 focus:ring-amber-500"
                id="portco-acknowledge"
                checked={portCoDialogChecked}
                onCheckedChange={(checked) => setPortCoDialogChecked(!!checked)}
              />
              <Label
                htmlFor="portco-acknowledge"
                className="cursor-pointer text-sm leading-relaxed"
              >
                {t("newPOPortCo.checkboxText")}
              </Label>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowPortCoWarning(false);
                setPortCoDialogChecked(false);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              disabled={!portCoDialogChecked}
              onClick={() => {
                form.setValue("beneficiaryId", pendingBeneficiaryRef.current);
                setPortCoAcknowledged(true);
                setShowPortCoWarning(false);
                setPortCoDialogChecked(false);
              }}
            >
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Solicitação de Contrato */}
      {selectedSupplier && (
        <ContractRequestDialog
          open={showContractRequestDialog}
          onOpenChange={(open) => {
            setShowContractRequestDialog(open);
            if (!open && contractRequestJustSubmittedRef.current) {
              contractRequestJustSubmittedRef.current = false;
              return;
            }
            if (!open && !hasPendingOrLocalContractRequest) {
              setContractAction("");
            }
          }}
          origin="po_creation"
          supplier={{
            id: selectedSupplier.id,
            legalName: selectedSupplier.legalName,
            taxId: selectedSupplier.taxId,
            scope: selectedSupplier.supplierScope || "NATIONAL",
          }}
          onSuccess={() => {
            // Keep the "request" action selected to indicate pending request
            setHasLocalContractRequest(true);
            contractRequestJustSubmittedRef.current = true;
          }}
        />
      )}

      {/* Dialog de Seleção de Contrato */}
      <ContractSelectorDialog
        open={showContractSelectorDialog}
        onOpenChange={setShowContractSelectorDialog}
        contracts={supplierAllContracts}
        onSelect={(contractId) => {
          setSelectedContractId(contractId);
          setContractAction("select");
        }}
      />
    </>
  );
};

export default ProductsServicesForm;
