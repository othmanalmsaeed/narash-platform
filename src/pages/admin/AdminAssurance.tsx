import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, AlertTriangle, Building2, TrendingDown, Loader2 } from "lucide-react";
import { useAdminAssurance } from "@/hooks/useAdminData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminAssurance = () => {
  const { data: kpi, isLoading } = useAdminAssurance();

  if (isLoading || !kpi) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">🛡️ ضمان البرنامج والامتثال</h1>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">معدل الحضور</CardTitle>
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.attendanceRate.toFixed(1)}%</div>
              <Progress value={kpi.attendanceRate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-destructive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الشركات المعتمدة</CardTitle>
              <Building2 className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.approvedCompanies} / {kpi.activeCompanies}</div>
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">معدل الاستخدام</CardTitle>
              <AlertTriangle className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.utilizationRate.toFixed(1)}%</div>
              <Progress value={kpi.utilizationRate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">معامل التباين</CardTitle>
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.varianceIndex.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="integrity">
          <TabsList>
            <TabsTrigger value="integrity">مؤشرات الأداء</TabsTrigger>
            <TabsTrigger value="seats">السعة مقابل التوزيع</TabsTrigger>
          </TabsList>

          <TabsContent value="integrity" className="mt-4">
            <Card>
              <CardHeader><CardTitle>مؤشرات الأداء الرئيسية</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>معدل الاستخدام</span>
                    <span className="font-bold">{kpi.utilizationRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={kpi.utilizationRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>نسبة الحضور</span>
                    <span className="font-bold">{kpi.attendanceRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={kpi.attendanceRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>معدل الإنجاز</span>
                    <span className="font-bold">{kpi.completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={kpi.completionRate} className="h-2" />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">إجمالي الطلبة</div>
                  <div className="text-3xl font-bold">{kpi.totalStudents}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {kpi.trainingStudents} قيد التدريب • {kpi.completedStudents} مكتمل
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seats" className="mt-4">
            <Card>
              <CardHeader><CardTitle>السعة الكلية مقابل التوزيع الفعلي</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kpi.seatsData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={14} />
                    <YAxis fontSize={14} />
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans Arabic", direction: "rtl" }} />
                    <Bar dataKey="value" fill="hsl(267, 56%, 35%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminAssurance;
