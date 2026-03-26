import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseService } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFollowUpVisits() {
  const { user, schoolId } = useAuth();
  return useQuery({
    queryKey: ["follow-up-visits", schoolId],
    enabled: !!user && !!schoolId,
    queryFn: async () => {
      const { data, error } = await firebaseService
        .from("follow_up_visits")
        .select("*, students!inner(id, profiles!inner(full_name)), placements!inner(start_date, companies!inner(name))")
        .eq("school_id", schoolId!)
        .order("visit_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateFollowUp() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      placement_id: string;
      student_id: string;
      visit_type: string;
      visit_date: string;
      notes: string;
    }) => {
      const { data, error } = await firebaseService
        .from("follow_up_visits")
        .insert({
          ...input,
          school_id: schoolId!,
          conducted_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["follow-up-visits"] }),
  });
}
