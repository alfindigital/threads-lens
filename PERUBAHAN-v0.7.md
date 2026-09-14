# ThreadLens v0.6 → v0.7.0 — Apa yang berubah & cek di mana

> Hasil eksekusi audit 360°. Backup v0.6 ada di `Documents\threads-viral-detector-backup-v0.6.0-20260622-0704`.

## ▶️ Cara aktifkan v0.7 (WAJIB)
1. Buka `chrome://extensions` → kartu **ThreadLens** → klik **⟳ reload**.
2. Buka/refresh **threads.com** (Ctrl+R).
3. Klik ikon ThreadLens → panel kanan. Kalau ada banner kuning "belum nyambung", klik tombolnya.

---

## 🏆 TOP-5 (yang paling kerasa)

| # | Perbaikan | Cek di mana |
|---|-----------|-------------|
| 1 | **Ganti filter TIDAK lagi menghapus daftar/riwayat** | Scroll & kumpulin beberapa post → geser ambang Like / ubah keyword → daftar **tetap ada** (dulu hilang semua). Wipe hanya saat tombol **Hapus** (2×). |
| 2 | **Banner koneksi + auto-inject** | Reload extension lalu buka panel tanpa refresh Threads → muncul banner + tombol "Refresh halaman Threads" (dulu panel diam/kosong). |
| 3 | **Default jalan & jelas** | Teken ▶ saat daftar kosong → empty-state ganti jadi "Memindai feed…"; kalau 0 lolos → "longgarkan ambang". |
| 4 | **Data & aksi nggak ngumpet** | Sempitkan panel → angka metrik **wrap, nggak kepotong**. Tiap kartu kini ada tombol **◎ cari di feed** (dulu cuma klik username). Footer tombol berlabel (Copy/Prompt/MD/XLSX/JSON/Hapus/Set). |
| 5 | **Mesin scraping lebih akurat** | Buka **⚙ Set → Diagnostik → Ambil diagnostik**: cek angka kebaca (bukan null) & kolom. Tombol **Salin diagnostik** buat kalibrasi lanjut. |

---

## ✨ Fitur baru — cek di mana

| Fitur | Di mana / cara tes |
|-------|--------------------|
| **Preset niche bawaan** (Trading IDX / Konten-Hook / Solopreneur) | Panel atas, chip **📈 ✍️ 🚀** di bawah dropdown Preset. Klik → kriteria + keyword langsung kepasang. |
| **Copy Prompt (AI-ready)** | Footer tombol **Prompt**. Hasil tersalin = prompt siap tempel ke Claude/ChatGPT (minta analisa pola + 10 ide konten). |
| **Export JSON** | Footer tombol **JSON**. Berisi metadata filter + semua sinyal (skor, rising, rasio, tanggal ISO, hashtag, catatan). |
| **Export MD/XLSX diperkaya** | **MD** ada header konteks filter + kolom Rising/Rasio/Tanggal. **XLSX** kolom lebih lengkap; sel angka kosong = beneran kosong (SUM/sort Excel valid). |
| **★ Bintangi + ✎ Catatan per post** | Tombol di kartu. Toggle **⭐** di atas daftar = tampilkan yang dibintangi saja. Tersimpan walau di-rescan. |
| **⦸ Blokir author** | Tombol di kartu → post author itu hilang. Kelola daftar di **⚙ Set → Filter author**. |
| **Gabung thread 🧵** | Centang **"Gabung 🧵"** di atas daftar → post bersambung (1/2, 2/2) jadi 1 kartu (badge ×N). |
| **Chip hashtag** | Muncul di kartu kalau post ada #tag/$cashtag. Klik chip → jadi keyword filter. |
| **Tanggal absolut** | Hover waktu di kartu ("2 jam lalu") → tooltip tanggal lengkap. Juga di export. |
| **Kirim ke Notion / Todoist** | Isi token di **⚙ Set → Integrasi**. Lalu bar **"Kirim hasil: → Notion / → Todoist"** muncul di atas footer (klik 2× konfirmasi). Token disimpan lokal, **tidak** ikut saat Export setelan. |
| **Auto-stop scroll** | Auto-scroll berhenti sendiri + toast saat feed mentok bawah (nggak bakar CPU). |
| **"Cari di feed" balikin posisi** | Klik ◎; kalau post nggak ketemu, posisi baca feed dikembalikan (dulu kelempar ke atas). |

---

## 🐛 Bug & kualitas (ringkas) — cek di mana

| Area | Perbaikan |
|------|-----------|
| **Mesin (content.js)** | Scan via semua metrik (post tanpa like tetap kebaca) · angka "1M/1jt/1.234.567/1,2jt" benar · waktu nggak salah baca angka body · ID stabil (anti-duplikat) · media bedain avatar vs foto · repost/requote lebih akurat · sadar pindah halaman (SPA) · anti memory-leak (WeakRef) · scan ter-throttle. |
| **Tampilan/UX** | Metrik nggak kepotong · `:focus-visible` (fokus keyboard kelihatan) · `aria-label` semua tombol · kontras teks dinaikkan · highlight feed lebih tipis · warna "cari di feed" jadi biru brand (dulu kuning) + animasi flash diaktifkan · empty-state kontekstual · banner koneksi. |
| **Data/keamanan** | DEFAULTS **satu sumber** (`shared.js`) — `excludeQuotes`/`sortBy` nggak hilang lagi · import setelan divalidasi · XSS Diagnostik ditutup (label di-escape) · guard formula-injection di XLSX · Notion ID di-encode · sync panel↔Settings anti saling-timpa · dark-mode di Help/Diagnostik diperbaiki (script di-externalkan, dulu diblokir CSP). |
| **Konsistensi/docs** | Versi 0.7.0 di semua file · README diluruskan (⚙ = Pengaturan) · `getThreadsTab`/util dipusatkan di `shared.js`. |

---

## ⚠️ Yang masih perlu KAMU (1 langkah, ~5 menit)
**Kalibrasi data Threads asli.** Mesin sudah di-hardening defensif, tapi finalnya cek dengan data nyata:
buka threads.com → scroll dikit → **⚙ Set → Diagnostik → Ambil diagnostik**. Kalau ada angka `null` atau kolom salah, klik **Salin diagnostik** dan kirim ke Claude — penyetelan ada di blok **CONFIG** atas `content.js`.

## 📄 Dokumen terkait
- `AUDIT-360.md` — 198 temuan audit lengkap (urut prioritas).
- `README.md` — changelog v0.7 + cara pakai.
