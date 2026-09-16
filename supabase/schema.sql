create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'client' check (role in ('client', 'company', 'partner', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  type text not null,
  location text not null,
  latitude double precision,
  longitude double precision,
  price numeric not null default 0,
  size text,
  description text,
  image_url text,
  verified boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rentals (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  type text not null,
  location text not null,
  bedrooms integer default 1,
  bathrooms integer default 1,
  rent numeric not null default 0,
  image_url text,
  description text,
  verified boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hotels (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  type text not null,
  location text not null,
  price numeric not null default 0,
  rating numeric default 0,
  image_url text,
  description text,
  amenities text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  thread_id uuid not null default uuid_generate_v4(),
  content text not null,
  context_type text default 'property',
  context_id uuid,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  property_id uuid,
  listing_type text not null default 'hotel',
  check_in date,
  check_out date,
  status text default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.consultations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  status text default 'submitted',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.rentals enable row level security;
alter table public.hotels enable row level security;
alter table public.messages enable row level security;
alter table public.bookings enable row level security;
alter table public.notifications enable row level security;
alter table public.consultations enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles are viewable by owner'
  ) THEN
    CREATE POLICY "Profiles are viewable by owner"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their profile'
  ) THEN
    CREATE POLICY "Users can update their profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'Public can view properties'
  ) THEN
    CREATE POLICY "Public can view properties"
    ON public.properties
    FOR SELECT
    USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'Users can create properties'
  ) THEN
    CREATE POLICY "Users can create properties"
    ON public.properties
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'Users can update their properties'
  ) THEN
    CREATE POLICY "Users can update their properties"
    ON public.properties
    FOR UPDATE
    USING (auth.uid() = owner_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rentals' AND policyname = 'Public can view rentals'
  ) THEN
    CREATE POLICY "Public can view rentals"
    ON public.rentals
    FOR SELECT
    USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rentals' AND policyname = 'Users can create rentals'
  ) THEN
    CREATE POLICY "Users can create rentals"
    ON public.rentals
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rentals' AND policyname = 'Users can update rentals'
  ) THEN
    CREATE POLICY "Users can update rentals"
    ON public.rentals
    FOR UPDATE
    USING (auth.uid() = owner_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hotels' AND policyname = 'Public can view hotels'
  ) THEN
    CREATE POLICY "Public can view hotels"
    ON public.hotels
    FOR SELECT
    USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hotels' AND policyname = 'Users can create hotel records'
  ) THEN
    CREATE POLICY "Users can create hotel records"
    ON public.hotels
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hotels' AND policyname = 'Users can update their hotel records'
  ) THEN
    CREATE POLICY "Users can update their hotel records"
    ON public.hotels
    FOR UPDATE
    USING (auth.uid() = owner_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can view their own messages'
  ) THEN
    CREATE POLICY "Users can view their own messages"
    ON public.messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can insert messages'
  ) THEN
    CREATE POLICY "Users can insert messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can update their sent messages'
  ) THEN
    CREATE POLICY "Users can update their sent messages"
    ON public.messages
    FOR UPDATE
    USING (auth.uid() = sender_id);
  END IF;
END;
$$;