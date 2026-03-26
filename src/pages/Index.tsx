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

const Index = () => {
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

  if (role) {
    return <Navigate to={roleDashboard[role]} replace />;
  }

  return <Navigate to="/auth" replace />;
};

export default Index;
