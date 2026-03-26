import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ============ Dual Assessment Data (for school supervisor) ============

export interface DualAssessmentRow {
  studentId: string;
  studentName: string;
  unit: string;
  schoolEval: {
    id: string;
    grade: "P" | "M" | "D";
    notes: string | null;
    date: string;
    is_locked: boolean;
  } | null;
  companyEval: {
    id: string;
    rating: number;
    comment: string | null;
    date: string;
    is_locked: boolean;
  } | null;
  isComplete: boolean;
  isLocked: boolean;
}

export function useDualAssessments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dual-assessments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get my supervised students
      const { data: placements } = await supabase
        .from("placements")
        .select("student_id")
        .eq("school_supervisor_id", user!.id)
        .eq("status", "active");
      if (!placements?.length) return [];

      const studentIds = placements.map((p) => p.student_id);

      // Fetch school evaluations
      const { data: schoolEvals } = await supabase
        .from("evaluations_school")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("date", { ascending: false });

      // Fetch company evaluations
      const { data: companyEvals } = await supabase
        .from("evaluations_company")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("date", { ascending: false });

      // Build dual assessment map: group by student + unit
      const map = new Map<string, DualAssessmentRow>();

      (schoolEvals ?? []).forEach((se) => {
        const key = `${se.student_id}::${se.unit}`;
        const studentName = (se.students as any)?.profiles?.full_name ?? "";
        const existing = map.get(key);
        if (existing) {
          existing.schoolEval = {
            id: se.id,
            grade: se.grade as "P" | "M" | "D",
            notes: se.notes,
            date: se.date,
            is_locked: se.is_locked ?? false,
          };
        } else {
          map.set(key, {
            studentId: se.student_id,
            studentName,
            unit: se.unit,
            schoolEval: {
              id: se.id,
              grade: se.grade as "P" | "M" | "D",
              notes: se.notes,
              date: se.date,
              is_locked: se.is_locked ?? false,
            },
            companyEval: null,
            isComplete: false,
            isLocked: se.is_locked ?? false,
          });
        }
      });

      // Match company evaluations to the closest unit assessment per student
      const companyEvalsByStudent = new Map<string, typeof companyEvals>();
      (companyEvals ?? []).forEach((ce) => {
        const list = companyEvalsByStudent.get(ce.student_id) ?? [];
        list.push(ce);
        companyEvalsByStudent.set(ce.student_id, list);
      });

      // For each student in map, attach best matching company eval
      const seenStudents = new Set<string>();
      map.forEach((row) => {
        if (!seenStudents.has(row.studentId)) {
          seenStudents.add(row.studentId);
          const ces = companyEvalsByStudent.get(row.studentId) ?? [];
          if (ces.length > 0) {
            const ce = ces[0]; // most recent
            row.companyEval = {
              id: ce.id,
              rating: ce.rating,
              comment: ce.comment,
              date: ce.date,
              is_locked: (ce as any).is_locked ?? false,
            };
          }
        }
      });

      // Also add company-only evaluations for students not yet in map
      companyEvalsByStudent.forEach((ces, studentId) => {
        if (!seenStudents.has(studentId) && ces.length > 0) {
          const ce = ces[0];
          const studentName = (ce.students as any)?.profiles?.full_name ?? "";
          map.set(`${studentId}::—`, {
            studentId,
            studentName,
            unit: "—",
            schoolEval: null,
            companyEval: {
              id: ce.id,
              rating: ce.rating,
              comment: ce.comment,
              date: ce.date,
              is_locked: (ce as any).is_locked ?? false,
            },
            isComplete: false,
            isLocked: false,
          });
        }
      });

      // Update isComplete and isLocked
      map.forEach((row) => {
        row.isComplete = row.schoolEval !== null && row.companyEval !== null;
        row.isLocked = (row.schoolEval?.is_locked ?? false) || (row.companyEval?.is_locked ?? false);
      });

      return Array.from(map.values());
    },
  });
}

// ============ Lock Dual Assessment ============

export function useLockDualAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      studentId: string;
      unit: string;
      schoolEvalId: string;
      companyEvalId: string;
    }) => {
      const { data, error } = await supabase.rpc("lock_dual_assessment" as any, {
        _student_id: input.studentId,
        _unit: input.unit,
        _school_eval_id: input.schoolEvalId,
        _company_eval_id: input.companyEvalId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dual-assessments"] });
      qc.invalidateQueries({ queryKey: ["school-assessments"] });
    },
  });
}

// ============ Student's view of their assessments ============

export function useStudentAssessments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-assessments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: schoolEvals } = await supabase
        .from("evaluations_school")
        .select("*")
        .eq("student_id", user!.id)
        .order("date", { ascending: false });

      const { data: companyEvals } = await supabase
        .from("evaluations_company")
        .select("*")
        .eq("student_id", user!.id)
        .order("date", { ascending: false });

      return {
        schoolEvals: schoolEvals ?? [],
        companyEvals: companyEvals ?? [],
      };
    },
  });
}
