-- Remove unique constraint from college_id since it should not be unique
-- Students from the same college can have the same college_id format
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_college_id_key;