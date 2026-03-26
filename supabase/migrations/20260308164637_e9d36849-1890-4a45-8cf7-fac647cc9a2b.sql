
-- =============================================
-- WBL-PMS Phase 1: Full Database Schema
-- =============================================

-- 1. ENUMs
CREATE TYPE public.app_role AS ENUM (
  'student', 'company_supervisor', 'school_supervisor',
  'admin', 'regional', 'ministry'
);

CREATE TYPE public.accreditation_status AS ENUM (
  'pending', 'approved', 'suspended', 'revoked'
);

CREATE TYPE public.placement_status AS ENUM (
  'pending', 'active', 'completed', 'cancelled'
);

CREATE TYPE public.attendance_status AS ENUM (
  'present', 'absent', 'late', 'early_leave', 'excused'
);

CREATE TYPE public.evidence_status AS ENUM (
  'pending', 'approved', 'rejected'
);

CREATE TYPE public.student_status AS ENUM (
  'enrolled', 'training', 'completed', 'withdrawn'
);

CREATE TYPE public.unit_grade AS ENUM ('P', 'M', 'D');

CREATE TYPE public.audit_action AS ENUM (
  'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOCK'
);

-- 2. Tables (safe migration order)

-- 2.1 schools
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  district TEXT,
  school_type TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_schools_region ON public.schools(region);

-- 2.2 profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id),
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_profiles_school ON public.profiles(school_id);

-- 2.3 user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id)
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- 2.4 specializations
CREATE TABLE public.specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.5 companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  accreditation_status public.accreditation_status DEFAULT 'pending',
  capacity INTEGER NOT NULL DEFAULT 0 CHECK(capacity >= 0),
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  region TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_companies_school ON public.companies(school_id);

-- 2.6 students
CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  specialization_id UUID REFERENCES public.specializations(id),
  student_number TEXT UNIQUE NOT NULL,
  status public.student_status DEFAULT 'enrolled',
  total_hours INTEGER DEFAULT 0 CHECK(total_hours >= 0),
  completed_hours INTEGER DEFAULT 0 CHECK(completed_hours >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK(completed_hours <= total_hours)
);
CREATE INDEX idx_students_school ON public.students(school_id);

-- 2.7 placements
CREATE TABLE public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  company_supervisor_id UUID REFERENCES public.profiles(id),
  school_supervisor_id UUID REFERENCES public.profiles(id),
  start_date DATE NOT NULL,
  end_date DATE,
  status public.placement_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, company_id, start_date)
);
CREATE INDEX idx_placements_student ON public.placements(student_id);
CREATE INDEX idx_placements_school ON public.placements(school_id);
CREATE INDEX idx_placements_company_sup ON public.placements(company_supervisor_id);
CREATE INDEX idx_placements_school_sup ON public.placements(school_supervisor_id);

-- 2.8 attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  placement_id UUID NOT NULL REFERENCES public.placements(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  date DATE NOT NULL,
  entry_time TIME,
  exit_time TIME,
  status public.attendance_status NOT NULL,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date)
);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_attendance_school ON public.attendance(school_id);

-- 2.9 diary_entries
CREATE TABLE public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date)
);
CREATE INDEX idx_diary_school ON public.diary_entries(school_id);

-- 2.10 journal_entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  week_label TEXT NOT NULL,
  date DATE NOT NULL,
  learned TEXT,
  challenges TEXT,
  solutions TEXT,
  goals TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_journal_school ON public.journal_entries(school_id);

-- 2.11 evidence_records
CREATE TABLE public.evidence_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  status public.evidence_status DEFAULT 'pending',
  feedback TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_evidence_school ON public.evidence_records(school_id);
CREATE INDEX idx_evidence_student ON public.evidence_records(student_id);

-- 2.12 witness_statements
CREATE TABLE public.witness_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  company_supervisor_id UUID NOT NULL REFERENCES public.profiles(id),
  unit_number TEXT NOT NULL,
  activity TEXT NOT NULL,
  grade_p BOOLEAN DEFAULT false,
  grade_m BOOLEAN DEFAULT false,
  grade_d BOOLEAN DEFAULT false,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_witness_school ON public.witness_statements(school_id);

-- 2.13 evaluations_company
CREATE TABLE public.evaluations_company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  evaluator_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_eval_company_school ON public.evaluations_company(school_id);

