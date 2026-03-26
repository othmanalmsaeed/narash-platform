import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  useAccessibility,
  fontSizeLabels,
  lineSpacingLabels,
  letterSpacingLabels,
} from "@/contexts/AccessibilityContext";
import { Moon, Sun, Type, Accessibility, Eye, Zap, AlignJustify, Space, Focus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const Settings = () => {
  const {
    fontSize, setFontSize,
    highContrast, setHighContrast,
    reduceMotion, setReduceMotion,
    lineSpacing, setLineSpacing,
    letterSpacing, setLetterSpacing,
    focusMode, setFocusMode,
    resetAll,
  } = useAccessibility();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    toast.success(next === "dark" ? "تم تفعيل الوضع الداكن 🌙" : "تم تفعيل الوضع الفاتح ☀️");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold">⚙️ الإعدادات</h1>

        {/* Theme */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {isDark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-accent" />}
              <CardTitle>المظهر</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label>الوضع الداكن</Label>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" />
              <CardTitle>إعدادات إمكانية الوصول</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              خيارات لتحسين تجربة الاستخدام لذوي الاحتياجات الخاصة
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4" /> حجم الخط
              </Label>
              <Select value={fontSize} onValueChange={(v) => { setFontSize(v as any); toast.success("تم تحديث حجم الخط ✅"); }}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(fontSizeLabels) as [string, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> وضع التباين العالي
                <span className="text-xs text-muted-foreground font-normal">(لضعاف البصر)</span>
              </Label>
              <Switch checked={highContrast} onCheckedChange={(v) => { setHighContrast(v); toast.success(v ? "تم تفعيل التباين العالي 👁️" : "تم إلغاء التباين العالي"); }} />
            </div>

            {/* Reduce Motion */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> تقليل الحركة
                <span className="text-xs text-muted-foreground font-normal">(إيقاف الرسوم المتحركة)</span>
              </Label>
              <Switch checked={reduceMotion} onCheckedChange={(v) => { setReduceMotion(v); toast.success(v ? "تم تقليل الحركة ⚡" : "تم إعادة تفعيل الحركة"); }} />
            </div>

            {/* Line Spacing */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <AlignJustify className="h-4 w-4" /> تباعد الأسطر
                <span className="text-xs text-muted-foreground font-normal">(يساعد في القراءة)</span>
              </Label>
              <Select value={lineSpacing} onValueChange={(v) => { setLineSpacing(v as any); toast.success("تم تحديث تباعد الأسطر ✅"); }}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(lineSpacingLabels) as [string, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Letter Spacing */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Space className="h-4 w-4" /> تباعد الحروف والكلمات
                <span className="text-xs text-muted-foreground font-normal">(لعسر القراءة)</span>
              </Label>
              <Select value={letterSpacing} onValueChange={(v) => { setLetterSpacing(v as any); toast.success("تم تحديث تباعد الحروف ✅"); }}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(letterSpacingLabels) as [string, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Focus Mode */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Focus className="h-4 w-4" /> وضع التركيز المحسّن
                <span className="text-xs text-muted-foreground font-normal">(للتنقل بلوحة المفاتيح)</span>
              </Label>
              <Switch checked={focusMode} onCheckedChange={(v) => { setFocusMode(v); toast.success(v ? "تم تفعيل وضع التركيز 🎯" : "تم إلغاء وضع التركيز"); }} />
            </div>
          </CardContent>
        </Card>

        {/* Reset */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => { resetAll(); toast.success("تم إعادة تعيين جميع الإعدادات 🔄"); }}
            >
              <RotateCcw className="h-4 w-4" />
              إعادة تعيين جميع إعدادات إمكانية الوصول
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
