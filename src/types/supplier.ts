// Supplier Types - Refactored to support National and International suppliers
import type { ID, ISODateString } from "./domain";

// Base types
export type SupplierScope = "NATIONAL" | "INTERNATIONAL";
export type DocumentType = "CPF" | "CNPJ";
export type OfferingType =
  | "produto"
  | "servico"
  | "produtos_e_servicos"
  | "funcionario";
export type SupplierType = "fornecedor" | "cliente" | "fornecedor_cliente";
export type AccountType = "poupanca" | "corrente";

// Supplier tags
export type SupplierTag =
  | "preferred"
  | "cloud"
  | "fast_onboarding"
  | "logistica"
  | "compliance"
  | "audit"
  | "legal"
  | "hardware"
  | "international"
  | "vendor_managed"
  | "consulting"
  | "office"
  | "catalog"
  | "engineering"
  | "field";

export const SUPPLIER_TAG_LABELS: Record<
  SupplierTag,
  { pt: string; en: string }
> = {
  preferred: { pt: "Preferencial", en: "Preferred" },
  cloud: { pt: "Cloud", en: "Cloud" },
  fast_onboarding: { pt: "Onboarding Rápido", en: "Fast Onboarding" },
  logistica: { pt: "Logística", en: "Logistics" },
  compliance: { pt: "Compliance", en: "Compliance" },
  audit: { pt: "Auditoria", en: "Audit" },
  legal: { pt: "Jurídico", en: "Legal" },
  hardware: { pt: "Hardware", en: "Hardware" },
  international: { pt: "Internacional", en: "International" },
  vendor_managed: { pt: "Vendor Managed", en: "Vendor Managed" },
  consulting: { pt: "Consultoria", en: "Consulting" },
  office: { pt: "Escritório", en: "Office" },
  catalog: { pt: "Catálogo", en: "Catalog" },
  engineering: { pt: "Engenharia", en: "Engineering" },
  field: { pt: "Campo", en: "Field" },
};

// Attachment structure
export interface SupplierAttachment {
  id: ID;
  filename: string;
  fileUrl?: string; // Mock: can be blob URL or external link
  fileSize?: number; // in bytes
  fileType?: string; // MIME type
  uploadedAt: ISODateString;
}

// Background Check (Homologação)
export interface BackgroundCheck {
  isApproved: boolean;
  approvedFrom?: ISODateString; // "Quando foi"
  approvedUntil?: ISODateString; // "Até quando"
}

// Address structure
export interface Address {
  zipCode: string; // CEP
  street: string; // Logradouro
  number: string;
  complement?: string;
  neighborhood: string; // Bairro
  city: string; // Cidade
  state: string; // Estado (UF)
  country: string; // País (default "Brasil" for national)
}

// Payment Info structure (for National suppliers)
export interface PaymentInfo {
  bank: string;
  agency: string;
  account: string;
  accountType: AccountType;
}

// Abroad Bank Details (for International suppliers)
export interface AbroadBankDetails {
  bankName: string; // Nome do banco
  swiftCode?: string; // Código SWIFT (opcional)
  ibanCode?: string; // Código IBAN (opcional)
  accountNumber?: string; // Número da conta
  accountHolder?: string; // Titular da conta
  currency?: string; // Moeda (ex: USD, EUR, GBP)
  routingNumber?: string; // Número de roteamento (para bancos nos EUA)
  additionalInfo?: string; // Informações adicionais
}

// Contact Info structure
export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  simplesNacional: boolean; // Optante do Simples Nacional
}

// International Contact Info
export interface InternationalContactInfo {
  name?: string; // Opcional
  phone?: string; // Opcional
  email?: string; // Opcional
  additionalInfo?: string; // Informações adicionais (textarea)
}

// Address structure for International (simplified)
export interface InternationalAddress {
  postalCode?: string; // Código Postal (opcional)
  street?: string; // Logradouro (opcional)
  number?: string; // Número (opcional)
  complement?: string; // Complemento (opcional)
  district?: string; // Bairro (opcional)
  city?: string; // Cidade (opcional)
  state?: string; // Estado/Província (opcional)
  country?: string; // País (opcional)
}

// Attachment used in forms (Date objects allowed during entry)
export interface SupplierAttachmentDraft {
  id?: ID;
  filename: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: ISODateString | Date;
}

