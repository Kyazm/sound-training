-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'player';

-- Set admin role manually via Supabase Dashboard SQL Editor:
-- UPDATE profiles SET role = 'admin' WHERE id = '<your-user-uuid>';

-- Update the on_auth_user_created trigger function to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, level, total_xp, current_streak, longest_streak, last_practice_date, settings, role)
  VALUES (
    NEW.id,
    NULL,
    1,
    0,
    0,
    0,
    NULL,
    '{"playbackSpeed": 1, "fixedKey": null, "darkMode": true}'::jsonb,
    'player'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