-- 2.14 evaluations_school
CREATE TABLE public.evaluations_school (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  evaluator_id UUID NOT NULL REFERENCES public.profiles(id),
  unit TEXT NOT NULL,
  grade public.unit_grade NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_eval_school_school ON public.evaluations_school(school_id);

-- 2.15 observations
CREATE TABLE public.observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  observer_id UUID NOT NULL REFERENCES public.profiles(id),
  activities TEXT,
  questions TEXT,
  evidence TEXT,
  recommendations TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_observations_school ON public.observations(school_id);

-- 2.16 checklist_records
CREATE TABLE public.checklist_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  checked_by UUID REFERENCES public.profiles(id),
  date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, skill_name)
);

-- 2.17 learning_goals
CREATE TABLE public.learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  goals TEXT[] NOT NULL DEFAULT '{}',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_goals_school ON public.learning_goals(school_id);

-- 2.18 audit_logs (append-only)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role public.app_role,
  action_type public.audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  school_id UUID REFERENCES public.schools(id),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_audit_school ON public.audit_logs(school_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);

-- 3. Security Definer Functions

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT school_id FROM public.profiles WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_supervisor_of(_user_id UUID, _student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.placements
    WHERE company_supervisor_id = _user_id
      AND student_id = _student_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_school_supervisor_of(_user_id UUID, _student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.placements
    WHERE school_supervisor_id = _user_id
      AND student_id = _student_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_same_region(_user_id UUID, _school_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.schools s1
    JOIN public.profiles p ON p.school_id = s1.id
    JOIN public.schools s2 ON s2.id = _school_id
    WHERE p.id = _user_id AND s1.region = s2.region
  );
$$;

CREATE OR REPLACE FUNCTION public.insert_audit_log(
  _action public.audit_action,
  _entity_type TEXT,
  _entity_id TEXT DEFAULT NULL,
  _prev JSONB DEFAULT NULL,
  _new JSONB DEFAULT NULL,
  _reason TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, role, action_type, entity_type, entity_id, previous_value, new_value, reason, school_id)
  VALUES (
    auth.uid(),
    public.get_user_role(auth.uid()),
    _action, _entity_type, _entity_id, _prev, _new, _reason,
    public.get_user_school_id(auth.uid())
  ) RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- 4. Triggers

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.placements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.evaluations_school
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. RLS

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.witness_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations_company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations_school ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR school_id = public.get_user_school_id(auth.uid())
    OR (public.has_role(auth.uid(), 'regional') AND public.is_same_region(auth.uid(), school_id))
    OR public.has_role(auth.uid(), 'ministry')
  );
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- user_roles
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- schools
CREATE POLICY "schools_select" ON public.schools FOR SELECT TO authenticated
  USING (
    id = public.get_user_school_id(auth.uid())
    OR (public.has_role(auth.uid(), 'regional') AND public.is_same_region(auth.uid(), id))
    OR public.has_role(auth.uid(), 'ministry')
  );

-- specializations
CREATE POLICY "specs_select" ON public.specializations FOR SELECT TO authenticated USING (true);

-- companies
CREATE POLICY "companies_select" ON public.companies FOR SELECT TO authenticated
  USING (
    school_id = public.get_user_school_id(auth.uid())
    OR (public.has_role(auth.uid(), 'regional') AND public.is_same_region(auth.uid(), school_id))
    OR public.has_role(auth.uid(), 'ministry')
  );
CREATE POLICY "companies_insert" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND school_id = public.get_user_school_id(auth.uid())
  );
CREATE POLICY "companies_update" ON public.companies FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND school_id = public.get_user_school_id(auth.uid())
  );

-- students
CREATE POLICY "students_select" ON public.students FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR school_id = public.get_user_school_id(auth.uid())
    OR (public.has_role(auth.uid(), 'regional') AND public.is_same_region(auth.uid(), school_id))
    OR public.has_role(auth.uid(), 'ministry')
  );

-- placements
CREATE POLICY "placements_select" ON public.placements FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR school_id = public.get_user_school_id(auth.uid())
    OR (public.has_role(auth.uid(), 'regional') AND public.is_same_region(auth.uid(), school_id))
    OR public.has_role(auth.uid(), 'ministry')
  );
CREATE POLICY "placements_insert" ON public.placements FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND school_id = public.get_user_school_id(auth.uid())
  );

-- attendance
CREATE POLICY "attendance_select" ON public.attendance FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_company_supervisor_of(auth.uid(), student_id)
    OR school_id = public.get_user_school_id(auth.uid())
    OR (public.has_role(auth.uid(), 'regional') AND public.is_same_region(auth.uid(), school_id))
    OR public.has_role(auth.uid(), 'ministry')
  );
CREATE POLICY "attendance_insert" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'company_supervisor')
    AND public.is_company_supervisor_of(auth.uid(), student_id)
    AND school_id = public.get_user_school_id(auth.uid())
  );

