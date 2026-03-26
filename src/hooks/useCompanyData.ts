import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseService } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

// ============ My Students (via active placements) ============

export function useMyStudents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["company-students", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("placements")
        .select("id, student_id, students(id, student_number, status, completed_hours, total_hours, profiles!inner(full_name))")
        .eq("company_supervisor_id", user!.id)
        .eq("status", "active");
      if (error) throw error;
      return (data ?? []).map((p) => ({
        placementId: p.id,
        studentId: p.student_id,
        name: (p.students as any)?.profiles?.full_name ?? "",
        status: (p.students as any)?.status ?? "enrolled",
        completedHours: (p.students as any)?.completed_hours ?? 0,
        totalHours: (p.students as any)?.total_hours ?? 40,
      }));
    },
  });
}

// ============ Attendance ============

export function useCompanyAttendance() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["company-attendance", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get placements first, then attendance for those students
      const { data: placements } = await firebaseService
        .from("placements")
        .select("id, student_id")
        .eq("company_supervisor_id", user!.id)
        .eq("status", "active");
      if (!placements?.length) return [];

      const studentIds = placements.map((p) => p.student_id);
      const { data, error } = await firebaseService
        .from("attendance")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...r,
        studentName: (r.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useRecordAttendance() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      studentId: string;
      placementId: string;
      date: string;
      entryTime: string;
      exitTime: string;
      status: "present" | "absent" | "late" | "early_leave" | "excused";
    }) => {
      const { data, error } = await firebaseService
        .from("attendance")
        .insert({
          student_id: input.studentId,
          placement_id: input.placementId,
          school_id: schoolId!,
          recorded_by: user!.id,
          date: input.date,
          entry_time: input.entryTime,
          exit_time: input.exitTime,
          status: input.status,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-attendance"] }),
  });
}

// ============ Witness Statements ============

export function useCompanyWitness() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["company-witness", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("witness_statements")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("company_supervisor_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((w) => ({
        ...w,
        studentName: (w.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useCreateWitness() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      studentId: string;
      unitNumber: string;
      activity: string;
      gradeP: boolean;
      gradeM: boolean;
      gradeD: boolean;
      date: string;
    }) => {
      const { data, error } = await firebaseService
        .from("witness_statements")
        .insert({
          student_id: input.studentId,
          company_supervisor_id: user!.id,
          school_id: schoolId!,
          unit_number: input.unitNumber,
          activity: input.activity,
          grade_p: input.gradeP,
          grade_m: input.gradeM,
          grade_d: input.gradeD,
          date: input.date,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-witness"] }),
  });
}

// ============ Evaluations ============

export function useCompanyEvaluations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["company-evaluations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("evaluations_company")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("evaluator_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((e) => ({
        ...e,
        studentName: (e.students as any)?.profiles?.full_name ?? "",
      }));
    },
  });
}

export function useCreateEvaluation() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { studentId: string; rating: number; comment: string; date: string }) => {
      const { data, error } = await firebaseService
        .from("evaluations_company")
        .insert({
          student_id: input.studentId,
          evaluator_id: user!.id,
          school_id: schoolId!,
          rating: input.rating,
          comment: input.comment,
          date: input.date,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-evaluations"] }),
  });
}

// ============ Checklist ============

export function useCompanyChecklist(studentId: string | undefined) {
  return useQuery({
    queryKey: ["company-checklist", studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("checklist_records")
        .select("*")
        .eq("student_id", studentId!)
        .order("skill_category");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertChecklist() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      studentId: string;
      skillName: string;
      skillCategory: string;
      checked: boolean;
    }) => {
      const { data, error } = await firebaseService
        .from("checklist_records")
        .upsert(
          {
            student_id: input.studentId,
            school_id: schoolId!,
            skill_name: input.skillName,
            skill_category: input.skillCategory,
            checked: input.checked,
            checked_by: user!.id,
            date: new Date().toISOString().split("T")[0],
          },
          { onConflict: "student_id,skill_name,skill_category" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-checklist"] }),
  });
}
