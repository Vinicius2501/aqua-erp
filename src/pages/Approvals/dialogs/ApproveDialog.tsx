import { Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PurchaseOrderExpanded } from "@/types/domain";

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPO: PurchaseOrderExpanded | null;
  approvalComment: string;
  onApprovalCommentChange: (comment: string) => void;
  onConfirm: () => void;
  formatCurrency: (value: number, currencyCode: string) => string;
  getCreatedByName: (userId: string) => string;
  renderAllocationTable: (po: PurchaseOrderExpanded) => React.ReactNode;
}

export function ApproveDialog({
  open,
  onOpenChange,
  selectedPO,
  approvalComment,
  onApprovalCommentChange,
  onConfirm,
  formatCurrency,
  getCreatedByName,
  renderAllocationTable,
}: ApproveDialogProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border max-w-[calc(100vw-2rem)] sm:max-w-[38.4rem] max-h-[90vh] overflow-y-auto">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-text-secondary hover:text-text-primary"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-text-primary">
            {t("approvals.confirmApproval")}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-text-secondary space-y-3 overflow-hidden">
              <p>
                {t("approvals.confirmApprovalMessage")}{" "}
                <span className="font-semibold text-text-primary">
                  {selectedPO?.externalId}
                </span>
                ?
              </p>
              <div className="p-3 rounded-lg bg-subtle-fill border border-border space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-text-secondary text-sm shrink-0">
                    {t("approvals.subtype")}:
                  </span>
                  <span className="text-text-primary font-medium text-sm truncate">
                    {selectedPO?.subtypeOfPO === "produto"
                      ? t("newPO.subtypeProduct")
                      : selectedPO?.subtypeOfPO === "servico"
                        ? t("newPO.subtypeService")
                        : t("newPO.subtypeDefault")}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-text-secondary text-sm shrink-0">
                    {t("approvals.expenseNature")}:
                  </span>
                  <span className="text-text-primary font-medium text-sm truncate">
                    {selectedPO?.expenseNature?.name === "deal_expense"
                      ? t("newPO.dealExpense")
                      : t("newPO.ongoing")}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-text-secondary text-sm shrink-0">
                    {t("approvals.value")}:
                  </span>
                  <span className="text-text-primary font-semibold text-sm truncate">
                    {selectedPO &&
                      formatCurrency(
                        selectedPO.totalValue,
                        selectedPO.currency?.code || "BRL",
                      )}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-text-secondary text-sm shrink-0">
                    {t("approvals.supplier")}:
                  </span>
                  <span className="text-text-primary font-medium text-sm truncate">
                    {selectedPO?.supplier?.tradeName ||
                      selectedPO?.supplier?.legalName ||
                      "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-text-secondary text-sm shrink-0">
                    {t("approvals.requester")}:
                  </span>
                  <span className="text-text-primary font-medium text-sm truncate">
                    {selectedPO && getCreatedByName(selectedPO.createdBy)}
                  </span>
                </div>
              </div>
              {selectedPO && renderAllocationTable(selectedPO)}
              <div className="space-y-2 pt-2">
                <Label
                  htmlFor="approval-comment"
                  className="text-text-secondary"
                >
                  {t("approvals.comment")}{" "}
                  <span className="text-text-tertiary">
                    ({t("common.optional")})
                  </span>
                </Label>
                <Textarea
                  id="approval-comment"
                  placeholder={t("approvals.commentPlaceholder")}
                  value={approvalComment}
                  onChange={(e) => onApprovalCommentChange(e.target.value)}
                  className="bg-subtle-fill border-border text-text-primary placeholder:text-text-tertiary min-h-20 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-text-secondary hover:text-text-primary">
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-success hover:bg-success/90 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            {t("common.approve")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
