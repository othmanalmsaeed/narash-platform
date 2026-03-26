import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, UserX, Clock, CheckCircle, Star, Shield, AlertTriangle, FileText, Layers, ArrowLeftRight, ClipboardList, RefreshCw, Banknote, Download, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { SearchInput, PaginationControls, usePagination, useSearchFilter } from "@/components/ui/search-pagination";
import {
  exportToExcel, exportToPDF,
  getStudentsExportConfig, getAttendanceExportConfig, getWitnessExportConfig,
  getEvaluationsExportConfig, getObservationsExportConfig, getStatsExportConfig,
} from "@/lib/exportUtils";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonStatGrid } from "@/components/ui/skeleton-card";
import { BarChart3 } from "lucide-react";
import {
  useAdminStats,
  useAdminStudents,
  useAdminAttendance,
  useAdminWitness,
  useAdminEvaluations,
  useAdminObservations,
  useAdminChartData,
  useAdminNewFeatureStats,
  useAdminAssurance,
  useAdminRegulatoryStatus,
} from "@/hooks/useAdminData";

const statusBadge = (s: string) => {
  switch (s) {
    case "قيد التدريب": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "مكتمل": return "bg-green-100 text-green-800 hover:bg-green-100";
    case "مسجّل": return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    default: return "bg-red-100 text-red-800 hover:bg-red-100";
  }
};

