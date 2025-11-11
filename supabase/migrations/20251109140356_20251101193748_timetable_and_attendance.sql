-- Extend profiles table with student information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS section TEXT,
ADD COLUMN IF NOT EXISTS batch TEXT DEFAULT '2025-2029',
ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS roll_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create timetable table
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  professor_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  class_type TEXT NOT NULL CHECK (class_type IN ('Lecture', 'Lab', 'Tutorial')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on timetable
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- Timetable policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view timetable"
ON public.timetable
FOR SELECT
TO authenticated
USING (true);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  timetable_id UUID NOT NULL REFERENCES public.timetable(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'pending', 'cancelled', 'swapped', 'rescheduled')),
  marked_at TIMESTAMP WITH TIME ZONE,
  modification_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, timetable_id, date)
);

-- Enable RLS on attendance_records
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Attendance policies
CREATE POLICY "Students can view their own attendance"
ON public.attendance_records
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own attendance"
ON public.attendance_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own attendance"
ON public.attendance_records
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id);

-- Add triggers for updated_at
CREATE TRIGGER update_timetable_updated_at
BEFORE UPDATE ON public.timetable
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timetable_section ON public.timetable(section);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON public.timetable(day_of_week);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
