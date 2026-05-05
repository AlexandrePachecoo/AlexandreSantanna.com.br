import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = 'noreply@presentediadasmaes.com';
const EMAIL_REPLY_TO = 'contato@wlgdistribuidora.com.br';

export async function enviarPresentePorEmail({ email, nomeMae, arteUrl, videoUrl }) {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Seu Presente de Dia das Mães está pronto!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding-bottom: 30px; border-bottom: 2px solid #f1d9e2; }
    .header h1 { color: #d31e5d; margin: 0; font-size: 28px; }
    .content { padding: 30px 0; }
    .preview { margin: 20px 0; text-align: center; }
    .preview img { max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 4px 15px rgba(165, 18, 71, 0.1); }
    .cta-buttons { margin: 30px 0; display: flex; gap: 10px; justify-content: center; }
    .btn { display: inline-block; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .btn-primary { background-color: #d31e5d; color: white; }
    .btn-secondary { background-color: #fff; color: #d31e5d; border: 2px solid #d31e5d; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #f1d9e2; color: #7a5d6c; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Seu Presente Está Pronto!</h1>
    </div>

    <div class="content">
      <p>Olá! Seu presente especial para <strong>${nomeMae}</strong> foi gerado com sucesso!</p>

      <p>A arte exclusiva que criamos com inteligência artificial está abaixo:</p>

      <div class="preview">
        <img src="${arteUrl}" alt="Seu presente de Dia das Mães" style="max-width: 300px;">
      </div>

      <p>Você pode:</p>
      <ul>
        <li><strong>Imprimir</strong> a arte em alta resolução (ideal para emoldurar)</li>
        <li><strong>Compartilhar</strong> o vídeo emocionante nas redes sociais</li>
        <li><strong>Enviar</strong> para a sua mãe e emocionar!</li>
      </ul>

      <div class="cta-buttons">
        <a href="${arteUrl}" class="btn btn-primary">Baixar Arte em Alta Resolução</a>
        <a href="${videoUrl}" class="btn btn-secondary">Assistir o Vídeo</a>
      </div>

      <p style="font-size: 14px; color: #7a5d6c;">
        <strong>Dica:</strong> Os links para download e vídeo expiram em 7 dias. Salve seus arquivos antes disso!
      </p>
    </div>

    <div class="footer">
      <p>Feito com ♥ pela WLG Distribuidora</p>
      <p>Av. Nações Unidas, 369 · Novo Hamburgo · RS</p>
      <p><a href="https://www.wlgdistribuidora.com.br" style="color: #d31e5d;">www.wlgdistribuidora.com.br</a></p>
    </div>
  </div>
</body>
</html>
`;

    console.log(`[EMAIL] Enviando para ${email}...`);

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      replyTo: EMAIL_REPLY_TO,
      subject: `🎁 Seu presente de Dia das Mães está pronto, ${nomeMae}!`,
      html: htmlContent,
    });

    if (response.error) {
      throw new Error(`Erro ao enviar email: ${response.error.message}`);
    }

    console.log(`[EMAIL] ✓ Email enviado com sucesso (ID: ${response.data.id})`);
    return response.data;
  } catch (err) {
    console.error('Erro ao enviar email com Resend:', err);
    throw err;
  }
}
