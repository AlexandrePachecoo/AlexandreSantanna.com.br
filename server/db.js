import { supabase } from './config/supabase.js';

const TABLE = 'cartas';

function throwDbError(operation, error) {
  console.error(`Erro Supabase em ${operation}:`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
  const err = new Error(error.message);
  err.code = error.code;
  err.details = error.details;
  err.hint = error.hint;
  throw err;
}

export async function criarCarta(dados) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      slug: dados.slug,
      email: dados.email,
      nome_remetente: dados.nome_remetente,
      nome_destinatario: dados.nome_destinatario,
      idade: dados.idade,
      texto: dados.texto,
      fotos_paths: dados.fotos_paths,
      spotify_track_id: dados.spotify_track_id,
      spotify_track_name: dados.spotify_track_name,
      spotify_artist: dados.spotify_artist,
      spotify_album_art: dados.spotify_album_art,
      status: 'pendente_pagamento',
    })
    .select()
    .single();

  if (error) throwDbError('criarCarta', error);
  return data;
}

export async function getCartaBySlug(slug) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throwDbError('getCartaBySlug', error);
  return data;
}

export async function getCartaByChargeId(chargeId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('charge_id', chargeId)
    .maybeSingle();

  if (error) throwDbError('getCartaByChargeId', error);
  return data;
}

export async function updateCartaBySlug(slug, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .select()
    .single();

  if (error) throwDbError('updateCartaBySlug', error);
  return data;
}
