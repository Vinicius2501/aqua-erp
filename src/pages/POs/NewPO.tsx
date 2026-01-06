import { AppLayout } from "@/layouts/AppLayout";
import { Package, Receipt } from "lucide-react";
import type { POType } from "@/types/domain";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams } from "react-router-dom";
import ProductsServicesForm from "@/components/po/ProductsServicesForm";

const NewPO = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const poType = searchParams.get("type") as POType;

  const poTypesIcons = {
    produtos_servicos: <Package />,
    reembolso: <Receipt />,
  };

  const renderForm = () => {
    switch (poType) {
      case "produtos_servicos":
        return <ProductsServicesForm poInitialData={null} />;
      default:
        <div>Tipo de PO inválido</div>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-md text-secondary">
              {poTypesIcons[poType]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("poList.newPO")} - {t(`poType.${poType}`)}
              </h1>
            </div>
          </div>
        </div>
        {renderForm()}
      </div>
    </AppLayout>
  );
};

export default NewPO;
