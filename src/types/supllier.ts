// Tipos de Fornecedor

export interface Supplier {
  id: string;
  cnpj?: string;
  name: string;
  tradeName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  bankInfo?: {
    bank: string;
    agency: string;
    account: string;
    accountType: "checking" | "savings";
    pixKey?: string;
  };
  status: "active" | "inactive" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierFormData {
  cnpj?: string;
  name: string;
  tradeName: string;
  email: string;
  phone?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bank?: string;
  agency?: string;
  account?: string;
  accountType?: "checking" | "savings";
  pixKey?: string;
}
