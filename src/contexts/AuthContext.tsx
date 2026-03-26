import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "student" | "company_supervisor" | "school_supervisor" | "admin" | "regional" | "ministry";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  schoolId: string | null;
  fullName: string;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  role: null,
  schoolId: null,
  fullName: "",
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Map app_role to the old UserRole type used in sidebar/header
export const roleToLegacy: Record<AppRole, string> = {
  student: "student",
  company_supervisor: "company",
  school_supervisor: "school",
  admin: "admin",
  regional: "regional",
  ministry: "admin",
};

export const roleLabelMap: Record<AppRole, string> = {
  student: "الطالب",
  company_supervisor: "مشرف العمل",
  school_supervisor: "المشرف المدرسي",
  admin: "مدير النظام",
  regional: "المنسق الإقليمي",
  ministry: "الوزارة",
};

async function fetchUserMeta(userId: string) {
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("school_id, full_name")
    .eq("id", userId)
    .maybeSingle();

  return {
    role: (roleData?.role as AppRole) ?? null,
    schoolId: profileData?.school_id ?? null,
    fullName: profileData?.full_name ?? "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Use setTimeout to avoid Supabase deadlock during auth callback
          setTimeout(async () => {
            const meta = await fetchUserMeta(newSession.user.id);
            setRole(meta.role);
            setSchoolId(meta.schoolId);
            setFullName(meta.fullName);
            setIsLoading(false);
          }, 0);
        } else {
          setRole(null);
          setSchoolId(null);
          setFullName("");
          setIsLoading(false);
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        const meta = await fetchUserMeta(existing.user.id);
        setRole(meta.role);
        setSchoolId(meta.schoolId);
        setFullName(meta.fullName);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, schoolId, fullName, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
