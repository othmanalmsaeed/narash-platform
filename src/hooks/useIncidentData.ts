import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseService } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

const incidentTypeLabels: Record<string, string> = {
  work_injury: "إصابة عمل",
  equipment_accident: "حادث معدات",
  chemical_exposure: "تعرض كيميائي",
  fall: "سقوط",
  other: "أخرى",
};

const severityLabels: Record<string, string> = {
  minor: "طفيفة",
  moderate: "متوسطة",
  serious: "خطيرة",
  critical: "حرجة",
};

const statusLabels: Record<string, string> = {
  reported: "تم الإبلاغ",
  first_aid: "إسعاف أولي",
  medical_report: "تقرير طبي",
  under_treatment: "قيد العلاج",
  resolved: "تم الحل",
  closed: "مغلق",
};

export { incidentTypeLabels, severityLabels, statusLabels };

// Helper to map raw rows
function mapIncident(i: any) {
  return {
    ...i,
    studentName: i.students?.profiles?.full_name ?? "",
    typeLabel: incidentTypeLabels[i.incident_type] ?? i.incident_type,
    severityLabel: severityLabels[i.severity] ?? i.severity,
    statusLabel: statusLabels[i.status] ?? i.status,
  };
}

// ============ Company Incidents (primary — company_supervisor creates) ============

export function useCompanyIncidents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["company-incidents", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get student IDs from active placements
      const { data: placements } = await firebaseService
        .from("placements")
        .select("student_id, school_id")
        .eq("company_supervisor_id", user!.id)
        .eq("status", "active");
      if (!placements?.length) return [];

      const studentIds = placements.map((p) => p.student_id);
      const { data, error } = await firebaseService
        .from("training_incidents")
        .select("*, students!inner(profiles!inner(full_name))")
        .in("student_id", studentIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapIncident);
    },
  });
}

export function useCreateCompanyIncident() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      studentId: string;
      incidentDate: string;
      incidentType: string;
      severity: string;
      description: string;
      location?: string;
      firstAidProvided?: boolean;
    }) => {
      // Get school_id from the student's active placement
      const { data: placement, error: placementError } = await firebaseService
        .from("placements")
        .select("school_id")
        .eq("company_supervisor_id", user!.id)
        .eq("student_id", input.studentId)
        .eq("status", "active")
        .single();
      if (placementError || !placement) throw new Error("لا يوجد توزيع نشط لهذا الطالب");

      const { data, error } = await firebaseService
        .from("training_incidents")
        .insert({
          student_id: input.studentId,
          school_id: placement.school_id,
          reported_by: user!.id,
          incident_date: input.incidentDate,
          incident_type: input.incidentType as any,
          severity: input.severity as any,
          description: input.description,
          location: input.location ?? null,
          first_aid_provided: input.firstAidProvided ?? false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-incidents"] }),
  });
}

// ============ Update Incident Status (company_supervisor + admin) ============

export function useUpdateIncidentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      incidentId: string;
      status: string;
      medicalReportSummary?: string;
      actionsTaken?: string;
      followUpNotes?: string;
    }) => {
      const updateData: any = { status: input.status };
      if (input.medicalReportSummary) updateData.medical_report_summary = input.medicalReportSummary;
      if (input.actionsTaken) updateData.actions_taken = input.actionsTaken;
      if (input.followUpNotes) updateData.follow_up_notes = input.followUpNotes;
      if (input.status === "resolved" || input.status === "closed") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await firebaseService
        .from("training_incidents")
        .update(updateData)
        .eq("id", input.incidentId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-incidents"] });
      qc.invalidateQueries({ queryKey: ["school-incidents"] });
      qc.invalidateQueries({ queryKey: ["admin-incidents"] });
    },
  });
}

// ============ School Incidents (read-only for school_supervisor) ============

export function useSchoolIncidents() {
  const { user, schoolId } = useAuth();
  return useQuery({
    queryKey: ["school-incidents", schoolId],
    enabled: !!user && !!schoolId,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("training_incidents")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("school_id", schoolId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapIncident);
    },
  });
}

// ============ Admin Incidents (all school incidents) ============

export function useAdminIncidents() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-incidents", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("training_incidents")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("school_id", schoolId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapIncident);
    },
  });
}
