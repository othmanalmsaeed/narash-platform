import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseService } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

export type CrossTrainingStatus = "pending" | "approved_source" | "approved_destination" | "fully_approved" | "rejected" | "completed";

export function useCrossTrainingSchools(cycleYear: number) {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["cross-training-schools", schoolId, cycleYear],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await firebaseService.rpc("get_cross_training_schools", {
        _student_school_id: schoolId!,
        _cycle_year: cycleYear,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCrossTrainingRequests() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["cross-training-requests", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("cross_school_training_requests")
        .select("*, pathway_skills_matrix!inner(objective_title, sector, objective_number), source_school:schools!cross_school_training_requests_source_school_id_fkey(name, region), destination_school:schools!cross_school_training_requests_destination_school_id_fkey(name, region)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateCrossTrainingRequest() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      destination_school_id: string;
      objective_id: string;
      reason: string;
    }) => {
      const { data, error } = await firebaseService
        .from("cross_school_training_requests")
        .insert({
          student_id: user!.id,
          source_school_id: schoolId!,
          ...input,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cross-training-requests"] }),
  });
}

export function useUpdateCrossTrainingRequest() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, rejectionReason }: { id: string; action: "approve_source" | "approve_destination" | "reject"; rejectionReason?: string }) => {
      const updates: any = {};
      if (action === "approve_source") {
        updates.status = "approved_source";
        updates.source_approved_by = user!.id;
        updates.source_approved_at = new Date().toISOString();
      } else if (action === "approve_destination") {
        updates.status = "fully_approved";
        updates.destination_approved_by = user!.id;
        updates.destination_approved_at = new Date().toISOString();
      } else if (action === "reject") {
        updates.status = "rejected";
        updates.rejection_reason = rejectionReason;
      }

      // Check if both approvals complete
      if (action === "approve_source") {
        const { data: existing } = await firebaseService
          .from("cross_school_training_requests")
          .select("destination_approved_by")
          .eq("id", id)
          .single();
        if (existing?.destination_approved_by) {
          updates.status = "fully_approved";
        }
      } else if (action === "approve_destination") {
        const { data: existing } = await firebaseService
          .from("cross_school_training_requests")
          .select("source_approved_by")
          .eq("id", id)
          .single();
        if (!existing?.source_approved_by) {
          updates.status = "approved_destination";
        }
      }

      const { data, error } = await firebaseService
        .from("cross_school_training_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cross-training-requests"] }),
  });
}
