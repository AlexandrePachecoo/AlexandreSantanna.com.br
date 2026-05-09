import { supabase } from './config/supabase.js';

const TABLE = 'pedidos';

export async function criarPedido(dados) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      email: dados.email,
      nome_mae: dados.nome_mae,
      idade: dados.idade,
      estilo: dados.estilo,
      tamanho: dados.tamanho,
      fotos_urls: dados.fotos_urls,
      status: 'pendente_pagamento',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPedido(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPedidoByChargeId(chargeId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('charge_id', chargeId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updatePedido(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
