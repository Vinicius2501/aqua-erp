import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POStatusBadge } from "@/components/shared/POStatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PurchaseOrderExpanded } from "@/types/domain";

interface POSelectorDialogProps {
  open: boolean;
  purchaseOrders: PurchaseOrderExpanded[];
  onSelect: (po: PurchaseOrderExpanded) => void;
  onCancel: () => void;
}

export const POSelectorDialog = ({
  open,
  purchaseOrders,
  onSelect,
  onCancel,
}: POSelectorDialogProps) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPOs = useMemo(() => {
    if (!searchTerm) return purchaseOrders;

    const term = searchTerm.toLowerCase();
    return purchaseOrders.filter(
      (po) =>
        po.externalId.toLowerCase().includes(term) ||
        po.beneficiary.name.toLowerCase().includes(term) ||
        po.supplier.legalName.toLowerCase().includes(term) ||
        po.status.toLowerCase().includes(term)
    );
  }, [purchaseOrders, searchTerm]);

  const formatCurrency = (value: number, currencyCode: string) => {
    return new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t("newPO.selectPOToCopy")}</DialogTitle>
          <DialogDescription>
            {t("newPO.selectPOToCopyDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("newPO.searchPO")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* PO List */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredPOs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("newPO.noPOsFound")}
              </div>
            ) : (
              filteredPOs.map((po) => (
                <button
                  key={po.id}
                  onClick={() => onSelect(po)}
                  className="w-full p-4 border rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">#{po.externalId}</span>
                        <POStatusBadge status={po.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            {t("poDetail.beneficiary")}:
                          </span>{" "}
                          {po.beneficiary.name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {t("poDetail.supplier")}:
                          </span>{" "}
                          {po.supplier.legalName}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {t("newPO.expenseNature")}:
                          </span>{" "}
                          {t(`expenseNature.${po.expenseNature.name}`)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {t("poDetail.totalValue")}:
                          </span>{" "}
                          <span className="font-medium">
                            {formatCurrency(po.totalValue, po.currency.code)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
