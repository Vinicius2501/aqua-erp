import { Copy, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type CreationMode = "new" | "copy";

interface POCreationModeDialogProps {
  open: boolean;
  onSelect: (mode: CreationMode) => void;
  onClose?: () => void;
}

export const POCreationModeDialog = ({
  open,
  onSelect,
  onClose,
}: POCreationModeDialogProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("newPO.selectCreationMode")}</DialogTitle>
          <DialogDescription>
            {t("newPO.selectCreationModeDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto w-full flex flex-col items-start gap-2 p-4 hover:bg-primary/5 hover:border-primary"
            onClick={() => onSelect("new")}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 shrink-0" />
              <span className="font-semibold">{t("newPO.createNewPO")}</span>
            </div>
            <span className="text-sm text-muted-foreground text-left whitespace-normal">
              {t("newPO.createNewPODescription")}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto w-full flex flex-col items-start gap-2 p-4 hover:bg-primary/5 hover:border-primary"
            onClick={() => onSelect("copy")}
          >
            <div className="flex items-center gap-2">
              <Copy className="h-5 w-5 shrink-0" />
              <span className="font-semibold">{t("newPO.createFromCopy")}</span>
            </div>
            <span className="text-sm text-muted-foreground text-left whitespace-normal">
              {t("newPO.createFromCopyDescription")}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
