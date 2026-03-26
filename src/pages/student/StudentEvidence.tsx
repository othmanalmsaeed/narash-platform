import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Upload, FileText, Image, CheckCircle, Clock, XCircle, Loader2, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { useStudentEvidence, useUploadEvidence } from "@/hooks/useStudentData";
import { useEvidenceFile } from "@/hooks/useEvidenceFile";

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  approved: { label: "موافق عليه", icon: CheckCircle, className: "bg-green-100 text-green-800 hover:bg-green-100" },
  pending: { label: "قيد المراجعة", icon: Clock, className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  rejected: { label: "مرفوض", icon: XCircle, className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

const StudentEvidence = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: evidence = [], isLoading } = useStudentEvidence();
  const uploadEvidence = useUploadEvidence();
  const { viewFile, downloadFile, loading: fileLoading } = useEvidenceFile();

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!title.trim() || !file) {
      toast.error("يرجى إدخال العنوان واختيار ملف");
      return;
    }
    uploadEvidence.mutate(
      { title: title.trim(), description: description.trim(), file },
      {
        onSuccess: () => {
          toast.success("تم رفع الدليل بنجاح 📎");
          setOpen(false);
          setTitle("");
          setDescription("");
          if (fileRef.current) fileRef.current.value = "";
        },
        onError: (err: any) => toast.error(err.message || "حدث خطأ أثناء الرفع"),
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">📎 رفع الأدلة</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Upload className="ml-2 h-4 w-4" />رفع دليل جديد</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>رفع دليل جديد</DialogTitle>
                <DialogDescription>ارفع ملفًا أو صورة كدليل على إنجازك</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>عنوان الدليل</Label>
                  <Input placeholder="مثال: مشروع تصميم الموقع" className="mt-1" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Textarea placeholder="اشرح ما يحتويه هذا الدليل..." className="mt-1" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div>
                  <Label>اختر ملفًا</Label>
                  <Input type="file" className="mt-1" accept="image/*,.pdf,.doc,.docx,.pptx,.xlsx,.xls,.mp4,.mov,.avi" ref={fileRef} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpload} disabled={uploadEvidence.isPending}>
                  {uploadEvidence.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  رفع
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : evidence.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <Upload className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">لا توجد أدلة بعد. ارفع أول دليل على إنجازك!</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {evidence.map(ev => {
              const sc = statusConfig[ev.status ?? "pending"];
              const isImage = ev.file_type?.startsWith("image/");
              const isLoadingThis = fileLoading === ev.file_path;
              return (
                <Card key={ev.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isImage ? <Image className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                        <CardTitle className="text-base">{ev.title}</CardTitle>
                      </div>
                      <Badge className={sc.className}><sc.icon className="h-3 w-3 ml-1" />{sc.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {ev.description && <p className="text-muted-foreground">{ev.description}</p>}
                    <p className="text-xs text-muted-foreground">📄 {ev.file_path?.split("/").pop()} • {new Date(ev.created_at!).toLocaleDateString("ar-JO")}</p>
                    {ev.feedback && (
                      <div className="mt-2 rounded-md bg-muted p-3">
                        <span className="font-semibold text-primary text-xs">تغذية راجعة: </span>
                        <span className="text-xs">{ev.feedback}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => viewFile(ev.file_path)} disabled={isLoadingThis}>
                        {isLoadingThis ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Eye className="ml-1 h-4 w-4" />}
                        عرض
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => downloadFile(ev.file_path)} disabled={isLoadingThis}>
                        <Download className="ml-1 h-4 w-4" />تنزيل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentEvidence;
