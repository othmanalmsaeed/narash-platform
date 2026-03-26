
-- 1. Skills matrix table
CREATE TABLE public.pathway_skills_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector TEXT NOT NULL,
  objective_number INTEGER NOT NULL,
  objective_title TEXT NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  applications TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. School selected objectives table
CREATE TABLE public.school_selected_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  cycle_year INTEGER NOT NULL,
  objective_id UUID NOT NULL REFERENCES public.pathway_skills_matrix(id),
  selected_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, cycle_year, objective_id)
);

-- 3. RLS on pathway_skills_matrix (read-only for all authenticated)
ALTER TABLE public.pathway_skills_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_matrix_select" ON public.pathway_skills_matrix
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (true);

-- 4. RLS on school_selected_objectives
ALTER TABLE public.school_selected_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "selected_obj_select" ON public.school_selected_objectives
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    school_id = get_user_school_id(auth.uid())
    OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry')
  );

CREATE POLICY "selected_obj_insert" ON public.school_selected_objectives
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

CREATE POLICY "selected_obj_delete" ON public.school_selected_objectives
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

-- 5. Trigger to enforce max 3 objectives per school per cycle
CREATE OR REPLACE FUNCTION public.check_max_objectives()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
DECLARE
  _count INTEGER;
BEGIN
  SELECT COUNT(*) INTO _count
  FROM public.school_selected_objectives
  WHERE school_id = NEW.school_id AND cycle_year = NEW.cycle_year;
  
  IF _count >= 3 THEN
    RAISE EXCEPTION 'لا يمكن اختيار أكثر من 3 أهداف تدريبية لكل دورة';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_max_3_objectives
  BEFORE INSERT ON public.school_selected_objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_objectives();
