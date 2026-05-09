import { createClient } from 'npm:@supabase/supabase-js@2';
import OpenAI, { toFile } from 'npm:openai';

const estilosPrompt: Record<string, string> = {
  'mosaico-classico': 'colagem em mosaico clássico, fotos organizadas em grade harmoniosa com molduras delicadas, toques florais entre as fotos, paleta rosa pastel, dourado e creme',
  'polaroid-scrapbook': 'colagem estilo scrapbook com fotos em formato polaroid sobreposto, fundo de papel envelhecido com flores secas e fitas, sensação de álbum afetivo de família',
  'coracao-floral': 'fotos compostas formando um grande coração, cercado por flores rosa e brancas em aquarela, tipografia delicada e romântica',
  'moldura-unica': 'as fotos integradas em uma única moldura artística com flores, tons de rosa e dourado, composição emocional de Dia das Mães',
  'ia': 'colagem artística harmoniosa de Dia das Mães, combinando as fotos com elementos florais, tons rosa pastel e dourado',
};

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405 });
  }

  let pedidoId: string | undefined;
  try {
    ({ pedidoId } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), { status: 400 });
  }
  if (!pedidoId) {
    return new Response(JSON.stringify({ error: 'pedidoId obrigatório' }), { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });

  try {
    const { data: pedido, error: dbError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .single();

    if (dbError || !pedido) throw new Error('Pedido não encontrado');

    // Download at most 3 photos in parallel
    const fotosUrls: string[] = (pedido.fotos_urls || []).slice(0, 3);
    const fotosFiles = await Promise.all(
      fotosUrls.map(async (path: string, i: number) => {
        const { data, error } = await supabase.storage.from('fotos-pedidos').download(path);
        if (error) throw error;
        return toFile(await data.arrayBuffer(), `foto-${i + 1}.png`, { type: 'image/png' });
      }),
    );

    if (fotosFiles.length === 0) throw new Error('Nenhuma foto disponível para a colagem');

    const estiloDescricao = estilosPrompt[pedido.estilo] ?? estilosPrompt['ia'];
    const prompt = `Crie uma arte comemorativa de Dia das Mães em estilo ${estiloDescricao}.
Componha as fotos enviadas (Imagem 1 até Imagem ${fotosFiles.length} são fotos da família) em uma colagem afetiva e emocional.
Inclua o nome "${pedido.nome_mae}"${pedido.idade ? ` (${pedido.idade} anos)` : ''} em tipografia elegante e a frase: "${pedido.mensagem || 'Feliz Dia das Mães'}".
Paleta: rosas suaves, dourado e creme. Composição harmoniosa, qualidade de presente impresso em alta resolução.
Não inclua nenhum outro texto além do nome e da frase.`;

    const response = await openai.images.edit({
      model: 'gpt-image-2',
      image: fotosFiles,
      prompt,
      size: '1024x1024',
      quality: 'medium',
    });

    const item = response.data?.[0];
    if (!item) throw new Error('Modelo não retornou imagem');

    let imageData: Uint8Array;
    if (item.b64_json) {
      const binary = atob(item.b64_json);
      imageData = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) imageData[i] = binary.charCodeAt(i);
    } else {
      imageData = new Uint8Array(await (await fetch(item.url!)).arrayBuffer());
    }

    const artePath = `${pedidoId}/arte.png`;
    const { error: uploadError } = await supabase.storage
      .from('arte')
      .upload(artePath, imageData, { contentType: 'image/png', upsert: true });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('arte').getPublicUrl(artePath);

    await supabase.from('pedidos').update({
      status: 'entregue',
      arte_url: urlData.publicUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', pedidoId);

    // Cleanup user photos (best-effort)
    supabase.storage.from('fotos-pedidos').remove(pedido.fotos_urls || []).catch(() => {});

    console.log(`[gerar-arte ${pedidoId}] entregue: ${urlData.publicUrl}`);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    const msg = (err as Error).message ?? 'Erro desconhecido';
    console.error(`[gerar-arte ${pedidoId}] erro:`, msg);
    await supabase.from('pedidos').update({
      status: 'erro',
      erro_mensagem: msg.slice(0, 500),
      updated_at: new Date().toISOString(),
    }).eq('id', pedidoId);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
