import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useRegionalSchools() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["regional-schools", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get user's school to determine region
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("id", user!.id)
        .maybeSingle();

      if (!profile?.school_id) return { schools: [], region: "" };

      const { data: mySchool } = await supabase
        .from("schools")
        .select("region")
        .eq("id", profile.school_id)
        .maybeSingle();

      if (!mySchool?.region) return { schools: [], region: "" };

      const { data: schools } = await supabase
        .from("schools")
        .select("*")
        .eq("region", mySchool.region)
        .eq("is_active", true)
        .order("name");

      return { schools: schools ?? [], region: mySchool.region };
    },
  });
}

export function useRegionalCompanies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["regional-companies", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      return data ?? [];
    },
  });
}

export function useRegionalPlacements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["regional-placements", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("placements")
        .select("*, students!inner(id, student_number, status, profiles:profiles!inner(full_name)), companies!inner(name)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useRegionalStudents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["regional-students", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("*, profiles:profiles!inner(full_name)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useRegionalRisks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["regional-risks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("program_risks")
        .select("*")
        .in("status", ["Open", "Mitigating"])
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}