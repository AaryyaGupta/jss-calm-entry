-- Update handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, college_id, branch, section, roll_number, batch, year, semester)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'college_id',
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'section',
    NEW.raw_user_meta_data->>'roll_number',
    '2025-2029',
    1,
    1
  );
  RETURN NEW;
END;
$$;
