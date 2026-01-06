// Modelo completo (consolidado) — pronto para você migrar/ajustar no projeto.

export type ID = string;
export type ISODateString = string; // ex.: "2025-12-20T03:00:00.000Z"

export type CurrencyCode = "BRL" | string;

/** Pagamento nacional/internacional é derivado pela moeda (BRL => nacional) */
export type PaymentScope = "NATIONAL" | "INTERNATIONAL";

export type POStatus =
  | "rascunho"
  | "aguardando_aprovacao"
  | "aprovada"
  | "reprovada"
  | "finalizada";

export type POStep =
  | "rascunho"
  | "aguardando_aprovacao"
  | "aguardando_contrato"
  | "realizando_pagamentos"
  | "reprovada"
  | "baixada";

export const allowedStepsByStatus = {
  rascunho: ["rascunho"],
  aguardando_aprovacao: ["aguardando_aprovacao"],
  aprovada: ["aguardando_contrato", "realizando_pagamentos"],
  reprovada: ["reprovada"],
  finalizada: ["baixada"],
} as const;

export function isStepAllowedForStatus(
  status: POStatus,
  step: POStep
): boolean {
  return (allowedStepsByStatus[status] as readonly POStep[]).includes(step);
}

export type POType = "produtos_servicos" | "reembolso";

export type POSubtypeByType = {
  produtos_servicos: "produto" | "servico";
  reembolso: "padrao";
};

export type POSubtype<T extends POType = POType> = POSubtypeByType[T];

export const allowedSubtypesByType: { [K in POType]: readonly POSubtype<K>[] } =
  {
    produtos_servicos: ["produto", "servico"],
    reembolso: ["padrao"],
  } as const;

export function isSubtypeAllowedForType<T extends POType>(
  type: T,
  subtype: string
): subtype is POSubtype<T> {
  return (allowedSubtypesByType[type] as readonly string[]).includes(subtype);
}

export type POFormKey = `${POType}:${string}`;

export function buildPOFormKey(po: {
  typeOfPO: POType;
  subtypeOfPO: string;
}): POFormKey {
  return `${po.typeOfPO}:${po.subtypeOfPO}`;
}

/** Registry opcional */
export const poFormRegistry = {
  "produtos_servicos:produto": {
    form: "POProductsForm.tsx",
    ruleset: "rules.po.produtos_servicos.produto",
  },
  "produtos_servicos:servico": {
    form: "POServicesForm.tsx",
    ruleset: "rules.po.produtos_servicos.servico",
  },
  "produtos_servicos:produtos_e_servicos": {
    form: "POProductsAndServicesForm.tsx",
    ruleset: "rules.po.produtos_servicos.produtos_e_servicos",
  },
  "reembolso:padrao": {
    form: "POReembolsoForm.tsx",
    ruleset: "rules.po.reembolso.padrao",
  },
} as const satisfies Record<POFormKey, { form: string; ruleset: string }>;

export type POApprovalStatus = "pendente" | "aprovado" | "rejeitado";
export type POPaymentTerms = "unico" | "parcelado" | "recorrente";

export type ExpenseNatureName = "deal_expense" | "ongoing";

export type BeneficiaryType = "FUNDO_GP" | "PORTCO";

export type SupplierOfferingType =
  | "produto"
  | "servico"
  | "produtos_e_servicos";

export type CompanyExpenseNatureScope = "deal_expense" | "ongoing" | "both";

export interface CostCenter {
  id: ID;
  code: string;
  name: string;
  isActive: boolean;
}

export interface GLAccount {
  id: ID;
  code: string;
  name: string;
  isActive: boolean;
}

/** Empresa pagadora */
export interface Company {
  id: ID;
  code: string;
  name: string;

  expenseNatureScope: CompanyExpenseNatureScope;
  isIcApproved: boolean;
  isActive: boolean;
}

export interface PayerAccountingMatrix {
  id: ID;
  costCenterId: ID;
  glAccountId: ID;
  isNationalPayment: boolean;
  companyId: ID;
  isActive: boolean;
  balance: number;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  prefix: string;
  function: string;
}

export interface ExpenseNature {
  id: ID;
  name: ExpenseNatureName;
}

export interface Beneficiary {
  id: ID;
  name: BeneficiaryType;
}

export interface Currency {
  id: ID;
  code: CurrencyCode;
  language: string;
  prefix: string;
  name: string;
}

export interface SupplierPrimaryContact {
  name: string;
  phone?: string | null;
  email?: string | null;
}

export interface Supplier {
  id: ID;
  taxId: string;
  legalName: string;
  tradeName?: string | null;
  companyType?: string | null;
  companySize?: string | null;
  address?: string | null;
  phone?: string | null;
  generalEmail?: string | null;

  primaryContact?: SupplierPrimaryContact | null;

  additionalInfo?: string | null;

