
-- Cross-school training request status
CREATE TYPE public.cross_training_status AS ENUM ('pending', 'approved_source', 'approved_destination', 'fully_approved', 'rejected', 'completed');

-- Cross-school training requests
CREATE TABLE public.cross_school_training_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  source_school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  destination_school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES public.pathway_skills_matrix(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status public.cross_training_status NOT NULL DEFAULT 'pending',
  source_approved_by UUID REFERENCES public.profiles(id),
  source_approved_at TIMESTAMPTZ,
  destination_approved_by UUID REFERENCES public.profiles(id),
  destination_approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cross_school_training_requests ENABLE ROW LEVEL SECURITY;

-- Students can view their own requests
CREATE POLICY cst_select_student ON public.cross_school_training_requests FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR source_school_id = get_user_school_id(auth.uid())
    OR destination_school_id = get_user_school_id(auth.uid())
    OR (has_role(auth.uid(), 'regional') AND (is_same_region(auth.uid(), source_school_id) OR is_same_region(auth.uid(), destination_school_id)))
    OR has_role(auth.uid(), 'ministry')
  );

-- Students can create requests (from their own school)
CREATE POLICY cst_insert ON public.cross_school_training_requests FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'student') AND student_id = auth.uid()
    AND source_school_id = get_user_school_id(auth.uid())
  );

-- Admin of source or destination school can update (approve/reject)
CREATE POLICY cst_update ON public.cross_school_training_requests FOR UPDATE TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') AND (source_school_id = get_user_school_id(auth.uid()) OR destination_school_id = get_user_school_id(auth.uid())))
    OR (has_role(auth.uid(), 'school_supervisor') AND source_school_id = get_user_school_id(auth.uid()))
  );

-- Trigger for updated_at
CREATE TRIGGER update_cst_updated_at BEFORE UPDATE ON public.cross_school_training_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- DB function to find schools in same region with different objectives
CREATE OR REPLACE FUNCTION public.get_cross_training_schools(_student_school_id uuid, _cycle_year integer)
RETURNS TABLE(
  school_id uuid,
  school_name text,
  region text,
  objective_id uuid,
  objective_number integer,
  objective_title text,
  sector text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    s.id AS school_id,
    s.name AS school_name,
    s.region,
    psm.id AS objective_id,
    psm.objective_number,
    psm.objective_title,
    psm.sector
  FROM school_selected_objectives sso
  JOIN schools s ON s.id = sso.school_id
  JOIN pathway_skills_matrix psm ON psm.id = sso.objective_id
  WHERE sso.cycle_year = _cycle_year
    AND s.id != _student_school_id
    AND s.region = (SELECT region FROM schools WHERE id = _student_school_id)
    AND sso.objective_id NOT IN (
      SELECT objective_id FROM school_selected_objectives 
      WHERE school_id = _student_school_id AND cycle_year = _cycle_year
    )
  ORDER BY s.name, psm.objective_number;
$$;
