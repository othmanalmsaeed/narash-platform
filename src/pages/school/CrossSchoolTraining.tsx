import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCrossTrainingSchools, useCrossTrainingRequests,
  useCreateCrossTrainingRequest, useUpdateCrossTrainingRequest,
} from "@/hooks/useCrossTraining";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeftRight, School, Target, Loader2, CheckCircle2, XCircle,
  Clock, Send, Building2, GraduationCap, MapPin,
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "بانتظار الموافقة", variant: "secondary" },
  approved_source: { label: "موافقة المدرسة المصدر", variant: "default" },
  approved_destination: { label: "موافقة المدرسة المستقبلة", variant: "default" },
  fully_approved: { label: "موافقة كاملة", variant: "outline" },
  rejected: { label: "مرفوض", variant: "destructive" },
  completed: { label: "مكتمل", variant: "outline" },
};

const currentYear = new Date().getFullYear();

export default function CrossSchoolTraining() {
  const { role } = useAuth();
  const { data: availableSchools, isLoading: loadingSchools } = useCrossTrainingSchools(currentYear);
  const { data: requests, isLoading: loadingRequests } = useCrossTrainingRequests();
  const createRequest = useCreateCrossTrainingRequest();
  const updateRequest = useUpdateCrossTrainingRequest();
  const [requestDialog, setRequestDialog] = useState<any>(null);
  const [rejectDialog, setRejectDialog] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const isStudent = role === "student";
  const isAdmin = role === "admin" || role === "school_supervisor";

  // Group available schools by school
  const schoolsGrouped = (availableSchools ?? []).reduce((acc: any, item: any) => {
    if (!acc[item.school_id]) {
      acc[item.school_id] = { school_id: item.school_id, school_name: item.school_name, region: item.region, objectives: [] };
    }
    acc[item.school_id].objectives.push(item);
    return acc;
  }, {});

  const handleSubmitRequest = async () => {
    if (!requestDialog || !reason.trim()) return;
    try {
      await createRequest.mutateAsync({
        destination_school_id: requestDialog.school_id,
        objective_id: requestDialog.objective_id,
        reason: reason.trim(),
      });
      toast.success("تم إرسال طلب التدريب عبر المدارس");
      setRequestDialog(null);
      setReason("");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleApprove = async (id: string, type: "approve_source" | "approve_destination") => {
    try {
      await updateRequest.mutateAsync({ id, action: type });
      toast.success("تمت الموافقة على الطلب");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    try {
      await updateRequest.mutateAsync({ id: rejectDialog, action: "reject", rejectionReason: rejectionReason.trim() });
      toast.success("تم رفض الطلب");
      setRejectDialog(null);
      setRejectionReason("");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            التدريب عبر المدارس
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            تصفح الأهداف التدريبية في مدارس أخرى بنفس المديرية وقدم طلب تدريب مشترك
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 text-center">
            <Building2 className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{Object.keys(schoolsGrouped).length}</p>
            <p className="text-xs text-muted-foreground">مدارس متاحة</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{availableSchools?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">أهداف مختلفة</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{requests?.filter((r: any) => r.status === "pending" || r.status === "approved_source" || r.status === "approved_destination").length ?? 0}</p>
            <p className="text-xs text-muted-foreground">طلبات قيد المعالجة</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{requests?.filter((r: any) => r.status === "fully_approved").length ?? 0}</p>
            <p className="text-xs text-muted-foreground">طلبات معتمدة</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue={isStudent ? "browse" : "requests"} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">تصفح المدارس والأهداف</TabsTrigger>
            <TabsTrigger value="requests">الطلبات ({requests?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            {loadingSchools ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : Object.keys(schoolsGrouped).length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                لا توجد مدارس أخرى في نفس المديرية تقدم أهدافاً تدريبية مختلفة عن مدرستك
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {Object.values(schoolsGrouped).map((school: any) => (
                  <Card key={school.school_id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <School className="h-4 w-4 text-primary" />
                        {school.school_name}
                        <Badge variant="outline" className="mr-2 gap-1">
                          <MapPin className="h-3 w-3" /> {school.region}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">الأهداف التدريبية المتاحة (غير موجودة في مدرستك):</p>
                      <div className="grid gap-2">
                        {school.objectives.map((obj: any) => (
                          <div key={obj.objective_id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">{obj.sector}</Badge>
                              <span className="text-sm font-medium">
                                {obj.objective_number}. {obj.objective_title}
                              </span>
                            </div>
                            {isStudent && (
                              <Button size="sm" variant="default" onClick={() => setRequestDialog({
                                school_id: school.school_id, school_name: school.school_name,
                                objective_id: obj.objective_id, objective_title: obj.objective_title,
                              })} className="gap-1">
                                <Send className="h-3 w-3" /> تقديم طلب
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {loadingRequests ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : !requests?.length ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد طلبات</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {requests.map((r: any) => {
                  const st = statusConfig[r.status] || statusConfig.pending;
                  return (
                    <Card key={r.id}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <GraduationCap className="h-4 w-4 text-primary" />
                              {r.pathway_skills_matrix?.objective_title}
                              <Badge variant="outline" className="text-xs">{r.pathway_skills_matrix?.sector}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><School className="h-3 w-3" /> من: {r.source_school?.name}</span>
                              <span className="flex items-center gap-1"><ArrowLeftRight className="h-3 w-3" /></span>
                              <span className="flex items-center gap-1"><School className="h-3 w-3" /> إلى: {r.destination_school?.name}</span>
                            </div>
                          </div>
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">{r.reason}</p>
                        {r.rejection_reason && (
                          <p className="text-xs text-destructive bg-destructive/10 rounded p-2">سبب الرفض: {r.rejection_reason}</p>
                        )}
                        <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-JO")}</div>

                        {/* Admin actions */}
                        {isAdmin && r.status !== "fully_approved" && r.status !== "rejected" && r.status !== "completed" && (
                          <div className="flex gap-2 pt-1">
                            {(r.status === "pending" || r.status === "approved_destination") && (
                              <Button size="sm" onClick={() => handleApprove(r.id, "approve_source")} className="gap-1">
                                <CheckCircle2 className="h-3 w-3" /> موافقة (مدرسة المصدر)
                              </Button>
                            )}
                            {(r.status === "pending" || r.status === "approved_source") && (
                              <Button size="sm" variant="secondary" onClick={() => handleApprove(r.id, "approve_destination")} className="gap-1">
                                <CheckCircle2 className="h-3 w-3" /> موافقة (مدرسة الوجهة)
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => setRejectDialog(r.id)} className="gap-1">
                              <XCircle className="h-3 w-3" /> رفض
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Request Dialog */}
        <Dialog open={!!requestDialog} onOpenChange={() => { setRequestDialog(null); setReason(""); }}>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>طلب تدريب عبر المدارس</DialogTitle></DialogHeader>
            {requestDialog && (
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 rounded p-3 space-y-1 text-sm">
                  <p><strong>المدرسة:</strong> {requestDialog.school_name}</p>
                  <p><strong>الهدف التدريبي:</strong> {requestDialog.objective_title}</p>
                </div>
                <div className="space-y-2">
                  <Label>سبب الطلب ومبرراته</Label>
                  <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="اشرح لماذا ترغب بالتدريب على هذا الهدف في المدرسة الأخرى..." />
                </div>
                <Button onClick={handleSubmitRequest} disabled={createRequest.isPending || !reason.trim()} className="w-full">
                  {createRequest.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />} إرسال الطلب
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectionReason(""); }}>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>رفض الطلب</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>سبب الرفض</Label>
                <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={3} />
              </div>
              <Button variant="destructive" onClick={handleReject} disabled={updateRequest.isPending} className="w-full">
                {updateRequest.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />} تأكيد الرفض
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
