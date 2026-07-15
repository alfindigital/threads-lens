# Changelog

## v0.7.1
- **Revisi UX:** hapus preset template bawaan; baris "Sembunyikan Repost/Requote" jadi 1 baris + ikon; tombol footer diringkas (buang Copy & JSON, sisakan Prompt AI / MD / XLSX).
- **Fix statistik berkedip:** "Dipindai/Viral" kini **stabil saat idle**, hanya berubah ketika scroll (auto/manual).
- **Fix kebocoran kolom:** scan dibatasi ke **kolom feed utama** (buang rail mention/samping via cluster posisi-x + pilih scroll-container feed utama).
- **Hardening keamanan (pra open-source):** validasi preset saat import (batasi jumlah/nama + whitelist field), guard `highlightColor` (hanya hex valid), `esc()` juga escape kutip-tunggal.

## v0.7.0
Perbaikan besar dari audit 360°:
- **Anti data-hilang:** ganti filter tidak lagi menghapus daftar/riwayat (hanya Rescan/Hapus eksplisit).
- **Koneksi:** banner + auto-inject content script (panel tidak lagi diam saat tab dibuka sebelum reload).
- **Mesin scraping** lebih akurat: scan via semua metrik (post tanpa like tetap kebaca), waktu/angka/media lebih benar, ID stabil (anti-duplikat), sadar navigasi SPA, anti memory-leak (WeakRef).
- **Auto-scroll** berhenti otomatis saat mentok; "cari di feed" mengembalikan posisi baca.
- **Fitur baru:** Copy-Prompt (AI), gabung thread 🧵, bintangi + catatan, blokir author, chip hashtag, tanggal absolut, integrasi Notion/Todoist.
- **UI/UX/A11y:** tombol berlabel, metrik tidak kepotong di panel sempit, `:focus-visible`, `aria-label`, kontras diperbaiki, empty-state kontekstual.
- **Bug fix:** DEFAULTS satu sumber (`shared.js`), XSS Diagnostik ditutup, export XLSX sel angka kosong benar, formula-injection guard, drift versi & docs dibereskan.

## v0.6.0
- Klik username = cari di feed, hide Repost + Requote, fix preset (input nama), fix diagnostik (push broadcast), anti-lag, buang kolom Search.

## v0.5.0
- Rebrand 3-warna, halaman Tutorial + Settings, footer, layout kartu ramping, "Dipindai" anti-flicker.

## v0.1.0 – v0.4.0
- Floating panel → Side Panel native; tambah Share, filter tanggal, pilih kolom, export `.md`/`.xlsx`, skor + ranking, keyword, rising/velocity, preset, filter media.
