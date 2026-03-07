-- Run this SQL in your Supabase SQL Editor to fix the schema mismatch
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste → Run

ALTER TABLE financial_ai_reports 
ADD COLUMN IF NOT EXISTS full_insights jsonb;

-- Also update the setup file for future reference
-- (I will do this in the next step)
