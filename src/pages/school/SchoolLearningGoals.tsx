import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useSchoolStudents, useSchoolLearningGoals, useCreateLearningGoals } from "@/hooks/useSchoolData";
import { Plus, Target, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SchoolLearningGoals = () => {
  const { data: students = [] } = useSchoolStudents();
  const { data: goalsList = [], isLoading } = useSchoolLearningGoals();
  const createMutation = useCreateLearningGoals();

  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [goals, setGoals] = useState(["", "", ""]);

  const addGoalField = () => {
    if (goals.length < 5) setGoals((prev) => [...prev, ""]);
  };

  const updateGoal = (i: number, val: string) => {
    setGoals((prev) => prev.map((g, idx) => (idx === i ? val : g)));
  };

  const handleSave = () => {
    if (!studentId) { toast.error("يرجى اختيار الطالب"); return; }
    const filtered = goals.filter((g) => g.trim());
    if (filtered.length === 0) { toast.error("يرجى إدخال هدف واحد على الأقل"); return; }
    createMutation.mutate(
      { studentId, goals: filtered, date: new Date().toISOString().split("T")[0] },
      {
        onSuccess: () => { toast.success("تم حفظ أهداف التعلم 🎯"); setOpen(false); setStudentId(""); setGoals(["", "", ""]); },
        onError: (err) => toast.error("خطأ: " + (err as Error).message),
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🎯 أهداف التعلم</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="ml-2 h-4 w-4" />إضافة أهداف</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>أهداف تعلم جديدة</DialogTitle>
                <DialogDescription>أضف 3 إلى 5 أهداف تعلم للطالب</DialogDescription>
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
                {goals.map((g, i) => (
                  <div key={i}>
                    <Label>الهدف {i + 1}</Label>
                    <Input placeholder={`مهارة أو هدف تعلم #${i + 1}`} className="mt-1" value={g} onChange={(e) => updateGoal(i, e.target.value)} />
                  </div>
                ))}
                {goals.length < 5 && (
                  <Button type="button" variant="outline" size="sm" onClick={addGoalField}>
                    <Plus className="ml-1 h-3 w-3" />إضافة هدف آخر
                  </Button>
                )}
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
        ) : goalsList.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد أهداف تعلم بعد</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {goalsList.map((lg) => (
              <Card key={lg.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{lg.studentName}</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">{lg.date}</span>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(lg.goals ?? []).map((goal: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Target className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SchoolLearningGoals;
