
-- 1. Expand student_status enum with new values
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'not_started';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'searching';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'matched';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'pending_graduation';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'graduated';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'closed';
