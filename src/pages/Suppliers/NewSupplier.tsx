import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Save,
  MapPin,
  Landmark,
  User,
  ShieldCheck,
  Paperclip,
  X,
  Upload,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

import { useLanguage } from "@/contexts/LanguageContext";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const supplierFormSchema = z.object({
  cnpj: z.string().min(14, "CNPJ inválido").max(18),
  legalName: z.string().min(2, "Razão social é obrigatória"),
  tradeName: z.string().min(2, "Nome fantasia é obrigatório"),
  generalEmail: z.string().email("Email inválido"),
  phone: z.string().optional(),
  companyType: z.string().optional(),
  companySize: z.string().optional(),
  offeringType: z
    .enum(["produto", "servico", "produtos_e_servicos"])
    .optional(),
  // Endereço
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  // Informações Bancárias
  bank: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  accountType: z.enum(["checking", "savings"]).optional(),
  pixKey: z.string().optional(),
  // Contato Principal
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  // Adicional
  additionalInfo: z.string().optional(),
  // Aprovação
  isApproved: z.boolean().optional(),
  approvedAt: z.date().optional(),
  approvalValidUntil: z.date().optional(),
});

type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
}

const NewSupplier = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      cnpj: "",
      legalName: "",
      tradeName: "",
      generalEmail: "",
      phone: "",
      companyType: "",
      companySize: "",
      offeringType: undefined,
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      bank: "",
      agency: "",
      account: "",
      accountType: undefined,
      pixKey: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      additionalInfo: "",
      isApproved: false,
      approvedAt: undefined,
      approvalValidUntil: undefined,
    },
  });

  const watchIsApproved = form.watch("isApproved");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    // Simular chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success(t("suppliers.createdSuccess"));
    navigate("/suppliers");
  };

  const dateLocale = language === "pt" ? ptBR : enUS;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-semibold text-foreground">
                {t("suppliers.newSupplier")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("suppliers.newSupplierDescription")}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Card de Informações Básicas */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  {t("suppliers.basicInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("suppliers.cnpj")}</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.companyName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("suppliers.companyNamePlaceholder")}
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
                        <FormLabel>{t("suppliers.tradeName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("suppliers.tradeNamePlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="generalEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contato@empresa.com.br"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.phone")}</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="companyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplierDetail.companyType")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              language === "pt"
                                ? "Ex: LTDA, S/A"
                                : "E.g., LLC, Corp"
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
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplierDetail.companySize")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  language === "pt"
                                    ? "Selecione o porte"
                                    : "Select size"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="offeringType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("supplierDetail.offeringType")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  language === "pt"
                                    ? "Selecione o tipo"
                                    : "Select type"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card de Endereço */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  {t("suppliers.address")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="max-w-50">
                      <FormLabel>{t("suppliers.zipCode")}</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("suppliers.street")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("suppliers.streetPlaceholder")}
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
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.number")}</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.complement")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("suppliers.complementPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.neighborhood")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("suppliers.neighborhoodPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.city")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("suppliers.cityPlaceholder")}
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
                        <FormLabel>{t("suppliers.state")}</FormLabel>
                        <FormControl>
                          <Input placeholder="SP" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card de Informações Bancárias */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Landmark className="h-5 w-5 text-primary" />
                  {t("suppliers.bankInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.bank")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("suppliers.bankPlaceholder")}
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.accountType")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("suppliers.selectAccountType")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="checking">
                              {t("suppliers.checking")}
                            </SelectItem>
                            <SelectItem value="savings">
                              {t("suppliers.savings")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="agency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.agency")}</FormLabel>
                        <FormControl>
                          <Input placeholder="0000" {...field} />
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
                        <FormLabel>{t("suppliers.account")}</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pixKey"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>{t("suppliers.pixKey")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("suppliers.pixKeyPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card de Contato */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  {t("newSupplier.contact")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("supplierDetail.contactName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            language === "pt"
                              ? "Nome do contato principal"
                              : "Primary contact name"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("suppliers.phone")}</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
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
                        <FormLabel>{t("suppliers.email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contato@empresa.com.br"
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
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("supplierDetail.additionalInfo")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            language === "pt"
                              ? "Informações adicionais sobre o fornecedor..."
                              : "Additional information about the supplier..."
                          }
                          className="min-h-25"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card de Status de Aprovação */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {t("supplierDetail.approvalStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isApproved"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("supplierDetail.isApproved")}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {language === "pt"
                            ? "Marque se o fornecedor está homologado para prestação de serviços"
                            : "Check if the supplier is approved for providing services"}
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

                {watchIsApproved && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <FormField
                      control={form.control}
                      name="approvedAt"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            {t("supplierDetail.approvedAt")}
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", {
                                      locale: dateLocale,
                                    })
                                  ) : (
                                    <span>
                                      {language === "pt"
                                        ? "Selecione a data"
                                        : "Select date"}
                                    </span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                      name="approvalValidUntil"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            {t("supplierDetail.validUntil")}
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", {
                                      locale: dateLocale,
                                    })
                                  ) : (
                                    <span>
                                      {language === "pt"
                                        ? "Selecione a data"
                                        : "Select date"}
                                    </span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
              </CardContent>
            </Card>

            {/* Card de Anexos */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Paperclip className="h-5 w-5 text-primary" />
                  {t("newSupplier.attachments")}
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
                      {language === "pt"
                        ? "Clique para anexar arquivos ou arraste e solte"
                        : "Click to attach files or drag and drop"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, XLS, JPG, PNG
                    </span>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/suppliers")}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
};

export default NewSupplier;
