CREATE TABLE IF NOT EXISTS profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  is_premium boolean default false,
  premium_activated_at timestamptz,
  created_at timestamptz default now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);
