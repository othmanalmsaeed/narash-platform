import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  emoji?: string;
  children?: React.ReactNode;
  className?: string;
}

const breadcrumbLabels: Record<string, string> = {
  student: "الطالب",
  company: "مشرف العمل",
  school: "المدرسة",
  admin: "الإدارة",
  regional: "المنطقة",
  settings: "الإعدادات",
  profile: "الملف الشخصي",
  journal: "سجل المهارات",
  diary: "اليوميات",
  evidence: "الأدلة",
  attendance: "الحضور",
  observation: "المراقبة",
  assessment: "التقييم",
  "dual-assessment": "التقييم المزدوج",
  "learning-goals": "أهداف التعلم",
  logs: "السجلات",
  "skills-matrix": "المصفوفة",
  "policy-violations": "سياسات الغياب",
  "cross-training": "التدريب عبر المدارس",
  witness: "شهادة الشاهد",
  evaluation: "تقييم مختصر",
  checklist: "قائمة المهارات",
  sectors: "القطاعات",
  accreditation: "الاعتماد",
  capacity: "السعة",
  placement: "التوزيع",
  schedule: "التقويم",
  risks: "المخاطر",
  regulatory: "التنظيمية",
  assurance: "ضمان البرنامج",
  "trainer-contracts": "عقود المدربين",
  audit: "سجل التتبع",
};

export function PageHeader({ title, description, icon: Icon, emoji, children, className }: PageHeaderProps) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <div className={cn("space-y-1 animate-fade-in", className)}>
      {/* Breadcrumb */}
      {segments.length > 1 && (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          {segments.map((seg, i) => {
            const path = "/" + segments.slice(0, i + 1).join("/");
            const isLast = i === segments.length - 1;
            return (
              <span key={path} className="flex items-center gap-1">
                <span className="text-muted-foreground/40">‹</span>
                {isLast ? (
                  <span className="text-foreground font-medium">{breadcrumbLabels[seg] || seg}</span>
                ) : (
                  <Link to={path} className="hover:text-primary transition-colors">
                    {breadcrumbLabels[seg] || seg}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          )}
          {emoji && <span className="text-2xl">{emoji}</span>}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
      </div>
    </div>
  );
}
