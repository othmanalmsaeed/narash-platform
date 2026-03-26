import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ============ Student Profile & Dashboard ============

export function useStudentProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, profiles!inner(full_name, email, phone), specializations(name, sector)")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// ============ Attendance ============

export function useStudentAttendance() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-attendance", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ============ Diary ============

export function useStudentDiary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-diary", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("student_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateDiaryEntry() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { date: string; content: string }) => {
      const { data, error } = await supabase
        .from("diary_entries")
        .insert({ student_id: user!.id, school_id: schoolId!, date: entry.date, content: entry.content })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-diary"] }),
  });
}

// ============ Journal ============

export function useStudentJournal() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-journal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("student_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateJournalEntry() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { week_label: string; date: string; learned: string; challenges: string; solutions: string; goals: string }) => {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ student_id: user!.id, school_id: schoolId!, ...entry })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-journal"] }),
  });
}

// ============ Evidence ============

export function useStudentEvidence() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-evidence", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evidence_records")
        .select("*")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUploadEvidence() {
  const { user, schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; description: string; file: File }) => {
      const filePath = `${schoolId}/${user!.id}/${Date.now()}-${input.file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("evidence")
        .upload(filePath, input.file);
      if (uploadErr) throw uploadErr;

      const { data, error } = await supabase
        .from("evidence_records")
        .insert({
          student_id: user!.id,
          school_id: schoolId!,
          title: input.title,
          description: input.description,
          file_path: filePath,
          file_type: input.file.type,
          file_size_bytes: input.file.size,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student-evidence"] }),
  });
}
