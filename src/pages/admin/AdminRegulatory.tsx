import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, FileText, GraduationCap, AlertOctagon, Loader2 } from "lucide-react";
import {
  useAdminProgramAuthorizations,
  useAdminQualificationMappings,
  useAdminProgramRisks,
  useAdminRegulatoryStatus,
} from "@/hooks/useAdminData";

const statusColors: Record<string, string> = {
  COMPLIANT: "bg-green-100 text-green-800 hover:bg-green-100",
  WARNING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  NON_COMPLIANT: "bg-red-100 text-red-800 hover:bg-red-100",
};
const statusLabels: Record<string, string> = { COMPLIANT: "متوافق", WARNING: "تحذير", NON_COMPLIANT: "غير متوافق" };

const authStatusLabels: Record<string, string> = { Approved: "معتمد", Proposed: "مقترح", Suspended: "معلّق", Closed: "مغلق" };
const authStatusColors: Record<string, string> = {
  Approved: "bg-green-100 text-green-800 hover:bg-green-100",
  Proposed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Suspended: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Closed: "bg-muted text-muted-foreground hover:bg-muted",
};

const qmStatusLabels: Record<string, string> = { Endorsed: "معتمد", Draft: "مسودة", Expired: "منتهي" };
const qmStatusColors: Record<string, string> = {
  Endorsed: "bg-green-100 text-green-800 hover:bg-green-100",
  Draft: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Expired: "bg-red-100 text-red-800 hover:bg-red-100",
};

const riskCategoryLabels: Record<string, string> = { Capacity: "السعة", Industry: "القطاع الصناعي", Financial: "المالية", Safety: "السلامة", Policy: "السياسات" };
const riskStatusLabels: Record<string, string> = { Open: "مفتوح", Monitoring: "قيد المراقبة", Mitigated: "مُخفف", Escalated: "متصاعد" };
const riskStatusColors: Record<string, string> = {
  Open: "bg-red-100 text-red-800 hover:bg-red-100",
  Monitoring: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Mitigated: "bg-green-100 text-green-800 hover:bg-green-100",
  Escalated: "bg-red-200 text-red-900 hover:bg-red-200",
};
const likelihoodLabels: Record<string, string> = { Low: "منخفض", Medium: "متوسط", High: "عالي" };
const impactLabels: Record<string, string> = { Moderate: "معتدل", Serious: "خطير", Critical: "حرج" };