  isApproved: boolean;
  approvedAt?: ISODateString | null;
  approvalValidUntil?: ISODateString | null;

  offeringType: SupplierOfferingType;

  offeringTags?: string[] | null;
}

export interface SupplierBankAccount {
  id: ID;
  supplierId: ID;
  bank: string;
  agency: string;
  accountNumber: string;
}

export interface CostCenter {
  id: ID;
  code: string;
  name: string;
  isActive: boolean;
}

export interface GLAccount {
  id: ID;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Company {
  id: ID;
  code: string;
  name: string;

  expenseNatureScope: CompanyExpenseNatureScope;
  isIcApproved: boolean;
  isActive: boolean;
}

export interface PaymentMethod {
  id: ID;
  scope: PaymentScope;
  code: PaymentMethodCode;
  isActive: boolean;
}

export interface Forecast {
  id: ID;
  companyId: ID;
  period: string;
  amount: number;
  isNationalPayment?: boolean | null;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export type CompanyApproverRole = "COMPANY_APPROVER" | "IC_APPROVER";

export interface CompanyApprover {
  id: ID;
  companyId: ID;
  userId: ID;
  role: CompanyApproverRole;
  isActive: boolean;
  validFrom?: ISODateString | null;
  validUntil?: ISODateString | null;
}

export type ApproverLevel = "funcional" | "senior";

export interface CostCenterApprover {
  id: ID;
  costCenterId: ID;
  approverId: ID;
  level: ApproverLevel;
  isActive: boolean;
}

export interface PayerAccountingMatrix {
  id: ID;
  costCenterId: ID;
  glAccountId: ID;
  isNationalPayment: boolean;
  companyId: ID;
  isActive: boolean;
}

export interface PaymentSchedule {
  id: ID;
  isNationalPayment: boolean;
  isActive: boolean;
}

export interface PaymentScheduleDay {
  id: ID;
  paymentScheduleId: ID;
  dayOfMonth: number;
}

export type PaymentMethodCode =
  // Nacional
  | "TRANSFERENCIA"
  | "BOLETO"
  // Internacional
  | "TRANSFER_USA"
  | "TRANSFER_NON_USA_SUPPLIER"
  | "TRANSFER_CONTA_E_ORDEM";

export interface PaymentMethod {
  id: ID;
  scope: PaymentScope;
  code: PaymentMethodCode;
  isActive: boolean;
}

/**
 * Detalhes — mantive um shape pragmático e extensível
 */
export type PaymentDetails =
  | {
      methodCode: "TRANSFERENCIA";
      bank: string;
      agency: string;
      accountNumber: string;
    }
  | {
      methodCode: "BOLETO";
      barcode: string;
    }
  | {
      methodCode:
        | "TRANSFER_USA"
        | "TRANSFER_NON_USA_SUPPLIER"
        | "TRANSFER_CONTA_E_ORDEM";
      intermediaryBeneficiaryName?: string | null;
      intermediaryAccountNumber?: string | null;
      intermediaryRoutingType?: "ABA" | "SWIFT" | null;
      intermediaryRoutingCode?: string | null;

      finalBeneficiaryName: string;
      finalAccountNumber: string;

      notes?: string | null;
    };

export interface POPaymentDetails {
  purchaseOrderId: ID;
  paymentMethodId: ID;
  details: PaymentDetails;
}

export interface PurchaseOrderBase {
  id: ID;
  externalId: string;

  status: POStatus;
  step: POStep;

  typeOfPO: POType;
  subtypeOfPO: string;

  expenseNatureId: ID;
  beneficiaryId: ID;
  currencyId: ID;
  supplierId: ID;
  totalValue: number;

  isIcApproved: boolean;
  hasGrossUp: boolean;

  paymentTerms: POPaymentTerms;
  installmentCount?: number | null;

  paymentWindowDays: number;
  isOutsidePaymentWindow: boolean;
  outsidePaymentJustification?: string | null;

  notes?: string | null;

  createdBy: ID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type PurchaseOrder =
  | (Omit<PurchaseOrderBase, "typeOfPO" | "subtypeOfPO"> & {
      typeOfPO: "produtos_servicos";
      subtypeOfPO: POSubtype<"produtos_servicos">;
    })
  | (Omit<PurchaseOrderBase, "typeOfPO" | "subtypeOfPO"> & {
      typeOfPO: "reembolso";
      subtypeOfPO: POSubtype<"reembolso">;
    });

export interface POAllocation {
  id: ID;
  purchaseOrderId: ID;

  costCenterId: ID;
  glAccountId: ID;
  payerCompanyId: ID;

  availableBalanceSnapshot: number;
  allocationAmount: number;
  allocationAmountFormatted?: string;
  allocationPercentage: number;

  matrixId?: ID | null;
}

export interface POApprovalStep {
  id: ID;
  purchaseOrderId: ID;
  order: number;

