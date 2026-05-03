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
        if (diff <= 0) {
            Object.values(cdEls).forEach(el => el && (el.textContent = "00"));
            return;
        }
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
        mensagem.addEventListener("input", () => {
            charCount.textContent = mensagem.value.length;
        });
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
            remove.addEventListener("click", e => {
                e.stopPropagation();
                files.splice(idx, 1);
                renderPreview();
            });
            item.appendChild(remove);
            preview.appendChild(item);
        });

        if (files.length < MAX_FILES) {
            const add = document.createElement("button");
            add.type = "button";
            add.className = "preview-add";
            add.setAttribute("aria-label", "Adicionar mais fotos");
            add.textContent = "+";
            add.addEventListener("click", e => {
                e.stopPropagation();
                input.click();
            });
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
            dropzone.addEventListener(evt, e => {
                e.preventDefault();
                dropzone.classList.add("dragging");
            })
        );
        ["dragleave", "drop"].forEach(evt =>
            dropzone.addEventListener(evt, e => {
                e.preventDefault();
                dropzone.classList.remove("dragging");
            })
        );
        dropzone.addEventListener("drop", e => {
            if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
        });
    }

    // ========== Form submit (chama o endpoint /api/generate que usa gpt-image-1) ==========
    const form = document.getElementById("presente-form");
    const loadingBox = document.getElementById("form-loading");
    const errorBox = document.getElementById("form-error");
    const errorMsg = document.getElementById("form-error-msg");
    const resultBox = document.getElementById("form-result");
    const resultImage = document.getElementById("result-image");
    const resultDownload = document.getElementById("result-download");

    const setSubmitting = (btn, isLoading) => {
        if (!btn) return;
        btn.disabled = isLoading;
        btn.innerHTML = isLoading
            ? 'Gerando sua arte…'
            : 'Gerar meu presente com IA <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    };

    const showError = msg => {
        if (!errorBox) return;
        if (errorMsg) errorMsg.textContent = msg || "Tente novamente em instantes.";
        errorBox.hidden = false;
        errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const showResult = imageData => {
        if (!resultBox || !resultImage) return;
        resultImage.src = imageData;
        if (resultDownload) resultDownload.href = imageData;
        resultBox.hidden = false;
        resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    if (form) {
        form.addEventListener("submit", async e => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (errorBox) errorBox.hidden = true;
            if (resultBox) resultBox.hidden = true;
            if (loadingBox) loadingBox.hidden = false;
            setSubmitting(submitBtn, true);

            try {
                const fd = new FormData();
                fd.append("nome", form.elements["nome-mae"].value || "");
                fd.append("idade", form.elements["idade"].value || "");
                fd.append("estilo", form.elements["estilo"].value || "ia");
                fd.append("mensagem", form.elements["mensagem"].value || "");
                fd.append("trilha", form.elements["trilha"].value || "narracao");
                fd.append("email", form.elements["email"].value || "");
                files.forEach(file => fd.append("fotos", file, file.name));

                const res = await fetch("/api/generate", { method: "POST", body: fd });
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.error || `Falha (HTTP ${res.status}).`);
                }
                if (!data.image) {
                    throw new Error("A IA não retornou imagem.");
                }
                showResult(data.image);
            } catch (err) {
                console.error(err);
                showError(err.message);
            } finally {
                if (loadingBox) loadingBox.hidden = true;
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
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        reveal.forEach(el => io.observe(el));
    } else {
        reveal.forEach(el => el.classList.add("in"));
    }
})();
