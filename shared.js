/* =====================================================================
 * ThreadLens — shared.js (v0.7.0)
 * SATU sumber kebenaran untuk DEFAULTS + util lintas-konteks.
 * Dipakai di content script (isolated world) DAN halaman extension
 * (sidepanel/settings/advanced) — biar nggak ada lagi 3 DEFAULTS yang
 * diam-diam beda (bug lama: settings.js kehilangan excludeQuotes/sortBy).
 * ===================================================================== */
(function (root) {
  "use strict";

  const DEFAULTS = {
    theme: "light",
    metrics: {
      likes: { on: true, min: 1000 },
      comments: { on: true, min: 100 },
      reposts: { on: true, min: 100 },
      shares: { on: true, min: 100 },
    },
    logic: "OR",
    dateRange: "lifetime",
    crawlTarget: "all",
    scrollSpeed: 3,
    excludeReposts: false,
    excludeQuotes: false,
    keyword: "",
    keywordLogic: "OR",
    media: { text: true, image: true, video: true },
    minRatio: 0,
    highlightColor: "#2563eb",
    dimNonViral: false,
    maxItems: 300,
    sortBy: "recent",
    blockedAuthors: [],   // username (lowercase, tanpa @) yang disembunyikan
    mergeThreads: false,  // gabung post bersambung 1/2, 2/2 (tampilan panel)
    starredOnly: false,   // tampilkan hanya yang dibintangi
    schemaVersion: 2,
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // Merge tahan-banting: validasi tipe, isi key yang hilang dari DEFAULTS.
  function mergeSettings(saved) {
    const s = clone(DEFAULTS);
    if (!saved || typeof saved !== "object") return s;
    const scalars = [
      "theme", "logic", "dateRange", "crawlTarget", "scrollSpeed",
      "excludeReposts", "excludeQuotes", "keyword", "keywordLogic",
      "minRatio", "highlightColor", "dimNonViral", "maxItems", "sortBy",
      "mergeThreads", "starredOnly",
    ];
    for (const k of scalars) if (saved[k] != null) s[k] = saved[k];
    s.maxItems = +s.maxItems;
    if (!isFinite(s.maxItems)) s.maxItems = DEFAULTS.maxItems;
    s.maxItems = Math.max(20, Math.min(5000, Math.round(s.maxItems)));
    s.scrollSpeed = +s.scrollSpeed; if (!isFinite(s.scrollSpeed)) s.scrollSpeed = DEFAULTS.scrollSpeed;
    s.minRatio = +s.minRatio; if (!isFinite(s.minRatio)) s.minRatio = 0;
    if (!/^#[0-9a-f]{6}$/i.test(String(s.highlightColor))) s.highlightColor = DEFAULTS.highlightColor; // cuma terima hex valid
    if (Array.isArray(saved.blockedAuthors)) {
      s.blockedAuthors = saved.blockedAuthors
        .map((x) => String(x).toLowerCase().replace(/^@/, "").trim())
        .filter(Boolean);
    }
    if (saved.media && typeof saved.media === "object") {
      s.media = Object.assign({ text: true, image: true, video: true }, {
        text: saved.media.text !== false ? saved.media.text : false,
        image: saved.media.image !== false ? saved.media.image : false,
        video: saved.media.video !== false ? saved.media.video : false,
      });
      // pastikan boolean
      ["text", "image", "video"].forEach((k) => { s.media[k] = saved.media[k] !== false; });
    }
    if (saved.metrics && typeof saved.metrics === "object") {
      for (const k of ["likes", "comments", "reposts", "shares"]) {
        const m = saved.metrics[k];
        if (m && typeof m === "object") {
          if (m.on != null) s.metrics[k].on = !!m.on;
          if (m.min != null && !isNaN(+m.min)) s.metrics[k].min = +m.min;
        }
      }
    }
    return s;
  }

  // chrome.tabs hanya ada di halaman extension (bukan content script) — aman
  // karena fungsi ini cuma dipanggil dari panel/settings/advanced.
  async function getThreadsTab() {
    try {
      if (typeof chrome === "undefined" || !chrome.tabs) return null; // aman kalau ke-import dari content script
      const pats = ["*://*.threads.com/*", "*://*.threads.net/*", "*://threads.com/*", "*://threads.net/*"];
      const tabs = await chrome.tabs.query({ url: pats });
      if (!tabs || !tabs.length) return null;
      return tabs.find((t) => t.active && t.lastFocusedWindow) || tabs.find((t) => t.active) || tabs[0];
    } catch (e) { return null; }
  }

  // Preset niche siap-pakai (kriteria saja). Di-seed kalau user belum punya preset.
  const NICHE_PRESETS = {
    "Trading IDX": {
      metrics: { likes: { on: true, min: 300 }, comments: { on: true, min: 50 }, reposts: { on: true, min: 30 }, shares: { on: false, min: 20 } },
      logic: "OR", dateRange: "7d",
      excludeReposts: true, excludeQuotes: false,
      keyword: "saham, ihsg, idx, emiten, bandar, cuan, dividen, rights issue, ara, arb",
      keywordLogic: "OR",
      media: { text: true, image: true, video: true }, minRatio: 0, sortBy: "rising",
    },
    "Konten/Hook": {
      metrics: { likes: { on: true, min: 2000 }, comments: { on: true, min: 150 }, reposts: { on: true, min: 100 }, shares: { on: false, min: 50 } },
      logic: "OR", dateRange: "7d",
      excludeReposts: true, excludeQuotes: true,
      keyword: "pov, unpopular opinion, hot take, story, thread, tips, cara, kenapa, rahasia",
      keywordLogic: "OR",
      media: { text: true, image: true, video: true }, minRatio: 0.08, sortBy: "rising",
    },
    "Solopreneur": {
      metrics: { likes: { on: true, min: 800 }, comments: { on: true, min: 80 }, reposts: { on: true, min: 50 }, shares: { on: false, min: 30 } },
      logic: "OR", dateRange: "30d",
      excludeReposts: true, excludeQuotes: false,
      keyword: "bisnis, jualan, omzet, marketing, produk, branding, client, freelance, umkm, side hustle",
      keywordLogic: "OR",
      media: { text: true, image: true, video: true }, minRatio: 0, sortBy: "score",
    },
  };

  root.TVD = { DEFAULTS, clone, mergeSettings, getThreadsTab, NICHE_PRESETS };
  root.TVD_DEFAULTS = DEFAULTS; // kompat
})(typeof window !== "undefined" ? window : this);
