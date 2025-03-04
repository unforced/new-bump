-- Create custom types
CREATE TYPE privacy_level AS ENUM ('public', 'friends', 'private');
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'rejected');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  phone TEXT,
  avatar_url TEXT,
  status TEXT,
  status_updated_at TIMESTAMP WITH TIME ZONE
);

-- Create places table
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  google_place_id TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create check_ins table
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  activity TEXT,
  privacy_level privacy_level NOT NULL DEFAULT 'friends',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create friends table
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status friend_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  hope_to_bump BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, friend_id)
);

-- Create meetups table
CREATE TABLE meetups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  meetup_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  notification_preferences JSONB DEFAULT '{}',
  do_not_disturb BOOLEAN DEFAULT FALSE,
  do_not_disturb_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Set up Row Level Security (RLS)

-- Profiles: Users can read any profile, but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Places: Anyone can read places, only creators can update
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Places are viewable by everyone" 
  ON places FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert places" 
  ON places FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own places" 
  ON places FOR UPDATE 
  USING (auth.uid() = created_by);

-- Check-ins: Visibility depends on privacy level
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins" 
  ON check_ins FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public check-ins" 
  ON check_ins FOR SELECT 
  USING (privacy_level = 'public');

CREATE POLICY "Users can view friends' check-ins" 
  ON check_ins FOR SELECT 
  USING (
    privacy_level = 'friends' AND 
    EXISTS (
      SELECT 1 FROM friends 
      WHERE (user_id = auth.uid() AND friend_id = check_ins.user_id AND status = 'accepted')
      OR (friend_id = auth.uid() AND user_id = check_ins.user_id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can insert their own check-ins" 
  ON check_ins FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins" 
  ON check_ins FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins" 
  ON check_ins FOR DELETE 
  USING (auth.uid() = user_id);

-- Friends: Users can only see their own friend connections
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend connections" 
  ON friends FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert friend requests" 
  ON friends FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friend connections" 
  ON friends FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Meetups: Users can only see their own meetups
ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meetups" 
  ON meetups FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert their own meetups" 
  ON meetups FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetups" 
  ON meetups FOR UPDATE 
  USING (auth.uid() = user_id);

-- Settings: Users can only see and modify their own settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" 
  ON settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
  ON settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (new.id, new.email, new.created_at);
  
  INSERT INTO public.settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 