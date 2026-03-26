import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, HeartPulse, Shield, AlertTriangle } from "lucide-react";
import { useSchoolIncidents } from "@/hooks/useIncidentData";
import { IncidentSummaryCards } from "@/components/incidents/IncidentSummaryCards";
import { IncidentTable } from "@/components/incidents/IncidentTable";

const SchoolIncidents = () => {
  const { data: incidents = [], isLoading } = useSchoolIncidents();

  const activeCount = incidents.filter((i: any) => !["resolved", "closed"].includes(i.status)).length;
  const criticalCount = incidents.filter((i: any) => i.severity === "critical" || i.severity === "serious").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-7 w-7 text-destructive" />
          <h1 className="text-2xl font-bold">إصابات وحوادث التدريب</h1>
          <span className="text-sm text-muted-foreground">(عرض فقط)</span>
        </div>

        <IncidentSummaryCards
          total={incidents.length}
          active={activeCount}
          critical={criticalCount}
          resolved={incidents.filter((i: any) => i.status === "resolved" || i.status === "closed").length}
        />

        {criticalCount > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">يوجد {criticalCount} إصابة خطيرة/حرجة تتطلب اهتمامًا عاجلاً</span>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : incidents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>لا توجد إصابات مسجلة — بيئة تدريب آمنة ✅</p>
            </CardContent>
          </Card>
        ) : (
          <IncidentTable incidents={incidents} canUpdate={false} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default SchoolIncidents;
