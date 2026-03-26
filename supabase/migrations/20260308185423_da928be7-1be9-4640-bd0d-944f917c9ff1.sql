
-- Enums for policy system
CREATE TYPE public.violation_type AS ENUM ('absence', 'non_submission', 'late_submission', 'evidence_rejected');
CREATE TYPE public.violation_severity AS ENUM ('warning', 'formal_warning', 'action_plan', 'referral');
CREATE TYPE public.violation_status AS ENUM ('open', 'acknowledged', 'resolved', 'escalated');
CREATE TYPE public.corrective_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE public.resubmission_status AS ENUM ('pending', 'submitted', 'approved', 'rejected');

-- Policy violations table
CREATE TABLE public.policy_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  violation_type public.violation_type NOT NULL,
  severity public.violation_severity NOT NULL DEFAULT 'warning',
  description TEXT NOT NULL,
  status public.violation_status NOT NULL DEFAULT 'open',
  absence_count INTEGER,
  related_entity_id UUID,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.policy_violations ENABLE ROW LEVEL SECURITY;

-- Corrective action plans
CREATE TABLE public.corrective_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id UUID NOT NULL REFERENCES public.policy_violations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  plan_description TEXT NOT NULL,
  deadline DATE NOT NULL,
  status public.corrective_status NOT NULL DEFAULT 'pending',
  outcome_notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.corrective_action_plans ENABLE ROW LEVEL SECURITY;

-- Resubmission requests
CREATE TABLE public.resubmission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES public.evidence_records(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  new_deadline DATE NOT NULL,
  status public.resubmission_status NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.resubmission_requests ENABLE ROW LEVEL SECURITY;

-- RLS: policy_violations
CREATE POLICY pv_select ON public.policy_violations FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR (school_id = get_user_school_id(auth.uid()))
    OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry')
  );

CREATE POLICY pv_insert ON public.policy_violations FOR INSERT TO authenticated
  WITH CHECK (
    (has_role(auth.uid(), 'school_supervisor') AND is_school_supervisor_of(auth.uid(), student_id))
    OR (has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid()))
  );

CREATE POLICY pv_update ON public.policy_violations FOR UPDATE TO authenticated
  USING (
    (has_role(auth.uid(), 'school_supervisor') AND is_school_supervisor_of(auth.uid(), student_id))
    OR (has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid()))
  );

-- RLS: corrective_action_plans
CREATE POLICY cap_select ON public.corrective_action_plans FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR (school_id = get_user_school_id(auth.uid()))
    OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry')
  );

CREATE POLICY cap_insert ON public.corrective_action_plans FOR INSERT TO authenticated
  WITH CHECK (
    (has_role(auth.uid(), 'school_supervisor') AND is_school_supervisor_of(auth.uid(), student_id))
    OR (has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid()))
  );

CREATE POLICY cap_update ON public.corrective_action_plans FOR UPDATE TO authenticated
  USING (
    (has_role(auth.uid(), 'school_supervisor') AND is_school_supervisor_of(auth.uid(), student_id))
    OR (has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid()))
  );

-- RLS: resubmission_requests
CREATE POLICY rr_select ON public.resubmission_requests FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR (school_id = get_user_school_id(auth.uid()))
    OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry')
  );

CREATE POLICY rr_insert ON public.resubmission_requests FOR INSERT TO authenticated
  WITH CHECK (
    (has_role(auth.uid(), 'school_supervisor') AND is_school_supervisor_of(auth.uid(), student_id))
    OR (has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid()))
  );

CREATE POLICY rr_update ON public.resubmission_requests FOR UPDATE TO authenticated
  USING (
    (has_role(auth.uid(), 'school_supervisor') AND is_school_supervisor_of(auth.uid(), student_id))
    OR (has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid()))
  );

-- Triggers for updated_at
CREATE TRIGGER update_policy_violations_updated_at BEFORE UPDATE ON public.policy_violations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_corrective_plans_updated_at BEFORE UPDATE ON public.corrective_action_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
