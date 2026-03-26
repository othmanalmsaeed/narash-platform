import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface IncidentFormProps {
  students: { id: string; name: string }[];
  onSubmit: (form: {
    studentId: string;
    incidentDate: string;
    incidentType: string;
    severity: string;
    description: string;
    location?: string;
    firstAidProvided?: boolean;
  }) => Promise<void>;
  isPending: boolean;
}

export function IncidentForm({ students, onSubmit, isPending }: IncidentFormProps) {
  const [form, setForm] = useState({
    studentId: "",
    incidentDate: new Date().toISOString().split("T")[0],
    incidentType: "work_injury",
    severity: "minor",
    description: "",
    location: "",
    firstAidProvided: false,
  });

  const handleSubmit = async () => {
    if (!form.studentId || !form.description) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    try {
      await onSubmit(form);
      setForm({
        studentId: "",
        incidentDate: new Date().toISOString().split("T")[0],
        incidentType: "work_injury",
        severity: "minor",
        description: "",
        location: "",
        firstAidProvided: false,
      });
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الإصابة");
    }
  };

  return (
    <div className="space-y-4 mt-2">
      <div>
        <Label>الطالب *</Label>
        <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
          <SelectTrigger><SelectValue placeholder="اختر الطالب" /></SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>تاريخ الإصابة *</Label>
          <Input type="date" value={form.incidentDate} onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} />
        </div>
        <div>
          <Label>نوع الإصابة *</Label>
          <Select value={form.incidentType} onValueChange={(v) => setForm({ ...form, incidentType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="work_injury">إصابة عمل</SelectItem>
              <SelectItem value="equipment_accident">حادث معدات</SelectItem>
              <SelectItem value="chemical_exposure">تعرض كيميائي</SelectItem>
              <SelectItem value="fall">سقوط</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>الشدة *</Label>
          <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="minor">طفيفة</SelectItem>
              <SelectItem value="moderate">متوسطة</SelectItem>
              <SelectItem value="serious">خطيرة</SelectItem>
              <SelectItem value="critical">حرجة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>الموقع</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="مكان الحادثة" />
        </div>
      </div>
      <div>
        <Label>وصف الإصابة *</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف تفصيلي للإصابة والظروف المحيطة" rows={3} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="firstAid" checked={form.firstAidProvided} onChange={(e) => setForm({ ...form, firstAidProvided: e.target.checked })} className="h-4 w-4" />
        <Label htmlFor="firstAid" className="cursor-pointer">تم تقديم إسعاف أولي</Label>
      </div>
      <Button onClick={handleSubmit} disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
        تسجيل الإصابة وإرسال الإشعارات
      </Button>
    </div>
  );
}
