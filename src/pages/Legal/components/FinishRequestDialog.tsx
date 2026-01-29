import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ContractRequest } from "@/types/domain";

interface FinishRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: ContractRequest | null;
  finishContractFile: File | null;
  setFinishContractFile: (file: File | null) => void;
  finishValidUntil: string;
  setFinishValidUntil: (date: string) => void;
  finishHasValidity: boolean;
  setFinishHasValidity: (hasValidity: boolean) => void;
  onFinish: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function FinishRequestDialog({
  open,
  onOpenChange,
  selectedRequest,
  finishContractFile,
  setFinishContractFile,
  finishValidUntil,
  setFinishValidUntil,
  finishHasValidity,
  setFinishHasValidity,
  onFinish,
  fileInputRef,
}: FinishRequestDialogProps) {
  const { t } = useLanguage();

  const handleClose = () => {
    onOpenChange(false);
    setFinishContractFile(null);
    setFinishValidUntil("");
    setFinishHasValidity(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            {t("legal.finishRequest")}
          </DialogTitle>
          <DialogDescription>
            {t("legal.finishRequestDescription", {
              supplier: selectedRequest?.supplierLegalName || "",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              {t("legal.contractFile")} <span className="text-critical">*</span>
            </Label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFinishContractFile(file);
              }}
            />
            <Button
              variant="outline"
              className="w-full gap-2 h-16 border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              {finishContractFile ? (
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-success" />
                  <div className="text-left">
                    <p className="font-medium text-sm">
                      {finishContractFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(finishContractFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium text-sm">
                      {t("legal.clickToAttach")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX
                    </p>
                  </div>
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>
              {t("legal.validUntil")}{" "}
              {finishHasValidity && (
                <span className="text-critical">*</span>
              )}
            </Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="legal-has-validity"
                checked={finishHasValidity}
                onCheckedChange={(checked) => {
                  const hasValidity = !!checked;
                  setFinishHasValidity(hasValidity);
                  if (!hasValidity) setFinishValidUntil("");
                }}
              />
              <Label htmlFor="legal-has-validity" className="text-sm">
                {t("legal.hasValidity")}
              </Label>
            </div>
            <Input
              type="date"
              value={finishValidUntil}
              onChange={(e) => setFinishValidUntil(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              disabled={!finishHasValidity}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onFinish}
            disabled={!finishContractFile || !finishValidUntil}
            className="bg-success hover:bg-success/90"
          >
            {t("legal.finishAndAttach")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
