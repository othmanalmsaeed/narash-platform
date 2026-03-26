import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, CalendarDays, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { useStudentProfile, useStudentAttendance, useStudentJournal } from "@/hooks/useStudentData";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonStatGrid } from "@/components/ui/skeleton-card";
import { PhaseTracker } from "@/components/student/PhaseTracker";

const StudentDashboard = () => {
  const { fullName } = useAuth();
  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: attendance = [] } = useStudentAttendance();
  const { data: journal = [] } = useStudentJournal();

  const completedHours = profile?.completed_hours ?? 0;
  const totalHours = profile?.total_hours ?? 1;
  const progress = Math.round((completedHours / totalHours) * 100);
  const presentDays = attendance.filter(a => a.status === "present").length;
  const firstName = fullName?.split(" ")[0] || "الطالب";
  const greeting = new Date().getHours() < 12 ? "صباح الخير" : "مساء الخير";

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader title="جاري التحميل..." icon={TrendingUp} />
          <SkeletonStatGrid count={4} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`مرحبًا، ${firstName} 👋`}
          description={`${greeting} — إليك ملخص تقدمك`}
          icon={TrendingUp}
        />

        <PhaseTracker
          currentPhase={profile?.current_phase ?? 1}
          status={profile?.status ?? "enrolled"}
          finalGrade={profile?.final_grade}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard label="ساعات التدريب" value={`${completedHours} / ${totalHours}`} icon={Clock} strip="primary" subtitle={`${progress}% مكتمل`}>
            <Progress value={progress} className="mt-2 h-2" />
          </StatCard>
          <StatCard label="إدخالات السجل" value={journal.length} icon={BookOpen} strip="accent" subtitle="إدخال مسجّل" />
          <StatCard label="أيام الحضور" value={presentDays} icon={CalendarDays} strip="success" subtitle="يوم حضور مسجّل" />
          <StatCard
            label="التقدم العام"
            value={`${progress}%`}
            icon={Sparkles}
            strip="primary"
            subtitle={progress >= 75 ? "أداء ممتاز 🌟" : progress >= 50 ? "أداء جيد 👍" : "يحتاج تحسين"}
          />
        </div>

        <Card className="card-interactive">
          <CardHeader>
            <CardTitle>آخر إدخالات سجل المهارات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {journal.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="لا توجد إدخالات بعد"
                description="ابدأ بتسجيل مهاراتك وتجاربك اليومية"
              />
            ) : (
              journal.slice(0, 2).map(entry => (
                <div key={entry.id} className="rounded-lg border p-4 transition-all duration-200 hover:shadow-sm hover:border-primary/20 group">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-primary group-hover:text-primary/80 transition-colors">{entry.week_label}</span>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.learned}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
