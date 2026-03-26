import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseService } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useSkillsMatrix(sector?: string) {
  return useQuery({
    queryKey: ["skills-matrix", sector],
    queryFn: async () => {
      let query = firebaseService
        .from("pathway_skills_matrix")
        .select("*")
        .order("objective_number", { ascending: true });
      if (sector) query = query.eq("sector", sector);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSelectedObjectives(cycleYear?: number) {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["selected-objectives", schoolId, cycleYear],
    enabled: !!schoolId,
    queryFn: async () => {
      let query = firebaseService
        .from("school_selected_objectives")
        .select("*, pathway_skills_matrix(*)")
        .eq("school_id", schoolId!);
      if (cycleYear) query = query.eq("cycle_year", cycleYear);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSelectObjective() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { objectiveId: string; cycleYear: number }) => {
      const { data, error } = await firebaseService
        .from("school_selected_objectives")
        .insert({
          school_id: schoolId!,
          cycle_year: input.cycleYear,
          objective_id: input.objectiveId,
          selected_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["selected-objectives"] }),
  });
}

export function useDeselectObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await firebaseService
        .from("school_selected_objectives")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["selected-objectives"] }),
  });
}
