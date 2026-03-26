
-- Contract status enum
CREATE TYPE public.contract_status AS ENUM ('draft', 'active', 'completed', 'terminated');

-- External trainer contracts table
CREATE TABLE public.external_trainer_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  
  -- Trainer info
  trainer_name TEXT NOT NULL,
  trainer_phone TEXT,
  trainer_email TEXT,
  trainer_specialization TEXT NOT NULL,
  
  -- Contract details
  skill_program TEXT NOT NULL,
  total_hours INTEGER NOT NULL,
  total_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  completed_hours INTEGER NOT NULL DEFAULT 0,
  financial_amount NUMERIC(10,2),
  
  -- Status
  status contract_status NOT NULL DEFAULT 'draft',
  
  -- Parties
  ministry_representative TEXT,
  school_representative TEXT,
  
  -- Reports
  final_report TEXT,
  trainee_evaluation_notes TEXT,
  
  -- Meta
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.external_trainer_contracts ENABLE ROW LEVEL SECURITY;

-- Select: same school or regional/ministry
CREATE POLICY "etc_select" ON public.external_trainer_contracts
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    school_id = get_user_school_id(auth.uid())
    OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry')
  );

-- Insert: admin of same school
CREATE POLICY "etc_insert" ON public.external_trainer_contracts
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

-- Update: admin of same school
CREATE POLICY "etc_update" ON public.external_trainer_contracts
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

-- updated_at trigger
CREATE TRIGGER update_etc_updated_at
  BEFORE UPDATE ON public.external_trainer_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
