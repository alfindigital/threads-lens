/* ThreadLens — Diagnostik (v0.7.0)
   Dengerin broadcast 'results' dari content (push) + bisa minta manual (pull).
   Label dari halaman di-escape (anti-XSS) sebelum masuk innerHTML. */

const getThreadsTab = (window.TVD && window.TVD.getThreadsTab) || (async () => {
  const tabs = await chrome.tabs.query({ url: ["*://*.threads.com/*", "*://*.threads.net/*", "*://threads.com/*", "*://threads.net/*"] });
  return tabs && tabs.length ? (tabs.find((t) => t.active) || tabs[0]) : null;
});

function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

let lastText = "";

function render(st, scrolling) {
  if (!st) return;
  const s = st.stats || {};
  const d = st.diag || {};
  const statusLines = [
    `Discan/Dipindai     : ${s.scanned} post`,
    `Viral               : ${s.viral}`,
    `Waktu gagal dibaca  : ${s.unknownTime} (kalau banyak, filter tanggal/rising kurang akurat)`,
    `Repost terdeteksi   : ${s.repostDetected}  (Hide repost: ${d.excludeReposts ? "ON" : "off"} · Hide requote: ${d.excludeQuotes ? "ON" : "off"})`,
    `Filter keyword      : ${d.keyword ? '"' + d.keyword + '"' : "(kosong)"}`,
    `Filter media        : ${d.media ? JSON.stringify(d.media) : "all"}`,
    `Author diblokir     : ${d.blocked || 0}`,
    `Target kolom        : ${st.target}`,
    `Auto-scroll         : ${scrolling ? "ON" : "off"}`,
  ];
  document.getElementById("status").textContent = statusLines.join("\n");

  const colDiv = document.getElementById("columns");
  const cols = st.columns || [];
  if (!cols.length) {
    colDiv.innerHTML = '<span class="muted">Tidak ada kolom scroll terdeteksi (mungkin tampilan 1 kolom biasa — itu normal).</span>';
  } else {
    let html = "<table><tr><th>#</th><th>Label</th><th>Jumlah post</th></tr>";
    cols.forEach((c, i) => (html += `<tr><td>${i + 1}</td><td>${esc(c.label)}</td><td>${esc(c.count)}</td></tr>`));
    colDiv.innerHTML = html + "</table>";
  }

  const samples = (d.samples) || [];
  const sampleText = samples
    .map((sm, i) => {
      const c = sm.counts || {};
      const t = sm.time ? new Date(sm.time).toLocaleString() : "(waktu tidak kebaca)";
      const tags = (sm.repost ? " [REPOST]" : "") + (sm.quote ? " [QUOTE]" : "") + (sm.media ? " [" + String(sm.media).toUpperCase() + "]" : "") + (sm.user ? " @" + sm.user : "");
      return `#${i + 1}${tags}  like=${c.likes}  komen=${c.comments}  repost=${c.reposts}  share=${c.shares}\n     waktu: ${t}`;
    })
    .join("\n") || "(belum ada post kebaca — buka threads.com & scroll dikit)";
  document.getElementById("samples").textContent = sampleText;

  lastText = "=== ThreadLens Diagnostik v0.7.1 ===\n" + statusLines.join("\n") + "\n\nKolom:\n" +
    (cols.length ? cols.map((c, i) => `  ${i + 1}. ${c.label} (${c.count})`).join("\n") : "  (tidak ada)") +
    "\n\nSampel:\n" + sampleText;
}

async function refresh() {
  const statusEl = document.getElementById("status");
  const tab = await getThreadsTab();
  if (!tab) { statusEl.textContent = "Nggak nemu tab threads.com yang kebuka. Buka dulu, lalu klik lagi."; return; }
  try {
    const resp = await chrome.tabs.sendMessage(tab.id, { source: "tvd", type: "request-state" });
    if (resp && resp.state) render(resp.state, resp.scrolling);
    else statusEl.textContent = "Belum ada data. Scroll feed-nya dikit, halaman ini auto-update.";
  } catch (e) {
    statusEl.textContent = "Belum nyambung ke threads.com. REFRESH halaman Threads-nya, lalu klik lagi. (Halaman ini auto-update saat ada data.)";
  }
}

// PUSH: tiap content selesai scan, dia broadcast 'results' → halaman ini ikut ke-update
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.source === "tvd" && msg.type === "results") render(msg.state, msg.scrolling);
});

document.getElementById("refresh").addEventListener("click", refresh);
document.getElementById("copy").addEventListener("click", async () => {
  if (!lastText) { await refresh(); }
  try { await navigator.clipboard.writeText(lastText || "(belum ada data)"); const b = document.getElementById("copy"); const o = b.textContent; b.textContent = "✓ Tersalin"; setTimeout(() => (b.textContent = o), 1500); } catch (e) {}
});
refresh();
