-- Add payment_method column to invoices table
-- Run this in Supabase SQL Editor

-- payment_method type already exists from 001_emr_schema.sql
-- CREATE TYPE payment_method AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE');

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method payment_method;