const AdminRegulatory = () => {
  const { data: authorizations, isLoading: loadingAuth } = useAdminProgramAuthorizations();
  const { data: mappings, isLoading: loadingQM } = useAdminQualificationMappings();
  const { data: risks, isLoading: loadingRisks } = useAdminProgramRisks();
  const summary = useAdminRegulatoryStatus();

  const isLoading = loadingAuth || loadingQM || loadingRisks;
  const currentAuth = summary.currentAuth;
  const quota = currentAuth?.authorized_student_quota ?? 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">المواءمة التنظيمية</h1>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-r-4 border-r-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">التصريح السنوي</CardTitle>
            </CardHeader>
            <CardContent>
              {currentAuth ? (
                <>
                  <Badge className={authStatusColors[currentAuth.status]}>{authStatusLabels[currentAuth.status]}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">دورة {currentAuth.cycle_year}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">لا يوجد تصريح</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الحصة المصرح بها</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeStudents} / {quota}</div>
              {quota > 0 && <Progress value={(summary.activeStudents / quota) * 100} className="mt-2 h-2" />}
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">المسارات المعتمدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.endorsedCount} / {summary.totalMappings}</div>
              <p className="mt-1 text-xs text-muted-foreground">في إطار المؤهلات الوطني</p>
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">حالة المواءمة</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={statusColors[summary.overallStatus]}>{statusLabels[summary.overallStatus]}</Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.overallStatus === "COMPLIANT" ? "جميع المحاور متوافقة" : "يوجد محاور تحتاج مراجعة"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="authorization" dir="rtl">
          <TabsList>
            <TabsTrigger value="authorization" className="gap-1.5"><FileText className="h-4 w-4" /> التصريح البرنامجي</TabsTrigger>
            <TabsTrigger value="qualifications" className="gap-1.5"><GraduationCap className="h-4 w-4" /> مواءمة المؤهلات</TabsTrigger>
            <TabsTrigger value="risks" className="gap-1.5"><AlertOctagon className="h-4 w-4" /> المخاطر الاستراتيجية</TabsTrigger>
          </TabsList>

          {/* Tab 1: Authorization */}
          <TabsContent value="authorization" className="mt-4">
            <Card>
              <CardHeader><CardTitle>تفاصيل التصريح البرنامجي</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {currentAuth ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">السنة الدراسية</p>
                        <p className="font-semibold">{currentAuth.cycle_year}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">الجهة المصرّحة</p>
                        <p className="font-semibold">{currentAuth.approval_authority}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">رقم المرجع</p>
                        <p className="font-semibold font-mono text-sm">{currentAuth.approval_reference}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">تاريخ الموافقة</p>
                        <p className="font-semibold">{currentAuth.approval_date ?? "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">مرجع الميزانية</p>
                        <p className="font-semibold font-mono text-sm">{currentAuth.budget_envelope_reference}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">الحالة</p>
                        <Badge className={authStatusColors[currentAuth.status]}>{authStatusLabels[currentAuth.status]}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">القطاعات المصرح بها</p>
                      <div className="flex flex-wrap gap-2">
                        {(currentAuth.authorized_sectors as string[]).map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">استخدام الحصة</p>
                      <div className="flex items-center gap-3">
                        <Progress value={quota > 0 ? (summary.activeStudents / quota) * 100 : 0} className="h-3 flex-1" />
                        <span className="text-sm font-semibold">{quota > 0 ? Math.round((summary.activeStudents / quota) * 100) : 0}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{summary.activeStudents} طالب نشط من أصل {quota} مصرّح</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">لا يوجد تصريح للسنة الحالية</p>
                )}

                {/* All authorizations history */}
                {(authorizations ?? []).length > 1 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">سجل التصاريح</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">السنة</TableHead>
                          <TableHead className="text-right">الحصة</TableHead>
                          <TableHead className="text-right">الجهة</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(authorizations ?? []).map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-right">{a.cycle_year}</TableCell>
                            <TableCell className="text-right">{a.authorized_student_quota}</TableCell>
                            <TableCell className="text-right">{a.approval_authority}</TableCell>
                            <TableCell className="text-right">
                              <Badge className={authStatusColors[a.status]}>{authStatusLabels[a.status]}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Qualifications */}
          <TabsContent value="qualifications" className="mt-4">
            <Card>
              <CardHeader><CardTitle>ربط المسارات بإطار المؤهلات الوطني</CardTitle></CardHeader>
              <CardContent>
                {(mappings ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">لا توجد مسارات مسجلة</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">القطاع</TableHead>
                        <TableHead className="text-right">المسار</TableHead>
                        <TableHead className="text-right">مستوى NQF</TableHead>
                        <TableHead className="text-right">مجالات المخرجات</TableHead>
                        <TableHead className="text-right">الجهة المعتمدة</TableHead>
                        <TableHead className="text-right">الصلاحية</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(mappings ?? []).map((qm) => (
                        <TableRow key={qm.id}>
                          <TableCell className="text-right font-medium">{qm.sector}</TableCell>
                          <TableCell className="text-right">{qm.pathway_name}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">المستوى {qm.mapped_nqf_level}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap gap-1">
                              {(qm.learning_outcome_domains as string[]).map((d) => (
                                <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{qm.endorsed_by || "—"}</TableCell>
                          <TableCell className="text-right text-xs">
                            {qm.valid_from && qm.valid_to ? `${qm.valid_from} → ${qm.valid_to}` : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className={qmStatusColors[qm.status]}>{qmStatusLabels[qm.status]}</Badge>
                            {qm.status === "Draft" && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-yellow-700">
                                <AlertTriangle className="h-3 w-3" /> لم يُعتمد بعد
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Strategic Risks */}
          <TabsContent value="risks" className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {(["Open", "Monitoring", "Mitigated", "Escalated"] as const).map((status) => {
                const count = (risks ?? []).filter((r) => r.status === status).length;
                return (
                  <Card key={status} className="text-center">
                    <CardContent className="pt-4 pb-3">
                      <Badge className={riskStatusColors[status]}>{riskStatusLabels[status]}</Badge>
                      <div className="text-2xl font-bold mt-1">{count}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader><CardTitle>سجل المخاطر الاستراتيجية</CardTitle></CardHeader>
              <CardContent>
                {(risks ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">لا توجد مخاطر مسجلة</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الفئة</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">الاحتمال</TableHead>
                        <TableHead className="text-right">الأثر</TableHead>
                        <TableHead className="text-right">خطة التخفيف</TableHead>
                        <TableHead className="text-right">الجهة</TableHead>
                        <TableHead className="text-right">آخر مراجعة</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(risks ?? []).map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-right font-medium">{riskCategoryLabels[r.category]}</TableCell>
                          <TableCell className="text-right max-w-[200px]">{r.description}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className={r.likelihood === "High" ? "border-red-300 text-red-700" : r.likelihood === "Medium" ? "border-yellow-300 text-yellow-700" : "border-green-300 text-green-700"}>
                              {likelihoodLabels[r.likelihood]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className={r.impact === "Critical" ? "border-red-400 text-red-800" : r.impact === "Serious" ? "border-orange-300 text-orange-700" : "border-blue-300 text-blue-700"}>
                              {impactLabels[r.impact]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right max-w-[200px] text-sm">{r.mitigation_plan}</TableCell>
                          <TableCell className="text-right text-sm">{r.owner_authority}</TableCell>
                          <TableCell className="text-right text-sm">{r.last_reviewed ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={riskStatusColors[r.status]}>{riskStatusLabels[r.status]}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminRegulatory;
