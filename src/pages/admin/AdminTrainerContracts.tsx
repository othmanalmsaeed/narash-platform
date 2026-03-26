import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useTrainerContracts, useCreateContract, useUpdateContract, type ContractStatus } from "@/hooks/useTrainerContracts";
import { toast } from "sonner";
import { Plus, FileText, Clock, User, Loader2, Building2, GraduationCap, Banknote, CalendarDays, CheckCircle2, XCircle, PlayCircle, PauseCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  draft: { label: "مسودة", variant: "secondary", icon: PauseCircle },
  active: { label: "نشط", variant: "default", icon: PlayCircle },
  completed: { label: "مكتمل", variant: "outline", icon: CheckCircle2 },
  terminated: { label: "منتهي", variant: "destructive", icon: XCircle },
};

export default function AdminTrainerContracts() {
  const { role } = useAuth();
  const { data: contracts, isLoading } = useTrainerContracts();
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<any>(null);
  const isAdmin = role === "admin";

  const [form, setForm] = useState({
    trainer_name: "", trainer_phone: "", trainer_email: "", trainer_specialization: "",
    skill_program: "", total_hours: "", total_days: "", start_date: "", end_date: "",
    financial_amount: "", ministry_representative: "", school_representative: "",
  });

  const resetForm = () => setForm({
    trainer_name: "", trainer_phone: "", trainer_email: "", trainer_specialization: "",
    skill_program: "", total_hours: "", total_days: "", start_date: "", end_date: "",
    financial_amount: "", ministry_representative: "", school_representative: "",
  });

  const handleCreate = async () => {
    if (!form.trainer_name || !form.trainer_specialization || !form.skill_program || !form.total_hours || !form.total_days || !form.start_date || !form.end_date) {
      toast.error("يرجى تعبئة الحقول المطلوبة");
      return;
    }
    try {
      await createMutation.mutateAsync({
        trainer_name: form.trainer_name,
        trainer_phone: form.trainer_phone || undefined,
        trainer_email: form.trainer_email || undefined,
        trainer_specialization: form.trainer_specialization,
        skill_program: form.skill_program,
        total_hours: parseInt(form.total_hours),
        total_days: parseInt(form.total_days),
        start_date: form.start_date,
        end_date: form.end_date,
        financial_amount: form.financial_amount ? parseFloat(form.financial_amount) : undefined,
        ministry_representative: form.ministry_representative || undefined,
        school_representative: form.school_representative || undefined,
      });
      toast.success("تم إنشاء العقد بنجاح");
      resetForm();
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    }
  };

  const handleStatusChange = async (id: string, status: ContractStatus) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast.success("تم تحديث حالة العقد");
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    }
  };

  const handleUpdateHours = async (id: string, hours: number) => {
    try {
      await updateMutation.mutateAsync({ id, completed_hours: hours });
      toast.success("تم تحديث الساعات المنجزة");
      setEditDialog(null);
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    }
  };

  const handleSaveReport = async (id: string, report: string, evalNotes: string) => {
    try {
      await updateMutation.mutateAsync({ id, final_report: report, trainee_evaluation_notes: evalNotes });
      toast.success("تم حفظ التقرير");
      setEditDialog(null);
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    }
  };

  // Stats
  const total = contracts?.length ?? 0;
  const active = contracts?.filter((c: any) => c.status === "active").length ?? 0;
  const completed = contracts?.filter((c: any) => c.status === "completed").length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              عقود المدربين الخارجيين
            </h1>
            <p className="text-sm text-muted-foreground mt-1">إدارة العقود الثلاثية (الوزارة / المدرسة / المدرب)</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> عقد جديد</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إنشاء عقد مدرب خارجي</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اسم المدرب *</Label>
                      <Input value={form.trainer_name} onChange={e => setForm(f => ({ ...f, trainer_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>التخصص *</Label>
                      <Input value={form.trainer_specialization} onChange={e => setForm(f => ({ ...f, trainer_specialization: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الهاتف</Label>
                      <Input value={form.trainer_phone} onChange={e => setForm(f => ({ ...f, trainer_phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input type="email" value={form.trainer_email} onChange={e => setForm(f => ({ ...f, trainer_email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>البرنامج التدريبي (المهارات) *</Label>
                    <Input value={form.skill_program} onChange={e => setForm(f => ({ ...f, skill_program: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>عدد الساعات التدريبية *</Label>
                      <Input type="number" value={form.total_hours} onChange={e => setForm(f => ({ ...f, total_hours: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>عدد الأيام *</Label>
                      <Input type="number" value={form.total_days} onChange={e => setForm(f => ({ ...f, total_days: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>تاريخ البدء *</Label>
                      <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ الانتهاء *</Label>
                      <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>المقابل المالي (دينار)</Label>
                    <Input type="number" step="0.01" value={form.financial_amount} onChange={e => setForm(f => ({ ...f, financial_amount: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ممثل الوزارة / المديرية</Label>
                      <Input value={form.ministry_representative} onChange={e => setForm(f => ({ ...f, ministry_representative: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>ممثل المدرسة</Label>
                      <Input value={form.school_representative} onChange={e => setForm(f => ({ ...f, school_representative: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                  إنشاء العقد
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-sm text-muted-foreground">إجمالي العقود</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-primary">{active}</p>
              <p className="text-sm text-muted-foreground">عقود نشطة</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-primary">{completed}</p>
              <p className="text-sm text-muted-foreground">مكتملة</p>
            </CardContent>
          </Card>
        </div>

        {/* Contracts List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !contracts?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد عقود حالياً
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {contracts.map((contract: any) => {
              const sc = statusConfig[contract.status] || statusConfig.draft;
              const progress = contract.total_hours > 0 ? Math.round((contract.completed_hours / contract.total_hours) * 100) : 0;
              return (
                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        {contract.trainer_name}
                      </CardTitle>
                      <Badge variant={sc.variant} className="gap-1">
                        <sc.icon className="h-3 w-3" />
                        {sc.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>{contract.trainer_specialization}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{contract.skill_program}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{contract.start_date} → {contract.end_date}</span>
                      </div>
                      {contract.financial_amount && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Banknote className="h-3.5 w-3.5" />
                          <span>{contract.financial_amount} دينار</span>
                        </div>
                      )}
                    </div>

                    {/* Hours progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> الساعات المنجزة</span>
                        <span>{contract.completed_hours} / {contract.total_hours} ساعة</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Parties */}
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {contract.ministry_representative && <p>الفريق الأول (الوزارة): {contract.ministry_representative}</p>}
                      {contract.school_representative && <p>الفريق الثاني (المدرسة): {contract.school_representative}</p>}
                      <p>الفريق الثالث (المدرب): {contract.trainer_name}</p>
                    </div>

                    {/* Actions */}
                    {isAdmin && (
                      <div className="flex gap-2 pt-2 flex-wrap">
                        {contract.status === "draft" && (
                          <Button size="sm" variant="default" onClick={() => handleStatusChange(contract.id, "active")} className="gap-1">
                            <PlayCircle className="h-3 w-3" /> تفعيل
                          </Button>
                        )}
                        {contract.status === "active" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setEditDialog({ type: "hours", contract })} className="gap-1">
                              <Clock className="h-3 w-3" /> تحديث الساعات
                            </Button>
                            <Button size="sm" variant="default" onClick={() => handleStatusChange(contract.id, "completed")} className="gap-1">
                              <CheckCircle2 className="h-3 w-3" /> إكمال
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleStatusChange(contract.id, "terminated")} className="gap-1">
                              <XCircle className="h-3 w-3" /> إنهاء
                            </Button>
                          </>
                        )}
                        {(contract.status === "active" || contract.status === "completed") && (
                          <Button size="sm" variant="outline" onClick={() => setEditDialog({ type: "report", contract })} className="gap-1">
                            <FileText className="h-3 w-3" /> التقرير
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Final report display */}
                    {contract.final_report && (
                      <div className="bg-muted/50 rounded p-2 text-xs mt-2">
                        <p className="font-semibold mb-1">التقرير الختامي:</p>
                        <p>{contract.final_report}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Hours Dialog */}
        <EditHoursDialog
          open={editDialog?.type === "hours"}
          contract={editDialog?.contract}
          onClose={() => setEditDialog(null)}
          onSave={handleUpdateHours}
          isPending={updateMutation.isPending}
        />

        {/* Report Dialog */}
        <ReportDialog
          open={editDialog?.type === "report"}
          contract={editDialog?.contract}
          onClose={() => setEditDialog(null)}
          onSave={handleSaveReport}
          isPending={updateMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}

function EditHoursDialog({ open, contract, onClose, onSave, isPending }: any) {
  const [hours, setHours] = useState("");
  if (!open || !contract) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>تحديث الساعات المنجزة</DialogTitle></DialogHeader>
        <div className="space-y-3 py-4">
          <p className="text-sm text-muted-foreground">الحد الأقصى: {contract.total_hours} ساعة</p>
          <Input type="number" placeholder="عدد الساعات المنجزة" value={hours} onChange={e => setHours(e.target.value)} max={contract.total_hours} />
        </div>
        <Button onClick={() => onSave(contract.id, parseInt(hours))} disabled={isPending || !hours}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null} حفظ
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ReportDialog({ open, contract, onClose, onSave, isPending }: any) {
  const [report, setReport] = useState(contract?.final_report || "");
  const [evalNotes, setEvalNotes] = useState(contract?.trainee_evaluation_notes || "");
  if (!open || !contract) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader><DialogTitle>التقرير الختامي وتقييم المتدربين</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>التقرير الختامي عن البرنامج</Label>
            <Textarea rows={4} value={report} onChange={e => setReport(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>ملاحظات تقييم المتدربين</Label>
            <Textarea rows={3} value={evalNotes} onChange={e => setEvalNotes(e.target.value)} />
          </div>
        </div>
        <Button onClick={() => onSave(contract.id, report, evalNotes)} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null} حفظ التقرير
        </Button>
      </DialogContent>
    </Dialog>
  );
}
