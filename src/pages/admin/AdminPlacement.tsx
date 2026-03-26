import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { UserCheck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { useAdminPlacements } from "@/hooks/useAdminData";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
};

const StatusIcon = ({ s }: { s: string }) => {
  switch (s) {
    case "active": return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
    case "cancelled": return <XCircle className="h-4 w-4 text-red-600" />;
    default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
  }
};

const AdminPlacement = () => {
  const { data: placements = [], isLoading } = useAdminPlacements();

  const active = placements.filter((p) => p.status === "active").length;
  const pending = placements.filter((p) => p.status === "pending").length;
  const successRate = placements.length ? Math.round((active / placements.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UserCheck className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">توزيع الطلاب</h1>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card className="border-r-4 border-r-primary">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">إجمالي التوزيعات</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{placements.length}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">نشط</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{active}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-yellow-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">معلّق</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{pending}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-accent">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">نسبة النجاح</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{successRate}%</div>
              <Progress value={successRate} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>سجلات التوزيع</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : placements.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد توزيعات</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الطالب</TableHead>
                      <TableHead className="text-right">الشركة</TableHead>
                      <TableHead className="text-right">المسار</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ التعيين</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {placements.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-right font-medium">{p.studentName}</TableCell>
                        <TableCell className="text-right">{p.companyName}</TableCell>
                        <TableCell className="text-right"><Badge variant="secondary">{p.pathway}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon s={p.status} />
                            <Badge className={statusColors[p.status] ?? ""}>{p.statusLabel}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">{p.assignmentDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPlacement;
