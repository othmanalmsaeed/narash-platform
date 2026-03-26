import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, AlertTriangle, HeartPulse, Shield } from "lucide-react";
import { useMyStudents } from "@/hooks/useCompanyData";
import { useCompanyIncidents, useCreateCompanyIncident, useUpdateIncidentStatus } from "@/hooks/useIncidentData";
import { toast } from "sonner";
import { IncidentSummaryCards } from "@/components/incidents/IncidentSummaryCards";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { IncidentForm } from "@/components/incidents/IncidentForm";

const CompanyIncidents = () => {
  const { data: students = [], isLoading: loadingStudents } = useMyStudents();
  const { data: incidents = [], isLoading } = useCompanyIncidents();
  const createIncident = useCreateCompanyIncident();
  const updateStatus = useUpdateIncidentStatus();
  const [open, setOpen] = useState(false);

  const activeCount = incidents.filter((i: any) => !["resolved", "closed"].includes(i.status)).length;
  const criticalCount = incidents.filter((i: any) => i.severity === "critical" || i.severity === "serious").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-7 w-7 text-destructive" />
            <h1 className="text-2xl font-bold">إصابات وحوادث التدريب</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 ml-2" />تسجيل إصابة جديدة</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>تسجيل إصابة / حادثة تدريب</DialogTitle>
              </DialogHeader>
              <IncidentForm
                students={students.map((s) => ({ id: s.studentId, name: s.name }))}
                onSubmit={async (form) => {
                  await createIncident.mutateAsync(form);
                  toast.success("تم تسجيل الإصابة بنجاح وإرسال الإشعارات");
                  setOpen(false);
                }}
                isPending={createIncident.isPending}
              />
            </DialogContent>
          </Dialog>
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
              <span className="text-sm font-medium text-destructive">يوجد {criticalCount} إصابة خطيرة/حرجة تتطلب اهتمامًا عاجلاً — يجب إبلاغ قسم الأمن والسلامة المهنية فوراً</span>
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
          <IncidentTable incidents={incidents} updateStatus={updateStatus} canUpdate />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyIncidents;
