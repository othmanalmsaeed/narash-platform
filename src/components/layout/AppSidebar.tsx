import { useAuth, roleLabelMap, roleToLegacy, type AppRole } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, BookOpen, Clock, ClipboardCheck,
  Star, Eye, Award, FolderOpen, BarChart3, GraduationCap,
  FileEdit, Upload, CheckSquare, Target, FileText, Settings, Shield,
  Layers, Building2, Container, UserCheck, CalendarDays, ShieldAlert, MapPin, ArrowLeftRight,
  ShieldCheck, ScrollText, HeartPulse,
} from "lucide-react";
import pearsonLogo from "@/assets/pearson-logo.svg";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type LegacyRole = "student" | "company" | "school" | "admin" | "regional";

const menuItems: Record<LegacyRole, { title: string; url: string; icon: any }[]> = {
  student: [
    { title: "لوحة التحكم", url: "/student", icon: LayoutDashboard },
    { title: "سجل المهارات", url: "/student/journal", icon: BookOpen },
    { title: "اليوميات", url: "/student/diary", icon: FileEdit },
    { title: "رفع الأدلة", url: "/student/evidence", icon: Upload },
    { title: "التدريب عبر المدارس", url: "/school/cross-training", icon: ArrowLeftRight },
    { title: "سجل الحضور", url: "/student/attendance", icon: Clock },
    { title: "الإعدادات", url: "/settings", icon: Settings },
  ],
  company: [
    { title: "لوحة التحكم", url: "/company", icon: LayoutDashboard },
    { title: "سجل الحضور", url: "/company/attendance", icon: Clock },
    { title: "شهادة الشاهد", url: "/company/witness", icon: ClipboardCheck },
    { title: "تقييم مختصر", url: "/company/evaluation", icon: Star },
    { title: "قائمة رصد المهارات", url: "/company/checklist", icon: CheckSquare },
    { title: "إصابات التدريب", url: "/company/incidents", icon: HeartPulse },
    { title: "الإعدادات", url: "/settings", icon: Settings },
  ],
  school: [
    { title: "لوحة التحكم", url: "/school", icon: LayoutDashboard },
    { title: "سجل المراقبة", url: "/school/observation", icon: Eye },
    { title: "التقييم النهائي", url: "/school/assessment", icon: Award },
    { title: "التقييم المزدوج", url: "/school/dual-assessment", icon: ShieldCheck },
    { title: "مراجعة الأدلة", url: "/school/evidence", icon: FileText },
    { title: "أهداف التعلم", url: "/school/learning-goals", icon: Target },
    { title: "السجلات", url: "/school/logs", icon: FolderOpen },
    { title: "مصفوفة المهارات", url: "/school/skills-matrix", icon: Layers },
    { title: "سياسات الغياب", url: "/school/policy-violations", icon: ShieldAlert },
    { title: "التدريب عبر المدارس", url: "/school/cross-training", icon: ArrowLeftRight },
    { title: "متابعات الزيارات", url: "/school/follow-ups", icon: ClipboardCheck },
    { title: "إصابات التدريب (عرض)", url: "/school/incidents", icon: HeartPulse },
    { title: "الإعدادات", url: "/settings", icon: Settings },
  ],
  admin: [
    { title: "لوحة الإحصائيات", url: "/admin", icon: BarChart3 },
    { title: "إدارة الطلاب", url: "/admin/students", icon: GraduationCap },
    { title: "إدارة القطاعات", url: "/admin/sectors", icon: Layers },
    { title: "اعتماد الشركات", url: "/admin/accreditation", icon: Building2 },
    { title: "السعة التدريبية", url: "/admin/capacity", icon: Container },
    { title: "توزيع الطلاب", url: "/admin/placement", icon: UserCheck },
    { title: "التقويم التشغيلي", url: "/admin/schedule", icon: CalendarDays },
    { title: "المخاطر والامتثال", url: "/admin/risks", icon: ShieldAlert },
    { title: "المواءمة التنظيمية", url: "/admin/regulatory", icon: Shield },
    { title: "ضمان البرنامج", url: "/admin/assurance", icon: ShieldCheck },
    { title: "عقود المدربين", url: "/admin/trainer-contracts", icon: FileText },
    { title: "سجل التتبع", url: "/admin/audit", icon: ScrollText },
    { title: "السلامة المهنية", url: "/admin/safety", icon: HeartPulse },
    { title: "الإعدادات", url: "/settings", icon: Settings },
  ],
  regional: [
    { title: "لوحة المنطقة", url: "/regional", icon: MapPin },
    { title: "الإعدادات", url: "/settings", icon: Settings },
  ],
};

export function AppSidebar() {
  const { role } = useAuth();
  const location = useLocation();
  const legacyRole = role ? (roleToLegacy[role] as LegacyRole) : "student";
  const items = menuItems[legacyRole] || menuItems.student;
  const displayLabel = role ? roleLabelMap[role] : "";

  return (
    <Sidebar side="right" className="border-l-0 border-r-0">
      {/* Logo area with gradient accent line */}
      <div className="relative flex items-center gap-3 px-4 py-5 border-b border-sidebar-border overflow-hidden">
        <div className="absolute bottom-0 right-0 left-0 h-[2px]" style={{ background: "var(--gradient-accent)" }} />
        <img src={pearsonLogo} alt="Pearson" className="h-8 w-auto brightness-0 invert" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-sidebar-foreground tracking-tight">منصة WBL</span>
          <span className="text-[11px] text-sidebar-foreground/60">{displayLabel}</span>
        </div>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider delayDuration={300}>
                {items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className="transition-all duration-200"
                          >
                            <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                              {isActive && (
                                <span className="mr-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
