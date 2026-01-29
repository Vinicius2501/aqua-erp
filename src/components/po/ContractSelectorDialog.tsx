import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { SupplierDocument } from "@/types/domain";
import { users } from "@/data/mockdata";

interface ContractVersion {
  document: SupplierDocument;
  version: number;
  isExpired: boolean;
  isNotYetValid: boolean;
  isWithinValidity: boolean;
}

export interface ContractSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contracts: SupplierDocument[];
  poNumber?: string;
  onSelect: (contractId: string) => void;
}

export function ContractSelectorDialog({
  open,
  onOpenChange,
  contracts,
  poNumber,
  onSelect,
}: ContractSelectorDialogProps) {
  const { t, language } = useLanguage();
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const getUserName = (userId?: string) => {
    if (!userId) return "-";
    return users.find((user) => user.id === userId)?.name || userId;
  };

  // Process contracts into versions with status info
  const now = new Date();
  const contractVersions: ContractVersion[] = contracts
    .map((contract, index) => {
      const validFromDate = contract.validFrom
        ? new Date(contract.validFrom)
        : null;
      const validUntilDate = contract.validUntil
        ? new Date(contract.validUntil)
        : null;
      const hasValidity =
        contract.hasValidity ?? Boolean(validFromDate || validUntilDate);
      const isExpired =
        hasValidity && validUntilDate ? validUntilDate < now : false;
      const isNotYetValid =
        hasValidity && validFromDate ? validFromDate > now : false;
      const hasValidityDates = Boolean(validFromDate || validUntilDate);
      const isWithinValidity = hasValidity
        ? hasValidityDates && !isExpired && !isNotYetValid
        : true;

      return {
        document: contract,
        version: contracts.length - index, // Version number (newest = highest)
        isExpired,
        isNotYetValid,
        isWithinValidity,
      };
    })
    .sort((a, b) => a.version - b.version); // Sort by version ascending (1, 2, 3...)
  const selectedContract = contractVersions.find(
    (cv) => cv.document.id === selectedContractId
  );

  const handleConfirm = () => {
    if (selectedContractId && selectedContract?.isWithinValidity) {
      onSelect(selectedContractId);
      onOpenChange(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === "pt" ? "pt-BR" : "en-US",
    );
  };

  const formatValidity = (validFrom?: string, validUntil?: string) => {
    if (validFrom && validUntil) {
      return `${formatDate(validFrom)} - ${formatDate(validUntil)}`;
    }
    if (validUntil) return formatDate(validUntil);
    if (validFrom) return formatDate(validFrom);
    return "-";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            {t("contractSelector.title")}
          </DialogTitle>
          <DialogDescription>
            {poNumber
              ? t("contractSelector.descriptionWithPO", { poNumber })
              : t("contractSelector.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          {/* Contract Versions Label */}
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("contractSelector.contractVersions")}
            </span>
          </div>

          {/* Contract Versions List */}
          <div className="max-h-88 overflow-y-auto pr-2">
            <div className="space-y-3">
              {contractVersions.map((cv) => (
                <div
                  key={cv.document.id}
                  onClick={() => {
                    if (cv.isWithinValidity) {
                      setSelectedContractId(cv.document.id);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg transition-all",
                    !cv.isWithinValidity
                      ? "opacity-60 cursor-not-allowed bg-muted/30"
                      : "cursor-pointer hover:border-primary/50",
                    cv.isWithinValidity && selectedContractId === cv.document.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    {/* Version Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {t("contractSelector.contractNumber")} {cv.version}
                      </span>
                      {cv.isWithinValidity && (
                        <Badge
                          variant="default"
                          className="bg-success text-success-foreground text-xs px-2 py-0"
                        >
                          {t("contractSelector.current")}
                        </Badge>
                      )}
                      {cv.isExpired && (
                        <Badge variant="destructive" className="text-xs px-2 py-0">
                          {t("legal.expired")}
                        </Badge>
                      )}
                    </div>

                    {/* File Name */}
                    <p className="font-medium text-sm truncate">
                      {cv.document.fileName}
                    </p>

                    {/* File Info */}
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("contractSelector.uploadedBy")}:{" "}
                      {getUserName(cv.document.uploadedBy)}{" "}
                      {t("contractSelector.uploadedOn")}{" "}
                      {cv.document.createdAt
                        ? formatDate(cv.document.createdAt)
                        : "-"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("legal.validity")}:{" "}
                      {cv.document.hasValidity
                        ? formatValidity(
                            cv.document.validFrom,
                            cv.document.validUntil,
                          )
                        : t("legal.noExpiry")}
                    </p>
                  </div>

                  {cv.isWithinValidity &&
                    selectedContractId === cv.document.id && (
                    <div className="ml-4 shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedContractId || !selectedContract?.isWithinValidity}
          >
            {t("contractSelector.linkContract")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
