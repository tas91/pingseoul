-- Add guest snapshot fields to reservations and instagram_id to profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS instagram_id varchar(100);

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS guest_name     varchar(100),
  ADD COLUMN IF NOT EXISTS guest_phone    varchar(20),
  ADD COLUMN IF NOT EXISTS guest_instagram varchar(100);
