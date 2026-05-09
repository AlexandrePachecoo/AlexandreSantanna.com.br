-- Adiciona coluna `tamanho` na tabela pedidos para suportar formato Post/Story.
-- Rodar uma vez no banco em produção (ou via Supabase Studio).
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tamanho TEXT DEFAULT 'post';
