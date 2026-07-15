/* ThreadLens — Side Panel logic (v0.7.0) */

const DEFAULTS = (window.TVD && window.TVD.DEFAULTS) || {};
const mergeSettings = (window.TVD && window.TVD.mergeSettings) || ((s) => Object.assign({}, DEFAULTS, s));
const NICHE_PRESETS = (window.TVD && window.TVD.NICHE_PRESETS) || {};

const S = '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">';
const ICONS = {
  heart: S + '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  comment: S + '<path d="M21 11.5a8.4 8.4 0 0 1-11.9 7.6L3 21l1.9-6.1A8.4 8.4 0 1 1 21 11.5z"/></svg>',
  repost: S + '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  share: S + '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  quote: S + '<path d="M21 11.5a8.4 8.4 0 0 1-11.9 7.6L3 21l1.9-6.1A8.4 8.4 0 1 1 21 11.5z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="13.5" x2="13" y2="13.5"/></svg>',
  open: S + '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  locate: S + '<circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/><circle cx="12" cy="12" r="2.4"/></svg>',
  search: S + '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>',
  trash: S + '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  gear: S + '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.2V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 1.2-2.7H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
  play: S + '<polygon points="6 4 20 12 6 20 6 4"/></svg>',
  pause: S + '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  copyAll: S + '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  md: S + '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 15V9l3 3 3-3v6"/><path d="M17 9v4m0 0l-2-2m2 2l2-2"/></svg>',
  xlsx: S + '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
  json: S + '<path d="M8 4a3 3 0 0 0-3 3v2a2 2 0 0 1-2 2 2 2 0 0 1 2 2v2a3 3 0 0 0 3 3"/><path d="M16 4a3 3 0 0 1 3 3v2a2 2 0 0 0 2 2 2 2 0 0 0-2 2v2a3 3 0 0 1-3 3"/></svg>',
  prompt: S + '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 14l.7 2L22 16.7l-2.3.8L19 20l-.7-2.5L16 16.7l2.3-.7L19 14z"/></svg>',
  star: S + '<polygon points="12 2.5 15 9 22 9.3 16.5 14 18.4 21 12 17 5.6 21 7.5 14 2 9.3 9 9 12 2.5"/></svg>',
  block: S + '<circle cx="12" cy="12" r="9"/><line x1="5.6" y1="5.6" x2="18.4" y2="18.4"/></svg>',
  note: S + '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  help: S + '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4"/><line x1="12" y1="17.5" x2="12" y2="17.51"/></svg>',
  text: S + '<line x1="5" y1="6" x2="19" y2="6"/><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="18" x2="13" y2="18"/></svg>',
  image: S + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg>',
  video: S + '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M22 12h-2.5M4.5 12H2M19.07 4.93l-1.77 1.77M6.7 17.3l-1.77 1.77M19.07 19.07l-1.77-1.77M6.7 6.7 4.93 4.93"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z"/></svg>',
};

let settings = mergeSettings(null);
let presets = {};
let stars = {};            // id -> { starred:bool, note:string }
let integrations = {};     // notionToken, notionDbId, todoistToken, todoistProject
let rawItems = [];
let viewItems = [];
let scrolling = false;
let connected = false;
let armClear = false, armTimer;
let _lastWriteJson = ""; // snapshot tulisan terakhir panel → bedakan dari perubahan halaman Settings

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function fillIcons(root) {
  (root || document).querySelectorAll("[data-ico]").forEach((el) => { if (ICONS[el.dataset.ico]) el.innerHTML = ICONS[el.dataset.ico]; });
}

/* ----------------------- tab + koneksi ---------------------------- */
async function getTab() { return window.TVD ? await window.TVD.getThreadsTab() : null; }
async function sendToTab(msg) {
  const tab = await getTab();
  if (!tab) return null;
  try { return await chrome.tabs.sendMessage(tab.id, { source: "tvd", ...msg }); } catch (e) { return null; }
}
async function ping() { const r = await sendToTab({ type: "command", cmd: "ping" }); return !!(r && r.pong); }
function pushSettings() { sendToTab({ type: "settings", settings }); }

function showBanner(mode) {
  const b = $("#conn-banner");
  if (!b) return;
  b.style.display = "flex";
  if (mode === "no-tab") {
    $("#conn-text").innerHTML = "Buka <b>threads.com</b> (login) dulu, lalu klik tombol di sini.";
    $("#conn-action").textContent = "Buka threads.com";
  } else {
    $("#conn-text").innerHTML = "ThreadLens belum nyambung. <b>Refresh</b> halaman Threads-nya.";
    $("#conn-action").textContent = "Refresh halaman Threads";
  }
}
function hideBanner() { const b = $("#conn-banner"); if (b) b.style.display = "none"; }

