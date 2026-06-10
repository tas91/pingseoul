-- Walk-in reservation support: allow reservations without a user profile
ALTER TABLE public.reservations
  ALTER COLUMN user_id DROP NOT NULL;