// Base Supplier (common fields)
export interface SupplierBase {
  id: ID;
  supplierScope: SupplierScope;
  status: "active" | "inactive" | "blocked";
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// National Supplier Details
export interface NationalSupplierDetails {
  documentType: DocumentType; // CPF ou CNPJ
  document: string; // CPF/CNPJ value
  legalName: string; // Razão Social
  tradeName?: string; // Nome Fantasia
  offeringType: OfferingType; // Tipo de oferta
  supplierType: SupplierType; // Tipo de fornecedor
  tags?: SupplierTag[]; // Tags do fornecedor
  address: Address;
  paymentInfo: PaymentInfo;
  contactInfo: ContactInfo;
  attachments: SupplierAttachment[];
  backgroundCheck: BackgroundCheck;
  requiresContract: boolean; // Obrigatoriedade de ter contratos
}

// International Supplier Details
export interface InternationalSupplierDetails {
  taxId?: string | null; // Tax ID (opcional)
  legalName: string; // Razão Social (obrigatório)
  tradeName?: string | null; // Nome Fantasia (opcional)
  offeringType: OfferingType; // Tipo de oferta (obrigatório)
  address?: InternationalAddress; // Endereço (opcional, com campos internos opcionais)
  paymentDetails: AbroadBankDetails; // Dados bancários no exterior (obrigatório)
  contact?: InternationalContactInfo; // Contato (opcional)
  attachments: SupplierAttachment[]; // Anexos
  backgroundCheck: BackgroundCheck; // Homologação
  requiresContract: boolean; // Obrigatoriedade de ter contratos
}

// Full Supplier type (discriminated union)
export type Supplier =
  | (SupplierBase & { supplierScope: "NATIONAL" } & NationalSupplierDetails)
  | (SupplierBase & {
      supplierScope: "INTERNATIONAL";
    } & InternationalSupplierDetails);

// Type guard helpers
export function isNationalSupplier(
  supplier: Supplier,
): supplier is SupplierBase & {
  supplierScope: "NATIONAL";
} & NationalSupplierDetails {
  return supplier.supplierScope === "NATIONAL";
}

export function isInternationalSupplier(
  supplier: Supplier,
): supplier is SupplierBase & {
  supplierScope: "INTERNATIONAL";
} & InternationalSupplierDetails {
  return supplier.supplierScope === "INTERNATIONAL";
}

// Form data types for NewSupplier screen
export interface NationalSupplierFormData {
  supplierScope: "NATIONAL";
  documentType: DocumentType;
  document: string;
  legalName: string;
  tradeName?: string;
  offeringType: OfferingType;
  supplierType: SupplierType;
  tags?: SupplierTag[];
  // Address
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string; // readonly "Brasil"
  // Payment
  bank: string;
  agency: string;
  account: string;
  accountType: AccountType;
  // Contact
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  simplesNacional: boolean;
  contactAdditionalInfo?: string;
  // Background check
  isApproved: boolean;
  approvedFrom?: Date;
  approvedUntil?: Date;
  // Contract Requirements
  requiresContract: boolean;
}

export interface InternationalSupplierFormData {
  supplierScope: "INTERNATIONAL";
  // General Data
  taxId?: string; // Opcional
  legalName: string; // Obrigatório
  tradeName?: string; // Opcional
  offeringType: OfferingType; // Obrigatório
  supplierType?: SupplierType; // Opcional (Perfil)
  tags?: SupplierTag[]; // Tags do fornecedor
  // Address
  postalCode?: string; // Opcional
  street?: string; // Opcional
  number?: string; // Opcional
  complement?: string; // Opcional
  district?: string; // Opcional
  city?: string; // Opcional
  state?: string; // Opcional
  country?: string; // Opcional
  // Payment (Abroad)
  bankName: string; // Obrigatório
  swiftCode?: string; // Opcional
  ibanCode?: string; // Opcional
  accountNumber?: string; // Opcional
  accountHolder?: string; // Opcional
  currency?: string; // Opcional
  routingNumber?: string; // Opcional
  bankAdditionalInfo?: string; // Opcional
  // Intermediary Bank
  hasIntermediaryBank?: boolean; // Possui banco intermediário?
  intermediaryBankSwift?: string; // SWIFT do banco intermediário
  intermediaryBankRouting?: string; // Routing Number do banco intermediário
  // Contact
  contactName?: string; // Opcional
  contactPhone?: string; // Opcional
  contactEmail?: string; // Opcional
  contactAdditionalInfo?: string; // Opcional (textarea)
  // Attachments
  attachments?: SupplierAttachmentDraft[];
  // Background Check
  isApproved: boolean;
  approvedFrom?: Date; // Conditional: obrigatório se isApproved = true
  approvedUntil?: Date; // Conditional: obrigatório se isApproved = true
  // Contract Requirements
  requiresContract: boolean;
}

export type SupplierFormData =
  | NationalSupplierFormData
  | InternationalSupplierFormData;
