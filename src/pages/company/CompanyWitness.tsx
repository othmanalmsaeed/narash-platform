import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMyStudents, useCompanyWitness, useCreateWitness } from "@/hooks/useCompanyData";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CompanyWitness = () => {
  const { data: students = [] } = useMyStudents();
  const { data: witnesses = [], isLoading } = useCompanyWitness();
  const createMutation = useCreateWitness();

  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [activity, setActivity] = useState("");
  const [gradeP, setGradeP] = useState(false);
  const [gradeM, setGradeM] = useState(false);
  const [gradeD, setGradeD] = useState(false);

  const resetForm = () => { setStudentId(""); setUnitNumber(""); setActivity(""); setGradeP(false); setGradeM(false); setGradeD(false); };

  const handleSave = () => {
    if (!studentId || !unitNumber || !activity) { toast.error("يرجى تعبئة جميع الحقول"); return; }
    createMutation.mutate(
      { studentId, unitNumber, activity, gradeP, gradeM, gradeD, date: new Date().toISOString().split("T")[0] },
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
          <h1 className="text-2xl font-bold">شهادة الشاهد</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="ml-2 h-4 w-4" />إضافة شهادة</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>شهادة شاهد جديدة</DialogTitle>
                <DialogDescription>أضف تقييم أداء الطالب في النشاط المحدد</DialogDescription>
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
                  <Label>رقم الوحدة</Label>
                  <Input placeholder="مثال: الوحدة 3" className="mt-1" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} />
                </div>
                <div>
                  <Label>وصف النشاط</Label>
                  <Textarea placeholder="صف النشاط الذي قام به الطالب..." className="mt-1" value={activity} onChange={(e) => setActivity(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">معايير التقييم</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={gradeP} onCheckedChange={(v) => setGradeP(!!v)} />
                      <Label className="text-sm">P - اجتياز</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={gradeM} onCheckedChange={(v) => setGradeM(!!v)} />
                      <Label className="text-sm">M - جدارة</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={gradeD} onCheckedChange={(v) => setGradeD(!!v)} />
                      <Label className="text-sm">D - تميّز</Label>
                    </div>
                  </div>
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
          <CardHeader><CardTitle>الشهادات السابقة</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : witnesses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد شهادات بعد</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[650px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>الطالب</TableHead>
                      <TableHead>الوحدة</TableHead>
                      <TableHead>النشاط</TableHead>
                      <TableHead>P</TableHead>
                      <TableHead>M</TableHead>
                      <TableHead>D</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {witnesses.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">{w.studentName}</TableCell>
                        <TableCell>{w.unit_number}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{w.activity}</TableCell>
                        <TableCell>{w.grade_p ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓</Badge> : "—"}</TableCell>
                        <TableCell>{w.grade_m ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">✓</Badge> : "—"}</TableCell>
                        <TableCell>{w.grade_d ? <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">✓</Badge> : "—"}</TableCell>
                        <TableCell>{w.date}</TableCell>
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

export default CompanyWitness;