-- diary_entries
CREATE POLICY "diary_select" ON public.diary_entries FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_school_supervisor_of(auth.uid(), student_id)
    OR public.is_company_supervisor_of(auth.uid(), student_id)
    OR (school_id = public.get_user_school_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "diary_insert" ON public.diary_entries FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'student') AND student_id = auth.uid()
  );
CREATE POLICY "diary_update" ON public.diary_entries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'student') AND student_id = auth.uid());

-- journal_entries
CREATE POLICY "journal_select" ON public.journal_entries FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_school_supervisor_of(auth.uid(), student_id)
    OR (school_id = public.get_user_school_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "journal_insert" ON public.journal_entries FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'student') AND student_id = auth.uid()
  );

-- evidence_records
CREATE POLICY "evidence_select" ON public.evidence_records FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_school_supervisor_of(auth.uid(), student_id)
    OR (school_id = public.get_user_school_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "evidence_insert" ON public.evidence_records FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'student') AND student_id = auth.uid()
  );
CREATE POLICY "evidence_update_review" ON public.evidence_records FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'school_supervisor')
    AND public.is_school_supervisor_of(auth.uid(), student_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'school_supervisor')
    AND public.is_school_supervisor_of(auth.uid(), student_id)
  );

-- witness_statements
CREATE POLICY "witness_select" ON public.witness_statements FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR company_supervisor_id = auth.uid()
    OR public.is_school_supervisor_of(auth.uid(), student_id)
    OR (school_id = public.get_user_school_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "witness_insert" ON public.witness_statements FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'company_supervisor')
    AND company_supervisor_id = auth.uid()
    AND public.is_company_supervisor_of(auth.uid(), student_id)
  );

-- evaluations_company
CREATE POLICY "eval_company_select" ON public.evaluations_company FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR evaluator_id = auth.uid()
    OR public.is_school_supervisor_of(auth.uid(), student_id)
    OR (school_id = public.get_user_school_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "eval_company_insert" ON public.evaluations_company FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'company_supervisor')
    AND evaluator_id = auth.uid()
    AND public.is_company_supervisor_of(auth.uid(), student_id)
  );

-- evaluations_school
CREATE POLICY "eval_school_select" ON public.evaluations_school FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR evaluator_id = auth.uid()
    OR (school_id = public.get_user_school_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "eval_school_insert" ON public.evaluations_school FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'school_supervisor')
    AND evaluator_id = auth.uid()
    AND public.is_school_supervisor_of(auth.uid(), student_id)
  );
CREATE POLICY "eval_school_update" ON public.evaluations_school FOR UPDATE TO authenticated
  USING (
    evaluator_id = auth.uid()
    AND is_locked = false
  );

-- observations
CREATE POLICY "obs_select" ON public.observations FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR observer_id = auth.uid()
    OR (school_id = public.get_user_school_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "obs_insert" ON public.observations FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'school_supervisor')
    AND observer_id = auth.uid()
    AND public.is_school_supervisor_of(auth.uid(), student_id)
  );

-- checklist_records
CREATE POLICY "checklist_select" ON public.checklist_records FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_company_supervisor_of(auth.uid(), student_id)
    OR public.is_school_supervisor_of(auth.uid(), student_id)
    OR (school_id = public.get_user_school_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "checklist_upsert" ON public.checklist_records FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'company_supervisor')
    AND public.is_company_supervisor_of(auth.uid(), student_id)
  );
CREATE POLICY "checklist_update" ON public.checklist_records FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'company_supervisor')
    AND public.is_company_supervisor_of(auth.uid(), student_id)
  );

-- learning_goals
CREATE POLICY "goals_select" ON public.learning_goals FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_school_supervisor_of(auth.uid(), student_id)
    OR (school_id = public.get_user_school_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "goals_insert" ON public.learning_goals FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'school_supervisor')
    AND public.is_school_supervisor_of(auth.uid(), student_id)
  );

-- audit_logs (append-only)
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT TO authenticated
  USING (
    (public.has_role(auth.uid(), 'admin') AND school_id = public.get_user_school_id(auth.uid()))
    OR public.has_role(auth.uid(), 'ministry')
  );

-- 6. Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence', 'evidence', false,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation']
);

CREATE POLICY "evidence_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'evidence'
    AND public.has_role(auth.uid(), 'student')
    AND (storage.foldername(name))[1] = public.get_user_school_id(auth.uid())::text
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "evidence_read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'evidence'
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR (
        (storage.foldername(name))[1] = public.get_user_school_id(auth.uid())::text
        AND (public.has_role(auth.uid(), 'school_supervisor') OR public.has_role(auth.uid(), 'admin'))
      )
    )
  );
