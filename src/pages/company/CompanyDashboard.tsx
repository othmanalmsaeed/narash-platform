import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMyStudents } from "@/hooks/useCompanyData";
import { Users, UserCheck, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonStatGrid, SkeletonTable } from "@/components/ui/skeleton-card";

const statusMap: Record<string, { label: string; cls: string }> = {
  training: { label: "قيد التدريب", cls: "bg-info/10 text-info hover:bg-info/10 border-info/20" },
  completed: { label: "مكتمل", cls: "bg-success/10 text-success hover:bg-success/10 border-success/20" },
  enrolled: { label: "مسجّل", cls: "bg-warning/10 text-warning hover:bg-warning/10 border-warning/20" },
  withdrawn: { label: "منسحب", cls: "bg-destructive/10 text-destructive hover:bg-destructive/10 border-destructive/20" },
};

const CompanyDashboard = () => {
  const { data: students = [], isLoading } = useMyStudents();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader title="لوحة تحكم مشرف العمل" icon={Users} />
          <SkeletonStatGrid count={3} />
          <SkeletonTable />
        </div>
      </DashboardLayout>
    );
  }

  const training = students.filter((s) => s.status === "training").length;
  const completed = students.filter((s) => s.status === "completed").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="لوحة تحكم مشرف العمل" icon={Users} description="متابعة الطلاب وتقييم أدائهم" />

        <div className="grid gap-4 sm:grid-cols-3 stagger-children">
          <StatCard label="إجمالي الطلاب" value={students.length} icon={Users} strip="primary" />
          <StatCard label="قيد التدريب" value={training} icon={Clock} strip="info" />
          <StatCard label="مكتمل" value={completed} icon={UserCheck} strip="success" />
        </div>

        <Card className="card-interactive">
          <CardHeader><CardTitle>قائمة الطلاب</CardTitle></CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <EmptyState icon={Users} title="لا يوجد طلاب مرتبطين حالياً" description="سيظهر هنا الطلاب المعيّنون لك" />
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الطالب</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التقدم</TableHead>
                      <TableHead>الساعات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => {
                      const st = statusMap[s.status] ?? statusMap.enrolled;
                      const progress = s.totalHours > 0 ? Math.round((s.completedHours / s.totalHours) * 100) : 0;
                      return (
                        <TableRow key={s.studentId} className="group hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell><Badge variant="outline" className={st.cls}>{st.label}</Badge></TableCell>
                          <TableCell><Progress value={progress} className="h-2 w-24" /></TableCell>
                          <TableCell className="text-muted-foreground">{s.completedHours}/{s.totalHours}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
