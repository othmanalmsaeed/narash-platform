
-- 1. Add is_locked to evaluations_company
ALTER TABLE public.evaluations_company ADD COLUMN is_locked BOOLEAN DEFAULT false;

-- 2. Create a function to lock both evaluations for a student+unit pair
-- This checks that both company and school evaluations exist before locking
CREATE OR REPLACE FUNCTION public.lock_dual_assessment(
  _student_id UUID,
  _unit TEXT,
  _school_eval_id UUID,
  _company_eval_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _school_eval evaluations_school%ROWTYPE;
  _company_eval evaluations_company%ROWTYPE;
  _caller_id UUID := auth.uid();
  _caller_role app_role;
BEGIN
  -- Verify caller is school_supervisor
  SELECT role INTO _caller_role FROM user_roles WHERE user_id = _caller_id;
  IF _caller_role != 'school_supervisor' THEN
    RAISE EXCEPTION 'Only school supervisors can lock assessments';
  END IF;

  -- Fetch school evaluation
  SELECT * INTO _school_eval FROM evaluations_school
    WHERE id = _school_eval_id AND student_id = _student_id AND unit = _unit;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'School evaluation not found for this student/unit';
  END IF;

  -- Fetch company evaluation
  SELECT * INTO _company_eval FROM evaluations_company
    WHERE id = _company_eval_id AND student_id = _student_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Company evaluation not found for this student';
  END IF;

  -- Check not already locked
  IF _school_eval.is_locked THEN
    RAISE EXCEPTION 'Assessment is already locked';
  END IF;

  -- Verify caller is the school supervisor for this student
  IF NOT is_school_supervisor_of(_caller_id, _student_id) THEN
    RAISE EXCEPTION 'You are not the school supervisor of this student';
  END IF;

  -- Lock both evaluations
  UPDATE evaluations_school SET is_locked = true WHERE id = _school_eval_id;
  UPDATE evaluations_company SET is_locked = true WHERE id = _company_eval_id;

  -- Log to audit trail
  PERFORM insert_audit_log(
    'LOCK'::audit_action,
    'dual_assessment',
    _student_id::text,
    jsonb_build_object(
      'school_eval_id', _school_eval_id,
      'company_eval_id', _company_eval_id,
      'unit', _unit,
      'school_grade', _school_eval.grade,
      'company_rating', _company_eval.rating
    ),
    jsonb_build_object('is_locked', true),
    'قفل التقييم المزدوج بعد التحقق النهائي'
  );

  RETURN jsonb_build_object(
    'success', true,
    'student_id', _student_id,
    'unit', _unit,
    'locked_at', now()
  );
END;
$$;

-- 3. Create audit trigger for evaluations_school INSERT
CREATE OR REPLACE FUNCTION public.audit_eval_school_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM insert_audit_log(
    'CREATE'::audit_action,
    'evaluations_school',
    NEW.id::text,
    NULL,
    jsonb_build_object('student_id', NEW.student_id, 'unit', NEW.unit, 'grade', NEW.grade),
    NULL
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_eval_school_insert
  AFTER INSERT ON public.evaluations_school
  FOR EACH ROW EXECUTE FUNCTION public.audit_eval_school_insert();

-- 4. Create audit trigger for evaluations_company INSERT
CREATE OR REPLACE FUNCTION public.audit_eval_company_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM insert_audit_log(
    'CREATE'::audit_action,
    'evaluations_company',
    NEW.id::text,
    NULL,
    jsonb_build_object('student_id', NEW.student_id, 'rating', NEW.rating, 'comment', NEW.comment),
    NULL
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_eval_company_insert
  AFTER INSERT ON public.evaluations_company
  FOR EACH ROW EXECUTE FUNCTION public.audit_eval_company_insert();

-- 5. Audit trigger for evidence review (UPDATE)
CREATE OR REPLACE FUNCTION public.audit_evidence_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM insert_audit_log(
      CASE WHEN NEW.status = 'approved' THEN 'APPROVE'
           WHEN NEW.status = 'rejected' THEN 'REJECT'
           ELSE 'UPDATE' END::audit_action,
      'evidence_records',
      NEW.id::text,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'feedback', NEW.feedback),
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_evidence_review
  AFTER UPDATE ON public.evidence_records
  FOR EACH ROW EXECUTE FUNCTION public.audit_evidence_review();

-- 6. Prevent updates on locked evaluations_company
CREATE POLICY "eval_company_update_unlocked" ON public.evaluations_company
  FOR UPDATE TO authenticated
  USING (
    (evaluator_id = auth.uid()) AND (is_locked = false)
  );
