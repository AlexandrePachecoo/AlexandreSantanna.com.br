import { criarPedido as dbCriarPedido, updatePedido } from '../db.js';
import { criarCobranca } from './pagamento.js';

export async function criarPedido({ nomeMae, idade, estilo, tamanho, email, fotosPaths, nomeCliente, frontendUrl }) {
  const pedido = await dbCriarPedido({
    email,
    nome_mae: nomeMae,
    idade,
    estilo,
    tamanho,
    fotos_urls: fotosPaths,
  });

  const { checkoutUrl, chargeId } = await criarCobranca({
    pedidoId: pedido.id,
    email,
    nomeCliente,
    valor: parseInt(process.env.PRODUCT_PRICE) || 1500,
    frontendUrl,
  });

  await updatePedido(pedido.id, {
    charge_id: chargeId,
  });

  return { pedidoId: pedido.id, checkoutUrl };
}
