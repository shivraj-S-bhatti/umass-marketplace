-- UMass Marketplace Database Schema Migration V1
-- Creates initial tables for users and listings with proper indexes and constraints

-- Create users table for storing student information
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create listing status enum for tracking item availability
CREATE TYPE listing_status AS ENUM ('ACTIVE', 'ON_HOLD', 'SOLD');

-- Create listings table for storing marketplace items
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category TEXT,
  condition TEXT,
  status listing_status DEFAULT 'ACTIVE',
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_created_at ON listings(created_at);

-- Create trigram index for full-text search on titles (requires pg_trgm extension)
-- This enables efficient LIKE queries and text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_listings_title_trgm ON listings USING gin (title gin_trgm_ops);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on listings
CREATE TRIGGER update_listings_updated_at 
    BEFORE UPDATE ON listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
