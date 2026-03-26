import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  usePolicyViolations, useCreateViolation, useUpdateViolation,
  useCorrectiveActions, useCreateCorrectiveAction, useUpdateCorrectiveAction,
  useResubmissionRequests, useUpdateResubmission,
  PEARSON_THRESHOLDS, type ViolationType, type ViolationSeverity, type ViolationStatus,
  type CorrectiveStatus,
} from "@/hooks/usePolicyViolations";
import { toast } from "sonner";
import {
  AlertTriangle, ShieldAlert, FileWarning, CheckCircle2, XCircle,
  Clock, Loader2, Plus, ArrowUpCircle, ClipboardList, RefreshCw, UserX,
} from "lucide-react";

const severityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  warning: { label: "تحذير", variant: "secondary", color: "text-yellow-600" },
  formal_warning: { label: "تحذير رسمي", variant: "default", color: "text-orange-600" },
  action_plan: { label: "خطة إجراءات", variant: "destructive", color: "text-red-600" },
  referral: { label: "إحالة", variant: "destructive", color: "text-red-800" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "مفتوح", variant: "destructive" },
  acknowledged: { label: "تم الإقرار", variant: "default" },
  resolved: { label: "تم الحل", variant: "outline" },
  escalated: { label: "مصعّد", variant: "destructive" },
};

const typeLabels: Record<string, string> = {
  absence: "غياب متكرر",
  non_submission: "عدم تسليم",
  late_submission: "تسليم متأخر",
  evidence_rejected: "رفض دليل",
};

