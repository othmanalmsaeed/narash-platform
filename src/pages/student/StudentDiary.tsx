import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, CalendarDays, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStudentDiary, useCreateDiaryEntry } from "@/hooks/useStudentData";

const StudentDiary = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("");
  const { data: entries = [], isLoading } = useStudentDiary();
  const createEntry = useCreateDiaryEntry();

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("يرجى كتابة المحتوى");
      return;
    }
    createEntry.mutate(
      { date, content: content.trim() },
      {
        onSuccess: () => {
          toast.success("تم حفظ اليومية بنجاح ✅");
          setOpen(false);
          setContent("");
        },
        onError: (err: any) => toast.error(err.message || "حدث خطأ"),
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">📝 اليوميات</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="ml-2 h-4 w-4" />إضافة يومية</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>يومية جديدة</DialogTitle>
                <DialogDescription>سجّل ما حدث معك اليوم في التدريب</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>التاريخ</Label>
                  <Input type="date" className="mt-1" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>ماذا حدث اليوم؟</Label>
                  <Textarea
                    placeholder="اكتب تفاصيل يومك في التدريب..."
                    className="mt-1 min-h-[120px]"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={createEntry.isPending}>
                  {createEntry.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : entries.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">لا توجد يوميات بعد. ابدأ بتسجيل يومك!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <Card key={entry.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{entry.date}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{entry.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDiary;
