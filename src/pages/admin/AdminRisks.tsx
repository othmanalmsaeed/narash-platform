import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, AlertTriangle, AlertOctagon, Info, Loader2 } from "lucide-react";
import { useAdminRisks } from "@/hooks/useAdminData";

const severityColors: Record<string, string> = {
  Low: "bg-green-100 text-green-800 hover:bg-green-100",
  Moderate: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Critical: "bg-red-100 text-red-800 hover:bg-red-100",
};

const severityLabels: Record<string, string> = { Low: "منخفض", Moderate: "متوسط", Critical: "حرج" };

const statusLabels: Record<string, string> = { Open: "مفتوح", UnderReview: "قيد المراجعة", Resolved: "محلول" };
const statusColors: Record<string, string> = {
  Open: "bg-red-100 text-red-800 hover:bg-red-100",
  UnderReview: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Resolved: "bg-green-100 text-green-800 hover:bg-green-100",
};

const SeverityIcon = ({ s }: { s: string }) => {
  switch (s) {
    case "Critical": return <AlertOctagon className="h-4 w-4 text-red-600" />;
    case "Moderate": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    default: return <Info className="h-4 w-4 text-green-600" />;
  }
};

const AdminRisks = () => {
  const { data: risks = [], isLoading } = useAdminRisks();

  const critical = risks.filter((r) => r.severity === "Critical").length;
  const moderate = risks.filter((r) => r.severity === "Moderate").length;
  const low = risks.filter((r) => r.severity === "Low").length;
  const open = risks.filter((r) => r.status === "Open").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">المخاطر والامتثال</h1>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card className="border-r-4 border-r-red-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">حرج</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-red-600">{critical}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-yellow-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">متوسط</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-yellow-600">{moderate}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">منخفض</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-600">{low}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-primary">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">حالات مفتوحة</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{open}</div></CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : risks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد مخاطر مكتشفة حالياً — هذا مؤشر إيجابي! ✅
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>سجل حالات المخاطر ({risks.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">الشدة</TableHead>
                      <TableHead className="text-right">الكيان المرتبط</TableHead>
                      <TableHead className="text-right">الإجراء المقترح</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {risks.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-right"><Badge variant="outline">{r.typeLabel}</Badge></TableCell>
                        <TableCell className="text-right max-w-[200px]">{r.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1.5">
                            <SeverityIcon s={r.severity} />
                            <Badge className={severityColors[r.severity]}>{severityLabels[r.severity]}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{r.relatedEntityName}</TableCell>
                        <TableCell className="text-right text-sm max-w-[180px]">{r.suggestedAction}</TableCell>
                        <TableCell className="text-right"><Badge className={statusColors[r.status]}>{statusLabels[r.status]}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminRisks;
