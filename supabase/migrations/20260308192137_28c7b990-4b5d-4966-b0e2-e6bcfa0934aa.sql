
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  related_entity_type text,
  related_entity_id text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow insert via triggers (security definer functions)
-- No direct insert policy needed since triggers use SECURITY DEFINER

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create a notification for a user
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _title text,
  _body text,
  _type text DEFAULT 'info',
  _related_entity_type text DEFAULT NULL,
  _related_entity_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, body, type, related_entity_type, related_entity_id)
  VALUES (_user_id, _title, _body, _type, _related_entity_type, _related_entity_id)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- Function to notify all users in a school
CREATE OR REPLACE FUNCTION public.notify_school_admins(
  _school_id uuid,
  _title text,
  _body text,
  _type text DEFAULT 'info',
  _related_entity_type text DEFAULT NULL,
  _related_entity_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, body, type, related_entity_type, related_entity_id)
  SELECT ur.user_id, _title, _body, _type, _related_entity_type, _related_entity_id
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE p.school_id = _school_id
    AND ur.role IN ('admin', 'school_supervisor');
END;
$$;

-- Trigger: notify on new policy violation
CREATE OR REPLACE FUNCTION public.notify_on_violation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Notify the student
  PERFORM create_notification(
    NEW.student_id,
    'مخالفة جديدة',
    'تم تسجيل مخالفة: ' || NEW.description,
    'violation',
    'policy_violations',
    NEW.id::text
  );
  -- Notify school admins/supervisors
  PERFORM notify_school_admins(
    NEW.school_id,
    'مخالفة جديدة',
    'تم تسجيل مخالفة جديدة لطالب',
    'violation',
    'policy_violations',
    NEW.id::text
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_violation
  AFTER INSERT ON public.policy_violations
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_violation();

-- Trigger: notify on contract status change
CREATE OR REPLACE FUNCTION public.notify_on_contract_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM notify_school_admins(
      NEW.school_id,
      'تحديث عقد مدرب',
      'تم تحديث حالة عقد المدرب ' || NEW.trainer_name || ' إلى ' || NEW.status,
      'contract',
      'external_trainer_contracts',
      NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_contract_update
  AFTER UPDATE ON public.external_trainer_contracts
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_contract_update();

-- Trigger: notify on cross-school training request
CREATE OR REPLACE FUNCTION public.notify_on_cross_training()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify source school admins
    PERFORM notify_school_admins(
      NEW.source_school_id,
      'طلب تدريب عبر المدارس',
      'تم تقديم طلب تدريب جديد عبر المدارس',
      'cross_training',
      'cross_school_training_requests',
      NEW.id::text
    );
    -- Notify destination school admins
    PERFORM notify_school_admins(
      NEW.destination_school_id,
      'طلب تدريب وارد',
      'طلب تدريب وارد من مدرسة أخرى',
      'cross_training',
      'cross_school_training_requests',
      NEW.id::text
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify the student
    PERFORM create_notification(
      NEW.student_id,
      'تحديث طلب التدريب',
      'تم تحديث حالة طلب التدريب عبر المدارس إلى ' || NEW.status,
      'cross_training',
      'cross_school_training_requests',
      NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_cross_training_insert
  AFTER INSERT ON public.cross_school_training_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_cross_training();

CREATE TRIGGER trg_notify_cross_training_update
  AFTER UPDATE ON public.cross_school_training_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_cross_training();
