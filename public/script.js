(() => {
    "use strict";

    // ========== Countdown to Mother's Day (Brazil: 2nd Sunday of May) ==========
    const getNextMothersDay = () => {
        const now = new Date();
        for (let year = now.getFullYear(); year <= now.getFullYear() + 1; year++) {
            const may1 = new Date(year, 4, 1);
            const firstSundayOffset = (7 - may1.getDay()) % 7;
            const secondSunday = new Date(year, 4, 1 + firstSundayOffset + 7, 0, 0, 0);
            if (secondSunday > now) return secondSunday;
        }
        return null;
    };

    const target = getNextMothersDay();
    const cdEls = {
        days:    document.querySelector('[data-unit="days"]'),
        hours:   document.querySelector('[data-unit="hours"]'),
        minutes: document.querySelector('[data-unit="minutes"]'),
        seconds: document.querySelector('[data-unit="seconds"]'),
    };
    const pad = n => String(Math.max(0, n)).padStart(2, "0");
    const tick = () => {
        if (!target) return;
        const diff = target - new Date();
        if (diff <= 0) { Object.values(cdEls).forEach(el => el && (el.textContent = "00")); return; }
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        if (cdEls.days)    cdEls.days.textContent    = pad(days);
        if (cdEls.hours)   cdEls.hours.textContent   = pad(hours);
        if (cdEls.minutes) cdEls.minutes.textContent = pad(minutes);
        if (cdEls.seconds) cdEls.seconds.textContent = pad(seconds);
    };
    tick();
    setInterval(tick, 1000);

    // ========== Character counter ==========
    const mensagem = document.getElementById("mensagem");
    const charCount = document.getElementById("char-count");
    if (mensagem && charCount) {
        mensagem.addEventListener("input", () => { charCount.textContent = mensagem.value.length; });
    }

    // ========== Photo upload (drag & drop + preview) ==========
    const MAX_FILES = 10;
    const dropzone = document.getElementById("dropzone");
    const input = document.getElementById("fotos");
    const empty = document.getElementById("dropzone-empty");
    const preview = document.getElementById("dropzone-preview");
    let files = [];

    const renderPreview = () => {
        if (!preview || !empty) return;
        if (files.length === 0) {
            empty.hidden = false;
            preview.hidden = true;
            preview.innerHTML = "";
            return;
        }
        empty.hidden = true;
        preview.hidden = false;
        preview.innerHTML = "";
        files.forEach((file, idx) => {
            const item = document.createElement("div");
            item.className = "preview-item";
            const img = document.createElement("img");
            img.alt = file.name;
            const reader = new FileReader();
            reader.onload = e => { img.src = e.target.result; };
            reader.readAsDataURL(file);
            item.appendChild(img);
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "preview-remove";
            remove.setAttribute("aria-label", "Remover foto");
            remove.textContent = "×";
            remove.addEventListener("click", e => { e.stopPropagation(); files.splice(idx, 1); renderPreview(); });
            item.appendChild(remove);
            preview.appendChild(item);
        });
        if (files.length < MAX_FILES) {
            const add = document.createElement("button");
            add.type = "button";
            add.className = "preview-add";
            add.setAttribute("aria-label", "Adicionar mais fotos");
            add.textContent = "+";
            add.addEventListener("click", e => { e.stopPropagation(); input.click(); });
            preview.appendChild(add);
        }
    };
    const addFiles = list => {
        const incoming = Array.from(list).filter(f => f.type.startsWith("image/"));
        const room = MAX_FILES - files.length;
        files = files.concat(incoming.slice(0, room));
        renderPreview();
    };
    if (dropzone && input) {
        dropzone.addEventListener("click", () => input.click());
        input.addEventListener("change", e => addFiles(e.target.files));
        ["dragenter", "dragover"].forEach(evt =>
            dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.add("dragging"); })
        );
        ["dragleave", "drop"].forEach(evt =>
            dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.remove("dragging"); })
        );
        dropzone.addEventListener("drop", e => { if (e.dataTransfer?.files) addFiles(e.dataTransfer.files); });
    }

    // ========== Form submit: cria pedido → sobe fotos → checkout MP ==========
    const form = document.getElementById("presente-form");
    const loadingBox = document.getElementById("form-loading");
    const errorBox = document.getElementById("form-error");
    const errorMsg = document.getElementById("form-error-msg");

    const setLoading = (msg, sub = "Não feche essa janela.") => {
        if (!loadingBox) return;
        const strong = loadingBox.querySelector("strong");
        const p = loadingBox.querySelector("p");
        if (strong) strong.textContent = msg;
        if (p) p.textContent = sub;
        loadingBox.hidden = false;
    };
    const showError = msg => {
        if (!errorBox) return;
        if (errorMsg) errorMsg.textContent = msg || "Tente novamente em instantes.";
        errorBox.hidden = false;
        errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const setSubmitting = (btn, isLoading) => {
        if (!btn) return;
        btn.disabled = isLoading;
        btn.innerHTML = isLoading
            ? "Processando…"
            : 'Pagar e gerar meu presente <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    };

    if (form) {
        form.addEventListener("submit", async e => {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }
            if (files.length === 0) { showError("Suba ao menos uma foto."); return; }

            const submitBtn = form.querySelector('button[type="submit"]');
            errorBox.hidden = true;
            setSubmitting(submitBtn, true);

            try {
                // 1. Cria pedido
                setLoading("Criando seu pedido…");
                const orderPayload = {
                    nome:     form.elements["nome-mae"].value,
                    idade:    form.elements["idade"].value || null,
                    estilo:   form.elements["estilo"].value,
                    mensagem: form.elements["mensagem"].value,
                    trilha:   form.elements["trilha"].value,
                    email:    form.elements["email"].value,
                    lgpd:     form.elements["lgpd"].checked,
                };
                const createRes = await fetch("/api/orders/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderPayload),
                });
                const createData = await createRes.json().catch(() => ({}));
                if (!createRes.ok) throw new Error(createData.error || "Falha ao criar pedido.");
                const orderId = createData.id;

                // 2. Upload das fotos direto pro Vercel Blob
                setLoading(`Subindo ${files.length} foto(s)…`);
                const { upload } = await import("https://esm.sh/@vercel/blob@0.27.0/client");
                for (let i = 0; i < files.length; i++) {
                    const f = files[i];
                    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
                    await upload(`photos/${orderId}/${i}.${ext}`, f, {
                        access: "public",
                        handleUploadUrl: "/api/orders/upload",
                        clientPayload: JSON.stringify({ orderId }),
                    });
                }

                // 3. Checkout Mercado Pago
                setLoading("Abrindo o pagamento seguro…");
                const ckRes = await fetch(`/api/checkout/${orderId}`, { method: "POST" });
                const ckData = await ckRes.json().catch(() => ({}));
                if (!ckRes.ok) throw new Error(ckData.error || "Falha ao iniciar pagamento.");
                window.location.href = ckData.checkoutUrl;
            } catch (err) {
                console.error(err);
                loadingBox.hidden = true;
                showError(err.message);
                setSubmitting(submitBtn, false);
            }
        });
    }

    // ========== Reveal on scroll ==========
    const reveal = document.querySelectorAll(".step, .example, .faq details, .section-head");
    reveal.forEach(el => el.classList.add("reveal"));
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
            });
        }, { threshold: 0.12 });
        reveal.forEach(el => io.observe(el));
    } else {
        reveal.forEach(el => el.classList.add("in"));
    }
})();