// Pastikan content script jalan; kalau tab dibuka sebelum extension di-reload, suntik manual.
async function ensureConnection() {
  const tab = await getTab();
  if (!tab) { connected = false; showBanner("no-tab"); return false; }
  if (await ping()) { connected = true; hideBanner(); return true; }
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["shared.js", "content.js"] });
    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["content.css"] });
  } catch (e) {}
  await sleep(450);
  if (await ping()) { connected = true; hideBanner(); pushSettings(); return true; }
  connected = false; showBanner("reload"); return false;
}

/* ----------------------------- storage ---------------------------- */
function save() {
  _lastWriteJson = JSON.stringify(settings);
  chrome.storage.local.set({ tvdSettings: settings });
}
function loadSettings() {
  return new Promise((res) => chrome.storage.local.get(["tvdSettings", "tvdStars", "tvdIntegrations"], (d) => {
    settings = mergeSettings(d && d.tvdSettings);
    stars = (d && d.tvdStars) || {};
    integrations = (d && d.tvdIntegrations) || {};
    res();
  }));
}
function savePresets() { chrome.storage.local.set({ tvdPresets: presets }); }
function loadPresets() {
  return new Promise((res) => chrome.storage.local.get("tvdPresets", (d) => {
    presets = (d && d.tvdPresets) || {};
    // buang preset template bawaan yang mungkin pernah ke-seed (hanya kalau belum diubah user)
    let changed = false;
    Object.keys(NICHE_PRESETS || {}).forEach((n) => {
      if (presets[n] && JSON.stringify(presets[n]) === JSON.stringify(NICHE_PRESETS[n])) { delete presets[n]; changed = true; }
    });
    if (changed) savePresets();
    res();
  }));
}
function saveStars() { chrome.storage.local.set({ tvdStars: stars }); }

/* ----------------------------- theme ------------------------------ */
function applyTheme() {
  document.body.classList.toggle("dark", settings.theme === "dark");
  $("#theme-toggle .ico").innerHTML = settings.theme === "dark" ? ICONS.sun : ICONS.moon;
}

/* --------------------------- presets ------------------------------ */
function currentPresetConfig() {
  return {
    metrics: structuredClone(settings.metrics), logic: settings.logic, dateRange: settings.dateRange,
    excludeReposts: settings.excludeReposts, excludeQuotes: settings.excludeQuotes,
    keyword: settings.keyword, keywordLogic: settings.keywordLogic,
    media: structuredClone(settings.media), minRatio: settings.minRatio, sortBy: settings.sortBy,
  };
}
function renderPresetOptions(selected) {
  const el = $("#preset");
  el.innerHTML = '<option value="">— pilih preset —</option>';
  Object.keys(presets).forEach((n) => el.appendChild(new Option(n, n)));
  if (selected != null) el.value = selected;
}
function applyPreset(name) {
  if (!name || !presets[name]) return;
  Object.assign(settings, structuredClone(presets[name]));
  if (!settings.media) settings.media = { text: true, image: true, video: true };
  save(); applySettingsToControls(); pushSettings(); applyView();
  showToast(`Preset "${name}" diterapkan`);
}

/* --------------------------- controls ----------------------------- */
function applySettingsToControls() {
  $$(".metric[data-key]").forEach((row) => {
    const k = row.dataset.key;
    row.querySelector(".m-on").checked = settings.metrics[k].on;
    row.querySelector(".m-min").value = settings.metrics[k].min;
  });
  $$("#logic button").forEach((b) => b.classList.toggle("active", b.dataset.val === settings.logic));
  $$("#keyword-logic button").forEach((b) => b.classList.toggle("active", b.dataset.val === settings.keywordLogic));
  $("#range").value = settings.dateRange;
  $("#speed").value = settings.scrollSpeed;
  $("#crawl").value = settings.crawlTarget;
  $("#exclude-reposts").checked = settings.excludeReposts;
  $("#exclude-quotes").checked = settings.excludeQuotes;
  $("#keyword").value = settings.keyword;
  $("#min-ratio").value = settings.minRatio || 0;
  $("#sort").value = settings.sortBy;
  $("#merge-threads").checked = !!settings.mergeThreads;
  $("#star-filter").setAttribute("aria-pressed", settings.starredOnly ? "true" : "false");
  $$("#media button").forEach((b) => b.classList.toggle("active", settings.media[b.dataset.media] !== false));
  applyTheme();
}

