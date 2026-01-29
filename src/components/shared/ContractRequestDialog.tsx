import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Globe2, Building2, Send } from "lucide-react";
import { toast } from "sonner";
import { suppliers as suppliersMockData } from "@/data/mockdata";
import type { ContractRequestOrigin } from "@/types/domain";

export interface ContractRequestSupplierData {
  id: string;
  legalName: string;
  taxId: string;
  scope: "NATIONAL" | "INTERNATIONAL";
}

export interface ContractRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  origin: ContractRequestOrigin;
  /** Pre-selected supplier (readonly when provided) */
  supplier?: ContractRequestSupplierData;
  /** Called after successful submission */
  onSuccess?: () => void;
}

export function ContractRequestDialog({
  open,
  onOpenChange,
  origin,
  supplier: preselectedSupplier,
  onSuccess,
}: ContractRequestDialogProps) {
  const { t, language } = useLanguage();
  const [notes, setNotes] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState(
    preselectedSupplier?.id || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter suppliers that require contracts or allow all for legal screen
  const availableSuppliers = suppliersMockData.filter(
    (s) =>
      ("requiresContract" in s && s.requiresContract) ||
      origin === "legal_manual",
  );

  // Get selected supplier data
  const selectedSupplier = preselectedSupplier
    ? preselectedSupplier
    : availableSuppliers.find((s) => s.id === selectedSupplierId)
      ? {
          id: selectedSupplierId,
          legalName:
            availableSuppliers.find((s) => s.id === selectedSupplierId)
              ?.legalName || "",
          taxId:
            availableSuppliers.find((s) => s.id === selectedSupplierId)
              ?.taxId || "",
          scope: "NATIONAL" as const, // Default, would need to get from supplier data
        }
      : null;

  // Reset form when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setNotes("");
      setSelectedSupplierId(preselectedSupplier?.id || "");
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async () => {
    if (!selectedSupplier) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real app, this would create a ContractRequest:
    // {
    //   id: generateId(),
    //   code: generateNextCode(), // SC-XXXX-YYYY
    //   supplierId: selectedSupplier.id,
    //   supplierTaxId: selectedSupplier.taxId,
    //   supplierLegalName: selectedSupplier.legalName,
    //   supplierScope: selectedSupplier.scope,
    //   status: "pendente",
    //   origin: origin,
    //   requestedBy: currentUserId,
    //   requestedAt: new Date().toISOString(),
    //   notes: notes || undefined,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    // }

    setIsSubmitting(false);

    toast.success(
      language === "pt"
        ? "Solicitação de contrato enviada ao time de Legal"
        : "Contract request sent to the Legal team",
    );

    onSuccess?.();
    onOpenChange(false);
  };

  const getOriginLabel = () => {
    switch (origin) {
      case "supplier_registration":
        return language === "pt"
          ? "Cadastro de Fornecedor"
          : "Supplier Registration";
      case "po_creation":
        return language === "pt" ? "Criação de PO" : "PO Creation";
      case "legal_manual":
        return language === "pt" ? "Tela Legal" : "Legal Screen";
      default:
        return origin;
    }
  };

  const isSupplierEditable = origin === "legal_manual" && !preselectedSupplier;
  const canSubmit = selectedSupplier !== null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("contractRequest.dialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("contractRequest.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Origin Badge */}
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">
              {t("contractRequest.origin")}:
            </Label>
            <Badge variant="secondary">{getOriginLabel()}</Badge>
          </div>

          {/* Supplier Selection or Display */}
          <div className="space-y-2">
            <Label>
              {t("contractRequest.supplier")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            {isSupplierEditable ? (
              <Select
                value={selectedSupplierId}
                onValueChange={setSelectedSupplierId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("contractRequest.selectSupplier")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSuppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.tradeName || s.legalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 border rounded-md bg-muted/30">
                <p className="font-medium">
                  {preselectedSupplier?.legalName ||
                    selectedSupplier?.legalName}
                </p>
              </div>
            )}
          </div>

          {/* Supplier Details (readonly snapshot) */}
          {selectedSupplier && (
            <div className="grid grid-cols-2 gap-4">
              {/* Tax ID */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("contractRequest.taxId")}
                </Label>
                <div className="p-2 border rounded-md bg-muted/30 text-sm">
                  {selectedSupplier.taxId || "-"}
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("contractRequest.scope")}
                </Label>
                <div className="p-2 border rounded-md bg-muted/30 text-sm flex items-center gap-2">
                  {selectedSupplier.scope === "INTERNATIONAL" ? (
                    <>
                      <Globe2 className="h-4 w-4 text-muted-foreground" />
                      {t("contractRequest.international")}
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {t("contractRequest.national")}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="contract-request-notes">
              {t("contractRequest.notes")}
            </Label>
            <Textarea
              id="contract-request-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                language === "pt"
                  ? "Descreva detalhes do contrato necessário, tipo de serviço, prazo desejado, etc."
                  : "Describe contract details needed, type of service, desired term, etc."
              }
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting
              ? t("contractRequest.sending")
              : t("contractRequest.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
