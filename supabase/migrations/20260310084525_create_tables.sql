-- ユーザープロフィール（auth.usersと1:1）
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  level integer not null default 1,
  total_xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_practice_date date,
  settings jsonb not null default '{"playbackSpeed": 1.0, "fixedKey": null, "darkMode": true}',
  created_at timestamptz not null default now()
);

-- カテゴリ別進捗
create table category_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null,
  current_level integer not null default 1,
  total_correct integer not null default 0,
  total_attempts integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, category)
);

-- 練習記録
create table exercise_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null,
  subcategory text,
  level integer not null,
  question jsonb,
  correct_answer text not null,
  user_answer text not null,
  is_correct boolean not null,
  response_time_ms integer not null,
  created_at timestamptz not null default now()
);

-- 間隔反復アイテム
create table spaced_repetition_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null,
  item_key text not null,
  ease_factor real not null default 2.5,
  interval_days integer not null default 1,
  repetitions integer not null default 0,
  next_review_date date,
  last_review_date date,
  unique(user_id, item_key)
);

-- インデックス
create index idx_exercise_records_user_id on exercise_records(user_id);
create index idx_exercise_records_created_at on exercise_records(created_at);
create index idx_spaced_repetition_user_due on spaced_repetition_items(user_id, next_review_date);

-- Row Level Security
alter table profiles enable row level security;
alter table category_progress enable row level security;
alter table exercise_records enable row level security;
alter table spaced_repetition_items enable row level security;

-- RLS ポリシー: ユーザーは自分のデータのみアクセス可能
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id)
  with check (
    -- role カラムの変更を禁止（現在の値を維持する必要がある）
    (select role from profiles where id = auth.uid()) = role
  );

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can view own category progress"
  on category_progress for select using (auth.uid() = user_id);

create policy "Users can insert own category progress"
  on category_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own category progress"
  on category_progress for update using (auth.uid() = user_id);

create policy "Users can view own exercise records"
  on exercise_records for select using (auth.uid() = user_id);

create policy "Users can insert own exercise records"
  on exercise_records for insert with check (auth.uid() = user_id);

create policy "Users can view own spaced repetition items"
  on spaced_repetition_items for select using (auth.uid() = user_id);

create policy "Users can insert own spaced repetition items"
  on spaced_repetition_items for insert with check (auth.uid() = user_id);

create policy "Users can update own spaced repetition items"
  on spaced_repetition_items for update using (auth.uid() = user_id);

-- サインアップ時に自動でprofileを作成するトリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