function wireControls() {
  $$(".metric[data-key]").forEach((row) => {
    const k = row.dataset.key;
    row.querySelector(".m-on").addEventListener("change", (e) => { settings.metrics[k].on = e.target.checked; save(); pushSettings(); });
    row.querySelector(".m-min").addEventListener("change", (e) => { const v = parseInt(e.target.value, 10); settings.metrics[k].min = isNaN(v) ? 0 : v; save(); pushSettings(); });
  });
  $$("#logic button").forEach((b) => b.addEventListener("click", () => { settings.logic = b.dataset.val; $$("#logic button").forEach((x) => x.classList.toggle("active", x === b)); save(); pushSettings(); }));
  $$("#keyword-logic button").forEach((b) => b.addEventListener("click", () => { settings.keywordLogic = b.dataset.val; $$("#keyword-logic button").forEach((x) => x.classList.toggle("active", x === b)); save(); pushSettings(); }));
  $$("#media button").forEach((b) => b.addEventListener("click", () => { b.classList.toggle("active"); settings.media[b.dataset.media] = b.classList.contains("active"); save(); pushSettings(); }));
  $("#range").addEventListener("change", (e) => { settings.dateRange = e.target.value; save(); pushSettings(); });
  $("#crawl").addEventListener("change", (e) => { settings.crawlTarget = e.target.value; save(); pushSettings(); updateScrollHint(); });
  $("#speed").addEventListener("input", (e) => { settings.scrollSpeed = parseInt(e.target.value, 10); save(); pushSettings(); });
  $("#exclude-reposts").addEventListener("change", (e) => { settings.excludeReposts = e.target.checked; save(); pushSettings(); });
  $("#exclude-quotes").addEventListener("change", (e) => { settings.excludeQuotes = e.target.checked; save(); pushSettings(); });
  $("#keyword").addEventListener("input", debounce((e) => { settings.keyword = e.target.value; save(); pushSettings(); applyView(); }, 350));
  $("#min-ratio").addEventListener("change", (e) => { const v = parseFloat(e.target.value); settings.minRatio = isNaN(v) ? 0 : v; save(); pushSettings(); });
  $("#sort").addEventListener("change", (e) => { settings.sortBy = e.target.value; save(); applyView(); });
  $("#merge-threads").addEventListener("change", (e) => { settings.mergeThreads = e.target.checked; save(); applyView(); });
  $("#star-filter").addEventListener("click", () => {
    settings.starredOnly = !settings.starredOnly;
    $("#star-filter").setAttribute("aria-pressed", settings.starredOnly ? "true" : "false");
    save(); applyView();
  });
  $("#search").addEventListener("input", debounce(applyView, 200));

  $("#scroll-btn").addEventListener("click", async () => {
    if (!(await ensureConnection())) return showToast("Belum nyambung — refresh halaman Threads dulu.");
    sendToTab({ type: "command", cmd: scrolling ? "stopScroll" : "startScroll" });
  });
  $("#theme-toggle").addEventListener("click", () => { settings.theme = settings.theme === "dark" ? "light" : "dark"; save(); applyTheme(); });
  $("#help").addEventListener("click", () => chrome.tabs.create({ url: chrome.runtime.getURL("help.html") }));
  $("#settings").addEventListener("click", () => chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") }));
  $("#export-md").addEventListener("click", exportMd);
  $("#export-xlsx").addEventListener("click", exportXlsx);
  $("#copy-prompt").addEventListener("click", copyPrompt);

  $("#conn-action").addEventListener("click", async () => {
    const tab = await getTab();
    if (!tab) { chrome.tabs.create({ url: "https://www.threads.com" }); return; }
    try { await chrome.tabs.reload(tab.id); } catch (e) {}
    showToast("Halaman Threads di-refresh…");
    await sleep(1500); await ensureConnection(); refreshAll();
  });

  $("#clear").addEventListener("click", () => {
    if (!armClear) {
      armClear = true;
      $("#clear").classList.add("arm");
      showToast("Klik sekali lagi untuk hapus daftar");
      clearTimeout(armTimer);
      armTimer = setTimeout(() => { armClear = false; $("#clear").classList.remove("arm"); }, 3000);
      return;
    }
    armClear = false;
    $("#clear").classList.remove("arm");
    clearTimeout(armTimer);
    rawItems = [];
    applyView();
    sendToTab({ type: "command", cmd: "clear" });
  });

  $("#preset").addEventListener("change", (e) => applyPreset(e.target.value));
  $("#preset-save").addEventListener("click", () => {
    const inp = $("#preset-name");
    const n = (inp.value || "").trim();
    if (!n) { showToast("Isi nama preset dulu"); inp.focus(); return; }
    presets[n] = currentPresetConfig();
    savePresets();
    renderPresetOptions(n);
    inp.value = "";
    showToast(`Preset "${n}" disimpan`);
  });
  $("#preset-del").addEventListener("click", () => {
    const n = $("#preset").value;
    if (!n || !presets[n]) return showToast("Pilih preset dulu");
    delete presets[n];
    savePresets();
    renderPresetOptions("");
    showToast("Preset dihapus");
  });

  $("#send-notion").addEventListener("click", () => armSend("notion"));
  $("#send-todoist").addEventListener("click", () => armSend("todoist"));
}

function updateScrollHint() { $("#scroll-hint").style.display = settings.crawlTarget === "all" ? "block" : "none"; }

/* --------------------------- scoring ------------------------------ */
function score(r) {
  const c = r.counts || {};
  return (c.likes || 0) + (c.comments || 0) * 3 + (c.reposts || 0) * 5 + (c.shares || 0) * 4;
}
function velocity(r) {
  if (r.timeMs == null || !r.counts || r.counts.likes == null) return null;
  const hrs = Math.max(5 / 60, (Date.now() - r.timeMs) / 3.6e6); // floor 5 menit → post baru nggak seragam
  return r.counts.likes / hrs;
}
function ratioOf(r) {
  const c = r.counts || {};
  if (c.likes == null || c.likes === 0 || c.comments == null) return null;
  return c.comments / c.likes;
}

/* --------------------------- rendering ---------------------------- */
function fmt(n) {
  if (n == null) return "–";
  n = Math.round(n);
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "jt";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "rb";
  return String(n);
}
function ago(ms) {
  if (ms == null) return "";
  const diff = Date.now() - ms;
  if (diff < 0) return "baru";
  const d = Math.floor(diff / 864e5);
  if (d <= 0) {
    const h = Math.floor(diff / 36e5);
    if (h <= 0) { const m = Math.floor(diff / 6e4); return m <= 1 ? "baru saja" : m + " menit lalu"; }
    return h + " jam lalu";
  }
  if (d === 1) return "kemarin";
  if (d < 7) return d + " hari lalu";
  if (d < 30) return Math.floor(d / 7) + " minggu lalu";
  return Math.floor(d / 30) + " bulan lalu";
}
function absDate(ms) {
  if (ms == null) return "";
  try { return new Date(ms).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; }
}
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function highlightKw(escaped) {
  const raw = (settings.keyword || "").trim();
  if (!raw) return escaped;
  const terms = raw.split(",").map((t) => t.trim()).filter((t) => t && !t.startsWith("-") && t.length >= 2);
  let out = escaped;
  terms.forEach((term) => {
    const re = new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    out = out.replace(re, '<strong class="kwhit">$1</strong>');
  });
  return out;
}

let toastTimer;
function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ----------------------- gabung thread 🧵 ------------------------- */
function threadMarker(snip) { return /(^|\s)(🧵|\d{1,2}\s*\/\s*\d{1,2})(\s|$)/.test(snip || ""); }
function groupThreads(items) {
  if (!settings.mergeThreads) return items;
  const byUser = {};
  const out = [];
  items.forEach((r) => {
    if (r.user && threadMarker(r.snippet)) {
      (byUser[r.user] = byUser[r.user] || []).push(r);
    } else out.push(r);
  });
  Object.keys(byUser).forEach((u) => {
    const parts = byUser[u];
    if (parts.length === 1) { out.push(parts[0]); return; }
    const sorted = parts.slice().sort((a, b) => (a.timeMs || 0) - (b.timeMs || 0));
    const merged = Object.assign({}, sorted[0]);
    merged.counts = { likes: null, comments: null, reposts: null, shares: null };
    ["likes", "comments", "reposts", "shares"].forEach((k) => {
      merged.counts[k] = Math.max(...sorted.map((p) => (p.counts && p.counts[k]) || 0)) || null;
    });
    merged.snippet = sorted.map((p) => p.snippet).join("  ·  ").slice(0, 600);
    merged.hashtags = [...new Set([].concat(...sorted.map((p) => p.hashtags || [])))].slice(0, 10);
    merged.timeMs = Math.max(...sorted.map((p) => p.timeMs || 0)) || null;
    merged._parts = sorted.length;
    merged.id = sorted[0].id;
    out.push(merged);
  });
  return out;
}

function applyView() {
  let arr = rawItems.slice();
  if (settings.starredOnly) arr = arr.filter((r) => stars[r.id] && stars[r.id].starred);
  const q = ($("#search").value || "").trim().toLowerCase();
  if (q) arr = arr.filter((r) => (r.user || "").toLowerCase().includes(q) || (r.snippet || "").toLowerCase().includes(q));
  arr = groupThreads(arr);
  const s = settings.sortBy;
  const k = { likes: "likes", comments: "comments", reposts: "reposts", shares: "shares" }[s];
  if (s === "recent") arr.sort((a, b) => (b.timeMs || 0) - (a.timeMs || 0));
  else if (s === "score") arr.sort((a, b) => score(b) - score(a));
  else if (s === "rising") arr.sort((a, b) => (velocity(b) ?? -1) - (velocity(a) ?? -1));
  else if (k) arr.sort((a, b) => (b.counts[k] || 0) - (a.counts[k] || 0));
  viewItems = arr;
  renderList(arr);
  // result count
  const rc = $("#result-count");
  if (arr.length && arr.length !== rawItems.length) rc.textContent = `menampilkan ${arr.length} dari ${rawItems.length}`;
  else rc.textContent = "";
}

function cntEl(metric, icon, val, reasons) {
  return `<span class="cnt${reasons.includes(metric) ? " hit" : ""}"><span class="ico">${icon}</span>${fmt(val)}</span>`;
}

function setEmpty(arr) {
  const empty = $("#empty");
  empty.classList.remove("scanning");
  if (arr.length) { empty.style.display = "none"; return; }
  empty.style.display = "block";
  if (!connected) { empty.innerHTML = "Belum nyambung ke <b>threads.com</b>. Lihat banner di atas."; return; }
  if (scrolling && rawItems.length === 0) { empty.classList.add("scanning"); empty.innerHTML = "Memindai feed… post viral akan muncul di sini."; return; }
  if (rawItems.length === 0) { empty.innerHTML = "Belum ada data. Buka <b>threads.com</b>, lalu tekan <b>▶ play</b> untuk mulai memindai."; return; }
  const q = ($("#search").value || "").trim();
  if (q) { empty.innerHTML = `Nggak ada hasil untuk "<b>${esc(q)}</b>".`; return; }
  if (settings.starredOnly) { empty.innerHTML = "Belum ada post yang dibintangi ⭐."; return; }
  empty.innerHTML = "Nggak ada yang lolos filter. Coba <b>longgarkan ambang</b> atau hapus keyword.";
}

let _lastSig = "";
function renderList(arr) {
  setEmpty(arr);
  const list = $("#list");
  const sig = arr.map((r) => r.id + ":" + score(r) + ":" + (r._parts || 1) + ":" + (stars[r.id] && stars[r.id].starred ? "*" : "")).join("|") + "||" + (settings.keyword || "");
  if (sig === _lastSig) return; // nggak ada perubahan → jangan rebuild (anti-flicker & jaga scroll)
  // jangan bongkar DOM saat user lagi NGETIK catatan (fokus di .item-note) → ketikan/fokus/caret aman.
  // _lastSig sengaja TIDAK di-update biar rebuild menyusul setelah blur (lihat handler blur di kartu).
  const ae = document.activeElement;
  if (ae && ae.classList && ae.classList.contains("item-note")) return;
  _lastSig = sig;
  const keepScroll = list.scrollTop;
  list.innerHTML = "";
  arr.forEach((r) => {
    const v = velocity(r);
    const reasons = r.reasons || [];
    const st = stars[r.id] || {};
    const el = document.createElement("div");
    el.className = "item" + (st.starred ? " starred" : "");
    const tags = (r.hashtags || []).map((h) => `<span class="tag" data-tag="${esc(h)}">${esc(h)}</span>`).join("");
    el.innerHTML = `
      <div class="item-top">
        <span class="item-user">@${esc(r.user || "?")}</span>
        ${r._parts ? `<span class="item-badge">🧵 ×${r._parts}</span>` : ""}
        <span class="item-time" title="${esc(absDate(r.timeMs))}">${ago(r.timeMs)}</span>
      </div>
      <div class="item-snip">${highlightKw(esc(r.snippet || ""))}</div>
      ${tags ? `<div class="tags">${tags}</div>` : ""}
      <div class="item-foot">
        <div class="item-counts">
          ${cntEl("likes", ICONS.heart, r.counts.likes, reasons)}
          ${cntEl("comments", ICONS.comment, r.counts.comments, reasons)}
          ${cntEl("reposts", ICONS.repost, r.counts.reposts, reasons)}
          ${cntEl("shares", ICONS.share, r.counts.shares, reasons)}
          ${v != null ? `<span class="vel" title="Rising: like per jam">↑${fmt(v)}/j</span>` : ""}
        </div>
        <div class="item-actions">
          <button class="locate" title="Cari di feed" aria-label="Cari di feed"><span class="ico">${ICONS.locate}</span></button>
          <button class="open" title="Buka di tab baru" aria-label="Buka di tab baru"><span class="ico">${ICONS.open}</span></button>
          <button class="star${st.starred ? " on" : ""}" title="Bintangi / simpan" aria-label="Bintangi"><span class="ico">${ICONS.star}</span></button>
          <button class="note" title="Catatan" aria-label="Catatan"><span class="ico">${ICONS.note}</span></button>
          <button class="block" title="Blokir author ini" aria-label="Blokir author"><span class="ico">${ICONS.block}</span></button>
        </div>
      </div>
      <textarea class="item-note${st.note ? " show" : ""}" placeholder="catatan ide konten…">${esc(st.note || "")}</textarea>`;

    el.querySelector(".open").addEventListener("click", () => { if (r.link) chrome.tabs.create({ url: r.link }); else showToast("Post ini nggak punya link langsung."); });
    el.querySelector(".locate").addEventListener("click", async () => {
      if (!(await ensureConnection())) return showToast("Belum nyambung — refresh halaman Threads.");
      const res = await sendToTab({ type: "command", cmd: "locate", id: r.id });
      if (res && res.seeking) showToast("Nyari postnya… (auto-scroll)");
      else if (!res || !res.ok) showToast("Post nggak ketemu di feed.");
    });
    el.querySelector(".star").addEventListener("click", (ev) => {
      stars[r.id] = stars[r.id] || {};
      stars[r.id].starred = !stars[r.id].starred;
      saveStars();
      ev.currentTarget.classList.toggle("on", stars[r.id].starred);
      el.classList.toggle("starred", stars[r.id].starred);
      if (settings.starredOnly) applyView();
    });
    const noteBox = el.querySelector(".item-note");
    el.querySelector(".note").addEventListener("click", () => { noteBox.classList.toggle("show"); if (noteBox.classList.contains("show")) noteBox.focus(); });
    noteBox.addEventListener("input", debounce((ev) => { stars[r.id] = stars[r.id] || {}; stars[r.id].note = ev.target.value; saveStars(); }, 400));
    noteBox.addEventListener("blur", () => { stars[r.id] = stars[r.id] || {}; stars[r.id].note = noteBox.value; saveStars(); setTimeout(applyView, 60); }); // flush + nyusul render yg di-skip saat fokus
    el.querySelector(".block").addEventListener("click", async () => {
      const u = (r.user || "").toLowerCase();
      if (!u) return;
      if (!settings.blockedAuthors.includes(u)) settings.blockedAuthors.push(u);
      save(); pushSettings(); // pushSettings → content applySettings (buang author terblokir). Tak perlu cmd 'block' terpisah.
      rawItems = rawItems.filter((x) => (x.user || "").toLowerCase() !== u);
      applyView();
      showToast(`@${u} diblokir — kelola di ⚙ Pengaturan.`);
    });
    el.querySelectorAll(".tag").forEach((t) => t.addEventListener("click", () => {
      settings.keyword = t.dataset.tag.replace(/^[#$]/, "");
      $("#keyword").value = settings.keyword; save(); pushSettings(); applyView();
    }));
    list.appendChild(el);
  });
  list.scrollTop = keepScroll;
}

function renderState(state) {
  if (!state) return;
  connected = state.connected !== false;
  rawItems = state.items || [];
  $("#stats").textContent = `Dipindai: ${state.stats.scanned} • Viral: ${state.stats.viral}`;
  const sel = $("#crawl");
  const cur = settings.crawlTarget;
  const wanted = ["all", ...(state.columns || []).map((c) => c.label)];
  // jaga pilihan user: kalau kolomnya lagi nggak kedeteksi (geometri/scroll), JANGAN reset ke "all" diam-diam
  if (cur !== "all" && !wanted.includes(cur)) wanted.push(cur);
  const have = Array.from(sel.options).map((o) => o.value);
  if (wanted.join("|") !== have.join("|")) {
    sel.innerHTML = "";
    sel.appendChild(new Option("Semua", "all"));
    (state.columns || []).forEach((c) => sel.appendChild(new Option(`${c.label} (${c.count})`, c.label)));
    if (cur !== "all" && !(state.columns || []).some((c) => c.label === cur)) sel.appendChild(new Option(`${cur} (tdk tampak)`, cur));
    sel.value = cur; // hormati pilihan user; pulih sendiri saat kolom kedeteksi lagi
  }
  applyView();
}

function setScrolling(on) {
  scrolling = on;
  $("#scroll-btn .ico").innerHTML = on ? ICONS.pause : ICONS.play;
  $("#scroll-btn").title = on ? "Stop auto-scroll" : "Auto-scroll";
  if (!rawItems.length) setEmpty([]);
}

/* ----------------------------- export ----------------------------- */
function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function filterSummary() {
  const onMetrics = ["likes", "comments", "reposts", "shares"].filter((k) => settings.metrics[k].on)
    .map((k) => `${k}≥${settings.metrics[k].min}`).join(` ${settings.logic} `);
  const media = ["text", "image", "video"].filter((m) => settings.media[m] !== false).join("/");
  const periode = { "1d": "1 hari", "7d": "7 hari", "30d": "30 hari", "lifetime": "semua waktu" }[settings.dateRange] || settings.dateRange;
  return {
    kriteria: onMetrics || "(tidak ada)",
    keyword: settings.keyword || "(kosong)",
    keywordLogic: settings.keywordLogic,
    periode, media,
    minRatio: settings.minRatio || 0,
    sembunyikan: [settings.excludeReposts ? "repost" : null, settings.excludeQuotes ? "requote" : null].filter(Boolean).join(", ") || "tidak",
  };
}
function buildMeta() {
  return { app: "ThreadLens", version: "0.7.0", generatedAt: new Date().toISOString(), count: viewItems.length, sort: settings.sortBy, filters: filterSummary() };
}
function exportMd() {
  if (!viewItems.length) return showToast("Belum ada post buat di-export.");
  const f = filterSummary();
  let md = `# ThreadLens — Export\n`;
  md += `_${viewItems.length} post • dibuat ${absDate(Date.now())}_\n\n`;
  md += `> **Konteks data (buat AI):** kriteria ${f.kriteria} · keyword "${f.keyword}" (${f.keywordLogic}) · periode ${f.periode} · media ${f.media} · rasio≥${f.minRatio} · sembunyikan ${f.sembunyikan} · urut ${settings.sortBy}.\n\n`;
  md += `| # | User | Skor | Like | Komen | Repost | Share | Rising/j | Rasio | Tanggal | Link |\n|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|\n`;
  viewItems.forEach((r, i) => {
    const link = r.link ? `[buka](${r.link})` : "-";
    const v = velocity(r), ratio = ratioOf(r);
    md += `| ${i + 1} | @${r.user || "?"} | ${score(r)} | ${r.counts.likes ?? ""} | ${r.counts.comments ?? ""} | ${r.counts.reposts ?? ""} | ${r.counts.shares ?? ""} | ${v != null ? Math.round(v) : ""} | ${ratio != null ? ratio.toFixed(2) : ""} | ${r.timeMs ? absDate(r.timeMs) : ""} | ${link} |\n`;
  });
  md += `\n## Teks lengkap\n`;
  viewItems.forEach((r, i) => {
    md += `\n**${i + 1}. @${r.user || "?"}**${r._parts ? ` (🧵 ${r._parts} part)` : ""} — ${(r.snippet || "").replace(/\n/g, " ")}`;
    if ((r.hashtags || []).length) md += `\n  Topik: ${r.hashtags.join(" ")}`;
    if (r.link) md += `\n  ${r.link}`;
    md += `\n`;
  });
  download(new Blob([md], { type: "text/markdown;charset=utf-8" }), `threadlens_${stamp()}.md`);
  showToast(`Export .md: ${viewItems.length} post`);
}
function exportXlsx() {
  if (!viewItems.length) return showToast("Belum ada post buat di-export.");
  const aoa = [["Username", "Skor", "Likes", "Komentar", "Repost", "Share", "Rising/jam", "Rasio", "Tanggal", "Media", "Hashtag", "Link", "Teks"]];
  viewItems.forEach((r) => {
    const v = velocity(r), ratio = ratioOf(r);
    aoa.push([
      "@" + (r.user || "?"), score(r),
      r.counts.likes, r.counts.comments, r.counts.reposts, r.counts.shares,
      v != null ? Math.round(v) : null, ratio != null ? +ratio.toFixed(2) : null,
      r.timeMs ? absDate(r.timeMs) : "", r.media || "", (r.hashtags || []).join(" "),
      r.link || "", r.snippet || "",
    ]);
  });
  download(window.makeXlsxBlob(aoa, "Viral"), `threadlens_${stamp()}.xlsx`);
  showToast(`Export .xlsx: ${viewItems.length} post`);
}
async function copyPrompt() {
  if (!viewItems.length) return showToast("Belum ada post.");
  const f = filterSummary();
  let p = `Kamu asisten riset konten. Di bawah ini ${viewItems.length} post VIRAL dari Threads yang aku kumpulkan (kriteria: ${f.kriteria}; keyword: "${f.keyword}"; periode: ${f.periode}).\n\n`;
  p += `Tugas:\n1. Identifikasi POLA kenapa post-post ini viral (hook, format, emosi, topik).\n2. Kelompokkan jadi tema/angle.\n3. Beri 10 ide konten baru (judul + hook 1 kalimat) yang aku bisa posting, gaya bahasa Indonesia santai.\n4. Tandai 3 ide paling berpotensi viral + alasannya.\n\nDATA:\n`;
  viewItems.forEach((r, i) => {
    p += `\n${i + 1}. @${r.user || "?"} | ❤${fmt(r.counts.likes)} 💬${fmt(r.counts.comments)} 🔁${fmt(r.counts.reposts)} | skor ${score(r)}${velocity(r) != null ? " | rising " + Math.round(velocity(r)) + "/j" : ""}\n   "${(r.snippet || "").replace(/\n/g, " ")}"`;
  });
  try { await navigator.clipboard.writeText(p); showToast(`Prompt AI tersalin (${viewItems.length} post) — tinggal paste ke Claude/ChatGPT`); } catch (e) { showToast("Gagal menyalin"); }
}

/* ----------------------- integrasi (Notion/Todoist) --------------- */
function refreshSendBar() {
  const hasN = integrations.notionToken && integrations.notionDbId;
  const hasT = integrations.todoistToken;
  $("#send-notion").style.display = hasN ? "inline-block" : "none";
  $("#send-todoist").style.display = hasT ? "inline-block" : "none";
  $("#send-bar").style.display = (hasN || hasT) ? "flex" : "none";
}
let _armSend = "", _armSendT;
function armSend(which) {
  if (!viewItems.length) return showToast("Belum ada hasil buat dikirim.");
  if (_armSend !== which) {
    _armSend = which;
    showToast(`Klik "${which === "notion" ? "→ Notion" : "→ Todoist"}" sekali lagi untuk kirim ${viewItems.length} post`);
    clearTimeout(_armSendT);
    _armSendT = setTimeout(() => { _armSend = ""; }, 3500);
    return;
  }
  _armSend = ""; clearTimeout(_armSendT);
  if (which === "notion") sendToNotion(); else sendToTodoist();
}
async function sendToNotion() {
  const token = integrations.notionToken, db = integrations.notionDbId;
  if (!token || !db) return showToast("Isi token & Database ID Notion di ⚙ Pengaturan.");
  showToast("Mengirim ke Notion…");
  let titleProp = "Name";
  try {
    const meta = await fetch(`https://api.notion.com/v1/databases/${encodeURIComponent(db)}`, { headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" } }).then((r) => r.json());
    if (meta && meta.properties) { const t = Object.entries(meta.properties).find(([, v]) => v.type === "title"); if (t) titleProp = t[0]; }
  } catch (e) {}
  let ok = 0, fail = 0;
  for (const r of viewItems) {
    const props = {}; props[titleProp] = { title: [{ text: { content: `@${r.user || "?"} — ${(r.snippet || "").slice(0, 80)}` } }] };
    const body = {
      parent: { database_id: db }, properties: props,
      children: [{ object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: `❤${fmt(r.counts.likes)} 💬${fmt(r.counts.comments)} 🔁${fmt(r.counts.reposts)} | skor ${score(r)}${r.link ? " | " + r.link : ""}` } }] } },
        { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: (r.snippet || "").slice(0, 1800) } }] } }],
    };
    try {
      const res = await fetch("https://api.notion.com/v1/pages", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) ok++; else fail++;
    } catch (e) { fail++; }
  }
  showToast(`Notion: ${ok} terkirim${fail ? `, ${fail} gagal` : ""}`);
}
async function sendToTodoist() {
  const token = integrations.todoistToken;
  if (!token) return showToast("Isi token Todoist di ⚙ Pengaturan.");
  showToast("Mengirim ke Todoist…");
  let projectId = null;
  if (integrations.todoistProject) {
    try {
      const projs = await fetch("https://api.todoist.com/rest/v2/projects", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
      const p = Array.isArray(projs) && projs.find((x) => (x.name || "").toLowerCase() === integrations.todoistProject.toLowerCase());
      if (p) projectId = p.id;
    } catch (e) {}
  }
  let ok = 0, fail = 0;
  for (const r of viewItems) {
    const body = { content: `Riset Threads: @${r.user || "?"} (skor ${score(r)})`, description: `${(r.snippet || "").slice(0, 400)}${r.link ? "\n" + r.link : ""}` };
    if (projectId) body.project_id = projectId;
    try {
      const res = await fetch("https://api.todoist.com/rest/v2/tasks", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) ok++; else fail++;
    } catch (e) { fail++; }
  }
  showToast(`Todoist: ${ok} terkirim${fail ? `, ${fail} gagal` : ""}`);
}

/* ------------------------------ boot ------------------------------ */
async function refreshAll() {
  const resp = await sendToTab({ type: "request-state" });
  if (resp && resp.state) { renderState(resp.state); setScrolling(!!resp.scrolling); }
  else { connected = false; setEmpty([]); }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.source !== "tvd") return;
  if (msg.type === "results") { connected = true; hideBanner(); renderState(msg.state); setScrolling(!!msg.scrolling); }
  else if (msg.type === "toast") showToast(msg.msg);
});

// sinkron kalau halaman Settings mengubah storage (hindari saling-timpa)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  // bandingkan ISI (bukan timer): abaikan kalau ini tulisan panel sendiri; proses kalau dari halaman Settings
  if (changes.tvdSettings && JSON.stringify(changes.tvdSettings.newValue) !== _lastWriteJson) {
    settings = mergeSettings(changes.tvdSettings.newValue); applySettingsToControls(); updateScrollHint(); applyView();
  }
  if (changes.tvdIntegrations) { integrations = changes.tvdIntegrations.newValue || {}; refreshSendBar(); }
  if (changes.tvdStars) { stars = changes.tvdStars.newValue || {}; }
});

(async function init() {
  await loadSettings();
  await loadPresets();
  fillIcons();
  wireControls();
  renderPresetOptions("");
  applySettingsToControls();
  setScrolling(false);
  updateScrollHint();
  refreshSendBar();
  await ensureConnection();
  if (connected) pushSettings();
  await refreshAll();
})();
