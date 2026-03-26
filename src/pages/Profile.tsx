import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseService } from "@/integrations/firebase/client";

const Profile = () => {
  const { user, fullName: authFullName } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await firebaseService
        .from("profiles")
        .select("full_name, email, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setName(data.full_name || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url || "");
      } else {
        setEmail(user.email || "");
        setName(authFullName || "");
      }
      setLoading(false);
    };
    loadProfile();
  }, [user, authFullName]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await firebaseService
      .from("profiles")
      .update({ full_name: name.trim(), phone: phone.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("فشل حفظ التغييرات: " + error.message);
    } else {
      toast.success("تم حفظ التغييرات ✅");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: uploadError } = await firebaseService.storage
      .from("evidence")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error("فشل رفع الصورة");
      return;
    }
    // Use signed URL since bucket is private
    const { data: signedData, error: signedError } = await firebaseService.storage
      .from("evidence")
      .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year validity
    if (signedError || !signedData?.signedUrl) {
      toast.error("فشل الحصول على رابط الصورة");
      return;
    }
    await firebaseService.from("profiles").update({ avatar_url: signedData.signedUrl }).eq("id", user.id);
    setAvatarUrl(signedData.signedUrl);
    toast.success("تم تغيير الصورة الشخصية 📷");
  };

  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2) : "??";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold">👤 الملف الشخصي</h1>

        <Card>
          <CardHeader>
            <CardTitle>الصورة الشخصية</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials || <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <div>
              <p className="font-semibold">{name || "—"}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المعلومات الشخصية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>الاسم الكامل</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input value={email} className="mt-1" type="email" disabled />
              <p className="text-xs text-muted-foreground mt-1">لا يمكن تغيير البريد الإلكتروني</p>
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" dir="ltr" placeholder="+962..." />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
              حفظ التغييرات
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;