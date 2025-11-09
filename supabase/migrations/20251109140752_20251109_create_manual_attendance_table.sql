/*
  # Create manual_attendance table for manual attendance input

  1. New Tables
    - `manual_attendance`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to profiles)
      - `subject_code` (text)
      - `classes_held` (integer, manual entry)
      - `classes_attended` (integer, manual entry)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `manual_attendance` table
    - Students can only view/edit their own manual attendance records
  
  3. Indexes
    - Composite index on student_id and subject_code for fast lookups
*/

CREATE TABLE IF NOT EXISTS public.manual_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_code TEXT NOT NULL,
  classes_held INTEGER NOT NULL DEFAULT 0,
  classes_attended INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_code)
);

ALTER TABLE public.manual_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own manual attendance"
  ON public.manual_attendance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own manual attendance"
  ON public.manual_attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own manual attendance"
  ON public.manual_attendance
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE INDEX IF NOT EXISTS idx_manual_attendance_student ON public.manual_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_manual_attendance_student_subject ON public.manual_attendance(student_id, subject_code);

CREATE TRIGGER update_manual_attendance_updated_at
BEFORE UPDATE ON public.manual_attendance
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
