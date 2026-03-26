import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, CheckCircle, Clock, Plus, Loader2, Trash2 } from "lucide-react";
import { useAdminProgramCycles, useCreateProgramCycle } from "@/hooks/useAdminData";
import type { ProgramCycleRow } from "@/hooks/useAdminData";
import { toast } from "sonner";

const isDatePast = (d: string) => new Date(d) < new Date();
const isDateCurrent = (from: string, to: string) => {
  const now = new Date();
  return new Date(from) <= now && now <= new Date(to);
};

const statusLabels: Record<string, string> = { Planned: "مخطط", Active: "نشط", Completed: "مكتمل" };
const statusColors: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Active: "bg-green-100 text-green-800 hover:bg-green-100",
  Completed: "bg-muted text-muted-foreground hover:bg-muted",
};

const CycleCard = ({ cycle }: { cycle: ProgramCycleRow }) => (
  <div className="space-y-4">
    <Card className="border-r-4 border-r-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{cycle.name}</CardTitle>
          <Badge className={statusColors[cycle.status]}>{statusLabels[cycle.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        <div><span className="text-sm text-muted-foreground">تاريخ البدء: </span><span className="font-semibold">{cycle.start_date}</span></div>
        <div><span className="text-sm text-muted-foreground">تاريخ الانتهاء: </span><span className="font-semibold">{cycle.end_date}</span></div>
      </CardContent>
    </Card>

    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle className="text-base">نوافذ الزيارات الإشرافية</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(cycle.visit_windows ?? []).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا توجد نوافذ</p>}
          {(cycle.visit_windows ?? []).map((w, i) => {
            const current = isDateCurrent(w.from, w.to);
            const past = isDatePast(w.to);
            return (
              <div key={i} className={`rounded-lg border p-3 ${current ? "border-primary bg-primary/5" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{w.label}</span>
                  {current ? <Badge className="bg-primary text-primary-foreground hover:bg-primary">جارية</Badge> :
                   past ? <Badge className="bg-muted text-muted-foreground hover:bg-muted">انتهت</Badge> :
                   <Badge variant="outline">قادمة</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{w.from} → {w.to}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">نوافذ التقييم</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(cycle.assessment_windows ?? []).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا توجد نوافذ</p>}
          {(cycle.assessment_windows ?? []).map((w, i) => {
            const current = isDateCurrent(w.from, w.to);
            const past = isDatePast(w.to);
            return (
              <div key={i} className={`rounded-lg border p-3 ${current ? "border-accent bg-accent/5" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{w.label}</span>
                  {current ? <Badge className="bg-accent text-accent-foreground hover:bg-accent">جارية</Badge> :
                   past ? <Badge className="bg-muted text-muted-foreground hover:bg-muted">انتهت</Badge> :
                   <Badge variant="outline">قادمة</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{w.from} → {w.to}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">مواعيد التقارير</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(cycle.reporting_deadlines ?? []).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا توجد مواعيد</p>}
          {(cycle.reporting_deadlines ?? []).map((d, i) => {
            const past = isDatePast(d.date);
            return (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{d.label}</span>
                  {past ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground">{d.date}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  </div>
);

const AdminSchedule = () => {
  const { data: cycles = [], isLoading } = useAdminProgramCycles();
  const createMutation = useCreateProgramCycle();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Planned");
  const [visitWindows, setVisitWindows] = useState<Array<{ label: string; from: string; to: string }>>([]);
  const [assessmentWindows, setAssessmentWindows] = useState<Array<{ label: string; from: string; to: string }>>([]);
  const [deadlines, setDeadlines] = useState<Array<{ label: string; date: string }>>([]);

  const resetForm = () => {
    setName(""); setStartDate(""); setEndDate(""); setStatus("Planned");
    setVisitWindows([]); setAssessmentWindows([]); setDeadlines([]);
  };

  const handleSave = () => {
    if (!name || !startDate || !endDate) { toast.error("يرجى تعبئة الحقول المطلوبة"); return; }
    createMutation.mutate(
      { name, start_date: startDate, end_date: endDate, status, visit_windows: visitWindows, assessment_windows: assessmentWindows, reporting_deadlines: deadlines },
      { onSuccess: () => { toast.success("تم إنشاء الدورة بنجاح"); resetForm(); setOpen(false); }, onError: (e) => toast.error("خطأ: " + (e as Error).message) }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">التقويم التشغيلي</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="ml-2 h-4 w-4" />دورة جديدة</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء دورة برنامج</DialogTitle>
                <DialogDescription>أضف دورة تشغيلية جديدة مع نوافذ الزيارات والتقييم</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم الدورة</Label>
                  <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: الفصل الثاني 2026" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>تاريخ البدء</Label><Input type="date" className="mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                  <div><Label>تاريخ الانتهاء</Label><Input type="date" className="mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planned">مخطط</SelectItem>
                      <SelectItem value="Active">نشط</SelectItem>
                      <SelectItem value="Completed">مكتمل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visit Windows */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>نوافذ الزيارات</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setVisitWindows([...visitWindows, { label: "", from: "", to: "" }])}>
                      <Plus className="h-3 w-3 ml-1" />إضافة
                    </Button>
                  </div>
                  {visitWindows.map((w, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-end">
                      <Input placeholder="الاسم" value={w.label} onChange={(e) => { const n = [...visitWindows]; n[i].label = e.target.value; setVisitWindows(n); }} className="flex-1" />
                      <Input type="date" value={w.from} onChange={(e) => { const n = [...visitWindows]; n[i].from = e.target.value; setVisitWindows(n); }} />
                      <Input type="date" value={w.to} onChange={(e) => { const n = [...visitWindows]; n[i].to = e.target.value; setVisitWindows(n); }} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setVisitWindows(visitWindows.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                {/* Assessment Windows */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>نوافذ التقييم</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setAssessmentWindows([...assessmentWindows, { label: "", from: "", to: "" }])}>
                      <Plus className="h-3 w-3 ml-1" />إضافة
                    </Button>
                  </div>
                  {assessmentWindows.map((w, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-end">
                      <Input placeholder="الاسم" value={w.label} onChange={(e) => { const n = [...assessmentWindows]; n[i].label = e.target.value; setAssessmentWindows(n); }} className="flex-1" />
                      <Input type="date" value={w.from} onChange={(e) => { const n = [...assessmentWindows]; n[i].from = e.target.value; setAssessmentWindows(n); }} />
                      <Input type="date" value={w.to} onChange={(e) => { const n = [...assessmentWindows]; n[i].to = e.target.value; setAssessmentWindows(n); }} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setAssessmentWindows(assessmentWindows.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                {/* Reporting Deadlines */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>مواعيد التقارير</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setDeadlines([...deadlines, { label: "", date: "" }])}>
                      <Plus className="h-3 w-3 ml-1" />إضافة
                    </Button>
                  </div>
                  {deadlines.map((d, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-end">
                      <Input placeholder="الاسم" value={d.label} onChange={(e) => { const n = [...deadlines]; n[i].label = e.target.value; setDeadlines(n); }} className="flex-1" />
                      <Input type="date" value={d.date} onChange={(e) => { const n = [...deadlines]; n[i].date = e.target.value; setDeadlines(n); }} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setDeadlines(deadlines.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
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
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : cycles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد دورات تشغيلية بعد. أنشئ دورة جديدة للبدء.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {cycles.map((cycle) => (
              <CycleCard key={cycle.id} cycle={cycle} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSchedule;
