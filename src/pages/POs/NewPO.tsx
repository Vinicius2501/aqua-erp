import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Package, Receipt } from "lucide-react";
import type { POType, PurchaseOrderExpanded } from "@/types/domain";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProductsServicesForm from "@/components/po/ProductsServicesForm";
import { POCreationModeDialog } from "@/components/po/POCreationModeDialog";
import { POSelectorDialog } from "@/components/po/POSelectorDialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { purchaseOrders as mockPurchaseOrders } from "@/data/mockdata";

const NewPO = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const poType = searchParams.get("type") as POType;

  const [showModeDialog, setShowModeDialog] = useState(true);
  const [showPOSelector, setShowPOSelector] = useState(false);
  const [selectedPOToCopy, setSelectedPOToCopy] =
    useState<PurchaseOrderExpanded | null>(null);
  const [originalPONumber, setOriginalPONumber] = useState<string>("");
  const [isLoadingPO, setIsLoadingPO] = useState(false);

  const poTypesIcons = {
    produtos_servicos: <Package />,
    reembolso: <Receipt />,
  };

  const handleModeSelect = (mode: "new" | "copy") => {
    setShowModeDialog(false);
    if (mode === "copy") {
      setShowPOSelector(true);
    }
  };

  const handlePOSelect = async (po: PurchaseOrderExpanded) => {
    setShowPOSelector(false);
    setIsLoadingPO(true);

    try {
      // Simular chamada à API para obter dados completos da PO
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simular busca da PO completa na API
      const fullPO = mockPurchaseOrders.find((p) => p.id === po.id);

      if (!fullPO) {
        toast.error(t("newPO.poNotFound"), {
          description: t("newPO.poNotFoundDescription"),
        });
        setShowModeDialog(true);
        return;
      }

      // Armazenar número original antes de zerar
      setOriginalPONumber(fullPO.externalId);

      // Preparar dados para cópia
      const poDataForCopy = getPODataForCopy(fullPO);

      console.log("Original PO:", fullPO);
      console.log("PO Data for Copy:", poDataForCopy);

      setSelectedPOToCopy(poDataForCopy);

      toast.success(t("newPO.poCopied"), {
        description: t("newPO.poCopiedDescription", {
          poNumber: fullPO.externalId,
        }),
      });
    } catch (error) {
      toast.error(t("newPO.errorLoadingPO"));
      setShowModeDialog(true);
    } finally {
      setIsLoadingPO(false);
    }
  };

  const handleCancelPOSelection = () => {
    setShowPOSelector(false);
    setShowModeDialog(true);
  };

  const handleCloseModeDialog = () => {
    setShowModeDialog(false);
    navigate("/pos");
  };

  // Preparar dados para cópia (remover campos sensíveis)
  const getPODataForCopy = (
    po: PurchaseOrderExpanded
  ): PurchaseOrderExpanded | null => {
    if (!po) return null;

    return {
      ...po,
      // Manter campos relevantes e zerar campos sensíveis
      id: "", // Novo ID será gerado
      externalId: "", // Novo número externo será gerado
      status: "rascunho" as const,
      step: "rascunho" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Limpar aprovações
      approvers: [],
      // Copiar allocations mas limpar IDs para que sejam gerados novos
      allocations:
        po.allocations?.map((alloc) => ({
          ...alloc,
          id: "", // Novo ID será gerado
          purchaseOrderId: "", // Será associado à nova PO
        })) || [],
      // Garantir que payment seja copiado corretamente
      payment: po.payment
        ? {
            ...po.payment,
            purchaseOrderId: "", // Será associado à nova PO
          }
        : po.payment,
    };
  };

  const renderForm = () => {
    if (isLoadingPO) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (poType) {
      case "produtos_servicos":
        return (
          <ProductsServicesForm
            key={selectedPOToCopy?.externalId || "new"}
            poInitialData={selectedPOToCopy}
          />
        );
      default:
        return <div>Tipo de PO inválido</div>;
    }
  };

  return (
    <AppLayout>
      <POCreationModeDialog
        open={showModeDialog}
        onSelect={handleModeSelect}
        onClose={handleCloseModeDialog}
      />
      <POSelectorDialog
        open={showPOSelector}
        purchaseOrders={mockPurchaseOrders.filter(
          (po) => po.typeOfPO === poType
        )}
        onSelect={handlePOSelect}
        onCancel={handleCancelPOSelection}
      />

      <div className="space-y-6">
        {/* cabeçalho */}
        {!showModeDialog && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-md text-secondary">
                {poTypesIcons[poType]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t("poList.newPO")} - {t(`poType.${poType}`)}
                  {selectedPOToCopy && originalPONumber && (
                    <span className="text-base font-normal text-muted-foreground ml-2">
                      ({t("newPO.copyFrom")} #{originalPONumber})
                    </span>
                  )}
                </h1>
              </div>
            </div>
          </div>
        )}
        {!showModeDialog && renderForm()}
      </div>
    </AppLayout>
  );
};

export default NewPO;
