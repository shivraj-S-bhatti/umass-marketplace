-- Change image_url column to TEXT to allow storing base64 image data
ALTER TABLE listings ALTER COLUMN image_url TYPE TEXT;
