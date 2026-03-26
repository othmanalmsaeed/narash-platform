import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSchoolStudents, useSchoolAssessments, useCreateAssessment } from "@/hooks/useSchoolData";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const gradeColor: Record<string, string> = {
  D: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  M: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  P: "bg-green-100 text-green-800 hover:bg-green-100",
};

const SchoolAssessment = () => {
  const { data: students = [] } = useSchoolStudents();
  const { data: assessments = [], isLoading } = useSchoolAssessments();
  const createMutation = useCreateAssessment();

  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [unit, setUnit] = useState("");
  const [grade, setGrade] = useState<"P" | "M" | "D">("P");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const resetForm = () => { setStudentId(""); setUnit(""); setGrade("P"); setNotes(""); setDate(new Date().toISOString().split("T")[0]); };

  const handleSave = () => {
    if (!studentId || !unit) { toast.error("يرجى تعبئة الحقول المطلوبة"); return; }
    createMutation.mutate(
      { studentId, unit, grade, notes, date },
      {
        onSuccess: () => { toast.success("تم الحفظ بنجاح"); resetForm(); setOpen(false); },
        onError: (err) => toast.error("خطأ: " + (err as Error).message),
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">سجل التقييم النهائي</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="ml-2 h-4 w-4" />تقييم جديد</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تقييم نهائي جديد</DialogTitle>
                <DialogDescription>أضف التقييم النهائي للوحدة BTEC</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>الطالب</Label>
                  <Select value={studentId} onValueChange={setStudentId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="اختر الطالب" /></SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.studentId} value={s.studentId}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الوحدة</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="اختر الوحدة" /></SelectTrigger>
                    <SelectContent>
                      {["الوحدة 1", "الوحدة 2", "الوحدة 3", "الوحدة 4", "الوحدة 5"].map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>التاريخ</Label>
                  <Input type="date" className="mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">التقدير النهائي</Label>
                  <Select value={grade} onValueChange={(v) => setGrade(v as "P" | "M" | "D")}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P">P - اجتياز</SelectItem>
                      <SelectItem value="M">M - جدارة</SelectItem>
                      <SelectItem value="D">D - تميّز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Textarea placeholder="ملاحظات التقييم النهائي..." className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader><CardTitle>التقييمات النهائية</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : assessments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد تقييمات بعد</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[650px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>الطالب</TableHead>
                      <TableHead>الوحدة</TableHead>
                      <TableHead>التقدير</TableHead>
                      <TableHead>الملاحظات</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((a) => (
                      <TableRow key={a.id} className={a.is_locked ? "bg-muted/30" : ""}>
                        <TableCell className="font-medium">{a.studentName}</TableCell>
                        <TableCell>{a.unit}</TableCell>
                        <TableCell><Badge className={gradeColor[a.grade] ?? ""}>{a.grade}</Badge></TableCell>
                        <TableCell className="max-w-[250px] truncate">{a.notes}</TableCell>
                        <TableCell>{a.date}</TableCell>
                        <TableCell>
                          {a.is_locked ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">🔒 مقفل</Badge>
                          ) : (
                            <Badge variant="outline">مفتوح</Badge>
                          )}
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

export default SchoolAssessment;
