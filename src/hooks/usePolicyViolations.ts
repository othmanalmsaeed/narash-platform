import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseService } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ViolationType = "absence" | "non_submission" | "late_submission" | "evidence_rejected";
export type ViolationSeverity = "warning" | "formal_warning" | "action_plan" | "referral";
export type ViolationStatus = "open" | "acknowledged" | "resolved" | "escalated";
export type CorrectiveStatus = "pending" | "in_progress" | "completed" | "failed";
export type ResubmissionStatus = "pending" | "submitted" | "approved" | "rejected";

// Pearson thresholds
export const PEARSON_THRESHOLDS = {
  ABSENCE_WARNING: 3,
  ABSENCE_FORMAL_WARNING: 5,
  ABSENCE_ACTION_PLAN: 7,
  ABSENCE_REFERRAL: 10,
  MAX_RESUBMISSIONS: 1,
  RESUBMISSION_DAYS: 10,
};

export function getSeverityFromAbsenceCount(count: number): ViolationSeverity {
  if (count >= PEARSON_THRESHOLDS.ABSENCE_REFERRAL) return "referral";
  if (count >= PEARSON_THRESHOLDS.ABSENCE_ACTION_PLAN) return "action_plan";
  if (count >= PEARSON_THRESHOLDS.ABSENCE_FORMAL_WARNING) return "formal_warning";
  return "warning";
}

export function getViolationDescription(type: ViolationType, count?: number): string {
  switch (type) {
    case "absence":
      return `تجاوز الطالب عدد ${count} غياب غير مبرر وفق معايير Pearson`;
    case "non_submission":
      return "لم يتم تسليم الدليل/المهمة في الموعد المحدد";
    case "late_submission":
      return "تم تسليم الدليل/المهمة بعد الموعد المحدد";
    case "evidence_rejected":
      return "تم رفض الدليل المقدم ويتطلب إعادة تسليم";
    default:
      return "";
  }
}

export function usePolicyViolations() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["policy-violations", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("policy_violations")
        .select("*, students!inner(id, student_number, profiles!inner(full_name))")
        .eq("school_id", schoolId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateViolation() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      student_id: string;
      violation_type: ViolationType;
      severity: ViolationSeverity;
      description: string;
      absence_count?: number;
      related_entity_id?: string;
    }) => {
      const { data, error } = await firebaseService
        .from("policy_violations")
        .insert({
          ...input,
          school_id: schoolId!,
          created_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policy-violations"] }),
  });
}

export function useUpdateViolation() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: ViolationStatus; severity?: ViolationSeverity }) => {
      const updateData: any = { ...updates };
      if (updates.status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user!.id;
      }
      const { data, error } = await firebaseService
        .from("policy_violations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policy-violations"] }),
  });
}

export function useCorrectiveActions(violationId?: string) {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["corrective-actions", schoolId, violationId],
    enabled: !!schoolId,
    queryFn: async () => {
      let query = firebaseService
        .from("corrective_action_plans")
        .select("*")
        .eq("school_id", schoolId!)
        .order("created_at", { ascending: false });
      if (violationId) query = query.eq("violation_id", violationId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateCorrectiveAction() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      violation_id: string;
      student_id: string;
      plan_description: string;
      deadline: string;
    }) => {
      const { data, error } = await firebaseService
        .from("corrective_action_plans")
        .insert({
          ...input,
          school_id: schoolId!,
          created_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["corrective-actions"] }),
  });
}

export function useUpdateCorrectiveAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: CorrectiveStatus; outcome_notes?: string }) => {
      const { data, error } = await firebaseService
        .from("corrective_action_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["corrective-actions"] }),
  });
}

export function useResubmissionRequests() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["resubmission-requests", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("resubmission_requests")
        .select("*, students!inner(id, student_number, profiles!inner(full_name))")
        .eq("school_id", schoolId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateResubmission() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      evidence_id: string;
      student_id: string;
      reason: string;
      new_deadline: string;
    }) => {
      const { data, error } = await firebaseService
        .from("resubmission_requests")
        .insert({
          ...input,
          school_id: schoolId!,
          created_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resubmission-requests"] }),
  });
}

export function useUpdateResubmission() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: ResubmissionStatus; reviewer_notes?: string }) => {
      const updateData: any = { ...updates };
      if (updates.status === "approved" || updates.status === "rejected") {
        updateData.reviewed_by = user!.id;
        updateData.reviewed_at = new Date().toISOString();
      }
      const { data, error } = await firebaseService
        .from("resubmission_requests")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resubmission-requests"] }),
  });
}

// Auto-detect violations from attendance data
export function useAbsenceViolationCheck(studentId?: string) {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["absence-check", studentId, schoolId],
    enabled: !!studentId && !!schoolId,
    queryFn: async () => {
      const { count, error } = await firebaseService
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("student_id", studentId!)
        .eq("school_id", schoolId!)
        .eq("status", "absent");
      if (error) throw error;
      return {
        absenceCount: count ?? 0,
        shouldWarn: (count ?? 0) >= PEARSON_THRESHOLDS.ABSENCE_WARNING,
        severity: getSeverityFromAbsenceCount(count ?? 0),
      };
    },
  });
}
