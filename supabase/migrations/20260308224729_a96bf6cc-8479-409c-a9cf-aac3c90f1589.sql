
-- Create gender enum
CREATE TYPE public.gender_type AS ENUM ('male', 'female');

-- Add new columns to students table
ALTER TABLE public.students
  ADD COLUMN national_id text,
  ADD COLUMN gender public.gender_type;

-- Add unique constraint on national_id
ALTER TABLE public.students
  ADD CONSTRAINT students_national_id_unique UNIQUE (national_id);
