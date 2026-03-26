
-- Create program_cycles table
CREATE TABLE public.program_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'Active', 'Completed')),
  visit_windows JSONB NOT NULL DEFAULT '[]'::jsonb,
  assessment_windows JSONB NOT NULL DEFAULT '[]'::jsonb,
  reporting_deadlines JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.program_cycles ENABLE ROW LEVEL SECURITY;

-- Select: admin of same school, regional of same region, ministry
CREATE POLICY "program_cycles_select" ON public.program_cycles
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    (school_id = get_user_school_id(auth.uid()))
    OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry')
  );

-- Insert: admin of same school
CREATE POLICY "program_cycles_insert" ON public.program_cycles
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

-- Update: admin of same school
CREATE POLICY "program_cycles_update" ON public.program_cycles
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

-- Index
CREATE INDEX idx_program_cycles_school ON public.program_cycles(school_id);
