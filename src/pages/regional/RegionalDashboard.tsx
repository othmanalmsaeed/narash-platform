import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, School, Building2, Users, AlertTriangle, Loader2 } from "lucide-react";
import {
  useRegionalSchools,
  useRegionalCompanies,
  useRegionalStudents,
  useRegionalRisks,
} from "@/hooks/useRegionalData";

const accreditationBadge = (s: string | null) => {
  switch (s) {
    case "approved": return { label: "معتمد", cls: "bg-green-100 text-green-800 hover:bg-green-100" };
    case "suspended": return { label: "معلّق", cls: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" };
    case "revoked": return { label: "ملغى", cls: "bg-red-100 text-red-800 hover:bg-red-100" };
    default: return { label: "قيد الاعتماد", cls: "bg-muted text-muted-foreground hover:bg-muted" };
  }
};

const RegionalDashboard = () => {
  const { data: schoolData, isLoading: l1 } = useRegionalSchools();
  const { data: companies = [], isLoading: l2 } = useRegionalCompanies();
  const { data: students = [], isLoading: l3 } = useRegionalStudents();
  const { data: risks = [], isLoading: l4 } = useRegionalRisks();

  const isLoading = l1 || l2 || l3 || l4;
  const schools = schoolData?.schools ?? [];
  const region = schoolData?.region ?? "";
  const activeCompanies = companies.filter(c => c.is_active).length;
  const trainingStudents = students.filter(s => s.status === "training").length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">لوحة المنطقة — {region || "غير محددة"}</h1>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-r-4 border-r-primary">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">المدارس</CardTitle>
              <School className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{schools.length}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-blue-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">الشركات المشاركة</CardTitle>
              <Building2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCompanies} / {companies.length}</div>
            </CardContent>
          </Card>
          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">طلاب قيد التدريب</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{trainingStudents}</div></CardContent>
          </Card>
          <Card className="border-r-4 border-r-destructive">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">مخاطر مفتوحة</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{risks.length}</div></CardContent>
          </Card>
        </div>

        {/* Schools */}
        <Card>
          <CardHeader><CardTitle>المدارس التابعة</CardTitle></CardHeader>
          <CardContent>
            {schools.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد مدارس</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {schools.map((s) => (
                  <Badge key={s.id} variant="secondary" className="text-sm py-1 px-3">
                    {s.name} {s.district ? `(${s.district})` : ""}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Companies */}
        <Card>
          <CardHeader><CardTitle>الشركات في المنطقة</CardTitle></CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد شركات</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الشركة</TableHead>
                      <TableHead className="text-right">القطاع</TableHead>
                      <TableHead className="text-right">الاعتماد</TableHead>
                      <TableHead className="text-right">السعة</TableHead>
                      <TableHead className="text-right">نشطة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((c) => {
                      const badge = accreditationBadge(c.accreditation_status);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="text-right font-medium">{c.name}</TableCell>
                          <TableCell className="text-right">{c.sector}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={badge.cls}>{badge.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{c.capacity}</TableCell>
                          <TableCell className="text-right">
                            {c.is_active
                              ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">نعم</Badge>
                              : <Badge className="bg-muted text-muted-foreground hover:bg-muted">لا</Badge>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risks */}
        {risks.length > 0 && (
          <Card>
            <CardHeader><CardTitle>المخاطر المفتوحة</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">الفئة</TableHead>
                      <TableHead className="text-right">الاحتمالية</TableHead>
                      <TableHead className="text-right">الأثر</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {risks.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-right max-w-xs truncate">{r.description}</TableCell>
                        <TableCell className="text-right">{r.category}</TableCell>
                        <TableCell className="text-right">{r.likelihood}</TableCell>
                        <TableCell className="text-right">{r.impact}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RegionalDashboard;