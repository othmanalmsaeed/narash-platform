
-- Drop existing INSERT/UPDATE policies on training_incidents
DROP POLICY IF EXISTS "ti_insert" ON public.training_incidents;
DROP POLICY IF EXISTS "ti_update" ON public.training_incidents;

-- New INSERT policy: company_supervisor can insert for their students
CREATE POLICY "ti_insert" ON public.training_incidents
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'company_supervisor'::app_role)
  AND is_company_supervisor_of(auth.uid(), student_id)
);

-- New UPDATE policy: company_supervisor for their students + admin for their school
CREATE POLICY "ti_update" ON public.training_incidents
FOR UPDATE TO authenticated
USING (
  (has_role(auth.uid(), 'company_supervisor'::app_role) AND is_company_supervisor_of(auth.uid(), student_id))
  OR (has_role(auth.uid(), 'admin'::app_role) AND school_id = get_user_school_id(auth.uid()))
);

-- Update notify_on_incident to also notify company supervisor who reported
CREATE OR REPLACE FUNCTION public.notify_on_incident()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _school_supervisor_id uuid;
BEGIN
  -- Notify the student
  PERFORM create_notification(
    NEW.student_id,
    'تم تسجيل إصابة تدريب',
    'تم تسجيل حادثة بتاريخ ' || NEW.incident_date || ': ' || LEFT(NEW.description, 100),
    'incident',
    'training_incidents',
    NEW.id::text
  );

  -- Notify the school supervisor linked to this student
  SELECT school_supervisor_id INTO _school_supervisor_id
  FROM public.placements
  WHERE student_id = NEW.student_id AND status = 'active'
  LIMIT 1;

  IF _school_supervisor_id IS NOT NULL THEN
    PERFORM create_notification(
      _school_supervisor_id,
      'إصابة تدريب لطالبك',
      'تم الإبلاغ عن إصابة تدريب بشدة: ' || NEW.severity || ' بتاريخ ' || NEW.incident_date,
      'incident',
      'training_incidents',
      NEW.id::text
    );
  END IF;

  -- Notify school admins
  PERFORM notify_school_admins(
    NEW.school_id,
    'إصابة تدريب جديدة',
    'تم الإبلاغ عن إصابة تدريب - الشدة: ' || NEW.severity,
    'incident',
    'training_incidents',
    NEW.id::text
  );

  -- Audit log
  PERFORM insert_audit_log(
    'CREATE'::audit_action,
    'training_incidents',
    NEW.id::text,
    NULL,
    jsonb_build_object('student_id', NEW.student_id, 'type', NEW.incident_type, 'severity', NEW.severity),
    NULL
  );
  RETURN NEW;
END;
$function$;
