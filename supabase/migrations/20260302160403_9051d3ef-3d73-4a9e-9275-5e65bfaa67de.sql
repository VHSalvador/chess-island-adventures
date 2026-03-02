
-- Create profiles table for parents
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create child_profiles table
CREATE TABLE public.child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  aranytaller INTEGER NOT NULL DEFAULT 0,
  current_chapter INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own child profiles" ON public.child_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own child profiles" ON public.child_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own child profiles" ON public.child_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create chapter_progress table
CREATE TABLE public.chapter_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  step TEXT NOT NULL DEFAULT 'story',
  completed BOOLEAN NOT NULL DEFAULT false,
  stars_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_profile_id, chapter_number)
);

ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chapter progress" ON public.chapter_progress
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = child_profile_id AND cp.user_id = auth.uid()));
CREATE POLICY "Users can insert own chapter progress" ON public.chapter_progress
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = child_profile_id AND cp.user_id = auth.uid()));
CREATE POLICY "Users can update own chapter progress" ON public.chapter_progress
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = child_profile_id AND cp.user_id = auth.uid()));

-- Create quiz_results table
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  quiz_type TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  correct BOOLEAN NOT NULL DEFAULT false,
  aranytaller_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results" ON public.quiz_results
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = child_profile_id AND cp.user_id = auth.uid()));
CREATE POLICY "Users can insert own quiz results" ON public.quiz_results
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = child_profile_id AND cp.user_id = auth.uid()));

-- Create island_inventory table
CREATE TABLE public.island_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  grid_x INTEGER NOT NULL DEFAULT 0,
  grid_y INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.island_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own island items" ON public.island_inventory
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = child_profile_id AND cp.user_id = auth.uid()));
CREATE POLICY "Users can insert own island items" ON public.island_inventory
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = child_profile_id AND cp.user_id = auth.uid()));
CREATE POLICY "Users can update own island items" ON public.island_inventory
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = child_profile_id AND cp.user_id = auth.uid()));
CREATE POLICY "Users can delete own island items" ON public.island_inventory
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = child_profile_id AND cp.user_id = auth.uid()));

-- Create shop_items reference table
CREATE TABLE public.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🏠',
  description TEXT
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view shop items" ON public.shop_items FOR SELECT USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_child_profiles_updated_at BEFORE UPDATE ON public.child_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chapter_progress_updated_at BEFORE UPDATE ON public.chapter_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
