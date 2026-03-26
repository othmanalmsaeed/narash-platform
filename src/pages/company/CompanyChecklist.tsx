import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMyStudents, useCompanyChecklist, useUpsertChecklist } from "@/hooks/useCompanyData";
import { ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CompanyChecklist = () => {
  const { data: students = [] } = useMyStudents();
  const [selectedStudent, setSelectedStudent] = useState("");
  const activeStudent = selectedStudent || students[0]?.studentId;
  const { data: records = [], isLoading } = useCompanyChecklist(activeStudent);
  const upsertMutation = useUpsertChecklist();

  const toggle = (record: { skill_name: string; skill_category: string; checked: boolean | null }) => {
    if (!activeStudent) return;
    upsertMutation.mutate(
      {
        studentId: activeStudent,
        skillName: record.skill_name,
        skillCategory: record.skill_category,
        checked: !record.checked,
      },
      {
        onSuccess: () => toast.success("تم تحديث المهارة ✅"),
        onError: (err) => toast.error("خطأ: " + (err as Error).message),
      }
    );
  };

  const completedCount = records.filter((r) => r.checked).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">✅ قائمة رصد المهارات</h1>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <Label>اختر الطالب</Label>
              <Select value={activeStudent ?? ""} onValueChange={setSelectedStudent}>
                <SelectTrigger className="mt-1 w-64"><SelectValue placeholder="اختر الطالب" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.studentId} value={s.studentId}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : records.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد مهارات مسجلة لهذا الطالب بعد</p>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <ClipboardList className="h-4 w-4" />
                  <span>المهارات المكتملة: {completedCount} / {records.length}</span>
                </div>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <Table className="min-w-[450px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right w-12">#</TableHead>
                        <TableHead className="text-right">المهارة</TableHead>
                        <TableHead className="text-right">الفئة</TableHead>
                        <TableHead className="text-right w-20">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((r, i) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-right">{i + 1}</TableCell>
                          <TableCell className="text-right font-medium">{r.skill_name}</TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">{r.skill_category}</TableCell>
                          <TableCell className="text-right">
                            <Checkbox checked={r.checked ?? false} onCheckedChange={() => toggle(r)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompanyChecklist;
