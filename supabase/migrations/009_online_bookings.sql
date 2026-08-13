-- ============================================================
-- 009_online_bookings.sql
-- Online booking records (patient profile + uploaded reports)
-- synced from the public booking form so they appear in the EMR
-- Run this in the Supabase SQL editor (or via supabase db push)
-- ============================================================

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null unique,
  patient_id text,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  age text,
  gender text,
  country text,
  timezone text,
  preferred_language text,
  interpreter_required boolean not null default false,
  consultation_type text not null default 'online',
  clinic_id text,
  booking_date date,
  booking_time text,
  reason text,
  complaints text,
  current_medications text,
  notes text,
  previous_kidney_issue text,
  report_files jsonb not null default '[]'::jsonb,
  ultrasound_file jsonb,
  booking_medicines jsonb not null default '[]'::jsonb,
  consultation_fee numeric(10,2),
  consultation_fee_currency text not null default 'INR',
  payment_status text not null default 'unpaid',
  payment_id text,
  razorpay_order_id text,
  doctor_name text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_booking_id on public.bookings (booking_id);
create index if not exists idx_bookings_phone on public.bookings (phone);
create index if not exists idx_bookings_booking_date on public.bookings (booking_date);
create index if not exists idx_bookings_consultation_type on public.bookings (consultation_type);
create index if not exists idx_bookings_payment_status on public.bookings (payment_status);

-- RLS: bookings are created from the public booking form (no auth).
-- Select is open so the EMR (service role) and booking confirmation can read.
-- Updates are restricted to service role only (via API).
alter table public.bookings enable row level security;

drop policy if exists "bookings_insert" on public.bookings;
create policy "bookings_insert"
  on public.bookings for insert
  with check (true);

drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select"
  on public.bookings for select
  using (true);