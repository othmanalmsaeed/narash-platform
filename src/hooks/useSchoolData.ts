import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ============ My Students (via active placements as school supervisor) ============

export function useSchoolStudents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school-students", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("placements")
        .select("id, student_id, students(id, student_number, status, completed_hours, total_hours, profiles!inner(full_name))")
        .eq("school_supervisor_id", user!.id)
        .eq("status", "active");
      if (error) throw error;
      return (data ?? []).map((p) => ({
        placementId: p.id,
        studentId: p.student_id,
        name: (p.students as any)?.profiles?.full_name ?? "",
        status: (p.students as any)?.status ?? "enrolled",
      }));
    },
  });
}

// ============ Observations ============

export function useSchoolObservations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school-observations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("observations")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("observer_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((o) => ({
        ...o,
        studentName: (o.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useCreateObservation() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      studentId: string;
      date: string;
      activities: string;
      questions: string;
      evidence: string;
      recommendations: string;
    }) => {
      const { data, error } = await supabase
        .from("observations")
        .insert({
          student_id: input.studentId,
          observer_id: user!.id,
          school_id: schoolId!,
          date: input.date,
          activities: input.activities,
          questions: input.questions,
          evidence: input.evidence,
          recommendations: input.recommendations,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school-observations"] }),
  });
}

// ============ Assessments (evaluations_school) ============

export function useSchoolAssessments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school-assessments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations_school")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("evaluator_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((a) => ({
        ...a,
        studentName: (a.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useCreateAssessment() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      studentId: string;
      unit: string;
      grade: "P" | "M" | "D";
      notes: string;
      date: string;
    }) => {
      const { data, error } = await supabase
        .from("evaluations_school")
        .insert({
          student_id: input.studentId,
          evaluator_id: user!.id,
          school_id: schoolId!,
          unit: input.unit,
          grade: input.grade,
          notes: input.notes,
          date: input.date,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school-assessments"] }),
  });
}

// ============ Evidence Review ============

export function useSchoolEvidence() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school-evidence", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get students supervised by this user
      const { data: placements } = await supabase
        .from("placements")
        .select("student_id")
        .eq("school_supervisor_id", user!.id)
        .eq("status", "active");
      if (!placements?.length) return [];

      const studentIds = placements.map((p) => p.student_id);
      const { data, error } = await supabase
        .from("evidence_records")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((e) => ({
        ...e,
        studentName: (e.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useReviewEvidence() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      evidenceId: string;
      status: "approved" | "rejected";
      feedback?: string;
    }) => {
      const { data, error } = await supabase
        .from("evidence_records")
        .update({
          status: input.status,
          feedback: input.feedback ?? null,
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", input.evidenceId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school-evidence"] }),
  });
}

// ============ Learning Goals ============

export function useSchoolLearningGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school-learning-goals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: placements } = await supabase
        .from("placements")
        .select("student_id")
        .eq("school_supervisor_id", user!.id)
        .eq("status", "active");
      if (!placements?.length) return [];

      const studentIds = placements.map((p) => p.student_id);
      const { data, error } = await supabase
        .from("learning_goals")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((g) => ({
        ...g,
        studentName: (g.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useCreateLearningGoals() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { studentId: string; goals: string[]; date: string }) => {
      const { data, error } = await supabase
        .from("learning_goals")
        .insert({
          student_id: input.studentId,
          school_id: schoolId!,
          goals: input.goals,
          date: input.date,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["school-learning-goals"] }),
  });
}

// ============ Logs (read-only views of student data) ============

export function useSchoolJournals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school-journals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: placements } = await supabase
        .from("placements")
        .select("student_id")
        .eq("school_supervisor_id", user!.id)
        .eq("status", "active");
      if (!placements?.length) return [];

      const studentIds = placements.map((p) => p.student_id);
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((j) => ({
        ...j,
        studentName: (j.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useSchoolDiaries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school-diaries", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: placements } = await supabase
        .from("placements")
        .select("student_id")
        .eq("school_supervisor_id", user!.id)
        .eq("status", "active");
      if (!placements?.length) return [];

      const studentIds = placements.map((p) => p.student_id);
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((d) => ({
        ...d,
        studentName: (d.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useSchoolWitness() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school-witness", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: placements } = await supabase
        .from("placements")
        .select("student_id")
        .eq("school_supervisor_id", user!.id)
        .eq("status", "active");
      if (!placements?.length) return [];

      const studentIds = placements.map((p) => p.student_id);
      const { data, error } = await supabase
        .from("witness_statements")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((w) => ({
        ...w,
        studentName: (w.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useSchoolCompanyEvals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["school-company-evals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: placements } = await supabase
        .from("placements")
        .select("student_id")
        .eq("school_supervisor_id", user!.id)
        .eq("status", "active");
      if (!placements?.length) return [];

      const studentIds = placements.map((p) => p.student_id);
      const { data, error } = await supabase
        .from("evaluations_company")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((e) => ({
        ...e,
        studentName: (e.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}
