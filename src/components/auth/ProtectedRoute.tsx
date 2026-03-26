import { Navigate } from "react-router-dom";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const roleDashboard: Record<AppRole, string> = {
  student: "/student",
  company_supervisor: "/company",
  school_supervisor: "/school",
  admin: "/admin",
  regional: "/regional",
  ministry: "/admin",
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-6" dir="rtl">
        <p className="text-lg font-semibold">لم يتم تعيين دور لحسابك</p>
        <p className="text-muted-foreground">تواصل مع إدارة المدرسة لتعيين صلاحياتك</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleDashboard[role]} replace />;
  }

  return <>{children}</>;
}
