import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput, PaginationControls, usePagination, useSearchFilter } from "@/components/ui/search-pagination";
import { GraduationCap, UserPlus, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseService } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useApproveGraduation } from "@/hooks/useGraduation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function useSchoolsList() {
  return useQuery({
    queryKey: ["schools-list"],
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("schools")
        .select("id, name, region")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useAllStudents() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-all-students", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("students")
        .select("id, student_number, national_id, gender, status, completed_hours, total_hours, grade_level, current_phase, final_grade, profiles!inner(full_name, phone, email)")
        .eq("school_id", schoolId!);
      if (error) throw error;
      return (data ?? []).map((s) => ({
        id: s.id,
        name: (s.profiles as any)?.full_name ?? "",
        email: (s.profiles as any)?.email ?? "",
        phone: (s.profiles as any)?.phone ?? "—",
        nationalId: s.national_id ?? "—",
        gender: s.gender === "male" ? "ذكر" : s.gender === "female" ? "أنثى" : "—",
        studentNumber: s.student_number,
        status: s.status ?? "enrolled",
        gradeLevel: s.grade_level ?? "—",
        currentPhase: s.current_phase ?? 1,
        finalGrade: s.final_grade,
      }));
    },
  });
}

const statusLabels: Record<string, string> = {
  enrolled: "مسجّل",
  not_started: "لم يبدأ",
  searching: "جاري البحث",
  matched: "تمت المطابقة",
  training: "قيد التدريب",
  under_review: "قيد التقييم",
  pending_graduation: "بانتظار الاعتماد",
  graduated: "متخرج",
  completed: "مكتمل",
  withdrawn: "منسحب",
  closed: "مُغلق",
};

const statusColors: Record<string, string> = {
  enrolled: "bg-muted text-muted-foreground hover:bg-muted",
  not_started: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  searching: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  matched: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  training: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  under_review: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  pending_graduation: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
  graduated: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  completed: "bg-green-100 text-green-800 hover:bg-green-100",
  withdrawn: "bg-red-100 text-red-800 hover:bg-red-100",
  closed: "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

const phaseLabels: Record<number, string> = {
  1: "التسجيل", 2: "المطابقة", 3: "التدريب", 4: "التقييم", 5: "الاعتماد", 6: "التخرج",
};

const AdminStudentManagement = () => {
  const { schoolId } = useAuth();
  const { data: students = [], isLoading } = useAllStudents();
  const { data: schools = [] } = useSchoolsList();
  const qc = useQueryClient();
  const graduationMutation = useApproveGraduation();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    national_id: "",
    gender: "male" as "male" | "female",
    phone: "",
    school_id: schoolId ?? "",
    student_number: "",
    email: "",
    password: "",
  });

  const filtered = useSearchFilter(students, ["name", "nationalId", "studentNumber", "phone"] as any[], search);
  const pag = usePagination(filtered, 10);

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: result, error } = await firebaseService.functions.invoke("create-student", {
        body: data,
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success("تم إضافة الطالب بنجاح");
      qc.invalidateQueries({ queryKey: ["admin-all-students"] });
      qc.invalidateQueries({ queryKey: ["admin-students"] });
      setOpen(false);
      setForm({
        full_name: "",
        national_id: "",
        gender: "male",
        phone: "",
        school_id: schoolId ?? "",
        student_number: "",
        email: "",
        password: "",
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "فشل في إضافة الطالب");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.national_id.trim() || !form.school_id || !form.student_number.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    if (!/^[A-Z]{2}\d{5}$/.test(form.student_number)) {
      toast.error("رقم التسجيل يجب أن يبدأ بحرفين ثم 5 أرقام (مثال: AB12345)");
      return;
    }
    if (form.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="إدارة الطلاب" icon={GraduationCap} description="إضافة وعرض بيانات الطلاب وإدارة دورة حياتهم" />

        {/* Statistics summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(statusLabels).map(([key, label]) => {
            const count = students.filter((s) => s.status === key).length;
            if (count === 0) return null;
            return (
              <Card key={key} className="p-3">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-2xl font-bold text-foreground">{count}</div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="بحث بالاسم أو الرقم الوطني..." />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                إضافة طالب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة طالب جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">الاسم الرباعي *</Label>
                  <Input id="full_name" placeholder="محمد أحمد علي الخالدي" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="national_id">الرقم الوطني *</Label>
                    <Input id="national_id" placeholder="9901234567" value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value.replace(/\D/g, "").slice(0, 10) })} maxLength={10} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student_number">رقم التسجيل *</Label>
                    <Input id="student_number" placeholder="AB12345" value={form.student_number} onChange={(e) => setForm({ ...form, student_number: e.target.value.toUpperCase().slice(0, 7) })} maxLength={7} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الجنس *</Label>
                  <RadioGroup value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as "male" | "female" })} className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="cursor-pointer">ذكر</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="cursor-pointer">أنثى</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" placeholder="07XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={15} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school_id">المدرسة *</Label>
                  <Select value={form.school_id} onValueChange={(v) => setForm({ ...form, school_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدرسة" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — {s.region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input id="email" type="email" placeholder="student@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <Input id="password" type="password" placeholder="••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "جاري الإضافة..." : "إضافة الطالب"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلاب ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Clock className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <EmptyState variant="search" title={search ? "لا توجد نتائج" : "لا يوجد طلاب بعد"} />
            ) : (
              <>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <Table className="min-w-[800px]">
                     <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">رقم التسجيل</TableHead>
                        <TableHead className="text-right">الصف</TableHead>
                        <TableHead className="text-right">المرحلة</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الدرجة</TableHead>
                        <TableHead className="text-right">إجراء</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pag.paginatedItems.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-right font-medium">{s.name}</TableCell>
                          <TableCell className="text-right">{s.studentNumber}</TableCell>
                          <TableCell className="text-right text-sm">{s.gradeLevel}</TableCell>
                          <TableCell className="text-right text-sm">{phaseLabels[s.currentPhase] ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={statusColors[s.status] ?? ""}>{statusLabels[s.status] ?? s.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">{s.finalGrade ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            {s.status === "pending_graduation" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-xs"
                                disabled={graduationMutation.isPending}
                                onClick={() => {
                                  graduationMutation.mutate(s.id, {
                                    onSuccess: (res) => toast.success(`تم اعتماد تخرج الطالب بدرجة ${res.finalGrade}`),
                                    onError: (err: Error) => toast.error(err.message),
                                  });
                                }}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                اعتماد التخرج
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls currentPage={pag.currentPage} totalPages={pag.totalPages} onPageChange={pag.setCurrentPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminStudentManagement;
