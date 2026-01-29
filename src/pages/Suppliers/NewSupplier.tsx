import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Globe2, Save } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, validateDocument } from "@/lib/utils";
import type {
  InternationalSupplierFormData,
  NationalSupplierFormData,
  SupplierScope,
} from "@/types/supplier";
import { NationalSupplierForm } from "./Forms/NationalSupplierForm";
import { InternationalSupplierForm } from "./Forms/InternationalSupplierForm";

const defaultNationalValues: NationalSupplierFormData = {
  supplierScope: "NATIONAL",
  documentType: "CNPJ",
  document: "",
  legalName: "",
  tradeName: "",
  offeringType: "produto",
  supplierType: "fornecedor",
  tags: [],
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "Brasil",
  bank: "",
  agency: "",
  account: "",
  accountType: "corrente",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  simplesNacional: false,
  contactAdditionalInfo: "",
  isApproved: false,
  approvedFrom: undefined,
  approvedUntil: undefined,
  requiresContract: false,
};

const defaultInternationalValues: InternationalSupplierFormData = {
  supplierScope: "INTERNATIONAL",
  taxId: "",
  legalName: "",
  tradeName: "",
  offeringType: "produto",
  supplierType: "fornecedor",
  tags: [],
  postalCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  country: "",
  bankName: "",
  swiftCode: "",
  ibanCode: "",
  accountNumber: "",
  accountHolder: "",
  currency: "",
  routingNumber: "",
  bankAdditionalInfo: "",
  hasIntermediaryBank: false,
  intermediaryBankSwift: "",
  intermediaryBankRouting: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactAdditionalInfo: "",
  attachments: [],
  isApproved: false,
  approvedFrom: undefined,
  approvedUntil: undefined,
  requiresContract: false,
};

const nationalSupplierSchema = z
  .object({
    supplierScope: z.literal("NATIONAL"),
    documentType: z.enum(["CPF", "CNPJ"]),
    document: z
      .string()
      .min(11, "Documento obrigatório")
      .max(18, "Documento inválido"),
    legalName: z.string().min(2, "Razão social obrigatória"),
    tradeName: z.string().optional(),
    offeringType: z.enum([
      "produto",
      "servico",
      "produtos_e_servicos",
      "funcionario",
    ]),
    supplierType: z.enum(["fornecedor", "cliente", "fornecedor_cliente"]),
    tags: z.array(z.string()).optional(),
    zipCode: z.string().min(8, "CEP obrigatório"),
    street: z.string().min(2, "Logradouro obrigatório"),
    number: z.string().min(1, "Número obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, "Bairro obrigatório"),
    city: z.string().min(2, "Cidade obrigatória"),
    state: z.string().min(2, "UF inválida").max(2, "UF inválida"),
    country: z.string().min(2, "País obrigatório"),
    bank: z.string().min(2, "Banco obrigatório"),
    agency: z.string().min(3, "Agência obrigatória"),
    account: z.string().min(3, "Conta obrigatória"),
    accountType: z.enum(["poupanca", "corrente"]),
    contactName: z.string().min(2, "Contato obrigatório"),
    contactPhone: z.string().min(8, "Telefone obrigatório"),
    contactEmail: z.string().email("E-mail inválido"),
    simplesNacional: z.boolean(),
    contactAdditionalInfo: z.string().optional(),
    isApproved: z.boolean(),
    approvedFrom: z.date().optional(),
    approvedUntil: z.date().optional(),
    requiresContract: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!validateDocument(values.document, values.documentType)) {
      ctx.addIssue({
        code: "custom",
        message: "Documento inválido",
        path: ["document"],
      });
    }

    if (values.isApproved && !values.approvedFrom) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a data de aprovação",
        path: ["approvedFrom"],
      });
    }

    if (
      values.approvedFrom &&
      values.approvedUntil &&
      values.approvedUntil < values.approvedFrom
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Data final deve ser maior que inicial",
        path: ["approvedUntil"],
      });
    }
  });

