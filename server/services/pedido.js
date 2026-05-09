import { criarPedido as dbCriarPedido, updatePedido } from '../db.js';
import { uploadFotos } from './storage.js';
import { criarCobranca } from './pagamento.js';

export async function criarPedido({ nomeMae, idade, estilo, mensagem, trilha, email, fotos }) {
  const pedido = await dbCriarPedido({
    email,
    nome_mae: nomeMae,
    idade,
    estilo,
    mensagem,
    trilha,
    fotos_urls: [],
  });

  const fotosPaths = await uploadFotos(fotos, pedido.id);

  const { checkoutUrl, chargeId } = await criarCobranca({
    pedidoId: pedido.id,
    email,
    nomeMae,
    valor: parseInt(process.env.PRODUCT_PRICE) || 1500,
  });

  await updatePedido(pedido.id, {
    fotos_urls: fotosPaths,
    charge_id: chargeId,
  });

  return { pedidoId: pedido.id, checkoutUrl };
}
