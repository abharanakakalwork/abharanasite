-- Indexing for user email and created_at on bookings table for efficient historical lookup
CREATE INDEX IF NOT EXISTS idx_bookings_user_email ON bookings(user_email);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Indexing for user email and created_at on yoga_bookings table for efficient historical lookup
CREATE INDEX IF NOT EXISTS idx_yoga_bookings_user_email ON yoga_bookings(user_email);
CREATE INDEX IF NOT EXISTS idx_yoga_bookings_created_at ON yoga_bookings(created_at DESC);
