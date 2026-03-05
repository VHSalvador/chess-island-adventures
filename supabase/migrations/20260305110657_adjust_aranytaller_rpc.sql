-- Atomic aranytaller adjustment to prevent race conditions.
-- Uses SECURITY DEFINER so the function runs as the owner,
-- but the WHERE clause enforces that only the authenticated user
-- can modify their own child_profiles row.

CREATE OR REPLACE FUNCTION public.adjust_aranytaller(profile_id uuid, delta integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE child_profiles
  SET aranytaller = COALESCE(aranytaller, 0) + delta
  WHERE id = profile_id
    AND user_id = auth.uid();
$$;
