import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useSchoolStudents, useSchoolObservations, useCreateObservation } from "@/hooks/useSchoolData";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SchoolObservation = () => {
  const { data: students = [] } = useSchoolStudents();
  const { data: observations = [], isLoading } = useSchoolObservations();
  const createMutation = useCreateObservation();

  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [activities, setActivities] = useState("");
  const [questions, setQuestions] = useState("");
  const [evidence, setEvidence] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const resetForm = () => {
    setStudentId(""); setDate(new Date().toISOString().split("T")[0]);
    setActivities(""); setQuestions(""); setEvidence(""); setRecommendations("");
  };

  const handleSave = () => {
    if (!studentId || !activities) { toast.error("يرجى تعبئة الحقول المطلوبة"); return; }
    createMutation.mutate(
      { studentId, date, activities, questions, evidence, recommendations },
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
          <h1 className="text-2xl font-bold">سجل المراقبة</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="ml-2 h-4 w-4" />إضافة سجل</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>سجل مراقبة جديد</DialogTitle>
                <DialogDescription>وثّق ملاحظاتك من الزيارة الميدانية</DialogDescription>
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
                  <Label>التاريخ</Label>
                  <Input type="date" className="mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>الأنشطة المُلاحظة</Label>
                  <Textarea placeholder="صف الأنشطة التي لاحظتها..." className="mt-1" value={activities} onChange={(e) => setActivities(e.target.value)} />
                </div>
                <div>
                  <Label>الأسئلة المطروحة</Label>
                  <Textarea placeholder="ما الأسئلة التي طرحتها على الطالب؟" className="mt-1" value={questions} onChange={(e) => setQuestions(e.target.value)} />
                </div>
                <div>
                  <Label>الأدلة والشواهد</Label>
                  <Textarea placeholder="ما الأدلة التي قدمها الطالب؟" className="mt-1" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
                </div>
                <div>
                  <Label>التوصيات</Label>
                  <Textarea placeholder="توصياتك..." className="mt-1" value={recommendations} onChange={(e) => setRecommendations(e.target.value)} />
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

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : observations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد سجلات مراقبة بعد</p>
        ) : (
          <div className="space-y-4">
            {observations.map((o) => (
              <Card key={o.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{o.studentName}</CardTitle>
                    <span className="text-sm text-muted-foreground">{o.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><span className="font-semibold text-primary">الأنشطة:</span> {o.activities}</div>
                  <div><span className="font-semibold text-primary">الأسئلة:</span> {o.questions}</div>
                  <div><span className="font-semibold text-primary">الأدلة:</span> {o.evidence}</div>
                  <div><span className="font-semibold text-primary">التوصيات:</span> {o.recommendations}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SchoolObservation;
