import { Card, CardContent } from "@/components/ui/card";
import { Clock, RefreshCw, FileCheck, AlertCircle, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface KPIData {
  pendingRequests: number;
  inProgressRequests: number;
  activeContracts: number;
  expiringSoon: number;
  expiredContracts: number;
}

interface LegalKPICardsProps {
  kpiData: KPIData;
}

export function LegalKPICards({ kpiData }: LegalKPICardsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-warning/10">
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {kpiData.pendingRequests}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("legal.pendingRequests")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-info/10">
              <RefreshCw className="h-4 w-4 text-info" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {kpiData.inProgressRequests}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("legal.inProgressRequests")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-success/10">
              <FileCheck className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {kpiData.activeContracts}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("legal.activeContracts")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {kpiData.expiringSoon}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("legal.expiring30days")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-critical/10">
              <X className="h-4 w-4 text-critical" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {kpiData.expiredContracts}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("legal.expiredContracts")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
