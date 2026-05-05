export const STYLE_DIRECTIVES = {
    aquarela:    "Pintura em aquarela romântica, paleta pastel suave (rosê, pêssego, marfim), pinceladas delicadas, flores aquareladas e textura de papel artesanal.",
    polaroid:    "Composição em colagem nostálgica de polaroids vintage, recortes sobrepostos, fita adesiva washi, papel envelhecido e atmosfera de álbum de família dos anos 80.",
    minimalista: "Design moderno e minimalista, fundo limpo em tom marfim, tipografia serifada elegante, geometria sutil e abundância de espaço em branco.",
    ia:          "Estilo refinado escolhido pela IA, com paleta harmoniosa em tons rosê e dourado, atmosfera emocional e composição artística.",
};

export const VALID_STYLES = Object.keys(STYLE_DIRECTIVES);
export const VALID_TRACKS = ["narracao", "musica"];

export function buildPrompt({ name, age, message, style, hasPhotos }) {
    const styleDirective = STYLE_DIRECTIVES[style] || STYLE_DIRECTIVES.ia;
    const safeName = (name || "Mãe querida").trim();
    const safeAge = age ? `${age} anos` : null;
    const messageLine = (message || "").trim();
    const photoLine = hasPhotos
        ? "Use as fotos de referência fornecidas como inspiração visual: preserve traços, cenas e atmosferas de forma artística (não fotorrealista) e integre os elementos numa única composição harmônica."
        : "Crie uma cena emocional e atemporal sobre o amor entre mãe e filhos.";

    return [
        `Crie uma arte celebrativa de Dia das Mães para "${safeName}"${safeAge ? `, ${safeAge}` : ""}.`,
        `Título destacado em tipografia bonita: "Para ${safeName}, com amor".`,
        messageLine ? `Inclua sutilmente, em tipografia menor, a mensagem: "${messageLine.slice(0, 240)}".` : "",
        styleDirective,
        photoLine,
        "Composição centralizada, equilibrada, com molduras florais delicadas, corações sutis e luz quente. Resultado emocionante, presenteável, alta qualidade.",
        "NÃO inclua textos em outros idiomas além de português. NÃO inclua marca d'água, logotipos ou códigos QR.",
    ].filter(Boolean).join(" ");
}

export function validateOrderInput(body) {
    const errors = [];
    const nome = (body.nome || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const idade = body.idade ? Number(body.idade) : null;
    const estilo = (body.estilo || "ia").trim();
    const trilha = (body.trilha || "narracao").trim();
    const mensagem = (body.mensagem || "").trim();
    const consent = body.lgpd === true || body.lgpd === "true" || body.lgpd === "on";

    if (!nome) errors.push("Informe o nome da sua mãe.");
    if (nome.length > 80) errors.push("Nome muito longo.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("E-mail inválido.");
    if (idade !== null && (Number.isNaN(idade) || idade < 1 || idade > 120)) errors.push("Idade inválida.");
    if (!VALID_STYLES.includes(estilo)) errors.push("Estilo inválido.");
    if (!VALID_TRACKS.includes(trilha)) errors.push("Trilha inválida.");
    if (mensagem.length > 500) errors.push("Mensagem muito longa.");
    if (!consent) errors.push("É preciso aceitar o uso dos dados (LGPD).");

    return {
        ok: errors.length === 0,
        errors,
        clean: { nome, email, idade, estilo, trilha, mensagem },
    };
}
