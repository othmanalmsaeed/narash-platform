import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMyStudents, useCompanyAttendance, useRecordAttendance } from "@/hooks/useCompanyData";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  present: "bg-green-100 text-green-800 hover:bg-green-100",
  late: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  absent: "bg-red-100 text-red-800 hover:bg-red-100",
  early_leave: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  excused: "bg-blue-100 text-blue-800 hover:bg-blue-100",
};

const statusLabel: Record<string, string> = {
  present: "حاضر",
  late: "متأخر",
  absent: "غائب",
  early_leave: "انصراف مبكر",
  excused: "مستأذن",
};

const CompanyAttendance = () => {
  const { data: students = [] } = useMyStudents();
  const { data: records = [], isLoading } = useCompanyAttendance();
  const recordMutation = useRecordAttendance();

  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryTime, setEntryTime] = useState("08:00");
  const [exitTime, setExitTime] = useState("16:00");
  const [status, setStatus] = useState<string>("present");

  const handleSave = () => {
    const student = students.find((s) => s.studentId === selectedStudent);
    if (!student) { toast.error("يرجى اختيار الطالب"); return; }
    recordMutation.mutate(
      {
        studentId: student.studentId,
        placementId: student.placementId,
        date,
        entryTime,
        exitTime,
        status: status as any,
      },
      {
        onSuccess: () => toast.success("تم تسجيل الحضور بنجاح ✅"),
        onError: (err) => toast.error("خطأ: " + (err as Error).message),
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">📅 سجل الحضور</h1>

        <Card>
          <CardHeader><CardTitle>تسجيل حضور جديد</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label>الطالب</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="اختر الطالب" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.studentId} value={s.studentId}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>التاريخ</Label>
                <Input type="date" className="mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label>وقت الدخول</Label>
                <Input type="time" className="mt-1" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} />
              </div>
              <div>
                <Label>وقت الخروج</Label>
                <Input type="time" className="mt-1" value={exitTime} onChange={(e) => setExitTime(e.target.value)} />
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabel).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="mt-4" onClick={handleSave} disabled={recordMutation.isPending}>
              {recordMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Plus className="ml-2 h-4 w-4" />}
              تسجيل
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>سجلات الحضور السابقة</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : records.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد سجلات حضور بعد</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[550px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الطالب</TableHead>
                      <TableHead className="text-right">الدخول</TableHead>
                      <TableHead className="text-right">الخروج</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-right">{r.date}</TableCell>
                        <TableCell className="text-right">{r.studentName}</TableCell>
                        <TableCell className="text-right">{r.entry_time ?? "—"}</TableCell>
                        <TableCell className="text-right">{r.exit_time ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={statusColor[r.status] ?? ""}>{statusLabel[r.status] ?? r.status}</Badge>
                        </TableCell>
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

export default CompanyAttendance;
