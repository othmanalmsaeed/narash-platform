-- 1) Global setting (so it can be changed later without code changes)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  int_value integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'settings_select_authenticated'
  ) THEN
    CREATE POLICY "settings_select_authenticated"
    ON public.system_settings
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'settings_insert_ministry'
  ) THEN
    CREATE POLICY "settings_insert_ministry"
    ON public.system_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'ministry'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'settings_update_ministry'
  ) THEN
    CREATE POLICY "settings_update_ministry"
    ON public.system_settings
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'ministry'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'ministry'::public.app_role));
  END IF;
END $$;

-- updated_at trigger for settings
DROP TRIGGER IF EXISTS trg_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER trg_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- default setting value
INSERT INTO public.system_settings(key, int_value)
VALUES ('attendance_hours_per_day', 4)
ON CONFLICT (key) DO NOTHING;

-- 2) Helper function to fetch the configurable value
CREATE OR REPLACE FUNCTION public.get_attendance_hours_per_day()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT int_value FROM public.system_settings WHERE key = 'attendance_hours_per_day'),
    4
  );
$$;

-- 3) Recalculate completed_hours based on attended days * hours_per_day
CREATE OR REPLACE FUNCTION public.recalc_student_hours()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _student_id uuid;
  _hours_per_day integer;
  _attended_days integer;
  _hours integer;
BEGIN
  -- Determine which student to recalculate
  IF TG_OP = 'DELETE' THEN
    _student_id := OLD.student_id;
  ELSE
    _student_id := NEW.student_id;
  END IF;

  _hours_per_day := public.get_attendance_hours_per_day();

  -- Count attended days: any non-absent attendance status that indicates presence at work
  SELECT COUNT(*)
    INTO _attended_days
  FROM public.attendance a
  WHERE a.student_id = _student_id
    AND a.status IN ('present'::public.attendance_status,
                    'late'::public.attendance_status,
                    'early_leave'::public.attendance_status);

  _hours := COALESCE(_attended_days, 0) * COALESCE(_hours_per_day, 4);

  UPDATE public.students
  SET completed_hours = _hours,
      updated_at = now()
  WHERE id = _student_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 4) Trigger to auto-recalc after any attendance change
DROP TRIGGER IF EXISTS trg_attendance_recalc_student_hours ON public.attendance;
CREATE TRIGGER trg_attendance_recalc_student_hours
AFTER INSERT OR UPDATE OR DELETE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.recalc_student_hours();
