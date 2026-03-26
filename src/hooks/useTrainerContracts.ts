import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ContractStatus = "draft" | "active" | "completed" | "terminated";

export interface ContractInput {
  trainer_name: string;
  trainer_phone?: string;
  trainer_email?: string;
  trainer_specialization: string;
  skill_program: string;
  total_hours: number;
  total_days: number;
  start_date: string;
  end_date: string;
  financial_amount?: number;
  ministry_representative?: string;
  school_representative?: string;
}

export function useTrainerContracts() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["trainer-contracts", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_trainer_contracts")
        .select("*")
        .eq("school_id", schoolId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateContract() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ContractInput) => {
      const { data, error } = await supabase
        .from("external_trainer_contracts")
        .insert({
          school_id: schoolId!,
          created_by: user!.id,
          ...input,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainer-contracts"] }),
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ContractInput & { status: ContractStatus; completed_hours: number; final_report: string; trainee_evaluation_notes: string }>) => {
      const { data, error } = await supabase
        .from("external_trainer_contracts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainer-contracts"] }),
  });
}
