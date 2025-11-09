-- Create class_modifications table to track cancellations, reschedules, and swaps
CREATE TABLE IF NOT EXISTS public.class_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to original class
  original_timetable_id UUID NOT NULL REFERENCES public.timetable(id) ON DELETE CASCADE,
  original_date DATE NOT NULL,
  
  -- Modification type
  modification_type TEXT NOT NULL CHECK (modification_type IN ('cancelled', 'rescheduled', 'swapped')),
  
  -- For rescheduled classes
  rescheduled_date DATE,
  rescheduled_start_time TIME,
  rescheduled_end_time TIME,
  rescheduled_room TEXT,
  
  -- For swapped classes
  swapped_with_timetable_id UUID REFERENCES public.timetable(id) ON DELETE SET NULL,
  
  -- Metadata
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Notes from student
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.class_modifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_modifications
CREATE POLICY "Students can view their own modifications"
  ON public.class_modifications FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own modifications"
  ON public.class_modifications FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own modifications"
  ON public.class_modifications FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own modifications"
  ON public.class_modifications FOR DELETE
  USING (auth.uid() = student_id);

-- Add indexes for performance
CREATE INDEX idx_class_mods_student_date ON public.class_modifications(student_id, original_date);
CREATE INDEX idx_class_mods_original_timetable ON public.class_modifications(original_timetable_id);

-- Add modification_id column to attendance_records
ALTER TABLE public.attendance_records 
ADD COLUMN IF NOT EXISTS modification_id UUID REFERENCES public.class_modifications(id) ON DELETE SET NULL;

-- Create index on modification_id
CREATE INDEX IF NOT EXISTS idx_attendance_modification ON public.attendance_records(modification_id);

-- Create trigger for updated_at on class_modifications
CREATE TRIGGER update_class_modifications_updated_at
  BEFORE UPDATE ON public.class_modifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
