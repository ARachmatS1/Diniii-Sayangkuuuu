/* CONFIG */
const TARGET = new Date(2005, 9, 18, 0, 0, 0); // 18 Okt 2025

/* ========== UTIL: confetti & hearts (romantic) ========== */
function createConfettiRoot() {
    let root = document.getElementById('__confetti_root');
    if (!root) {
        root = document.createElement('div');
        root.id = '__confetti_root';
        root.style.position = 'fixed';
        root.style.inset = '0';
        root.style.pointerEvents = 'none';
        root.style.zIndex = '9999';
        document.body.appendChild(root);
    }
    return root;
}

function launchConfetti(count = 80) {
    const root = createConfettiRoot();
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.left = (Math.random() * 100) + '%';
        el.style.top = '-10%';
        el.style.width = (6 + Math.random() * 16) + 'px';
        el.style.height = (12 + Math.random() * 26) + 'px';
        el.style.background = ['#ff8fb6', '#ffd8e6', '#ffd166', '#f6c1ff'][Math.floor(Math.random() * 4)];
        el.style.opacity = 0.95;
        el.style.transform = `rotate(${Math.random()*360}deg)`;
        el.style.borderRadius = '3px';
        el.style.transition = 'transform 3s linear, top 3s linear, left 3s linear, opacity 3s';
        root.appendChild(el);
        setTimeout(() => {
            el.style.top = '110%';
            el.style.left = (Math.random() * 100) + '%';
            el.style.transform = 'rotate(720deg)';
            el.style.opacity = '0';
        }, 20);
        setTimeout(() => el.remove(), 3600);
    }
}

function createHeartRoot() {
    let root = document.getElementById('__heart_root');
    if (!root) {
        root = document.createElement('div');
        root.id = '__heart_root';
        root.style.position = 'fixed';
        root.style.inset = '0';
        root.style.pointerEvents = 'none';
        root.style.zIndex = '9998';
        document.body.appendChild(root);
    }
    return root;
}

function launchHearts(count = 20) {
    const root = createHeartRoot();
    for (let i = 0; i < count; i++) {
        const h = document.createElement('div');
        h.className = '__heart';
        h.style.left = (Math.random() * 100) + '%';
        const size = 12 + Math.random() * 36;
        h.style.width = h.style.height = size + 'px';
        h.style.opacity = 0.4 + Math.random() * 0.6;
        root.appendChild(h);
        setTimeout(() => {
            h.style.transition = `transform ${4+Math.random()*3}s linear, opacity 3s`;
            h.style.transform = `translateY(120vh) rotate(${Math.random()*720}deg)`;
            h.style.opacity = '0';
        }, 60);
        setTimeout(() => h.remove(), 7000);
    }
}

/* ========== COUNT UP (Tahun, Bulan, Hari) ========== */
const START = new Date(2005, 9, 18, 0, 0, 0); // 18 Okt 2005

