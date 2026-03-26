import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStudentJournal, useCreateJournalEntry } from "@/hooks/useStudentData";

const StudentJournal = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ week_label: "", date: new Date().toISOString().split("T")[0], learned: "", challenges: "", solutions: "", goals: "" });
  const { data: entries = [], isLoading } = useStudentJournal();
  const createEntry = useCreateJournalEntry();

  const handleSubmit = () => {
    if (!form.week_label.trim() || !form.learned.trim()) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    createEntry.mutate(form, {
      onSuccess: () => {
        toast.success("تم حفظ الإدخال بنجاح");
        setOpen(false);
        setForm({ week_label: "", date: new Date().toISOString().split("T")[0], learned: "", challenges: "", solutions: "", goals: "" });
      },
      onError: (err: any) => toast.error(err.message || "حدث خطأ"),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">سجل مهارات الطالب</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="ml-2 h-4 w-4" />إضافة إدخال جديد</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إدخال أسبوعي جديد</DialogTitle>
                <DialogDescription>أضف تأملاتك الأسبوعية حول تجربتك التدريبية</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الأسبوع</Label>
                    <Input placeholder="مثال: الأسبوع 12" className="mt-1" value={form.week_label} onChange={e => setForm(f => ({ ...f, week_label: e.target.value }))} />
                  </div>
                  <div>
                    <Label>التاريخ</Label>
                    <Input type="date" className="mt-1" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>ماذا تعلمت هذا الأسبوع؟</Label>
                  <Textarea placeholder="اكتب ما تعلمته..." className="mt-1" value={form.learned} onChange={e => setForm(f => ({ ...f, learned: e.target.value }))} />
                </div>
                <div>
                  <Label>ما التحديات التي واجهتها؟</Label>
                  <Textarea placeholder="اكتب التحديات..." className="mt-1" value={form.challenges} onChange={e => setForm(f => ({ ...f, challenges: e.target.value }))} />
                </div>
                <div>
                  <Label>كيف تغلبت على التحديات؟</Label>
                  <Textarea placeholder="اكتب الحلول..." className="mt-1" value={form.solutions} onChange={e => setForm(f => ({ ...f, solutions: e.target.value }))} />
                </div>
                <div>
                  <Label>أهداف الأسبوع القادم</Label>
                  <Textarea placeholder="اكتب أهدافك..." className="mt-1" value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={createEntry.isPending}>
                  {createEntry.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  حفظ الإدخال
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">لا توجد إدخالات بعد. أضف إدخالك الأسبوعي الأول!</p>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{entry.week_label}</CardTitle>
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {entry.learned && <div><span className="font-semibold text-primary">ما تعلمته:</span> {entry.learned}</div>}
                  {entry.challenges && <div><span className="font-semibold text-primary">التحديات:</span> {entry.challenges}</div>}
                  {entry.solutions && <div><span className="font-semibold text-primary">الحلول:</span> {entry.solutions}</div>}
                  {entry.goals && <div><span className="font-semibold text-primary">الأهداف:</span> {entry.goals}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentJournal;
