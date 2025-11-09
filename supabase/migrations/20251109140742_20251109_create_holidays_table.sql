/*
  # Create holidays table for holiday management

  1. New Tables
    - `holidays`
      - `id` (uuid, primary key)
      - `date` (date)
      - `name` (text, holiday name)
      - `type` (text, 'official' or 'manual')
      - `section` (text, optional for section-specific holidays)
      - `student_id` (uuid, optional for manually marked holidays)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `holidays` table
    - Add policies for viewing official holidays
    - Add policies for students to manage their manual holidays
  
  3. Indexes
    - Index on date for efficient lookups
    - Index on student_id for user queries
    - Composite index on date and type
*/

CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('official', 'manual')),
  section TEXT,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view official holidays"
  ON public.holidays
  FOR SELECT
  USING (type = 'official');

CREATE POLICY "Students can view their own manual holidays"
  ON public.holidays
  FOR SELECT
  TO authenticated
  USING (type = 'manual' AND auth.uid() = student_id);

CREATE POLICY "Students can insert their own manual holidays"
  ON public.holidays
  FOR INSERT
  TO authenticated
  WITH CHECK (type = 'manual' AND auth.uid() = student_id);

CREATE POLICY "Students can delete their own manual holidays"
  ON public.holidays
  FOR DELETE
  TO authenticated
  USING (type = 'manual' AND auth.uid() = student_id);

CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.holidays(date);
CREATE INDEX IF NOT EXISTS idx_holidays_student_id ON public.holidays(student_id);
CREATE INDEX IF NOT EXISTS idx_holidays_type_date ON public.holidays(type, date);

CREATE TRIGGER update_holidays_updated_at
BEFORE UPDATE ON public.holidays
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
