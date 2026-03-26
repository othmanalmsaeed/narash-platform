import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Lock, Unlock, Star, CheckCircle, AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { useDualAssessments, useLockDualAssessment, type DualAssessmentRow } from "@/hooks/useDualAssessment";
import { toast } from "sonner";

const gradeLabels: Record<string, string> = { P: "اجتياز", M: "جدارة", D: "تميّز" };
const gradeColors: Record<string, string> = {
  P: "bg-green-100 text-green-800 hover:bg-green-100",
  M: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  D: "bg-purple-100 text-purple-800 hover:bg-purple-100",
};

const DualAssessmentPanel = () => {
  const { data: assessments = [], isLoading } = useDualAssessments();
  const lockMutation = useLockDualAssessment();
  const [confirmRow, setConfirmRow] = useState<DualAssessmentRow | null>(null);

  const locked = assessments.filter((a) => a.isLocked);
  const complete = assessments.filter((a) => a.isComplete && !a.isLocked);
  const pending = assessments.filter((a) => !a.isComplete && !a.isLocked);

  const handleLock = () => {
    if (!confirmRow?.schoolEval || !confirmRow?.companyEval) return;
    lockMutation.mutate(
      {
        studentId: confirmRow.studentId,
        unit: confirmRow.unit,
        schoolEvalId: confirmRow.schoolEval.id,
        companyEvalId: confirmRow.companyEval.id,
      },
      {
        onSuccess: () => {
          toast.success("تم قفل التقييم المزدوج بنجاح 🔒");
          setConfirmRow(null);
        },
        onError: (err) => toast.error("خطأ: " + (err as Error).message),
      }
    );
  };

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
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">لوحة التقييم المزدوج</h1>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">مقفل (نهائي)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{locked.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-r-4 border-r-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">جاهز للقفل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{complete.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-r-4 border-r-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ناقص (بانتظار تقييم)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">{pending.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main table */}
        <Card>
          <CardHeader>
            <CardTitle>سجل التقييم المزدوج</CardTitle>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد تقييمات بعد</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الطالب</TableHead>
                      <TableHead className="text-right">الوحدة</TableHead>
                      <TableHead className="text-right">تقييم المشرف المدرسي</TableHead>
                      <TableHead className="text-right">تقييم مشرف العمل</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((row, idx) => (
                      <TableRow key={`${row.studentId}-${row.unit}-${idx}`} className={row.isLocked ? "bg-muted/30" : ""}>
                        <TableCell className="text-right font-medium">{row.studentName}</TableCell>
                        <TableCell className="text-right">{row.unit}</TableCell>
                        <TableCell className="text-right">
                          {row.schoolEval ? (
                            <div className="space-y-1">
                              <Badge className={gradeColors[row.schoolEval.grade]}>
                                {row.schoolEval.grade} - {gradeLabels[row.schoolEval.grade]}
                              </Badge>
                              <p className="text-xs text-muted-foreground">{row.schoolEval.date}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-yellow-600">⏳ لم يُقيّم بعد</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.companyEval ? (
                            <div className="space-y-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i <= row.companyEval!.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">{row.companyEval.date}</p>
                              {row.companyEval.comment && (
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{row.companyEval.comment}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-yellow-600">⏳ لم يُقيّم بعد</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.isLocked ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Lock className="h-3 w-3 ml-1" />مقفل
                            </Badge>
                          ) : row.isComplete ? (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              <Unlock className="h-3 w-3 ml-1" />جاهز للقفل
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              <AlertTriangle className="h-3 w-3 ml-1" />ناقص
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.isComplete && !row.isLocked && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-300 hover:bg-green-50"
                              onClick={() => setConfirmRow(row)}
                            >
                              <Lock className="ml-1 h-3 w-3" />قفل نهائي
                            </Button>
                          )}
                          {row.isLocked && (
                            <span className="text-xs text-muted-foreground">✅ تم التحقق</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirm lock dialog */}
        <Dialog open={!!confirmRow} onOpenChange={() => setConfirmRow(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تأكيد قفل التقييم المزدوج</DialogTitle>
              <DialogDescription>
                سيتم قفل تقييم <strong>{confirmRow?.studentName}</strong> للوحدة <strong>{confirmRow?.unit}</strong> نهائياً. لن يمكن تعديله بعد القفل.
              </DialogDescription>
            </DialogHeader>
            {confirmRow && (
              <div className="space-y-3 text-sm">
                <div className="rounded-md bg-muted p-3">
                  <p><span className="font-semibold">تقييم المدرسة:</span> {confirmRow.schoolEval?.grade} - {gradeLabels[confirmRow.schoolEval?.grade ?? "P"]}</p>
                  <p><span className="font-semibold">تقييم العمل:</span> {confirmRow.companyEval?.rating}/5 نجوم</p>
                </div>
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 rounded-md p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="text-xs">هذا الإجراء غير قابل للتراجع وسيُسجل في سجل التتبع</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmRow(null)}>إلغاء</Button>
              <Button onClick={handleLock} disabled={lockMutation.isPending} className="bg-green-600 hover:bg-green-700">
                {lockMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                <Lock className="ml-2 h-4 w-4" />قفل نهائي
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DualAssessmentPanel;