function updateCountupElems() {
    const now = new Date();

    // Mulai dari tahun dan bulan dulu
    let years = now.getFullYear() - START.getFullYear();
    let months = now.getMonth() - START.getMonth();
    let days = now.getDate() - START.getDate();
    let hours = now.getHours() - START.getHours();
    let minutes = now.getMinutes() - START.getMinutes();
    let seconds = now.getSeconds() - START.getSeconds();

    // Penyesuaian jika hasil negatif
    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        // cari jumlah hari di bulan sebelumnya
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += prevMonth;
        months--;
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    const txt = `${years} tahun, ${months} bulan, ${days} hari, ` +
        `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;

    // update ke semua elemen target
    document.querySelectorAll('#count-sm, #count-sm-2, #count-sm-3, #count-sm-4, #count-sm-5')
        .forEach(el => { if (el) el.textContent = txt; });
}

setInterval(updateCountupElems, 1000);
updateCountupElems();



/* ========== AUDIO AUTOPLAY BEST-EFFORT ========== */
async function initAudioAutoplay() {
    const body = document.body;
    const songPath = body.dataset.song || 'assets/music/home.mp3';
    let audio = document.getElementById('bgm');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'bgm';
        audio.preload = 'auto';
        audio.playsInline = true;
        document.body.appendChild(audio);
    }
    audio.src = songPath;
    audio.loop = true;
    audio.volume = 0.9;

    // Try: direct autoplay with sound
    try {
        await audio.play();
        // autoplay succeeded
        hideAudioOverlay();
        console.log('Autoplay succeeded (with sound).');
        // update play buttons text
        updatePlayButtons(true);
    } catch (err) {
        console.warn('Autoplay with sound blocked, trying muted autoplay...', err);
        // Try muted autoplay (muted autoplay allowed on many browsers)
        audio.muted = true;
        try {
            await audio.play();
            console.log('Muted autoplay succeeded.');
            // show overlay asking user to unmute — subtle and pretty
            showAudioOverlay();
            // attach a one-time global interaction to unmute gracefully with fade-in
            attachUnmuteOnInteraction(audio);
            updatePlayButtons(true); // audio is playing (muted)
        } catch (err2) {
            console.warn('Muted autoplay also blocked (rare). Will show overlay to user.', err2);
            showAudioOverlay();
            // still attach interaction to play/unmute
            attachUnmuteOnInteraction(audio, true);
        }
    }

    // wire explicit play buttons to toggle play/pause
    document.querySelectorAll('#playBtn,#playBtn2,#playBtn3,#playBtn4,#playBtn5,.btn-small').forEach(btn => {
        btn.addEventListener('click', async() => {
            if (audio.paused) {
                try {
                    await audio.play();
                    audio.muted = false;
                    updatePlayButtons(true);
                } catch (e) {
                    // if blocked, show overlay to request interaction
                    showAudioOverlay();
                }
            } else {
                audio.pause();
                updatePlayButtons(false);
            }
        });
    });
}

// update small icon buttons
function updatePlayButtons(isPlaying) {
    document.querySelectorAll('#playBtn,#playBtn2,#playBtn3,#playBtn4,#playBtn5,.btn-small').forEach(btn => {
        if (isPlaying) btn.textContent = '⏸️';
        else btn.textContent = '▶️';
    });
}

/* overlay helpers */
function showAudioOverlay() {
    const ov = document.getElementById('audioOverlay');
    if (!ov) return;
    ov.setAttribute('aria-hidden', 'false');
    // if user taps overlay, unmute/play will be triggered by attachUnmuteOnInteraction
}

function hideAudioOverlay() {
    const ov = document.getElementById('audioOverlay');
    if (!ov) return;
    ov.setAttribute('aria-hidden', 'true');
}

/* proceed to unmute/play on the first meaningful user interaction (tap/click/keydown/scroll) */
function attachUnmuteOnInteraction(audio, requirePlay = false) {
    // fade-in helper
    function fadeInAudio() {
        try {
            audio.muted = false;
            const startVol = 0.0;
            audio.volume = startVol;
            let v = startVol;
            const target = 0.9;
            const step = 0.05;
            const iv = setInterval(() => {
                v += step;
                if (v >= target) {
                    audio.volume = target;
                    clearInterval(iv);
                } else audio.volume = v;
            }, 120);
            hideAudioOverlay();
            updatePlayButtons(true);
        } catch (e) { console.warn(e); }
    }

    // do it once on first interaction
    const handler = async(ev) => {
        try {
            if (audio.paused && requirePlay) {
                await audio.play();
            }
            fadeInAudio();
        } catch (e) {
            console.warn('Error resuming/unmuting audio:', e);
        }
        // remove listeners after first interaction
        ['click', 'touchstart', 'keydown', 'scroll'].forEach(evName => document.removeEventListener(evName, handler));
    };

    // add listeners
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(evName => document.addEventListener(evName, handler, { once: true, passive: true }));
}

/* ========== TYPED HERO (gentle) ========== */
function typedHero() {
    const el = document.getElementById('heroTyped');
    if (!el) return;
    const texts = ['Untuk Dini — Cahaya di Hari-hariku', 'Sebuah hadiah kecil dari Rachmat', 'Selamat Ulang Tahun, Sayang'];
    let i = 0,
        j = 0,
        back = false;
    setInterval(() => {
        const current = texts[i];
        if (!back) j++;
        else j--;
        el.textContent = current.slice(0, j);
        if (j === current.length && !back) {
            back = true;
            setTimeout(() => {}, 900);
        }
        if (j === 0 && back) {
            back = false;
            i = (i + 1) % texts.length;
        }
    }, 70);
}

/* ========== GALLERY LIGHTBOX ========== */
function initGallery() {
    const grid = document.getElementById('galleryGrid') || document.getElementById('gallery');
    if (!grid) return;
    grid.addEventListener('click', (ev) => {
        const img = ev.target.closest('img');
        if (!img) return;
        const src = img.src;
        const cap = img.dataset.caption || img.alt || '';
        const lb = document.getElementById('lightbox') || document.getElementById('modal');
        if (!lb) return;
        const lbImg = document.getElementById('lbImg') || document.getElementById('modalImg');
        const lbCap = document.getElementById('lbCap') || document.getElementById('modalCaption');
        lb.style.display = 'flex';
        lbImg.src = src;
        lbCap.textContent = cap;
    });
    const lbClose = document.getElementById('lbClose') || document.getElementById('closeModal');
    if (lbClose) lbClose.addEventListener('click', () => { const lb = document.getElementById('lightbox') || document.getElementById('modal'); if (lb) lb.style.display = 'none'; });
    const lightbox = document.getElementById('lightbox') || document.getElementById('modal');
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.style.display = 'none'; });
}

/* ========== PESAN ========== */
function initPesan() {
    const gbMsg = document.getElementById('gbMsg');
    const gbSave = document.getElementById('gbSave');
    const gbClear = document.getElementById('gbClear');
    const gbList = document.getElementById('gbList');
    const KEY = 'dini_pesan_v1';

    function render() {
        const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
        if (!gbList) return;
        if (arr.length === 0) { gbList.textContent = 'Belum ada pesan — tulis yang manis dong 😏'; return; }
        gbList.innerHTML = arr.map(a => `<div style="margin-bottom:8px;padding:10px;border-radius:8px;background:linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,240,245,0.7))"><div style="font-size:13px;color:var(--muted)">${new Date(a.at).toLocaleString()}</div><div style="margin-top:6px">${a.text}</div></div>`).join('');
    }
    if (gbSave) gbSave.addEventListener('click', () => {
        const txt = gbMsg.value.trim();
        if (!txt) return alert('Tulis dulu pesannya 😅');
        const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
        arr.unshift({ text: txt, at: new Date().toISOString() });
        localStorage.setItem(KEY, JSON.stringify(arr));
        gbMsg.value = '';
        render();
        launchHearts(12);
    });
    if (gbClear) gbClear.addEventListener('click', () => {
        if (confirm('Hapus semua pesan?')) {
            localStorage.removeItem(KEY);
            render();
        }
    });
    render();
}

function initPrivateNote() {
    const note = document.getElementById('privateNote');
    const save = document.getElementById('saveNote');
    const toast = document.getElementById('noteToast');
    const KEY = 'dini_private_note_v1';
    if (!note || !save) return;
    const v = localStorage.getItem(KEY);
    if (v) note.value = v;
    save.addEventListener('click', () => {
        const t = note.value.trim();
        if (!t) {
            if (toast) {
                toast.style.display = 'block';
                toast.textContent = 'Tulis dulu pesannya 😅';
                setTimeout(() => toast.style.display = 'none', 1600);
            }
            return;
        }
        localStorage.setItem(KEY, t);
        if (toast) {
            toast.style.display = 'block';
            toast.textContent = 'Pesan tersimpan di browser 💌';
            setTimeout(() => toast.style.display = 'none', 1600);
        }
        launchHearts(8);
    });
}

/* ========== MINI-QUIZ ========== */
function initMiniQuiz() {
    const qBtn = document.getElementById('quizBtn');
    const qRes = document.getElementById('quizResult');
    if (!qBtn || !qRes) return;
    qBtn.addEventListener('click', () => {
        const msg = `Aku tau kamu suka banget:\n\n• Warna PINK 🌸\n• Bunga mawar 🌹\n• Coklat manis 🍫\n\nDi setiap pink, mawar, dan coklat — aku selalu ingat kamu, Dini. ❤️`;
        qRes.textContent = msg;
        launchHearts(20);
    });
}

/* ========== SURPRISE ========== */
function initSurprise() {
    const openGift = document.getElementById('openGift');
    if (openGift) {
        openGift.addEventListener('click', () => {
            const area = document.getElementById('giftArea');
            if (area) area.style.display = 'block';
            const link = document.getElementById('giftLinkReal');
            if (link) link.href = '#'; // ganti ke linkmu
            launchConfetti(140);
            launchHearts(60);
        });
    }
    const confBtnSur = document.getElementById('confBtnSur');
    if (confBtnSur) confBtnSur.addEventListener('click', () => {
        launchConfetti(90);
        launchHearts(40);
    });
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', async() => {
    // attempt autoplay best-effort
    await initAudioAutoplay();

    // UI & widgets
    typedHero();
    initGallery();
    initPesan();
    initPrivateNote();
    initMiniQuiz();
    initSurprise();

    // confetti / heart triggers
    document.querySelectorAll('#confBtn, #confBtnSur').forEach(b => {
        if (b) b.addEventListener('click', () => {
            launchConfetti(90);
            launchHearts(40);
        });
    });
    const heartBtn = document.getElementById('heartBtn');
    if (heartBtn) heartBtn.addEventListener('click', () => launchHearts(80));

    // auto celebrate on exact day
    setTimeout(() => {
        const now = new Date();
        if (now.getFullYear() === TARGET.getFullYear() && now.getMonth() === TARGET.getMonth() && now.getDate() === TARGET.getDate()) {
            launchConfetti(200);
            launchHearts(200);
        }
    }, 2000);

    // audio-overlay: if user taps anywhere while overlay visible, that also triggers unmute (UX)
    const overlay = document.getElementById('audioOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            // Fire global first-interaction listeners by dispatching a synthetic click on document
            const ev = new Event('click');
            document.dispatchEvent(ev); // triggers attachUnmuteOnInteraction once if present
            // hide overlay immediate UX
            overlay.setAttribute('aria-hidden', 'true');
        }, { once: true });
    }

    // mobile nav toggle
    document.querySelectorAll('.nav-toggle').forEach(t => {
        t.addEventListener('click', () => {
            const nav = document.querySelector('.navlinks');
            if (nav) nav.style.display = (nav.style.display === 'flex') ? 'none' : 'flex';
        });
    });
});