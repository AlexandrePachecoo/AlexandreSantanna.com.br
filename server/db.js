import { supabase } from './config/supabase.js';

const TABLE = 'cartas';

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

  if (error) throw error;
  return data;
}

export async function getCartaBySlug(slug) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCartaByChargeId(chargeId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('charge_id', chargeId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateCartaBySlug(slug, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .select()
    .single();

  if (error) throw error;
  return data;
}
