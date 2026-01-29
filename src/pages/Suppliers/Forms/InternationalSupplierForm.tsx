import React, { useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import {
  Building2,
  CalendarIcon,
  Globe,
  MapPin,
  Paperclip,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { currencies } from "@/data/mockdata";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  InternationalSupplierFormData,
  SupplierTag,
} from "@/types/supplier";
import { SUPPLIER_TAG_LABELS } from "@/types/supplier";
import { RequiredMark } from "@/components/shared/RequiredMark";

interface AttachmentState {
  id: string;
  filename: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt: Date;
  file?: File;
}

interface InternationalSupplierFormProps {
  form: UseFormReturn<InternationalSupplierFormData>;
  isSaving: boolean;
}

export function InternationalSupplierForm({
  form,
}: InternationalSupplierFormProps) {
  const { t, language } = useLanguage();
  const [attachments, setAttachments] = useState<AttachmentState[]>([]);

  const isApproved = form.watch("isApproved") ?? false;
  const ibanCode = form.watch("ibanCode");
  const accountNumber = form.watch("accountNumber");
  const hasIntermediaryBank = form.watch("hasIntermediaryBank") ?? false;

  // Mostra asterisco apenas se ambos IBAN e Account Number estiverem vazios/inválidos
  const showIbanAccountRequired = !(
    (ibanCode && ibanCode.length >= 12) ||
    (accountNumber && accountNumber.trim().length > 0)
  );

  useEffect(() => {
    form.setValue(
      "attachments",
      attachments.map((item) => ({
        id: item.id,
        filename: item.filename,
        fileUrl: item.fileUrl,
        fileSize: item.fileSize,
        fileType: item.fileType,
        uploadedAt: item.uploadedAt,
      })),
    );
  }, [attachments, form]);

  const dateLocale = useMemo(
    () => (language === "pt" ? ptBR : enUS),
    [language],
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!files) return;

    const uploaded: AttachmentState[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
      file,
      fileUrl: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...uploaded]);
    event.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="space-y-6">
        {/* ========== GENERAL DATA ========== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              {t("internationalSupplier.generalData")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Linha 1: Tax ID */}
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem className="md:max-w-xs">
                  <FormLabel>{t("internationalSupplier.taxId")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("internationalSupplier.taxIdPlaceholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Linha 2: Razão Social, Nome Fantasia */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.legalName")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.legalNamePlaceholder",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tradeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.tradeName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.tradeNamePlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 3: Tipo de Oferta, Perfil, Tags */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="offeringType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.offeringType")}
                      <RequiredMark />
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              "internationalSupplier.selectOfferingType",
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="produto">
                          {t("newSupplier.offeringTypeProduct")}
                        </SelectItem>
                        <SelectItem value="servico">
                          {t("newSupplier.offeringTypeService")}
                        </SelectItem>
                        <SelectItem value="produtos_e_servicos">
                          {t("newSupplier.offeringTypeBoth")}
                        </SelectItem>
                        <SelectItem value="funcionario">
                          {t("newSupplier.offeringTypeEmployee")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newSupplier.supplierType")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fornecedor">
                          {t("newSupplier.supplierTypeSupplier")}
                        </SelectItem>
                        <SelectItem value="cliente">
                          {t("newSupplier.supplierTypeClient")}
                        </SelectItem>
                        <SelectItem value="fornecedor_cliente">
                          {t("newSupplier.supplierTypeBoth")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newSupplier.tags")}</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentTags = field.value || [];
                        if (!currentTags.includes(value as SupplierTag)) {
                          field.onChange([
                            ...currentTags,
                            value as SupplierTag,
                          ]);
                        }
                      }}
                      value=""
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("newSupplier.tagsPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SUPPLIER_TAG_LABELS).map(
                          ([key, labels]) => (
                            <SelectItem key={key} value={key}>
                              {labels.pt}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags Selecionadas */}
            {(form.watch("tags")?.length ?? 0) > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    {t("newSupplier.selectedTags")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("tags")?.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                      >
                        {SUPPLIER_TAG_LABELS[tag as SupplierTag].pt}
                        <button
                          type="button"
                          onClick={() => {
                            const currentTags = form.getValues("tags") || [];
                            form.setValue(
                              "tags",
                              currentTags.filter((t: string) => t !== tag),
                            );
                          }}
                          className="hover:text-primary/80"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ========== ADDRESS ========== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              {t("internationalSupplier.address")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Linha 1: Código Postal */}
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem className="md:max-w-xs">
                  <FormLabel>{t("internationalSupplier.postalCode")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "internationalSupplier.postalCodePlaceholder",
                      )}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Linha 2: Logradouro, Número, Complemento */}
            <div className="grid gap-4 md:grid-cols-6">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>{t("internationalSupplier.street")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.streetPlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>{t("internationalSupplier.number")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.numberPlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complement"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      {t("internationalSupplier.complement")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.complementPlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 3: Bairro, Cidade, Estado/Província, País */}
            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("internationalSupplier.district")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.districtPlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("internationalSupplier.city")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("internationalSupplier.cityPlaceholder")}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("internationalSupplier.state")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.statePlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("internationalSupplier.country")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.countryPlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ========== PAYMENT (ABROAD) ========== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              {t("internationalSupplier.payment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Linha 1: Banco, Titular da Conta, SWIFT */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.bankName")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.bankNamePlaceholder",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountHolder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.accountHolder")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.accountHolderPlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="swiftCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.swiftCode")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XXXXUSXX"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 2: IBAN, Número da Conta, Moeda, Routing */}
            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="ibanCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.ibanCode")}
                      {showIbanAccountRequired && (
                        <span className="text-xs text-muted-foreground ml-1">
                          *
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XX00 0000 0000 0000 0000 00"
                        {...field}
                        value={field.value || ""}
                      />
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
                    <FormLabel>
                      {t("internationalSupplier.accountNumber")}
                      {showIbanAccountRequired && (
                        <span className="text-xs text-muted-foreground ml-1">
                          *
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.accountNumberPlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("internationalSupplier.currency")}</FormLabel>
                    {/* TODO: Migrar para buscar moedas via API endpoint */}
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.code}>
                            {currency.code} - {currency.name}
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
                name="routingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.routingNumber")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.intermediaryBankRoutingPlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Banco Intermediário */}
            <FormField
              control={form.control}
              name="hasIntermediaryBank"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>
                      {t("internationalSupplier.hasIntermediaryBank")}
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "internationalSupplier.hasIntermediaryBankDescription",
                      )}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {hasIntermediaryBank && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="intermediaryBankSwift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("internationalSupplier.intermediaryBankSwift")}
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "internationalSupplier.intermediaryBankSwiftPlaceholder",
                          )}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intermediaryBankRouting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("internationalSupplier.intermediaryBankRouting")}
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "internationalSupplier.intermediaryBankRoutingPlaceholder",
                          )}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Linha 3: Informações Adicionais */}
            <FormField
              control={form.control}
              name="bankAdditionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("internationalSupplier.bankAdditionalInfo")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "internationalSupplier.bankAdditionalInfoPlaceholder",
                      )}
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ========== CONTACT ========== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              {t("internationalSupplier.contact")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.contactName")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.contactNamePlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.contactPhone")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "internationalSupplier.contactPhonePlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("internationalSupplier.contactEmail")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t(
                          "internationalSupplier.contactEmailPlaceholder",
                        )}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactAdditionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("internationalSupplier.contactAdditionalInfo")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "internationalSupplier.contactAdditionalInfoPlaceholder",
                      )}
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ========== ATTACHMENTS ========== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Paperclip className="h-5 w-5 text-primary" />
              {t("newSupplier.generalAttachments")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="int-file-upload"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="int-file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("newSupplier.uploadFiles")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("newSupplier.fileTypes")}
                </span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg bg-muted/60 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.fileSize)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(file.id)}
                    >
                      {t("newSupplier.removeFile")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========== BACKGROUND CHECK (HOMOLOGATION) ========== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {t("newSupplier.homologation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isApproved"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-4">
                  <div className="space-y-1">
                    <FormLabel>{t("newSupplier.approvedSupplier")}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t("newSupplier.approvedSupplierDescription")}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isApproved && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="approvedFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("newSupplier.validityStart")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yyyy", {
                                    locale: dateLocale,
                                  })
                                : t("newSupplier.selectDate")}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={dateLocale}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approvedUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("newSupplier.validityEnd")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yyyy", {
                                    locale: dateLocale,
                                  })
                                : t("newSupplier.selectDate")}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={dateLocale}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Separator className="my-4" />

            <FormField
              control={form.control}
              name="requiresContract"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-4">
                  <div className="space-y-1">
                    <FormLabel>{t("newSupplier.requiresContract")}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t("newSupplier.requiresContractDescription")}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
