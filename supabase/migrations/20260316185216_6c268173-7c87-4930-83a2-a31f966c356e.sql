
-- 1. Add UPDATE policy for placements (admin only, same school)
CREATE POLICY "placements_update" ON public.placements
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND school_id = get_user_school_id(auth.uid()));

-- 2. Fix attendance INSERT policy: remove school_id check so company supervisors from different schools can record
DROP POLICY IF EXISTS "attendance_insert" ON public.attendance;
CREATE POLICY "attendance_insert" ON public.attendance
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'company_supervisor'::app_role) 
  AND is_company_supervisor_of(auth.uid(), student_id)
);

-- 3. Drop duplicate trigger
DROP TRIGGER IF EXISTS trg_attendance_recalc_student_hours ON public.attendance;
