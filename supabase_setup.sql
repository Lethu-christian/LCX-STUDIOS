-- Run this SQL in your Supabase SQL Editor to enable dynamic services and portfolio management.

-- =============================================
-- 1. PORTFOLIO_ITEMS TABLE (ensure it exists)
-- =============================================
CREATE TABLE IF NOT EXISTS portfolio_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    title text NOT NULL,
    category text NOT NULL DEFAULT 'Voting Platform',
    description text,
    badge text,
    cover_image text,
    gallery_images text[] DEFAULT '{}'::text[]
);

-- Enable public read access for portfolio items
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read portfolio_items"
    ON portfolio_items FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Admin insert portfolio_items"
    ON portfolio_items FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admin update portfolio_items"
    ON portfolio_items FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Admin delete portfolio_items"
    ON portfolio_items FOR DELETE USING (true);

-- =============================================
-- 2. SERVICES TABLE (new - for dynamic services)
-- =============================================
CREATE TABLE IF NOT EXISTS services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    title text NOT NULL,
    description text,
    icon text DEFAULT 'Code2',
    badge text,
    points text[] DEFAULT '{}'::text[],
    whatsapp_msg text,
    cover_image text,
    display_order int DEFAULT 0
);

-- Enable public read access for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read services"
    ON services FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Admin insert services"
    ON services FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admin update services"
    ON services FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Admin delete services"
    ON services FOR DELETE USING (true);

-- =============================================
-- 3. STORAGE BUCKET (for image uploads)
-- =============================================
-- Run this to create the portfolio storage bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files from portfolio bucket
CREATE POLICY IF NOT EXISTS "Public access portfolio bucket"
    ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');

-- Allow authenticated and anon users to upload to portfolio bucket
CREATE POLICY IF NOT EXISTS "Upload to portfolio bucket"
    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio');

-- Allow update and delete on portfolio bucket
CREATE POLICY IF NOT EXISTS "Update portfolio bucket"
    ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio');
CREATE POLICY IF NOT EXISTS "Delete portfolio bucket"
    ON storage.objects FOR DELETE USING (bucket_id = 'portfolio');
