
-- Create incident type enum
CREATE TYPE public.incident_type AS ENUM ('work_injury', 'equipment_accident', 'chemical_exposure', 'fall', 'other');

-- Create incident severity enum
CREATE TYPE public.incident_severity AS ENUM ('minor', 'moderate', 'serious', 'critical');

-- Create incident status enum
CREATE TYPE public.incident_status AS ENUM ('reported', 'first_aid', 'medical_report', 'under_treatment', 'resolved', 'closed');

-- Create health coverage status enum
CREATE TYPE public.health_coverage_status AS ENUM ('active', 'expired', 'not_covered', 'pending');

-- Create training_incidents table
CREATE TABLE public.training_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  reported_by UUID NOT NULL REFERENCES public.profiles(id),
  incident_date DATE NOT NULL,
  incident_type public.incident_type NOT NULL DEFAULT 'other',
  severity public.incident_severity NOT NULL DEFAULT 'minor',
  status public.incident_status NOT NULL DEFAULT 'reported',
  description TEXT NOT NULL,
  location TEXT,
  first_aid_provided BOOLEAN DEFAULT false,
  medical_report_summary TEXT,
  actions_taken TEXT,
  follow_up_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create incident_documents table
CREATE TABLE public.incident_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.training_incidents(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  document_type TEXT NOT NULL DEFAULT 'other', -- 'injury_form', 'medical_report', 'photo', 'other'
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add health coverage fields to students
ALTER TABLE public.students 
  ADD COLUMN health_coverage_status public.health_coverage_status DEFAULT 'pending',
  ADD COLUMN coverage_start_date DATE,
  ADD COLUMN coverage_end_date DATE;

-- Enable RLS
ALTER TABLE public.training_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_documents ENABLE ROW LEVEL SECURITY;

-- RLS for training_incidents
CREATE POLICY "ti_select" ON public.training_incidents FOR SELECT TO authenticated
USING (
  student_id = auth.uid()
  OR school_id = get_user_school_id(auth.uid())
  OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), school_id))
  OR has_role(auth.uid(), 'ministry')
);

CREATE POLICY "ti_insert" ON public.training_incidents FOR INSERT TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'school_supervisor') AND is_school_supervisor_of(auth.uid(), student_id))
  OR (has_role(auth.uid(), 'company_supervisor') AND is_company_supervisor_of(auth.uid(), student_id))
  OR (has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid()))
);

CREATE POLICY "ti_update" ON public.training_incidents FOR UPDATE TO authenticated
USING (
  (has_role(auth.uid(), 'school_supervisor') AND is_school_supervisor_of(auth.uid(), student_id))
  OR (has_role(auth.uid(), 'admin') AND school_id = get_user_school_id(auth.uid()))
);

-- RLS for incident_documents
CREATE POLICY "id_select" ON public.incident_documents FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.training_incidents ti
    WHERE ti.id = incident_id
    AND (
      ti.student_id = auth.uid()
      OR ti.school_id = get_user_school_id(auth.uid())
      OR (has_role(auth.uid(), 'regional') AND is_same_region(auth.uid(), ti.school_id))
      OR has_role(auth.uid(), 'ministry')
    )
  )
);

CREATE POLICY "id_insert" ON public.incident_documents FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.training_incidents ti
    WHERE ti.id = incident_id
    AND (
      (has_role(auth.uid(), 'school_supervisor') AND is_school_supervisor_of(auth.uid(), ti.student_id))
      OR (has_role(auth.uid(), 'company_supervisor') AND is_company_supervisor_of(auth.uid(), ti.student_id))
      OR (has_role(auth.uid(), 'admin') AND ti.school_id = get_user_school_id(auth.uid()))
    )
  )
);

-- Trigger for updated_at
CREATE TRIGGER trg_training_incidents_updated
  BEFORE UPDATE ON public.training_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Notification trigger for incidents
CREATE OR REPLACE FUNCTION public.notify_on_incident()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE TRIGGER trg_notify_incident
  AFTER INSERT ON public.training_incidents
  FOR EACH ROW EXECUTE FUNCTION notify_on_incident();

-- Create storage bucket for incident documents
INSERT INTO storage.buckets (id, name, public) VALUES ('incident-documents', 'incident-documents', false);

-- Storage RLS for incident-documents bucket
CREATE POLICY "incident_docs_upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'incident-documents');

CREATE POLICY "incident_docs_read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'incident-documents');
