CREATE TABLE chats (
    id UUID PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES listings(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_chat_participants UNIQUE (listing_id, buyer_id, seller_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES chats(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_chats_buyer_id ON chats(buyer_id);
CREATE INDEX idx_chats_seller_id ON chats(seller_id);
CREATE INDEX idx_chats_listing_id ON chats(listing_id);