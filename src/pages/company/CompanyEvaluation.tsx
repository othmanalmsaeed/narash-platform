import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMyStudents, useCompanyEvaluations, useCreateEvaluation } from "@/hooks/useCompanyData";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CompanyEvaluation = () => {
  const { data: students = [] } = useMyStudents();
  const { data: evaluations = [], isLoading } = useCompanyEvaluations();
  const createMutation = useCreateEvaluation();

  const [studentId, setStudentId] = useState("");
  const [rating, setRating] = useState([3]);
  const [comment, setComment] = useState("");

  const handleSave = () => {
    if (!studentId) { toast.error("يرجى اختيار الطالب"); return; }
    createMutation.mutate(
      { studentId, rating: rating[0], comment, date: new Date().toISOString().split("T")[0] },
      {
        onSuccess: () => { toast.success("تم حفظ التقييم"); setStudentId(""); setRating([3]); setComment(""); },
        onError: (err) => toast.error("خطأ: " + (err as Error).message),
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">تقييم مختصر</h1>

        <Card>
          <CardHeader><CardTitle>تقييم جديد</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>الطالب</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="اختر الطالب" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.studentId} value={s.studentId}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التقييم: {rating[0]} / 5</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">1</span>
                <Slider value={rating} onValueChange={setRating} min={1} max={5} step={1} className="flex-1" />
                <span className="text-sm text-muted-foreground">5</span>
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-5 w-5 ${i <= rating[0] ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                ))}
              </div>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea placeholder="أضف ملاحظاتك..." className="mt-1" value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}حفظ التقييم
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>التقييمات السابقة</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : evaluations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد تقييمات بعد</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>الطالب</TableHead>
                      <TableHead>التقييم</TableHead>
                      <TableHead>الملاحظات</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.studentName}</TableCell>
                        <TableCell>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} className={`h-4 w-4 ${i <= e.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">{e.comment}</TableCell>
                        <TableCell>{e.date}</TableCell>
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

export default CompanyEvaluation;