const internationalSupplierSchema = z
  .object({
    supplierScope: z.literal("INTERNATIONAL"),
    taxId: z.string().trim().optional(),
    legalName: z.string().min(2, "Informe a razão social"),
    tradeName: z.string().optional(),
    offeringType: z.enum([
      "produto",
      "servico",
      "produtos_e_servicos",
      "funcionario",
    ]),
    supplierType: z
      .enum(["fornecedor", "cliente", "fornecedor_cliente"])
      .optional(),
    tags: z.array(z.string()).optional(),
    // Address
    postalCode: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    // Payment
    bankName: z.string().min(2, "Informe o banco"),
    swiftCode: z.string().optional(),
    ibanCode: z
      .string()
      .min(12, "IBAN deve ter pelo menos 12 caracteres")
      .optional()
      .or(z.literal("")),
    accountNumber: z.string().optional(),
    accountHolder: z.string().optional(),
    currency: z.string().optional(),
    routingNumber: z.string().min(1, "Routing Number é obrigatório"),
    bankAdditionalInfo: z.string().optional(),
    // Intermediary Bank
    hasIntermediaryBank: z.boolean().optional(),
    intermediaryBankSwift: z.string().optional(),
    intermediaryBankRouting: z.string().optional(),
    // Contact
    contactName: z.string().min(2, "Informe o nome do contato"),
    contactPhone: z.string().optional(),
    contactEmail: z
      .string()
      .email("E-mail inválido")
      .min(1, "Informe o e-mail do contato"),
    contactAdditionalInfo: z.string().optional(),
    // Attachments
    attachments: z
      .array(
        z.object({
          id: z.string().optional(),
          filename: z.string(),
          fileUrl: z.string().optional(),
          fileSize: z.number().optional(),
          fileType: z.string().optional(),
          uploadedAt: z.union([z.string(), z.date()]).optional(),
        }),
      )
      .optional(),
    // Background check
    isApproved: z.boolean(),
    approvedFrom: z.date().optional(),
    approvedUntil: z.date().optional(),
    requiresContract: z.boolean(),
  })
  .superRefine((values, ctx) => {
    // Validação: IBAN ou Número da Conta (pelo menos um obrigatório)
    const hasIban = values.ibanCode && values.ibanCode.length >= 12;
    const hasAccountNumber =
      values.accountNumber && values.accountNumber.trim().length > 0;

    if (!hasIban && !hasAccountNumber) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o IBAN ou o Número da Conta",
        path: ["ibanCode"],
      });
      ctx.addIssue({
        code: "custom",
        message: "Informe o IBAN ou o Número da Conta",
        path: ["accountNumber"],
      });
    }

    // Validação: Banco Intermediário
    if (values.hasIntermediaryBank) {
      if (
        !values.intermediaryBankSwift ||
        values.intermediaryBankSwift.trim().length === 0
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o SWIFT do banco intermediário",
          path: ["intermediaryBankSwift"],
        });
      }
      if (
        !values.intermediaryBankRouting ||
        values.intermediaryBankRouting.trim().length === 0
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o Routing Number do banco intermediário",
          path: ["intermediaryBankRouting"],
        });
      }
    }

    if (values.isApproved) {
      if (!values.approvedFrom) {
        ctx.addIssue({
          code: "custom",
          message: "Informe a data de aprovação",
          path: ["approvedFrom"],
        });
      }
      if (!values.approvedUntil) {
        ctx.addIssue({
          code: "custom",
          message: "Informe a data final",
          path: ["approvedUntil"],
        });
      }
    }

    if (
      values.approvedFrom &&
      values.approvedUntil &&
      values.approvedUntil < values.approvedFrom
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Data final deve ser maior que inicial",
        path: ["approvedUntil"],
      });
    }
  });

const supplierFormSchema = z.discriminatedUnion("supplierScope", [
  nationalSupplierSchema,
  internationalSupplierSchema,
]);

type SupplierFormSchema = z.infer<typeof supplierFormSchema>;

const NewSupplier = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SupplierFormSchema>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: defaultNationalValues,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const supplierScope = form.watch("supplierScope");
  const isNational = supplierScope === "NATIONAL";

  const handleScopeChange = (scope: SupplierScope) => {
    form.reset(
      scope === "NATIONAL" ? defaultNationalValues : defaultInternationalValues,
    );
  };

  const onSubmit = async (values: SupplierFormSchema) => {
    setIsSaving(true);

    const payload = values.supplierScope === "NATIONAL" ? values : values;

    console.debug("supplier:payload", payload);

    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success(t("suppliers.createdSuccess"));
    navigate("/suppliers");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/suppliers")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              {t("suppliers.newSupplier")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("suppliers.newSupplierDescription")}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe2 className="h-5 w-5 text-primary" />
                  {t("newSupplier.supplierScope")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="supplierScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={(value: SupplierScope) => {
                            handleScopeChange(value);
                            field.onChange(value);
                          }}
                          className="grid gap-3 md:grid-cols-2"
                        >
                          <Label
                            htmlFor="scope-national"
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:border-primary",
                              field.value === "NATIONAL" &&
                                "border-primary bg-primary/5",
                            )}
                          >
                            <RadioGroupItem
                              id="scope-national"
                              value="NATIONAL"
                              className="mt-0.5"
                            />
                            <div className="space-y-1">
                              <p className="font-medium">
                                {t("newSupplier.scopeNational")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t("newSupplier.scopeNationalDescription")}
                              </p>
                            </div>
                          </Label>

                          <Label
                            htmlFor="scope-international"
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:border-primary",
                              field.value === "INTERNATIONAL" &&
                                "border-primary bg-primary/5",
                            )}
                          >
                            <RadioGroupItem
                              id="scope-international"
                              value="INTERNATIONAL"
                              className="mt-0.5"
                            />
                            <div className="space-y-1">
                              <p className="font-medium">
                                {t("newSupplier.scopeInternational")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t("newSupplier.scopeInternationalDescription")}
                              </p>
                            </div>
                          </Label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {isNational ? (
              <NationalSupplierForm
                form={form as UseFormReturn<NationalSupplierFormData>}
                isSaving={isSaving}
              />
            ) : (
              <InternationalSupplierForm
                form={form as UseFormReturn<InternationalSupplierFormData>}
                isSaving={isSaving}
              />
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/suppliers")}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                {isSaving
                  ? t("newSupplier.savingSupplier")
                  : t("newSupplier.saveSupplier")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
};

export default NewSupplier;
