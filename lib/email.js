import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "WLG Distribuidora <presente@wlgdistribuidora.com.br>";

let _client;
function client() {
    if (!_client) {
        if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY ausente.");
        _client = new Resend(process.env.RESEND_API_KEY);
    }
    return _client;
}

export async function sendPresenteReady({ to, nome, artUrl, videoUrl, orderUrl }) {
    const subject = `O presente para ${nome} está pronto ♥`;
    const html = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1d0f1a;background:#fff9f3;">
            <h1 style="font-family:Georgia,serif;color:#a51247;margin-top:0;">Pronto, com muito amor!</h1>
            <p>Seu presente para <strong>${escapeHtml(nome)}</strong> ficou lindo.</p>
            ${artUrl ? `<p><img src="${artUrl}" alt="Arte gerada" style="width:100%;border-radius:12px;border:1px solid #f1d9e2;"></p>` : ""}
            <p style="margin:24px 0;">
                <a href="${videoUrl}" style="display:inline-block;background:#ee3d77;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;">Baixar vídeo</a>
                ${artUrl ? `&nbsp;&nbsp;<a href="${artUrl}" style="display:inline-block;background:#fff;color:#a51247;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;border:1px solid #ffc8d8;">Baixar arte</a>` : ""}
            </p>
            <p style="font-size:14px;color:#7a5d6c;">No site, o vídeo fica disponível por apenas 15 minutos depois de pronto. Por isso enviamos os links aqui pra você guardar com calma.</p>
            ${orderUrl ? `<p style="font-size:13px;color:#b59ea9;">Acompanhar pedido: <a href="${orderUrl}" style="color:#a51247;">${orderUrl}</a></p>` : ""}
            <hr style="border:none;border-top:1px solid #f1d9e2;margin:28px 0;">
            <p style="font-size:12px;color:#b59ea9;">WLG Distribuidora · Av. Nações Unidas, 369 · Bairro Rincão · Novo Hamburgo · 51 3065-6655</p>
        </div>
    `;
    return client().emails.send({ from: FROM, to, subject, html });
}

function escapeHtml(s = "") {
    return String(s).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}
