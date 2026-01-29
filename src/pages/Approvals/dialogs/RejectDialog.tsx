import { X, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PurchaseOrderExpanded } from '@/types/domain';

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPO: PurchaseOrderExpanded | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  formatCurrency: (value: number, currencyCode: string) => string;
  getCreatedByName: (userId: string) => string;
  renderAllocationTable: (po: PurchaseOrderExpanded) => React.ReactNode;
}

export function RejectDialog({
  open,
  onOpenChange,
  selectedPO,
  reason,
  onReasonChange,
  onConfirm,
  formatCurrency,
  getCreatedByName,
  renderAllocationTable,
}: RejectDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border w-full max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            {t('approvals.rejectPO')}
          </DialogTitle>
          <DialogDescription className="text-text-secondary wrap-break-word">
            {t('approvals.rejectMessage')} {selectedPO?.externalId}.{' '}
            {t('approvals.informReason')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-hidden min-w-0">
          <div className="p-3 rounded-lg bg-subtle-fill border border-border space-y-2 min-w-0">
            <div className="flex justify-between items-center gap-2">
              <span className="text-text-secondary text-sm shrink-0">
                {t('approvals.subtype')}:
              </span>
              <span className="text-text-primary font-medium text-sm truncate">
                {selectedPO?.subtypeOfPO === 'produto'
                  ? t('newPO.subtypeProduct')
                  : selectedPO?.subtypeOfPO === 'servico'
                    ? t('newPO.subtypeService')
                    : t('newPO.subtypeDefault')}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-text-secondary text-sm shrink-0">
                {t('approvals.expenseNature')}:
              </span>
              <span className="text-text-primary font-medium text-sm truncate">
                {selectedPO?.expenseNature?.name === 'deal_expense'
                  ? t('newPO.dealExpense')
                  : t('newPO.ongoing')}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-text-secondary text-sm shrink-0">
                {t('approvals.value')}:
              </span>
              <span className="text-text-primary font-semibold text-sm truncate">
                {selectedPO &&
                  formatCurrency(
                    selectedPO.totalValue,
                    selectedPO.currency?.code || 'BRL'
                  )}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-text-secondary text-sm shrink-0">
                {t('approvals.supplier')}:
              </span>
              <span className="text-text-primary font-medium text-sm truncate">
                {selectedPO?.supplier?.tradeName ||
                  selectedPO?.supplier?.legalName ||
                  '-'}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-text-secondary text-sm shrink-0">
                {t('approvals.requester')}:
              </span>
              <span className="text-text-primary font-medium text-sm truncate">
                {selectedPO && getCreatedByName(selectedPO.createdBy)}
              </span>
            </div>
          </div>
          {selectedPO && renderAllocationTable(selectedPO)}

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-text-primary">
              {t('approvals.reason')} <span className="text-critical">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder={t('approvals.rejectPlaceholder')}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="min-h-30 bg-input border-border text-text-primary placeholder:text-text-secondary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {!reason.trim() && (
              <p className="text-xs text-critical flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {t('approvals.reasonRequired')}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-text-secondary hover:text-text-primary"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!reason.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white disabled:text-white/70"
          >
            <X className="h-4 w-4 mr-2" />
            {t('common.reject')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
