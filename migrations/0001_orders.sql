CREATE TABLE IF NOT EXISTS orders (
    id                TEXT PRIMARY KEY,
    email             TEXT NOT NULL,
    nome              TEXT NOT NULL,
    idade             INTEGER,
    estilo            TEXT NOT NULL,
    mensagem          TEXT,
    trilha            TEXT NOT NULL DEFAULT 'narracao',
    photo_keys        JSONB NOT NULL DEFAULT '[]'::jsonb,
    status            TEXT NOT NULL DEFAULT 'draft',
    payment_id        TEXT UNIQUE,
    art_key           TEXT,
    audio_key         TEXT,
    video_key         TEXT,
    video_ready_at    TIMESTAMPTZ,
    video_expires_at  TIMESTAMPTZ,
    last_error        TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_idx     ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at);

-- status flow:
-- draft -> awaiting_payment -> paid -> art_ready -> video_ready -> expired
--   |          |                |
--   `----------+----------------+--> failed
