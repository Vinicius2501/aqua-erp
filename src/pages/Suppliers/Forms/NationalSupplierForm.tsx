import React, { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Building2,
  CalendarIcon,
  Landmark,
  MapPin,
  Paperclip,
  Search,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  NationalSupplierFormData,
  SupplierAttachment,
  SupplierTag,
} from "@/types/supplier";
import { SUPPLIER_TAG_LABELS } from "@/types/supplier";
import { RequiredMark } from "@/components/shared/RequiredMark";

type AttachmentState = SupplierAttachment & { file?: File };

interface NationalSupplierFormProps {
  form: UseFormReturn<NationalSupplierFormData>;
  isSaving: boolean;
}

export function NationalSupplierForm({ form }: NationalSupplierFormProps) {
  const { t, language } = useLanguage();
  const [attachments, setAttachments] = useState<AttachmentState[]>([]);
  const [cnpjConsultDialogOpen, setCnpjConsultDialogOpen] = useState(false);
  const [cnpjToConsult, setCnpjToConsult] = useState("");
  const [cepConsultDialogOpen, setCepConsultDialogOpen] = useState(false);
  const [cepToConsult, setCepToConsult] = useState("");

  const dateLocale = useMemo(
    () => (language === "pt" ? ptBR : enUS),
    [language],
  );

  const isApproved = form.watch("isApproved") ?? false;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploaded: AttachmentState[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      fileUrl: URL.createObjectURL(file),
      file,
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

  const handleCnpjConsult = () => {
    // TODO: Implementar consulta à Receita Federal
    console.log("Consultando CNPJ:", cnpjToConsult);
    toast.info("Função de consulta será implementada em breve");
    setCnpjConsultDialogOpen(false);
    setCnpjToConsult("");
  };

  const handleCepConsult = () => {
    // TODO: Implementar consulta de CEP (ViaCEP, etc)
    console.log("Consultando CEP:", cepToConsult);
    toast.info("Função de consulta de CEP será implementada em breve");
    setCepConsultDialogOpen(false);
    setCepToConsult("");
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              {t("newSupplier.generalData")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem className="w-full md:max-w-xs">
                    <FormLabel>
                      {t("newSupplier.documentType")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CNPJ">CNPJ</SelectItem>
                          <SelectItem value="CPF">CPF</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCnpjConsultDialogOpen(true)}
                title={t("newSupplier.consultCNPJ")}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("documentType") === "CPF" ? "CPF" : "CNPJ"}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          form.watch("documentType") === "CPF"
                            ? "000.000.000-00"
                            : "00.000.000/0000-00"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("newSupplier.legalName")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.legalNamePlaceholder")}
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
                    <FormLabel>{t("newSupplier.tradeName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.tradeNamePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div
              className={cn(
                "grid gap-4",
                form.watch("documentType") === "CNPJ"
                  ? "md:grid-cols-4"
                  : "md:grid-cols-3",
              )}
            >
              <FormField
                control={form.control}
                name="offeringType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("newSupplier.offeringType")}
                      <RequiredMark />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("common.select")} />
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
                    <FormLabel>
                      {t("newSupplier.supplierType")}
                      <RequiredMark />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
              {form.watch("documentType") === "CNPJ" ? (
                <FormField
                  control={form.control}
                  name="simplesNacional"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <FormLabel>{t("newSupplier.simplesNacional")}</FormLabel>
                      <div className="flex items-center gap-2 h-9 px-3 rounded-md border">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm text-muted-foreground">
                          {field.value ? t("common.yes") : t("common.no")}
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
              ) : (
                <div />
              )}
            </div>

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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              {t("newSupplier.address")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="w-full md:max-w-xs">
                    <FormLabel>
                      {t("newSupplier.cep")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.cepPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCepConsultDialogOpen(true)}
                title={t("newSupplier.consultCEP")}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-6">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>
                      {t("newSupplier.street")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.streetPlaceholder")}
                        {...field}
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
                    <FormLabel>
                      {t("newSupplier.number")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.numberPlaceholder")}
                        {...field}
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
                    <FormLabel>{t("newSupplier.complement")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.complementPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("newSupplier.neighborhood")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.neighborhoodPlaceholder")}
                        {...field}
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
                    <FormLabel>
                      {t("newSupplier.city")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.cityPlaceholder")}
                        {...field}
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
                    <FormLabel>
                      {t("newSupplier.state")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        maxLength={2}
                        placeholder={t("newSupplier.statePlaceholder")}
                        {...field}
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
                    <FormLabel>{t("newSupplier.country")}</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Landmark className="h-5 w-5 text-primary" />
              {t("newSupplier.payment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("newSupplier.bank")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.bankPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("newSupplier.agency")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.agencyPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("newSupplier.account")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.accountPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountType"
                render={() => (
                  <FormItem>
                    <FormLabel>{t("newSupplier.accountType")}</FormLabel>
                    <FormControl>
                      <Input
                        value={t("newSupplier.accountTypeCurrent")}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              {t("newSupplier.contact")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("newSupplier.contactName")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.contactNamePlaceholder")}
                        {...field}
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
                      {t("newSupplier.contactEmail")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.contactEmailPlaceholder")}
                        {...field}
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
                      {t("newSupplier.contactPhone")}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("newSupplier.contactPhonePlaceholder")}
                        {...field}
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
                    {t("newSupplier.contactAdditionalInfo")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "newSupplier.contactAdditionalInfoPlaceholder",
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
                id="file-upload"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
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

      {/* CNPJ Consult Dialog */}
      <Dialog
        open={cnpjConsultDialogOpen}
        onOpenChange={setCnpjConsultDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("newSupplier.consultCNPJTitle")}</DialogTitle>
            <DialogDescription>
              {t("newSupplier.consultCNPJDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj-consult">CNPJ</Label>
              <Input
                id="cnpj-consult"
                placeholder="00.000.000/0000-00"
                value={cnpjToConsult}
                onChange={(e) => setCnpjToConsult(e.target.value)}
                maxLength={14}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCnpjConsultDialogOpen(false);
                setCnpjToConsult("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleCnpjConsult}
              disabled={!cnpjToConsult.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              {t("newSupplier.consultCNPJButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CEP Consult Dialog */}
      <Dialog
        open={cepConsultDialogOpen}
        onOpenChange={setCepConsultDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("newSupplier.consultCEPTitle")}</DialogTitle>
            <DialogDescription>
              {t("newSupplier.consultCEPDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cep-consult">CEP</Label>
              <Input
                id="cep-consult"
                placeholder="00000-000"
                value={cepToConsult}
                onChange={(e) => setCepToConsult(e.target.value)}
                maxLength={9}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCepConsultDialogOpen(false);
                setCepToConsult("");
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleCepConsult}
              disabled={!cepToConsult.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              {t("newSupplier.consultCEPButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
