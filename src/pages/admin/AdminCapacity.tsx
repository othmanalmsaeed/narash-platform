import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Container, AlertTriangle, Loader2 } from "lucide-react";
import { useAdminCapacity } from "@/hooks/useAdminData";

const AdminCapacity = () => {
  const { data: capacities = [], isLoading } = useAdminCapacity();

  const totalSeats = capacities.reduce((a, c) => a + c.totalSeats, 0);
  const totalOccupied = capacities.reduce((a, c) => a + c.occupiedSeats, 0);
  const totalRemaining = capacities.reduce((a, c) => a + c.remainingSeats, 0);
  const utilizationRate = totalSeats ? Math.round((totalOccupied / totalSeats) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Container className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">السعة التدريبية</h1>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border-r-4 border-r-primary">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">إجمالي المقاعد</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{totalSeats}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-blue-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">المقاعد المشغولة</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalOccupied}</div>
              <Progress value={utilizationRate} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">{utilizationRate}% استخدام</p>
            </CardContent>
          </Card>
          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">المقاعد المتبقية</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{totalRemaining}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>السعة حسب الشركة</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : capacities.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد شركات</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الشركة</TableHead>
                      <TableHead className="text-right">إجمالي المقاعد</TableHead>
                      <TableHead className="text-right">المشغولة</TableHead>
                      <TableHead className="text-right">المتبقية</TableHead>
                      <TableHead className="text-right">نسبة الاستخدام</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capacities.map((cap) => {
                      const pct = cap.totalSeats ? Math.round((cap.occupiedSeats / cap.totalSeats) * 100) : 0;
                      const isNearFull = cap.remainingSeats <= 2;
                      return (
                        <TableRow key={cap.id}>
                          <TableCell className="text-right font-medium">{cap.companyName}</TableCell>
                          <TableCell className="text-right">{cap.totalSeats}</TableCell>
                          <TableCell className="text-right">{cap.occupiedSeats}</TableCell>
                          <TableCell className="text-right font-semibold">{cap.remainingSeats}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-2 w-20" />
                              <span className="text-sm">{pct}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isNearFull ? (
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 gap-1">
                                <AlertTriangle className="h-3 w-3" /> شبه ممتلئ
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">متاح</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

export default AdminCapacity;
