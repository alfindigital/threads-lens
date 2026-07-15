/* =====================================================================
 * ThreadLens — content script (v0.7.0)
 *
 * Di halaman Threads: deteksi post + 4 metrik, waktu, media, hashtag,
 * kolom (header+geometri), filter (keyword OR/AND/-, media, rasio, tanggal,
 * repost/requote, blokir author), highlight, auto-scroll (auto-stop),
 * "cari di feed" (auto-seek, balikin posisi baca), riwayat lintas sesi.
 *
 * Penyetelan ada di blok CONFIG di bawah. Kalau deteksi meleset → buka
 * ⚙ → Diagnostik, lalu kasih hasilnya ke Claude.
 * ===================================================================== */

(function () {
  "use strict";
  if (window.__tvdLoaded) return;
  window.__tvdLoaded = true;

  /* ----------------------------- CONFIG ----------------------------- */
  const KW = {
    likes: ["like", "unlike", "suka", "batal suka", "disukai"],
    comments: ["comment", "reply", "replies", "komentar", "komen", "balas", "balasan", "tanggapan"],
    reposts: ["repost", "reposted", "posting ulang", "bagikan ulang", "diposting ulang"],
    shares: ["share", "send", "bagikan", "kirim", "sebarkan"],
  };
  const POST_SELECTORS = ['div[data-pressable-container="true"]', "div[data-pressable-container]", "article"];
  const COLUMN_NAMES = [
    "for you", "foryou", "for anda", "untuk anda", "following", "mengikuti",
    "liked", "disukai", "activity", "aktivitas", "search", "pencarian", "cari", "saved", "tersimpan",
  ];
  const COLUMN_IGNORE = /^(activity|aktivitas|search|pencarian|cari)/i;
  const REPOST_MARK = /reposted|diposting ulang|membagikan ulang|me-?repost|memposting ulang/i;
  // pola waktu relatif Threads: "5m" "3h" "2d" "5w" "1mo" "2y" (m = menit di header Threads)
  const REL_TIME_RE = /^\s*(\d+)\s*(s|m|h|d|w|mo|y|menit|jam|hari|minggu|bulan|tahun|detik)\b/i;
  const REL_UNIT_MS = { s: 1e3, detik: 1e3, m: 6e4, menit: 6e4, h: 36e5, jam: 36e5, d: 864e5, hari: 864e5, w: 6048e5, minggu: 6048e5, mo: 2592e6, bulan: 2592e6, y: 31536e6, tahun: 31536e6 };
  const SNIPPET_LEN = 220;
  /* ------------------------------------------------------------------ */

  const FALLBACK_DEFAULTS = {
    metrics: { likes: { on: true, min: 1000 }, comments: { on: true, min: 100 }, reposts: { on: true, min: 100 }, shares: { on: true, min: 100 } },
    logic: "OR", dateRange: "lifetime", crawlTarget: "all", scrollSpeed: 3,
    excludeReposts: false, excludeQuotes: false, keyword: "", keywordLogic: "OR",
    media: { text: true, image: true, video: true }, minRatio: 0, highlightColor: "#2563eb",
    dimNonViral: false, maxItems: 300, blockedAuthors: [], mergeThreads: false,
  };
  const TVD = window.TVD || null;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function mergeSettings(saved) { return TVD ? TVD.mergeSettings(saved) : Object.assign(clone(FALLBACK_DEFAULTS), saved || {}); }

  let settings = mergeSettings(null);
  const viralMap = new Map();      // id -> { ...data, _elRef: WeakRef }
  const dismissed = new Set();
  const seenIds = new Set();
  let lastState = { items: [], stats: { scanned: 0, viral: 0, unknownTime: 0, repostDetected: 0 }, columns: [], diag: {}, connected: true };
  let autoScroll = { on: false, timer: null, idle: 0, lastPos: -1 };
  let lastHoveredCol = null;
  let lastLocated = null;
  let seeking = false;
  let _lastScan = 0;
  let _scanQueued = false;
  let _historyDirty = false;
  let lastScrollAt = 0; // kapan terakhir user/auto scroll → di luar itu stats dibekukan (anti jitter)

  /* --------------------------- utilities ---------------------------- */
  // Parse angka tampilan Threads: "1.234" "1,234" "12rb" "1,2 jt" "1.2K" "3,4M" "2 miliar"
  function parseCount(raw) {
    if (raw == null) return null;
    let s = String(raw).toLowerCase().trim();
    const m = s.match(/(\d[\d.,]*)\s*(rb|ribu|jt|juta|miliar|mds|k|m|b)?/i);
    if (!m) return null;
    let num = m[1];
    const suf = (m[2] || "").toLowerCase();
    let mult = 1;
    if (suf === "k" || suf === "rb" || suf === "ribu") mult = 1e3;
    else if (suf === "m" || suf === "jt" || suf === "juta") mult = 1e6;
    else if (suf === "b" || suf === "miliar" || suf === "mds") mult = 1e9;

    let v;
    if (mult > 1) {
      // ada suffix → angka biasanya kecil dgn 1 desimal: "1,2" / "1.2"
      // ambil pemisah terakhir sebagai desimal kalau cuma ada satu
      const seps = num.match(/[.,]/g) || [];
      if (seps.length <= 1) v = parseFloat(num.replace(",", "."));
      else v = parseFloat(num.replace(/[.,](?=\d{3}\b)/g, "")); // banyak pemisah = ribuan
      if (isNaN(v)) return null;
      v *= mult;
    } else {
      // tanpa suffix → pemisah = ribuan (ID pakai titik, EN pakai koma)
      v = parseInt(num.replace(/[.,]/g, ""), 10);
      if (isNaN(v)) return null;
    }
    return Math.round(v);
  }
  // Token kandidat angka metrik: tolak waktu (5m), rasio (1/2), kosong; izinkan angka panjang.
  function usableToken(s) {
    if (s == null) return null;
    const t = String(s).trim();
    if (!t || t.length > 24) return null;
    // Tolak token WAKTU murni saja. 'm' sengaja TIDAK ditolak: di konteks tombol metrik,
    // "1m"/"1M" = 1 juta like (parseCount memetakan m→1e6). Timestamp tak muncul di tombol metrik.
    if (/^\d+\s*(s|h|d|w|mo|y|menit|jam|hari|minggu|bulan|tahun|detik)\s*$/i.test(t)) return null;
    if (/^\d+\s*\/\s*\d+$/.test(t)) return null;                        // "1/2"
    if (!/\d/.test(t)) return null;
    return t;
  }
  function metricOfLabel(label) {
    if (!label) return null;
    const l = label.toLowerCase();
    for (const metric of ["likes", "comments", "reposts", "shares"]) if (KW[metric].some((w) => l.includes(w))) return metric;
    return null;
  }
  function metricSvgs(root, only) {
    const out = [];
    (root || document).querySelectorAll("svg[aria-label]").forEach((s) => {
      const mt = metricOfLabel(s.getAttribute("aria-label"));
      if (mt && (!only || mt === only)) out.push(s);
    });
    return out;
  }
  function countNearSvg(svg) {
    const btn = svg.closest('a,[role="button"],button') || svg.parentElement;
    if (!btn) return null;
    const cands = [btn.getAttribute("aria-label")];
    btn.querySelectorAll("span,div").forEach((el) => { if (el.children.length === 0) cands.push(el.textContent); });
    cands.push(btn.textContent);
    // sibling HANYA kalau bukan tombol metrik lain (hindari nyomot angka tetangga)
    const sib = btn.nextElementSibling;
    if (sib && !sib.querySelector("svg[aria-label]")) cands.push(sib.textContent);
    for (const raw of cands) {
      const t = usableToken(raw);
      if (t == null) continue;
      const n = parseCount(t);
      if (n != null) return n;
    }
    return null;
  }
  // Container post: dari svg metrik APA SAJA (bukan cuma like → post tanpa like tetap kebaca)
  function postContainerFromSvg(svg) {
    for (const sel of POST_SELECTORS) { const el = svg.closest(sel); if (el) return el; }
    let el = svg;
    for (let i = 0; i < 12 && el.parentElement; i++) {
      el = el.parentElement;
      if (el.offsetHeight > 120 && el.querySelectorAll("svg[aria-label]").length >= 3) return el;
    }
    return null;
  }
  function collectContainers(root) {
    const raw = [];
    metricSvgs(root).forEach((s) => { const c = postContainerFromSvg(s); if (c) raw.push(c); });
    const uniq = Array.from(new Set(raw));
    // Batasi ke KOLOM FEED UTAMA: buang rail samping (mentions/saran/tab sebelah) via cluster posisi-x.
    // Post feed utama berbagi posisi-x yang sama; rail samping beda kolom → kebuang.
    if (uniq.length >= 4) {
      const buckets = {};
      const info = uniq.map((c) => {
        const r = c.getBoundingClientRect();
        const b = Math.round((r.left + r.width / 2) / 60);
        buckets[b] = (buckets[b] || 0) + 1;
        return { c, b };
      });
      let bestB = 0, bestN = 0;
      Object.entries(buckets).forEach(([b, n]) => { if (n > bestN) { bestN = n; bestB = +b; } });
      if (bestN >= uniq.length * 0.5) {
        return new Set(info.filter((x) => Math.abs(x.b - bestB) <= 2).map((x) => x.c)); // ±~120px dari kolom dominan
      }
    }
    return new Set(uniq);
  }
  function extractCounts(container) {
    const res = { likes: null, comments: null, reposts: null, shares: null };
    container.querySelectorAll("svg[aria-label]").forEach((s) => {
      const metric = metricOfLabel(s.getAttribute("aria-label"));
      if (!metric || res[metric] != null) return;
      const c = countNearSvg(s);
      if (c != null) res[metric] = c;
    });
    return res;
  }
  function getPermalink(c) {
    const a = c.querySelector('a[href*="/post/"]') || c.querySelector('a[href*="/t/"]');
    return a ? a.href : null;
  }
  function getUsername(c) {
    const a = c.querySelector('a[href^="/@"]');
    if (a) return a.getAttribute("href").slice(1).split("/")[0].replace(/^@/, "");
    return "";
  }
  function getSnippet(text, user) {
    let t = (text || "").replace(/\s+/g, " ").trim();
    // buang ekor angka metrik (≥2 angka berurutan dgn/ tanpa suffix) di akhir
    t = t.replace(/(?:\s+[\d.,]+(?:rb|ribu|jt|juta|k|m|b)?){2,}\s*$/i, "").trim();
    if (user) {
      const u = user.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      t = t.replace(new RegExp("^@?" + u + "\\b[\\s·:]*", "i"), "");
    }
    t = t.replace(/^[\s·]*(\d{1,2}\/\d{1,2}\/\d{2,4}|\d+\s*(?:s|m|h|d|w|mo|y|menit|jam|hari|minggu|bulan)\.?(?:\s*lalu)?)[\s·]*/i, "").trim();
    const long = t.length > SNIPPET_LEN;
    t = t.slice(0, SNIPPET_LEN).trim();
    if (long) t += " […]";
    return t;
  }
  function extractHashtags(text) {
    if (!text) return [];
    const out = [];
    const seen = new Set();
    const re = /(^|[\s(])([#$][\p{L}][\p{L}\d_]{1,30})/gu;
    let m;
    while ((m = re.exec(text)) && out.length < 8) {
      const tag = m[2];
      const key = tag.toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(tag); }
    }
    return out;
  }
  // Waktu: utamakan <time>. Fallback relatif HANYA dari elemen kecil dekat header
  // (bukan innerText seluruh post → angka di body nggak salah dibaca jadi umur).
  function getPostTime(c) {
    const t = c.querySelector("time[datetime]");
    if (t) { const d = Date.parse(t.getAttribute("datetime")); if (!isNaN(d)) return d; }
    const tt = c.querySelector("time");
    if (tt) {
      const d = Date.parse(tt.getAttribute("title") || tt.textContent);
      if (!isNaN(d)) return d;
      const rel = relTimeFromText(tt.textContent);
      if (rel != null) return rel;
    }
    // cari token waktu relatif di link/elemen kecil (header), bukan di seluruh teks
    const cand = c.querySelector('a[href*="/post/"], a[href*="/t/"]');
    if (cand) { const rel = relTimeFromText(cand.textContent); if (rel != null) return rel; }
    return null;
  }
  function relTimeFromText(s) {
    if (!s) return null;
    const str = String(s).trim();
    if (str.length > 14) return null; // token waktu selalu pendek ("2h", "3 hari")
    const m = str.match(REL_TIME_RE);
    if (!m) return null;
    const unit = m[2].toLowerCase();
    const ms = REL_UNIT_MS[unit];
    if (!ms) return null;
    return Date.now() - (+m[1]) * ms;
  }
  function isRepost(c) {
    // cek penanda repost di area header (lebih lebar dari dulu yg cuma 90 char)
    const head = (c.textContent || "").slice(0, 220);
    if (REPOST_MARK.test(head)) return true;
    // kadang ada elemen kecil khusus "X reposted"
    return false;
  }
  function isQuote(c) {
    // requote = ada post-dalam-post: nested pressable yg punya username DAN permalink
    return Array.from(c.querySelectorAll('[data-pressable-container="true"]')).some((n) => {
      if (n === c) return false;
      return n.querySelector('a[href^="/@"]') && n.querySelector('a[href*="/post/"]');
    });
  }
  function mediaTypeOf(c) {
    if (c.querySelector("video")) return "video";
    for (const im of c.querySelectorAll("img")) {
      // skip avatar: gambar di dalam link ke profil (a[href^="/@"]) atau kecil
      if (im.closest('a[href^="/@"]')) continue;
      const w = im.clientWidth || im.naturalWidth || 0;
      const h = im.clientHeight || im.naturalHeight || 0;
      if (w > 100 && h > 100) return "image";
    }
    return "text";
  }

  /* --------------------------- filters ------------------------------ */
  function dateOk(timeMs) {
    if (settings.dateRange === "lifetime") return true;
    if (timeMs == null) return true; // waktu tak terbaca → jangan buang
    const days = { "1d": 1, "7d": 7, "30d": 30 }[settings.dateRange];
    if (!days) return true;
    return Date.now() - timeMs <= days * 864e5;
  }
  function keywordOk(text) {
    const raw = (settings.keyword || "").trim();
    if (!raw) return true;
    const lc = (text || "").toLowerCase();
    const terms = raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const neg = terms.filter((t) => t.startsWith("-")).map((t) => t.slice(1)).filter(Boolean);
    const pos = terms.filter((t) => !t.startsWith("-"));
    for (const n of neg) if (lc.includes(n)) return false;
    if (!pos.length) return true;
    return settings.keywordLogic === "AND" ? pos.every((p) => lc.includes(p)) : pos.some((p) => lc.includes(p));
  }
  function mediaOk(type) {
    const m = settings.media || {};
    if (!m.text && !m.image && !m.video) return true;
    return m[type] !== false;
  }
  function ratioOk(counts) {
    const r = +settings.minRatio || 0;
    if (r <= 0) return true;
    if (counts.comments == null) return true;     // data kurang → jangan buang
    if (counts.likes == null) return true;        // data kurang → jangan buang
    if (counts.likes === 0) return counts.comments > 0; // 0 like + ada komen = rasio sangat tinggi
    return counts.comments / counts.likes >= r;
  }
  function blockedOk(user) {
    const list = settings.blockedAuthors || [];
    if (!list.length || !user) return true;
    return !list.includes(String(user).toLowerCase());
  }
  function evalEngagement(counts) {
    const checks = [];
    for (const key of ["likes", "comments", "reposts", "shares"]) {
      const m = settings.metrics[key];
      if (!m || !m.on) continue;
      const val = counts[key];
      checks.push({ key, pass: val != null && val >= m.min });
    }
    if (checks.length === 0) return { pass: false, reasons: [] };
    const pass = settings.logic === "AND" ? checks.every((c) => c.pass) : checks.some((c) => c.pass);
    return { pass, reasons: checks.filter((c) => c.pass).map((c) => c.key) };
  }

  /* ----------------------- kolom (header + geometri) ---------------- */
  function findScrollContainer(el) {
    let n = el ? el.parentElement : null;
    while (n && n !== document.body) {
      const st = getComputedStyle(n);
      if ((st.overflowY === "auto" || st.overflowY === "scroll") && n.scrollHeight > n.clientHeight + 40) return n;
      n = n.parentElement;
    }
    return null;
  }
  function scrollerUnderHeader(h) {
    let w = h.el;
    for (let i = 0; i < 5 && w.parentElement; i++) w = w.parentElement;
    let best = null, bestH = 0;
    w.querySelectorAll("div").forEach((d) => {
      const st = getComputedStyle(d);
      if ((st.overflowY === "auto" || st.overflowY === "scroll") && d.scrollHeight > d.clientHeight + 40 && d.clientHeight > bestH) { best = d; bestH = d.clientHeight; }
    });
    return best;
  }
  let _colCache = { t: 0, cols: [] };
  function detectColumns(force) {
    const now = Date.now();
    if (!force && now - _colCache.t < 4000) return _colCache.cols;
    const headers = [];
    document.querySelectorAll('h1,h2,h3,[role="heading"],span,div,a').forEach((el) => {
      if (el.children.length > 2) return;
      const t = (el.textContent || "").trim();
      if (!t || t.length > 22) return;
      const low = t.toLowerCase();
      if (COLUMN_NAMES.some((k) => low === k || low.startsWith(k + " "))) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.top < 320) headers.push({ el, t, low, rect: r });
      }
    });
    const set = new Set();
    metricSvgs(document, "likes").forEach((s) => { const c = findScrollContainer(s); if (c) set.add(c); });
    const cols = Array.from(set).map((el) => ({ el, rect: el.getBoundingClientRect(), count: metricSvgs(el, "likes").length, label: null }));
    cols.forEach((c) => {
      let best = null, bestDist = Infinity;
      headers.forEach((h) => {
        const hcx = h.rect.left + h.rect.width / 2;
        if (hcx >= c.rect.left - 20 && hcx <= c.rect.right + 20 && h.rect.top <= c.rect.top + 8) {
          const dist = c.rect.top - h.rect.bottom;
          if (dist >= -40 && dist < bestDist) { bestDist = dist; best = h.t; }
        }
      });
      c.label = best;
    });
    headers.forEach((h) => {
      if (cols.find((c) => c.label && c.label.toLowerCase() === h.low)) return;
      const el = scrollerUnderHeader(h);
      cols.push({ el, rect: el ? el.getBoundingClientRect() : h.rect, count: el ? metricSvgs(el, "likes").length : 0, label: h.t });
    });
    let out = cols.filter((c) => !COLUMN_IGNORE.test(c.label || ""));
    out.sort((a, b) => a.rect.left - b.rect.left);
    let idx = 0;
    out.forEach((c) => { idx++; if (!c.label) c.label = "Kolom " + idx; });
    const seen = {};
    out.forEach((c) => { if (seen[c.label]) { seen[c.label]++; c.label += " " + seen[c.label]; } else seen[c.label] = 1; });
    _colCache = { t: now, cols: out };
    return out;
  }
  function findColumnEl(label) {
    const c = detectColumns().find((x) => x.label.toLowerCase() === String(label).toLowerCase());
    return c ? c.el : null;
  }
  // Kontainer scroll dgn post terbanyak = feed utama (bukan sidebar/rail mention).
  function getMainFeed() {
    const conts = new Map();
    metricSvgs(document, "likes").forEach((s) => { const c = findScrollContainer(s); if (c) conts.set(c, (conts.get(c) || 0) + 1); });
    let best = null, bestN = 0;
    conts.forEach((n, el) => { if (n > bestN) { bestN = n; best = el; } });
    return best;
  }
  function getScanRoot() {
    if (settings.crawlTarget && settings.crawlTarget !== "all") {
      const el = findColumnEl(settings.crawlTarget);
      if (el) return el;
    }
    return getMainFeed() || document.querySelector("main") || document; // default: feed utama, bukan seluruh halaman
  }

  /* --------------------------- highlight ---------------------------- */
  function hexA(hex, a) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    if (!m) return "rgba(37,99,235," + a + ")";
    return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
  }
  function applyHighlight(el) {
    const col = settings.highlightColor || "#2563eb";
    el.dataset.tvdViral = "1";
    el.style.outline = "2px solid " + col;       // ring lebih tipis (dulu 3px) biar feed nggak sumpek
    el.style.outlineOffset = "1px";
    el.style.borderRadius = "10px";
    el.style.boxShadow = "0 0 0 2px " + hexA(col, 0.18);
    el.style.opacity = "";
    delete el.dataset.tvdDim;
  }
  function removeHighlight(el) {
    if (el.dataset.tvdViral === "1") {
      delete el.dataset.tvdViral;
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.boxShadow = "";
      if (el === lastLocated) lastLocated = null;
    }
  }
  function clearAllHighlights() {
    document.querySelectorAll('[data-tvd-viral="1"]').forEach(removeHighlight);
    lastLocated = null;
  }
  function clearAllDim() {
    document.querySelectorAll("[data-tvd-dim]").forEach((el) => { el.style.opacity = ""; delete el.dataset.tvdDim; });
  }
  function setLocatedHighlight(el) {
    const col = settings.highlightColor || "#2563eb";
    if (lastLocated && lastLocated !== el && lastLocated.dataset.tvdViral === "1") {
      lastLocated.style.outline = "2px solid " + col;
      lastLocated.style.boxShadow = "0 0 0 2px " + hexA(col, 0.18);
    }
    el.dataset.tvdViral = "1";
    el.style.outline = "4px solid " + col;             // BIRU brand (dulu kuning #f5c518)
    el.style.outlineOffset = "2px";
    el.style.borderRadius = "10px";
    el.style.boxShadow = "0 0 0 6px " + hexA(col, 0.45);
    el.style.opacity = "";
    delete el.dataset.tvdDim;
    el.classList.remove("tvd-flash"); void el.offsetWidth; el.classList.add("tvd-flash"); // retrigger animasi
    lastLocated = el;
  }

  /* --------------------------- main scan ---------------------------- */
  function normSnippet(s) { return (s || "").toLowerCase().replace(/\s+/g, " ").replace(/\s*\[…\]\s*$/, "").trim().slice(0, 40); }
  function idFor(c, user, snippet) {
    const link = getPermalink(c);
    if (link) return link;
    return "snip:" + user + ":" + normSnippet(snippet);
  }
  function elRef(c) { try { return new WeakRef(c); } catch (e) { return { deref: () => c }; } }

  function requestScan(force) {
    // Kalau lagi IDLE (nggak auto-scroll & nggak baru scroll manual) → JANGAN scan ulang.
    // Ini yang bikin "Dipindai/Viral" TETAP, nggak berubah-ubah sendiri. Hanya berubah saat scroll.
    if (!force && !autoScroll.on && Date.now() - lastScrollAt > 1500) return;
    if (_scanQueued) return;
    const dt = Date.now() - _lastScan;
    if (dt >= 450) { processPosts(); return; }
    _scanQueued = true;
    setTimeout(() => { _scanQueued = false; processPosts(); }, 450 - dt);
  }

  function processPosts() {
    _lastScan = Date.now();
    const root = getScanRoot();
    const containers = collectContainers(root);

    let unknownTime = 0, repostDetected = 0;
    const samples = [];

    containers.forEach((c) => {
      const text = c.innerText || "";        // baca SEKALI per post (dulu 3x)
      const user = getUsername(c);
      const snippet = getSnippet(text, user);
      const counts = extractCounts(c);
      const time = getPostTime(c);
      const repost = isRepost(c);
      const quote = isQuote(c);
      const mtype = mediaTypeOf(c);
      const hashtags = extractHashtags(text);
      const id = idFor(c, user, snippet);
      seenIds.add(id);
      if (time == null) unknownTime++;
      if (repost) repostDetected++;
      if (samples.length < 6) samples.push({ counts, time, repost, quote, media: mtype, user });

      const eng = evalEngagement(counts);
      let viral = eng.pass && dateOk(time) && keywordOk(text) && mediaOk(mtype) && ratioOk(counts) && blockedOk(user);
      if (viral && settings.excludeReposts && repost) viral = false;
      if (viral && settings.excludeQuotes && quote) viral = false;

      if (viral) {
        if (dismissed.has(id)) { if (c !== lastLocated) removeHighlight(c); return; }
        if (c !== lastLocated) applyHighlight(c);
        const data = { id, link: getPermalink(c), user, counts, reasons: eng.reasons, snippet, timeMs: time, repost, quote, media: mtype, hashtags };
        const rec = viralMap.get(id);
        if (!rec) {
          viralMap.set(id, Object.assign({}, data, { _elRef: elRef(c) }));
          _historyDirty = true;
          while (viralMap.size > (settings.maxItems || 300)) viralMap.delete(viralMap.keys().next().value);
        } else {
          // refresh recency: hapus+set lagi → eviction FIFO buang yg benar2 paling lama
          viralMap.delete(id);
          viralMap.set(id, Object.assign(rec, data, { _elRef: elRef(c) }));
          _historyDirty = true;
        }
      } else {
        if (c !== lastLocated) removeHighlight(c);
        if (settings.dimNonViral) { c.style.opacity = "0.45"; c.dataset.tvdDim = "1"; }
        else if (c.dataset.tvdDim) { c.style.opacity = ""; delete c.dataset.tvdDim; }
      }
    });

    const cols = detectColumns().map((c) => ({ label: c.label, count: c.count }));
    const items = Array.from(viralMap.values()).reverse().map(({ _elRef, ...rest }) => rest);
    lastState = {
      items,
      stats: { scanned: seenIds.size, viral: viralMap.size, unknownTime, repostDetected },
      columns: cols,
      diag: { samples, columns: cols, excludeReposts: settings.excludeReposts, excludeQuotes: settings.excludeQuotes, keyword: settings.keyword, media: settings.media, blocked: (settings.blockedAuthors || []).length },
      target: settings.crawlTarget,
      connected: true,
    };
    broadcast();
    saveHistory();
  }

  // Ganti filter: re-scan + re-highlight, TAPI JANGAN hapus koleksi/riwayat (bug lama #1).
  function applySettings(newSettings) {
    settings = mergeSettings(newSettings);
    // buang dari koleksi author yang baru diblokir (biar langsung hilang)
    const blocked = settings.blockedAuthors || [];
    if (blocked.length) {
      for (const [id, rec] of viralMap) {
        if (rec.user && blocked.includes(String(rec.user).toLowerCase())) { viralMap.delete(id); _historyDirty = true; }
      }
    }
    clearAllDim();
    processPosts();
  }

  function rescanAll() {
    dismissed.clear();
    seenIds.clear();
    clearAllHighlights();
    clearAllDim();
    viralMap.clear();
    _historyDirty = true;
    try { chrome.storage.local.remove("tvdHistory"); } catch (e) {}
    processPosts();
  }
  function clearList() {
    viralMap.forEach((r) => dismissed.add(r.id));
    clearAllHighlights();
    viralMap.clear();
    seenIds.clear();          // biar "Dipindai" ikut nol setelah Bersihkan (bukan nyisa angka riwayat)
    _historyDirty = true;
    try { chrome.storage.local.remove("tvdHistory"); } catch (e) {}
    processPosts();
  }

  let _saveT;
  function saveHistory() {
    if (!_historyDirty) return;
    clearTimeout(_saveT);
    _saveT = setTimeout(() => {
      _historyDirty = false;
      try {
        const items = Array.from(viralMap.values()).map(({ _elRef, ...r }) => r);
        chrome.storage.local.set({ tvdHistory: items }, () => {
          if (chrome.runtime.lastError) toast("Riwayat kepenuhan — turunkan 'Maks item' di ⚙ Pengaturan.");
        });
      } catch (e) {}
    }, 1500);
  }

  /* --------------------------- auto-scroll -------------------------- */
  function scrollTargetEl() {
    if (settings.crawlTarget && settings.crawlTarget !== "all") {
      const el = findColumnEl(settings.crawlTarget);
      if (el) return el;
    }
    if (lastHoveredCol && document.contains(lastHoveredCol)) return lastHoveredCol;
    return null;
  }
  function startScroll() {
    if (autoScroll.on) return;
    autoScroll.on = true;
    autoScroll.idle = 0;
    autoScroll.lastPos = -1;
    const tick = () => {
      const step = 120 + settings.scrollSpeed * 150;
      const el = scrollTargetEl();
      const pos = el ? el.scrollTop : window.scrollY;
      const sh = el ? el.scrollHeight : document.documentElement.scrollHeight;
      if (el) el.scrollBy(0, step); else window.scrollBy(0, step);
      requestScan();
      // auto-stop pakai sinyal SINKRON (bukan viralMap.size yang async): posisi gerak ATAU konten baru ke-load
      const newPos = el ? el.scrollTop : window.scrollY;
      const newSh = el ? el.scrollHeight : document.documentElement.scrollHeight;
      const progressed = Math.abs(newPos - pos) > 2 || newSh > sh + 4;
      if (!progressed) autoScroll.idle++; else autoScroll.idle = 0;
      if (autoScroll.idle >= 8) { stopScroll(); toast("Auto-scroll selesai — feed sudah mentok bawah."); }
    };
    autoScroll.timer = setInterval(tick, Math.max(180, 820 - settings.scrollSpeed * 120));
    broadcast();
  }
  function stopScroll() { autoScroll.on = false; if (autoScroll.timer) clearInterval(autoScroll.timer); autoScroll.timer = null; broadcast(); }
  function restartScrollIfRunning() { if (autoScroll.on) { stopScroll(); startScroll(); } }

  /* ----------------------- cari di feed (auto-seek) ----------------- */
  function findPostEl(rec) {
    const e = rec._elRef && rec._elRef.deref && rec._elRef.deref();
    if (e && document.contains(e)) return e;
    if (rec.link) {
      try {
        const path = new URL(rec.link).pathname;
        let a = document.querySelector('a[href="' + CSS.escape(path) + '"]');
        if (!a) {
          for (const x of document.querySelectorAll('a[href*="/post/"]')) { if (x.href.indexOf(path) >= 0) { a = x; break; } }
        }
        if (a) for (const sel of POST_SELECTORS) { const c = a.closest(sel); if (c) return c; }
      } catch (e2) {}
    }
    return null;
  }
  function goTo(el, rec) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setLocatedHighlight(el); rec._elRef = elRef(el); }
  function seekTo(rec) {
    if (seeking) return;
    seeking = true;
    const cont = scrollTargetEl();
    const restorePos = cont ? cont.scrollTop : window.scrollY;  // ingat posisi baca user
    if (cont) cont.scrollTop = 0; else window.scrollTo(0, 0);
    let steps = 0;
    const max = 45;
    const done = () => { seeking = false; };
    const stepFn = () => {
      const el = findPostEl(rec);
      if (el) { done(); goTo(el, rec); return; }
      if (steps++ >= max) {
        done();
        if (cont) cont.scrollTo({ top: restorePos }); else window.scrollTo({ top: restorePos }); // balikin posisi baca
        toast("Post nggak ketemu — feed mungkin udah ke-refresh. Posisi baca dikembalikan.");
        return;
      }
      const amt = (cont ? cont.clientHeight : window.innerHeight) * 0.85;
      if (cont) cont.scrollBy(0, amt); else window.scrollBy(0, amt);
      setTimeout(stepFn, 100);
    };
    setTimeout(stepFn, 90);
    setTimeout(() => { if (seeking) seeking = false; }, 8000); // safety: flag nggak nyangkut
  }
  function locate(id) {
    const rec = viralMap.get(id);
    if (!rec) return { ok: false };
    const el = findPostEl(rec);
    if (el) { goTo(el, rec); return { ok: true }; }
    seekTo(rec);
    return { ok: true, seeking: true };
  }

  /* ----------------------- navigasi SPA Threads --------------------- */
  function onRouteChange() {
    _colCache = { t: 0, cols: [] };
    lastHoveredCol = null;
    // buang highlight node lama yang udah nggak relevan di halaman baru
    document.querySelectorAll('[data-tvd-viral="1"]').forEach((el) => { if (!document.contains(el)) removeHighlight(el); });
    setTimeout(() => requestScan(), 400);
  }
  function hookHistory() {
    const wrap = (fn) => function () { const r = fn.apply(this, arguments); try { onRouteChange(); } catch (e) {} return r; };
    try { history.pushState = wrap(history.pushState); history.replaceState = wrap(history.replaceState); } catch (e) {}
    window.addEventListener("popstate", onRouteChange);
    let lastPath = location.pathname;
    setInterval(() => { if (location.pathname !== lastPath) { lastPath = location.pathname; onRouteChange(); } }, 1200);
  }

  /* --------------------------- messaging ---------------------------- */
  function broadcast() {
    try { chrome.runtime.sendMessage({ source: "tvd", type: "results", state: lastState, scrolling: autoScroll.on }); } catch (e) {}
  }
  function toast(msg) { try { chrome.runtime.sendMessage({ source: "tvd", type: "toast", msg }); } catch (e) {} }

  try {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (!msg || msg.source !== "tvd") return;
      if (msg.type === "settings") { applySettings(msg.settings); restartScrollIfRunning(); }
      else if (msg.type === "command") {
        if (msg.cmd === "startScroll") startScroll();
        else if (msg.cmd === "stopScroll") stopScroll();
        else if (msg.cmd === "rescan") rescanAll();
        else if (msg.cmd === "clear") clearList();
        else if (msg.cmd === "dismiss") { if (msg.id) { dismissed.add(msg.id); viralMap.delete(msg.id); _historyDirty = true; processPosts(); } }
        else if (msg.cmd === "block") {
          const u = String(msg.user || "").toLowerCase().replace(/^@/, "");
          if (u && !settings.blockedAuthors.includes(u)) {
            settings.blockedAuthors.push(u);
            try { chrome.storage.local.set({ tvdSettings: settings }); } catch (e) {} // self-sufficient: persist
            applySettings(settings);
          }
        }
        else if (msg.cmd === "locate") { sendResponse(locate(msg.id)); return true; }
        else if (msg.cmd === "ping") { sendResponse({ pong: true }); return true; }
      } else if (msg.type === "request-state") { sendResponse({ state: lastState, scrolling: autoScroll.on, settings }); return true; }
    });
  } catch (e) {}

  /* ------------------------------ boot ------------------------------ */
  function boot() {
    document.addEventListener("mousemove", (e) => {
      const now = Date.now();
      if (now - (window.__tvdHovT || 0) < 250) return;
      window.__tvdHovT = now;
      const c = findScrollContainer(e.target);
      if (c) lastHoveredCol = c;
    }, true);
    // scroll manual (kolom manapun, capture) → tandai aktif + scan; di luar ini stats beku
    window.addEventListener("scroll", () => { lastScrollAt = Date.now(); requestScan(); }, true);
    hookHistory();
    processPosts();
    setInterval(requestScan, 1300);
    const mo = new MutationObserver(() => { clearTimeout(window.__tvdMoT); window.__tvdMoT = setTimeout(requestScan, 600); });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  try {
    chrome.storage.local.get(["tvdSettings", "tvdHistory"], (d) => {
      settings = mergeSettings(d && d.tvdSettings);
      if (d && Array.isArray(d.tvdHistory)) d.tvdHistory.forEach((it) => {
        if (it && it.id) { viralMap.set(it.id, Object.assign({}, it, { _elRef: null })); seenIds.add(it.id); }
      });
      boot();
    });
  } catch (e) { boot(); }
})();
