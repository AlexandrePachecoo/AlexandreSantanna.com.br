import { criarPedido as dbCriarPedido, updatePedido } from '../db.js';
import { criarCobranca } from './pagamento.js';

export async function criarPedido({ nomeMae, idade, estilo, mensagem, trilha, email, fotosPaths, nomeCliente, cpf, celular, frontendUrl }) {
  const pedido = await dbCriarPedido({
    email,
    nome_mae: nomeMae,
    idade,
    estilo,
    mensagem,
    trilha,
    fotos_urls: fotosPaths,
  });

  const { checkoutUrl, chargeId } = await criarCobranca({
    pedidoId: pedido.id,
    email,
    nomeCliente,
    cpf,
    celular,
    valor: parseInt(process.env.PRODUCT_PRICE) || 1500,
    frontendUrl,
  });

  await updatePedido(pedido.id, {
    charge_id: chargeId,
  });

  return { pedidoId: pedido.id, checkoutUrl };
}
