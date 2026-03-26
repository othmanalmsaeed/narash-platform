
-- 2. Add columns to students table
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS grade_level text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relation text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS current_phase integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS final_grade public.unit_grade,
  ADD COLUMN IF NOT EXISTS graduated_at timestamptz,
  ADD COLUMN IF NOT EXISTS graduation_approved_by uuid,
  ADD COLUMN IF NOT EXISTS eligible_for_recognition boolean DEFAULT false;

-- 3. Add columns to placements table
ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS agreement_signed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS agreement_signed_date date,
  ADD COLUMN IF NOT EXISTS learning_goals_text text;

-- 4. Add column to companies table
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS company_size text;

-- 5. Add supervisor capacity columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS supervisor_capacity integer,
  ADD COLUMN IF NOT EXISTS supervisor_current_load integer DEFAULT 0;

-- 6. Create follow_up_visits table
CREATE TABLE IF NOT EXISTS public.follow_up_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id uuid NOT NULL REFERENCES public.placements(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id),
  visit_type text NOT NULL CHECK (visit_type IN ('week_1', 'week_4', 'week_8')),
  visit_date date NOT NULL,
  notes text,
  conducted_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.follow_up_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fv_select" ON public.follow_up_visits
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR conducted_by = auth.uid()
    OR (school_id = get_user_school_id(auth.uid()))
    OR (has_role(auth.uid(), 'regional'::app_role) AND is_same_region(auth.uid(), school_id))
    OR has_role(auth.uid(), 'ministry'::app_role)
  );

CREATE POLICY "fv_insert" ON public.follow_up_visits
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'school_supervisor'::app_role)
    AND conducted_by = auth.uid()
    AND is_school_supervisor_of(auth.uid(), student_id)
  );

CREATE POLICY "fv_update" ON public.follow_up_visits
  FOR UPDATE TO authenticated
  USING (
    conducted_by = auth.uid()
    AND has_role(auth.uid(), 'school_supervisor'::app_role)
  );

-- 7. Create student_phase_log table
CREATE TABLE IF NOT EXISTS public.student_phase_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  phase integer NOT NULL,
  status text NOT NULL,
  entered_at timestamptz DEFAULT now(),
  notes text,
  triggered_by uuid
);

ALTER TABLE public.student_phase_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spl_select" ON public.student_phase_log
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_phase_log.student_id
        AND (s.school_id = get_user_school_id(auth.uid())
             OR (has_role(auth.uid(), 'regional'::app_role) AND is_same_region(auth.uid(), s.school_id))
             OR has_role(auth.uid(), 'ministry'::app_role))
    )
  );

-- 8. Create calc_final_grade function (BTEC rule: lowest unit grade)
CREATE OR REPLACE FUNCTION public.calc_final_grade(_student_id uuid)
RETURNS public.unit_grade
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN COUNT(*) = 0 THEN NULL
    WHEN bool_and(grade = 'D') THEN 'D'::unit_grade
    WHEN bool_and(grade IN ('D', 'M')) THEN 'M'::unit_grade
    ELSE 'P'::unit_grade
  END
  FROM public.evaluations_school
  WHERE student_id = _student_id AND is_locked = true;
$$;

-- 9. Trigger: log phase changes when student status changes
CREATE OR REPLACE FUNCTION public.log_student_phase_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _phase integer;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  _phase := CASE NEW.status::text
    WHEN 'enrolled' THEN 1
    WHEN 'not_started' THEN 1
    WHEN 'searching' THEN 2
    WHEN 'matched' THEN 2
    WHEN 'training' THEN 3
    WHEN 'under_review' THEN 4
    WHEN 'pending_graduation' THEN 5
    WHEN 'graduated' THEN 6
    WHEN 'completed' THEN 6
    WHEN 'closed' THEN 6
    ELSE 0
  END;

  NEW.current_phase := _phase;

  INSERT INTO public.student_phase_log (student_id, phase, status, triggered_by)
  VALUES (NEW.id, _phase, NEW.status::text, auth.uid());

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_student_phase_log
  BEFORE UPDATE OF status ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.log_student_phase_change();

-- 10. Trigger: auto-transition to 'matched' when placement is created
CREATE OR REPLACE FUNCTION public.auto_transition_to_matched()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    UPDATE public.students
    SET status = 'matched'
    WHERE id = NEW.student_id
      AND status IN ('enrolled', 'not_started', 'searching');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_matched
  AFTER INSERT ON public.placements
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_transition_to_matched();

-- 11. Trigger: auto-transition to 'training' on first attendance
CREATE OR REPLACE FUNCTION public.auto_transition_to_training()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.students
  SET status = 'training'
  WHERE id = NEW.student_id
    AND status = 'matched';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_training
  AFTER INSERT ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_transition_to_training();

-- 12. Allow admin to update students.status (for phase transitions)
CREATE POLICY "students_update_status" ON public.students
  FOR UPDATE TO authenticated
  USING (
    (has_role(auth.uid(), 'admin'::app_role) AND school_id = get_user_school_id(auth.uid()))
  )
  WITH CHECK (
    (has_role(auth.uid(), 'admin'::app_role) AND school_id = get_user_school_id(auth.uid()))
  );
