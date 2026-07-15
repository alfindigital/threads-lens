# Roadmap & ide improvement

Status sekarang: **v0.7.1**, dipakai lewat Developer Mode. Ide di bawah diurut kira-kira dari dampak-tinggi/effort-kecil ke bawah. Kontribusi welcome.

## Berikutnya (high value)
- **Kalibrasi deteksi ke Threads terbaru** — selektor `aria-label`/geometri kolom bisa berubah saat Threads update markup. Bikin blok CONFIG lebih tahan-banting + panduan kalibrasi via Diagnostik.
- **Deteksi kolom lebih pintar** — bedakan *tab* (For you/Following di threads.com single-column) vs *deck* multi-kolom; sekarang masih heuristik.
- **Engagement rate** — normalisasi metrik terhadap follower/rata-rata author (kalau angkanya bisa dibaca), bukan cuma absolut.
- **Preview media** — thumbnail gambar/video di kartu daftar.
- **Filter bahasa** & deteksi topik/hashtag cluster.

## Menengah
- **Threaded post 🧵 lebih akurat** — sekarang heuristik (marker `1/2`, `🧵`); tingkatkan ke pelacakan balasan berantai.
- **Pantau pasif / alert** — badge count + notifikasi saat ada post lewat ambang, tanpa panel kebuka.
- **Tracking tren lintas-sesi** — post yang sama naik berapa sejak terakhir dilihat.
- **Integrasi tambahan** — Google Sheets, webhook, Airtable (pola BYO-token seperti Notion/Todoist).
- **Template export custom** & export riwayat penuh (bukan cuma view terfilter).

## Jangka panjang / infra
- **Test otomatis** untuk fungsi murni (parseCount, mergeSettings, filter, xlsx) — Node test runner.
- **Refactor** engine deteksi jadi modul terpisah + dokumentasi selektor.
- **i18n** UI (saat ini Bahasa Indonesia).
- **Publish ke Chrome Web Store** (kalau mau distribusi luas + auto-update) — perlu privacy policy & review.
- Pertimbangkan **TypeScript + build ringan** kalau kompleksitas naik (sekarang sengaja vanilla biar gampang di-hack).

## Non-goal (sengaja tidak dikejar)
- Login/scrape via API resmi Threads (tool ini murni membaca DOM yang sudah tampil di browser user).
- Server/backend — tetap 100% client-side demi privasi.
