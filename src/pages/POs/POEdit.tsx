import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, FileEdit, AlertTriangle, Package } from "lucide-react";

import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { POStatusBadge } from "@/components/shared/POStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import ProductsServicesForm from "@/components/po/ProductsServicesForm";
import { purchaseOrders } from "@/data/mockdata";
import type { PurchaseOrderExpanded } from "@/types/domain";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NotFound from "../NotFound";
import { useLanguage } from "@/contexts/LanguageContext";

// Chamada de API simulada
const fetchPOById = async (
  id: string
): Promise<PurchaseOrderExpanded | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return purchaseOrders.find((po) => po.id === id) || null;
};

const POEditSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <Skeleton className="h-96 w-full rounded-lg" />
  </div>
);

const POEdit = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [po, setPo] = useState<PurchaseOrderExpanded | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderForm = () => {
    if (!po) return null;
    switch (po.typeOfPO) {
      case "produtos_servicos":
        return <ProductsServicesForm poInitialData={po} />;
      default:
        return (
          <div>
            <NotFound />
          </div>
        );
    }
  };

  useEffect(() => {
    const loadPO = async () => {
      if (!id) {
        setError("ID da PO não informado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchPOById(id);

        if (!data) {
          setError("PO não encontrada");
          setLoading(false);
          return;
        }

        // Permitir edição apenas de rascunhos
        if (data.status !== "rascunho") {
          toast.info(
            "Esta PO não pode ser editada. Redirecionando para visualização..."
          );
          navigate(`/pos/${id}`, { replace: true });
          return;
        }

        setPo(data);
      } catch (err) {
        setError("Erro ao carregar PO");
        toast.error("Erro ao carregar os dados da PO");
      } finally {
        setLoading(false);
      }
    };

    loadPO();
  }, [id, navigate]);

  if (loading) {
    return (
      <AppLayout>
        <POEditSkeleton />
      </AppLayout>
    );
  }

  if (error || !po) {
    return (
      <AppLayout>
        <EmptyState
          icon={AlertTriangle}
          title="PO não encontrada"
          description={error || "Não foi possível encontrar a PO solicitada."}
          action={{
            label: "Voltar para lista",
            onClick: () => navigate("/pos"),
          }}
        />
      </AppLayout>
    );
  }

  const renderPOType = () => {
    switch (po.typeOfPO) {
      case "produtos_servicos":
        return {
          icon: <Package className="h-6 w-6" />,
          css: "bg-primary/10 text-primary",
          label: t("poType.produtos_servicos"),
        };
      default:
        return {
          icon: "",
          css: "",
          label: "",
        };
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/pos")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", renderPOType().css)}>
                {renderPOType().icon}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">
                    {t("poEdit.editTitle")} #{po.externalId}
                  </h1>
                  <POStatusBadge status={po.status} size="lg" />
                </div>
                <p className="text-muted-foreground mt-1">
                  {renderPOType().label} — {t("poEdit.enableEdit")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Rascunho */}
        <Alert className="text-foreground bg-muted/50 border-muted">
          <FileEdit className="h-4 w-4" />
          <AlertDescription className="text-foreground">
            <strong>{t("poEdit.draftAlertTitle")}</strong> —{" "}
            {t("poEdit.draftAlertDescription")}
          </AlertDescription>
        </Alert>

        {/*Formulário - TODO: Adicionar suporte a initialData nos formulários */}
        {renderForm()}
      </div>
    </AppLayout>
  );
};

export default POEdit;
