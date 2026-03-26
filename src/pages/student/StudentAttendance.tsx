import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useStudentAttendance } from "@/hooks/useStudentData";

const statusMap: Record<string, { label: string; color: string }> = {
  present: { label: "حاضر", color: "bg-green-100 text-green-800 hover:bg-green-100" },
  absent: { label: "غائب", color: "bg-red-100 text-red-800 hover:bg-red-100" },
  late: { label: "متأخر", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  early_leave: { label: "خروج مبكر", color: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
  excused: { label: "معذور", color: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
};

const StudentAttendance = () => {
  const { data: records = [], isLoading } = useStudentAttendance();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">📅 سجل الحضور</h1>
        <Card>
          <CardHeader>
            <CardTitle>سجل الحضور اليومي</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد سجلات حضور بعد</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[450px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">وقت الدخول</TableHead>
                      <TableHead className="text-right">وقت الخروج</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map(r => {
                      const s = statusMap[r.status] ?? { label: r.status, color: "" };
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="text-right">{r.date}</TableCell>
                          <TableCell className="text-right">{r.entry_time ?? "-"}</TableCell>
                          <TableCell className="text-right">{r.exit_time ?? "-"}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={s.color}>{s.label}</Badge>
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

export default StudentAttendance;
