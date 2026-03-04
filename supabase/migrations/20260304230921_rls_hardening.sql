-- RLS hardening: ensure all tables have RLS enabled and complete policies
-- This migration is additive; it does not drop existing policies.

-- ============================================================
-- child_profiles: add missing DELETE policy
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'child_profiles'
      AND policyname = 'Users can delete own child profiles'
  ) THEN
    EXECUTE '
      CREATE POLICY "Users can delete own child profiles"
        ON public.child_profiles
        FOR DELETE
        USING (auth.uid() = user_id)
    ';
  END IF;
END $$;

-- ============================================================
-- chapter_progress: add missing DELETE policy (e.g. reset progress)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'chapter_progress'
      AND policyname = 'Users can delete own chapter progress'
  ) THEN
    EXECUTE '
      CREATE POLICY "Users can delete own chapter progress"
        ON public.chapter_progress
        FOR DELETE
        USING (
          EXISTS (
            SELECT 1 FROM public.child_profiles cp
            WHERE cp.id = child_profile_id
              AND cp.user_id = auth.uid()
          )
        )
    ';
  END IF;
END $$;

-- ============================================================
-- Verify RLS is enabled on all tables (belt-and-suspenders)
-- ============================================================
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.island_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items       ENABLE ROW LEVEL SECURITY;
