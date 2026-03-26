
-- Allow admins to see all active schools
CREATE POLICY "schools_select_admin"
ON public.schools
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
