(() => {
    "use strict";

    const params = new URLSearchParams(location.search);
    const orderId = params.get("id");

    const els = {
        statusBox:    document.getElementById("status"),
        statusTitle:  document.getElementById("status-title"),
        statusSub:    document.getElementById("status-sub"),
        artCard:      document.getElementById("art-card"),
        artImage:     document.getElementById("art-image"),
        artDownload:  document.getElementById("art-download"),
        videoCard:    document.getElementById("video-card"),
        videoPlayer:  document.getElementById("video-player"),
        videoDownload:document.getElementById("video-download"),
        videoWindow:  document.getElementById("video-window"),
        videoCount:   document.getElementById("video-countdown-num"),
        videoExpired: document.getElementById("video-expired"),
        errorCard:    document.getElementById("error-card"),
        errorMsg:     document.getElementById("error-msg"),
    };

    if (!orderId) {
        showError("Pedido não informado na URL.");
        return;
    }

    const STATUS_LABELS = {
        draft:            ["Aguardando pagamento", "Conclua o pagamento para começarmos."],
        awaiting_payment: ["Aguardando confirmação do pagamento", "Assim que o Mercado Pago confirmar, começamos."],
        paid:             ["Pagamento confirmado", "Nossa IA começou a pintar a sua arte…"],
        art_ready:        ["Arte pronta!", "Agora estamos montando o vídeo com narração."],
        video_ready:      ["Tudo pronto ♥", "Aproveite!"],
        failed:           ["Algo deu errado", "Entre em contato com a WLG."],
        purged:           ["Pedido encerrado", "As mídias deste pedido já foram removidas."],
    };

    function showError(msg) {
        els.statusBox.hidden = true;
        els.errorCard.hidden = false;
        els.errorMsg.textContent = msg + " Em caso de dúvida: 51 3065-6655.";
    }

    function setStatusLabel(status) {
        const [title, sub] = STATUS_LABELS[status] || ["Processando…", "Só um instante."];
        els.statusTitle.textContent = title;
        els.statusSub.textContent = sub;
    }

    let videoTimer = null;
    function startCountdown(secondsLeft) {
        if (videoTimer) clearInterval(videoTimer);
        let remaining = secondsLeft;

        const render = () => {
            if (remaining <= 0) {
                clearInterval(videoTimer);
                expireVideo();
                return;
            }
            const m = String(Math.floor(remaining / 60)).padStart(2, "0");
            const s = String(remaining % 60).padStart(2, "0");
            if (els.videoCount) els.videoCount.textContent = `${m}:${s}`;
            remaining -= 1;
        };
        render();
        videoTimer = setInterval(render, 1000);
    }

    function expireVideo() {
        if (els.videoCard) els.videoCard.hidden = true;
        if (els.videoExpired) els.videoExpired.hidden = false;
        stopPolling();
    }

    let pollHandle = null;
    function stopPolling() { if (pollHandle) { clearTimeout(pollHandle); pollHandle = null; } }

    async function fetchOnce() {
        try {
            const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
            if (res.status === 404) return showError("Pedido não encontrado.");
            const data = await res.json();
            render(data);
            if (data.status === "video_ready" || data.status === "failed" || data.status === "purged") {
                if (!data.videoUrl && data.status === "video_ready") expireVideo();
                else if (data.status !== "video_ready") stopPolling();
                else schedule(15000); // já pronto, atualiza menos
            } else {
                schedule(5000);
            }
        } catch (err) {
            console.error(err);
            schedule(8000);
        }
    }
    function schedule(ms) {
        stopPolling();
        pollHandle = setTimeout(fetchOnce, ms);
    }

    function render(data) {
        setStatusLabel(data.status);

        if (data.artUrl) {
            els.artCard.hidden = false;
            els.artImage.src = data.artUrl;
            els.artDownload.href = data.artUrl;
        }

        if (data.videoExpired) {
            expireVideo();
            return;
        }

        if (data.status === "video_ready" && data.videoUrl) {
            els.videoCard.hidden = false;
            els.videoPlayer.src = data.videoUrl;
            els.videoDownload.href = data.videoUrl;
            if (typeof data.videoSecondsLeft === "number") {
                startCountdown(data.videoSecondsLeft);
            } else if (data.videoExpiresAt) {
                const left = Math.max(0, Math.floor((new Date(data.videoExpiresAt) - new Date()) / 1000));
                startCountdown(left);
            }
            // depois que abrir o player a uma vez, esconde o estado de loading
            els.statusBox.hidden = true;
        }

        if (data.status === "failed") {
            showError(data.lastError || "Tivemos um problema ao gerar o presente.");
        }
    }

    fetchOnce();
})();
