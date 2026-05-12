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

    // ========== Character counter (texto) ==========
    const textoEl = document.getElementById("texto");
    const textoCount = document.getElementById("texto-count");
    if (textoEl && textoCount) {
        const updateCount = () => { textoCount.textContent = textoEl.value.length; };
        textoEl.addEventListener("input", updateCount);
        updateCount();
    }

    // ========== Spotify search ==========
    const spotifyQuery = document.getElementById("spotify-query");
    const spotifyResults = document.getElementById("spotify-results");
    const spotifySelected = document.getElementById("spotify-selected");
    const spotifySelectedArt = document.getElementById("spotify-selected-art");
    const spotifySelectedName = document.getElementById("spotify-selected-name");
    const spotifySelectedArtist = document.getElementById("spotify-selected-artist");
    const spotifyClear = document.getElementById("spotify-clear");
    const spotifyTrackId = document.getElementById("spotify_track_id");
    const spotifyTrackName = document.getElementById("spotify_track_name");
    const spotifyArtistInput = document.getElementById("spotify_artist");
    const spotifyAlbumArt = document.getElementById("spotify_album_art");

    const setSpotifyTrack = (track) => {
        if (!track) return;
        spotifyTrackId.value = track.id;
        spotifyTrackName.value = track.name;
        spotifyArtistInput.value = track.artist;
        spotifyAlbumArt.value = track.album_art || "";
        if (spotifySelectedArt) spotifySelectedArt.src = track.album_art || "";
        if (spotifySelectedName) spotifySelectedName.textContent = track.name;
        if (spotifySelectedArtist) spotifySelectedArtist.textContent = track.artist;
        if (spotifySelected) spotifySelected.hidden = false;
        if (spotifyResults) { spotifyResults.hidden = true; spotifyResults.innerHTML = ""; }
        if (spotifyQuery) { spotifyQuery.value = ""; }
    };

    const clearSpotifyTrack = () => {
        spotifyTrackId.value = "";
        spotifyTrackName.value = "";
        spotifyArtistInput.value = "";
        spotifyAlbumArt.value = "";
        if (spotifySelected) spotifySelected.hidden = true;
    };

    if (spotifyClear) spotifyClear.addEventListener("click", clearSpotifyTrack);

    if (spotifyQuery && spotifyResults) {
        let searchTimer = null;
        let currentSearchId = 0;

        const renderTracks = (tracks) => {
            spotifyResults.innerHTML = "";
            if (!tracks.length) {
                spotifyResults.hidden = true;
                return;
            }
            tracks.forEach((track) => {
                const item = document.createElement("button");
                item.type = "button";
                item.className = "spotify-track";
                const art = track.album_art
                    ? `<img src="${track.album_art}" alt="" width="40" height="40" loading="lazy">`
                    : `<span class="spotify-track-art-fallback">♪</span>`;
                item.innerHTML = `
                    ${art}
                    <span class="spotify-track-info">
                        <strong>${escapeHtml(track.name)}</strong>
                        <span>${escapeHtml(track.artist)}</span>
                    </span>
                `;
                item.addEventListener("click", () => setSpotifyTrack(track));
                spotifyResults.appendChild(item);
            });
            spotifyResults.hidden = false;
        };

        const runSearch = async (q) => {
            const myId = ++currentSearchId;
            try {
                const r = await fetch(`/api/spotify-search?q=${encodeURIComponent(q)}`);
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data = await r.json();
                if (myId !== currentSearchId) return; // stale result
                renderTracks(data.tracks || []);
            } catch (err) {
                console.error("Erro Spotify:", err);
                if (myId === currentSearchId) {
                    spotifyResults.innerHTML = `<p class="spotify-error">Não conseguimos buscar no Spotify agora.</p>`;
                    spotifyResults.hidden = false;
                }
            }
        };

        spotifyQuery.addEventListener("input", () => {
            const q = spotifyQuery.value.trim();
            if (searchTimer) clearTimeout(searchTimer);
            if (q.length < 2) {
                spotifyResults.hidden = true;
                spotifyResults.innerHTML = "";
                return;
            }
            searchTimer = setTimeout(() => runSearch(q), 300);
        });

        document.addEventListener("click", (e) => {
            if (!spotifyResults.contains(e.target) && e.target !== spotifyQuery) {
                spotifyResults.hidden = true;
            }
        });
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
        }[c]));
    }

    // ========== Image compression (keep payload under Vercel's ~4.5MB limit) ==========
    const MAX_DIMENSION = 1600;
    const JPEG_QUALITY = 0.85;
    const SKIP_COMPRESSION_BELOW = 800 * 1024; // 800KB

    const compressImage = async (file) => {
        if (file.size < SKIP_COMPRESSION_BELOW) return file;
        let bitmap;
        try {
            bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        } catch {
            bitmap = await createImageBitmap(file);
        }
        const ratio = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
        const w = Math.round(bitmap.width * ratio);
        const h = Math.round(bitmap.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close?.();
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(b => b ? resolve(b) : reject(new Error("Falha ao comprimir imagem")), "image/jpeg", JPEG_QUALITY);
        });
        const base = file.name.replace(/\.[^.]+$/, "");
        return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
    };

    // ========== Form submit ==========
    const form = document.getElementById("presente-form");

    if (form) {
        form.addEventListener("submit", async e => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            if (files.length === 0) {
                alert("Adicione pelo menos uma foto à carta.");
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const restoreBtn = () => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Continuar para o pagamento <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
                }
            };
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Otimizando fotos…";
            }

            let compressed;
            try {
                compressed = await Promise.all(files.map(compressImage));
            } catch (err) {
                console.error("Erro ao comprimir fotos:", err);
                alert("Não conseguimos preparar suas fotos. Tente outras imagens.");
                restoreBtn();
                return;
            }

            if (submitBtn) submitBtn.textContent = "Enviando fotos…";

            let uploadInfo;
            try {
                const r = await fetch("/api/upload-urls", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        files: compressed.map(f => ({ name: f.name, mimeType: f.type })),
                    }),
                });
                if (!r.ok) {
                    const t = await r.text();
                    let msg;
                    try { msg = JSON.parse(t).error || t; } catch { msg = `Erro ${r.status} ao iniciar upload`; }
                    throw new Error(msg);
                }
                uploadInfo = await r.json();
            } catch (err) {
                console.error("Erro ao pegar URLs de upload:", err);
                alert(`Erro ao iniciar upload: ${err.message}`);
                restoreBtn();
                return;
            }

            try {
                await Promise.all(compressed.map((file, i) => {
                    const target = uploadInfo.files[i];
                    return fetch(target.signedUrl, {
                        method: "PUT",
                        headers: { "Content-Type": file.type, "x-upsert": "true" },
                        body: file,
                    }).then(resp => {
                        if (!resp.ok) throw new Error(`Falha ao enviar foto ${i + 1} (${resp.status})`);
                    });
                }));
            } catch (err) {
                console.error("Erro no upload pro Supabase:", err);
                alert(`Erro ao enviar fotos: ${err.message}`);
                restoreBtn();
                return;
            }

            if (submitBtn) submitBtn.textContent = "Finalizando…";

            const fotosPaths = uploadInfo.files.map(f => f.path);
            const payload = {
                "nome-destinatario": form.querySelector('[name="nome-destinatario"]')?.value || "",
                "nome-remetente": form.querySelector('[name="nome-remetente"]')?.value || "",
                email: form.querySelector('[name="email"]')?.value || "",
                idade: form.querySelector('[name="idade"]')?.value || "",
                texto: form.querySelector('[name="texto"]')?.value || "",
                spotify_track_id: form.querySelector('[name="spotify_track_id"]')?.value || "",
                spotify_track_name: form.querySelector('[name="spotify_track_name"]')?.value || "",
                spotify_artist: form.querySelector('[name="spotify_artist"]')?.value || "",
                spotify_album_art: form.querySelector('[name="spotify_album_art"]')?.value || "",
                fotosPaths,
            };

            try {
                const res = await fetch("/api/carta", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const text = await res.text();
                    let message;
                    try {
                        message = JSON.parse(text).error || text;
                    } catch {
                        message = `Erro ${res.status} ao processar sua carta. Tente novamente em instantes.`;
                    }
                    throw new Error(message);
                }
                const data = await res.json();
                if (data.success && data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                    return;
                }
                throw new Error(data.error || "Resposta inesperada do servidor");
            } catch (err) {
                console.error("Erro ao enviar formulário:", err);
                alert(`Erro ao processar sua carta: ${err.message}`);
                restoreBtn();
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
