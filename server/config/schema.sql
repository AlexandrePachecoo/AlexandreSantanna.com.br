-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nome_mae TEXT NOT NULL,
  idade INTEGER,
  estilo TEXT DEFAULT 'ia',
  mensagem TEXT,
  trilha TEXT DEFAULT 'narracao',
  fotos_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pendente_pagamento',
  charge_id TEXT,
  arte_url TEXT,
  video_url TEXT,
  erro_mensagem TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT status_check CHECK (status IN ('pendente_pagamento', 'pago', 'processando', 'entregue', 'erro'))
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON pedidos(email);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);

-- Armazenamento para fotos (Storage no Supabase)
-- Nome do bucket: fotos-pedidos
-- Será criado manualmente no dashboard do Supabase ou via API
