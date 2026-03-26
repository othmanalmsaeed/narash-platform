import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFollowUpVisits, useCreateFollowUp } from "@/hooks/useFollowUps";
import { useSchoolStudents } from "@/hooks/useSchoolData";
import { useQuery } from "@tanstack/react-query";
import { firebaseService } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

const visitTypeLabels: Record<string, string> = {
  week_1: "الأسبوع الأول",
  week_4: "الأسبوع الرابع",
  week_8: "الأسبوع الثامن",
};

const visitTypeColors: Record<string, string> = {
  week_1: "bg-blue-100 text-blue-800",
  week_4: "bg-amber-100 text-amber-800",
  week_8: "bg-green-100 text-green-800",
};

const SchoolFollowUps = () => {
  const { user } = useAuth();
  const { data: visits = [], isLoading } = useFollowUpVisits();
  const { data: placements = [] } = useQuery({
    queryKey: ["school-active-placements", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("placements")
        .select("id, student_id, status, students!inner(id, profiles!inner(full_name)), companies!inner(name)")
        .eq("school_supervisor_id", user!.id)
        .eq("status", "active");
      if (error) throw error;
      return data ?? [];
    },
  });
  const createMutation = useCreateFollowUp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    placement_id: "",
    student_id: "",
    visit_type: "",
    visit_date: "",
    notes: "",
  });

  // Active placements directly from query
  const activePlacements = placements;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.placement_id || !form.visit_type || !form.visit_date) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    createMutation.mutate(form, {
      onSuccess: () => {
        toast.success("تم تسجيل المتابعة بنجاح");
        setOpen(false);
        setForm({ placement_id: "", student_id: "", visit_type: "", visit_date: "", notes: "" });
      },
      onError: (err: Error) => toast.error(err.message),
    });
  };

  const handlePlacementChange = (placementId: string) => {
    const placement = activePlacements.find((p: any) => p.id === placementId);
    setForm({
      ...form,
      placement_id: placementId,
      student_id: placement?.student_id ?? "",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="متابعات الزيارات" icon={ClipboardList} description="تسجيل زيارات المتابعة الأسبوعية (الأسبوع 1، 4، 8)" />

        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                تسجيل متابعة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader>
                <DialogTitle>تسجيل زيارة متابعة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>الطالب / التوزيع *</Label>
                  <Select value={form.placement_id} onValueChange={handlePlacementChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الطالب" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePlacements.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.students?.profiles?.full_name ?? "طالب"} — {p.companies?.name ?? ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع المتابعة *</Label>
                    <Select value={form.visit_type} onValueChange={(v) => setForm({ ...form, visit_type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week_1">الأسبوع الأول</SelectItem>
                        <SelectItem value="week_4">الأسبوع الرابع</SelectItem>
                        <SelectItem value="week_8">الأسبوع الثامن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الزيارة *</Label>
                    <Input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات الزيارة..." rows={3} />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "جاري التسجيل..." : "تسجيل المتابعة"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>سجل المتابعات ({visits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : visits.length === 0 ? (
              <EmptyState icon={ClipboardList} title="لا توجد متابعات مسجلة" description="ابدأ بتسجيل زيارة متابعة لطلابك" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الطالب</TableHead>
                      <TableHead className="text-right">الشركة</TableHead>
                      <TableHead className="text-right">نوع المتابعة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell className="text-right font-medium">{v.students?.profiles?.full_name ?? "—"}</TableCell>
                        <TableCell className="text-right">{v.placements?.companies?.name ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={visitTypeColors[v.visit_type] ?? ""}>
                            {visitTypeLabels[v.visit_type] ?? v.visit_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{v.visit_date}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground max-w-[200px] truncate">{v.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
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

export default SchoolFollowUps;
