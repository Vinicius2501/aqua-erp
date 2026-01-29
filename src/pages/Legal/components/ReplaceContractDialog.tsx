import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import type { SupplierDocument } from "@/types/domain";

interface ReplaceContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContract: SupplierDocument | null;
  onClose: () => void;
}

export function ReplaceContractDialog({
  open,
  onOpenChange,
  selectedContract,
  onClose,
}: ReplaceContractDialogProps) {
  const { t } = useLanguage();

  const handleReplace = () => {
    toast.success(t("legal.contractReplaced"));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {t("legal.replaceContract")}
          </DialogTitle>
          <DialogDescription>
            {t("legal.replaceContractDescription", {
              fileName: selectedContract?.fileName || "",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              {t("legal.newContractFile")}{" "}
              <span className="text-critical">*</span>
            </Label>
            <Button
              variant="outline"
              className="w-full gap-2 h-16 border-dashed"
              onClick={handleReplace}
            >
              <Upload className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium text-sm">
                  {t("legal.clickToAttach")}
                </p>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX</p>
              </div>
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t("legal.newValidUntil")}</Label>
            <Input type="date" min={new Date().toISOString().split("T")[0]} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button>{t("legal.replaceAndSave")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
