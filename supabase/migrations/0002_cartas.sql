-- Tabela de cartas virtuais (substitui o fluxo de arte por IA)
CREATE TABLE IF NOT EXISTS cartas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  nome_remetente TEXT NOT NULL,
  nome_destinatario TEXT NOT NULL,
  idade INTEGER,
  texto TEXT NOT NULL,
  fotos_paths TEXT[] DEFAULT '{}',
  spotify_track_id TEXT,
  spotify_track_name TEXT,
  spotify_artist TEXT,
  spotify_album_art TEXT,
  status TEXT DEFAULT 'pendente_pagamento',
  charge_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT cartas_status_check CHECK (status IN ('pendente_pagamento', 'publicada', 'erro'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cartas_slug ON cartas(slug);
CREATE INDEX IF NOT EXISTS idx_cartas_charge_id ON cartas(charge_id);
CREATE INDEX IF NOT EXISTS idx_cartas_email ON cartas(email);
CREATE INDEX IF NOT EXISTS idx_cartas_status ON cartas(status);
