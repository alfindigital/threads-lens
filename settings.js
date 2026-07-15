/* ThreadLens — halaman Pengaturan (v0.7.0) */

const mergeSettings = (window.TVD && window.TVD.mergeSettings) || ((s) => Object.assign({}, (window.TVD && window.TVD.DEFAULTS) || {}, s || {}));
const DEFAULTS = (window.TVD && window.TVD.DEFAULTS) || {};

const $ = (s) => document.querySelector(s);
let settings = mergeSettings(null);
let integrations = {};

function load() {
  return new Promise((res) => chrome.storage.local.get(["tvdSettings", "tvdIntegrations"], (d) => {
    settings = mergeSettings(d && d.tvdSettings);
    integrations = (d && d.tvdIntegrations) || {};
    res();
  }));
}

// Anti-timpa: baca dulu storage terbaru, ubah HANYA key yang halaman ini kelola, lalu simpan.
function saveAndPush(keys) {
  chrome.storage.local.get("tvdSettings", (d) => {
    const merged = mergeSettings(d && d.tvdSettings);
    (keys || []).forEach((k) => { merged[k] = settings[k]; });
    settings = merged;
    chrome.storage.local.set({ tvdSettings: settings }, pushToTab);
  });
}
async function pushToTab() {
  if (!window.TVD) return;
  const tab = await window.TVD.getThreadsTab();
  if (tab) { try { await chrome.tabs.sendMessage(tab.id, { source: "tvd", type: "settings", settings }); } catch (e) {} }
}

let toastT;
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2000); }

function applyTheme() { document.body.classList.toggle("dark", settings.theme === "dark"); }
function fill() {
  $("#theme").value = settings.theme;
  $("#default-sort").value = settings.sortBy;
  $("#highlight-color").value = settings.highlightColor || "#2563eb";
  $("#dim").checked = !!settings.dimNonViral;
  $("#max-items").value = settings.maxItems || 300;
  $("#blocked").value = (settings.blockedAuthors || []).join(", ");
  $("#notion-token").value = integrations.notionToken || "";
  $("#notion-db").value = integrations.notionDbId || "";
  $("#todoist-token").value = integrations.todoistToken || "";
  $("#todoist-project").value = integrations.todoistProject || "";
  applyTheme();
}

function wire() {
  $("#theme").addEventListener("change", (e) => { settings.theme = e.target.value; applyTheme(); saveAndPush(["theme"]); });
  $("#default-sort").addEventListener("change", (e) => { settings.sortBy = e.target.value; saveAndPush(["sortBy"]); });
  $("#highlight-color").addEventListener("change", (e) => { settings.highlightColor = e.target.value; saveAndPush(["highlightColor"]); });
  $("#dim").addEventListener("change", (e) => { settings.dimNonViral = e.target.checked; saveAndPush(["dimNonViral"]); });
  $("#max-items").addEventListener("change", (e) => { const v = parseInt(e.target.value, 10); settings.maxItems = isNaN(v) ? 300 : Math.max(20, Math.min(5000, v)); $("#max-items").value = settings.maxItems; saveAndPush(["maxItems"]); });

  $("#save-blocked").addEventListener("click", () => {
    const list = ($("#blocked").value || "").split(/[\n,]+/).map((x) => x.toLowerCase().replace(/^@/, "").trim()).filter(Boolean);
    settings.blockedAuthors = [...new Set(list)];
    saveAndPush(["blockedAuthors"]);
    toast(`Daftar blokir disimpan (${settings.blockedAuthors.length})`);
  });

  $("#save-integrations").addEventListener("click", () => {
    integrations = {
      notionToken: $("#notion-token").value.trim(),
      notionDbId: $("#notion-db").value.trim(),
      todoistToken: $("#todoist-token").value.trim(),
      todoistProject: $("#todoist-project").value.trim(),
    };
    chrome.storage.local.set({ tvdIntegrations: integrations }, () => toast("Integrasi disimpan ✓"));
  });

  $("#export-btn").addEventListener("click", exportSettings);
  $("#import-btn").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", importSettings);
  $("#clearhist-btn").addEventListener("click", async () => {
    chrome.storage.local.remove("tvdHistory");
    if (window.TVD) { const tab = await window.TVD.getThreadsTab(); if (tab) { try { await chrome.tabs.sendMessage(tab.id, { source: "tvd", type: "command", cmd: "clear" }); } catch (e) {} } }
    toast("Riwayat dihapus");
  });
  $("#reset-btn").addEventListener("click", () => {
    settings = mergeSettings(null);
    chrome.storage.local.set({ tvdSettings: settings }, () => { fill(); pushToTab(); toast("Setelan di-reset (preset & bintang aman)"); });
  });
}

function exportSettings() {
  chrome.storage.local.get(["tvdSettings", "tvdPresets"], (d) => {
    // sengaja TANPA tvdIntegrations (token rahasia) & tanpa tvdStars
    const data = { tvdSettings: d.tvdSettings || settings, tvdPresets: d.tvdPresets || {}, _app: "ThreadLens", _v: "0.7.1" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "threadlens-settings.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
}
function importSettings(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== "object") return toast("File nggak dikenali.");
      if (data._app && data._app !== "ThreadLens") return toast("File bukan export ThreadLens.");
      const toSet = {};
      if (data.tvdSettings && typeof data.tvdSettings === "object") toSet.tvdSettings = mergeSettings(data.tvdSettings);
      if (data.tvdPresets && typeof data.tvdPresets === "object") toSet.tvdPresets = sanitizePresets(data.tvdPresets);
      if (!toSet.tvdSettings && !toSet.tvdPresets) return toast("File nggak dikenali (bukan export ThreadLens).");
      chrome.storage.local.set(toSet, () => {
        if (toSet.tvdSettings) { settings = toSet.tvdSettings; fill(); pushToTab(); }
        toast("Setelan diimpor ✓");
      });
    } catch (err) { toast("Gagal baca file (bukan JSON valid)."); }
  };
  reader.readAsText(file);
  e.target.value = "";
}

// Validasi preset dari file impor: batasi jumlah/nama & whitelist field kriteria (anti storage-bloat / setelan sewenang-wenang)
function sanitizePresets(raw) {
  const allow = ["metrics", "logic", "dateRange", "excludeReposts", "excludeQuotes", "keyword", "keywordLogic", "media", "minRatio", "sortBy"];
  const out = {};
  let n = 0;
  for (const name of Object.keys(raw)) {
    if (n >= 50) break;
    if (typeof name !== "string" || !name.trim() || name.length > 40) continue;
    const p = raw[name];
    if (!p || typeof p !== "object") continue;
    const clean = {};
    allow.forEach((k) => { if (p[k] != null) clean[k] = p[k]; });
    if (Object.keys(clean).length) { out[name] = clean; n++; }
  }
  return out;
}

(async function init() { await load(); fill(); wire(); })();
