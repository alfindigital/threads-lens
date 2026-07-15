# ThreadLens 🔎

**Chrome extension (Manifest V3) buat mendeteksi & menyorot post viral di [Threads](https://www.threads.com) — langsung dari Side Panel Chrome.** Atur ambang engagement kamu sendiri (like / komentar / repost / share), filter, skor, lalu export hasilnya buat riset konten.

> **EN:** A Chrome side-panel extension that detects and highlights viral posts on Threads based on your own engagement thresholds — filter, score, and export results for content research. **100% local, no server, no tracking.**

![license](https://img.shields.io/badge/license-MIT-blue) ![manifest](https://img.shields.io/badge/Manifest-V3-informational) ![vanilla](https://img.shields.io/badge/JS-vanilla%20·%20no%20build-success)

---

## ✨ Fitur

- **4 metrik** (Like / Komentar / Repost / Share) — tiap metrik on/off + ambang sendiri, logika **OR / AND**.
- **Highlight otomatis** di feed + **daftar** post viral yang bisa diklik.
- **Filter**: periode (1/7/30 hari), keyword (OR/AND, `-` exclude), media (teks/gambar/video), rasio komen÷like, blokir author.
- **Skor** (`like + komen×3 + repost×5 + share×4`) & **Rising** (like/jam) buat nemu yang lagi naik daun.
- **Auto-scroll** (berhenti sendiri saat mentok) + **cari di feed** (loncat ke postnya).
- **Bintangi + catatan** per post, **gabung thread 🧵** (post bersambung jadi 1), **chip hashtag**.
- **Export**: Copy-Prompt (siap tempel ke AI), `.md`, `.xlsx`. **Preset** kriteria. Riwayat lintas sesi.
- **Integrasi opsional**: kirim hasil ke **Notion** / **Todoist** (pakai token sendiri).
- **Tema terang/gelap**, aksesibilitas (fokus keyboard, aria-label).

## 📥 Install (Developer Mode)

Belum dipublish ke Chrome Web Store — pasang manual:

1. **Download / clone** repo ini ke komputer kamu.
2. Buka **`chrome://extensions`** → nyalakan **Developer mode** (kanan atas).
3. Klik **Load unpacked** → pilih **folder repo ini** (folder yang ada `manifest.json`-nya).
4. Buka **[threads.com](https://www.threads.com)** dan login → klik ikon **ThreadLens** di toolbar → panel muncul di kanan.

> Setiap kali ada update kode: `chrome://extensions` → tombol **⟳ reload** di kartu ThreadLens → refresh threads.com.

## ▶️ Cara pakai

1. Atur **Kriteria viral** (ambang tiap metrik) + `OR`/`AND`.
2. Tekan **▶ play** buat auto-scroll — post viral di-highlight & masuk daftar. *(Di tampilan banyak kolom, pilih 1 kolom dulu.)*
3. Tiap kartu: **◎ cari di feed · ↗ buka · ★ bintangi · ✎ catatan · ⦸ blokir author**.
4. Export via footer: **Prompt AI / MD / XLSX**. Buka **⚙ Set** buat Pengaturan, **?** buat Tutorial.

## 🔒 Privasi

Semua jalan di browser kamu. **Tidak ada data yang dikirim ke server mana pun.** Satu-satunya koneksi keluar adalah integrasi **opsional** Notion/Todoist — hanya jika kamu mengisi token sendiri di Pengaturan (token disimpan lokal & **tidak** ikut saat export setelan).

## 🧠 Cara kerja (teknis)

Vanilla JS, **tanpa build step, tanpa dependency**. Content script (`content.js`) membaca feed Threads lewat `aria-label` pada ikon metrik (dukung teks Indonesia & Inggris), mendeteksi kolom via header + geometri, lalu meng-highlight post yang lolos kriteria. UI ada di Chrome Side Panel. `shared.js` = satu sumber DEFAULTS + util. Generator `.xlsx` (`vendor/xlsx-mini.js`) bikin file Excel asli tanpa internet.

Struktur: `manifest.json` · `background.js` · `shared.js` · `content.js` · `content.css` · `sidepanel.*` · `settings.*` · `advanced.*` · `help.html` · `theme-init.js` · `vendor/` · `icons/`.

## ⚠️ Batasan & bug diketahui

Lihat **[KNOWN-ISSUES.md](KNOWN-ISSUES.md)** — a.l. deteksi kolom bergantung markup Threads (bisa berubah sewaktu-waktu) dan perlu kalibrasi. Kalau deteksi meleset: **⚙ Set → Diagnostik → Salin diagnostik**.

## 🗺️ Roadmap

Lihat **[ROADMAP.md](ROADMAP.md)** buat rencana & ide ke depan.

## 🤝 Kontribusi

Issue & PR welcome. Karena ini vanilla JS tanpa build, cukup edit file lalu reload extension. Tolong sertakan hasil **Diagnostik** kalau lapor soal deteksi meleset.

## 📄 Lisensi

**MIT** — lihat [LICENSE](LICENSE). Font **Plus Jakarta Sans** di-bundle di bawah **SIL OFL 1.1** (lihat [vendor/fonts/FONT-LICENSE.md](vendor/fonts/FONT-LICENSE.md)).

Dibuat oleh [@alfindigital](https://github.com/alfindigital).