export default function SchoolPolicyViolations() {
  const { data: violations, isLoading } = usePolicyViolations();
  const { data: actions } = useCorrectiveActions();
  const { data: resubmissions } = useResubmissionRequests();
  const createViolation = useCreateViolation();
  const updateViolation = useUpdateViolation();
  const createAction = useCreateCorrectiveAction();
  const updateAction = useUpdateCorrectiveAction();
  const updateResub = useUpdateResubmission();

  const [createOpen, setCreateOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<any>(null);

  // Stats
  const openCount = violations?.filter((v: any) => v.status === "open" || v.status === "escalated").length ?? 0;
  const resolvedCount = violations?.filter((v: any) => v.status === "resolved").length ?? 0;
  const pendingActions = actions?.filter((a: any) => a.status === "pending" || a.status === "in_progress").length ?? 0;
  const pendingResubs = resubmissions?.filter((r: any) => r.status === "pending").length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              محرك سياسات الغياب والتسليم
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              معايير Pearson: {PEARSON_THRESHOLDS.ABSENCE_WARNING} غيابات = تحذير | {PEARSON_THRESHOLDS.ABSENCE_FORMAL_WARNING} = تحذير رسمي | {PEARSON_THRESHOLDS.ABSENCE_ACTION_PLAN}+ = خطة إجراءات
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> تسجيل مخالفة
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={AlertTriangle} label="مخالفات مفتوحة" value={openCount} color="text-destructive" />
          <StatCard icon={CheckCircle2} label="تم حلها" value={resolvedCount} color="text-primary" />
          <StatCard icon={ClipboardList} label="خطط تصحيحية نشطة" value={pendingActions} color="text-orange-500" />
          <StatCard icon={RefreshCw} label="طلبات إعادة تسليم" value={pendingResubs} color="text-blue-500" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="violations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="violations">المخالفات ({violations?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="actions">الخطط التصحيحية ({actions?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="resubmissions">إعادة التسليم ({resubmissions?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="violations">
            <ViolationsList
              violations={violations}
              isLoading={isLoading}
              onStatusChange={async (id, status) => {
                try {
                  await updateViolation.mutateAsync({ id, status: status as ViolationStatus });
                  toast.success("تم تحديث حالة المخالفة");
                } catch (e: any) { toast.error(e.message); }
              }}
              onCreateAction={(violation: any) => setActionDialog(violation)}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ActionsList
              actions={actions}
              onUpdateStatus={async (id, status, notes) => {
                try {
                  await updateAction.mutateAsync({ id, status: status as CorrectiveStatus, outcome_notes: notes });
                  toast.success("تم تحديث الخطة التصحيحية");
                } catch (e: any) { toast.error(e.message); }
              }}
            />
          </TabsContent>

          <TabsContent value="resubmissions">
            <ResubmissionsList
              resubmissions={resubmissions}
              onUpdate={async (id, status, notes) => {
                try {
                  await updateResub.mutateAsync({ id, status: status as any, reviewer_notes: notes });
                  toast.success("تم تحديث طلب إعادة التسليم");
                } catch (e: any) { toast.error(e.message); }
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Create Violation Dialog */}
        <CreateViolationDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSubmit={async (data) => {
            try {
              await createViolation.mutateAsync(data);
              toast.success("تم تسجيل المخالفة بنجاح");
              setCreateOpen(false);
            } catch (e: any) { toast.error(e.message); }
          }}
          isPending={createViolation.isPending}
        />

        {/* Create Action Plan Dialog */}
        <CreateActionDialog
          violation={actionDialog}
          onClose={() => setActionDialog(null)}
          onSubmit={async (data) => {
            try {
              await createAction.mutateAsync(data);
              toast.success("تم إنشاء الخطة التصحيحية");
              setActionDialog(null);
            } catch (e: any) { toast.error(e.message); }
          }}
          isPending={createAction.isPending}
        />
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="pt-4 text-center">
        <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function ViolationsList({ violations, isLoading, onStatusChange, onCreateAction }: any) {
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!violations?.length) return <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد مخالفات مسجلة</CardContent></Card>;

  return (
    <div className="grid gap-3">
      {violations.map((v: any) => {
        const sev = severityConfig[v.severity] || severityConfig.warning;
        const st = statusConfig[v.status] || statusConfig.open;
        return (
          <Card key={v.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <UserX className={`h-4 w-4 ${sev.color}`} />
                  <span className="font-semibold text-sm">{v.students?.profiles?.full_name || "طالب"}</span>
                  <span className="text-xs text-muted-foreground">({v.students?.student_number})</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant={sev.variant}>{sev.label}</Badge>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{typeLabels[v.violation_type]}</Badge>
                <span className="text-muted-foreground">{v.description}</span>
              </div>
              {v.absence_count && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>الغيابات</span>
                    <span>{v.absence_count} / {PEARSON_THRESHOLDS.ABSENCE_REFERRAL}</span>
                  </div>
                  <Progress value={Math.min((v.absence_count / PEARSON_THRESHOLDS.ABSENCE_REFERRAL) * 100, 100)} className="h-2" />
                </div>
              )}
              <div className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString("ar-JO")}</div>
              {v.status !== "resolved" && (
                <div className="flex gap-2 pt-1 flex-wrap">
                  {v.status === "open" && (
                    <Button size="sm" variant="outline" onClick={() => onStatusChange(v.id, "acknowledged")} className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> إقرار
                    </Button>
                  )}
                  {(v.severity === "action_plan" || v.severity === "referral") && (
                    <Button size="sm" variant="default" onClick={() => onCreateAction(v)} className="gap-1">
                      <ClipboardList className="h-3 w-3" /> خطة تصحيحية
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onStatusChange(v.id, "escalated")} className="gap-1">
                    <ArrowUpCircle className="h-3 w-3" /> تصعيد
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onStatusChange(v.id, "resolved")} className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> تم الحل
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ActionsList({ actions, onUpdateStatus }: any) {
  const [notes, setNotes] = useState("");
  if (!actions?.length) return <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد خطط تصحيحية</CardContent></Card>;

  const actionStatusLabels: Record<string, string> = {
    pending: "قيد الانتظار", in_progress: "قيد التنفيذ", completed: "مكتمل", failed: "فشل",
  };

  return (
    <div className="grid gap-3">
      {actions.map((a: any) => (
        <Card key={a.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium">{a.plan_description}</p>
              <Badge variant={a.status === "completed" ? "outline" : a.status === "failed" ? "destructive" : "default"}>
                {actionStatusLabels[a.status]}
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>الموعد النهائي: {a.deadline}</span>
            </div>
            {a.outcome_notes && <p className="text-xs bg-muted/50 rounded p-2">{a.outcome_notes}</p>}
            {(a.status === "pending" || a.status === "in_progress") && (
              <div className="space-y-2">
                <Input placeholder="ملاحظات النتيجة" value={notes} onChange={e => setNotes(e.target.value)} />
                <div className="flex gap-2">
                  {a.status === "pending" && (
                    <Button size="sm" onClick={() => onUpdateStatus(a.id, "in_progress", notes)}>بدء التنفيذ</Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => { onUpdateStatus(a.id, "completed", notes); setNotes(""); }}>
                    إكمال
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { onUpdateStatus(a.id, "failed", notes); setNotes(""); }}>
                    فشل
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ResubmissionsList({ resubmissions, onUpdate }: any) {
  const [reviewNotes, setReviewNotes] = useState("");
  if (!resubmissions?.length) return <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد طلبات إعادة تسليم</CardContent></Card>;

  const resubStatusLabels: Record<string, string> = {
    pending: "بانتظار المراجعة", submitted: "تم التسليم", approved: "مقبول", rejected: "مرفوض",
  };

  return (
    <div className="grid gap-3">
      {resubmissions.map((r: any) => (
        <Card key={r.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">{r.students?.profiles?.full_name}</p>
                <p className="text-xs text-muted-foreground">{r.reason}</p>
              </div>
              <Badge variant={r.status === "approved" ? "outline" : r.status === "rejected" ? "destructive" : "default"}>
                {resubStatusLabels[r.status]}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">الموعد الجديد: {r.new_deadline}</div>
            {r.reviewer_notes && <p className="text-xs bg-muted/50 rounded p-2">{r.reviewer_notes}</p>}
            {r.status === "pending" && (
              <div className="space-y-2">
                <Input placeholder="ملاحظات المراجعة" value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { onUpdate(r.id, "approved", reviewNotes); setReviewNotes(""); }}>قبول</Button>
                  <Button size="sm" variant="destructive" onClick={() => { onUpdate(r.id, "rejected", reviewNotes); setReviewNotes(""); }}>رفض</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CreateViolationDialog({ open, onClose, onSubmit, isPending }: any) {
  const [form, setForm] = useState({
    student_id: "", violation_type: "absence" as ViolationType,
    severity: "warning" as ViolationSeverity, description: "", absence_count: "",
  });

  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader><DialogTitle>تسجيل مخالفة جديدة</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>معرّف الطالب (UUID)</Label>
            <Input value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} placeholder="أدخل معرّف الطالب" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع المخالفة</Label>
              <Select value={form.violation_type} onValueChange={v => setForm(f => ({ ...f, violation_type: v as ViolationType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="absence">غياب متكرر</SelectItem>
                  <SelectItem value="non_submission">عدم تسليم</SelectItem>
                  <SelectItem value="late_submission">تسليم متأخر</SelectItem>
                  <SelectItem value="evidence_rejected">رفض دليل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>مستوى الخطورة</Label>
              <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v as ViolationSeverity }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="formal_warning">تحذير رسمي</SelectItem>
                  <SelectItem value="action_plan">خطة إجراءات</SelectItem>
                  <SelectItem value="referral">إحالة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.violation_type === "absence" && (
            <div className="space-y-2">
              <Label>عدد الغيابات</Label>
              <Input type="number" value={form.absence_count} onChange={e => setForm(f => ({ ...f, absence_count: e.target.value }))} />
            </div>
          )}
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
        </div>
        <Button onClick={() => onSubmit({
          student_id: form.student_id,
          violation_type: form.violation_type,
          severity: form.severity,
          description: form.description,
          absence_count: form.absence_count ? parseInt(form.absence_count) : undefined,
        })} disabled={isPending || !form.student_id || !form.description}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />} تسجيل المخالفة
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function CreateActionDialog({ violation, onClose, onSubmit, isPending }: any) {
  const [form, setForm] = useState({ plan_description: "", deadline: "" });
  if (!violation) return null;
  return (
    <Dialog open={!!violation} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>إنشاء خطة تصحيحية</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">للمخالفة: {violation.description}</p>
          <div className="space-y-2">
            <Label>وصف الخطة التصحيحية</Label>
            <Textarea value={form.plan_description} onChange={e => setForm(f => ({ ...f, plan_description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>الموعد النهائي</Label>
            <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
        </div>
        <Button onClick={() => onSubmit({
          violation_id: violation.id,
          student_id: violation.student_id,
          plan_description: form.plan_description,
          deadline: form.deadline,
        })} disabled={isPending || !form.plan_description || !form.deadline}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />} إنشاء الخطة
        </Button>
      </DialogContent>
    </Dialog>
  );
}
