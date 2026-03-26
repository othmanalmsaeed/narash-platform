import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useSchoolEvidence, useReviewEvidence } from "@/hooks/useSchoolData";
import { useEvidenceFile } from "@/hooks/useEvidenceFile";
import { CheckCircle, XCircle, Clock, FileText, Image, MessageSquare, Loader2, Eye, Download } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: "موافق عليه", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  pending: { label: "قيد المراجعة", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  rejected: { label: "مرفوض", className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

const SchoolEvidence = () => {
  const { data: evidenceList = [], isLoading } = useSchoolEvidence();
  const reviewMutation = useReviewEvidence();
  const { viewFile, downloadFile, loading: fileLoading } = useEvidenceFile();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleReview = (id: string, status: "approved" | "rejected") => {
    reviewMutation.mutate(
      { evidenceId: id, status },
      {
        onSuccess: () => toast.success(status === "approved" ? "تمت الموافقة ✅" : "تم الرفض ❌"),
        onError: (err) => toast.error("خطأ: " + (err as Error).message),
      }
    );
  };

  const handleFeedback = () => {
    if (!selectedId) return;
    reviewMutation.mutate(
      { evidenceId: selectedId, status: "pending" as any, feedback },
      {
        onSuccess: () => { toast.success("تم إرسال التغذية الراجعة 💬"); setFeedbackOpen(false); setFeedback(""); },
        onError: (err) => toast.error("خطأ: " + (err as Error).message),
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">📋 مراجعة الأدلة</h1>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : evidenceList.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد أدلة لمراجعتها</p>
        ) : (
          <div className="space-y-4">
            {evidenceList.map((ev) => {
              const sc = statusConfig[ev.status ?? "pending"];
              const isImage = ev.file_type?.startsWith("image");
              const isLoadingThis = fileLoading === ev.file_path;
              return (
                <Card key={ev.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isImage ? <Image className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                        <CardTitle className="text-base">{ev.title}</CardTitle>
                      </div>
                      <Badge className={sc.className}>{sc.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{ev.description}</p>
                    <p className="text-xs text-muted-foreground">👤 {ev.studentName} • {ev.created_at?.split("T")[0]}</p>
                    {ev.feedback && (
                      <div className="rounded-md bg-muted p-3 text-sm">
                        <span className="font-semibold text-primary">التغذية الراجعة: </span>{ev.feedback}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => viewFile(ev.file_path)} disabled={isLoadingThis}>
                        {isLoadingThis ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Eye className="ml-1 h-4 w-4" />}
                        عرض الملف
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => downloadFile(ev.file_path)} disabled={isLoadingThis}>
                        <Download className="ml-1 h-4 w-4" />تنزيل
                      </Button>
                      <Button size="sm" variant="outline" className="text-green-700" onClick={() => handleReview(ev.id, "approved")} disabled={reviewMutation.isPending}>
                        <CheckCircle className="ml-1 h-4 w-4" />موافقة
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-700" onClick={() => handleReview(ev.id, "rejected")} disabled={reviewMutation.isPending}>
                        <XCircle className="ml-1 h-4 w-4" />رفض
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedId(ev.id); setFeedbackOpen(true); }}>
                        <MessageSquare className="ml-1 h-4 w-4" />تغذية راجعة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة تغذية راجعة</DialogTitle>
              <DialogDescription>أضف ملاحظاتك وتعليقاتك على هذا الدليل</DialogDescription>
            </DialogHeader>
            <div>
              <Label>الملاحظات</Label>
              <Textarea placeholder="اكتب ملاحظاتك هنا..." className="mt-1 min-h-[100px]" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={handleFeedback} disabled={reviewMutation.isPending}>
                {reviewMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}إرسال
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>معاينة الصورة</DialogTitle>
              <DialogDescription>اضغط خارج النافذة للإغلاق</DialogDescription>
            </DialogHeader>
            {previewUrl && <img src={previewUrl} alt="معاينة" className="w-full rounded-md" />}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SchoolEvidence;
