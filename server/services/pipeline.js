import { supabase } from '../config/supabase.js';
import { gerarArte } from './imagem.js';
import { gerarVideo } from './video.js';
import { gerarNarracao } from './tts.js';
import { enviarPresentePorEmail } from './email.js';

export async function processarPipeline(pedidoId) {
  try {
    console.log(`[${pedidoId}] Iniciando pipeline...`);

    // Buscar dados do pedido
    const { data: pedido, error: fetchError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .single();

    if (fetchError) {
      throw new Error(`Pedido não encontrado: ${fetchError.message}`);
    }

    // Atualizar status para "processando"
    await supabase
      .from('pedidos')
      .update({ status: 'processando' })
      .eq('id', pedidoId);

    // 1. Gerar arte com GPT Image 2
    console.log(`[${pedidoId}] Gerando arte com GPT Image 2...`);
    const arteUrl = await gerarArte({
      nomeMae: pedido.nome_mae,
      idade: pedido.idade,
      estilo: pedido.estilo,
      mensagem: pedido.mensagem,
      fotosUrls: pedido.fotos_urls,
    });
    console.log(`[${pedidoId}] ✓ Arte gerada: ${arteUrl}`);

    // 2. Gerar vídeo com FFmpeg
    console.log(`[${pedidoId}] Gerando vídeo...`);
    const videoUrl = await gerarVideo({
      fotosUrls: pedido.fotos_urls,
      arteUrl: arteUrl,
      nomeMae: pedido.nome_mae,
      trilha: pedido.trilha,
    });
    console.log(`[${pedidoId}] ✓ Vídeo gerado: ${videoUrl}`);

    // 3. Adicionar narração (se solicitado)
    let audioUrl = null;
    if (pedido.trilha === 'narracao') {
      console.log(`[${pedidoId}] Gerando narração com ElevenLabs...`);
      audioUrl = await gerarNarracao({
        mensagem: pedido.mensagem,
        nomeMae: pedido.nome_mae,
        email: pedido.email,
      });
      console.log(`[${pedidoId}] ✓ Narração gerada: ${audioUrl}`);
      // TODO: Mixar áudio ao vídeo com FFmpeg
    }

    // 4. Enviar email
    console.log(`[${pedidoId}] Enviando email...`);
    await enviarPresentePorEmail({
      email: pedido.email,
      nomeMae: pedido.nome_mae,
      arteUrl: arteUrl,
      videoUrl: videoUrl,
    });
    console.log(`[${pedidoId}] ✓ Email enviado`);

    // Atualizar status para "entregue"
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({
        status: 'entregue',
        arte_url: arteUrl,
        video_url: videoUrl,
        updated_at: new Date(),
      })
      .eq('id', pedidoId);

    if (updateError) {
      throw new Error(`Erro ao atualizar status: ${updateError.message}`);
    }

    console.log(`[${pedidoId}] ✓ Pipeline concluído com sucesso!`);
  } catch (err) {
    console.error(`[${pedidoId}] ✗ Erro no pipeline:`, err);

    // Atualizar status para "erro"
    await supabase
      .from('pedidos')
      .update({
        status: 'erro',
        erro_mensagem: err.message,
        updated_at: new Date(),
      })
      .eq('id', pedidoId)
      .catch(e => console.error('Erro ao registrar falha:', e));

    throw err;
  }
}
