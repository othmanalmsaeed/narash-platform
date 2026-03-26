import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useApproveGraduation() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      // Calculate final grade via DB function
      const { data: gradeData, error: gradeErr } = await supabase
        .rpc("calc_final_grade", { _student_id: studentId });
      if (gradeErr) throw gradeErr;

      const finalGrade = gradeData ?? "P";

      const { error } = await supabase
        .from("students")
        .update({
          status: "graduated" as any,
          final_grade: finalGrade,
          graduated_at: new Date().toISOString(),
          graduation_approved_by: user!.id,
        })
        .eq("id", studentId);
      if (error) throw error;
      return { studentId, finalGrade };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-all-students"] });
    },
  });
}
