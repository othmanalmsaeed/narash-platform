import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchoolObservations, useSchoolWitness, useSchoolJournals } from "@/hooks/useSchoolData";
import { Eye, FileText, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonStatGrid } from "@/components/ui/skeleton-card";

const SchoolDashboard = () => {
  const { data: observations = [], isLoading: l1 } = useSchoolObservations();
  const { data: witnesses = [], isLoading: l2 } = useSchoolWitness();
  const { data: journals = [], isLoading: l3 } = useSchoolJournals();

  const isLoading = l1 || l2 || l3;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader title="لوحة تحكم المشرف المدرسي" icon={Eye} />
          <SkeletonStatGrid count={3} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="لوحة تحكم المشرف المدرسي" icon={Eye} description="متابعة المراقبة والتقييم والسجلات" />

        <div className="grid gap-4 sm:grid-cols-3 stagger-children">
          <StatCard label="سجلات المراقبة" value={observations.length} icon={Eye} strip="primary" />
          <StatCard label="شهادات الشاهد" value={witnesses.length} icon={FileText} strip="info" />
          <StatCard label="سجلات الطلاب" value={journals.length} icon={BookOpen} strip="accent" />
        </div>

        <Card className="card-interactive">
          <CardHeader><CardTitle>آخر سجلات المراقبة</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {observations.length === 0 ? (
              <EmptyState icon={Eye} title="لا توجد سجلات مراقبة بعد" description="سجّل أول زيارة مراقبة لبدء المتابعة" />
            ) : (
              observations.slice(0, 5).map((o) => (
                <div key={o.id} className="rounded-lg border p-4 space-y-2 transition-all duration-200 hover:shadow-sm hover:border-primary/20 group">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold group-hover:text-primary transition-colors">{o.studentName}</span>
                    <span className="text-sm text-muted-foreground">{o.date}</span>
                  </div>
                  <p className="text-sm"><span className="text-primary font-medium">الأنشطة:</span> {o.activities}</p>
                  <p className="text-sm"><span className="text-primary font-medium">التوصيات:</span> {o.recommendations}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SchoolDashboard;
