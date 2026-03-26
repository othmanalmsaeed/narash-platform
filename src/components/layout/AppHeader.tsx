import { Bell, Moon, Sun, LogOut, CheckCheck, User } from "lucide-react";
import { useAuth, roleLabelMap } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import pearsonLogo from "@/assets/pearson-logo.svg";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const typeIcon: Record<string, string> = {
  violation: "🚨",
  contract: "📄",
  cross_training: "🔄",
  info: "ℹ️",
};

export function AppHeader() {
  const { role, fullName, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { data: notifications, unreadCount } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    toast.success(next === "dark" ? "الوضع الداكن 🌙" : "الوضع الفاتح ☀️");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
    toast.success("تم تسجيل الخروج");
  };

  const initials = fullName
    ? fullName.split(" ").map(w => w[0]).join("").slice(0, 2)
    : "??";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 backdrop-blur-sm px-3 sm:px-4 gap-2 sm:gap-4">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <SidebarTrigger />
        <img src={pearsonLogo} alt="Pearson" className="h-5 sm:h-6 w-auto dark:brightness-0 dark:invert" />
        {role && (
          <span className="text-[10px] sm:text-[11px] font-medium text-primary bg-primary/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full truncate max-w-[120px] sm:max-w-none">
            {roleLabelMap[role]}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full hover:bg-muted transition-colors">
                {isDark ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isDark ? "الوضع الفاتح" : "الوضع الداكن"}</TooltipContent>
          </Tooltip>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-muted transition-colors">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -left-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center animate-scale-in font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>الإشعارات</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-80 p-0 shadow-lg" align="end">
              <div className="p-3 border-b font-semibold text-sm flex items-center justify-between bg-muted/30">
                <span className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-primary" />
                  الإشعارات
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-muted-foreground hover:text-primary"
                    onClick={() => markAllAsRead.mutate()}
                  >
                    <CheckCheck className="h-3 w-3" />
                    قراءة الكل
                  </Button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {!notifications?.length ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">لا توجد إشعارات</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-all duration-200 ${!n.is_read ? "bg-primary/5 border-r-2 border-r-primary" : ""}`}
                      onClick={() => { if (!n.is_read) markAsRead.mutate(n.id); }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base mt-0.5">{typeIcon[n.type] || typeIcon.info}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ar })}
                          </p>
                        </div>
                        {!n.is_read && (
                          <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 status-dot" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all"
                onClick={() => navigate("/profile")}
              >
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>الملف الشخصي</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>تسجيل الخروج</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