  status: POApprovalStatus;

  approverUserId: ID;

  companyId?: ID | null;

  approverName: string;
  approverEmail: string;

  decidedAt?: ISODateString | null;
  comments?: string | null;
}

/* DTO/Views */
export interface PurchaseOrderExpanded
  extends Omit<
    PurchaseOrder,
    "expenseNatureId" | "beneficiaryId" | "currencyId" | "supplierId"
  > {
  expenseNature: ExpenseNature;
  beneficiary: Beneficiary;
  currency: Currency;
  supplier: Supplier;

  allocations: POAllocation[];
  approvers: POApprovalStep[];

  payment: POPaymentDetails;

  paymentScope?: PaymentScope;
  description?: string;
}

/* Filtros e Stats  */
export interface POFilters {
  status?: POStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  supplierId?: ID;
}

export interface POStats {
  rascunho?: number;
  aguardandoAprovacao?: number;
  aprovada?: number;
  reprovada?: number;
  finalizada?: number;
  total?: number;
}

/*  Helpers pragmáticos (UI/validação)

/** Regra corporativa simples: BRL => NATIONAL; demais => INTERNATIONAL */
export function getPaymentScopeByCurrencyCode(
  code: CurrencyCode
): PaymentScope {
  return code === "BRL" ? "NATIONAL" : "INTERNATIONAL";
}

/* Validação rápida do par status/step no front. */
export function validateStatusStepOrThrow(
  status: POStatus,
  step: POStep
): void {
  if (!isStepAllowedForStatus(status, step)) {
    throw new Error(`Combinação inválida: status='${status}' step='${step}'`);
  }
}

/*  Base mestre: Produtos/Serviços por fornecedor (futuro)  */

export type OfferingKind = "produto" | "servico";

export interface OfferingCategory {
  id: ID;
  kind: OfferingKind;
  code?: string | null;
  name: string;
  isActive: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface SupplierOfferingItem {
  id: ID;
  supplierId: ID;

  kind: OfferingKind;
  name: string;
  description?: string | null;

  categoryId?: ID | null;
  categoryName?: string | null;

  skuOrCode?: string | null;
  unitOfMeasure?: string | null;

  isActive: boolean;

  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface SupplierWithOfferings extends Supplier {
  bankAccounts?: SupplierBankAccount[] | null;
  offerings?: SupplierOfferingItem[] | null;
}

/*  Contexto para template de texto (futuro)  */
export interface POTemplateContext {
  poId: ID;
  externalId: string;

  status: POStatus;
  step: POStep;

  typeOfPO: POType;
  subtypeOfPO: string;

  supplierId: ID;
  supplierLegalName: string;
  supplierTaxId: string;
  supplierOfferingType: SupplierOfferingType;
  supplierOfferingTags?: string[] | null;

  expenseNature: ExpenseNatureName;
  beneficiary: BeneficiaryType;

  totalValue: number;
  currencyCode: CurrencyCode;
  currencyPrefix: string;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/*  Payment Installments (para UI de parcelas)  */
export type PaymentInstallmentStatus =
  | "pendente"
  | "agendado"
  | "pago"
  | "vencido";

export interface POAttachment {
  id: ID;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: ISODateString;
  uploadedBy: string;
}

export interface PaymentInstallment {
  id: ID;
  name: string;
  dueDate: ISODateString;
  amount: number;
  status: PaymentInstallmentStatus;
  attachments: POAttachment[];
}

export type POHistoryEventType =
  | "created" // PO criada
  | "submitted" // Enviada para aprovação
  | "approved" // Aprovada (etapa ou final)
  | "rejected" // Rejeitada
  | "status_changed" // Mudança de status
  | "step_changed" // Mudança de step
  | "edited" // Editada
  | "comment_added" // Comentário adicionado
  | "attachment_added" // Anexo adicionado
  | "payment_scheduled" // Pagamento agendado
  | "payment_completed" // Pagamento realizado
  | "boleto_added" // Boleto inserido
  | "invoice_added" // Nota fiscal inserida
  | "finalized"; // Baixada/Finalizada

export interface POHistoryEvent {
  id: ID;
  purchaseOrderId: ID;

  eventType: POHistoryEventType;

  // Dados do evento
  title: string;
  description?: string | null;

  // Referências opcionais para contexto
  previousStatus?: POStatus | null;
  newStatus?: POStatus | null;
  previousStep?: POStep | null;
  newStep?: POStep | null;

  // Quem realizou a ação
  performedByUserId: Number;
  performedByUserName: string;

  // Metadados adicionais (flexível para diferentes tipos de eventos)
  metadata?: Record<string, unknown> | null;

  createdAt: ISODateString;
}

export interface PurchaseOrderWithHistory extends PurchaseOrderExpanded {
  history: POHistoryEvent[];
}
