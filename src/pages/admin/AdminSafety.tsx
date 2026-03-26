import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HeartPulse, AlertTriangle, Shield, Loader2, TrendingUp } from "lucide-react";
import { useAdminIncidents, severityLabels, statusLabels } from "@/hooks/useIncidentData";

const severityColors: Record<string, string> = {
  minor: "bg-green-100 text-green-800 hover:bg-green-100",
  moderate: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  serious: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  critical: "bg-red-100 text-red-800 hover:bg-red-100",
};

const statusColors: Record<string, string> = {
  reported: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  first_aid: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  medical_report: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  under_treatment: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  resolved: "bg-green-100 text-green-800 hover:bg-green-100",
  closed: "bg-muted text-muted-foreground hover:bg-muted",
};

const AdminSafety = () => {
  const { data: incidents = [], isLoading } = useAdminIncidents();

  const total = incidents.length;
  const active = incidents.filter((i: any) => !["resolved", "closed"].includes(i.status)).length;
  const critical = incidents.filter((i: any) => i.severity === "critical" || i.severity === "serious").length;
  const resolved = incidents.filter((i: any) => i.status === "resolved" || i.status === "closed").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-7 w-7 text-destructive" />
          <h1 className="text-2xl font-bold">السلامة المهنية — إصابات التدريب</h1>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card className="border-r-4 border-r-primary">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">إجمالي الحوادث</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{total}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-orange-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">حالات نشطة</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-orange-600">{active}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-red-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">خطيرة / حرجة</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-red-600">{critical}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">تم حلها</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-600">{resolved}</div></CardContent>
          </Card>
        </div>

        {critical > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                تنبيه: {critical} إصابة خطيرة/حرجة — يجب إبلاغ قسم الأمن والسلامة المهنية في المديرية وفق تعميم الرعاية الصحية
              </span>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : incidents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="text-lg font-medium">لا توجد إصابات مسجلة</p>
              <p className="text-sm mt-1">بيئة تدريب آمنة — مؤشر إيجابي ✅</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>سجل جميع الحوادث والإصابات ({total})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الطالب</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الشدة</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">الموقع</TableHead>
                      <TableHead className="text-right">الإسعاف</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((inc: any) => (
                      <TableRow key={inc.id}>
                        <TableCell className="text-right whitespace-nowrap">{inc.incident_date}</TableCell>
                        <TableCell className="text-right font-medium">{inc.studentName}</TableCell>
                        <TableCell className="text-right"><Badge variant="outline">{inc.typeLabel}</Badge></TableCell>
                        <TableCell className="text-right"><Badge className={severityColors[inc.severity]}>{inc.severityLabel}</Badge></TableCell>
                        <TableCell className="text-right max-w-[200px] truncate">{inc.description}</TableCell>
                        <TableCell className="text-right">{inc.location ?? "—"}</TableCell>
                        <TableCell className="text-right">{inc.first_aid_provided ? "✅ نعم" : "—"}</TableCell>
                        <TableCell className="text-right"><Badge className={statusColors[inc.status]}>{inc.statusLabel}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coverage info card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              معلومات التغطية الصحية
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>بموجب تعميم وزارة التربية والتعليم بالتعاون مع وزارة الصحة:</p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>فترة التغطية: 1/7/2026 – 31/12/2026</li>
              <li>يشمل طلبة التعليم المهني أثناء التدريب العملي</li>
              <li>يجب الإبلاغ الفوري عن أي إصابة لضمان حق العلاج</li>
              <li>التأخر بالإبلاغ يُسقط حق المصاب بالعلاج على نفقة الوزارة</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSafety;