const attendanceStatusColor = (s: string) => {
  switch (s) {
    case "حاضر": return "bg-green-100 text-green-800 hover:bg-green-100";
    case "متأخر": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "غائب": return "bg-red-100 text-red-800 hover:bg-red-100";
    default: return "bg-orange-100 text-orange-800 hover:bg-orange-100";
  }
};

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: students = [], isLoading: studentsLoading } = useAdminStudents();
  const { data: attendance = [] } = useAdminAttendance();
  const { data: witness = [] } = useAdminWitness();
  const { data: evaluationsList = [] } = useAdminEvaluations();
  const { data: observations = [] } = useAdminObservations();
  const { barData, pieData } = useAdminChartData();
  const { data: newStats } = useAdminNewFeatureStats();
  const { data: assuranceData } = useAdminAssurance();
  const regulatoryStatus = useAdminRegulatoryStatus();

  // Search states
  const [studentSearch, setStudentSearch] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [witnessSearch, setWitnessSearch] = useState("");
  const [evalSearch, setEvalSearch] = useState("");

  // Filter
  const filteredStudents = useSearchFilter(students, ["name", "company", "supervisor"] as any[], studentSearch);
  const filteredAttendance = useSearchFilter(attendance, ["studentName", "date", "status"] as any[], attendanceSearch);
  const filteredWitness = useSearchFilter(witness, ["studentName", "activity", "unitNumber"] as any[], witnessSearch);
  const filteredEvals = useSearchFilter(evaluationsList, ["studentName", "comment"] as any[], evalSearch);

  // Pagination
  const studentsPag = usePagination(filteredStudents, 10);
  const attendancePag = usePagination(filteredAttendance, 10);
  const witnessPag = usePagination(filteredWitness, 10);
  const evalsPag = usePagination(filteredEvals, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="لوحة إحصائيات الإدارة" icon={BarChart3} description="نظرة شاملة على أداء البرنامج" />

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            try {
              const config = getStatsExportConfig(stats, newStats);
              exportToExcel(config);
              toast.success("تم تصدير الإحصائيات كملف Excel");
            } catch { toast.error("فشل التصدير"); }
          }}>
            <FileSpreadsheet className="h-4 w-4" /> تصدير Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            try {
              const config = getStatsExportConfig(stats, newStats);
              exportToPDF(config);
              toast.success("تم تصدير الإحصائيات كملف PDF");
            } catch { toast.error("فشل التصدير"); }
          }}>
            <Download className="h-4 w-4" /> تصدير PDF
          </Button>
        </div>

        {statsLoading ? (
          <SkeletonStatGrid count={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            <StatCard label="إجمالي الطلاب" value={stats?.totalStudents ?? 0} icon={Users} strip="primary" />
            <StatCard label="غير مُطابقين" value={stats?.unmatched ?? 0} icon={UserX} strip="destructive" />
            <StatCard label="قيد التدريب" value={stats?.currentlyTraining ?? 0} icon={Clock} strip="info" />
            <StatCard label="تدريب مكتمل" value={stats?.completed ?? 0} icon={CheckCircle} strip="success" />
          </div>
        )}

        {/* === NEW: Feature Summary Cards === */}
        {newStats && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">📋 ملخص الميزات الجديدة</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Violations */}
              <Link to="/school/policy-violations">
                <Card className="border-r-4 border-r-destructive hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">المخالفات</CardTitle>
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold">{newStats.violations.open}</div>
                    <p className="text-xs text-muted-foreground">مفتوحة من أصل {newStats.violations.total}</p>
                    <div className="flex gap-1 flex-wrap">
                      {newStats.violations.bySeverity.referral > 0 && <Badge variant="destructive" className="text-[10px]">إحالة: {newStats.violations.bySeverity.referral}</Badge>}
                      {newStats.violations.bySeverity.action_plan > 0 && <Badge variant="destructive" className="text-[10px]">خطة: {newStats.violations.bySeverity.action_plan}</Badge>}
                      {newStats.violations.bySeverity.formal_warning > 0 && <Badge variant="default" className="text-[10px]">رسمي: {newStats.violations.bySeverity.formal_warning}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Contracts */}
              <Link to="/admin/trainer-contracts">
                <Card className="border-r-4 border-r-blue-500 hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">عقود المدربين</CardTitle>
                    <FileText className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold">{newStats.contracts.active}</div>
                    <p className="text-xs text-muted-foreground">نشطة من أصل {newStats.contracts.total}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>ساعات التدريب</span>
                        <span>{newStats.contracts.completedHours}/{newStats.contracts.totalHours}</span>
                      </div>
                      <Progress value={newStats.contracts.totalHours > 0 ? (newStats.contracts.completedHours / newStats.contracts.totalHours) * 100 : 0} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Skills Matrix */}
              <Link to="/school/skills-matrix">
                <Card className="border-r-4 border-r-primary hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">المصفوفة والأهداف</CardTitle>
                    <Layers className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold">{newStats.skillsMatrix.selectedObjectives}</div>
                    <p className="text-xs text-muted-foreground">أهداف مختارة</p>
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(newStats.skillsMatrix.sectorSelections).map(([sector, count]) => (
                        <Badge key={sector} variant="outline" className="text-[10px]">{sector}: {count as number}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Cross Training */}
              <Link to="/school/cross-training">
                <Card className="border-r-4 border-r-green-500 hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">التدريب عبر المدارس</CardTitle>
                    <ArrowLeftRight className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold">{newStats.crossTraining.approved}</div>
                    <p className="text-xs text-muted-foreground">معتمدة | {newStats.crossTraining.pending} قيد المعالجة</p>
                    <p className="text-[10px] text-muted-foreground">إجمالي الطلبات: {newStats.crossTraining.total}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Secondary stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-4 flex items-center gap-3">
                  <ClipboardList className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{newStats.corrective.active}</p>
                    <p className="text-xs text-muted-foreground">خطط تصحيحية نشطة</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{newStats.resubmissions.pending}</p>
                    <p className="text-xs text-muted-foreground">طلبات إعادة تسليم معلقة</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex items-center gap-3">
                  <Banknote className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{newStats.contracts.totalFinancial.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">إجمالي المقابل المالي (دينار)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Violations breakdown chart */}
            {newStats.violations.total > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">المخالفات حسب النوع</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={[
                        { name: "غياب", value: newStats.violations.byType.absence },
                        { name: "عدم تسليم", value: newStats.violations.byType.non_submission },
                        { name: "تأخر تسليم", value: newStats.violations.byType.late_submission },
                        { name: "رفض دليل", value: newStats.violations.byType.evidence_rejected },
                      ]} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">المخالفات حسب الخطورة</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        {(() => {
                          const severityData = [
                            { name: "تحذير", value: newStats.violations.bySeverity.warning, color: "hsl(45, 93%, 47%)" },
                            { name: "تحذير رسمي", value: newStats.violations.bySeverity.formal_warning, color: "hsl(25, 95%, 53%)" },
                            { name: "خطة إجراءات", value: newStats.violations.bySeverity.action_plan, color: "hsl(0, 84%, 60%)" },
                            { name: "إحالة", value: newStats.violations.bySeverity.referral, color: "hsl(0, 72%, 30%)" },
                          ].filter(d => d.value > 0);
                          return (
                            <Pie data={severityData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                              {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                          );
                        })()}
                        <Tooltip />
                        <Legend verticalAlign="bottom" formatter={(v: string) => <span style={{ fontSize: 11 }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* PCA Status Card */}
        {assuranceData && (
          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ضمان البرنامج والامتثال</CardTitle>
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">معدل الحضور</span>
                <span className="text-lg font-bold">{assuranceData.attendanceRate.toFixed(1)}%</span>
              </div>
              <Progress value={assuranceData.attendanceRate} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>معدل الاستخدام: {assuranceData.utilizationRate.toFixed(1)}%</span>
                <Link to="/admin/assurance" className="text-primary hover:underline">عرض التفاصيل ←</Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* RAL Status Card */}
        {(() => {
          const color = regulatoryStatus.overallStatus === "COMPLIANT" ? "bg-green-100 text-green-800 hover:bg-green-100" : regulatoryStatus.overallStatus === "WARNING" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : "bg-red-100 text-red-800 hover:bg-red-100";
          const label = regulatoryStatus.overallStatus === "COMPLIANT" ? "متوافق" : regulatoryStatus.overallStatus === "WARNING" ? "تحذير" : "غير متوافق";
          return (
            <Card className="border-r-4 border-r-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">المواءمة التنظيمية</CardTitle>
                <Shield className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge className={color}>{label}</Badge>
                <Link to="/admin/regulatory" className="text-xs text-primary hover:underline">عرض التفاصيل ←</Link>
              </CardContent>
            </Card>
          );
        })()}

        {barData.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>توزيع الطلاب حسب الحالة</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={14} tick={{ fill: "hsl(270, 10%, 45%)" }} />
                    <YAxis fontSize={14} tick={{ fill: "hsl(270, 10%, 45%)" }} />
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans Arabic", direction: "rtl" }} />
                    <Bar dataKey="value" fill="hsl(267, 56%, 35%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>نسبة التوزيع</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans Arabic", direction: "rtl" }} />
                    <Legend
                      verticalAlign="bottom"
                      formatter={(value: string) => <span style={{ fontFamily: "IBM Plex Sans Arabic", fontSize: 13 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="students">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="w-max min-w-full sm:w-auto">
              <TabsTrigger value="students">الطلاب</TabsTrigger>
              <TabsTrigger value="attendance">الحضور</TabsTrigger>
              <TabsTrigger value="witness">شهادات الشاهد</TabsTrigger>
              <TabsTrigger value="evaluations">التقييمات</TabsTrigger>
              <TabsTrigger value="observations">سجلات المراقبة</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="students" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle>جدول تتبع الطلاب</CardTitle>
                <div className="flex gap-2 items-center">
                  <SearchInput value={studentSearch} onChange={setStudentSearch} placeholder="بحث عن طالب..." />
                  <Button variant="ghost" size="sm" onClick={() => { exportToExcel(getStudentsExportConfig(students)); toast.success("تم التصدير"); }}><FileSpreadsheet className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { exportToPDF(getStudentsExportConfig(students)); toast.success("تم التصدير"); }}><Download className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="flex justify-center py-8"><Clock className="h-6 w-6 animate-spin text-primary" /></div>
                ) : filteredStudents.length === 0 ? (
                  <EmptyState variant="search" title={studentSearch ? "لا توجد نتائج" : "لا يوجد طلاب"} />
                ) : (
                  <>
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <Table className="min-w-[900px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">اسم الطالب</TableHead>
                            <TableHead className="text-right">الرقم الوطني</TableHead>
                            <TableHead className="text-right">الجنس</TableHead>
                            <TableHead className="text-right">الهاتف</TableHead>
                            <TableHead className="text-right">الشركة</TableHead>
                            <TableHead className="text-right">المشرف</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">التقدم</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentsPag.paginatedItems.map(s => (
                            <TableRow key={s.id}>
                              <TableCell className="text-right font-medium">{s.name}</TableCell>
                              <TableCell className="text-right">{s.nationalId}</TableCell>
                              <TableCell className="text-right">{s.gender}</TableCell>
                              <TableCell className="text-right">{s.phone}</TableCell>
                              <TableCell className="text-right">{s.company}</TableCell>
                              <TableCell className="text-right">{s.supervisor}</TableCell>
                              <TableCell className="text-right"><Badge className={statusBadge(s.status)}>{s.status}</Badge></TableCell>
                              <TableCell className="text-right"><Progress value={s.progress} className="h-2 w-20" /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationControls currentPage={studentsPag.currentPage} totalPages={studentsPag.totalPages} onPageChange={studentsPag.setCurrentPage} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle>سجلات الحضور</CardTitle>
                <div className="flex gap-2 items-center">
                  <SearchInput value={attendanceSearch} onChange={setAttendanceSearch} placeholder="بحث..." />
                  <Button variant="ghost" size="sm" onClick={() => { exportToExcel(getAttendanceExportConfig(attendance)); toast.success("تم التصدير"); }}><FileSpreadsheet className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { exportToPDF(getAttendanceExportConfig(attendance)); toast.success("تم التصدير"); }}><Download className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAttendance.length === 0 ? (
                  <EmptyState variant="search" title={attendanceSearch ? "لا توجد نتائج" : "لا توجد سجلات حضور"} />
                ) : (
                  <>
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <Table className="min-w-[550px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">الطالب</TableHead>
                            <TableHead className="text-right">الدخول</TableHead>
                            <TableHead className="text-right">الخروج</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendancePag.paginatedItems.map(r => (
                            <TableRow key={r.id}>
                              <TableCell className="text-right">{r.date}</TableCell>
                              <TableCell className="text-right">{r.studentName}</TableCell>
                              <TableCell className="text-right">{r.entryTime}</TableCell>
                              <TableCell className="text-right">{r.exitTime}</TableCell>
                              <TableCell className="text-right"><Badge className={attendanceStatusColor(r.status)}>{r.status}</Badge></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationControls currentPage={attendancePag.currentPage} totalPages={attendancePag.totalPages} onPageChange={attendancePag.setCurrentPage} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="witness" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle>شهادات الشاهد</CardTitle>
                <div className="flex gap-2 items-center">
                  <SearchInput value={witnessSearch} onChange={setWitnessSearch} placeholder="بحث..." />
                  <Button variant="ghost" size="sm" onClick={() => { exportToExcel(getWitnessExportConfig(witness)); toast.success("تم التصدير"); }}><FileSpreadsheet className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { exportToPDF(getWitnessExportConfig(witness)); toast.success("تم التصدير"); }}><Download className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredWitness.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">{witnessSearch ? "لا توجد نتائج" : "لا توجد شهادات شاهد"}</p>
                ) : (
                  <>
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <Table className="min-w-[650px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">الطالب</TableHead>
                            <TableHead className="text-right">الوحدة</TableHead>
                            <TableHead className="text-right">النشاط</TableHead>
                            <TableHead className="text-right">P</TableHead>
                            <TableHead className="text-right">M</TableHead>
                            <TableHead className="text-right">D</TableHead>
                            <TableHead className="text-right">التاريخ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {witnessPag.paginatedItems.map(w => (
                            <TableRow key={w.id}>
                              <TableCell className="text-right font-medium">{w.studentName}</TableCell>
                              <TableCell className="text-right">{w.unitNumber}</TableCell>
                              <TableCell className="text-right max-w-[200px] truncate">{w.activity}</TableCell>
                              <TableCell className="text-right">{w.gradeP ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓</Badge> : "—"}</TableCell>
                              <TableCell className="text-right">{w.gradeM ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">✓</Badge> : "—"}</TableCell>
                              <TableCell className="text-right">{w.gradeD ? <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">✓</Badge> : "—"}</TableCell>
                              <TableCell className="text-right">{w.date}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationControls currentPage={witnessPag.currentPage} totalPages={witnessPag.totalPages} onPageChange={witnessPag.setCurrentPage} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluations" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle>التقييمات</CardTitle>
                <div className="flex gap-2 items-center">
                  <SearchInput value={evalSearch} onChange={setEvalSearch} placeholder="بحث..." />
                  <Button variant="ghost" size="sm" onClick={() => { exportToExcel(getEvaluationsExportConfig(evaluationsList)); toast.success("تم التصدير"); }}><FileSpreadsheet className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { exportToPDF(getEvaluationsExportConfig(evaluationsList)); toast.success("تم التصدير"); }}><Download className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredEvals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">{evalSearch ? "لا توجد نتائج" : "لا توجد تقييمات"}</p>
                ) : (
                  <>
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <Table className="min-w-[500px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">الطالب</TableHead>
                            <TableHead className="text-right">التقييم</TableHead>
                            <TableHead className="text-right">الملاحظات</TableHead>
                            <TableHead className="text-right">التاريخ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {evalsPag.paginatedItems.map(e => (
                            <TableRow key={e.id}>
                              <TableCell className="text-right font-medium">{e.studentName}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={`h-4 w-4 ${i <= e.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right max-w-[250px] truncate">{e.comment}</TableCell>
                              <TableCell className="text-right">{e.date}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationControls currentPage={evalsPag.currentPage} totalPages={evalsPag.totalPages} onPageChange={evalsPag.setCurrentPage} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="observations" className="mt-4">
            <div className="flex justify-end mb-2 gap-2">
              <Button variant="ghost" size="sm" onClick={() => { exportToExcel(getObservationsExportConfig(observations)); toast.success("تم التصدير"); }}><FileSpreadsheet className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => { exportToPDF(getObservationsExportConfig(observations)); toast.success("تم التصدير"); }}><Download className="h-4 w-4" /></Button>
            </div>
            {observations.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد سجلات مراقبة</p>
            ) : (
              <div className="space-y-4">
                {observations.map(o => (
                  <Card key={o.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{o.studentName}</CardTitle>
                        <span className="text-sm text-muted-foreground">{o.date}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><span className="font-semibold text-primary">الأنشطة:</span> {o.activities}</div>
                      <div><span className="font-semibold text-primary">الأسئلة:</span> {o.questions}</div>
                      <div><span className="font-semibold text-primary">الأدلة:</span> {o.evidence}</div>
                      <div><span className="font-semibold text-primary">التوصيات:</span> {o.recommendations}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
