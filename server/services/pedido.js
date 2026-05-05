import { supabase } from '../config/supabase.js';
import { criarCobranca } from './pagamento.js';
import { uploadFotos } from './storage.js';

export async function criarPedido({ nomeMae, idade, estilo, mensagem, trilha, email, fotos }) {
  try {
    // 1. Upload das fotos para Supabase Storage
    const fotosUrls = await uploadFotos(fotos, email);

    // 2. Salvar pedido no banco de dados com status "pendente_pagamento"
    const { data: pedido, error: dbError } = await supabase
      .from('pedidos')
      .insert([
        {
          email,
          nome_mae: nomeMae,
          idade,
          estilo,
          mensagem,
          trilha,
          fotos_urls: fotosUrls,
          status: 'pendente_pagamento',
          created_at: new Date(),
        },
      ])
      .select('id')
      .single();

    if (dbError) {
      throw new Error(`Erro ao salvar pedido: ${dbError.message}`);
    }

    // 3. Criar cobrança no AbacatePay
    const checkoutUrl = await criarCobranca({
      pedidoId: pedido.id,
      email,
      nomeMae,
      valor: parseInt(process.env.PRODUCT_PRICE) || 1500, // em centavos
    });

    return {
      pedidoId: pedido.id,
      checkoutUrl,
    };
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    throw err;
  }
}
