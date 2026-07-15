# Known issues & batasan

Tool ini membaca **DOM Threads yang sudah tampil di browser** — jadi akurasinya bergantung pada markup Threads yang bisa berubah sewaktu-waktu. Berikut yang sudah diketahui.

## Deteksi / scraping
- **Deteksi kolom belum sempurna.** Di `threads.com` yang tampilannya **satu kolom + tab** (For you / Following), "Pantau kolom" bisa keliru menganggap tab sebagai kolom. v0.7.1 sudah membatasi scan ke **kolom feed utama** (buang rail samping/mention via cluster posisi-x), tapi untuk isolasi per-tab yang presisi masih perlu kalibrasi. **Workaround:** pilih tab yang diinginkan langsung di Threads, biarkan "Pantau kolom = Semua".
- **Angka `null` / metrik tak terbaca.** Kalau Threads mengubah `aria-label` atau format angka, deteksi bisa meleset. **Cek:** ⚙ Set → Diagnostik → *Ambil diagnostik*; kalau banyak `null`, klik *Salin diagnostik* dan buka issue.
- **Waktu post** relatif (mis. "2 jam lalu") bisa meleset kalau Threads memakai format lain; tanggal absolut ada di tooltip/expor.
- **Repost vs Requote & media (foto post vs avatar)** pakai heuristik — bisa salah di kasus tepi.
- **Belum diuji di semua layout Threads** (web deck pihak-ketiga, ukuran layar ekstrem).

## Perilaku
- **Statistik "Dipindai/Viral"** sengaja **dibekukan saat idle** dan hanya berubah ketika kamu scroll (auto/manual) — supaya angkanya stabil, bukan berkedip.
- **Ganti filter tidak menghapus koleksi** — hanya tombol **Hapus** / **Rescan** eksplisit yang mengosongkan daftar.
- **Gabung thread 🧵** masih heuristik (marker `1/2`, `🧵`) — kadang under/over-merge.
- **Integrasi Notion/Todoist** butuh token yang diisi manual; skема database Notion harus punya properti title (dideteksi otomatis).

## Melaporkan bug
Buka issue di GitHub dan sertakan:
1. Hasil **⚙ Diagnostik → Salin diagnostik**.
2. Versi Chrome + apakah tampilan Threads 1 kolom atau banyak kolom.
3. Langkah reproduksi.

Penyetelan deteksi ada di blok **CONFIG** di bagian atas `content.js`.
