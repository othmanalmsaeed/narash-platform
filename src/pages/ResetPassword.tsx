import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery session in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    // Listen for auth state change with recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("تم تحديث كلمة المرور بنجاح");
      setTimeout(() => navigate("/auth"), 2000);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="font-semibold">تم تحديث كلمة المرور بنجاح</p>
            <p className="text-sm text-muted-foreground">سيتم توجيهك لتسجيل الدخول...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">رابط غير صالح أو منتهي الصلاحية</p>
            <Button onClick={() => navigate("/auth")}>العودة لتسجيل الدخول</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6" dir="rtl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">تعيين كلمة مرور جديدة</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">كلمة المرور الجديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              تحديث كلمة المرور
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;