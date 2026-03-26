
-- Create qualification_mappings table
CREATE TABLE public.qualification_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sector TEXT NOT NULL,
  pathway_name TEXT NOT NULL,
  mapped_nqf_level INTEGER NOT NULL DEFAULT 0,
  learning_outcome_domains JSONB NOT NULL DEFAULT '[]'::jsonb,
  endorsed_by TEXT DEFAULT '',
  endorsement_reference TEXT DEFAULT '',
  valid_from DATE,
  valid_to DATE,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Endorsed', 'Expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create program_authorizations table
CREATE TABLE public.program_authorizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  cycle_year INTEGER NOT NULL,
  authorized_student_quota INTEGER NOT NULL DEFAULT 0,
  authorized_sectors JSONB NOT NULL DEFAULT '[]'::jsonb,
  approval_authority TEXT NOT NULL DEFAULT '',
  approval_reference TEXT NOT NULL DEFAULT '',
  approval_date DATE,
  budget_envelope_reference TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Proposed' CHECK (status IN ('Proposed', 'Approved', 'Suspended', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create program_risks table
CREATE TABLE public.program_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Capacity', 'Industry', 'Financial', 'Safety', 'Policy')),
  description TEXT NOT NULL,
  likelihood TEXT NOT NULL DEFAULT 'Low' CHECK (likelihood IN ('Low', 'Medium', 'High')),
  impact TEXT NOT NULL DEFAULT 'Moderate' CHECK (impact IN ('Moderate', 'Serious', 'Critical')),
  mitigation_plan TEXT DEFAULT '',
  owner_authority TEXT DEFAULT '',
  review_frequency TEXT DEFAULT '',
  last_reviewed DATE,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Monitoring', 'Mitigated', 'Escalated')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qualification_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_risks ENABLE ROW LEVEL SECURITY;

-- RLS for qualification_mappings
CREATE POLICY "qm_select" ON public.qualification_mappings
  FOR SELECT TO authenticated
  USING (
    (school_id = get_user_school_id(auth.uid()))
    OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry')
  );

CREATE POLICY "qm_insert" ON public.qualification_mappings
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

CREATE POLICY "qm_update" ON public.qualification_mappings
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

-- RLS for program_authorizations
CREATE POLICY "pa_select" ON public.program_authorizations
  FOR SELECT TO authenticated
  USING (
    (school_id = get_user_school_id(auth.uid()))
    OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry')
  );

CREATE POLICY "pa_insert" ON public.program_authorizations
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

CREATE POLICY "pa_update" ON public.program_authorizations
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

-- RLS for program_risks
CREATE POLICY "pr_select" ON public.program_risks
  FOR SELECT TO authenticated
  USING (
    (school_id = get_user_school_id(auth.uid()))
    OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry')
  );

CREATE POLICY "pr_insert" ON public.program_risks
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

CREATE POLICY "pr_update" ON public.program_risks
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid())
  );

-- Indexes
CREATE INDEX idx_qm_school ON public.qualification_mappings(school_id);
CREATE INDEX idx_pa_school ON public.program_authorizations(school_id);
CREATE INDEX idx_pr_school ON public.program_risks(school_id);
