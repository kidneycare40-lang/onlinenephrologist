-- ============================================================
-- 008_razorpay_payments.sql
-- Online booking payments via Razorpay
-- Run this in the Supabase SQL editor (or via supabase db push)
-- ============================================================

create table if not exists public.booking_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null,
  patient_name text,
  patient_phone text,
  patient_email text,
  patient_country text,
  consultation_type text,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  payment_status text not null default 'CREATED', -- CREATED | PENDING | AUTHORIZED | CAPTURED | FAILED | REFUNDED
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_booking_payments_booking_id on public.booking_payments (booking_id);
create index if not exists idx_booking_payments_order_id on public.booking_payments (razorpay_order_id);
create index if not exists idx_booking_payments_status on public.booking_payments (payment_status);

-- RLS: bookings are created from public forms (no auth), so insert/select allowed.
-- The table only stores payment metadata (no secrets), which is safe to expose
-- for the booking confirmation flow. Restrict update/delete to service role only.
alter table public.booking_payments enable row level security;

drop policy if exists "booking_payments_insert" on public.booking_payments;
create policy "booking_payments_insert"
  on public.booking_payments for insert
  with check (true);

drop policy if exists "booking_payments_select" on public.booking_payments;
create policy "booking_payments_select"
  on public.booking_payments for select
  using (true);