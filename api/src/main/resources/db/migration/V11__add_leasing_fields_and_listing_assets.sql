-- Extend listings to support leasing while preserving the shared listing/chat/share model.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS kind VARCHAR(24);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS lease_arrangement VARCHAR(32);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS transfer_scope VARCHAR(32);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS space_type VARCHAR(32);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS property_name VARCHAR(255);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS area_label VARCHAR(255);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS lease_end DATE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bathrooms NUMERIC(4,1);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS nearest_bus_stop_name VARCHAR(255);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS nearest_bus_stop_walk_minutes INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bus_routes_json TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS included_utilities_json TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS estimated_utilities_monthly_total NUMERIC(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS electricity_estimate NUMERIC(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS gas_estimate NUMERIC(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS water_estimate NUMERIC(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS internet_estimate NUMERIC(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS laundry_type VARCHAR(32);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS amenities_json TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cleaning_notes TEXT;

UPDATE listings
SET kind = 'MARKETPLACE'
WHERE kind IS NULL;

ALTER TABLE listings ALTER COLUMN kind SET DEFAULT 'MARKETPLACE';
ALTER TABLE listings ALTER COLUMN kind SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_kind_created_at ON listings(kind, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_lease_arrangement ON listings(lease_arrangement);
CREATE INDEX IF NOT EXISTS idx_listings_space_type ON listings(space_type);
CREATE INDEX IF NOT EXISTS idx_listings_available_from ON listings(available_from);
CREATE INDEX IF NOT EXISTS idx_listings_lease_end ON listings(lease_end);

CREATE TABLE IF NOT EXISTS listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id_sort_order
    ON listing_images(listing_id, sort_order);

CREATE TABLE IF NOT EXISTS listing_external_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    label VARCHAR(80) NOT NULL,
    url TEXT NOT NULL,
    link_type VARCHAR(32) NOT NULL DEFAULT 'OTHER',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_external_links_listing_id_sort_order
    ON listing_external_links(listing_id, sort_order);
