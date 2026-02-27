-- Move chats to one-conversation-per-user-pair and support sharing listings in messages.

-- 1) Messages can optionally reference a shared listing (forwarded listing card).
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS shared_listing_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_messages_shared_listing'
    ) THEN
        ALTER TABLE messages
        ADD CONSTRAINT fk_messages_shared_listing
            FOREIGN KEY (shared_listing_id)
            REFERENCES listings(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_shared_listing_id ON messages(shared_listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created_at_desc ON messages(chat_id, created_at DESC);

-- 2) Chat listing is now context only (nullable), not identity.
ALTER TABLE chats
ALTER COLUMN listing_id DROP NOT NULL;

DO $$
DECLARE
    existing_fk TEXT;
BEGIN
    SELECT c.conname
    INTO existing_fk
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = current_schema()
      AND t.relname = 'chats'
      AND c.contype = 'f'
      AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (listing_id)%'
    LIMIT 1;

    IF existing_fk IS NOT NULL AND existing_fk <> 'fk_chats_listing_context' THEN
        EXECUTE format('ALTER TABLE chats DROP CONSTRAINT %I', existing_fk);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_chats_listing_context'
    ) THEN
        ALTER TABLE chats
        ADD CONSTRAINT fk_chats_listing_context
            FOREIGN KEY (listing_id)
            REFERENCES listings(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 3) Enforce valid participant pairs.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_chats_distinct_participants'
    ) THEN
        ALTER TABLE chats
        ADD CONSTRAINT chk_chats_distinct_participants
            CHECK (buyer_id <> seller_id);
    END IF;
END $$;

-- 4) Merge duplicate chats for the same unordered participant pair.
WITH ranked AS (
    SELECT
        id,
        FIRST_VALUE(id) OVER (
            PARTITION BY LEAST(buyer_id, seller_id), GREATEST(buyer_id, seller_id)
            ORDER BY created_at ASC, id ASC
        ) AS keeper_id,
        ROW_NUMBER() OVER (
            PARTITION BY LEAST(buyer_id, seller_id), GREATEST(buyer_id, seller_id)
            ORDER BY created_at ASC, id ASC
        ) AS rn
    FROM chats
),
dupes AS (
    SELECT id AS duplicate_id, keeper_id
    FROM ranked
    WHERE rn > 1
)
UPDATE messages m
SET chat_id = d.keeper_id
FROM dupes d
WHERE m.chat_id = d.duplicate_id;

WITH ranked AS (
    SELECT
        id,
        FIRST_VALUE(id) OVER (
            PARTITION BY LEAST(buyer_id, seller_id), GREATEST(buyer_id, seller_id)
            ORDER BY created_at ASC, id ASC
        ) AS keeper_id,
        ROW_NUMBER() OVER (
            PARTITION BY LEAST(buyer_id, seller_id), GREATEST(buyer_id, seller_id)
            ORDER BY created_at ASC, id ASC
        ) AS rn,
        listing_id
    FROM chats
),
listing_candidates AS (
    SELECT keeper_id, MAX(listing_id) AS candidate_listing_id
    FROM ranked
    WHERE listing_id IS NOT NULL
    GROUP BY keeper_id
)
UPDATE chats c
SET listing_id = lc.candidate_listing_id
FROM listing_candidates lc
WHERE c.id = lc.keeper_id
  AND c.listing_id IS NULL;

WITH ranked AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY LEAST(buyer_id, seller_id), GREATEST(buyer_id, seller_id)
            ORDER BY created_at ASC, id ASC
        ) AS rn
    FROM chats
)
DELETE FROM chats c
USING ranked r
WHERE c.id = r.id
  AND r.rn > 1;

-- 5) Replace listing-based uniqueness with pair-based uniqueness.
ALTER TABLE chats DROP CONSTRAINT IF EXISTS unique_chat_participants;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chats_unique_pair
    ON chats (LEAST(buyer_id, seller_id), GREATEST(buyer_id, seller_id));
