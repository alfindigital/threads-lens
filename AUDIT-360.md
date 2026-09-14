# ThreadLens — Audit 360° (v0.6.0)

> 198 temuan & ide, hasil audit multi-agen 12 dimensi + kritik-balik + gap-hunt. Diurut: **impact tinggi + effort kecil di atas**; bug & keamanan diberi bobot tambah.

**Ringkasan tier:** P0=50 · P1=56 · P2=77 · P3=15  
**Per tipe:** bug=53 · improvement=89 · feature=26 · debt=18 · na-note=12  
**Per dimensi:** Fitur baru=30 · Mesin scraping & logika=21 · Copywriting / microcopy=17 · Data / storage / state=16 · Performa=14 · UX / alur interaksi=14 · ui-visual=14 · Aksesibilitas=12 · Keamanan & privasi=12 · Responsiveness & ketahanan layout=8 · Maintainability / tech debt=7 · Aktivasi / time-to-first-result=2 · GAP / scraping edge case=2 · docs=2 · GAP / real-use friction=1 · GAP / real-use silent failure=1 · GAP / data loss real-use=1 · Aktivasi / friction jebakan pilih-kolom=1 · Aktivasi / kepercayaan pada hasil=1 · GAP / silent failure + performa=1 · Aktivasi / konversi (dapat nilai cepat)=1 · REFRAME SEO → struktur export agar AI-ready=1 · REFRAME konversi → kualitas nilai-terpakai export=1 · GAP / aktivasi first-run=1 · GAP / kepercayaan hasil=1 · GAP / konsistensi filter=1 · GAP / kualitas export untuk AI=1 · Aktivasi / konversi (time-to-first-export)=1 · Konsistensi / docs=1 · GAP / state interaksi=1 · Aktivasi / friction jumlah langkah=1 · REFRAME SEO → discoverability fitur di dalam app=1 · GAP / kualitas data riset=1 · GAP / state lintas-reload=1 · GAP / ketahanan terhadap perubahan Threads=1 · GAP / silent staleness=1 · REFRAME SEO → ASO/branding kalau kelak dipublish=1 · SEO (jujur N/A) + reframe=1 · docs / konsistensi=1 · konsistensi / docs=1 · GAP / data riset edge case=1

Skor = impact×2 + (effort dibalik) + bonus bug/keamanan/confidence. Tier: P0≥8 · P1≥6.5 · P2≥5 · P3<5.

---

## 🔴 P0 — Kerjakan duluan (impact tinggi, effort kecil / bug)  (50)

### P0.1 Metrik kartu kepotong diam-diam di panel sempit (.item-counts overflow:hidden)
`bug` · `Responsiveness & ketahanan layout` · impact **high** · effort **low** · skor **10.7** · confidence high  
**Masalah/Peluang:** .item-counts (sidepanel.css:145) memuat 4 chip metrik (like/komen/repost/share) + 1 chip velocity dalam satu baris dengan white-space:nowrap; overflow:hidden. Parent .item-foot (sidepanel.css:144) pakai flex-wrap:nowrap + justify-content:space-between, dan .item-actions (sidepanel.css:150) flex-shrink:0. Jadi waktu panel diciutkan ke ~280-340px, yang ngalah cuma .item-counts: chip paling kanan (share, lalu velocity) hilang TANPA ellipsis, tanpa tanda apa-apa. Diverifikasi: render kelima chip ada di sidepanel.js:287-291.  
**Kenapa penting:** Ini fitur INTI produk: Alfin lihat 4 metrik buat nentuin post viral. Kalau angka share/velocity raib pas panel disempitin (side panel Chrome default sering ~320-360px), dia bisa salah baca / kehilangan data tanpa sadar karna nggak ada ellipsis sebagai sinyal terpotong. Worst case: chip 'repost' & 'share' yang justru bobotnya paling tinggi di score() (x5 dan x4, sidepanel.js:207) yang ilang duluan.  
**Fix konkret:** Bikin chip metrik boleh turun baris alih-alih kepotong. Di .item-foot (css:144): ganti flex-wrap:nowrap -> flex-wrap:wrap; align-items:flex-start. Di .item-counts (css:145): hapus white-space:nowrap & overflow:hidden, tambah flex-wrap:wrap; row-gap:4px; flex:1 1 auto; min-width:0. Biar tombol open tetap di kanan atas: .item-actions tetap flex-shrink:0. Uji di lebar 280px dengan post 1.2jt like + velocity '↑34rb/j' — semua 5 chip harus kelihatan utuh (boleh 2 baris).  
**Lokasi:** `sidepanel.css:144-150, sidepanel.js:287-291`  

### P0.2 Tombol icon-only tanpa aria-label — screen reader baca kosong/'button'
`bug` · `Aksesibilitas` · impact **high** · effort **low** · skor **10.7** · confidence high  
**Masalah/Peluang:** Hampir SEMUA tombol penting hanya berisi <span class="ico"> (SVG inline tanpa teks) + atribut title=. Tidak ada satupun aria-label di seluruh sidepanel.html. Screen reader (NVDA/VoiceOver) tidak membaca title= secara andal sebagai accessible name pada <button>; banyak kombinasi malah mengumumkan 'button' kosong. Korban terverifikasi: #help & #theme-toggle (sidepanel.html:12-13), 3 media toggles (61-63), #scroll-btn (109), 5 tombol footer #copy-all/#export-md/#export-xlsx/#clear/#settings (138-142), dan tombol .open di tiap kartu hasil yang dibuat di sidepanel.js:294.  
**Kenapa penting:** Seluruh aksi inti produk (scroll, export, copy, hapus, buka post, ganti tema) jadi tak terbaca screen reader. Untuk Alfin sendiri dampak utama: title= hanya muncul saat hover mouse — pengguna keyboard yang nge-tab ke tombol tidak pernah lihat tooltip, jadi 13 tombol tampak seragam tanpa keterangan apa pun.  
**Fix konkret:** Tambahkan aria-label di tiap tombol icon-only, isi sama dengan title= (boleh keduanya). Contoh: <button id="help" class="icon-btn" title="Tutorial & definisi" aria-label="Tutorial & definisi">. Untuk tombol .open yang dibuat dinamis, set el.querySelector('.open').setAttribute('aria-label','Buka post di tab baru') di renderList (sidepanel.js:294). Tandai semua <span class="ico"> dekoratif dengan aria-hidden="true".  
**Lokasi:** `sidepanel.html:12-13,61-63,109,138-142; sidepanel.js:294`  

### P0.3 Tidak ada :focus-visible di mana pun — fokus keyboard tak terlihat
`bug` · `Aksesibilitas` · impact **high** · effort **low** · skor **10.7** · confidence high  
**Masalah/Peluang:** Grep ke seluruh repo menemukan NOL aturan :focus / :focus-visible (satu-satunya 'focus' adalah inp.focus() di sidepanel.js:185, bukan CSS). Browser default outline memang ada untuk <button>/<select>/<input>, TAPI .search-wrap input justru di-set outline:none (sidepanel.css:132) sementara wrapper .search-wrap tidak diberi indikator fokus pengganti — jadi field 'cari di hasil' jadi fokus tak-terlihat total. Tombol biru solid (.fbtn.solid, .preset-btns button, .segmented button.active) dengan outline default tipis juga nyaris tak kelihatan di atas latar biru.  
**Kenapa penting:** Navigasi keyboard (Tab) jadi 'buta' di field search dan rendah kontras di tombol biru — pengguna tak tahu sedang di kontrol mana. Ini blocker WCAG 2.4.7 dan langsung mengganggu siapa pun yang pakai keyboard, termasuk Alfin saat tangan di keyboard sambil scroll feed.  
**Fix konkret:** Tambah aturan global di sidepanel.css: :focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; border-radius: 9px; }. Untuk tombol biru beri kontras: .fbtn:focus-visible, .preset-btns button:focus-visible { outline-color: #fff; outline-offset: 2px; }. Untuk search: .search-wrap:focus-within { outline: 2px solid var(--blue); outline-offset: 1px; } (ganti pendekatan outline:none di input, sidepanel.css:132). Salin aturan :focus-visible yang sama ke <style> settings.html (baris 6-34) & advanced.html (baris 6-18).  
**Lokasi:** `sidepanel.css:132; settings.html:6-34; advanced.html:6-18`  

### P0.4 Tiga sumber scan bertumpuk + auto-scroll tick memanggil processPosts() langsung tanpa throttle
`bug` · `Performa` · impact **high** · effort **low** · skor **10.7** · confidence high  
**Masalah/Peluang:** Ada 3 pemicu scan paralel: (1) setInterval(scheduleScan,1300) (content.js:557), (2) MutationObserver debounce (content.js:558), (3) saat auto-scroll, tick memanggil `processPosts()` LANGSUNG (content.js:477) — bukan scheduleScan — jadi melewati throttle 450ms. Interval tick = `Math.max(180, 820 - settings.scrollSpeed*120)` (content.js:479): di scrollSpeed default 3 = 460ms, di scrollSpeed 5 = 220ms. Jadi scan penuh tiap 220-460ms sambil MutationObserver juga ikut nembak karena scroll memicu lazy-load.  
**Kenapa penting:** Saat auto-scroll (mode pakai utama produk ini: 'auto-scroll buat ngumpulin post viral'), scan berat berjalan ~2-4x/detik PLUS observer ikut trigger. Inilah skenario terberat dan justru paling sering dipakai Alfin. Akibatnya feed Threads tersendat saat di-scroll, post bisa kelewat ter-scrape, dan CPU/baterai boros.  
**Fix konkret:** Di tick auto-scroll (content.js:477) ganti `processPosts()` jadi `scheduleScan()` supaya kena throttle. Tinggikan lantai throttle saat auto-scroll aktif (mis. 700ms) karena post baru butuh waktu render. Dan saat auto-scroll ON, abaikan trigger MutationObserver (cek `autoScroll.on` di callback observer → skip) supaya tidak dobel — scan cukup digerakkan oleh tick.  
**Lokasi:** `content.js:469-481, content.js:371-374, content.js:557-559`  

### P0.5 DEFAULTS divergen 3 file: excludeQuotes & sortBy hilang/ke-reset diam-diam
`bug` · `Data / storage / state` · impact **high** · effort **low** · skor **10.7** · confidence high  
**Masalah/Peluang:** Ada TIGA objek DEFAULTS terpisah yang seharusnya identik tapi tidak: content.js:31-51 punya excludeQuotes (line 43) tapi TIDAK punya sortBy; settings.js:3-9 punya sortBy (line 8) tapi TIDAK punya excludeQuotes; sidepanel.js:3-25 punya KEDUANYA (excludeQuotes line 16, sortBy line 24). Ketiganya menulis ke key storage yang sama: tvdSettings.  
**Kenapa penting:** Dampak nyata & bisa direproduksi: tombol Reset di settings.js:65-66 melakukan `chrome.storage.local.set({tvdSettings: settings})` pakai DEFAULTS yang TIDAK punya excludeQuotes. Jadi setelan 'Sembunyikan kutipan/quote' yang sudah diatur Alfin lewat sidepanel TERHAPUS diam-diam tiap kali dia buka Pengaturan lalu klik Reset. Saat sidepanel dibuka lagi, loadSettings (sidepanel.js:82) merge balik default excludeQuotes:false, jadi quote filter mati padahal sebelumnya nyala — tanpa pemberitahuan. Inti masalah: satu sumber kebenaran pecah jadi tiga, makin gampang lari saat fitur baru ditambah (vibe-coder rawan lupa update ke-3 tempat sekaligus).  
**Fix konkret:** Buang DEFAULTS duplikat. Buat satu file defaults.js berisi `const TVD_DEFAULTS = {...}` (superset semua field: theme, sortBy, excludeQuotes, dst) lalu masukkan ke manifest content_scripts.js SEBELUM content.js, dan ke <script src=defaults.js> di sidepanel.html/settings.html/advanced.html sebelum script masing-masing. Ganti ketiga `const DEFAULTS` jadi referensi ke TVD_DEFAULTS. Minimal banget kalau enggan refactor: tambahkan `excludeQuotes:false` (dan `sortBy:"recent"` sudah ada) ke DEFAULTS di settings.js:3-9 supaya Reset tidak menghapus excludeQuotes.  
**Lokasi:** `content.js:31-51, settings.js:3-9, sidepanel.js:3-25, settings.js:65-66`  

### P0.6 XSS lewat label kolom di Diagnostik (innerHTML tanpa escape)
`bug` · `Keamanan & privasi` · impact **high** · effort **low** · skor **10.7** · confidence high  
**Masalah/Peluang:** advanced.js:31 menyusun baris tabel dengan template `html += `<tr><td>${i+1}</td><td>${c.label}</td><td>${c.count}</td></tr>`` lalu di-render via `colDiv.innerHTML = html` (advanced.js:32). `c.label` berasal dari teks DOM halaman Threads: content.js:272 mengambil `(el.textContent||'').trim()` dari heading/span/div di feed dan dipakai sebagai `c.t` -> jadi `c.label` (content.js:291, 296, 301). Tidak ada escaping sebelum masuk innerHTML. (Catatan: label fallback 'Kolom N' di content.js:301 aman, tapi label yang berasal dari teks halaman tidak.)  
**Kenapa penting:** Threads = halaman pihak ketiga; teks heading kolom bisa berubah atau attacker bisa menaruh elemen heading palsu di feed. Filter whitelist COLUMN_NAMES + batas 22 char (content.js:274) pakai `low===k || low.startsWith(k+' ')`, jadi teks seperti `following <img src=x onerror=...>` yang ≤22 char setelah prefix bisa lolos dan tertanam mentah. Kalau label mengandung HTML, ia dieksekusi di dalam halaman extension (advanced.html) yang punya akses chrome.storage + chrome.tabs — jauh lebih berbahaya dari XSS web biasa. Defense-in-depth di sisi render wajib walau jalur eksploit sempit.  
**Fix konkret:** Di advanced.js:31 escape `c.label`. Tambah helper `const esc=(s)=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));` lalu `<td>${esc(c.label)}</td>`. Atau bangun baris pakai `document.createElement('td')` + `td.textContent=c.label`. Pola esc() ini sudah ada & terbukti benar di sidepanel.js:231 — tinggal disalin.  
**Lokasi:** `advanced.js:31-32, content.js:272, content.js:274`  

### P0.7 Empty state nggak nyuruh klik Play — user mentok di langkah pertama
`bug` · `Aktivasi / time-to-first-result` · impact **high** · effort **low** · skor **10.7** · confidence high  
**Masalah/Peluang:** Satu-satunya jalan munculin hasil adalah auto-scroll (Play) atau scroll manual yang men-trigger MutationObserver (content.js:557-559). Tapi empty state di panel cuma bilang: 'Belum ada data. Buka threads.com, lalu (kalau baru update) refresh halamannya.' (sidepanel.html:134). Nggak ada satu kata pun yang nyuruh user nge-klik tombol Play / scroll feed. renderList cuma toggle display empty state (sidepanel.js:273), teksnya statis di HTML. Untuk no-coder seperti Alfin, ini bikin dia buka panel, lihat kosong, refresh berkali-kali, dan mengira extension-nya rusak.  
**Kenapa penting:** Ini titik aktivasi paling kritis: kalau di 30 detik pertama panel tetap kosong padahal feed penuh post, user menyerah sebelum pernah lihat satu kartu. Time-to-first-result jadi tak hingga karena instruksinya salah arah (refresh, bukan scroll/play).  
**Fix konkret:** Ubah teks #empty (sidepanel.html:134) jadi langkah aksi nyata: '1) Buka & login threads.com. 2) Klik tombol ▶ Play di bawah untuk mulai auto-scroll — post viral akan muncul di sini.' Tambah deteksi di init/renderState: kalau getThreadsTab() (sidepanel.js:66-70) null tampilkan 'Belum ada tab Threads kebuka — buka threads.com dulu'; kalau ada tab tapi rawItems kosong tampilkan instruksi klik Play. Bonus: panah/animasi kecil nunjuk ke #scroll-btn saat daftar masih kosong.  
**Lokasi:** `sidepanel.html:134, sidepanel.js:66-70, sidepanel.js:270-273, content.js:557-559`  

### P0.8 Panel mati senyap kalau content script belum ter-inject (tab Threads dibuka duluan / extension baru di-reload)
`bug` · `UX / alur interaksi` · impact **high** · effort **low** · skor **10.7** · confidence high  
**Masalah/Peluang:** sendToTab membungkus chrome.tabs.sendMessage dalam try/catch dan mengembalikan null kalau gagal (sidepanel.js:71-75). init() memanggil sendToTab('request-state'); kalau content.js belum ter-inject (tab Threads dibuka sebelum extension dipasang, atau setelah klik reload extension tanpa refresh halaman), pesan gagal, resp null, panel tampil kosong tanpa pesan apa pun. Satu-satunya petunjuk ada di README ('refresh halaman').  
**Kenapa penting:** Skenario ini PASTI terjadi tiap Alfin update extension (dia no-coder, dev-mode reload itu rutin). Panel terlihat 'rusak/beku' tanpa instruksi. Berbeda dari ide multi-tab dan onboarding; ini spesifik gagal-koneksi content script yang tidak ditangani dan tidak dikomunikasikan di UI.  
**Fix konkret:** Saat sendToTab/request-state mengembalikan null padahal ada tab Threads (getThreadsTab != null), tampilkan banner/empty-state actionable: 'Threads-nya perlu di-refresh sekali (Ctrl+R) supaya nyambung.' Idealnya coba chrome.scripting kalau permission ada, atau retry sekali setelah 800ms. Minimal: deteksi tab ada tapi tak menjawab -> pesan jelas, bukan layar kosong.  
**Lokasi:** `sidepanel.js:71-75, sidepanel.js:385-387, advanced.js:55-57`  

### P0.9 'Cari di feed' membuang posisi baca Alfin: scroll feed direset ke atas dan tidak pernah dikembalikan
`bug` · `GAP / real-use friction` · impact **high** · effort **low** · skor **10.7** · confidence high  
**Masalah/Peluang:** seekTo() (content.js:501-517) memaksa container.scrollTop=0 atau window.scrollTo(0,0) lalu auto-scroll turun mencari post. Kalau ketemu, feed berhenti di post itu; kalau tidak ketemu setelah 45 langkah, feed ditinggal entah di mana — posisi scroll Alfin sebelumnya HILANG. Tidak ada penyimpanan/pengembalian scroll position.  
**Kenapa penting:** Skenario nyata: Alfin lagi scroll riset di feed sampai jauh, lihat satu kandidat menarik di panel, klik @username untuk 'cari di feed'. Threads (SPA React, virtualized) sering sudah membuang node lama, jadi seek gagal -> feed lompat ke atas, semua progress scroll lenyap, dan post yang tadi dia lihat ikut hilang dari DOM. Ini frustrasi ganda: gagal nemu DAN kehilangan tempat.  
**Fix konkret:** Sebelum seekTo, simpan const prevTop = cont? cont.scrollTop : window.scrollY. Kalau seek gagal (steps>=max), kembalikan: cont? cont.scrollTo(0,prevTop) : window.scrollTo(0,prevTop) sebelum toast. Idealnya toast jadi: 'Post-nya udah lewat dari feed. Pakai tombol ↗ buat buka langsung.' supaya Alfin tahu jalan keluarnya (buka di tab baru).  
**Lokasi:** `content.js:501-517, content.js:518-525`  

### P0.10 Angka metrik panjang ('1.234.567' / '1,2 jt') bisa ditolak diam-diam oleh batas 12 karakter usableToken
`bug` · `GAP / scraping edge case` · impact **high** · effort **low** · skor **10.5** · confidence medium  
**Masalah/Peluang:** usableToken (content.js:100-107) menolak token apa pun yang panjangnya >12 char. aria-label Threads sering berbentuk frasa, mis. 'Suka, 1.234.567' atau di EN '1,234,567 likes'. Token mentah dari aria-label bisa melebihi 12 char, jadi return null -> metrik post paling viral justru gagal dibaca.  
**Kenapa penting:** Justru post TERVIRAL (jutaan like) yang paling mungkin punya label panjang/berformat ribuan penuh. Itu target utama Alfin, dan mereka diam-diam jatuh ke counts=null lalu dibuang evalEngagement. Akibatnya panel terasa 'kok yang gede malah nggak kedeteksi'.  
**Fix konkret:** Longgarkan guard panjang: ganti syarat 't.length > 12' jadi pengecekan apakah token mengandung pola angka, bukan panjang total. Atau di countNearSvg, sebelum usableToken, ekstrak dulu substring angka via match(/[\d.,]+\s*(rb|ribu|jt|juta|k|m|b)?/i) dari aria-label, baru parseCount. Minimal naikkan batas jadi >40.  
**Lokasi:** `content.js:100-107, content.js:114-128`  

### P0.11 Auto-scroll diam-diam gagal saat "Pantau kolom = Semua"
`bug` · `UX / alur interaksi` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** Saat crawlTarget = "all" (default), scrollTargetEl() (content.js:461-468) tidak punya elemen kolom, jadi jatuh ke lastHoveredCol; kalau itu null/basi, tick jatuh ke window.scrollBy (content.js:476). lastHoveredCol HANYA terisi lewat mousemove di HALAMAN Threads (content.js:549-555). Saat user klik tombol play di Side Panel, fokus ada di panel — user belum gerakin mouse di feed, jadi lastHoveredCol null. Di layout multi-kolom Threads yang virtualized, window.scrollBy sering tidak menggulung kolom feed sama sekali. Hint "Pilih 1 kolom dulu" (sidepanel.html:112) cuma muncul sebagai teks; tombol play tetap aktif & set ikon ke pause (sidepanel.js:326) padahal feed diam.  
**Kenapa penting:** Ini fitur INTI buat riset (auto-scroll = cara ngumpulin banyak post). User no-coder klik play, lihat ikon jadi pause, nunggu, tapi daftar tidak nambah — dia simpulkan "ekstensinya rusak" padahal cuma salah target scroll. Jebakan persis seperti yang diduga di brief.  
**Fix konkret:** Di startScroll() (content.js:469), kalau scrollTargetEl() null saat crawlTarget=all, deteksi otomatis kolom feed scrollable terbesar pakai detectColumns() (pilih kolom dengan clientHeight/count like-svg terbanyak) lalu pakai sebagai target. Kalau tetap tidak ada kolom scrollable, kirim toast() "Auto-scroll butuh 1 kolom aktif — klik feed-nya dulu atau pilih kolom" dan JANGAN biarkan ikon ke pause. Tambahan: redupkan/disable tombol play saat crawlTarget=all (lihat ide hint terpisah) supaya friksi kelihatan sebelum diklik.  
**Lokasi:** `content.js:461-483, content.js:549-555, sidepanel.html:108-113, sidepanel.js:153`  

### P0.12 Aksi 'cari di feed' di kartu hasil tak bisa diakses keyboard (span, bukan button)
`bug` · `Aksesibilitas` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** Di tiap kartu hasil, 'cari di feed' dipasang sebagai click handler pada <span class="item-user"> (sidepanel.js:298, elemen dibuat di markup sidepanel.js:281) — sebuah <span>, bukan <button>/<a>, jadi tidak fokusabel & tidak ter-trigger Enter/Space. Tombol .open memang <button> (fokusabel), tapi item-user tidak punya struktur yang menandainya sebagai aksi bagi AT meski diberi cursor:pointer (sidepanel.css:139).  
**Kenapa penting:** Fitur andalan produk (klik @username -> auto-seek post di feed via cmd 'locate') 100% mouse-only. Pengguna keyboard tidak punya jalan sama sekali untuk memicunya. Span juga tak diumumkan sebagai interaktif oleh screen reader.  
**Fix konkret:** Ubah .item-user jadi fokusabel: saat membuat elemen tambah tabindex="0" role="button" aria-label="Cari @username di feed", lalu pasang keydown handler yang memanggil logika locate yang sama (sidepanel.js:298): if(e.key==='Enter'||e.key===' '){ e.preventDefault(); /* sendToTab locate */ }. Lebih bersih: render .item-user sebagai <button class="item-user link-like"> agar otomatis fokusabel + Enter/Space jalan tanpa kode tambahan.  
**Lokasi:** `sidepanel.js:281,298-302; sidepanel.css:139`  

### P0.13 getPostTime salah baca angka di BODY post sebagai umur post
`bug` · `Mesin scraping & logika` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** getPostTime fallback (content.js:182) menjalankan regex /\b(\d+)\s*(s|m|h|d|w|mo|y)\b/i di SELURUH c.innerText container — bukan hanya area timestamp. Karena innerText mencakup teks isi post, token di badan tulisan seperti 'diet 3d', 'saham naik 5m', 'umur 25y', '5h challenge' akan ketangkap. Token pertama yang cocok menang, dan elemen <time> sering muncul SETELAH teks di innerText, jadi badan post bisa menang duluan. Fallback ini baru jalan kalau querySelector('time') di baris 178-181 gagal, tapi pada feed Threads relative-time sering tidak punya <time[datetime]> yang ke-parse.  
**Kenapa penting:** Threads kerap pakai relative-time, jadi fallback ini sering kepakai. Saat kena, timeMs jadi ngawur: post bisa dikira 'hari ini' atau '25 tahun lalu'. Ini meracuni filter tanggal (1d/7d/30d salah loloskan/buang post — content.js:203-209), sort 'recent' (sidepanel.js:259), dan terutama sort 'rising'/velocity (sidepanel.js:209-211 bagi likes per umur → kecepatan palsu/ekstrem). Untuk riset konten yang andalkan 'rising', ini langsung bikin daftar salah urut.  
**Fix konkret:** Jangan scan innerText global. Ambil waktu HANYA dari elemen <time> (datetime/title) yang sudah ada di getPostTime baris 178-181. Kalau itu gagal, batasi regex relative-time ke teks elemen <time> atau ke <a> yang membungkus <time>: const tnode=c.querySelector('time'); const src=tnode?(tnode.getAttribute('title')||tnode.textContent):''; lalu match src — bukan c.innerText. Hapus/turunkan prioritas fallback innerText global.  
**Lokasi:** `content.js:177-188; sidepanel.js:209-211,259`  

### P0.14 Post dengan likes 0/tak terbaca tidak pernah dipindai sama sekali
`bug` · `Mesin scraping & logika` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** processPosts (content.js:379) menemukan container HANYA lewat findLikeSvgs (content.js:129-135) → svg[aria-label] yang metricOfLabel()-nya === 'likes'. Post yang aria-label like-nya belum ke-render, beda bahasa/redaksi, atau (untuk kolom Activity/komentar) tidak punya tombol like, tidak akan pernah masuk ke containers. Padahal kriteria viral bisa berbasis komentar/repost/share saja (logic OR di evalEngagement content.js:241, atau metric likes di-OFF).  
**Kenapa penting:** User bisa set metrik likes OFF dan hanya cari berdasarkan komentar/repost — tapi engine tetap butuh SVG like untuk bahkan MENEMUKAN post. Akibatnya: post viral via komentar/repost yang like-nya nol/tak terbaca tak pernah masuk daftar, dan stats 'Dipindai' (content.js:424) kurang hitung. Diagnostik terlihat 'normal' padahal ada blind spot sistemik.  
**Fix konkret:** Jadikan penemuan container metric-agnostic: di processPosts kumpulkan svg[aria-label] yang metricOfLabel()-nya BUKAN null (bukan cuma likes), lalu naik ke container via postContainerFromSvg. Atau temukan container via POST_SELECTORS (data-pressable-container) langsung lalu cek apakah ada >=1 metric SVG di dalamnya. findLikeSvgs tetap dipakai untuk deteksi kolom (content.js:280-281,296), tapi pemindaian post jangan digate ke likes.  
**Lokasi:** `content.js:129-135,379,147-148`  

### P0.15 ID berbasis snippet tidak stabil → entri duplikat saat lazy-load
`bug` · `Mesin scraping & logika` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** idFor (content.js:368-369) pakai getPermalink, dan kalau null jatuh ke 'snip:'+user+':'+snippet.slice(0,30). getPermalink (content.js:155-158) mencari a[href*="/post/"] yang sering baru terpasang setelah <time>/permalink ke-render. Sebelum itu, id memakai snippet, sedangkan snippet (getSnippet content.js:164-176) diturunkan dari c.innerText yang BERUBAH saat tombol 'Terjemahkan', alt-text gambar, atau media lazy-load masuk. ID berubah untuk post yang sama.  
**Kenapa penting:** Throttle scan 450ms (content.js:372) + observer 600ms (558) + interval 1300ms (557) + auto-scroll tiap tick (477) berarti satu post dipindai berkali-kali selama loading. Tiap kali snippet (lalu id) berbeda, viralMap.set (content.js:410) bikin record BARU → post yang sama muncul 2-3x di daftar & di export. Untuk tujuan menyusun daftar bersih buat AI, duplikat ini merusak hasil dan menghabiskan kuota maxItems (content.js:411).  
**Fix konkret:** Stabilkan id: (1) prioritaskan permalink; (2) kalau belum ada, JANGAN commit ke viralMap dulu — tunda sampai permalink muncul; atau (3) pakai kunci lebih stabil: user + hash 30 char pertama yang sudah dibersihkan dari token UI ('Terjemahkan','Translate','See more','Lihat selengkapnya'). Tambah de-dupe: kalau permalink baru muncul untuk record lama yang id-nya 'snip:', merge ke entri permalink.  
**Lokasi:** `content.js:368-369,155-158,164-176,410`  

### P0.16 Suffix 'm' ambigu: 5 menit (waktu) vs 5 juta (count) → metrik post terviral hilang
`bug` · `Mesin scraping & logika` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** Dua tempat memberi arti berbeda pada 'm'. parseCount (content.js:93) treat 'm'→1e6 (juta). getPostTime fallback (content.js:184) treat 'm'→6e4 (menit). usableToken (content.js:104) membuang token yang cocok /^\d+\s*(s|m|h|d|w|mo|y)$/i agar tak jadi count — TAPI ini juga membuang angka view/like yang Threads tampilkan sebagai bare '5M'. Karena countNearSvg (content.js:122-124) melewatkan tiap kandidat ke usableToken DULU sebelum parseCount, leaf-text '5M' ditolak → count hilang. (Catatan: kalau aria-label tombol berisi 'Suka, 5.234.123' angka penuh, jalur itu masih bisa menyelamatkan; bug menggigit saat angka hanya tampil ringkas '5M' di node teks.)  
**Kenapa penting:** Di UI Threads berbahasa Inggris, metrik besar tampil '5M','1.2M'. usableToken menolak '5m' → countNearSvg gagal baca → metrik hilang TEPAT di post paling viral (yang justru paling penting buat riset). Bersamaan, getPostTime salah anggap '5m' sebagai 5 menit. Double-fault di post terpenting.  
**Fix konkret:** Bedakan konteks: di countNearSvg, parse count langsung dari aria-label/leaf tanpa lewat time-filter usableToken (count dan waktu jangan berbagi filter yang sama). Untuk usableToken khusus jalur count, jangan buang '\d+m'/'\d+\.\dm' kalau ada desimal. Dan di getPostTime hanya terima unit waktu dari elemen <time>, bukan teks bebas (lihat temuan getPostTime).  
**Lokasi:** `content.js:88-99,100-107,114-128,184`  

### P0.17 viralMap menahan _el (node DOM detached) → memory leak selama sesi panjang
`bug` · `Performa` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** Saat post viral ditemukan, `viralMap.set(id, { ...data, _el: c })` menyimpan referensi langsung ke node DOM (content.js:410), dan Object.assign juga menulis `_el: c` (content.js:412). Threads memvirtualisasi feed: node post yang ke-scroll keluar viewport dilepas/diganti React, tapi viralMap tetap memegang `_el`, jadi node lama tak bisa di-GC. maxItems default 300, saat auto-scroll lama bisa ratusan node detached (beserta subtree-nya) tertahan.  
**Kenapa penting:** Sesi riset Alfin = auto-scroll lama untuk ngumpulin banyak post viral — justru di situ kebocoran paling besar: hingga 300 node post Threads + subtree (gambar/video) tertahan = puluhan-ratusan MB tab membengkak, lama-lama tab Threads berat/crash. _el cuma dipakai untuk locate/seek yang SUDAH punya fallback findPostEl via link (content.js:488-495).  
**Fix konkret:** Jangan simpan node di Map yang persist. Pakai WeakMap terpisah `elById` (boleh di-GC otomatis); findPostEl cek WeakMap dulu lalu fallback pencarian via link (sudah ada). Atau minimal: di akhir tiap scan, untuk record yang node-nya tak ada di `containers` hasil scan, set `rec._el=null`. Karena locate bisa cari ulang via permalink, melepas _el aman.  
**Lokasi:** `content.js:407-412, content.js:486-499, content.js:54`  

### P0.18 Ubah SATU filter = riwayat lintas-sesi terhapus (rescanAll dipanggil tiap settings berubah)
`bug` · `Data / storage / state` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** Saat content menerima pesan 'settings' (content.js:536) ia memanggil `rescanAll()`. rescanAll (content.js:433-440) melakukan `chrome.storage.local.remove('tvdHistory')` + viralMap.clear() lalu processPosts() — yang hanya bisa mengisi ulang dari post yang SAAT ITU ada di DOM. Pesan 'settings' dikirim oleh pushSettings di sidepanel.js:76, dipanggil di SETIAP handler kontrol (metrics, logic, keyword, media, range, dst — sidepanel.js:137-149).  
**Kenapa penting:** Dampak nyata & merugikan: riwayat lintas-sesi adalah data hasil scroll berjam-jam. Setiap kali Alfin mengubah satu kontrol di panel (mis. naikkan min likes, ganti keyword, toggle media) → pushSettings → content terima 'settings' → rescanAll → tvdHistory DIHAPUS dari storage dan viralMap dikosongkan, lalu diisi ulang HANYA dari beberapa post yang kebetulan masih ter-render di viewport. Post viral yang sudah di-scroll lewat & tak lagi di DOM HILANG dari riwayat. Jadi mengubah filter = kehilangan riwayat kumulatif — bertentangan langsung dengan janji 'riwayat lintas sesi'. User kemungkinan besar mengira ekstensi 'lupa' hasilnya.  
**Fix konkret:** Pisahkan dua konsep: (a) re-evaluasi filter terhadap data yang SUDAH terkumpul vs (b) buang semua. Saat menerima 'settings' (content.js:536) JANGAN rescanAll/hapus history — cukup re-evaluasi viralMap yang ada terhadap settings baru. Record history SUDAH menyimpan counts mentah (content.js:407), jadi re-jalankan evalEngagement + filter pada record tersimpan tanpa perlu DOM; yang tak lolos disembunyikan dari highlight tapi tetap di history. rescanAll yang benar-benar menghapus history hanya saat user klik tombol Rescan/Clear eksplisit (content.js:540-541). Ini perubahan inti tapi memperbaiki janji utama produk.  
**Lokasi:** `content.js:536, content.js:433-440, content.js:407, sidepanel.js:76, sidepanel.js:137-149`  

### P0.19 Content script buta terhadap navigasi SPA Threads — state nyangkut antar-halaman
`bug` · `Mesin scraping & logika` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** content.js boot() jalan SEKALI saja (guard window.__tvdLoaded di baris 12-13). Threads itu SPA React: pindah dari For You ke Following, buka profil orang, buka detail 1 post, atau klik tab Search — semua TIDAK reload halaman, jadi content script tidak pernah re-init. Akibatnya seenIds (baris 56), _colCache (baris 265), viralMap, dan lastHoveredCol membawa state halaman LAMA ke halaman BARU. Tidak ada listener history.pushState/popstate/replaceState. detectColumns punya cache 3 detik tapi kolom bisa berubah total saat pindah view.  
**Kenapa penting:** Alur kerja Alfin justru pindah-pindah view terus (For You -> profil creator -> Search keyword trading). Setelah pindah, 'Dipindai' tetap akumulasi dari view lama, kolom yang terdeteksi salah, dan getScanRoot() bisa nunjuk kolom yang sudah hilang dari DOM sehingga scan diam-diam kosong. User kira extension rusak padahal cuma state basi.  
**Fix konkret:** Tambah hook SPA-route: patch history.pushState/replaceState + listener popstate, atau bandingkan location.href di tiap scheduleScan tick. Saat URL path berubah: panggil _colCache={t:0,cols:[]} (force re-detect), clearAllHighlights(), dan reset lastHoveredCol=null. Pertimbangkan reset seenIds atau pisahkan hitungan 'scanned sesi ini' per-route. Tidak perlu hapus viralMap (riwayat lintas-view memang fitur).  
**Lokasi:** `content.js:12-13, content.js:56, content.js:265-268, content.js:311-317, content.js:548-560`  

### P0.20 Side panel + content script tidak terhubung kalau tab Threads dibuka SEBELUM extension di-load/di-reload
`bug` · `GAP / real-use silent failure` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** content.js cuma di-inject otomatis ke tab yang DIBUKA setelah extension aktif. Kalau Alfin reload extension di chrome://extensions (sering dilakukan vibe-coder saat ngoprek) atau extension baru ke-load sementara tab threads.com sudah kebuka, tab lama TIDAK punya content script. sendToTab() (sidepanel.js:71-75) memanggil chrome.tabs.sendMessage lalu menelan error di catch dan return null. Panel tampak hidup tapi semua tombol (play, rescan, locate) diam total tanpa pesan.  
**Kenapa penting:** Ini skenario PALING sering bikin Alfin nyerah: dia load unpacked, buka panel, pencet play, NOL respon, nggak ada error, nggak tau harus refresh halaman Threads. README/help juga tidak menyebut 'refresh dulu'. Untuk no-coder ini = 'extensionnya rusak'.  
**Fix konkret:** Di sendToTab(), saat chrome.tabs.sendMessage gagal (catch), tampilkan toast actionable: 'Belum nyambung ke Threads — REFRESH halaman threads.com-nya (Ctrl+R), lalu coba lagi.' Lebih kuat: di init() panel, kirim 'request-state' ke tab; kalau null, render banner kuning persisten di atas list dengan tombol 'Refresh Threads' yang memanggil chrome.tabs.reload(tab.id). Tambahkan permission 'scripting' lalu chrome.scripting.executeScript untuk re-inject content.js otomatis ke tab aktif sebagai fallback.  
**Lokasi:** `sidepanel.js:71-75, sidepanel.js:375-387, background.js (whole)`  

### P0.21 Ganti SATU ambang/keyword = seluruh riwayat sesi + history tersimpan terhapus diam-diam (rescanAll dipanggil)
`bug` · `GAP / data loss real-use` · impact **high** · effort **medium** · skor **9.7** · confidence high  
**Masalah/Peluang:** Setiap perubahan setelan di panel memanggil pushSettings() -> content terima 'settings' -> rescanAll() (content.js:536) yang melakukan viralMap.clear() + chrome.storage.local.remove('tvdHistory') (content.js:433-440). Jadi menaikkan ambang Like 1000->1500 saat scroll, atau mengetik 1 huruf keyword, MENGHAPUS semua post yang sudah dikumpulkan sesi ini DAN history tersimpan.  
**Kenapa penting:** Pola kerja normal: Alfin scroll dapat 80 post viral, lalu 'coba naikin ambang biar lebih selektif' — sekali ketik, 80 post lenyap permanen, harus scroll ulang dari nol. Untuk riset yang makan waktu lama ini fatal. Daftar yang sudah ada SEHARUSNYA cukup difilter ulang di tempat (counts sudah tersimpan), bukan di-rescan dari DOM yang sebagian sudah hilang.  
**Fix konkret:** Pisahkan 'ubah kriteria' dari 'buang data'. Saat settings berubah, JANGAN rescanAll/clear. Re-evaluasi viralMap yang ADA terhadap kriteria baru (counts & timeMs sudah tersimpan tiap record) lalu update highlight; baru DOM-scan tambahan untuk yang belum kebaca. Hanya rescanAll saat user eksplisit menekan 'Rescan' atau 'Bersihkan'.  
**Lokasi:** `content.js:536, content.js:433-440, sidepanel.js:137-149`  

### P0.22 Mode 'Semua kolom' tetap munculin Play tapi auto-scroll bisa diam tanpa hasil
`bug` · `Aktivasi / friction jebakan pilih-kolom` · impact **high** · effort **medium** · skor **9.5** · confidence medium  
**Masalah/Peluang:** Saat crawlTarget='all' (default, content.js:40), tombol Play tetap aktif dan hint 'Pilih 1 kolom dulu untuk auto-scroll' cuma muncul kecil (sidepanel.html:112, di-toggle updateScrollHint sidepanel.js:202). Di scrollTargetEl() (content.js:461-468) kalau target 'all' dan belum ada lastHoveredCol, fungsi return null lalu startScroll (content.js:469-481) men-scroll window. Di layout multi-kolom Threads (desktop lebar), window-scroll sering nggak nggerakin kolom feed yang sebenarnya overflow internal — jadi Play diklik, ikon berubah pause, tapi nggak ada post baru masuk. User multi-kolom mentok tanpa tahu kenapa.  
**Kenapa penting:** Jebakan aktivasi klasik: kontrol kelihatan berfungsi (ikon jadi pause) tapi nilainya nol. User nggak akan paham harus hover kolom dulu (lastHoveredCol di-set lewat mousemove, content.js:549-554) atau pilih kolom di dropdown. Untuk riset konten yang butuh nyisir banyak post, kegagalan diam-diam ini langsung mematikan nilai produk.  
**Fix konkret:** Saat target='all' dan Play diklik tapi scrollTargetEl() null, auto-pilih kolom dengan post terbanyak dari detectColumns() (sudah ada .count, content.js:281) sebagai target scroll; ATAU munculkan toast tegas 'Hover/pilih kolom dulu biar auto-scroll nyisir kolom yang benar'. Naikkan prominence hint jadi banner kuning kecil di atas tombol saat target='all'. Idealnya: kalau cuma 1 kolom feed terdeteksi, langsung jadikan itu target otomatis.  
**Lokasi:** `content.js:461-468, content.js:469-481, sidepanel.html:108-113, sidepanel.js:202`  

### P0.23 4 dari 5 tombol footer biru semua, icon-only — sulit dibedakan (terutama MD vs XLSX)
`improvement` · `ui-visual` · impact **high** · effort **low** · skor **9.2** · confidence high  
**Masalah/Peluang:** Footer (sidepanel.html:138-142) ada 5 tombol icon-only: copy-all, export-md, export-xlsx, settings = .fbtn.solid (biru, sidepanel.css:165); clear = .fbtn.dark (hitam, :166). Jadi 4 kotak biru identik + 1 hitam berderet. Ikon copyAll (dua kotak), md (kotak 'M'), xlsx (grid) semua 19px (sidepanel.css:164) dengan latar biru sama persis. Tidak ada label teks; satu-satunya pembeda hanya tooltip title.  
**Kenapa penting:** User = no-coder yang export buat riset konten — ini tombol PALING SERING dipakai. 4 biru icon-only dengan ikon mirip (copy vs md vs xlsx) memaksa user hover baca tooltip tiap kali → lambat, salah-klik. 'Settings' (gear) yang biru disandingkan dengan tiga tombol export biru padahal kategorinya beda (navigasi vs aksi data) — pengelompokan warna salah.  
**Fix konkret:** 1) Pisahkan kategori dengan warna: copy/md/xlsx tetap biru sebagai grup aksi-data; settings jadikan ghost/abu (bukan biru) karena navigasi. 2) Tambah micro-label di bawah ikon (10-11px): 'Copy','MD','XLSX','Hapus','Set' — panel cukup lebar untuk 5 kolom. Minimal beri label MD vs XLSX yang paling rancu.  
**Lokasi:** `sidepanel.html:138-142, sidepanel.css:160-168`  

### P0.24 Aksi 'cari di feed' tersembunyi di klik username, tanpa afordans visual — ikon locate sudah ada tapi tak dirender
`improvement` · `ui-visual` · impact **high** · effort **low** · skor **9.2** · confidence high  
**Masalah/Peluang:** Kartu daftar cuma punya SATU tombol terlihat: .open (buka tab baru, sidepanel.js:294). Aksi 'locate/cari di feed' — fitur inti — dipicu KLIK pada teks @username (sidepanel.js:298-302); petunjuknya cuma title attr 'Klik: cari di feed' (sidepanel.js:281) + hover underline biru (sidepanel.css:140). Ikon locate (target/crosshair) sudah ada di ICONS.locate (sidepanel.js:34) tapi TIDAK PERNAH dirender di kartu.  
**Kenapa penting:** Username yang bisa diklik untuk 'loncat ke feed' bukan konvensi umum — user awam mengira username = buka profil. User no-coder kemungkinan besar tidak menemukan fitur locate sama sekali, padahal itu pembeda utama produk. Ikon locate sudah dibuat tapi mubazir.  
**Fix konkret:** Render ICONS.locate sebagai tombol kedua di .item-actions (sidepanel.js:293-295), di sebelah .open, title 'Cari di feed'. Pindahkan listener locate (sidepanel.js:298-302) ke tombol ini; username boleh tetap klik-able sebagai bonus. .item-actions sudah punya layout 2 tombol (gap 6px, sidepanel.css:150-156) jadi langsung muat.  
**Lokasi:** `sidepanel.js:34, sidepanel.js:293-302, sidepanel.css:150-156`  

### P0.25 Tombol 'Copy sebagai prompt ide konten'
`feature` · `Fitur baru` · impact **high** · effort **low** · skor **9.2** · confidence high  
**Masalah/Peluang:** copyAll() (sidepanel.js:360-366) hanya menyalin daftar mentah dengan emoji metrik. Untuk diumpankan ke AI, Alfin masih harus menulis sendiri instruksi 'analisa hook ini, bikin 5 ide konten ala IDX...' tiap kali.  
**Kenapa penting:** Tujuan inti produk: post viral -> umpan ke AI -> ide konten. Langkah 'umpan ke AI' sekarang butuh copy-paste + ngetik prompt manual berulang. Friction harian paling sering.  
**Fix konkret:** Tambah tombol footer 'Copy prompt' di sidepanel.html (dekat baris 138). Bungkus viewItems dalam template prompt siap pakai: 'Berikut N post viral Threads + metrik. Analisa pola hook & angle, beri 7 ide konten untuk niche [trading IDX/solopreneur]:' lalu daftar snippet+metrik. Tambah textarea template prompt yang bisa diedit di settings.js/settings.html.  
**Lokasi:** `sidepanel.js:360-366, sidepanel.html:137-143, settings.js:47-71`  

### P0.26 Footer 5 tombol icon-only tanpa label teks — no-coder susah nebak fungsinya
`improvement` · `Copywriting / microcopy` · impact **high** · effort **low** · skor **9.2** · confidence high  
**Masalah/Peluang:** Kelima tombol footer aksi utama (Copy semua, Export MD, Export XLSX, Bersihkan, Pengaturan) cuma ikon SVG + atribut title, tanpa teks. Ikon copyAll (dua kotak, sidepanel.js:40), md (sidepanel.js:41) dan xlsx (sidepanel.js:42) berukuran kecil dan mirip secara siluet. title cuma muncul saat hover lama, sering kepotong di side panel sempit.  
**Kenapa penting:** Export = tujuan inti produk (susun daftar viral -> umpan ke AI), tapi justru paling tidak terbaca. User harus trial-and-error klik tiap ikon untuk tau mana .md vs .xlsx vs copy. Gesekan langsung di alur 'temukan viral -> export'.  
**Fix konkret:** Tambah label teks kecil di dalam tiap tombol export, mis. di sidepanel.html:138-140 tambahkan <span class="fbtn-lbl">Copy</span> / MD / XLSX, lalu CSS .fbtn { flex-direction:column } + .fbtn-lbl { font-size:9px }. Minimal (tanpa ubah layout): pertegas title jadi 'Salin semua ke clipboard', 'Download Markdown (.md)', 'Download Excel (.xlsx)' di sidepanel.html:138-140.  
**Lokasi:** `sidepanel.html:138-142`  

### P0.27 Istilah inti (Skor, Rising, Requote, Rasio) tampil di panel tanpa hint — definisi cuma di tab help terpisah
`improvement` · `Copywriting / microcopy` · impact **high** · effort **low** · skor **9.2** · confidence high  
**Masalah/Peluang:** Dropdown Sort (sidepanel.html:118-126) punya opsi 'Skor' & 'Rising'; kartu menampilkan badge '↑.../j' (sidepanel.js:291); filter punya 'Requote' (sidepanel.html:102) dan 'Rasio komen/like' (sidepanel.html:94-96) — semua istilah teknis tanpa penjelasan inline. Definisi lengkap ada di help.html:39-45 tapi kebuka di TAB BARU (sidepanel.js:155), jadi user harus pindah konteks lalu balik.  
**Kenapa penting:** Buat no-coder, 'Rising' & 'Skor' itu jargon. Tanpa tooltip, user nggak ngerti kenapa urutan 'Skor' beda dari 'Likes' atau apa arti '↑1,2rb/j'. Akibatnya fitur diferensiasi produk (rising/skor — yang bikin tool ini > sekadar sortir like) jadi tidak terpakai.  
**Fix konkret:** Tambah atribut title (zero layout): badge rising sidepanel.js:291 -> <span class="vel" title="Rising: like per jam — lagi naik daun">; 'Requote' sidepanel.html:102 -> tambah title="Repost sambil dikutip/dikomentari". Untuk dropdown sort, tambah baris hint kecil di bawah results-head: 'Skor = bobot gabungan · Rising = like/jam'.  
**Lokasi:** `sidepanel.html:118-126, sidepanel.html:102, sidepanel.js:291`  

### P0.28 Kartu tidak terbedakan dari background di light mode (--card = --bg), pola kartu kebalik antar-halaman
`bug` · `ui-visual` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** Di sidepanel.css:12 dan :14, --bg:#ffffff dan --card:#ffffff bernilai SAMA. body pakai background:var(--bg-2)=#f3f4f6 (sidepanel.css:13,29), jadi kartu putih di atas bg abu-abu masih kelihatan. TAPI di settings.html:8 --bg:#fff dan --card:#f7f8fa (kartu abu di bg putih), help.html:8 --card:#f7f8fa, advanced.html:8 --card:#f3f4f6. Tiga halaman lain pakai pola 'kartu lebih gelap dari bg', sidepanel pakai pola 'kartu lebih terang dari bg-2'. Pola visual kartu kebalik antar-halaman.  
**Kenapa penting:** User no-coder yang loncat dari panel ke Pengaturan ke Diagnostik merasa 'kok kartunya beda rona' — terasa tidak satu produk. Lebih riskan: di sidepanel, kalau bg pernah ikut jadi putih (mis. high-contrast/forced colors), kartu hilang total karena card=bg, padahal card cuma mengandalkan border 1px var(--border) untuk batas.  
**Fix konkret:** Samakan strategi di SEMUA halaman: --bg:#f3f4f6; --card:#ffffff; --border:#e4e6ea (kartu putih nongol di bg abu). Atau minimal beda-kan --card dari --bg di sidepanel.css:14 supaya kartu tetap kebaca walau bg berubah. Konsisten satu pola untuk seluruh produk.  
**Lokasi:** `sidepanel.css:12-16, settings.html:8, help.html:8, advanced.html:8`  

### P0.29 Locate pakai kuning #f5c518 (warna ke-4 di luar brand), plus animasi flash MERAH di content.css yang dead code
`bug` · `ui-visual` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** Locate ('cari di feed') menandai post ketemu dengan KUNING: content.js:358-361 set outline 4px #f5c518 + boxShadow rgba(245,197,24,0.5). Kuning ini warna ke-4 di luar palet brand 3-warna (biru/putih/hitam). Selain itu content.css:4-10 mendefinisikan @keyframes tvdFlash MERAH rgba(255,77,79) + class .tvd-flash, TAPI grep ke seluruh *.js membuktikan .tvd-flash / tvdFlash TIDAK PERNAH di-apply (classList.add hanya untuk 'arm' & 'show'). Jadi animasi flash merah itu dead code yang tidak pernah jalan — bukan 'kedipan merah-lalu-kuning' seperti dugaan awal.  
**Kenapa penting:** Dua masalah nyata: (1) kuning #f5c518 jadi warna liar yang tidak ada di mana-mana lagi di produk, padahal locate adalah fitur inti — lebih konsisten kalau pakai biru brand yang lebih tebal/pulse untuk 'ketemu'. (2) content.css menyimpan animasi flash merah yang sudah tidak terpakai; merah di produk ini maknanya 'hapus/bahaya' (tombol arm clear #dc2626), jadi kalau .tvd-flash sempat dipakai lagi nanti akan bikin makna merah ambigu. Dead code juga menyesatkan saat maintenance.  
**Fix konkret:** 1) Ganti kuning locate (content.js:358,361) ke biru brand var(--blue) tapi lebih tebal (mis. outline 4px + boxShadow 0 0 0 6px hexA(blue,0.45)) supaya 'ketemu' = biru menonjol, bukan warna baru. 2) Hapus blok @keyframes tvdFlash + .tvd-flash di content.css:4-10 (dead code), ATAU kalau mau pakai flash, terapkan classList.add('tvd-flash') di goTo() dan ubah warnanya ke biru — JANGAN merah.  
**Lokasi:** `content.js:358-361, content.css:4-10, content.js:500`  

### P0.30 Chip velocity '↑..jt/j' paling rawan kepotong karna paling lebar & paling kanan
`bug` · `Responsiveness & ketahanan layout` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** velocity di-render sebagai `↑${fmt(v)}/j` (sidepanel.js:291) dan ditaruh paling akhir di .item-counts. fmt(v) bisa jadi string lebar seperti '1.2jt/j' / '34rb/j' (lihat fmt() sidepanel.js:215-221 dan velocity() js:209-212 — likes per jam bisa ribuan-jutaan untuk post viral baru). Karna .item-counts overflow:hidden + nowrap (sidepanel.css:145), chip ini hampir selalu yang pertama kepotong di panel sempit, padahal ini sinyal 'rising' yang dipakai sort 'rising' (sidepanel.js:261).  
**Kenapa penting:** Sort 'Rising' adalah salah satu mode urut andalan buat nemu post yang lagi meledak. User urutkan by rising, scroll daftar, tapi angka velocity-nya kepotong di panel sempit -> dia nggak bisa baca seberapa cepat naiknya. Fitur jadi setengah jalan persis di kondisi pemakaian normal (panel sempit di samping feed Threads).  
**Fix konkret:** Setelah memperbolehkan wrap di .item-counts (ide sebelumnya), tambahan: beri white-space:nowrap khusus di .vel (sidepanel.css:149) supaya '↑34rb/j' nggak pecah di tengah jadi '↑34rb' / '/j'. Set .vel { white-space:nowrap; }. Pertimbangkan juga menaruh chip velocity di awal .item-counts (geser sebelum like) supaya prioritas tampilnya naik, atau singkat satuan jadi '/h' opsional kalau ruang kritis.  
**Lokasi:** `sidepanel.css:145,149, sidepanel.js:291`  

### P0.31 Baris 'Sembunyikan Repost Requote' overflow di panel sempit (gap 16px, font 15px, no wrap)
`bug` · `Responsiveness & ketahanan layout` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** .hide-row (sidepanel.css:102-105) = display:flex; gap:16px; font-size:15px tanpa flex-wrap. Isinya 'Sembunyikan' + checkbox 'Repost' + checkbox 'Requote' (sidepanel.html:99-103), masing-masing pakai checkbox transform:scale(1.5) (sidepanel.css:108). Total lebar konten cukup gede; di card padding 13px pada panel 280px, baris ini mepet/keluar batas dan teks 'Requote' bisa terdesak/terpotong.  
**Kenapa penting:** Filter sembunyikan repost/requote penting karna prompt sendiri bilang repost/requote RAWAN salah deteksi di scraping. Kalau labelnya berdesakan atau checkbox 'Requote' kebuang ke kanan sampai susah diklik di panel sempit, user no-coder bingung mana yang dia centang.  
**Fix konkret:** Tambah flex-wrap:wrap dan kecilkan gap di .hide-row (css:102-105): gap:10px 14px; flex-wrap:wrap. Opsional turunkan font-size:14px. Uji di 280px: 'Sembunyikan' boleh di baris atas, dua checkbox di baris bawah, semua label kebaca penuh.  
**Lokasi:** `sidepanel.css:102-108, sidepanel.html:99-103`  

### P0.32 results-head: teks stats panjang vs #sort bisa tabrakan (no min-width:0 / shrink control)
`bug` · `Responsiveness & ketahanan layout` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** .results-head (sidepanel.css:128) flex space-between gap:10px, isi .stats 'Dipindai: 9999 • Viral: 999' (di-set di sidepanel.js:310; .stats font-weight:800 font-size:15px lewat css:53,56) + <select id=sort> dengan max-width:52% (sidepanel.css:129). .stats tidak punya overflow/ellipsis/min-width. Di panel ~280px dengan angka scanned ribuan, teks stats melebar dan mendorong/menabrak select sort; karena keduanya nggak diberi min-width:0, teks bisa meluber.  
**Kenapa penting:** Stats (jumlah dipindai/viral) adalah feedback utama kalau scraping jalan. Kalau ketabrak dropdown sort di panel sempit, user nggak yakin scan berhasil. Ini juga bagian yang dipelototin pas auto-scroll lagi jalan (angka naik terus).  
**Fix konkret:** Di .results-head (css:128) tambah: flex-wrap:wrap; row-gap:8px. Beri .stats { flex:1 1 auto; min-width:0; } dan #sort { flex:0 0 auto; max-width:none; } supaya kalau sempit dropdown turun ke baris bawah, bukan ketindih. Atau pertahankan satu baris tapi kasih .stats min-width:0 + sort flex-shrink:0. Uji 280px dengan stats 'Dipindai: 12480 • Viral: 327'.  
**Lokasi:** `sidepanel.css:128-129, sidepanel.js:310`  

### P0.33 Versi 'v0.5' tertinggal di 3 file padahal manifest sudah v0.6.0
`bug` · `Copywriting / microcopy` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** manifest.json:4 = "0.6.0", tapi komentar header sidepanel.js:1 ('v0.5') dan content.js:2 ('content script (v0.5)') masih lama, dan yang paling kelihatan user: file export setelan menulis _v: "0.5" ke JSON di settings.js:75. help.html tidak mencantumkan versi sama sekali, jadi user tak bisa cek lagi pakai versi berapa.  
**Kenapa penting:** Alfin vibe-coder iterasi terus & sering export/import setelan. Stempel _v salah di file backup bikin dia bingung file mana yang terbaru saat restore. Versi mismatch = sinyal produk tidak terawat.  
**Fix konkret:** Ganti settings.js:75 _v: "0.5" -> baca dari manifest biar nggak pernah basi: _v: chrome.runtime.getManifest().version. Update komentar header sidepanel.js:1 dan content.js:2 ke v0.6.0. Tambah baris versi kecil di help.html (mis. di footer dekat help.html:50): <p class="muted">ThreadLens v0.6.0</p>.  
**Lokasi:** `settings.js:75, sidepanel.js:1, content.js:2, help.html:50`  

### P0.34 Export diam-diam pakai viewItems (terfilter search), bukan semua hasil
`bug` · `Aktivasi / kepercayaan pada hasil` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** exportMd/exportXlsx/copyAll export viewItems (sidepanel.js:343,355,361), yaitu hasil SETELAH search-box & sort diterapkan (applyView, sidepanel.js:253-265, terutama filter search di 255-256). Kalau user ngetik sesuatu di 'cari di hasil…' (sidepanel.html:130) lalu lupa mengosongkan, lalu klik Export, dia diam-diam cuma meng-export subset — tanpa peringatan. Tombol ber-title 'Copy semua' / 'Export…' (sidepanel.html:138-140) yang menyiratkan SEMUA.  
**Kenapa penting:** User nyangka dia export 80 post hasil scan, ternyata cuma 5 yang cocok search. Karena nggak ada indikator 'kamu sedang menyaring X dari Y', ini diam-diam ngerusak hasil riset — dan user baru sadar saat sudah di-feed ke AI. Merusak kepercayaan, tepat di titik konversi.  
**Fix konkret:** Pilihan A (cepat): saat search box terisi & viewItems.length < rawItems.length, kasih konfirmasi 'Export 5 dari 80 (lagi disaring "xxx"). Lanjut?' sebelum download. Pilihan B (lebih jelas): tampilkan badge di results-head (sidepanel.html:116-117) 'Menampilkan 5 / 80' (viewItems vs rawItems) supaya user selalu sadar konteks. Idealnya keduanya.  
**Lokasi:** `sidepanel.js:342-366, sidepanel.js:253-265, sidepanel.html:116-130`  

### P0.35 README salah: ⚙ membuka Pengaturan, bukan "Advanced / Debug"
`bug` · `docs` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** README.md:42 menulis: "Klik ⚙️ di pojok kanan bawah panel → halaman Advanced / Debug." Faktanya tombol ⚙ (sidepanel.html:142, id="settings") memanggil sidepanel.js:156 yang membuka settings.html, BUKAN advanced.html. Halaman Diagnostik baru bisa dicapai lewat link di dalam settings.html:68 ("Diagnostik (Debug) → Buka").  
**Kenapa penting:** Ini bagian "Kalau ada yang meleset" — justru bagian yang dibaca Alfin saat panik karena angka kosong. Instruksi salah arah: dia klik ⚙ mengira lihat sampel angka diagnostik, malah dapat halaman tema/warna. Untuk no-coder yang ikut langkah harfiah, ini bikin troubleshooting buntu di langkah pertama.  
**Fix konkret:** Perbaiki README.md:42 jadi: "Klik ⚙ (Pengaturan) di pojok kanan bawah panel → di halaman itu klik 'Diagnostik (Debug) → Buka' untuk halaman Advanced." Atau, kalau ingin akses 1-klik, tambah tombol Diagnostik langsung di panel.  
**Lokasi:** `README.md:42; sidepanel.js:156; sidepanel.html:142; settings.html:68`  

### P0.36 Setelah reload, 'Dipindai' bisa LEBIH KECIL dari 'Viral' (seenIds tidak ikut dipulihkan)
`bug` · `Data / storage / state` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** Saat boot, tvdHistory dipulihkan ke viralMap (content.js:565) sehingga viralMap.size langsung berisi mis. 120 post. TAPI seenIds (baris 56) tetap kosong dan baru terisi saat post benar-benar di-scan ulang di sesi baru. stats.scanned = seenIds.size dan stats.viral = viralMap.size (baris 424). Jadi tepat setelah buka panel pasca-reload: 'Dipindai: 3 • Viral: 120' — viral jauh melebihi dipindai.  
**Kenapa penting:** Ini langsung merusak kepercayaan no-coder pada angka inti yang dia pelototin. Rasio Dipindai-vs-Viral yang terbalik bikin Alfin curiga datanya ngaco / extension bug, padahal datanya valid — cuma counter-nya yang tidak konsisten. Berbeda dari ide 'seenIds menggelembung' (itu soal naik terus); ini soal inversi angka saat startup.  
**Fix konkret:** Di callback storage boot (content.js:563-567), saat memuat tvdHistory ke viralMap, sekalian seenIds.add(it.id) untuk tiap item. Atau ubah definisi stats.scanned jadi Math.max(seenIds.size, viralMap.size), atau pisahkan label jadi 'Tersimpan: N' vs 'Dipindai sesi ini: M' supaya tidak menyesatkan.  
**Lokasi:** `content.js:56, content.js:424, content.js:563-567`  

### P0.37 Rising (velocity) menyamaratakan semua post super-baru ke nilai identik karena floor 0.5 jam
`bug` · `Mesin scraping & logika` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** velocity(r) = counts.likes / Math.max(0.5, (Date.now()-timeMs)/3.6e6) (sidepanel.js:209-212). Floor 0.5 berarti post berumur < 30 menit semua dibagi 0.5 jam yang sama. Untuk post 2 menit (timeMs dari getPostTime relatif '2m') dengan 5000 like, velocity dihitung = 10000/j — sama persis seperti post 29 menit dengan like sama. Padahal post 2 menit JAUH lebih 'rising'. Selain itu getPostTime untuk '2m' menghasilkan timeMs ~2 menit lalu, sehingga banyak post fresh menumpuk di floor yang sama.  
**Kenapa penting:** Rising adalah fitur andalan Alfin untuk nangkep post yang 'lagi naik daun' sebelum meledak — justru di rentang menit-menit pertama itu sinyalnya paling berharga. Floor 0.5 jam membunuh resolusi di window paling penting, bikin sort Rising tidak membedakan post 2 menit vs 28 menit. Ide 'engagement velocity berjendela' di daftar adalah fitur delta yang beda; ini bug presisi pada formula yang SUDAH ada.  
**Fix konkret:** Turunkan floor jadi mis. Math.max(1/60, ageHours) (1 menit) atau gunakan jendela bertingkat. Lebih baik: kalau umur < 10 menit tandai sebagai 'baru' dan urutkan tie-break pakai timeMs terbaru. Dokumentasikan di help bahwa Rising paling akurat saat waktu post kebaca.  
**Lokasi:** `sidepanel.js:209-212, content.js:182-187`  

### P0.38 Export XLSX menulis sel angka kosong sebagai string '' — kolom jadi teks, sort & SUM di Excel rusak
`bug` · `Data / storage / state` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** exportXlsx mendorong r.counts.likes ?? '' (sidepanel.js:357). xlsx-mini menganggap typeof number jadi <v> numerik, selain itu jadi inlineStr (xlsx-mini.js:96-100). Jadi satu kolom Likes campur: sebagian sel angka, sebagian sel teks '' (untuk post yang likes-nya null). Excel/Sheets akan menolak SUM/AVERAGE yang benar dan sort numerik jadi kacau karena kolom dianggap mixed/text.  
**Kenapa penting:** Tujuan eksplisit export .xlsx adalah 'buat report' (README) — Alfin akan sort by Likes, jumlahkan, atau bikin pivot. Sel teks tersembunyi di tengah kolom angka adalah jebakan klasik yang bikin total salah tanpa peringatan. Berbeda dari ide formula-injection dan 'kolom export kurang sinyal'; ini soal tipe data sel yang merusak fungsi spreadsheet.  
**Fix konkret:** Di exportXlsx, kirim angka asli atau null (bukan ''): gunakan r.counts.likes == null ? null : r.counts.likes. Lalu di xlsx-mini sheetXml, kalau val null/undefined tulis sel kosong <c r=.../> tanpa <is>, bukan inlineStr ''. Ini menjaga kolom tetap bertipe numerik di Excel.  
**Lokasi:** `sidepanel.js:357, vendor/xlsx-mini.js:96-100`  

### P0.39 Auto-scroll lanjut selamanya membakar CPU saat feed sudah mentok bawah (bounce -80 tak pernah berhenti)
`bug` · `GAP / silent failure + performa` · impact **medium** · effort **low** · skor **8.7** · confidence high  
**Masalah/Peluang:** tick() di startScroll (content.js:472-478) saat scrollTop tidak berubah cuma melakukan scrollBy(0,-80) lalu lanjut. Tidak ada deteksi 'stuck'. Kalau Threads berhenti meng-load (akhir feed, error jaringan, atau kolom habis), interval terus jalan tiap ~200-700ms, memanggil processPosts() penuh tiap tick tanpa henti.  
**Kenapa penting:** Alfin sering tinggal panel jalan sambil ngerjain hal lain (dia multitasking: trading, CapCut). Auto-scroll yang nggak pernah berhenti = laptop panas, kipas kencang, baterai habis, dan dia balik nemu 0 post baru tapi 'Dipindai' menggelembung. Tidak ada sinyal bahwa scroll sudah mentok.  
**Fix konkret:** Di tick(), hitung stuckCount: kalau posisi scroll TIDAK berubah DAN viralMap.size tidak bertambah selama N tick berturut-turut (mis. 6), panggil stopScroll() dan toast('Auto-scroll berhenti — udah sampai ujung feed / nggak ada post baru.'). Ini sekaligus jawab kebutuhan 'auto-stop' tapi yang ini fokus ke silent CPU burn, bukan fitur.  
**Lokasi:** `content.js:469-481`  

### P0.40 ratioOk membuang post saat likes tak terbaca (null) seakan-akan rasio gagal
`bug` · `Mesin scraping & logika` · impact **medium** · effort **low** · skor **8.5** · confidence medium  
**Masalah/Peluang:** ratioOk (content.js:226-231): jika minRatio>0 dan counts.likes null/0 ATAU counts.comments null → return false (post dibuang). Rasio dihitung comments/likes. Saat likes gagal terbaca (sering, lihat temuan suffix 'm'), post bagus langsung gugur — tidak dibedakan antara 'tidak terbaca' (null) dan 'benar-benar 0'.  
**Kenapa penting:** Filter rasio dipakai untuk cari post 'engagement bagus', tapi keterkaitannya dengan keandalan parsing membuatnya tak bisa dipercaya: satu kegagalan baca likes meng-nol-kan seluruh post meski metrik lain kuat. Untuk no-coder hasilnya 'kok postnya hilang' tanpa sebab jelas.  
**Fix konkret:** Bedakan null dari 0. Kalau likes null, jangan langsung buang — lewati filter rasio (return true) atau tandai 'rasio tak bisa dihitung'. Pertimbangkan badge di kartu kalau rasio di-skip karena data kurang.  
**Lokasi:** `content.js:226-231`  

### P0.41 Hasil 0 tidak bisa dibedakan: belum konek vs memang belum ada yang lolos kriteria
`improvement` · `UX / alur interaksi` · impact **high** · effort **medium** · skor **8.2** · confidence high  
**Masalah/Peluang:** renderList (sidepanel.js:270-305) cuma toggle #empty dengan teks statis "Belum ada data. Buka threads.com lalu refresh" (sidepanel.html:134). Tidak ada pembedaan 3 keadaan: (a) content script belum ke-inject / tab Threads tidak ada (sendToTab balik null, sidepanel.js:74,385-386), (b) sudah scan banyak post tapi 0 lolos kriteria (stats.scanned besar, viral 0), (c) belum scan apa-apa (scanned 0). Statbar (sidepanel.js:310) menampilkan "Dipindai: N • Viral: 0" tapi user no-coder tidak menghubungkan angka itu ke "kriteria saya kelewat ketat".  
**Kenapa penting:** Silent failure paling bikin frustrasi. Kalau scanned=200 viral=0, masalahnya threshold keketatan (mis. like ≥1000 default) — solusinya turunin angka, BUKAN refresh. Tapi teks empty malah nyuruh refresh → user muter-muter. Kalau tab Threads memang tidak ada, teks-nya benar tapi tercampur jadi tidak meyakinkan.  
**Fix konkret:** Buat #empty kontekstual di renderList pakai data yang sudah ada (state.stats di renderState, sidepanel.js:307-322): kalau sendToTab init null → "Belum nyambung ke Threads. Buka tab threads.com lalu refresh". Kalau stats.scanned===0 → "Lagi nunggu post… scroll feed-nya atau tekan ▶ auto-scroll". Kalau scanned>0 && viral===0 → "Dipindai N post, belum ada yang lolos kriteria. Coba turunkan ambang Like/Komen atau ganti logika AND→OR" + tombol cepat "Longgarkan kriteria".  
**Lokasi:** `sidepanel.js:270-305, sidepanel.js:307-322, sidepanel.html:134`  

### P0.42 MutationObserver subtree:true di seluruh body bikin scan nembak terus di SPA React Threads
`improvement` · `Performa` · impact **high** · effort **medium** · skor **8.2** · confidence high  
**Masalah/Peluang:** boot() memasang `mo.observe(document.body, { childList: true, subtree: true })` (content.js:559) lalu callback debounce 600ms memanggil scheduleScan (content.js:558). Threads adalah React SPA yang terus-menerus mutate DOM (hover, intersection, lazy-load gambar, animasi, virtualisasi feed). Setiap mutasi reset timer; saat feed aktif/di-scroll, mutasi datang lebih cepat dari 600ms sehingga timer jarang 'settle' dan ketika settle scan jalan di lantai throttle 450ms (scheduleScan, content.js:372) berulang-ulang.  
**Kenapa penting:** Observer subtree global adalah sumber overhead utama di halaman se-rame Threads. Callback MutationObserver (clearTimeout+setTimeout) dipanggil sangat sering. Ditambah scan yang berat (lihat ide processPosts), ini yang bikin tab Threads panas/lag saat panel kebuka, padahal feed mungkin tidak menambah post baru sama sekali.  
**Fix konkret:** Sempitkan observasi: jangan observe document.body. Setelah detectColumns menemukan elemen scroller kolom, observe HANYA container itu (re-attach saat kolom berubah). Di callback observer, abaikan mutasi yang bukan penambahan node post: `for (const m of mutations) if (m.addedNodes.length && [...m.addedNodes].some(n=>n.nodeType===1 && (n.matches?.('div[data-pressable-container]') || n.querySelector?.('svg[aria-label]')))) { dirty=true; break; }` dan hanya scheduleScan kalau dirty. Naikkan debounce ke ~800-1000ms.  
**Lokasi:** `content.js:558-559, content.js:371-374`  

### P0.43 processPosts men-scan svg[aria-label] dua kali + innerText dibaca 3x per post memaksa reflow
`improvement` · `Performa` · impact **high** · effort **medium** · skor **8.2** · confidence high  
**Masalah/Peluang:** Per scan: findLikeSvgs(root) `querySelectorAll('svg[aria-label]')` lalu filter SEMUA svg (content.js:131). Untuk tiap container, extractCounts melakukan `querySelectorAll('svg[aria-label]')` LAGI (content.js:147). Lebih parah dari klaim awal: per post `c.innerText` dibaca TIGA kali — getSnippet (content.js:165), getPostTime (content.js:182), dan fullText untuk keywordOk (content.js:392) — innerText tiap kali memaksa layout/reflow. mediaTypeOf loop semua img baca `clientWidth/clientHeight` (content.js:197) — reflow lagi. countNearSvg juga `querySelectorAll('span,div')` per tombol metrik (content.js:118).  
**Kenapa penting:** Di feed dengan 50-150 post termuat = ratusan querySelectorAll svg + ratusan pembacaan innerText/clientWidth yang masing-masing bisa men-trigger forced synchronous layout. Dikali frekuensi scan (220-700ms) = penyebab langsung jank saat scroll. Bukan saran generik: innerText dipanggil 3x per post (165+182+392) padahal cukup sekali.  
**Fix konkret:** 1) Baca `c.innerText` SEKALI di awal loop processPosts, oper hasilnya ke getSnippet, getPostTime, dan keywordOk (hapus pembacaan kedua di content.js:182 & ketiga di content.js:392). 2) Cache hasil per container via dataset signature: simpan svg-count + teks tombol, kalau sama dengan scan lalu, skip pemrosesan ulang. 3) Ganti mediaTypeOf pakai `naturalWidth`/atribut width atau cek `c.querySelector('img[srcset], video')` tanpa baca clientWidth. 4) extractCounts terima daftar svg yang sudah dikumpulkan di postContainerFromSvg agar tak querySelectorAll ulang.  
**Lokasi:** `content.js:129-135, content.js:145-154, content.js:164-188, content.js:194-200, content.js:384-392`  

### P0.44 detectColumns: querySelectorAll('span,div,a') seluruh dokumen + getComputedStyle berulang = reflow mahal
`improvement` · `Performa` · impact **high** · effort **medium** · skor **8.2** · confidence high  
**Masalah/Peluang:** detectColumns saat cache miss (>3s) melakukan `document.querySelectorAll('h1,h2,h3,[role="heading"],span,div,a')` (content.js:270) — di Threads bisa puluhan ribu node, lalu per kandidat header baca getBoundingClientRect (content.js:276). findScrollContainer (content.js:246-254) & scrollerUnderHeader (content.js:255-264) loop parent/div sambil panggil `getComputedStyle(n)` + baca scrollHeight/clientHeight — semua pemicu forced reflow. detectColumns dipanggil tiap processPosts (content.js:420) dan juga lewat findColumnEl/getScanRoot/scrollTargetEl.  
**Kenapa penting:** querySelectorAll('span,div') tanpa filter di SPA adalah salah satu operasi DOM termahal. Meski ada cache 3s, tiap 3s ada lonjakan freeze terlihat. getComputedStyle dalam loop di tengah pembacaan layout memicu layout-thrashing klasik. Untuk produk 1-3 kolom, biaya scan kolom tak sebanding.  
**Fix konkret:** 1) Persempit query header: pakai selektor spesifik dulu (`[role="heading"], h1, h2`) dan fallback ke span/div hanya bila kosong; atau batasi ke `document.querySelectorAll('header *, [role="tablist"] *')` sesuai struktur Threads. 2) Naikkan cache TTL dari 3000 ke ~8000ms (kolom jarang berubah) — content.js:268. 3) Cache hasil findScrollContainer per svg via WeakMap supaya getComputedStyle tak diulang. 4) processPosts cukup pakai cache detectColumns, jangan paksa hitung ulang count tiap scan.  
**Lokasi:** `content.js:246-306, content.js:266-268, content.js:420`  

### P0.45 renderList rebuild innerHTML seluruh daftar tiap update — reset scroll panel + re-parse SVG
`improvement` · `Performa` · impact **high** · effort **medium** · skor **8.2** · confidence high  
**Masalah/Peluang:** renderList melakukan `list.innerHTML = ''` (sidepanel.js:272) lalu createElement+innerHTML untuk SETIAP kartu (sidepanel.js:277-296), dipanggil dari applyView (sidepanel.js:264) yang dipanggil renderState→applyView (sidepanel.js:321) setiap broadcast 'results' dari content (sidepanel.js:371). Content mem-broadcast tiap selesai scan (220-700ms saat aktif). Tiap kartu menyuntik string SVG ikon (heart/comment/repost/share/open) yang di-parse ulang tiap render.  
**Kenapa penting:** Dampak nyata: (1) scroll position panel ke-reset ke atas tiap ~0.2-0.5 detik saat auto-scroll jalan — bikin daftar 'lompat' dan tak terbaca Alfin saat ngumpulin post. (2) Flicker. (3) Buang & re-parse ratusan node SVG tiap render untuk data yang 99% sama. Langsung mengganggu use-case inti 'lihat daftar viral sambil auto-scroll'.  
**Fix konkret:** Diff berbasis id: simpan map id→element, hanya tambah kartu untuk id baru, update teks/angka kartu existing bila berubah, hapus kartu yang hilang; reorder pakai pengurutan node tanpa innerHTML full. Langkah cepat: skip render kalau signature daftar (ids+counts+sort+search) identik dengan render sebelumnya — `if (sig===_lastSig) return;` di awal renderList. Ini saja menghilangkan reset-scroll & flicker saat tak ada perubahan.  
**Lokasi:** `sidepanel.js:270-305, sidepanel.js:253-265, sidepanel.js:307-322`  

### P0.46 Star/simpan post + catatan per post
`feature` · `Fitur baru` · impact **high** · effort **medium** · skor **8.2** · confidence high  
**Masalah/Peluang:** Tidak ada cara menandai post mana yang benar-benar mau dipakai. viralMap (content.js:54) cuma hold/dismiss. Saat scan menemukan ratusan post, Alfin tidak bisa memisahkan 'ini 8 yang mau aku jadiin konten'.  
**Kenapa penting:** Riset = filter dari banyak ke sedikit. Tanpa shortlist, daftar viral cuma jadi feed kedua. Catatan ('angle: pakai untuk thread IDX cut-loss') menghubungkan riset langsung ke eksekusi.  
**Fix konkret:** Tambah field rec.starred & rec.note di pembentukan record (content.js:407-412) dan ikutkan saat saveHistory (content.js:450-458). Tombol bintang + input catatan kecil di kartu renderList (sidepanel.js:279-296). Tambah opsi sort/filter 'Hanya berbintang' di applyView (sidepanel.js:253-264). Catatan ikut ke semua export.  
**Lokasi:** `content.js:407-412, content.js:450-458, sidepanel.js:279-296`  

### P0.47 Empty state generik — tidak bedakan 'feed belum discan' vs 'filter terlalu ketat' vs 'pencarian kosong'
`improvement` · `Copywriting / microcopy` · impact **high** · effort **medium** · skor **8.2** · confidence high  
**Masalah/Peluang:** Satu-satunya pesan kosong (sidepanel.html:134): 'Belum ada data. Buka threads.com, lalu (kalau baru update) refresh halamannya.' renderList() di sidepanel.js:270-273 cuma toggle display berdasar arr.length, tanpa bedakan: (1) rawItems kosong total, (2) sudah scan 200 tapi 0 lolos kriteria/filter, (3) search 'X' nggak ketemu. Stats di atas bisa bilang 'Dipindai: 200 • Viral: 0' tapi list kosong dengan pesan nyuruh refresh — menyesatkan.  
**Kenapa penting:** User akan refresh halaman berulang (sesuai instruksi pesan) padahal masalahnya filter/ambang, bukan data. Loop frustrasi untuk no-coder yang percaya 100% sama microcopy.  
**Fix konkret:** Buat empty-state kondisional di renderList()/applyView(): kalau rawItems.length===0 -> pesan sekarang; kalau rawItems.length>0 tapi hasil tersaring 0 -> 'Sudah dipindai tapi belum ada yang lolos kriteria. Coba turunkan ambang Like/Komentar atau ganti OR/AND.'; kalau search aktif & 0 hasil -> 'Nggak ada yang cocok dengan pencarian "X".' Bisa pakai variabel di applyView() (sidepanel.js:253-264) untuk tahu apakah filter search yang menyebabkan kosong.  
**Lokasi:** `sidepanel.html:134, sidepanel.js:253-264, sidepanel.js:270-273`  

### P0.48 Threshold default like ≥1000 bikin 'Viral: 0' tanpa panduan turunin ambang
`improvement` · `Aktivasi / konversi (dapat nilai cepat)` · impact **high** · effort **medium** · skor **8.2** · confidence high  
**Masalah/Peluang:** Default kriteria: likes≥1000, komentar≥100, repost≥100, share≥100 dengan logic OR (sidepanel.js:6-11; juga di content.js:33-38). Untuk banyak feed Threads Indonesia (akun kecil, niche IDX/saham), post tembus 1000 like jarang. Setelah scroll lama, panel bisa nunjukin 'Dipindai: 120 • Viral: 0' (sidepanel.js:310) tanpa satu kartu — dan nggak ada hint bahwa solusinya cukup turunin angka ambang.  
**Kenapa penting:** Skenario 'scroll capek, hasil nol' adalah pembunuh aktivasi nomor dua setelah empty-state. User nyimpulin 'nggak ada yang viral' / 'extension-nya salah', padahal cuma ambangnya ketinggian buat feed dia. Dia nggak dapat first-win, nggak pernah sampai ke export.  
**Fix konkret:** Saat state.stats.scanned > ~30 tapi state.stats.viral === 0 (data sudah ada di renderState, sidepanel.js:307-310), tampilkan di #empty CTA spesifik: 'Dipindai 120 post, belum ada yang tembus ambang. Coba turunin Likes ke 100?' + tombol satu-klik yang nge-set settings.metrics.*.min ke nilai lebih rendah lalu save()+pushSettings(). Bisa otomatis: ambil persentil-90 like dari rawItems yang ke-scan dan sarankan angka itu.  
**Lokasi:** `sidepanel.js:6-11, sidepanel.js:307-310, sidepanel.js:270-273, content.js:232-243`  

### P0.49 Export .md/.xlsx tanpa metadata filter — AI nggak tahu konteks datanya
`improvement` · `REFRAME SEO → struktur export agar AI-ready` · impact **high** · effort **medium** · skor **8.2** · confidence high  
**Masalah/Peluang:** exportMd (sidepanel.js:342-353), exportXlsx (354-359), copyAll (360-366) semua nge-dump viewItems tanpa header konteks. .md cuma tulis '# ThreadLens — Export, N post, timestamp' (sidepanel.js:344). Nggak ada: kolom apa yang dipantau (settings.crawlTarget), periode (settings.dateRange 1d/7d/lifetime), keyword filter, ambang viral per metrik, sumber (Threads), atau definisi Skor. Saat file ini diumpankan ke AI buat 'kasih ide konten', AI nggak tahu '1500' itu like atau apa, nggak tahu ini post 1 hari atau 1 tahun, nggak tahu Skor itu rumus apa.  
**Kenapa penting:** Tujuan inti produk = export buat diumpankan ke AI jadi ide konten (konversi nilai sebenarnya ada di SINI, bukan di panel). Tanpa metadata, AI berhalusinasi konteks atau kasih saran generik. Ini persis 'reframe SEO' untuk produk privat: yang dioptimasi untuk dibaca bukan Google, tapi LLM yang baca export-mu.  
**Fix konkret:** Di exportMd, tambah blok konteks sebelum tabel: sumber (Threads), tanggal export (sudah ada stamp(), sidepanel.js:331), periode (settings.dateRange), kolom dipantau (settings.crawlTarget), keyword (settings.keyword), ambang per metrik (settings.metrics), + 1 baris definisi Skor (like + komen×3 + repost×5 + share×4, lihat score() sidepanel.js:205-208). Untuk xlsx, tambah baris meta di atas tabel aoa (atau sheet kedua — perlu sedikit perluasan vendor/xlsx-mini.js). copyAll tambahkan 1 baris header konteks di awal string (sidepanel.js:362).  
**Lokasi:** `sidepanel.js:342-353, sidepanel.js:354-359, sidepanel.js:360-366, vendor/xlsx-mini.js`  

### P0.50 Tracking tren lintas-sesi (post sama naik berapa sejak terakhir)
`feature` · `Fitur baru` · impact **high** · effort **medium** · skor **8** · confidence medium  
**Masalah/Peluang:** saveHistory (content.js:450-458) menimpa tvdHistory dengan snapshot terbaru; rescanAll/clearList malah menghapusnya (content.js:438,445). counts lama tidak pernah dibandingkan dengan baru, jadi tidak ada delta.  
**Kenapa penting:** 'Post ini naik +12rb likes dalam 6 jam' adalah sinyal viral jauh lebih kuat daripada angka absolut, dan lebih andal daripada velocity yang bergantung waktu-relatif yang sering gagal dibaca (unknownTime di advanced.js:17). Mendukung pola pikir delta-nya sebagai trader.  
**Fix konkret:** Simpan map id -> {counts, ts} terpisah dari history aktif (jangan dihapus saat clear di content.js:438,445). Saat scan, jika id sudah ada, hitung deltaLikes = counts.likes - prev.likes & perJam. Tampilkan badge '+12rb sejak tadi' di kartu, tambah sort 'momentum' (sidepanel.js:257-262).  
**Lokasi:** `content.js:438-458, sidepanel.js:209-212, sidepanel.js:257-262`  

---

## 🟠 P1 — Tinggi  (56)

### P1.1 Eviction FIFO + Object.assign tak refresh urutan → post on-screen kebuang, urutan kacau
`bug` · `Mesin scraping & logika` · impact **medium** · effort **medium** · skor **7.7** · confidence high  
**Masalah/Peluang:** Saat viralMap.size > maxItems, content.js:411 menghapus key paling lama DIMASUKKAN (viralMap.keys().next().value). Tapi update post yang sudah ada (content.js:412 Object.assign) TIDAK memindahkan key ke akhir Map. Lalu content.js:421 Array.from(viralMap.values()).reverse() menampilkan berdasarkan urutan insertion (dibalik), bukan urutan terlihat/terbaru.  
**Kenapa penting:** Saat user auto-scroll panjang melewati >maxItems post, post lama yang MASIH terlihat di layar (dan baru saja di-update via Object.assign) bisa dievaksi hanya karena dimasukkan duluan, sementara post di luar layar yang masuk belakangan bertahan. Daftar di panel 'kehilangan' post yang jelas-jelas viral di depan mata. Default sort 'recent' di sidepanel (sidepanel.js:259) menutupi sebagian, tapi sebelum sort jalan urutan content order menyesatkan.  
**Fix konkret:** Saat update existing record, re-insert agar jadi 'most recently touched': viralMap.delete(id); viralMap.set(id, rec). Untuk eviction, hapus berdasarkan kriteria nyata (skor terendah atau timeMs terlama), bukan FIFO insertion. Minimal jadikan Map LRU supaya yang masih aktif di layar tak kebuang duluan.  
**Lokasi:** `content.js:409-412,421`  

### P1.2 Filter keyword viral pakai fullText (innerText), tapi Search panel pakai snippet — inkonsisten
`bug` · `Mesin scraping & logika` · impact **medium** · effort **medium** · skor **7.7** · confidence high  
**Masalah/Peluang:** keywordOk (content.js:210-220) dipanggil di content.js:400 terhadap fullText = c.innerText (content.js:392) — seluruh teks termasuk username, '2h', '1,2rb', label tombol. Sementara kotak Search di panel (sidepanel.js:255-256) memfilter terhadap r.user dan r.snippet (teks bersih dipotong 180 char di getSnippet). Dua mekanisme 'cari kata' bekerja di sumber teks berbeda.  
**Kenapa penting:** Hasilnya tak konsisten untuk no-coder: keyword filter bisa MELOLOSKAN post karena kata cocok di metadata/angka (mis. 'rb','h', username) padahal tak ada di isi; sebaliknya Search panel bisa TIDAK menemukan kata yang ada di bagian post terpotong dari snippet (>180 char). Alfin tak akan paham kenapa hasil dua kotak beda.  
**Fix konkret:** Samakan sumber. Simpan satu field teks bersih badan post (tanpa username/timestamp/angka metrik, tidak dipotong) di record, lalu pakai untuk keywordOk DAN Search panel. Atau minimal jalankan keywordOk terhadap snippet yang sama yang dilihat user. Dokumentasikan di help bahwa 'filter keyword' & 'search' mencari di teks isi post.  
**Lokasi:** `content.js:210-220,392,400; sidepanel.js:255-256`  

### P1.3 importSettings percaya JSON mentah — tidak ada validasi tipe, panel bisa crash
`bug` · `Data / storage / state` · impact **medium** · effort **medium** · skor **7.7** · confidence high  
**Masalah/Peluang:** settings.js:83-102 importSettings hanya cek `data.tvdSettings` truthy lalu `Object.assign(structuredClone(DEFAULTS), data.tvdSettings)` (line 91) dan `toSet.tvdPresets = data.tvdPresets` (line 92) tanpa cek tipe apa pun. Karena Object.assign cuma shallow-merge, JSON valid tapi isi ngawur (mis. `metrics: null`, `media: 123`, `maxItems: "banyak"`, tvdPresets berupa array/string) langsung menimpa default dan ditulis ke storage.  
**Kenapa penting:** Dampak nyata: kalau file impor punya `metrics: null`, Object.assign menimpa metrics default jadi null → ditulis ke tvdSettings. Saat sidepanel dibuka, applySettingsToControls (sidepanel.js:115-119) langsung akses `settings.metrics[k].on` → TypeError → panel blank/mati saat dibuka. `maxItems` string bikin `while (viralMap.size > settings.maxItems)` di content.js:411 jadi NaN-compare → cap tidak jalan → storage membengkak. (Content.js sendiri agak selamat karena mergeSettings di content.js:67-83 hanya baca key whitelist dengan cek nullish — tapi sidepanel tidak punya proteksi itu.) Karena dipakai pribadi & file impor biasanya hasil export sendiri risikonya medium, tapi sekali file ke-edit manual / korup, panel mati total tanpa pesan jelas.  
**Fix konkret:** Tambah validasi di importSettings sebelum set: clamp `maxItems` ke Number lalu Math.max(20, ...); pastikan `metrics` tiap key objek `{on:boolean,min:number}` (kalau bukan, pakai default); `media` objek boolean; dan tvdPresets harus objek non-array: `if (data.tvdPresets && typeof data.tvdPresets==="object" && !Array.isArray(data.tvdPresets)) toSet.tvdPresets = data.tvdPresets`. Idealnya pakai fungsi merge defensif bergaya content.js mergeSettings (whitelist key + cek typeof per field) dan share lewat defaults.js yang sama (lihat ide DEFAULTS divergen).  
**Lokasi:** `settings.js:83-102, settings.js:91, sidepanel.js:115-119, content.js:411`  

### P1.4 DEFAULTS triplikat & DIVERGEN — settings.js kehilangan excludeQuotes
`bug` · `Maintainability / tech debt` · impact **medium** · effort **medium** · skor **7.7** · confidence high  
**Masalah/Peluang:** Objek DEFAULTS disalin di 3 tempat (content.js:31-51, sidepanel.js:3-25, settings.js:3-9) tanpa shared source. Ketiganya sudah beda field: settings.js DEFAULTS (baris 3-9) TIDAK punya excludeQuotes, padahal content.js:43 dan sidepanel.js:16 punya. settings.js inilah DEFAULTS "resmi" saat Reset (settings.js:65) DAN saat Import (settings.js:91, Object.assign(structuredClone(DEFAULTS), data.tvdSettings)).  
**Kenapa penting:** Saat user buka settings.html lalu klik Reset (settings.js:63-70), settings di-set ke DEFAULTS versi settings.js yang tak punya excludeQuotes; objek tersimpan kehilangan field itu, lalu pushToTab → mergeSettings di content.js:67-83 hanya menyalin key 'excludeQuotes' bila saved[k] != null (content.js:70-71), jadi balik ke default false. Efek user-nya kecil (kebetulan default false), TAPI ini bukti nyata bahwa menambah 1 field baru harus disentuh di 3 file dan PASTI ada yang kelupaan (sudah terjadi). Untuk no-coder + Claude yang iterasi, ini sumber bug diam-diam tiap kali ada setting baru.  
**Fix konkret:** Langkah cepat sekarang: tambahkan excludeQuotes: false ke settings.js:6. Langkah benar: buat 1 file defaults.js berisi window.TVD_DEFAULTS = {...} (superset semua field: theme, sortBy, excludeQuotes, dimNonViral, maxItems, highlightColor, dst). Muat di sidepanel.html/settings.html sebelum script utama. content.js (content-script, tak bisa share scope window halaman) cukup samakan field manual + tambah komentar "SINKRON dengan defaults.js".  
**Lokasi:** `content.js:31-51; sidepanel.js:3-25; settings.js:3-9 (excludeQuotes hilang); settings.js:91 (import juga drop field)`  

### P1.5 Perubahan ambang metrik tidak langsung memfilter daftar — terasa "macet"
`bug` · `UX / alur interaksi` · impact **medium** · effort **medium** · skor **7.5** · confidence medium  
**Masalah/Peluang:** Saat user ubah ambang Like/Komen (input .m-min) atau toggle metrik, handler-nya cuma save() + pushSettings() (sidepanel.js:137-138) TANPA applyView(). pushSettings mengirim settings ke content script → rescanAll() (content.js:536) — tapi rescanAll mengandalkan post yang SEDANG ADA di DOM. Bandingkan keyword & sort yang memanggil applyView() lokal langsung (sidepanel.js:148,150). Jadi ubah keyword/sort = instan; ubah ambang Like = nunggu round-trip + butuh post di layar, dan untuk item yang sudah lewat dari DOM, ambang baru tidak mengevaluasi ulang.  
**Kenapa penting:** User no-coder geser ambang Like dari 1000 ke 500 berharap daftar langsung nambah; kalau feed diam (tidak ada post baru di DOM), tidak ada yang berubah → terasa rusak/lag. Inkonsistensi (keyword instan, ambang tidak) bikin mental model kabur.  
**Fix konkret:** Untuk ambang/logic/exclude/rasio/media yang bisa dievaluasi ulang dari data kartu yang sudah ada (rawItems sudah memuat counts, sidepanel.js:309), lakukan filtering sisi-panel di applyView() juga (saring rawItems pakai metrics/logic seperti evalEngagement) supaya daftar bereaksi instan, sambil tetap pushSettings untuk highlight di halaman. Minimal: setelah pushSettings karena ambang berubah, panggil applyView() juga seperti keyword (sidepanel.js:148).  
**Lokasi:** `sidepanel.js:137-149, content.js:536, sidepanel.js:253-265`  

### P1.6 isRepost hanya cek 90 char pertama textContent → repost teks panjang lolos
`bug` · `Mesin scraping & logika` · impact **medium** · effort **medium** · skor **7.5** · confidence medium  
**Masalah/Peluang:** isRepost (content.js:189) menguji REPOST_MARK (content.js:28) hanya pada (c.textContent||'').slice(0,90). Marker 'Reposted/Diposting ulang/Membagikan ulang' biasanya di header, tapi textContent container bisa diawali konten lain (avatar alt, nama, dll) sehingga marker melewati batas 90 char. textContent (bukan innerText) juga menggabung teks tanpa spasi antar node sehingga posisi marker bergeser.  
**Kenapa penting:** excludeReposts (filter 'sembunyikan repost', content.js:401) jadi tidak reliabel: repost yang header-nya tergeser >90 char lolos sebagai post asli, masuk daftar & export. Untuk riset 'ide konten asli', repost yang nyampur menurunkan kualitas. stats.repostDetected (content.js:396,424) juga kurang hitung → diagnostik bohong.  
**Fix konkret:** Jangan andalkan slice posisi. Cari marker repost di node header spesifik: cek node teks pendek di bagian atas container (rect.top mendekati atas) yang match REPOST_MARK, atau deteksi struktur 'dua header user' khas repost.  
**Lokasi:** `content.js:28,189,396`  

### P1.7 isQuote terlalu longgar: galeri/kartu/komentar nested bisa dikira quote
`bug` · `Mesin scraping & logika` · impact **medium** · effort **medium** · skor **7.5** · confidence medium  
**Masalah/Peluang:** isQuote (content.js:190-193) menandai quote bila ADA [data-pressable-container="true"] lain di dalam c. Tapi POST_SELECTORS (content.js:22) juga memakai data-pressable-container, dan Threads memakainya untuk banyak hal (carousel item, kartu link, balasan inline di tampilan detail). Banyak post non-quote punya child pressable-container.  
**Kenapa penting:** excludeQuotes (content.js:402) akan over-exclude: post biasa yang kebetulan punya child pressable (kartu link/galeri) dibuang sebagai quote. Untuk user yang menyalakan filter ini, post valid hilang tanpa alasan jelas.  
**Fix konkret:** Perketat: anggap quote hanya bila child pressable BERISI struktur post (punya <time>+username+metrik svg sendiri) dan mengandung a[href*="/post/"] yang BERBEDA dari permalink post utama. Itu menandai benar-benar mengutip post lain, bukan sekadar kartu/galeri.  
**Lokasi:** `content.js:22,190-193,402`  

### P1.8 mediaTypeOf: threshold 120px keliru — avatar besar jadi 'image', gambar belum-load jadi 'text'
`bug` · `Mesin scraping & logika` · impact **medium** · effort **medium** · skor **7.5** · confidence medium  
**Masalah/Peluang:** mediaTypeOf (content.js:194-200) mengembalikan 'image' jika ada <img> dengan clientWidth/naturalWidth >120 (atau height). Container post mencakup avatar penulis (dan untuk quote/repost, avatar terkutip) yang di banyak layout >120px → post teks-saja salah jadi 'image'. Sebaliknya gambar yang belum selesai load (clientWidth 0, naturalWidth 0) luput → 'text'.  
**Kenapa penting:** Filter media (content.js:221-225,400) jadi tak akurat: user yang mau post teks malah dapat 'image' palsu, atau user yang cari post bergambar kehilangan post yang gambarnya belum load. mediaTypeOf juga dipakai di samples diagnostik (content.js:397), jadi label media menyesatkan.  
**Fix konkret:** Kecualikan avatar: skip <img> di dalam a[href^="/@"] (link profil) atau yang lingkaran (border-radius:50% via computed style) / di header. Untuk gambar belum-load, cek atribut src/srcset bukan hanya ukuran terrender.  
**Lokasi:** `content.js:194-200,397,400`  

### P1.9 countNearSvg ambil count dari nextElementSibling → bisa nyomot angka tombol metrik lain
`bug` · `Mesin scraping & logika` · impact **medium** · effort **medium** · skor **7.5** · confidence medium  
**Masalah/Peluang:** countNearSvg (content.js:114-128) mencari angka di: aria-label tombol (117), semua span/div leaf dalam btn (118), textContent btn (119), lalu btn.nextElementSibling.textContent (120). Pada layout Threads, tombol aksi sering tidak mewadahi angkanya (angka di node terpisah), sehingga jatuh ke nextElementSibling — yang bisa jadi tombol/metrik BERIKUTNYA. Token pertama yang lolos usableToken menang (121-126), tanpa verifikasi bahwa angka itu milik metrik ini.  
**Kenapa penting:** Metrik bisa tertukar: angka komentar terbaca sebagai likes, dst., terutama saat satu metrik kosong (Threads kadang sembunyikan angka 0). Angka salah-tempel lebih berbahaya daripada kosong karena diam-diam salah & ikut ke export dan ke score() (sidepanel.js:205-207 membobot beda per metrik) dan velocity.  
**Fix konkret:** Batasi pencarian ke scope metrik: utamakan aria-label tombol itu sendiri ('Like, 1.234'). Kalau ke sibling, batasi ke sibling yang TIDAK mengandung svg[aria-label] lain (jangan menyeberang ke tombol metrik berikutnya). Tambah sanity: jangan ambil angka dari node yang juga berisi metric SVG berbeda.  
**Lokasi:** `content.js:114-128,145-153`  

### P1.10 Race tvdSettings: sidepanel & halaman settings saling timpa (last-writer-wins)
`bug` · `Data / storage / state` · impact **medium** · effort **medium** · skor **7.5** · confidence medium  
**Masalah/Peluang:** Dua UI menulis SELURUH objek tvdSettings secara independen tanpa merge dari storage terbaru: sidepanel.js:79 save() (`chrome.storage.local.set({tvdSettings: settings})`) dan settings.js:21/66/94. settings.html dibuka via chrome.tabs.create (sidepanel.js:156) jadi panel & tab Pengaturan bisa terbuka bareng. Masing-masing punya copy `settings` in-memory yang di-load sekali saat init dan tidak ada listener chrome.storage.onChanged di file mana pun (dikonfirmasi: tidak ada `onChanged` di seluruh kode).  
**Kenapa penting:** Skenario nyata Alfin: buka side panel, atur metrics+keyword (tersimpan). Lalu buka tab Pengaturan untuk ganti tema/warna highlight. settings.js init load tvdSettings SAAT ITU (snapshot), lalu user ganti satu hal → settings.js menulis kembali SELURUH objek dari copy-nya. Kalau di sela itu user balik ke panel dan ubah keyword (panel menulis objeknya sendiri), perubahan tema dari settings page bisa ketimpa, atau sebaliknya keyword panel ketimpa oleh write settings page yang pakai snapshot lama. Tidak ada penggabungan, tidak ada sinkron. Hasil: setelan 'lompat balik' secara misterius — sulit didiagnosis no-coder.  
**Fix konkret:** Dua langkah ringan: (1) Pasang chrome.storage.onChanged listener di sidepanel.js DAN settings.js: saat tvdSettings berubah dari luar, re-load ke `settings` lokal + applySettingsToControls()/fill() supaya kedua UI selalu cermin storage. (2) Read-modify-write: sebelum set, baca dulu tvdSettings terbaru lalu Object.assign hanya field yang diubah, bukan tulis objek snapshot penuh. Untuk skala 1-user ini cukup hilangkan mayoritas kasus timpa.  
**Lokasi:** `sidepanel.js:79, settings.js:21, settings.js:66, settings.js:94`  

### P1.11 Tidak ada penghitungan/penanda kuota chrome.storage.local untuk tvdHistory besar — gagal senyap saat maxItems dinaikkan
`bug` · `Data / storage / state` · impact **medium** · effort **medium** · skor **7.5** · confidence medium  
**Masalah/Peluang:** settings.maxItems boleh sampai 2000 (settings.html:50) dan saveHistory menyerialisasi SELURUH viralMap (snippet 180 char + counts + link + user) tiap 900ms ke chrome.storage.local (content.js:450-458), dibungkus catch kosong. chrome.storage.local default quota ~10MB tapi tiap set menimpa kunci penuh; saat history besar + sering, write bisa gagal/lambat dan errornya ditelan catch{} tanpa lastError check.  
**Kenapa penting:** Daftar sudah punya ide 'quota storage gagal diam-diam', tapi tidak menyebut interaksi spesifik maxItems hingga 2000 + write FULL tiap scan sebagai penyebab konkret, dan tidak ada hitungan ukuran. Untuk Alfin yang riset ratusan post per sesi dengan maxItems besar, kehilangan data senyap = riset hilang tanpa peringatan.  
**Fix konkret:** Cek chrome.runtime.lastError di callback set saveHistory dan tampilkan toast kalau gagal. Pakai chrome.storage.local.getBytesInUse untuk warning saat mendekati quota. Tulis incremental/diff alih-alih full-overwrite, atau batasi field yang disimpan. Beri batas atas maxItems yang realistis (mis. 1000) dengan hint dampak ukuran.  
**Lokasi:** `content.js:450-458, settings.html:50, content.js:411`  

### P1.12 Tidak ada loading/progress state saat auto-scroll + scan berjalan; #empty 'Belum ada data' tetap nyala
`improvement` · `ui-visual` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** Saat user klik play, feedback visual cuma ikon play->pause (sidepanel.js:326) dan angka #stats yang bergerak (sidepanel.html:117). Tidak ada indikator 'sedang bekerja' di area daftar. Saat daftar masih kosong tapi scan jalan, #empty 'Belum ada data…' tetap tampil (renderList toggle by arr.length, sidepanel.js:273) — terlihat seperti macet/gagal.  
**Kenapa penting:** Scraping DOM RAWAN & lambat; user no-coder gampang mengira 'rusak' kalau 10 detik pertama daftar kosong sambil tulisan 'Belum ada data' nyala padahal play aktif. Tanpa sinyal 'lagi nyisir', user stop-start berulang atau menyimpulkan ekstensi error pada data Threads asli (yang memang belum dites serius).  
**Fix konkret:** Saat scrolling=true DAN arr.length===0, ganti teks #empty jadi state 'memindai': 'Memindai feed… post viral akan muncul di sini' + animasi pulse halus. setScrolling() (sidepanel.js:324) dan renderList() (sidepanel.js:270-273) sudah tahu state scroll & panjang list — cukup pilih copy #empty berdasarkan flag scrolling, plus class .scanning untuk animasi CSS ringan.  
**Lokasi:** `sidepanel.html:134, sidepanel.js:270-273, sidepanel.js:324-328`  

### P1.13 Tombol 'arm clear' merah !important off-palette; punya toast tapi tombolnya tetap icon-only tanpa label di tombol
`improvement` · `ui-visual` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** sidepanel.css:168 .fbtn.arm { background:#dc2626 !important } — tombol trash berubah merah saat diklik sekali (sidepanel.js:162-167), reset 3 detik. Merah #dc2626 ini warna ke-4 di luar palet, hardcoded dengan !important (bukan token). CATATAN koreksi: saat armed sebenarnya SUDAH ada showToast('Klik sekali lagi untuk hapus') di sidepanel.js:165 — jadi bukan 'tanpa teks sama sekali'. Yang tersisa: tombolnya sendiri tetap icon-only merah tanpa micro-label, dan toast cuma lewat ~2 detik (sidepanel.js:250) sementara armed bertahan 3 detik, jadi setelah toast hilang petunjuknya cuma warna merah dadakan.  
**Kenapa penting:** User no-coder yang lewat detik ke-3 (toast sudah hilang) cuma melihat tombol trash mendadak merah tanpa kata — sinyal ambigu (error? loading?). Merah dadakan dipakai cuma di sini, jadi maknanya tidak terbangun di tempat lain. !important + hex lepasan juga jebakan maintenance: kalau ada aksi destruktif lain nanti tidak ada token bersama.  
**Fix konkret:** 1) Promosikan #dc2626 jadi token resmi --danger (light+dark) di :root, hilangkan !important. 2) Saat armed, tambah micro-label/teks di tombol (mis. ubah jadi 'Hapus?' kecil) supaya petunjuk tetap ada walau toast sudah hilang — jangan andalkan toast yang lebih pendek dari durasi armed.  
**Lokasi:** `sidepanel.css:168, sidepanel.js:161-176, sidepanel.js:250`  

### P1.14 Empty state mengasumsikan skenario 'baru update', tidak menuntun ke aksi inti (tekan play)
`improvement` · `ui-visual` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** #empty (sidepanel.html:134): 'Belum ada data. Buka threads.com, lalu (kalau baru update) refresh halamannya.' Untuk user first-run yang BUKAN habis update, klausa '(kalau baru update) refresh' membingungkan — dan tidak menyebut langkah inti: tekan tombol play untuk auto-scroll. Empty state ini satu-satunya panduan saat panel kosong.  
**Kenapa penting:** Empty state adalah momen onboarding paling penting (panel kosong = user bingung mau apa). Copy sekarang menjurus ke troubleshooting ('refresh') bukan ke 'mulai dari sini'. User no-coder yang baru pasang terdiam: tidak tahu harus tekan play.  
**Fix konkret:** Ubah jadi langkah aksi berurut: '1. Buka & login threads.com  2. Atur Kriteria viral di atas  3. Tekan tombol play untuk mulai memindai'. Bisa sisipkan ikon play kecil inline (ICONS.play) supaya nyambung dengan tombol asli. Sisakan tip 'baru update? refresh halaman' sebagai baris kecil muted terpisah.  
**Lokasi:** `sidepanel.html:134`  

### P1.15 Tidak ada onboarding/first-run — panel langsung penuh kontrol tanpa konteks
`improvement` · `UX / alur interaksi` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** init() (sidepanel.js:375-387) langsung render panel penuh: preset, pantau kolom, periode, keyword, 4 metrik + rasio, exclude, auto-scroll, sort, search. Tidak ada deteksi first-run, tidak ada langkah "1) buka threads.com 2) scroll/auto-scroll 3) atur ambang". help.html ada tapi harus diklik & buka tab baru (sidepanel.js:155). Istilah "Pantau kolom" (sidepanel.html:34) tidak dijelaskan di tempat.  
**Kenapa penting:** User = no-coder/vibe-coder yang minta "tunjuk tombol, step-by-step". Tanpa first-run, dia tebak-tebakan: harus klik apa dulu? kenapa daftar kosong? Banyak fitur (rasio komen/like, rising, requote) tidak akan pernah dipakai karena tidak ada yang mengarahkan.  
**Fix konkret:** Tambah banner first-run di atas #list (sidepanel.html:115-133) yang muncul kalau belum pernah ada hasil DAN belum di-dismiss (simpan flag tvdSeenIntro di chrome.storage.local). Isi 3 langkah singkat berbahasa Indonesia + 1 tombol "Mengerti". Effort kecil: cukup 1 div + 1 flag storage, tanpa halaman baru.  
**Lokasi:** `sidepanel.js:375-387, sidepanel.html:115-135`  

### P1.16 Snippet panjang tanpa break-word bisa meluber dari kartu (URL/cashtag tanpa spasi)
`improvement` · `Responsiveness & ketahanan layout` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** .item-snip (sidepanel.css:142) tidak punya overflow-wrap/word-break. Snippet diisi teks post mentah via highlightKw(esc(r.snippet)) (sidepanel.js:284). Post Threads sering memuat URL panjang tanpa spasi, hashtag panjang, atau string tanpa spasi (mis. cashtag beruntun '$BBRI$BBCA...' ala trader, atau link). Di panel 280px, satu token panjang tak bisa dipatahkan -> mendorong lebar .item melebihi kartu / memunculkan scroll horizontal pada kartu.  
**Kenapa penting:** Alfin trader IDX + content creator: post yang dia incar sering berisi ticker/cashtag/URL panjang. Kalau satu kartu melebar gara-gara token panjang, seluruh daftar jadi ikut lebar dan tampilan berantakan di panel sempit, mengganggu skimming daftar viral.  
**Fix konkret:** Tambah pada .item-snip (css:142): overflow-wrap:anywhere; (atau word-break:break-word). Pastikan .item (css:137) dan .item-top (css:138) juga min-width:0 agar ellipsis username (css:139) tetap bekerja. Uji dengan snippet berisi URL 80 karakter tanpa spasi di lebar 280px.  
**Lokasi:** `sidepanel.css:137-143, sidepanel.js:284`  

### P1.17 #stats dan #toast tidak diumumkan ke screen reader (tak ada aria-live)
`improvement` · `Aksesibilitas` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** #stats di-update terus via textContent ('Dipindai: X • Viral: Y', sidepanel.js:310) dan #toast menampilkan feedback penting ('Tersalin N post', 'Klik sekali lagi untuk hapus', 'Post nggak ketemu', 'Nyari postnya…') via class .show (showToast, sidepanel.js:245-251). Keduanya (sidepanel.html:117 & 145) tidak punya role/aria-live, jadi perubahan dinamis ini senyap bagi screen reader.  
**Kenapa penting:** Toast adalah satu-satunya konfirmasi untuk aksi destruktif/penting (clear 2x klik, copy berhasil, locate gagal). Tanpa aria-live, pengguna AT tak tahu apakah aksinya berhasil. #stats yang berubah saat auto-scroll juga jadi feedback progres yang hilang.  
**Fix konkret:** sidepanel.html:145 -> <div id="toast" class="toast" role="status" aria-live="polite">. Untuk aksi destruktif 'klik sekali lagi untuk hapus' pertimbangkan aria-live="assertive" saat arming. sidepanel.html:117 -> <span class="stats" id="stats" aria-live="polite">. Update #stats hanya lewat renderState saat ada hasil baru, jadi tidak spam.  
**Lokasi:** `sidepanel.html:117,145; sidepanel.js:245-251,310`  

### P1.18 Field tanpa label terikat: #search, #sort, dan grup Keyword/Media
`improvement` · `Aksesibilitas` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** #search (sidepanel.html:130) hanya punya placeholder, tak ada <label>/aria-label. #sort (118) hanya punya title="Urutkan" (title pada <select> tidak andal jadi accessible name). Grup Keyword pakai <label> tanpa for (sidepanel.html:49) sehingga tak terikat ke #keyword (input id=keyword di baris 55). Grup Media <label>Media</label> (59) juga tak terikat ke container tombolnya (#media, 60). Catatan: field lain (#preset, #crawl, #range) SUDAH benar pakai <label for=...> (baris 21,34,38).  
**Kenapa penting:** Placeholder hilang saat field terisi dan tidak dihitung sebagai accessible name oleh sebagian AT. Pengguna AT mendengar 'edit text' kosong untuk search dan 'combo box' tanpa nama untuk sort. Untuk #keyword, label 'Keyword' tidak terasosiasi sehingga klik label tak fokus ke field.  
**Fix konkret:** #search: tambah aria-label="Cari di hasil". #sort: ganti/lengkapi jadi aria-label="Urutkan hasil". #keyword: pakai <label for="keyword"> di sidepanel.html:49 (atau aria-label pada input baris 55). Grup media: beri role="group" aria-label="Filter jenis media" pada #media (sidepanel.html:60) atau bungkus <fieldset>/<legend>.  
**Lokasi:** `sidepanel.html:49,55,59,60,118,130`  

### P1.19 saveHistory serialize seluruh viralMap tiap scan (debounce 900ms) ke chrome.storage
`improvement` · `Performa` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** processPosts memanggil saveHistory() di akhir tiap scan (content.js:430). saveHistory debounce 900ms lalu `Array.from(viralMap.values()).map(...)` membuang _el dan `chrome.storage.local.set({tvdHistory: items})` (content.js:450-457). Saat auto-scroll/aktif, scan tiap ~0.2-0.5s berarti tiap 900ms seluruh array (hingga 300 objek dengan snippet teks panjang) di-stringify & ditulis ke disk.  
**Kenapa penting:** Serialisasi + JSON encode + write disk 300 item tiap ~1 detik = I/O dan CPU sia-sia, terutama karena 95%+ data tak berubah antar tulisan. chrome.storage.local.set juga punya overhead serialize internal. Berkontribusi ke jank periodik & write yang tak perlu.  
**Fix konkret:** 1) Tandai dirty: hanya panggil saveHistory bila viralMap benar-benar berubah sejak simpan terakhir (set flag saat viralMap.set / Object.assign mengubah counts/data). 2) Naikkan debounce ke ~3000ms dan tambah simpan saat 'visibilitychange'/beforeunload sebagai safety. Langkah (1)+(2) sudah memangkas mayoritas write.  
**Lokasi:** `content.js:430, content.js:449-458`  

### P1.20 items array dibangun ulang penuh (Array.from+reverse+map) + broadcast tiap scan ke 2 listener
`improvement` · `Performa` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** Akhir processPosts: `Array.from(viralMap.values()).reverse().map(({_el,...rest})=>rest)` (content.js:421) membuat salinan penuh + spread tiap objek tiap scan, lalu broadcast() mengirim lastState lengkap via chrome.runtime.sendMessage (content.js:528-529). Terjadi tiap scan (~0.2-0.5s saat aktif), diterima panel (sidepanel.js:371) DAN advanced.js (advanced.js:62) — kalau advanced kebuka, dobel render.  
**Kenapa penting:** Tiap scan: alokasi array 300 objek baru + serialize seluruh state untuk message passing antar-proses (structured clone) walau tak ada perubahan. Message besar tiap ~0.3s membebani serialisasi IPC dan memicu renderState→applyView→renderList full di panel (lihat ide renderList).  
**Fix konkret:** Skip broadcast bila state tidak berubah: hitung signature ringan (viralMap.size + hash counts/ids + stats) dan `if (sig===_lastBroadcastSig) return;` sebelum sendMessage. Bangun items lazily (hanya saat akan broadcast). Ini memutus rantai kerja sia-sia di kedua sisi (content alokasi + panel/advanced re-render).  
**Lokasi:** `content.js:420-431, content.js:528-530`  

### P1.21 tvdHistory tidak bisa di-export/di-backup terpisah; export hanya viral list 'view'
`feature` · `Data / storage / state` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** Export di settings.js:73-82 hanya membungkus tvdSettings + tvdPresets, BUKAN tvdHistory. Export di sidepanel (md/xlsx/copy) menulis viewItems (sidepanel.js:344/356/362) — yaitu daftar viral SETELAH filter search/sort, yang isinya dari rawItems = state.items (sidepanel.js:309) hasil sesi/scan berjalan. Jadi riwayat asli (tvdHistory di storage) tak punya jalur export/backup penuh sendiri.  
**Kenapa penting:** Tujuan inti produk = riset konten lintas sesi (riwayat lintas sesi disebut fitur unggulan). Tapi kalau Alfin pindah PC, reinstall extension, atau Chrome bersihkan storage, seluruh riwayat hilang tanpa cara backup. tvdHistory bisa berisi sampai maxItems post hasil scraping berhari-hari, jauh lebih berharga dari 'view' saat ini yang cuma subset yang kebetulan tampil di panel.  
**Fix konkret:** Di settings.js exportSettings, ikutkan tvdHistory: `chrome.storage.local.get(["tvdSettings","tvdPresets","tvdHistory"], ...)` lalu masukkan ke objek JSON; di importSettings restore tvdHistory bila ada (dengan validasi Array.isArray). Tambah juga tombol 'Export Riwayat (.xlsx)' yang membaca tvdHistory PENUH dari storage (bukan viewItems) lalu pakai window.makeXlsxBlob. Ini menjadikan riwayat benar-benar portable.  
**Lokasi:** `settings.js:73-82, sidepanel.js:342-359, content.js:450-458`  

### P1.22 Excel formula-injection di export .xlsx (escXml tidak melindungi)
`improvement` · `Keamanan & privasi` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** vendor/xlsx-mini.js:90-104 menulis sel teks sebagai inlineStr dengan escXml (xlsx-mini.js:74-78, 99-100) — escaping & < > " ' benar, jadi injeksi XML/markup ke struktur sheet TIDAK mungkin (aman). Yang TIDAK ditangani: sel teks yang diawali `=` `+` `-` `@` (mis. `=HYPERLINK(...)` atau `=cmd|...`) akan diperlakukan Excel sebagai FORMULA saat file dibuka.  
**Kenapa penting:** Snippet & username berasal dari feed tak tepercaya lalu masuk kolom Username (sidepanel.js:357, indeks 0) & Teks (indeks 7) di exportXlsx. Kalau ada post berisi teks diawali `=`/`+`/`-`/`@` dan Alfin membuka .xlsx hasil export di Excel desktop, Excel bisa mengeksekusi formula (Excel/CSV formula injection, potensi via DDE/HYPERLINK). XML-escaping di escXml tidak menutup ini karena masalahnya di lapisan parser Excel, bukan XML.  
**Fix konkret:** Prefix sel teks berbahaya dengan kutip tunggal. Di sidepanel.js:357 bungkus nilai user & snippet: `const safe=(s)=>/^[=+\-@\t\r]/.test(String(s))?"'"+s:s;` lalu pakai `safe('@'+(r.user||'?'))` dan `safe(r.snippet||'')`. Atau terapkan guard generik di xlsx-mini.js:99 untuk semua nilai teks. exportMd (sidepanel.js:342) tidak perlu.  
**Lokasi:** `vendor/xlsx-mini.js:90-104, sidepanel.js:357`  

### P1.23 Export JSON 'siap-prompt' terstruktur untuk AI
`feature` · `Fitur baru` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** Export cuma .md (exportMd sidepanel.js:342) dan .xlsx (exportXlsx sidepanel.js:354). Tidak ada JSON. Tabel .md boros token & ambigu buat LLM; .xlsx tidak bisa di-paste ke chat.  
**Kenapa penting:** Saat Alfin mau pipeline lebih serius (paste 30 post ke Claude/GPT), JSON array bersih {user, likes, comments, ratio, snippet, link} jauh lebih hemat token & akurat diparse model daripada tabel markdown.  
**Fix konkret:** Tambah exportJson() meniru exportMd: bangun array of objects dari viewItems (id, user, counts, ratio komen/like, score(r), velocity(r), snippet, link, media), download sebagai threadlens_<stamp>.json pakai helper download() yang sudah ada (sidepanel.js:336). Tambah tombol di footer sidepanel.html:137-143.  
**Lokasi:** `sidepanel.js:342-359, sidepanel.html:137-143`  

### P1.24 Filter/blok author tertentu
`feature` · `Fitur baru` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** getUsername() (content.js:159) sudah diekstrak tapi tidak dipakai untuk filtering. Akun besar (selebgram, akun gosip) bisa mendominasi hasil viral dan menenggelamkan niche yang Alfin cari.  
**Kenapa penting:** Untuk riset niche (trading, solopreneur), post viral dari akun di luar niche = noise. Memblok 5-10 akun besar langsung mempertajam hasil tanpa utak-atik threshold.  
**Fix konkret:** Tambah settings.blockedAuthors (array) di DEFAULTS (content.js:31-51) & mergeSettings (content.js:70). Di processPosts setelah getUsername (content.js:385), skip jika user ada di blocklist. UI: textarea 'blokir akun (pisah koma)' di kartu filter sidepanel.html:31-66, atau tombol 'blokir @user' di kartu hasil.  
**Lokasi:** `content.js:385-404, sidepanel.html:31-66`  

### P1.25 Pengambilan teks penuh post (bukan snippet 180 char)
`improvement` · `Fitur baru` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** getSnippet memotong ke 180 char + '[…]' (content.js:172-174). Hanya snippet ini yang disimpan ke rec (content.js:407) & diexport; teks penuh hilang meski fullText sudah ada di scope (content.js:392).  
**Kenapa penting:** Untuk umpan ke AI, caption penuh = data terpenting (di situ hook, struktur, CTA). Memotong di 180 char membuang justru bagian yang ingin Alfin pelajari. Thread panjang jadi tak berguna untuk analisis.  
**Fix konkret:** Simpan rec.fullText (versi bersih tanpa metrik trailing, reuse pembersihan getSnippet content.js:164-171 tanpa cap) terpisah dari snippet pendek. Snippet tetap untuk kartu UI; fullText dipakai di export .md/.json/prompt (sidepanel.js:342-366).  
**Lokasi:** `content.js:164-176, content.js:392-407, sidepanel.js:342-366`  

### P1.26 Quick-preset chips untuk niche Alfin (Trading, Solopreneur, Hook)
`feature` · `Fitur baru` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** Preset ada (savePresets/loadPresets sidepanel.js:87-90) tapi kosong by default — loadPresets menetapkan presets = {} jika belum ada (sidepanel.js:89). Alfin harus menyusun keyword+threshold sendiri dari nol; tidak ada starter relevan dengan niche-nya.  
**Kenapa penting:** Sebagai no-coder, Alfin diuntungkan oleh 'titik mulai'. Preset bawaan 'Trading IDX' (saham, IHSG, cuan, cut loss, dividen), 'Solopreneur' (bisnis, side hustle, produktif), 'Cari Hook' (ratio tinggi) langsung memberi nilai di klik pertama.  
**Fix konkret:** Seed presets default saat loadPresets menemukan kosong (sidepanel.js:88-90) dengan 3-4 preset niche siap pakai berisi keyword & threshold (struktur currentPresetConfig sidepanel.js:99-105). Tampilkan sebagai chip cepat di atas dropdown preset. Alfin tetap bisa edit/hapus.  
**Lokasi:** `sidepanel.js:88-90, sidepanel.js:99-111`  

### P1.27 Toggle OR/AND 'Kriteria viral' tanpa penjelasan one-liner — efek pengaturan nggak kelihatan
`improvement` · `Copywriting / microcopy` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** Kartu 'Kriteria viral' (sidepanel.html:69-76) punya toggle dua tombol 'OR'/'AND' di pojok tanpa label penjelas. Beda hasil OR vs AND (post lolos kalau salah satu metrik tembus vs harus semua) cuma dijelaskan di help.html:41.  
**Kenapa penting:** Ini setelan paling menentukan berapa post yang masuk daftar. Kalau user set ambang tinggi + AND tanpa sadar, daftar bisa kosong terus dan dia ngira tool-nya rusak (padahal cuma filter ketat). Diperparah empty-state generik yang tak bedakan 'feed kosong' vs 'filter ketat'.  
**Fix konkret:** Tambah micro-hint abu kecil di kartu kriteria yang berubah saat toggle diklik: OR aktif -> 'Viral kalau salah satu ambang tembus'; AND aktif -> 'Viral kalau SEMUA ambang tembus'. Update di handler #logic yang sudah ada di sidepanel.js:140. Plus title pada container #logic.  
**Lokasi:** `sidepanel.html:69-76, sidepanel.js:140`  

### P1.28 Dua pesan 'Post nggak ketemu' beda redaksi & yang pendek kurang actionable
`improvement` · `Copywriting / microcopy` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** Klik @username untuk 'cari di feed' bisa hasilkan: 'Nyari postnya… (auto-scroll)' (sidepanel.js:300), 'Post nggak ketemu.' (sidepanel.js:301, dipakai saat locate sinkron gagal/rec hilang), ATAU 'Post nggak ketemu — mungkin feed-nya udah ke-refresh.' (content.js:511, dikirim sebagai toast setelah seek gagal). Dua pesan 'tidak ketemu' beda redaksi untuk situasi serupa; yang pendek tak kasih tau user harus apa.  
**Kenapa penting:** Fitur 'cari di feed' rawan gagal (post sudah ter-unmount setelah scroll/refresh). Saat gagal, user perlu tau solusinya buka link langsung (tombol ↗). Pesan pendek 'Post nggak ketemu.' bikin user kira fitur rusak.  
**Fix konkret:** Samakan & buat actionable kedua jalur: 'Postnya nggak ketemu di feed — coba tombol ↗ buat buka langsung.' Selaraskan sidepanel.js:301 dengan content.js:511. Idealnya content.js yang kirim toast final, sidepanel jangan override dengan versi pendek.  
**Lokasi:** `sidepanel.js:300-301, content.js:511`  

### P1.29 Help.html tidak punya legenda ikon footer (Copy/MD/XLSX/Bersihkan/Pengaturan) yang justru icon-only
`improvement` · `Copywriting / microcopy` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** help.html:35 menyebut 'Export MD/XLSX atau Copy semua' tapi tidak memetakan ikon mana = fungsi apa. Karena footer icon-only (lihat ide footer), user yang baca help tetap nggak tau ikon dua-kotak = Copy, ikon grid = XLSX. Tidak ada section 'arti tombol' di help.html sama sekali.  
**Kenapa penting:** Help adalah jaring pengaman untuk UI ringkas. Kalau UI minim teks DAN help nggak menjelaskan ikon, no-coder buntu. Definisi konsep (Skor dll, help.html:39-48) lengkap, tapi 'tombol mana yang mana' justru kosong.  
**Fix konkret:** Tambah section di help.html (setelah langkah cara pakai, sekitar help.html:36) 'Arti tombol di bawah panel': ikon salin = Copy semua ke clipboard, ikon MD = download .md, ikon grid = download Excel .xlsx, ikon tong sampah = bersihkan daftar (klik 2x), ikon gerigi = Pengaturan. Sertakan emoji/SVG inline biar match visual.  
**Lokasi:** `help.html:35-36, help.html:38-48`  

### P1.30 Kolom export kurang sinyal yang justru paling berguna buat ide konten
`improvement` · `REFRAME konversi → kualitas nilai-terpakai export` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** Tabel export md (sidepanel.js:345-349) & xlsx (356-357) berisi: User, Skor, Like, Komen, Repost, Share, Link/Teks. Tapi TIDAK ada: waktu post (timeMs/ago), velocity/Rising (↑/jam — padahal dihitung velocity() sidepanel.js:209-212 & ditampilkan di kartu sidepanel.js:291), rasio komen/like, tipe media (r.media — sudah di-set content.js:407 & ada di kartu nggak, tapi ada di data), dan flag repost (r.repost, content.js:407). Padahal untuk riset 'apa yang lagi naik' justru Rising, umur post, dan rasio komen/like itu sinyal paling actionable.  
**Kenapa penting:** Riset konten butuh tahu 'post ini baru viral kemarin' vs 'evergreen 6 bulan lalu', dan 'rame diperdebatkan' (rasio tinggi) vs 'cuma banyak like'. Tanpa itu, daftar export jadi sekadar leaderboard like — AI nggak bisa bedain pola yang layak ditiru. Data sudah dihitung/ada di memori (timeMs, media, repost di record, velocity sebagai fungsi), cuma nggak ikut ke-export. Low-hanging value.  
**Fix konkret:** Tambahkan kolom di aoa xlsx (sidepanel.js:356-357) & tabel md (345-349): 'Umur' (ago(r.timeMs), fungsi ada sidepanel.js:222), 'Rising/jam' (fmt(velocity(r))), 'Rasio K/L' (r.counts.comments/r.counts.likes), 'Media' (r.media), 'Repost?' (r.repost). Untuk md, daripada tabel super lebar, taruh sinyal ini di bagian '## Teks' (sidepanel.js:350-351) per item sebagai baris metadata ringkas di bawah tiap snippet.  
**Lokasi:** `sidepanel.js:345-352, sidepanel.js:356-357, sidepanel.js:209-212, content.js:407`  

### P1.31 Waktu post hanya tampil relatif ('hari ini'/'2 minggu lalu') — tidak ada tanggal absolut & 'hari ini' kena clock-skew
`improvement` · `Copywriting / microcopy` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** ago(ms) (sidepanel.js:222-230) memetakan d<=0 -> 'hari ini', termasuk timeMs masa-depan (clock skew / parse title aneh). Kartu tidak pernah menampilkan tanggal absolut, padahal timeMs ada dan title time element kadang berisi tanggal pasti. Export MD/XLSX juga TIDAK menyertakan kolom waktu/tanggal sama sekali (header export sidepanel.js:345 & 356 tidak punya kolom waktu).  
**Kenapa penting:** Untuk riset konten + diumpankan ke AI, kapan post dibuat adalah konteks penting (tren musiman, 'post ini viral pas kapan'). Export tanpa kolom tanggal bikin AI/laporan kehilangan dimensi waktu sepenuhnya. Dan 'hari ini' untuk timestamp masa-depan bikin user ragu. Ide daftar fokus pada Periode filter & getPostTime salah baca; tak ada yang menyoroti absennya tanggal di kartu & export.  
**Fix konkret:** Tambah kolom 'Waktu'/'Tanggal' di export MD (sidepanel.js:344-352) dan XLSX (sidepanel.js:356-357) dari r.timeMs (format ISO/lokal). Di kartu, title-attribute item-time isi tanggal absolut saat hover. Di ago(), guard d<0 -> tampilkan 'baru saja' bukan 'hari ini', dan beri penanda kalau timeMs null ('waktu tak terbaca').  
**Lokasi:** `sidepanel.js:222-230, sidepanel.js:344-352, sidepanel.js:356-357, sidepanel.html:282`  

### P1.32 Auto-scroll tanpa batas waktu/iterasi maksimum — bisa scroll selamanya membebani memori detached nodes
`improvement` · `Performa` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** startScroll() membuat setInterval tick (content.js:469-481) yang scroll + processPosts() tanpa kondisi berhenti otomatis. Saat tidak ada post baru, ia tetap scrollBy lalu mundur 80px (baris 475-476) dan terus jalan. Dikombinasikan dengan viralMap menahan _el (detached nodes, sudah di daftar) dan Threads me-recycle DOM, sesi auto-scroll panjang tanpa henti = pertumbuhan memori + CPU terus-menerus sampai user manual klik pause.  
**Kenapa penting:** Daftar fitur menyebut 'auto-stop saat tak ada post baru' sebagai fitur baru; di sini sudut ketahanan/performa: tanpa guard, auto-scroll bisa tertinggal menyala (Alfin lupa pause, pindah app) dan diam-diam menguras resource selama puluhan menit. Ini risiko nyata pada produk yang dipakai sambil multitasking.  
**Fix konkret:** Tambah penghitung 'tick tanpa post baru' di tick(): kalau seenIds.size tidak bertambah selama mis. 15 tick beruntun ATAU sudah mencapai N tick total, otomatis stopScroll() + toast 'Auto-scroll berhenti (nggak ada post baru).' Ini sekaligus mengimplementasikan ide auto-stop dengan biaya kecil.  
**Lokasi:** `content.js:469-481, content.js:394-395`  

### P1.33 Klik tombol extension saat tab aktif BUKAN Threads: panel buka tapi kosong tanpa arahan
`improvement` · `GAP / aktivasi first-run` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** getThreadsTab() (sidepanel.js:66-70) query semua tab Threads lalu pilih yang aktif atau [0]. Kalau Alfin sedang di tab lain (Stockbit, Notion) dan tidak ADA tab Threads sama sekali, return null -> sendToTab return null -> request-state gagal -> panel render kosong dengan empty state generik 'Belum ada data... refresh halamannya'. Tidak menyuruh BUKA threads.com.  
**Kenapa penting:** First-run dan daily-run nyata: Alfin buka panel duluan karena penasaran, belum buka Threads. Pesan 'refresh halamannya' menyesatkan (halaman apa?). No-coder bingung, tutup panel, nggak balik. Ini kebocoran aktivasi di langkah paling awal.  
**Fix konkret:** Di init(), kalau getThreadsTab()===null, render empty state khusus: 'Buka threads.com dulu ya.' + tombol biru 'Buka Threads' yang menjalankan chrome.tabs.create({url:'https://www.threads.com'}). Bedakan dari kasus 'tab ada tapi belum scan'.  
**Lokasi:** `sidepanel.js:66-70, sidepanel.js:385-387, sidepanel.html:134`  

### P1.34 Export/Copy diam-diam pakai viewItems (terfilter search) tanpa badge 'difilter X dari Y'
`improvement` · `GAP / kepercayaan hasil` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** exportMd/exportXlsx/copyAll semuanya iterasi viewItems (sidepanel.js:343/355/361), yaitu hasil SETELAH filter search box #search + sort. Tidak ada indikator di tombol export bahwa output sedang dipersempit teks di kotak search. Jumlah di toast ('Tersalin N post') satu-satunya petunjuk, dan Alfin tidak hafal total seharusnya.  
**Kenapa penting:** Skenario nyata: Alfin ngetik 'saham' di search untuk lihat sekilas, lupa hapus, lalu export — dapat 12 post bukan 200, kira itu semua, umpan ke AI dengan data terpotong. Diam-diam salah, tanpa peringatan. Gap konkret: tidak ada badge 'difilter X dari Y' dekat tombol export.  
**Fix konkret:** Di results-head/footer tampilkan badge saat viewItems.length < rawItems.length: 'Menampilkan N dari M (search aktif)'. Di handler export, kalau search aktif, tawarkan toast/konfirmasi 'Export semua (M)' vs 'Export yang tampil (N)'.  
**Lokasi:** `sidepanel.js:253-265, sidepanel.js:342-366, sidepanel.html:116-131`  

### P1.35 Post tanpa waktu terbaca: lolos filter Periode tapi hilang dari sort Rising — perilaku tak konsisten & tak terlihat
`improvement` · `GAP / konsistensi filter` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** dateOk return true saat timeMs==null (content.js:205) → post tanpa waktu LOLOS filter '1 hari terakhir'. Tapi velocity() return null saat timeMs==null (sidepanel.js:210-212) → post yang sama tak punya chip Rising dan tenggelam di urutan 'rising'. unknownTime sering besar di feed real (getPostTime via teks relatif rawan gagal).  
**Kenapa penting:** Alfin pilih 'Periode: 1 hari' percaya hasilnya post baru, padahal puluhan post berusia tak diketahui (mungkin lama) ikut masuk. Lalu switch ke sort 'Rising' dan post-post itu lenyap. Hasil berubah tanpa sebab jelas = dia tidak percaya filter Periode.  
**Fix konkret:** Konsisten + transparan: saat dateRange != lifetime, tampilkan badge 'N post waktunya nggak kebaca, ikut ditampilkan' (dari stats.unknownTime). Beri opsi Pengaturan 'Periode ketat — buang post tanpa waktu' (dateOk return false saat null). Samakan asumsi default dateOk vs velocity.  
**Lokasi:** `content.js:203-209, sidepanel.js:209-212, advanced.js:17`  

### P1.36 Export/Copy membuang metrik Rising (like/jam) & Rasio komen/like — sinyal yang justru jadi alasan post dipilih
`improvement` · `GAP / kualitas export untuk AI` · impact **medium** · effort **low** · skor **7.2** · confidence high  
**Masalah/Peluang:** exportMd/xlsx/copyAll hanya menyertakan user, skor, 4 count mentah, link, teks (sidepanel.js:344-365). Velocity (rising) dan rasio komen/like — dua sinyal yang Alfin pakai di panel untuk memutuskan 'ini lagi naik / lagi ramai diperdebatkan' — TIDAK ikut ter-export. Begitu data keluar ke AI/Notion, konteks 'kenapa post ini menarik' hilang.  
**Kenapa penting:** Saat Alfin minta AI 'bikinin ide konten dari daftar ini', AI cuma lihat angka absolut besar (bias ke akun raksasa), bukan post momentum tinggi. Sinyal paling actionable untuk creator (rising + rasio diskusi) menguap di export. Melemahkan tujuan inti produk: feed -> export -> ide AI. Beda dari item 'kolom export kurang sinyal' karena MENYEBUT dua metrik spesifik yang sudah dihitung tapi dibuang.  
**Fix konkret:** Tambah kolom 'Rising (like/jam)' & 'Rasio komen/like' ke header+baris exportMd (sidepanel.js:345-348) dan aoa exportXlsx (sidepanel.js:356-357). Untuk copyAll tambahkan ke baris ringkas. Hitung via velocity(r) dan counts.comments/counts.likes (guard pembagi null).  
**Lokasi:** `sidepanel.js:344-365, sidepanel.js:205-212`  

### P1.37 Gabung thread beruntun (1/2, 2/2) jadi satu entri
`feature` · `Fitur baru` · impact **high** · effort **high** · skor **7** · confidence medium  
**Masalah/Peluang:** processPosts (content.js:384) memperlakukan tiap container hasil postContainerFromSvg sebagai post terpisah, dan idFor (content.js:368) memberi id unik per permalink/snippet. Thread berseri ('1/3','2/3' atau 🧵) jadi muncul sebagai 2-3 kartu terpisah dengan metrik mirip -> daftar viral penuh duplikat semu.  
**Kenapa penting:** Alfin riset HOOK & struktur konten. Thread berseri justru format paling bernilai untuk ditiru, tapi sekarang kepecah jadi noise dan harus disatukan manual saat menyusun ide.  
**Fix konkret:** Saat membuat rec di content.js:404-412, deteksi penanda seri di awal/akhir snippet (regex /(\d+)\s*\/\s*(\d+)/ atau emoji 🧵), kelompokkan post dari getUsername() yang sama dengan part berurutan & timeMs berdekatan (<5 menit) jadi satu record, simpan part lain di rec.parts. Tampilkan badge 'Thread 1/3' di kartu renderList (sidepanel.js:279-296).  
**Lokasi:** `content.js:384-412, content.js:164-176, sidepanel.js:279-296`  

### P1.38 Kirim ke Notion (clip post viral ke database)
`feature` · `Fitur baru` · impact **high** · effort **high** · skor **7** · confidence medium  
**Masalah/Peluang:** Output cuma file/clipboard (exportMd/exportXlsx/copyAll sidepanel.js:342-366). Alfin pakai Notion sebagai basis riset konten; sekarang dia harus import .xlsx atau paste manual tiap kali.  
**Kenapa penting:** Notion adalah 'rumah' riset konten Alfin (ada di stack-nya). Tombol langsung-ke-Notion menghapus langkah download->import dan menjadikan ThreadLens bagian alami pipeline-nya, meningkatkan retensi harian.  
**Fix konkret:** Tambah Notion Integration Token + Database ID di settings. Tombol footer/kartu 'Kirim ke Notion' POST ke https://api.notion.com/v1/pages (fetch dari side panel). Tambah 'https://api.notion.com/*' ke host_permissions (manifest.json:18-23). Map kolom: User, Likes, Komen, Ratio, Snippet, Link, Catatan. Panduan bikin token di help.html untuk no-coder.  
**Lokasi:** `manifest.json:18-23, sidepanel.js:330-366, settings.js:47-71`  

### P1.39 Highlight feed: outline 3px + offset 2px + boxShadow 2px = ring tebal, bisa ganggu baca di feed rapat/multi-kolom
`improvement` · `ui-visual` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** content.js:323-326 meng-apply ke tiap post viral: outline 3px solid + outlineOffset 2px + borderRadius 10px + boxShadow 0 0 0 2px (ring tambahan). Saat banyak post viral berurutan di feed sempit (apalagi multi-kolom yang produk klaim support), ring 3px+offset+shadow antar-kartu saling menempel, dan outlineOffset 2px makan sela post Threads yang memang rapat.  
**Kenapa penting:** Tujuan user: BACA konten viral buat ide. Kalau separuh feed jadi kotak biru tebal berdempetan, mata lelah dan susah membedakan satu post dari berikutnya — kebalikan dari 'menyorot'. Di multi-kolom makin sumpek.  
**Fix konkret:** Turunkan bobot di content.js:323-326: outline 2px (bukan 3) dan hapus boxShadow ganda, ATAU pakai border-left tebal biru (seperti kartu daftar yang pakai border-left 4px var(--blue), sidepanel.css:137) sebagai penanda utama — konsisten dengan bahasa visual daftar dan jauh lebih ringan. Default tipis.  
**Lokasi:** `content.js:320-326, sidepanel.css:137`  

### P1.40 Kontras --muted #65686c untuk angka metrik 12px: marginal, padahal itu DATA INTI yang dibaca terus
`improvement` · `ui-visual` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** --muted:#65686c (sidepanel.css:18) dipakai untuk teks 12px penting: .item-counts (sidepanel.css:145) yang memuat jumlah like/komen/repost/share. #65686c di atas card putih ≈ kontras ~4.9:1 — lolos AA teks normal tapi tipis untuk angka 12px. Di dark mode --muted:#9aa0a6 (sidepanel.css:23) di card #2a2a2d lebih mepet lagi.  
**Kenapa penting:** Angka metrik di .item-counts adalah DATA INTI yang user pakai menilai viral, tapi ditaruh 12px warna muted — sengaja diredupkan padahal info utama. User content creator akan menyipit baca angka kecil abu-abu di laptop terang.  
**Fix konkret:** Di sidepanel.css:145 ganti color:var(--muted) jadi color:var(--text) untuk angkanya (biarkan .cnt .ico tetap muted), atau besarkan .item-counts ke 13px. Sisakan --muted untuk label sekunder (.item-time :141, .hint :125).  
**Lokasi:** `sidepanel.css:18,23,145,141,125`  

### P1.41 Hint auto-scroll cuma teks pasif — syarat 'pilih kolom' tidak terlihat di tombol play
`improvement` · `UX / alur interaksi` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** updateScrollHint (sidepanel.js:202) menampilkan hint "Pilih 1 kolom dulu untuk auto-scroll" HANYA saat crawlTarget==='all', sebagai teks pasif di bawah tombol (sidepanel.html:112). Tombol play tetap menyala penuh & klik-able. User membaca hint sebagai saran opsional, bukan syarat — lalu tetap menekan play di mode 'Semua' dan kena jebakan auto-scroll diam (lihat ide #1). Ini sisi-UI dari bug #1 itu.  
**Kenapa penting:** Hint yang tidak mengubah keadaan tombol = mudah diabaikan, apalagi posisinya di bawah tombol. Menampilkan syarat di titik aksi (tombol) jauh lebih sulit dilewati daripada teks terpisah.  
**Fix konkret:** Saat crawlTarget==='all', beri keadaan tombol play yang jelas di updateScrollHint(): redupkan/disable #scroll-btn atau ubah jadi tombol "Pilih kolom" yang saat diklik fokus ke dropdown #crawl. Begitu user pilih kolom (handler sidepanel.js:144), tombol kembali normal.  
**Lokasi:** `sidepanel.js:144, sidepanel.js:202, sidepanel.html:34-35, sidepanel.html:107-113`  

### P1.42 Dropdown 'Pantau kolom' max-width:60% bikin nama kolom Threads kepotong
`improvement` · `Responsiveness & ketahanan layout` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** Semua select dibatasi flex:1; max-width:60% (sidepanel.css:64). #crawl diisi label kolom dari hasil scrape via Option(`${c.label} (${c.count})`) (sidepanel.js:317). Nama kolom Threads bisa panjang (mis. 'Untuk Anda', 'Mengikuti', nama tab profil, atau hasil deteksi geometri yang verbose) lalu masih ditambah ' (count)'. Di panel 280px, 60% dari ~250px konten = ~150px; select native akan memotong teks pilihan sehingga user nggak bisa bedakan dua kolom yang prefix-nya sama.  
**Kenapa penting:** Memilih kolom yang benar adalah prasyarat fitur auto-scroll (hint 'Pilih 1 kolom dulu untuk auto-scroll', sidepanel.html:112) dan akurasi filter. Kalau label kepotong jadi ambigu, user salah pilih kolom, lalu mindai feed yang salah — langsung merusak tujuan riset konten.  
**Fix konkret:** Untuk select dinamis (#crawl, #preset), longgarkan aturan global `select{max-width:60%}` (css:64): jadikan default max-width:none; flex:1; min-width:0, dan andalkan .field gap (css:58) buat jarak dari label. Label sudah white-space:nowrap (css:59) jadi cukup set label flex-shrink:0 + select min-width:0. Uji dengan label kolom panjang + count di 280px.  
**Lokasi:** `sidepanel.css:58-64, sidepanel.js:312-317`  

### P1.43 Quota storage.local saat history besar + write penuh tiap scan, gagal diam-diam
`improvement` · `Data / storage / state` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** saveHistory (content.js:450-458) menyimpan SELURUH array viralMap ke tvdHistory tiap selesai scan (debounce 900ms), dan auto-scroll memicu processPosts terus-menerus (content.js:477). maxItems hanya di-clamp bawah di settings.js:52 (`Math.max(20,v)`) tanpa batas atas di JS — input settings.html:50 memang `max="2000"` tapi itu cuma hint UI, tidak ada input maxItems di sidepanel sama sekali. Tiap record berisi snippet sampai 180 char (content.js:172-174) + counts + link.  
**Kenapa penting:** Dampak nyata: chrome.storage.local default ~5MB (manifest.json:17 hanya minta 'storage', tanpa 'unlimitedStorage'). 2000 record belum tentu jadi error, TAPI pola write-full-array tiap ~1 detik saat auto-scroll lama (riset konten = scroll banyak) menulis ulang seluruh blob berkali-kali → boros. Saat mendekati kuota, chrome.storage.local.set GAGAL DIAM-DIAM karena dibungkus `try{}catch(e){}` kosong (content.js:453-456) DAN callback set tidak mengecek chrome.runtime.lastError. Riwayat berhenti tersimpan tanpa Alfin tahu.  
**Fix konkret:** (1) Clamp atas maxItems di settings.js:52 (mis. `Math.min(2000, Math.max(20, v))`) supaya konsisten dengan max input HTML. (2) Di saveHistory, lewatkan callback ke set() dan cek `chrome.runtime.lastError` → toast 'Riwayat penuh, hapus sebagian'. (3) Pertimbangkan tambah permission 'unlimitedStorage' ke manifest.json:17 (gratis untuk load-unpacked) bila memang mau simpan banyak. (4) Pangkas snippet khusus untuk persist (mis. 120 char).  
**Lokasi:** `content.js:450-458, content.js:411, settings.js:52, settings.html:50, manifest.json:17`  

### P1.44 Deteksi & tandai 'hook' (pertanyaan / pola pembuka kuat)
`feature` · `Fitur baru` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** Snippet ditampilkan apa adanya di renderList (sidepanel.js:284). Tidak ada penanda apakah post pakai hook (pertanyaan, angka, 'rahasia', 'jangan...') yang biasanya bikin viral.  
**Kenapa penting:** Alfin secara eksplisit riset HOOK. Menyorot otomatis post yang pembukanya pertanyaan atau pola hook memandu dia langsung ke contoh terbaik tanpa baca ratusan snippet.  
**Fix konkret:** Fungsi kecil di sidepanel: deteksi kalimat pertama snippet diakhiri '?', diawali angka, atau mengandung kata pemicu ID/EN ('rahasia','kenapa','jangan','cara','3 hal','stop'). Tampilkan badge 🪝 di kartu renderList (sidepanel.js:279-296) + opsi sort/filter 'punya hook' di applyView (sidepanel.js:253-264). Murni regex client-side, tidak ubah scraping.  
**Lokasi:** `sidepanel.js:253-264, sidepanel.js:279-296`  

### P1.45 Auto-stop scroll saat tak ada post baru (anti-scroll selamanya)
`improvement` · `Fitur baru` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** startScroll (content.js:469-481) jalan terus sampai dimatikan manual. Tidak ada deteksi 'sudah mentok / tidak ada konten baru', dan ada hack scrollBy(0,-80) saat mentok (content.js:475-476) yang bikin scroll terjebak memantul di ujung.  
**Kenapa penting:** Alfin sering ninggalin auto-scroll. Tanpa auto-stop, ia membakar CPU & bisa memicu rate-limit Threads tanpa hasil. Berhenti otomatis saat seenIds (content.js:56) berhenti bertambah = lebih hemat & aman.  
**Fix konkret:** Lacak seenIds.size sebelum/sesudah beberapa tick di startScroll (content.js:472-479). Kalau tidak bertambah selama N tick berturut (mis. 6), stopScroll() otomatis + toast 'Auto-scroll berhenti — sudah mentok'. Hilangkan/perbaiki hack scrollBy(0,-80) (content.js:475-476).  
**Lokasi:** `content.js:469-482, content.js:56`  

### P1.46 Campur Inggris-Indonesia tidak konsisten ('Likes/Repost/Share' vs 'Komentar') + 'Komen' di export MD
`improvement` · `Copywriting / microcopy` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** Dalam satu kartu 'Kriteria viral' (sidepanel.html:79-92): 'Likes' (Inggris jamak), 'Komentar' (Indonesia), 'Repost' & 'Share' (Inggris). Di dropdown sort (sidepanel.html:123-126) sama campurnya: 'Likes/Repost/Share' vs 'Komentar'. Header export MD pakai 'Komen' (sidepanel.js:345 — singkatan beda dari 'Komentar'), sedangkan XLSX sudah pakai 'Komentar' (sidepanel.js:356).  
**Kenapa penting:** Untuk audiens Indonesia no-coder, campur bahasa + singkatan beda ('Komentar' vs 'Komen') nambah beban kognitif. Threads UI Indonesia sendiri pakai 'Suka', 'Komentar', 'Posting ulang', 'Bagikan' — selaras dengan itu bikin user langsung paham mapping-nya.  
**Fix konkret:** Seragamkan tunggal/jamak & header. Minimal: 'Like' bukan 'Likes' di sidepanel.html:79,123; samakan header MD sidepanel.js:345 'Komen' -> 'Komentar' biar konsisten dgn XLSX. Opsi penuh (cocok Threads ID): 'Suka', 'Komentar', 'Posting ulang', 'Bagikan' di kartu kriteria, sort, dan header export.  
**Lokasi:** `sidepanel.html:79-92, sidepanel.html:123-126, sidepanel.js:345`  

### P1.47 Tombol header Help icon-only — pintu masuk tutorial (terpenting buat no-coder) tersembunyi
`improvement` · `Copywriting / microcopy` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** Tombol Help cuma ikon tanda tanya + title 'Tutorial & definisi' (sidepanel.html:12), buka help.html di tab baru (sidepanel.js:155). Untuk no-coder yang baru install, tombol tutorial harusnya PALING kelihatan, tapi justru ikon kecil tak berlabel di pojok header.  
**Kenapa penting:** Investasi konten help.html (definisi Skor/Rising/OR-AND/Requote di help.html:39-48) sia-sia kalau pintu masuknya tak terlihat. Ini akar kenapa istilah-istilah terasa membingungkan — bukan definisinya kurang, tapi user nggak tau ada halaman definisi.  
**Fix konkret:** Pertegas penemuan: ubah title sidepanel.html:12 jadi lebih mengundang ('Cara pakai & arti istilah'). Header punya ruang lebih dari footer, jadi pertimbangkan tambah teks 'Bantuan' di sebelah ikon help. Alternatif minimal: saat panel pertama dibuka & rawItems kosong, empty-state (lihat ide empty-state) sertakan link 'Baru pakai? Buka tutorial' yang memanggil help.html.  
**Lokasi:** `sidepanel.html:12, sidepanel.js:155`  

### P1.48 Sudah scroll & ada hasil viral tapi user nggak diberi 'next step' ke export
`improvement` · `Aktivasi / konversi (time-to-first-export)` · impact **medium** · effort **low** · skor **7** · confidence medium  
**Masalah/Peluang:** Setelah kartu viral muncul (renderList sidepanel.js:270-305), nggak ada dorongan menuju aksi bernilai (export/copy buat AI). Tombol export/copy ada di footer sebagai ikon TANPA label teks (sidepanel.html:137-143) dan nggak menonjol saat ada hasil. Untuk no-coder, ikon copyAll/md/xlsx (svg di sidepanel.js:40-42) kurang jelas maknanya.  
**Kenapa penting:** Nilai akhir produk bukan 'lihat highlight', tapi 'punya daftar siap-AI'. Kalau setelah dapat 30 post viral user nggak ngerti langkah selanjutnya / nggak ngeh tombol export, time-to-first-export molor atau nggak pernah terjadi. Aktivasi belum 'lengkap' sampai user export sekali.  
**Fix konkret:** Saat viewItems.length pertama kali > 0 (di applyView/renderState), sorot/animasikan tombol export atau munculkan tip 'Siap! Klik MD/XLSX/Copy buat ekspor ke AI'. Tambah label teks kecil di bawah ikon footer ('Copy', 'MD', 'XLSX') di sidepanel.html:138-142. Pertimbangkan satu tombol primer 'Export buat AI' default ke .md (paling mudah ditempel ke chat AI).  
**Lokasi:** `sidepanel.html:137-143, sidepanel.js:270-273, sidepanel.js:342-366`  

### P1.49 seenIds tumbuh selamanya & tak direset rescan → 'Dipindai' menggelembung + memory naik
`debt` · `Mesin scraping & logika` · impact **medium** · effort **low** · skor **6.9** · confidence high  
**Masalah/Peluang:** seenIds (content.js:56, di-add di 394) tak pernah dikosongkan: rescanAll (content.js:433-440) clear dismissed + viralMap TAPI BUKAN seenIds; clearList (441-447) juga tidak. stats.scanned = seenIds.size (content.js:424). Karena id bisa tak stabil (snippet, lihat temuan ID), satu post bisa menambah banyak entri seenIds. dismissed (content.js:55,405,442) juga tumbuh tanpa batas.  
**Kenapa penting:** Dua dampak nyata: (1) angka 'Dipindai' di panel & diagnostik (sidepanel.js:310) membengkak jauh melampaui jumlah post asli — menyesatkan user soal cakupan, dan tak pernah turun walau klik rescan. (2) memory content script naik monoton selama tab Threads dibuka lama — relevan karena produk ini ditujukan untuk auto-scroll panjang.  
**Fix konkret:** Reset seenIds di rescanAll dan clearList. Untuk statistik 'Dipindai', hitung post unik aktual (mis. containers.size per sesi atau cap Set dengan LRU) alih-alih akumulasi id tak stabil. Untuk dismissed, simpan hanya id permalink stabil dan beri batas ukuran.  
**Lokasi:** `content.js:55-56,394,405,424,433-447`  

### P1.50 Version drift: manifest 0.6.0 vs "v0.5" tertanam di 4 file
`debt` · `Konsistensi / docs` · impact **medium** · effort **low** · skor **6.9** · confidence high  
**Masalah/Peluang:** manifest.json:4 sudah "0.6.0", tapi label versi lama masih tersebar: content.js:2 (header "v0.5"), sidepanel.js:1 ("Side Panel logic v0.5"), README.md:1 ("# ThreadLens (v0.5)"), dan settings.js:75 menulis _v:"0.5" ke file export setelan.  
**Kenapa penting:** Untuk no-coder, satu-satunya cara tahu "versi mana yang ke-load" adalah baca label ini. Saat Alfin minta Claude "lanjutkan dari versi terakhir", label yang berbohong bikin Claude/Alfin salah asumsi versi. settings.js:75 paling berbahaya: file export JSON membawa _v:"0.5" padahal app 0.6.0 — kalau nanti ada logika migrasi/import berdasarkan _v (importSettings di settings.js:83-102 sekarang belum baca _v, tapi gampang ditambah), akan salah cabang.  
**Fix konkret:** Tetapkan manifest.json sebagai satu sumber kebenaran. Ganti keempat string "0.5" jadi "0.6.0" (atau hapus header versi dari content.js/sidepanel.js karena cuma komentar). Untuk settings.js:75, baca versi dari chrome.runtime.getManifest().version (settings.html adalah halaman extension jadi API ini tersedia): _v: chrome.runtime.getManifest().version.  
**Lokasi:** `manifest.json:4; content.js:2; sidepanel.js:1; README.md:1; settings.js:75`  

### P1.51 Tidak ada min-width / @media di sidepanel.css — panel di bawah ~260px tak terkendali
`debt` · `Responsiveness & ketahanan layout` · impact **medium** · effort **low** · skor **6.7** · confidence medium  
**Masalah/Peluang:** Tidak ada satupun @media query atau min-width di seluruh sidepanel.css (diverifikasi grep: nihil). Body cuma display:flex column min-height:100vh (sidepanel.css:27-30), .tvd-main flex:1 (css:51) tanpa min-width:0. Layout 100% bergantung flex default, jadi degradasi di lebar ekstrem tidak terkendali (chip kepotong, baris tabrakan seperti temuan di atas).  
**Kenapa penting:** Side panel Chrome bisa diseret sampai sangat sempit. Tanpa lantai lebar, semua bug clipping di atas makin parah dan tak terprediksi. Memberi min-width:0 pada flex children mencegah elemen saling tumpang tindih saat user iseng menyempitkan panel.  
**Fix konkret:** Tambah pelindung tipis: .tvd-main { min-width: 0; } (css:51) dan opsional .card { min-width:0; } (css:52) cegah overflow flex children. Bila ingin lantai keras, set body { min-width: 260px; } (css:27) supaya di bawah itu muncul scroll horizontal yang jelas, bukan konten tumpang tindih diam-diam. Gabungkan dengan fix wrap di temuan lain. Uji rentang 260-500px.  
**Lokasi:** `sidepanel.css:27-30,51-52`  

### P1.52 Reset di Pengaturan diam-diam membuang filter 'excludeQuotes' (Requote) — dua sumber DEFAULTS beda
`bug` · `UX / alur interaksi` · impact **low** · effort **low** · skor **6.7** · confidence high  
**Masalah/Peluang:** DEFAULTS di settings.js (baris 3-9) TIDAK punya excludeQuotes, sedangkan DEFAULTS di sidepanel.js punya excludeQuotes:false (baris 16) dan content.js juga punya (baris 44). Reset di settings.js menulis ulang seluruh settings dengan structuredClone(DEFAULTS) (settings.js:65) → objek tersimpan kehilangan key excludeQuotes. Saat dimuat balik, content.js mergeSettings hanya menyalin field kalau saved[k]!=null (content.js:70-71) dan panel pakai Object.assign(DEFAULTS, saved) (sidepanel.js:82) → keduanya default ke false. Akibatnya nilai excludeQuotes=true yang sengaja diset user hilang DIAM-DIAM, padahal konfirmasi reset cuma bilang "preset tetap aman" (settings.js:64).  
**Kenapa penting:** Reset menjanjikan "balik ke default" tapi diam-diam membuang satu filter (Sembunyikan Requote) yang user mungkin sengaja set, tanpa disebut. Inkonsistensi dua sumber DEFAULTS adalah bug laten yang bikin perilaku reset makin tak terprediksi seiring fitur nambah.  
**Fix konkret:** Cepat: tambahkan excludeQuotes:false ke DEFAULTS settings.js (baris 6-8) sekarang. Benar: satukan DEFAULTS jadi satu sumber kebenaran (file shared defaults.js yang dipakai content.js, sidepanel.js, settings.js) lalu verifikasi tiap field di sidepanel/content DEFAULTS ada juga di settings DEFAULTS.  
**Lokasi:** `settings.js:3-9, sidepanel.js:3-25, content.js:31-51`  

### P1.53 'Cari di feed' yang lagi jalan mengunci klik berikutnya tanpa feedback; flag seeking bisa nyangkut
`bug` · `GAP / state interaksi` · impact **low** · effort **low** · skor **6.7** · confidence high  
**Masalah/Peluang:** seekTo set seeking=true (content.js:502) dan baru dilepas saat ketemu atau 45 langkah habis (~4.5 detik). Selama itu klik locate lain diabaikan diam-diam (content.js:501 'if(seeking)return'). Kalau Threads error di tengah atau Alfin spam-klik beberapa @username, hanya yang pertama jalan, sisanya diam tanpa feedback. Tidak ada tombol stop.  
**Kenapa penting:** Alfin no-coder akan klik beberapa kandidat berturut-turut saat tidak ada yang terjadi. Karena seeking mengunci, klik ke-2/3 diabaikan tanpa kabar, bikin kesan 'tombolnya rusak/random'.  
**Fix konkret:** Saat locate dipanggil ketika seeking==true, jangan abaikan diam-diam: kirim respons {ok:false,busy:true} dan panel toast 'Sabar, lagi nyari post sebelumnya…'. Tambahkan timeout pengaman yang selalu set seeking=false setelah max*interval + buffer.  
**Lokasi:** `content.js:501-517, sidepanel.js:298-302`  

### P1.54 Asumsi 1 tab Threads: getThreadsTab ambil active/[0] — multi-tab bikin perintah salah sasaran
`bug` · `Data / storage / state` · impact **medium** · effort **high** · skor **6.5** · confidence medium  
**Masalah/Peluang:** getThreadsTab diduplikasi di 3 file (sidepanel.js:66-70, settings.js:24-28, advanced.js:3-9) dengan logika sama: `tabs.find(t=>t.active) || tabs[0]`. Side panel hidup per-window dan tidak terikat ke satu tab. Kalau ada >1 tab Threads, 'active' adalah tab aktif di window hasil query — bisa bukan tab yang user maksud.  
**Kenapa penting:** Skenario nyata: Alfin buka 2 tab Threads (mis. feed utama + profil orang). Side panel menampilkan hasil dari tab A, tapi saat dia klik 'cari di feed' (locate) / start auto-scroll / rescan, sendToTab (sidepanel.js:71-75) mengirim ke `tabs.find(active)||tabs[0]` yang bisa tab B. Akibat: auto-scroll jalan di tab yang salah, locate gagal ('Post nggak ketemu' sidepanel.js:301/511) karena post ada di tab lain, atau hasil yang dirender milik tab berbeda dari yang menerima perintah. content.js broadcast tanpa tab-id (content.js:529) jadi panel tak tahu hasil itu dari tab mana. Membingungkan dan tampak seperti bug deteksi.  
**Fix konkret:** Ikat side panel ke tab tertentu. Di background.js, saat ikon diklik simpan tab.id aktif lalu teruskan ke panel (via chrome.storage.session atau query param). sendToTab kirim ke tabId itu, bukan re-query active. Untuk single-user yang sering 1 tab, minimal: deteksi >1 tab Threads dan tampilkan peringatan 'Ada beberapa tab Threads — aktif: <judul>' supaya tidak silent. Sekalian satukan 3 salinan getThreadsTab jadi satu helper bersama.  
**Lokasi:** `sidepanel.js:66-75, settings.js:24-28, advanced.js:3-9, content.js:529`  

### P1.55 parseCount: desimal-koma tanpa suffix diperlakukan sebagai pemisah ribuan
`bug` · `Mesin scraping & logika` · impact **low** · effort **low** · skor **6.5** · confidence medium  
**Masalah/Peluang:** Di parseCount (content.js:97), jalur tanpa suffix melakukan parseInt(m[1].replace(/[.,]/g,''),10) — menghapus SEMUA titik & koma. Benar untuk pemisah ribuan ('1.234'→1234, '1,234'→1234) tapi salah bila Threads menampilkan desimal tanpa suffix; '1,5' (ID desimal) → 15. Tidak ada disambiguasi locale ID(titik=ribuan)/EN(koma=ribuan) untuk kasus desimal.  
**Kenapa penting:** Mayoritas count besar Threads pakai suffix (rb/jt/K/M) sehingga jalur ini jarang kena angka desimal; risiko nyata kecil namun ada pada tampilan angka tak terduga. Disebut karena prompt minta telaah suffix & koma desimal — prioritas rendah dibanding bug 'm'/time.  
**Fix konkret:** Tambah disambiguasi: jika ada SATU pemisah diikuti tepat 1-2 digit di akhir DAN ada suffix, perlakukan desimal; selain itu anggap ribuan (perilaku sekarang). Karena Threads hampir selalu pakai suffix untuk angka besar, cukup pertahankan perilaku ribuan + tambah komentar/test agar perubahan UI ketahuan.  
**Lokasi:** `content.js:88-99`  

### P1.56 Preset tidak ikut crawlTarget/scrollSpeed/sortBy — apply preset diam-diam tinggalkan setelan lain
`bug` · `Data / storage / state` · impact **low** · effort **low** · skor **6.5** · confidence medium  
**Masalah/Peluang:** currentPresetConfig (sidepanel.js:99-105) hanya menyimpan: metrics, logic, dateRange, excludeReposts, excludeQuotes, keyword, keywordLogic, media, minRatio. crawlTarget, scrollSpeed, dan sortBy TIDAK disimpan. Saat preset diterapkan (sidepanel.js:178-181) `Object.assign(settings, structuredClone(presets[n]))` hanya menimpa field yang ada di preset — sisanya tetap pakai nilai saat ini.  
**Kenapa penting:** Dampak nyata: keputusan field-mana-yang-masuk-preset tidak didokumentasikan ke user, dan tidak ada feedback saat apply. Alfin bikin preset 'Viral Trading' saat target kolom = 'For You'. Lain hari dia di kolom lain, pilih preset itu — crawlTarget TIDAK ikut berubah (tak disimpan di preset) jadi scan jalan di kolom yang sedang dipilih, hasil bisa kosong/aneh, user bingung 'preset-nya rusak'. Karena preset adalah fitur andalan untuk riset berulang, ketidakjelasan cakupan preset langsung kena alur kerja inti.  
**Fix konkret:** Pilih satu dan dokumentasikan: jadikan preset eksplisit = 'kriteria deteksi/filter saja' (crawlTarget & scrollSpeed situasional, masuk akal dikecualikan). Lalu beri toast jelas setelah apply: 'Preset diterapkan (kriteria filter saja — target kolom & kecepatan tidak berubah)'. ATAU kalau memang ingin crawlTarget ikut, tambahkan ke currentPresetConfig (sidepanel.js:99-105). Yang penting: jangan silent.  
**Lokasi:** `sidepanel.js:99-105, sidepanel.js:178-181`  

---

## 🟡 P2 — Menengah  (77)

### P2.1 "Cari di feed" hampir selalu gagal untuk item riwayat — tidak ada jalan keluar
`improvement` · `UX / alur interaksi` · impact **medium** · effort **medium** · skor **6.2** · confidence high  
**Masalah/Peluang:** Klik username kartu memanggil locate (sidepanel.js:298-302 → content.js:518-525). seekTo (content.js:501-517) scroll dari atas maksimum 45 langkah; kalau React sudah me-recycle node, findPostEl gagal dan muncul toast "Post nggak ketemu — mungkin feed-nya udah ke-refresh" (content.js:511). Untuk item dari riwayat lintas sesi (dimuat dari tvdHistory dengan _el:null, content.js:565), post lama HAMPIR PASTI tidak ada lagi di DOM → "cari di feed" praktis selalu gagal, dan findPostEl cuma bisa balik kalau permalink-nya kebetulan masih render di feed (content.js:488-496).  
**Kenapa penting:** Affordance "Klik: cari di feed" (title di sidepanel.js:281) menjanjikan sesuatu yang sering tidak bisa ditepati, terutama untuk item riwayat — bikin user merasa fitur bohong. Padahal ada solusi yang pasti berhasil: buka permalink (tombol open sudah ada, sidepanel.js:294,297).  
**Fix konkret:** Saat locate gagal/seek mentok dan rec.link ada, jangan cuma toast buntu: tawarkan fallback buka permalink (chrome.tabs.create(rec.link)) lewat toast beraksi atau langsung. Lebih baik: untuk kartu yang _el===null sejak load riwayat, ubah aksi klik-username default jadi "buka permalink" bukan "cari di feed", dan bedakan visual kartu live vs kartu riwayat.  
**Lokasi:** `content.js:501-525, content.js:565, sidepanel.js:281, sidepanel.js:298-302`  

### P2.2 Segmented OR/AND & media toggles: state aktif tak terbaca AT (tak ada aria-pressed / radiogroup)
`improvement` · `Aksesibilitas` · impact **medium** · effort **medium** · skor **6.2** · confidence high  
**Masalah/Peluang:** Toggle OR/AND (.segmented #keyword-logic sidepanel.html:50-53 & #logic 72-75) dan media text/image/video (#media sidepanel.html:60-64) memakai <button> biasa + class .active untuk menandai pilihan secara visual saja (di-toggle di handler sidepanel.js:140-142). Tidak ada aria-pressed, role=radio, atau aria-label grup. Screen reader hanya mengumumkan 'OR button', 'AND button' tanpa tahu mana yang aktif.  
**Kenapa penting:** Pengguna AT tak bisa tahu logika filter saat ini OR atau AND, atau media mana yang sedang aktif — padahal ini menentukan hasil scan. Visual-only state melanggar WCAG 1.3.1/4.1.2.  
**Fix konkret:** Untuk OR/AND (saling eksklusif): bungkus .segmented dengan role="radiogroup" aria-label="Logika kriteria", tiap tombol role="radio" + aria-checked di-sync di handler (sidepanel.js:140-141). Untuk media (multi-pilih/toggle): tiap tombol aria-pressed="true|false" di-sync di handler (sidepanel.js:142) + aria-label (mis. 'Tampilkan post teks'). Tambah aria-label pada container #media (sidepanel.html:60).  
**Lokasi:** `sidepanel.html:50-53,60-64,72-75; sidepanel.js:140-142`  

### P2.3 applyHighlight menulis 5 properti inline style + panggil hexA() ke setiap post tiap scan
`improvement` · `Performa` · impact **medium** · effort **medium** · skor **6.2** · confidence high  
**Masalah/Peluang:** Di loop processPosts, untuk post viral applyHighlight(c) menulis 5 properti style (outline, outlineOffset, borderRadius, boxShadow, opacity) tiap scan (content.js:320-329, dipanggil 406) TANPA guard idempoten — jadi ditulis ulang tiap scan walau post sudah viral sejak scan lalu. (removeHighlight di 335-343 SUDAH punya guard `dataset.tvdViral==='1'`, jadi sisi non-viral sebagian sudah aman; sisi viral belum.) Selain itu applyHighlight memanggil hexA() (regex parse warna) tiap kali (content.js:326,330-334) padahal warna highlight jarang berubah.  
**Kenapa penting:** Menulis ke .style memicu invalidasi style/recalc. Dikali jumlah post viral termuat dikali frekuensi scan = recalc style berulang untuk perubahan nol. Parse warna via regex tiap post juga murni redundan.  
**Fix konkret:** Idempotent: di applyHighlight `if (el.dataset.tvdViral==='1') return;` supaya hanya menulis style saat transisi non-viral→viral. Pre-compute boxShadow color (hasil hexA) sekali saat settings.highlightColor berubah, simpan di variabel modul. Lebih baik lagi: satu class CSS + CSS var (`--tvd-hl` di :root, kelas .tvd-viral di content.css) supaya toggling = 1 classList op alih-alih 5 set style inline.  
**Lokasi:** `content.js:320-334, content.js:404-417`  

### P2.4 importSettings memuat JSON eksternal tanpa validasi struktur/tipe
`improvement` · `Keamanan & privasi` · impact **medium** · effort **medium** · skor **6.2** · confidence high  
**Masalah/Peluang:** settings.js:89-97 membaca .json pilihan user lalu `Object.assign(structuredClone(DEFAULTS), data.tvdSettings)` (settings.js:91) dan `toSet.tvdPresets = data.tvdPresets` apa adanya (settings.js:92), lalu `chrome.storage.local.set(toSet)` (settings.js:94). Tidak ada cek `data._app==='ThreadLens'` walau penanda itu DITULIS saat export (settings.js:75). Tidak ada validasi tipe: `maxItems` bisa string/negatif, `metrics.likes.min` bisa bukan angka, `highlightColor` bisa string arbitrer, `tvdPresets` bisa objek raksasa. Data ini lalu dikirim ke content.js via pushToTab (settings.js:31).  
**Kenapa penting:** User no-coder realistis meng-import file dari AI/teman/GitHub. Nilai cacat bikin rusak diam-diam: maxItems non-positif -> `while(viralMap.size > (settings.maxItems||300))` (content.js:411) menghapus item terus-menerus; min/minRatio non-number -> filter rusak senyap; highlightColor non-hex -> highlight tidak muncul (di-fallback di content.js:321/330 tapi tetap membingungkan). Bukan XSS langsung (highlightColor tidak masuk innerHTML), tapi integritas data & UX rusak tanpa pesan error.  
**Fix konkret:** Setelah JSON.parse di settings.js:89: tolak jika `data._app!=='ThreadLens'`; clamp `maxItems` ke 20..2000; pastikan `highlightColor` cocok `/^#[0-9a-f]{6}$/i` else pakai default; pastikan tiap `metrics[k].min` Number.isFinite & >=0; validasi shape `media`/`metrics`; batasi jumlah & panjang nama preset sebelum set tvdPresets.  
**Lokasi:** `settings.js:89-97, settings.js:75, content.js:411`  

### P2.5 Setelan kepecah 4 halaman yang semuanya buka tab baru, keluar dari panel
`improvement` · `UX / alur interaksi` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Gear & Help di sidepanel.js:155-156 pakai chrome.tabs.create → buka tab penuh (settings.html, help.html), dan settings.html sendiri me-link lagi ke help.html & advanced.html (settings.html:67-68). Jadi total 4 permukaan: panel utama, Pengaturan, Diagnostik, Tutorial — semuanya meninggalkan Side Panel. Setelan ringan yang sering dipakai (warna highlight, dim, max items, urutan default) ada di tab terpisah; tema malah double: ada di panel (sidepanel.js:154) DAN di settings (settings.js:48) → "setelan tema yang mana yang dipakai".  
**Kenapa penting:** Tiap buka tab = konteks pindah, feed Threads ketutup/keganti, user harus alt-tab balik. Untuk solopreneur yang kerja cepat ini friksi nyata tiap sesi. Dua sumber UI tema (panel + settings) — walau sebenarnya sinkron via storage — bisa bikin user bingung kenapa toggle satu tidak langsung mencerminkan yang lain.  
**Fix konkret:** Pindahkan setelan ringan (warna highlight, dim non-viral, max items, urutan default) ke dalam Side Panel sebagai section collapsible "Tampilan" — semua cuma baca/tulis settings + pushSettings (logic sama persis dengan settings.js:48-52), jadi reuse. Sisakan settings.html hanya untuk Data (export/import/reset) & link Diagnostik. Hilangkan duplikasi tema: cukup 1 toggle di header panel. Memangkas 4 permukaan jadi 2.  
**Lokasi:** `sidepanel.js:154-156, settings.html:39-69, settings.js:38-52`  

### P2.6 Clear arming 2-klik tidak punya Undo — riset ratusan post bisa hilang permanen
`improvement` · `UX / alur interaksi` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Clear pakai pola arm 2-klik dengan jendela 3 detik (sidepanel.js:161-176). Klik kedua langsung mengosongkan rawItems + kirim cmd clear ke content.js:441 (clearList), yang menandai semua id sebagai dismissed lalu menghapus tvdHistory (content.js:442-445). Tidak ada Undo, dan dismissed memastikan post yang sama TIDAK akan muncul lagi walau di-scan ulang (content.js:405). Tombol Clear ada di footer dekat tombol export yang sering dipakai (sidepanel.html:138-142).  
**Kenapa penting:** Effort untuk salah-hapus rendah (2 klik beruntun, posisi dekat export). Konsekuensinya tinggi & permanen. Untuk no-coder yang habis kerja keras scroll ngumpulin post, ini menyakitkan.  
**Fix konkret:** Setelah clear, simpan snapshot rawItems + id-id yang masuk dismissed, lalu tampilkan toast dengan aksi Undo ~5 detik: kalau diklik, restore viralMap dari snapshot dan keluarkan id dari dismissed di content.js. Karena toast sekarang cuma teks (sidepanel.js:245-251), perlu varian toast dengan tombol. Alternatif murah: tahan snapshot di memori panel + tombol kecil di empty-state "Kembalikan daftar terakhir".  
**Lokasi:** `sidepanel.js:161-176, content.js:441-447, sidepanel.js:245-251`  

### P2.7 rescanAll dijalankan tiap kali settings di-push (tiap perubahan kontrol) — full clear+rescan
`improvement` · `Performa` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Setiap perubahan kontrol di panel memanggil pushSettings()→sendToTab settings (sidepanel.js:76, dipanggil di hampir semua handler wireControls 137-149). Di content, pesan 'settings' memanggil `rescanAll()` (content.js:536) yang clearAllHighlights() (querySelectorAll seluruh dokumen, content.js:345), clearAllDim() (content.js:349), viralMap.clear(), remove storage, lalu processPosts() penuh. Geser slider speed / ketik keyword → rescan total tiap commit.  
**Kenapa penting:** Mengubah, mis., highlightColor atau scrollSpeed tidak perlu membuang seluruh viralMap & full re-scan + clear highlight global. Sekarang tiap tweak = clear DOM-wide + scan berat. Saat Alfin nyetel filter (geser slider, toggle metrik), tiap langkah memicu badai kerja.  
**Fix konkret:** Bedakan jenis perubahan: simpan settings sebelumnya; kalau yang berubah hanya kosmetik (highlightColor, dimNonViral, scrollSpeed) cukup re-apply highlight ringan / restart scroll, JANGAN viralMap.clear()+rescan. Hanya filter yang mengubah keanggotaan viral (metrics, logic, keyword, media, minRatio, dateRange, excludeReposts/Quotes, crawlTarget) yang perlu re-evaluasi — itu pun cukup re-evaluasi viralMap existing + satu processPosts tanpa membuang riwayat. clearAllHighlights pakai selektor cached, bukan querySelectorAll dokumen tiap kali.  
**Lokasi:** `content.js:536, content.js:433-440, content.js:344-350, sidepanel.js:134-200`  

### P2.8 ID post berbasis snippet (snip:user:teks) — record duplikat/bentrok di history
`improvement` · `Data / storage / state` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** idFor (content.js:368-370) memakai permalink kalau ada, kalau tidak fallback ke `snip:user:snippet.slice(0,30)`. getPermalink (content.js:155-158) hanya cek `a[href*=/post/]` / `a[href*=/t/]`; banyak post di feed tidak punya anchor itu ke-detect, jadi sering jatuh ke fallback snippet. (Catatan: getPostTime content.js:177-188 sudah baca time[datetime], tapi getPermalink TIDAK mencoba `time.closest('a')`.)  
**Kenapa penting:** Dampak nyata pada integritas history: (1) snippet diturunkan dari innerText yang dibersihkan (getSnippet content.js:164-176) — bisa berubah saat angka/waktu relatif berubah ('5m'->'1h') atau saat post di-translate/expand → 30 char pertama berbeda → id BERUBAH → record yang sama tersimpan DUA KALI di viralMap/tvdHistory, menggembungkan jumlah & merusak dedupe lintas sesi. (2) Dua post berbeda dari user sama dengan 30 char awal identik (mis. 'GM semuanya, hari ini IHSG…') → id BENTROK → satu post menimpa yang lain (content.js:412 Object.assign), hilang dari history. Untuk riset konten yang butuh daftar akurat, dedup yang salah = data tak bisa dipercaya.  
**Fix konkret:** Perkuat ekstraksi permalink di getPermalink: selain a[href*=/post/], ambil dari <time> yang biasanya dibungkus <a> permalink di Threads (`c.querySelector('time')?.closest('a')?.href`). Untuk fallback, gunakan kunci lebih stabil: user + snippet PENUH (bukan 30 char) + mediaType, dan ikutkan timeMs absolut dari time[datetime] (sudah dibaca di content.js:179) supaya dua post mirip tak bentrok dan perubahan waktu relatif tak mengubah id.  
**Lokasi:** `content.js:368-370, content.js:155-158, content.js:164-176, content.js:177-188`  

### P2.9 Analitik per-author (akun mana paling sering viral)
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Tidak ada agregasi per akun. Data user+counts sudah ada di rawItems (sidepanel.js:53,309) tapi cuma ditampilkan per-post di renderList.  
**Kenapa penting:** Insight strategis: 'akun X muncul 6x di hasil viral minggu ini' = kandidat untuk dipelajari/diikuti polanya. Lompatan dari 'kumpulin post' ke 'temukan kreator panutan di niche'.  
**Fix konkret:** Tambah panel/tab ringkas 'Per akun': group rawItems by user, hitung jumlah post viral, total likes, rata-rata ratio. Render tabel sortable kecil. Murni client-side dari rawItems yang sudah tersedia (sidepanel.js:253-305).  
**Lokasi:** `sidepanel.js:253-305, sidepanel.js:309`  

### P2.10 Ekstraksi hashtag & topik + ringkasan tren
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** fullText sudah dipegang saat scan (content.js:392) tapi hashtag/topik tidak diekstrak atau diagregasi. Tidak ada cara melihat 'topik apa yang lagi rame'.  
**Kenapa penting:** Untuk content creator, hashtag/kata kunci yang berulang di post viral = sinyal tema yang lagi naik. Jawaban langsung untuk 'aku harus bikin konten tentang apa minggu ini'.  
**Fix konkret:** Di content.js:404-412 ekstrak /#\w+/g dari fullText (content.js:392) ke rec.tags. Di sidepanel, agregasi frekuensi tag dari rawItems jadi mini 'tag cloud' (top 15 + jumlah); klik tag -> isi otomatis #keyword (settings.keyword, wiring sidepanel.js:148).  
**Lokasi:** `content.js:392-412, sidepanel.js:148`  

### P2.11 Kirim ide konten ke Todoist sebagai task
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Tidak ada jembatan ke eksekusi. Post viral menarik mati di daftar (renderList sidepanel.js:270); tidak otomatis jadi to-do 'bikin konten ini'.  
**Kenapa penting:** Alfin pakai Todoist untuk eksekusi. Tombol 'Jadikan task' di post yang dibintangi menutup loop riset->aksi: 'Buat thread IDX terinspirasi @x' langsung masuk inbox Todoist dengan link sumber.  
**Fix konkret:** Settings: Todoist API token. Tombol kartu 'Buat task' (di item-actions sidepanel.js:293-295) POST ke https://api.todoist.com/rest/v2/tasks dengan content='Konten dari @user: <snippet 60 char>' & description=link. Tambah 'https://api.todoist.com/*' ke host_permissions (manifest.json:18-23). Bisa dibatasi ke post berbintang.  
**Lokasi:** `manifest.json:18-23, sidepanel.js:293-303, settings.js:47-71`  

### P2.12 Alert/notif saat post lewat ambang viral (mode pantau)
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Deteksi viral pasif: Alfin harus melihat side panel. Saat auto-scroll jalan (startScroll content.js:469), tidak ada sinyal aktif ketika post baru melewati threshold.  
**Kenapa penting:** Mode 'pantau sambil kerja': Alfin biarkan auto-scroll jalan di tab Threads sambil kerja lain; dapat notif Chrome saat ada post benar-benar meledak. Mengubah produk dari 'tool aktif' jadi 'radar pasif'.  
**Fix konkret:** Saat post baru masuk viralMap (content.js:409-411) DAN counts.likes >= ambang 'alert' khusus (lebih tinggi dari threshold biasa), kirim chrome.notifications. Tambah permission 'notifications' di manifest.json:17. Toggle 'Beri notif post mega-viral' + input ambang di settings.  
**Lokasi:** `content.js:409-411, manifest.json:17, settings.js:47-71`  

### P2.13 Template export markdown yang bisa dikustom
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Format export .md di-hardcode (exportMd sidepanel.js:344-352: tabel tetap + section 'Teks'). copyAll (sidepanel.js:362-364) juga hardcode. Tidak bisa disesuaikan.  
**Kenapa penting:** Kebutuhan beda-beda: kadang Alfin mau cuma snippet+link untuk Notion, kadang tabel lengkap untuk arsip. Template kustom dengan placeholder ({user},{likes},{snippet},{link}) memberi fleksibilitas tanpa minta dia ngoding.  
**Fix konkret:** Tambah textarea template per-item di settings (mis. '- @{user} ({likes} like): {snippet}\n  {link}'), simpan di settings.exportTemplate. exportMd & copyAll render tiap item lewat template.replace placeholder. Sediakan 2-3 preset template siap pakai.  
**Lokasi:** `settings.js:47-71, sidepanel.js:342-366`  

### P2.14 Engagement velocity berjendela (likes/jam pakai delta, bukan sejak-posting)
`improvement` · `Fitur baru` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** velocity() (sidepanel.js:209-212) = likes / jam-sejak-posting. Cacat: bergantung timeMs yang sering null (return null kalau timeMs==null; unknownTime tinggi di advanced.js:17), dan post lama dengan banyak like tampak 'pelan' padahal mungkin lagi naik lagi.  
**Kenapa penting:** Rising/velocity adalah sinyal andalan (opsi sort 'rising' sidepanel.html:122, sidepanel.js:261), tapi rumusnya menyesatkan untuk post >1 hari dan gagal total saat waktu tidak terbaca. Velocity berbasis delta antar-scan jauh lebih jujur menunjukkan 'lagi meledak SEKARANG'.  
**Fix konkret:** Setelah fitur tracking lintas-sesi ada, ganti/tambah velocity berbasis (likesSekarang - likesScanSebelumnya)/jamBerlalu. Tidak butuh timeMs sama sekali, jadi imun terhadap unknownTime. Tetap sediakan fallback rumus lama.  
**Lokasi:** `sidepanel.js:209-212, content.js:177-188`  

### P2.15 Snapshot 'sesi riset' bernama (simpan & buka kembali kumpulan hasil)
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Hanya ada satu tvdHistory aktif (content.js:455,565). rescanAll & clearList menghapusnya (content.js:438,445). Tidak ada cara menyimpan 'hasil riset Senin' lalu mulai riset baru tanpa kehilangan yang lama.  
**Kenapa penting:** Riset Alfin bertema ('riset hook trading', 'riset solopreneur'). Sekarang memulai topik baru = menghapus yang lama. Sesi bernama membiarkan dia menumpuk riset lintas hari/tema & membandingkan.  
**Fix konkret:** Tambah 'Simpan sesi' di sidepanel: simpan snapshot rawItems sekarang ke chrome.storage.local di key tvdSessions[nama]. Dropdown 'Buka sesi' memuat kembali ke daftar (read-only/append). Mirip pola presets yang sudah ada (loadPresets/savePresets sidepanel.js:87-90, renderPresetOptions:106-111).  
**Lokasi:** `sidepanel.js:87-90, sidepanel.js:307-322, content.js:441-447`  

### P2.16 Mode banding sebelum/sesudah filter (kenapa post X tidak muncul)
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Saat hasil kosong/sedikit, Alfin tidak tahu apakah karena threshold ketat, keyword, media, atau scraping gagal. Diagnostik (advanced.js:36-44) hanya menampilkan angka mentah 6 sampel, bukan 'kenapa post ini ditolak'.  
**Kenapa penting:** STATUS produk: scraping rawan & belum dites dengan data asli. Alfin no-coder akan bingung 'kok kosong?'. Penjelasan alasan penolakan adalah pembeda antara tool yang dipercaya vs ditinggalkan.  
**Fix konkret:** Di processPosts (content.js:399-417) simpan untuk sampel post yang TIDAK lolos: alasan gagal (mis. 'likes 800 < 1000', 'keyword tak cocok', 'media difilter') — datanya sudah tersedia dari evalEngagement/keywordOk/mediaOk. Tampilkan di advanced.html sebagai 'Post terdekat yang ditolak + alasannya' (advanced.js:35-45).  
**Lokasi:** `content.js:399-417, advanced.js:35-45`  

### P2.17 Filter ambang dinamis 'top X% feed' (relatif, bukan absolut)
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Viral ditentukan threshold absolut (DEFAULTS.metrics min, content.js:32-37; evalEngagement content.js:232-243). Akun kecil/niche di Threads ID jarang tembus 1000 like, jadi feed niche bisa menghasilkan 0 hasil meski ada post yang relatif viral untuk konteksnya.  
**Kenapa penting:** Threshold 1000 like cocok untuk For You global tapi salah untuk feed niche kecil. Mode relatif ('top 10% post ter-scan berdasarkan like') mengangkat post yang menonjol DALAM konteksnya — lebih berguna untuk riset niche IDX/solopreneur yang audiensnya kecil.  
**Fix konkret:** Tambah mode kriteria 'Relatif: top X%'. Setelah scan, hitung persentil likes dari semua container ter-scan (containers di processPosts content.js:378-384), tandai viral yang di atas persentil pilihan. Toggle absolut/relatif di UI kriteria sidepanel.html:68-104.  
**Lokasi:** `content.js:232-243, content.js:378-400, sidepanel.html:68-104`  

### P2.18 'Pantau kolom' istilah tak intuitif + hint scroll nyuruh 'pilih 1 kolom' yang tak ada di feed 1-kolom
`improvement` · `Copywriting / microcopy` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Label 'Pantau kolom' (sidepanel.html:34) merujuk kolom multi-kolom desktop Threads (For you/Following). Untuk user feed 1 kolom, istilah 'kolom' membingungkan — dia nggak punya kolom. Hint 'Pilih 1 kolom dulu untuk auto-scroll' (sidepanel.html:112) hanya tampil saat crawlTarget==='all' (updateScrollHint, sidepanel.js:202), jadi user single-column lihat dropdown isi 'Semua' doang + hint nyuruh 'pilih 1 kolom' yang nggak ada di dropdown.  
**Kenapa penting:** Saat target 'Semua' & feed 1 kolom tanpa kolom ter-hover, scrollTargetEl() (content.js:461-468) jatuh ke window.scrollBy — auto-scroll SEBENARNYA jalan, tapi hint malah nyuruh user melakukan langkah mustahil ('pilih 1 kolom'). User bingung & mengira play rusak. Murni masalah wording + kondisi tampil hint.  
**Fix konkret:** Reword label sidepanel.html:34 jadi 'Kolom yang dipindai'. Penting: di feed 1 kolom (state.columns kosong, lihat renderState sidepanel.js:312-317), ubah hint jadi 'Feed kamu 1 kolom — auto-scroll langsung jalan, tinggal klik play.' Logika updateScrollHint() (sidepanel.js:202) perlu cek jumlah kolom terdeteksi, bukan cuma crawlTarget==='all'.  
**Lokasi:** `sidepanel.html:34, sidepanel.html:112, sidepanel.js:202, content.js:461-468`  

### P2.19 Banyak kontrol filter sekaligus = beban kognitif sebelum hasil pertama
`improvement` · `Aktivasi / friction jumlah langkah` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Sebelum lihat 1 kartu, panel memajang: Preset (sidepanel.html:19-29), Pantau kolom + Periode + Keyword + OR/AND + Media (32-66), Kriteria viral 4 metrik + ambang + OR/AND + Rasio + Sembunyikan repost/requote (69-104), baru Auto-scroll/Play (107-113), lalu hasil di paling bawah (116-134). Itu ~15 kontrol di atas tombol Play. Untuk no-coder yang baru buka, ini mengintimidasi dan menunda 'klik play lihat hasil'. Default sudah masuk akal, tapi tata letaknya menyiratkan 'isi semua ini dulu'.  
**Kenapa penting:** Aktivasi terbaik = 'klik 1 tombol, lihat keajaiban, baru tweak'. Saat ini urutannya kebalik: tumpukan setting dulu, Play & hasil paling bawah. User bisa lelah/ragu sebelum sampai Play. Spesifik ke produk ini: Play terkubur di antara filter, bukan saran generik 'sederhanakan UI'.  
**Fix konkret:** Pindahkan blok Auto-scroll/Play (sidepanel.html:106-113) ke ATAS, tepat di bawah header (di atas Preset), sebagai aksi utama ('Mulai pindai'). Bungkus card Keyword/Media/Kriteria/Rasio (32-104) dalam <details> 'Filter lanjutan' yang ter-collapse default (kriteria default tetap jalan karena disimpan di settings). First-run jadi: header → tombol Play besar → hasil. Tweak filter opsional/menyusul.  
**Lokasi:** `sidepanel.html:17-135`  

### P2.20 Fitur kuat (Rising, Skor, klik @username) minim discoverability di dalam panel
`improvement` · `REFRAME SEO → discoverability fitur di dalam app` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Help cuma ikon '?' kecil di header (sidepanel.html:12) yang baru kebuka sebagai TAB terpisah (sidepanel.js:155). Fitur kuat seperti Rising & Skor (definisi cuma di help.html:39-40), klik @username buat 'cari di feed' (handler sidepanel.js:298-302, satu-satunya petunjuk = title attribute 'Klik: cari di feed' sidepanel.js:281), preset, rasio komen/like — semuanya cuma dijelaskan di help.html yang harus dibuka manual. Di panel sendiri nggak ada tooltip/hint kontekstual; opsi sort 'Rising' & 'Skor' (sidepanel.html:120-122) cuma label tanpa penjelasan. User no-coder kemungkinan besar nggak pernah nemu fitur-fitur ini.  
**Kenapa penting:** Untuk produk privat, 'SEO' yang relevan = bisakah user MENEMUKAN kapabilitas yang sudah dibangun. Fitur hebat yang nggak ketemu = nilai nol. 'Klik @username untuk loncat ke post' cuma ketahuan dari title attribute — gampang terlewat. Fitur mahal dibangun (auto-seek seekTo, content.js:501-525) tapi under-utilized.  
**Fix konkret:** Tambah microcopy kontekstual: di dropdown sort kasih keterangan ('Rising — lagi naik daun', 'Skor — gabungan engagement') di sidepanel.html:120-122. Pertama kali daftar terisi, munculkan 1 toast tip 'Klik @username buat loncat ke postnya di feed' (pakai showToast sidepanel.js:245). Tambah ikon info kecil di samping 'Kriteria viral' & 'Rasio' yang buka definisi inline. Pertimbangkan tip rotator kecil di footer.  
**Lokasi:** `sidepanel.html:12, sidepanel.html:118-126, sidepanel.js:281, sidepanel.js:298-302, help.html:39-44`  

### P2.21 score() & export memperlakukan metrik tak-terbaca (null) sebagai 0 — post setengah-kebaca tampil setara
`improvement` · `Mesin scraping & logika` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** score(r) = (c.likes||0) + (c.comments||0)*3 + ... (sidepanel.js:205-208). Kalau countNearSvg gagal baca repost/share (sering, karena DOM Threads), null jadi 0 secara diam-diam. Post yang sebenarnya punya 5000 repost tapi gagal kebaca akan di-skor seakan repost=0, lalu di-sort/expor bareng post yang benar-benar repost=0. Tidak ada penanda 'data tidak lengkap' di kartu, export, atau skor.  
**Kenapa penting:** Karena scraping DOM dianggap RAWAN (status produk), kasus 'sebagian metrik null' itu umum, bukan langka. Akibatnya ranking Skor & Rising bias terhadap post yang kebetulan metriknya kebaca penuh, dan Alfin bisa salah pilih post 'kurang viral' untuk ide konten. Ide daftar soal magic-number scoring beda fokus; ini soal null-coercion yang menyamarkan data tidak lengkap.  
**Fix konkret:** Bedakan 0 vs null secara visual: di kartu, render '–' (sudah ada di fmt) DAN beri kelas redup pada metrik null. Di score(), opsional kurangi confidence atau tandai post dengan >=1 metrik null sebagai 'data parsial' (badge kecil). Di export tambah kolom 'lengkap?' atau biarkan sel null kosong (lihat ide XLSX) supaya ketahuan mana yang tidak terbaca.  
**Lokasi:** `sidepanel.js:205-208, sidepanel.js:267-269, content.js:114-128`  

### P2.22 Scan + simpan storage terus jalan saat side panel tertutup — boros CPU & nulis storage tanpa pembaca
`improvement` · `Performa` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Di content.js, setInterval(scheduleScan, 1300) dan MutationObserver subtree (baris 557-559) jalan terus selama tab Threads terbuka, TERLEPAS apakah side panel sedang dibuka. processPosts() tiap kali memanggil broadcast() (kirim ke void kalau panel tutup) dan saveHistory() (nulis seluruh viralMap ke chrome.storage tiap 900ms debounce). Tidak ada gating berdasarkan visibilitas panel atau document.hidden.  
**Kenapa penting:** Alfin sering biarkan tab Threads nganggur di background sambil kerja di Notion/Stockbit. Tanpa panel terbuka, extension tetap nge-scan DOM React tiap 1.3 detik + reflow + nulis storage — beban CPU/baterai dan I/O storage sia-sia berjam-jam. Ide perf lain fokus pada biaya per-scan saat AKTIF; ini soal scan yang jalan padahal tak ada yang nonton.  
**Fix konkret:** Gerbangi loop scan: pause scheduleScan & MutationObserver saat document.hidden (visibilitychange) ATAU saat panel tidak terhubung. Lacak status koneksi panel via pesan 'panel-open'/'panel-close' dari sidepanel.js (chrome.runtime onConnect/port atau ping berkala); kalau tak ada pembaca dalam N detik, hentikan interval & observer, hidupkan lagi saat panel minta state.  
**Lokasi:** `content.js:528-531, content.js:556-559, content.js:449-458`  

### P2.23 Tidak ada deteksi login-wall / logout — scan diam-diam nol tanpa menjelaskan kenapa
`feature` · `Aktivasi / time-to-first-result` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Kalau user belum login Threads atau kena halaman wall/login, feed tidak ada svg[aria-label] metrik, jadi findLikeSvgs kosong, containers kosong, hasil 0. Tidak ada cek apakah halaman dalam keadaan logged-out. Empty-state panel cuma bilang 'Belum ada data... refresh' (sidepanel.html:134) — menyesatkan saat masalahnya login.  
**Kenapa penting:** Ini penyebab umum 'hasil 0' yang tidak masuk daftar (daftar membedakan 'belum konek' vs 'kriteria ketat', tapi tidak 'belum login'). help.html step 1 memang 'login', tapi kalau sesi Threads expired Alfin tidak akan tahu itu sebabnya — dia akan kira extension rusak dan turunin ambang sia-sia.  
**Fix konkret:** Di content.js deteksi sinyal logged-out (mis. ada link/teks 'Log in'/'Masuk', tidak ada elemen feed sama sekali setelah beberapa scan) dan kirim flag ke state. Di panel tampilkan empty-state khusus: 'Sepertinya kamu belum login di Threads. Login dulu, lalu refresh.' Pisahkan dari empty-state 'filter terlalu ketat'.  
**Lokasi:** `content.js:375-379, sidepanel.html:134, sidepanel.js:270-273`  

### P2.24 Tidak ada penanganan saat tab Threads tertutup/berpindah domain saat panel terbuka — perintah hilang senyap
`improvement` · `Data / storage / state` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Panel mengandalkan getThreadsTab() tiap kirim perintah (sidepanel.js:66-75). Kalau Alfin menutup tab Threads atau navigasi keluar (mis. ke google.com) sementara panel tetap terbuka, getThreadsTab return null, sendToTab return null, dan SEMUA aksi (play, clear, locate, export bekerja atas rawItems lama) gagal tanpa notifikasi. Tombol play tetap terlihat aktif, statbar tetap menampilkan angka lama.  
**Kenapa penting:** Side panel Chrome persisten lintas-tab; sangat wajar tab Threads ditutup sementara panel masih nempel. Saat itu setiap klik 'nggak ngapa-ngapain' tanpa penjelasan — pengalaman membingungkan klasik untuk no-coder. Daftar punya ide multi-tab (salah sasaran) tapi tidak kasus 'tidak ada tab sama sekali saat panel hidup'.  
**Fix konkret:** Saat sendToTab mendeteksi getThreadsTab null, tampilkan toast/empty-state: 'Tab Threads-nya udah ketutup. Buka threads.com lagi.' Pantau chrome.tabs.onRemoved/onUpdated untuk men-disable tombol play & nge-grey statbar saat tidak ada tab Threads aktif.  
**Lokasi:** `sidepanel.js:66-75, sidepanel.js:153, sidepanel.js:161-176`  

### P2.25 Iklan & post 'Disarankan/Suggested' ikut dipindai dan dihitung viral — mencemari daftar riset
`improvement` · `GAP / kualitas data riset` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** processPosts() mengambil SEMUA container yang punya svg like (content.js:379) tanpa menyaring iklan/sponsored/suggested. Threads menyisipkan post 'Sponsored'/'Disarankan untukmu' yang punya engagement tinggi. Mereka lolos evalEngagement dan masuk viralMap + statbar 'Viral'.  
**Kenapa penting:** Tujuan Alfin adalah riset IDE KONTEN organik (trading/solopreneur). Iklan brand & post suggested random bukan sinyal tren organik — mereka noise yang menggeser daftar dan bikin export ke AI berisi sampah. Karena tampilan kartu cuma snippet, Alfin bahkan tidak sadar sebagian hasilnya iklan.  
**Fix konkret:** Tambah deteksi di processPosts sebelum push: cek apakah container.textContent (90 char awal) mengandung penanda 'Sponsored'/'Bersponsor'/'Disarankan'/'Suggested for you' (regex baru mirip REPOST_MARK), atau ada link href yang mengandung '/ads/'. Kalau ya, skip (jangan highlight, jangan masuk viralMap). Tambahkan juga toggle 'Sembunyikan iklan/suggested' default ON di kartu Kriteria.  
**Lokasi:** `content.js:375-418, content.js:28 (pola REPOST_MARK sbg contoh)`  

### P2.26 Reload halaman Threads di tengah sesi: '_el' hidup hilang, locate jadi tidak bisa diandalkan untuk item lama
`improvement` · `GAP / state lintas-reload` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Saat tab Threads di-refresh, content.js boot ulang, membaca tvdHistory dan mengisi viralMap dengan _el:null (content.js:565). Panel masih memegang rawItems lama. Setelah reload, klik @username -> locate -> rec._el null -> findPostEl jatuh ke pencarian via link -> sering gagal karena feed mulai dari atas/berbeda. Tidak ada sinkronisasi ulang antara reload tab dan panel.  
**Kenapa penting:** Alfin pasti reload Threads (kebiasaan saat feed nyangkut / habis ganti akun). Setelah itu daftar di panel terlihat utuh, tapi separuh fitur (locate, highlight di feed) diam-diam mati untuk item lama. Dia kira aplikasinya 'kadang jalan kadang enggak' — kepercayaan rontok.  
**Fix konkret:** Saat content.js boot dari history (content.js:562-568), kirim broadcast() segera setelah mengisi viralMap supaya panel tahu state direstore, DAN tandai item history (mis. rec._stale=true) sehingga panel bisa kasih hint di kartu: 'item dari sesi lama — buka via ↗, bukan cari di feed'. Atau saat locate gagal untuk item _el null, langsung sarankan tombol buka tab.  
**Lokasi:** `content.js:562-568, content.js:486-499`  

### P2.27 Tidak ada deteksi 'selector patah' saat Threads ubah layout — panel diam '0' tanpa bedakan feed kosong vs markup berubah
`improvement` · `GAP / ketahanan terhadap perubahan Threads` · impact **medium** · effort **medium** · skor **6** · confidence medium  
**Masalah/Peluang:** Seluruh mesin bergantung pada svg[aria-label] yang labelnya cocok KW (content.js:129-135). Kalau Threads mengubah aria-label (ikon tanpa label / bahasa baru), findLikeSvgs return [] → 'Dipindai: 0' selamanya, tanpa membedakan 'feed kosong' vs 'selector patah'. Tidak ada self-check.  
**Kenapa penting:** Threads sering ganti markup. Saat itu terjadi, Alfin (no-coder) tidak bisa tahu masalahnya di selector, bukan di dia. Dia lihat 0 terus, simpulkan 'extension mati', berhenti pakai. Untuk produk DOM-scraping, deteksi 'selector mungkin patah' adalah fitur bertahan-hidup.  
**Fix konkret:** Di processPosts, kalau document.querySelectorAll('svg[aria-label]').length > 0 (ada svg) TAPI findLikeSvgs(document).length === 0 selama beberapa scan, set diag.selectorMaybeBroken. Panel/Diagnostik tampilkan: 'Threads kayaknya berubah layout — metrik nggak kebaca. (Refresh; kalau tetap, extension perlu update.)'  
**Lokasi:** `content.js:129-135, content.js:375-379, advanced.js:11-23`  

### P2.28 Dark mode --card menyimpang: sidepanel #2a2a2d vs settings/help/advanced #26262a (token dicopy manual di 4 file)
`debt` · `ui-visual` · impact **medium** · effort **medium** · skor **5.9** · confidence high  
**Masalah/Peluang:** Nilai dark mode beda tipis antar file: sidepanel.css:22 --card:#2a2a2d (plus --bar:#24262e, --bg-2:#131315). settings.html:9 --card:#26262a (tanpa --bg-2/--bar). help.html:9 --card:#26262a. advanced.html:9 --card:#26262a. Kartu gelap di panel (#2a2a2d) sedikit beda dari kartu gelap di 3 halaman lain (#26262a). Token di-copy-paste manual di 4 tempat dan sudah menyimpang.  
**Kenapa penting:** Saat user pindah panel->settings di dark mode, kartu sedikit ganti rona abu (tidak sengaja). Karena dicopy manual di 4 tempat, perubahan tema ke depan pasti makin lari satu sama lain — sumber bug visual jangka panjang. Untuk vibe-coder ini jebakan: tiap edit warna harus ingat 4 file.  
**Fix konkret:** Idealnya pindahkan token :root + body.dark ke satu file CSS shared yang di-link semua halaman (settings/help/advanced sekarang pakai <style> inline). Quick win tanpa refactor: samakan angka — set sidepanel.css:22 --card ke #26262a juga (plus border/text identik) supaya minimal tidak menyimpang.  
**Lokasi:** `sidepanel.css:21-24, settings.html:9, help.html:9, advanced.html:9`  

### P2.29 Auto-scroll memanggil processPosts() langsung (bypass throttle) → scan beruntun saat DOM ramai
`debt` · `Mesin scraping & logika` · impact **medium** · effort **medium** · skor **5.9** · confidence high  
**Masalah/Peluang:** Ada tiga pemicu scan: setInterval(scheduleScan,1300) (content.js:557) dan MutationObserver debounce 600ms (558) — keduanya lewat scheduleScan yang ber-throttle 450ms (372). TAPI tick auto-scroll memanggil processPosts() LANGSUNG tiap tick (content.js:477) — bypass throttle — dengan interval 180-820ms (479). Threads SPA sangat sering memutasi DOM, jadi observer juga terus memicu scan.  
**Kenapa penting:** Saat auto-scroll (skenario utama produk), processPosts dipanggil tiap tick PLUS observer/interval memicu scheduleScan, dan tiap processPosts melakukan querySelectorAll('svg[aria-label]') seluruh root + detectColumns + saveHistory. Pada feed panjang ini bikin tab Threads janky — bertentangan dengan komentar 'throttle biar nggak nge-lag' (372). Untuk no-coder yang scroll lama, lag bikin scroll macet (kode bahkan punya workaround scrollBy(-80) saat mentok, 475-476).  
**Fix konkret:** Satukan jalur: tick auto-scroll panggil scheduleScan (ber-throttle), jangan processPosts() langsung. Naikkan throttle saat auto-scroll aktif dan/atau pakai requestIdleCallback. detectColumns sudah cache 3s (268) — pastikan auto-scroll tidak mem-bypass-nya lewat jalur processPosts langsung.  
**Lokasi:** `content.js:371-374,477,479,557-559`  

### P2.30 Tidak ada versioning/migration schema untuk tvdSettings & tvdHistory
`debt` · `Data / storage / state` · impact **medium** · effort **medium** · skor **5.9** · confidence high  
**Masalah/Peluang:** Tidak ada nomor schema di data tersimpan. tvdSettings/tvdPresets/tvdHistory disimpan apa adanya. Hanya export yang menempel `_v: "0.5"` (settings.js:75) — padahal app sudah v0.6.0 (manifest.json:4), jadi tag versi pun sudah basi & tidak pernah dipakai/dicek saat import (importSettings settings.js:83-102 mengabaikan _v).  
**Kenapa penting:** Dampak nyata saat bentuk data berubah antar versi: tvdHistory menyimpan record viral dengan field {id,link,user,counts,reasons,snippet,timeMs,repost,media} (content.js:407). Kalau nanti field di-rename/diubah bentuknya (mis. counts jadi nested), record lama di storage tetap dibaca mentah saat boot (content.js:565: `viralMap.set(it.id, {...it})`) lalu dirender renderList (sidepanel.js:287-290) yang mengakses `r.counts.likes` — record lama tanpa field baru = '–' atau (kalau counts hilang sama sekali) TypeError. Tanpa migration, tiap perubahan bentuk data = data lama korup diam-diam. Untuk vibe-coder yang sering iterasi, ini bom waktu.  
**Fix konkret:** Simpan `tvdSchema: 1` di storage. Saat boot (content.js:562-567 dan loadSettings) baca tvdSchema; kalau < versi sekarang jalankan migrate(old) yang isi field default yang hilang lalu naikkan angka. Samakan `_v` di export ke versi manifest (`chrome.runtime.getManifest().version`, jangan hardcode "0.5"). Untuk history, saat load beri guard: `if (!it.counts) it.counts = {}`.  
**Lokasi:** `settings.js:75, content.js:407, content.js:562-567, sidepanel.js:287-290`  

### P2.31 getThreadsTab disalin 3x verbatim (tanpa util bersama)
`debt` · `Maintainability / tech debt` · impact **medium** · effort **medium** · skor **5.9** · confidence high  
**Masalah/Peluang:** Fungsi getThreadsTab identik (query 4 pola URL threads.com/.net, pilih tab aktif lalu fallback ke tab[0]) muncul di sidepanel.js:66-70, settings.js:24-28, advanced.js:3-9. Tidak ada file util bersama. sidepanel.js juga punya sendToTab (sidepanel.js:71-75) yang settings.js/advanced.js tulis ulang inline tiap pakai.  
**Kenapa penting:** Threads bisa pindah domain/pola (mis. tambah subdomain atau path baru). Saat itu terjadi, ada 3 tempat yang harus diubah serempak; lupa satu = halaman itu (mis. Diagnostik) diam-diam berhenti nyambung ke tab. Daftar host juga dipakai di manifest.json:18-23 & 26-31 — totalnya 5 tempat yang harus konsisten. Untuk no-coder, "kenapa Diagnostik kosong padahal panel jalan" jadi misteri yang sulit dilacak.  
**Fix konkret:** Buat shared/tabs.js berisi getThreadsTab() + sendToTab() dan konstanta THREADS_URL_PATTERNS, muat via <script> di sidepanel.html/settings.html/advanced.html sebelum file logic. Hapus 3 salinan. Bonus: ekspor pola URL sebagai satu konstanta agar gampang dicocokkan dengan manifest saat domain berubah.  
**Lokasi:** `sidepanel.js:66-70; settings.js:24-28; advanced.js:3-9`  

### P2.32 Magic numbers timing & scoring tersebar tanpa nama
`debt` · `Maintainability / tech debt` · impact **medium** · effort **medium** · skor **5.9** · confidence high  
**Masalah/Peluang:** Angka kunci ditanam langsung di tengah logic tanpa konstanta bernama: throttle scan 450 (content.js:372), interval scan 1300 (content.js:557), debounce MutationObserver 600 (content.js:558), throttle hover 250 (content.js:551), seek max 45 langkah (content.js:507) & step 100ms (content.js:514), cache kolom 3000ms (content.js:268), rumus scroll "120 + speed*150" (content.js:473) dan "820 - speed*120" (content.js:479), serta bobot skor likes*1/komen*3/repost*5/share*4 di score() (sidepanel.js:207) yang HASILNYA dipakai lagi di export (sidepanel.js:348 exportMd & sidepanel.js:357 exportXlsx).  
**Kenapa penting:** Saat Alfin bilang "scroll-nya kependekan/kecepetan" atau "skor repost harusnya lebih berat", Claude harus berburu angka yang tak bernama di banyak baris dan menebak mana yang benar. Untuk bobot skor, kebetulan sudah aman karena export memanggil score() (bukan menyalin rumus), TAPI tetap satu angka ajaib di tengah ekspresi — kalau suatu saat ada yang menyalin rumusnya ke tempat lain, baru pecah. Tanpa nama, tiap penyetelan jadi tebak-tebakan rawan salah sasaran.  
**Fix konkret:** Di content.js, kumpulkan ke satu blok di bawah CONFIG: const TIMING = { scanThrottle:450, scanInterval:1300, moDebounce:600, hoverThrottle:250, seekMax:45, seekStep:100, colCacheMs:3000 }; dan const SCROLL = { base:120, perSpeed:150, intervalBase:820, intervalPerSpeed:120 }. Untuk bobot skor, jadikan satu const SCORE_WEIGHTS = { likes:1, comments:3, reposts:5, shares:4 } dan pakai di score() — export sudah lewat score() jadi otomatis ikut.  
**Lokasi:** `content.js:372,557,558,551,507,514,268,473,479; sidepanel.js:207`  

### P2.33 Logika clone state tidak seragam: content.js pakai JSON-clone, panel/settings pakai structuredClone — risiko hilang field & beda perilaku
`debt` · `Maintainability / tech debt` · impact **medium** · effort **medium** · skor **5.9** · confidence high  
**Masalah/Peluang:** content.js mendefinisikan clone() = JSON.parse(JSON.stringify) (baris 65) untuk DEFAULTS/settings, sedangkan sidepanel.js (baris 51, 82) dan settings.js (baris 12) pakai structuredClone. DEFAULTS sendiri sudah triplikat & divergen (sudah di daftar). Dua strategi clone berbeda + tiga sumber DEFAULTS membuat sangat mudah satu field ada di satu file tapi hilang/ke-reset di file lain (persis kasus excludeQuotes & sortBy yang sudah ditemukan).  
**Kenapa penting:** Ini akar struktural dari beberapa bug yang sudah terdaftar (DEFAULTS divergen, excludeQuotes ke-reset, sortBy hilang). Tanpa satu sumber kebenaran, tiap fitur baru yang Alfin minta berisiko menambah field di satu file saja dan diam-diam hilang di file lain. Daftar mencatat gejalanya; ini mengangkat penyebab umum + inkonsistensi clone yang belum disebut.  
**Fix konkret:** Buat satu file shared (mis. defaults.js) berisi DEFAULTS lengkap + helper clone, di-load oleh sidepanel/settings/advanced via <script> dan oleh content.js (content script bisa pakai file terpisah di manifest content_scripts js array). Pilih satu metode clone (structuredClone tersedia di semua konteks MV3). Hapus duplikasi DEFAULTS di 3 file.  
**Lokasi:** `content.js:31-65, sidepanel.js:3-51, settings.js:3-12`  

### P2.34 getSnippet pembersihan angka di ekor bisa makan angka isi post yang sah
`bug` · `Mesin scraping & logika` · impact **low** · effort **medium** · skor **5.5** · confidence medium  
**Masalah/Peluang:** getSnippet (content.js:166) menghapus ekor angka metrik dengan /(\s+[\d.,]+(?:rb|ribu|jt|juta|k|m|b)?){2,}\s*$/i — yaitu 2+ angka berturut di akhir teks. Tapi banyak post DIAKHIRI angka asli (mis. 'target IHSG 7.500 dan 7.800', 'sisa 3 hari', daftar harga). Karena innerText menempel angka metrik di ekor TANPA pemisah jelas dari isi, regex bisa memotong angka yang bagian konten.  
**Kenapa penting:** Snippet adalah teks utama yang user baca di panel (sidepanel.js:284) dan yang diekspor/diumpankan ke AI (sidepanel.js:351,357,363). Kalau angka penting (harga saham, tanggal, statistik) terpotong, konteks hilang. Untuk Alfin (trader IDX) yang banyak post berisi angka, ini terasa.  
**Fix konkret:** Bangun snippet dari node teks BADAN post saja (kecualikan subtree tombol aksi/metrik berdasarkan svg[aria-label] terdekat), bukan dari c.innerText penuh lalu di-regex. Kalau tetap pakai innerText, perketat: hanya buang ekor yang persis cocok pola 4 metrik, bukan sembarang '2+ angka'.  
**Lokasi:** `content.js:164-176; sidepanel.js:284,351,357,363`  

### P2.35 Multi-tab Threads: panel menampilkan state/stats dari tab manapun yang terakhir broadcast, tanpa penanda sumber
`bug` · `GAP / silent staleness` · impact **low** · effort **medium** · skor **5.5** · confidence medium  
**Masalah/Peluang:** renderState menulis stats dari state terakhir yang diterima (sidepanel.js:307-322); broadcast() dari content tidak menyertakan identitas tab (content.js:528-530). getThreadsTab memilih tab AKTIF. Kalau Alfin punya 2 tab Threads, panel bisa menampilkan/menimpa daftar & 'Dipindai' dari tab berbeda tanpa dia tahu tab mana.  
**Kenapa penting:** Multi-tab adalah kebiasaan riset (For You di satu tab, profil orang di tab lain). Statbar dan daftar diam-diam bercampur/berganti sumber. Alfin bisa export hasil dari tab yang sudah dia tinggalkan secara mental, tanpa sadar.  
**Fix konkret:** Sertakan tab.id + URL pendek di state yang dibroadcast dan di results-head tampilkan 'Sumber: <feed/url>'. Simpan tabId aktif di panel; kalau broadcast datang dari tabId berbeda, jangan timpa diam-diam atau beri hint 'sumber berganti'.  
**Lokasi:** `sidepanel.js:307-322, content.js:528-530, content.js:66-70`  

### P2.36 Filter bahasa (mis. hanya post Bahasa Indonesia)
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **5.4** · confidence low  
**Masalah/Peluang:** Tidak ada filter bahasa. For You Threads mencampur EN/ID/lainnya. keywordOk (content.js:210) hanya cocokkan kata, bukan bahasa.  
**Kenapa penting:** Alfin bikin konten Indonesia. Post viral berbahasa Inggris/asing sering tidak transferable ke audiens-nya. Filter ID cepat memangkas hasil ke yang relevan.  
**Fix konkret:** Heuristik ringan di content.js:404-412: deteksi kata fungsi ID ('yang','dan','aku','nggak','banget','gak','sih') vs EN ('the','and','you','this') dari fullText, tandai rec.lang. Toggle 'Hanya ID' di filter sidepanel.html:31-66. Tidak sempurna tapi cukup memangkas noise; murni client-side.  
**Lokasi:** `content.js:392-412, sidepanel.html:31-66`  

### P2.37 Preview thumbnail media di kartu hasil
`feature` · `Fitur baru` · impact **medium** · effort **medium** · skor **5.4** · confidence low  
**Masalah/Peluang:** mediaTypeOf (content.js:194-200) sudah tahu image/video tapi URL thumbnail tidak ikut disimpan ke rec (content.js:407) atau ditampilkan. Kartu hasil hanya teks (renderList sidepanel.js:279-296).  
**Kenapa penting:** Untuk riset visual (carousel, meme, screenshot), teks snippet tidak cukup — Alfin perlu lihat gambarnya untuk menilai angle. Thumbnail kecil membuat scanning hasil jauh lebih cepat.  
**Fix konkret:** Saat scan, ambil src gambar pertama >120px (logika sudah ada di mediaTypeOf content.js:196-197) ke rec.thumb (content.js:407). Di renderList tampilkan <img> kecil lazy-loaded. Catatan: URL CDN Threads bisa kedaluwarsa, jadi jangan diandalkan untuk history lama — tampilkan placeholder kalau gagal load.  
**Lokasi:** `content.js:194-200, content.js:407, sidepanel.js:279-296`  

### P2.38 N/A: header/footer ber-bar --bar #e9eef7 cuma di side panel — settings/help/advanced WAJAR tanpa bar
`na-note` · `ui-visual` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** sidepanel.css:15 --bar:#e9eef7 (biru sangat pucat) dipakai header (:37) & footer (:159). settings/help/advanced tidak punya header/footer ber-bar (cuma h1 polos di atas body). Ini BUKAN bug: settings/help/advanced adalah halaman tab penuh (lebar) yang memang tidak butuh sticky bar seperti side panel sempit. Jadi ketiadaan bar di sana wajar.  
**Kenapa penting:** Dicatat supaya tidak ada saran salah arah 'samakan header semua halaman'. Side panel sempit butuh sticky header/footer untuk akses cepat tombol; halaman pengaturan lebar dibaca scroll biasa. Memaksa bar biru ke settings/help malah salah.  
**Fix konkret:** Tidak ada aksi wajib. Micro-polish opsional: pastikan img logo + judul style sama (sudah cukup sama: settings.html:37, help.html:25). Biarkan struktur layout beda sesuai konteks lebar.  
**Lokasi:** `sidepanel.css:15,35-39,159, settings.html:37, help.html:25, advanced.html:21`  

### P2.39 Footer 5 tombol & range slider TAHAN di panel sempit — N/A sebagai bug, jangan diutak-atik
`na-note` · `Responsiveness & ketahanan layout` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Prompt curiga footer 5 tombol & range slider bermasalah di panel sempit. Setelah dicek: .tvd-footer (sidepanel.css:159) flex gap:7px, tiap .fbtn flex:1 height:42px hanya berisi ikon (sidepanel.html:138-142). Di 280px: (280 - padding 28 - 4 gap*7) ≈ 224/5 ≈ 44px per tombol — cukup untuk ikon 19px (css:164). Range slider (.speed flex:1, #speed flex:1, css:122-124) juga aman karena hanya butuh sedikit lebar dan diapit '−'/'+' kecil.  
**Kenapa penting:** Menandai ini sebagai bug akan jadi saran palsu. Footer berbasis ikon + flex:1 justru contoh layout yang benar tahan banting; range slider tidak menampung teks dinamis jadi tak ada risiko clipping. Energi fix sebaiknya ke .item-counts & baris yang benar-benar pecah.  
**Fix konkret:** Tidak perlu perubahan. Verifikasi cepat: buka panel, seret ke ~280px, pastikan kelima ikon footer tetap segaris & bisa diklik. Kalau nanti ditambah tombol ke-6 di footer barulah tinjau ulang (di ~250px mulai sempit).  
**Lokasi:** `sidepanel.css:159-169, sidepanel.html:137-143`  

### P2.40 Tidak ada prefers-reduced-motion untuk .tvd-flash & transition
`improvement` · `Aksesibilitas` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Animasi flash 'cari di feed' (.tvd-flash, content.css:8-9; keyframes box-shadow pulsa 0.7s, content.css:4-7) dan transisi toast/footer (sidepanel.css:162 transition:background, 175 transition:all .25s + 178 transform) tidak menghormati prefers-reduced-motion. content.js:358 juga memberi outline kuning #f5c518 mendadak ke post yang ditemukan.  
**Kenapa penting:** Pengguna yang sensitif gerakan (vestibular) atau yang sengaja set 'reduce motion' di OS tetap kena pulsa box-shadow tiap kali locate. Bukan blocker besar untuk extension personal, tapi murah dipenuhi dan content.css memang khusus animasi.  
**Fix konkret:** Di content.css tambah: @media (prefers-reduced-motion: reduce){ .tvd-flash{ animation: none; box-shadow: 0 0 0 3px rgba(255,77,79,.6); } }. Di sidepanel.css tambah blok @media (prefers-reduced-motion: reduce){ *,*::before,*::after{ transition:none !important; animation:none !important; } } lalu pastikan toast tetap muncul (pakai opacity tanpa transform).  
**Lokasi:** `content.css:4-9; sidepanel.css:162,175,178; content.js:358`  

### P2.41 Range slider #speed: tak ada aria-label & arti nilai untuk pembaca layar
`improvement` · `Aksesibilitas` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Slider kecepatan auto-scroll (#speed, sidepanel.html:110) diapit <span class="spd-end">−</span>/<span class="spd-end">+</span> dekoratif, min=1 max=5 tanpa aria-label, aria-valuetext, atau output nilai. Pengguna AT hanya dengar 'slider, 3' tanpa konteks 'kecepatan'.  
**Kenapa penting:** Pengguna tak tahu slider ini untuk apa dan satuan/arti nilainya. − dan + visual tak terbaca sebagai makna. accent-color sudah diterapkan (sidepanel.css:124) jadi visual oke, tapi semantiknya kosong.  
**Fix konkret:** Tambah aria-label="Kecepatan auto-scroll" pada #speed dan aria-hidden="true" pada kedua <span class="spd-end"> (sidepanel.html:110). Opsional: set aria-valuetext dinamis ('Lambat'..'Cepat') di handler input (sidepanel.js:145).  
**Lokasi:** `sidepanel.html:110; sidepanel.js:145`  

### P2.42 score() & velocity() dihitung ulang berkali-kali per render saat sort + per kartu
`improvement` · `Performa` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** applyView memanggil arr.sort dengan comparator yang memanggil score()/velocity() (sidepanel.js:260-262) — comparator dipanggil O(n log n) kali, tiap panggilan menghitung ulang skor. Lalu renderList memanggil velocity(r) lagi per kartu (sidepanel.js:275). Karena renderState→applyView berjalan tiap broadcast (~0.2-0.5s saat aktif), perhitungan ini diulang terus untuk data yang sama.  
**Kenapa penting:** Bukan bottleneck terbesar, tapi murni redundan: untuk 300 item, sort 'score'/'rising' menghitung score/velocity ribuan kali tiap render. Mudah dihilangkan dan menurunkan CPU panel.  
**Fix konkret:** Pre-compute sekali per render: `const withScore = arr.map(r => ({r, _score:score(r), _vel:velocity(r)}))` lalu sort pakai field cache, dan oper _vel ke renderList agar tak hitung ulang. Atau cache _score/_vel di objek rawItems saat renderState menerima data baru, invalidasi saat counts/timeMs berubah.  
**Lokasi:** `sidepanel.js:205-212, sidepanel.js:253-265, sidepanel.js:270-305`  

### P2.43 N/A: tidak ada build step / bundle / lazy-load — tapi parse cost ikon SVG string layak diakui
`na-note` · `Performa` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Optimasi performa front-end klasik seperti code-splitting, tree-shaking, minify/bundle, lazy import, image optimization pipeline TIDAK berlaku: produk ini vanilla JS murni tanpa npm/build (sesuai spec), file kecil, dimuat sebagai unpacked extension lokal — tak ada cost jaringan/parse signifikan dari ukuran bundle.  
**Kenapa penting:** Menyebut hal-hal itu akan jadi saran generik yang menyesatkan. Yang RELEVAN & nyata: blok ICONS (sidepanel.js:28-49) adalah string SVG yang di-inject berulang via innerHTML di tiap kartu setiap render (cntEl sidepanel.js:268 & renderList 279-296) — biaya parse HTML→SVG berulang, bukan biaya bundling.  
**Fix konkret:** Tidak perlu build tooling. Cukup: render ikon SVG SEKALI sebagai elemen template lalu cloneNode(true) per kartu alih-alih innerHTML string tiap render; dan terapkan diffing renderList agar ikon tak di-parse ulang. (Lihat ide renderList & score-cache.)  
**Lokasi:** `sidepanel.js:27-49, sidepanel.js:267-269, sidepanel.js:279-296`  

### P2.44 N/A: storage.sync / cloud backup — benar dilewati, reframe ke export rutin
`na-note` · `Data / storage / state` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Saran generik 'pakai chrome.storage.sync untuk sinkron lintas device' atau 'tambah backend untuk persist data' TIDAK relevan: produk sengaja 100% client-side, dipakai pribadi via load-unpacked, tanpa backend (manifest.json:17 hanya minta 'storage'), dan storage.sync punya kuota mungil (~100KB total, 8KB/item) yang tak muat tvdHistory besar — pasti QUOTA_BYTES_PER_ITEM error.  
**Kenapa penting:** Menjelaskan kenapa N/A mencegah salah arah: memindah tvdHistory (content.js:450-458 menyimpan array penuh dalam satu item) ke storage.sync langsung gagal karena ukuran per-item, dan menambah backend bertentangan dengan sifat produk (no server, no npm, data scraping tetap di mesin sendiri). Jadi jangan kejar sinkronisasi cloud.  
**Fix konkret:** Reframe ke yang berlaku: jadikan EXPORT (lihat ide 'tvdHistory bisa di-export') sebagai mekanisme backup/transfer manual antar device — cukup untuk 1 user. Tetap di storage.local. Kalau mau 'sinkron' ringan, biarkan Alfin export JSON ke Notion/Google Drive-nya sendiri secara manual; tidak perlu kode sinkron.  
**Lokasi:** `manifest.json:17, content.js:450-458`  

### P2.45 esc() + highlightKw sudah benar & konsisten di kartu post
`na-note` · `Keamanan & privasi` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Verifikasi titik render paling rawan: username & snippet dari feed dirender via innerHTML di sidepanel.js:279-296. Username pakai `@${esc(r.user||'?')}` (sidepanel.js:281) dan snippet pakai `highlightKw(esc(r.snippet||''))` (sidepanel.js:284). esc() (sidepanel.js:231) meng-escape & < > ". highlightKw (sidepanel.js:232-242) beroperasi DI ATAS string yang sudah di-esc, dan term keyword di-escape via `term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')` sebelum jadi RegExp (sidepanel.js:238).  
**Kenapa penting:** Ini titik tempat data feed tak tepercaya masuk innerHTML. Hasil telaah: AMAN. Urutan esc-dulu-baru-highlight benar (highlight hanya menyisipkan `<strong class="kwhit">$1</strong>` di sekitar match dari string yang sudah di-escape, tidak memasukkan teks feed mentah). Regex keyword sudah di-escape sehingga tidak ada regex-injection yang bisa memecah markup. Disebut agar jelas bagian ini sudah benar dan tidak boleh disentuh.  
**Fix konkret:** Tidak ada. Pertahankan pola `highlightKw(esc(x))` dan JANGAN PERNAH balik urutannya jadi `esc(highlightKw(x))` (itu akan meng-escape <strong> yang baru disisipkan).  
**Lokasi:** `sidepanel.js:231-242, sidepanel.js:281, sidepanel.js:284`  

### P2.46 ReDoS pada highlightKw: N/A (term di-escape), sisanya beban linear
`improvement` · `Keamanan & privasi` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** highlightKw (sidepanel.js:237-240) membuat satu RegExp per term lalu `out.replace(re,...)` pada snippet. Term sudah di-escape jadi literal (sidepanel.js:238), jadi pola catastrophic-backtracking TIDAK terbentuk — 'ReDoS' yang ditanyakan audit memang N/A di sini. Yang tersisa hanya beban linear O(jumlah_term × panjang_snippet × jumlah_kartu) kalau user paste keyword sangat banyak (mis. 500 koma) lewat field #keyword (sidepanel.js:148).  
**Kenapa penting:** Karena `[.*+?^${}()|...]` di-escape jadi literal, tidak ada nested quantifier — tidak ada ReDoS klasik. Dampak nyata cuma panel ngelag (DoS-diri-sendiri) saat term sangat banyak × ratusan kartu, bukan celah keamanan (data input dari user sendiri). Confidence tinggi bahwa ReDoS klasik tidak ada di build ini.  
**Fix konkret:** Opsional: batasi `terms.slice(0,20)` di sidepanel.js:235 dan skip term sangat pendek (mis. <2 char). Tidak mendesak (hanya memengaruhi performa panel user sendiri).  
**Lokasi:** `sidepanel.js:232-242, sidepanel.js:235`  

### P2.47 Klaim "100% lokal / tanpa backend" TERVERIFIKASI benar
`na-note` · `Keamanan & privasi` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Grep seluruh sumber untuk fetch/XMLHttpRequest/sendBeacon/WebSocket/EventSource/new Image()/.src=/import()/eval/new Function/importScripts/externally_connectable/content_security_policy: NIHIL (0 match). Tidak ada manifest CSP yang melonggarkan, tidak ada remote script di HTML (sidepanel.html:147-148 hanya vendor lokal xlsx-mini.js + sidepanel.js). Font (vendor/fonts/pjs-var.woff2) & generator xlsx semua lokal.  
**Kenapa penting:** Klaim privacy inti produk ('100% client-side, tanpa backend') TERBUKTI: tidak ada satu pun jalur keluar jaringan. Data feed yang di-scrape hanya disimpan di chrome.storage.local (tvdHistory/tvdSettings/tvdPresets) dan diekspor lokal via Blob + URL.createObjectURL (sidepanel.js:336-341). Temuan positif penting untuk dipertahankan — aman dipakai riset konten tanpa data bocor ke server.  
**Fix konkret:** Tidak ada. Untuk menjaga: jangan tambah host_permissions baru, jangan tambah library remote (CDN), pertahankan semua vendor offline. Kalau suatu saat butuh fetch, dokumentasikan eksplisit.  
**Lokasi:** `manifest.json:17-23, vendor/xlsx-mini.js, sidepanel.html:147-148`  

### P2.48 Badge angka di ikon extension (passive monitor count)
`feature` · `Fitur baru` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Jumlah viral cuma terlihat di teks #stats (sidepanel.js:310) saat panel terbuka. background.js (baris 1-13) tidak punya listener pesan, jadi ikon toolbar diam.  
**Kenapa penting:** Alfin bisa menutup side panel tapi tetap mau tahu 'sudah ketemu berapa post viral'. Badge angka di ikon = glanceable, tidak makan ruang layar, cocok dengan mode pantau pasif.  
**Fix konkret:** content.js broadcast() (content.js:528-530) sudah kirim state.stats.viral. Tambah chrome.runtime.onMessage listener di background.js -> chrome.action.setBadgeText({text: String(count)}) + setBadgeBackgroundColor. Tidak butuh permission baru.  
**Lokasi:** `background.js:1-13, content.js:528-530`  

### P2.49 Shortcut keyboard (toggle scroll, rescan, copy prompt)
`feature` · `Fitur baru` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Semua aksi butuh klik di side panel (scroll-btn sidepanel.js:153, dll). Tidak ada key 'commands' di manifest.json. Saat tab fokus di Threads, Alfin harus pindah ke panel untuk start/stop scroll.  
**Kenapa penting:** Riset viral itu repetitif (scroll, jeda, rescan, copy). Shortcut mempercepat loop harian dan terasa 'pro'. Murah secara teknis.  
**Fix konkret:** Tambah key 'commands' di manifest.json (mis. Alt+Shift+S start/stop scroll, Alt+Shift+C copy-prompt). Tangani chrome.commands.onCommand di background.js (saat ini tanpa listener) -> teruskan ke content via tabs.sendMessage; content.js onMessage handler (baris 534-544) sudah mengenal cmd startScroll/stopScroll/rescan. Dokumentasikan di help.html.  
**Lokasi:** `manifest.json:17, background.js:1-13, content.js:534-544`  

### P2.50 Kolom 'rasio' & 'skor' terlihat + sortir di tabel hasil
`improvement` · `Fitur baru` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** ratioOk (content.js:226-231) memakai rasio komen/like sebagai FILTER, tapi nilai rasionya sendiri tidak pernah ditampilkan di kartu. score() (sidepanel.js:205-208) dipakai untuk sort & export tapi tidak terlihat di kartu UI (renderList hanya tampilkan counts+velocity sidepanel.js:285-292).  
**Kenapa penting:** Rasio komen/like tinggi = post 'kontroversial/diskusi' (emas untuk engagement). Alfin tidak bisa melihat nilai ini per post untuk memprioritaskan. Skor juga tak terlihat meski jadi basis pengurutan.  
**Fix konkret:** Di renderList (sidepanel.js:285-292) tambahkan chip kecil rasio (counts.comments/counts.likes) dan/atau skor di sebelah velocity. Murni tampilan dari data yang sudah ada, tanpa scraping baru.  
**Lokasi:** `sidepanel.js:205-212, sidepanel.js:285-292`  

### P2.51 Hitung & tampilkan total engagement agregat sesi
`feature` · `Fitur baru` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** #stats hanya tampilkan 'Dipindai / Viral' (sidepanel.js:310). Tidak ada ringkasan agregat (total like semua post viral, rata-rata ratio, akun unik) padahal rawItems punya semua datanya (sidepanel.js:309).  
**Kenapa penting:** Ringkasan satu baris ('120 post viral · 4.2jt like · 18 akun unik · ratio rata 0.09') memberi Alfin gambaran cepat kualitas batch riset sebelum export, dan enak dipakai sebagai header konteks saat umpan ke AI.  
**Fix konkret:** Hitung dari rawItems di applyView/renderState (sidepanel.js:253-264, 307-322) dan tampilkan baris ringkasan kecil di atas daftar. Murni client-side. Bisa juga dimasukkan ke header export .md/prompt.  
**Lokasi:** `sidepanel.js:307-322, sidepanel.js:253-264`  

### P2.52 N/A note: integrasi Stockbit / data IDX langsung
`na-note` · `Fitur baru` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Alfin trader IDX & pakai Stockbit, tapi ThreadLens lingkupnya scraping DOM Threads (content.js) + chrome.storage. Menarik data harga/emiten IDX ke extension ini di luar domain produk dan butuh sumber/API eksternal yang melanggar prinsip '100% client-side, no backend, scope Threads'.  
**Kenapa penting:** Penting dikatakan jujur: menggabungkan IDX/Stockbit terdengar relevan dengan profil Alfin tapi akan mengaburkan fokus produk (riset konten Threads) dan menambah kompleksitas/permission tanpa kejelasan nilai. Bukan masalah nyata di kode, jadi jangan dipaksakan jadi fitur.  
**Fix konkret:** Jangan bangun integrasi data IDX di sini. Reframe ke yang berlaku: dukung niche trading lewat fitur yang TETAP di domain Threads — preset keyword 'Trading IDX' (saham/IHSG/cuan/cut loss, lihat ide quick-preset) dan filter bahasa ID. Itu memberi nilai untuk trader-creator tanpa keluar lingkup.  

### P2.53 Toast inkonsisten: casing, titik, dan tanda centang campur-campur
`improvement` · `Copywriting / microcopy` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Gaya toast tidak konsisten. Contoh: 'Klik sekali lagi untuk hapus' (sidepanel.js:165, tanpa titik), 'Isi nama preset dulu' (sidepanel.js:185, tanpa titik), 'Belum ada post buat di-export.' (sidepanel.js:343,355, pakai titik), 'Post nggak ketemu.' (sidepanel.js:301, titik), 'Tersalin 5 post' (sidepanel.js:365) vs 'Setelan diimpor ✓' (settings.js:96, pakai ✓) vs 'Riwayat dihapus' (settings.js:61, tanpa ✓) vs 'Setelan di-reset' (settings.js:69). Campur 'di-export'/'diimpor'/'disimpan'.  
**Kenapa penting:** Inkonsistensi kecil bikin produk terasa kurang rapi. Untuk produk personal nggak fatal, tapi gampang dirapikan dan menaikkan kepercayaan user pada toast — satu-satunya feedback aksi yang dia andalkan.  
**Fix konkret:** Tetapkan satu aturan: toast pendek tanpa titik, tanpa ✓. Selaraskan jadi: 'Klik sekali lagi untuk hapus', 'Isi nama preset dulu', 'Belum ada post untuk di-export', 'Post tidak ketemu', 'Tersalin 5 post', 'Setelan diimpor' (hapus ✓ di settings.js:96), 'Riwayat dihapus', 'Setelan direset' (settings.js:69).  
**Lokasi:** `sidepanel.js:165,185,301,343,355,361,365; settings.js:61,69,96`  

### P2.54 'Dipindai' di stats tanpa konteks — rasio Dipindai-vs-Viral timpang bikin user ragu akurasi
`improvement` · `Copywriting / microcopy` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Stats bar (sidepanel.html:117): 'Dipindai: 0 • Viral: 0'. 'Dipindai' (total post unik kelewat sesi ini) cuma dijelaskan di help.html:48. Saat auto-scroll, 'Dipindai' melonjak (ratusan) sementara 'Viral' tetap kecil — user bisa cemas 'kenapa cuma sedikit yang viral dari ratusan?' tanpa tau itu normal (filter ketat).  
**Kenapa penting:** Tanpa tooltip, rasio timpang terlihat seperti tool gagal mendeteksi, padahal itu desain. Mempengaruhi kepercayaan user pada akurasi — isu sentral mengingat scraping rawan.  
**Fix konkret:** Tambah title pada #stats (sidepanel.html:117): 'Dipindai = total post yang kelewat · Viral = yang lolos kriteria'. Teksnya sudah ada di help.html:48, tinggal diangkat jadi tooltip inline (zero layout change).  
**Lokasi:** `sidepanel.html:117, help.html:48`  

### P2.55 Nama produk di action title nggak konsisten — 'Threads Viral Detector' vs 'ThreadLens'
`improvement` · `REFRAME SEO → ASO/branding kalau kelak dipublish` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** manifest.json name='ThreadLens' (v0.6.0) tapi action.default_title masih 'Threads Viral Detector' (manifest.json:7). Tooltip ikon toolbar yang dilihat user tiap hari menampilkan nama lama. Deskripsi manifest (manifest.json:5) sudah pakai 'ThreadLens', tapi judul aksi ketinggalan. Sekalian: settings.js:75 export menandai _v:'0.5' padahal manifest version 0.6.0 — versi salah di file export.  
**Kenapa penting:** Untuk sekarang (privat) ini bikin sedikit bingung identitas. KALAU kelak dipublish ke Web Store, konsistensi nama = fondasi ASO; tooltip & title ikut ditampilkan dan inconsistency bikin produk kelihatan amatir. Fix-nya satu baris, worth dirapikan sekarang.  
**Fix konkret:** Set action.default_title ke 'ThreadLens' (atau 'ThreadLens — Deteksi post viral Threads') di manifest.json:7 supaya konsisten dengan name. Sekalian samakan _v di settings.js exportSettings (saat ini '0.5', settings.js:75) dengan versi manifest '0.6.0'.  
**Lokasi:** `manifest.json:7, settings.js:75`  

### P2.56 SEO halaman web sebagian besar N/A — tapi struktur export adalah 'SEO'-nya AI
`na-note` · `SEO (jujur N/A) + reframe` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** SEO klasik (meta tag, sitemap, indexability, backlink, Core Web Vitals) TIDAK berlaku: ini extension privat load-unpacked, halaman-halamannya (sidepanel/settings/help/advanced) adalah chrome-extension:// yang nggak diindeks mesin pencari, dan produk eksplisit nggak dipublish ke Web Store. Jadi nggak ada permukaan SEO untuk dioptimasi.  
**Kenapa penting:** Menulis saran meta-description/sitemap di sini = saran template generik yang dilarang. Yang RELEVAN sudah dipecah jadi ide terpisah: (a) ASO kalau kelak dipublish [lihat ide nama konsisten], (b) discoverability fitur di dalam panel [lihat ide Help], (c) struktur export agar maksimal dibaca AI [lihat ide metadata & kolom export]. Ketiganya 'SEO' yang benar-benar berlaku untuk produk ini.  
**Fix konkret:** Tidak ada aksi SEO web. Fokuskan energi 'ditemukan & terbaca' ke tiga reframe di atas. Kalau suatu hari publish: siapkan listing (judul ASO ber-keyword 'Threads viral/analytics/content research', screenshot panel+highlight+export, kategori Productivity, deskripsi 2 paragraf), dan WAJIB tambah privacy policy + justifikasi permission walau 100% client-side.  

### P2.57 NOT-DEAD: COLUMN_IGNORE & REPOST_MARK ternyata terpakai (hipotesis terbantah)
`na-note` · `Maintainability / tech debt` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** Dugaan audit bahwa COLUMN_IGNORE dan REPOST_MARK adalah konstanta tak terpakai TIDAK benar. Grep mengonfirmasi keduanya dipakai: COLUMN_IGNORE menyaring kolom Activity/Search di content.js:298 (out.filter((c) => !COLUMN_IGNORE.test(c.label || ""))), dan REPOST_MARK dipakai isRepost() di content.js:189. Keduanya didefinisikan di content.js:27-28.  
**Kenapa penting:** Penting dicatat jujur supaya tidak ada yang menghapus konstanta ini mengira dead code — menghapus COLUMN_IGNORE bikin kolom Activity/Search ikut discan (post aktivitas/hasil pencarian bocor ke daftar viral); menghapus REPOST_MARK mematikan deteksi repost (statistik repostDetected di Diagnostik & filter Hide repost rusak).  
**Fix konkret:** Tidak ada aksi penghapusan. Justru beri komentar singkat di content.js:27-28 menjelaskan keduanya dipakai di mana (// COLUMN_IGNORE: filter kolom di detectColumns; REPOST_MARK: isRepost) agar tak salah dikira tak terpakai saat audit berikutnya.  
**Lokasi:** `content.js:27-28; content.js:189; content.js:298`  

### P2.58 Tombol Enter di input preset/keyword/threshold tidak memicu aksi — beban ekstra untuk no-coder
`improvement` · `UX / alur interaksi` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** preset-name (sidepanel.html:24) hanya tersimpan via klik tombol Simpan; menekan Enter di field tidak melakukan apa-apa (tidak ada keydown handler, lihat wireControls). Sama untuk m-min number inputs yang pakai event 'change' (sidepanel.js:138) — perubahan baru terpush setelah blur, bukan saat Enter, sehingga terasa 'tidak ngefek' kalau user ketik lalu langsung lihat hasil.  
**Kenapa penting:** Pola muscle-memory: ketik nama lalu Enter. Untuk Alfin no-coder, harus pindah tangan ke tombol Simpan tiap kali itu friksi kecil yang berulang. Ditambah perubahan ambang yang baru aktif setelah blur memperkuat keluhan 'macet' yang sudah ada di daftar (perubahan ambang tidak langsung memfilter).  
**Fix konkret:** Tambah listener keydown Enter pada #preset-name -> klik #preset-save. Pertimbangkan input event (debounced) untuk m-min agar perubahan ambang lebih responsif, atau commit on Enter. Pastikan tidak menambah rescanAll berlebihan (lihat ide rescan tiap settings).  
**Lokasi:** `sidepanel.html:24, sidepanel.js:138, sidepanel.js:182-191`  

### P2.59 Quote (Requote) dideteksi & dihitung tapi tidak pernah ditampilkan di stats/diagnostik utama — sulit memvalidasi filter
`improvement` · `Mesin scraping & logika` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** isQuote dihitung per post (content.js:391) dan masuk ke samples diagnostik (baris 397, tampil [QUOTE] di advanced.js:41), TAPI tidak ada agregat 'quoteDetected' di stats seperti halnya repostDetected (content.js:381,396,424). Diagnostik hanya menampilkan repost count di status (advanced.js:18), bukan quote. Sementara filter excludeQuotes adalah filter yang paling longgar/rawan (sudah di daftar: isQuote terlalu longgar).  
**Kenapa penting:** Karena isQuote diakui rawan false-positive, Alfin butuh cara melihat 'berapa banyak post yang dikira quote' untuk memutuskan apakah aman mencentang Sembunyikan Requote. Tanpa angka agregat, dia menyalakan filter buta dan post asli bisa hilang tanpa dia sadari. Ini melengkapi ide isQuote-longgar dengan jalur observability-nya.  
**Fix konkret:** Tambah quoteDetected ke stats (content.js:381,396,424) dan tampilkan di advanced.js status sejajar 'Repost terdeteksi' termasuk status filter excludeQuotes ON/off. Opsional tampilkan ringkas di panel saat excludeQuotes aktif ('Menyembunyikan N requote').  
**Lokasi:** `content.js:381, content.js:396, content.js:424, advanced.js:18`  

### P2.60 Copy semua memakai emoji (❤💬🔁↗) yang tidak konsisten dengan ikon SVG & bisa rusak saat ditempel ke AI/Notion
`improvement` · `Copywriting / microcopy` · impact **low** · effort **low** · skor **5.2** · confidence high  
**Masalah/Peluang:** copyAll() merangkai teks dengan emoji ❤💬🔁↗ (sidepanel.js:363). Ini (a) inkonsisten dengan keputusan desain memakai set ikon SVG line di seluruh UI, dan (b) untuk tujuan 'umpankan ke AI', emoji metrik kurang eksplisit dibanding label teks — model & manusia harus menebak 🔁 = repost vs share. Format copy juga tidak mencantumkan waktu/skor yang justru berguna untuk ideasi.  
**Kenapa penting:** Output utama produk ini adalah teks yang ditempel ke AI/Notion untuk jadi ide konten. Label eksplisit ('Like: 5rb, Komen: 200') jauh lebih AI-ready dan tahan-render daripada emoji yang bisa tampil sebagai kotak di sebagian font/tool. Daftar menyentuh toast inkonsisten & istilah campur, tapi format Copy-as-text belum dibahas.  
**Fix konkret:** Ganti emoji dengan label teks ringkas di copyAll: 'Like 5rb · Komen 200 · Repost 120 · Share 30' + tambah Skor dan tanggal. Pertimbangkan format yang selaras dengan ide 'Copy sebagai prompt ide konten' yang sudah ada (bisa jadi satu implementasi).  
**Lokasi:** `sidepanel.js:360-366`  

### P2.61 Self-reply chain (thread beruntun author sendiri) pecah jadi banyak kartu terpisah dengan engagement terbelah
`improvement` · `GAP / scraping edge case` · impact **medium** · effort **high** · skor **5** · confidence medium  
**Masalah/Peluang:** Saat Alfin membuka satu thread detail atau feed menampilkan rangkaian balasan author sendiri, tiap pressable-container balasan punya svg metrik sendiri dan jadi entri terpisah di viralMap. isQuote/isRepost tidak menangani self-reply chain. Snippet tiap potongan dianggap post berdiri sendiri.  
**Kenapa penting:** Konten viral di Threads sering berupa THREAD beruntun (hook di post 1, isi di balasan). Alfin dapat 5 kartu terpisah dari 1 ide, engagement pecah, dan saat di-export ke AI konteks hancur (potongan tanpa kepala). Beda dari item daftar 'gabung 1/2 2/2': self-reply yang TIDAK ditandai '1/2' pun tetap pecah.  
**Fix konkret:** Deteksi self-reply: kalau username balasan == username post induk dan keduanya dalam container thread yang sama, kelompokkan jadi satu record (engagement post pertama sebagai utama, gabung snippet). Minimal tandai rec.partOfThread=true supaya kartu menunjukkan ikon 'bagian dari thread' dan Alfin sadar konteksnya.  
**Lokasi:** `content.js:190-193 (isQuote), content.js:384-418`  

### P2.62 Dim non-viral pakai opacity 0.45 — terlalu pucat, konten jadi nyaris tak terbaca
`improvement` · `ui-visual` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** content.js:415 saat settings.dimNonViral aktif: c.style.opacity='0.45'. Opacity 0.45 pada seluruh kartu post (teks abu Threads + gambar) bikin konten non-viral sangat pudar, hampir hilang. Settings menjualnya 'Biar yang viral makin nonjol di feed' (settings.html:47).  
**Kenapa penting:** 0.45 itu agresif: post non-viral nyaris tak terbaca, padahal user sering perlu SCAN cepat semua post (termasuk non-viral) untuk konteks/ide, bukan menghilangkannya. Akibatnya fitur dim malah jarang dinyalakan karena terlalu ekstrem, atau dinyalakan lalu user frustrasi tak bisa baca.  
**Fix konkret:** Quick win: ganti '0.45' jadi '0.6' di content.js:415 (masih jelas redup tapi terbaca). Lebih elegan: ganti opacity penuh dengan grayscale/turun-saturasi (filter:grayscale(.5)). Idealnya jadikan nilai dim bisa diatur, tapi naikkan default dulu.  
**Lokasi:** `content.js:415, settings.html:47`  

### P2.63 Statbar "Dipindai/Viral" pasif — tombol scan jauh dari area hasil
`improvement` · `UX / alur interaksi` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** #stats (sidepanel.html:117, diisi sidepanel.js:310) menampilkan angka tapi tidak ada CTA. Saat scanned tinggi & viral rendah, satu-satunya cara nambah hasil adalah scroll/auto-scroll lebih banyak — tapi tombol play ada di card terpisah di atas results-head (sidepanel.html:107-113), jauh dari area hasil tempat mata user berada.  
**Kenapa penting:** Loop riset utama = "scan lebih banyak → lihat hasil bertambah". Tombol pemicu loop itu jauh dari indikator hasil. User harus scroll panel ke atas tiap mau lanjut scan. Untuk sesi riset panjang ini friksi berulang.  
**Fix konkret:** Letakkan kontrol auto-scroll (play/pause + speed) yang sudah ada juga dekat results-head, atau jadikan statbar mengandung tombol ▶ kecil saat scrolling=false. Reuse handler #scroll-btn (sidepanel.js:153). Alternatif murah: pindahkan card Auto-scroll (sidepanel.html:107-113) ke tepat di atas results-head (sidepanel.html:116).  
**Lokasi:** `sidepanel.html:107-127, sidepanel.js:310, sidepanel.js:324-328`  

### P2.64 Tidak ada indikator 'sedang memindai' — panel terasa beku saat scan jalan
`improvement` · `UX / alur interaksi` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** Saat auto-scroll jalan (content.js startScroll loop) atau MutationObserver memicu scan (content.js:558), update ke panel datang lewat broadcast→renderState yang hanya memperbarui angka stats & daftar (sidepanel.js:307-322). Tidak ada indikator 'sedang aktif memindai'. Saat feed lambat memuat atau di antara tick, panel tampak diam beberapa detik.  
**Kenapa penting:** Tanpa sinyal 'hidup', user no-coder ragu apakah ekstensi bekerja, lalu menekan tombol berkali-kali atau menyimpulkan rusak — khususnya saat auto-scroll on tapi belum ada post baru yang lolos (nyambung ke masalah hasil-0).  
**Fix konkret:** Tambah indikator hidup sederhana di results-head: saat scrolling===true ATAU stats.scanned naik sejak update terakhir, tampilkan titik berdenyut / teks 'memindai…'. Datanya sudah ada: scrolling flag di msg (sidepanel.js:371), dan perubahan scanned bisa dibandingkan dengan nilai sebelumnya di renderState (sidepanel.js:310).  
**Lokasi:** `sidepanel.js:369-373, sidepanel.js:307-322, sidepanel.html:116-117`  

### P2.65 Target klik tombol aksi kartu 33x30px di bawah target nyaman (WCAG 2.5.5)
`improvement` · `Aksesibilitas` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** .item-actions button berukuran 33x30px (sidepanel.css:152-153) dan .media-toggles button 42x34px (sidepanel.css:86). Keduanya di bawah target 44x44px (WCAG 2.5.5 AAA); masih lewat minimum AA 2.5.8 (24x24). Tombol .open di kartu adalah satu-satunya tombol per kartu, jadi 33x30 cukup kecil untuk daftar panjang.  
**Kenapa penting:** Untuk produk yang dipakai di side panel sempit dengan daftar panjang kartu (maxItems default 300), target kecil bikin salah-klik (terutama trackpad/layar sentuh). Bukan kegagalan AA mutlak (lewat 24px), tapi nyata mengganggu presisi.  
**Fix konkret:** Naikkan ke minimal 36-44px: .item-actions button { width:36px; height:32px; } (sidepanel.css:152-153) dan .media-toggles button height 34 -> 38 (sidepanel.css:86). Kalau ruang mepet, pertahankan ukuran visual ikon tapi perbesar area klik dengan padding/inset pseudo-element.  
**Lokasi:** `sidepanel.css:86,152-153`  

### P2.66 Tombol hapus 'klik 2x': state 'armed' tak terbaca AT
`improvement` · `Aksesibilitas` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** Tombol #clear pakai pola 'arm' 2-klik dalam 3 detik (sidepanel.js:161-176): klik pertama hanya menambah class .arm (warna jadi merah) + showToast. Bagi pengguna AT, perubahan warna tidak terbaca dan toast tidak di-announce (lihat ide aria-live). Tidak ada perubahan accessible state pada tombolnya sendiri.  
**Kenapa penting:** Pengguna keyboard/AT bisa tak sadar tombol sudah 'armed' dan menghapus seluruh riwayat tanpa konfirmasi yang terdengar. Beda dengan reset di settings yang pakai confirm() asli (settings.js:64) yang aksesibel.  
**Fix konkret:** Saat armed (sidepanel.js:163-167): $('#clear').setAttribute('aria-label','Konfirmasi hapus daftar — klik lagi'); kembalikan ke 'Bersihkan daftar' saat timer habis (sidepanel.js:167). Kombinasikan dengan toast role=status (lihat ide aria-live) agar diumumkan, idealnya aria-live="assertive" saat arming.  
**Lokasi:** `sidepanel.js:161-176; sidepanel.html:141`  

### P2.67 Daftar hasil bukan struktur list semantik (div.list > div.item)
`improvement` · `Aksesibilitas` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** #list adalah <div class="list"> (sidepanel.html:133) berisi <div class="item"> yang dibuat di renderList (sidepanel.js:277-278). Tidak ada role=list/listitem atau elemen ul/li. Screen reader tak mengumumkan jumlah item atau memungkinkan navigasi antar-item sebagai daftar.  
**Kenapa penting:** Hasil scan bisa puluhan-ratusan item (maxItems default 300). Tanpa semantik list, pengguna AT kehilangan 'X of N' dan shortcut navigasi list — padahal menelusuri kandidat post viral adalah inti workflow.  
**Fix konkret:** Beri role="list" pada #list (sidepanel.html:133) atau ganti ke <ul>. Pada tiap el .item di renderList set role="listitem" (sidepanel.js:278) atau buat <li>. Biarkan #stats (dengan aria-live) yang mengumumkan total, atau tambah aria-label pada #list.  
**Lokasi:** `sidepanel.html:133; sidepanel.js:270-304`  

### P2.68 highlightColor disuntik ke style inline halaman Threads (tanpa guard)
`improvement` · `Keamanan & privasi` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** content.js:323 & 326 memakai `settings.highlightColor` langsung: `el.style.outline='3px solid '+col` dan `el.style.boxShadow='0 0 0 2px '+hexA(col,0.25)`. Sumber col: <input type=color> (selalu valid hex, settings.js:50) ATAU file import (settings.js:91, bisa string apa pun karena belum divalidasi).  
**Kenapa penting:** Karena disetel via `el.style.outline=` (assignment per-properti, browser mem-parse value), nilai yang bukan warna valid DITOLAK untuk properti itu — injeksi properti CSS lain TIDAK terjadi lewat jalur ini dan tidak ada cssText mentah. Jadi risiko XSS/CSS-injection praktis NIHIL; ini bukan bug keamanan tapi celah robustness. Yang tersisa: nilai invalid bikin highlight diam-diam tidak muncul (outline kosong) padahal user mengira filter jalan.  
**Fix konkret:** Guard di content.js:321: `const col=/^#[0-9a-f]{6}$/i.test(settings.highlightColor)?settings.highlightColor:'#2563eb';`. Idealnya digabung dengan validasi import (lihat ide importSettings) sehingga nilai invalid tidak pernah masuk storage sejak awal.  
**Lokasi:** `content.js:321-326, settings.js:91`  

### P2.69 Permission "tabs" kemungkinan berlebih vs host-scoped
`improvement` · `Keamanan & privasi` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** manifest.json:17 minta `"tabs"` bareng storage & sidePanel. Penggunaan nyata hanya: `chrome.tabs.query({url:[...threads...]})` (sidepanel.js:67, settings.js:25, advanced.js:4), `chrome.tabs.sendMessage` (sidepanel.js:74, settings.js:31, advanced.js:52), dan `chrome.tabs.create({url})` untuk help/settings/post (sidepanel.js:155-156, 294, 297). Tidak ada yang membaca title/url tab di luar Threads.  
**Kenapa penting:** Permission `tabs` memberi akses metadata (url/title) SEMUA tab. host_permissions Threads (manifest.json:18-23) sudah cukup: `tabs.query` terfilter url Threads tetap mengembalikan url/id karena host permission Threads sudah dimiliki; `create` & `sendMessage` tidak butuh `tabs`. Prinsip least-privilege — kalau file ini pernah dibagikan/di-load orang lain, ia tidak perlu bisa membaca daftar semua tab.  
**Fix konkret:** Coba hapus `"tabs"` dari manifest.json:17, reload extension, lalu tes: query terfilter Threads, create, dan sendMessage harus tetap jalan. Kalau `tab.url`/`tab.title` jadi undefined di luar dugaan, kembalikan saja. Effort sangat kecil, mudah di-rollback.  
**Lokasi:** `manifest.json:17, sidepanel.js:67, sidepanel.js:74`  

### P2.70 tvdHistory simpan konten/identitas akun orang lain tanpa kadaluarsa
`improvement` · `Keamanan & privasi` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** saveHistory (content.js:450-457) menyimpan SELURUH viralMap (username, snippet, link, counts, timeMs) ke chrome.storage.local 'tvdHistory' lintas sesi, dibatasi hanya oleh maxItems (default 300, dipangkas di content.js:411). Saat boot, data ini dimuat kembali (content.js:563-566). Data bertahan sampai tombol Clear/Hapus riwayat ditekan (settings.js:58, sidepanel.js:175).  
**Kenapa penting:** Ini mempersistenkan PII pihak ketiga (handle + isi post) di disk lokal tanpa TTL. Untuk riset pribadi sah, tapi data lama menumpuk dan IKUT TERSINKRON kalau profil Chrome disinkronkan ke device lain / laptop dipinjam. Bukan kerentanan eksternal, tapi higiene data nyata untuk content creator yang scrape banyak akun.  
**Fix konkret:** Opsional: di saveHistory (content.js:454) buang item dengan timeMs lebih tua dari mis. 30 hari sebelum set, atau tambah opsi 'auto-clear saat tutup'. Minimal: dokumentasikan di help.html bahwa data tersimpan lokal sampai 'Hapus riwayat' diklik (saat ini help.html tidak menyebut ini).  
**Lokasi:** `content.js:450-457, content.js:411, content.js:563-566`  

### P2.71 Listener pesan tidak verifikasi sender (hardening opsional)
`improvement` · `Keamanan & privasi` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** content.js:534 onMessage hanya cek `msg.source==='tvd'` (content.js:535) lalu menjalankan command (settings/startScroll/stopScroll/rescan/clear/locate, content.js:536-543). Listener di sidepanel.js:369-373 & advanced.js:61-63 serupa — tidak ada cek `sender`.  
**Kenapa penting:** chrome.runtime.onMessage di content script hanya menerima pesan dari extension yang sama; `externally_connectable` TIDAK diset di manifest (terverifikasi nihil), jadi halaman web (termasuk Threads) TIDAK bisa mengirim pesan ini. Risiko nyata RENDAH — hanya komponen extension sendiri yang bisa kirim. Murni hardening defense-in-depth, bukan bug aktif.  
**Fix konkret:** Opsional: di content.js:535 tambah `if(sender && sender.id!==chrome.runtime.id) return;`. Tidak mendesak.  
**Lokasi:** `content.js:534-543, sidepanel.js:369-373`  

### P2.72 Inline <script> di advanced.html/help.html diblokir CSP default MV3
`na-note` · `Keamanan & privasi` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** Tidak ada `content_security_policy` di manifest (grep nihil), jadi berlaku default MV3 `script-src 'self'`. advanced.html:36-38 & help.html:52-54 punya blok `<script>` INLINE (init dark-mode: baca tvdSettings.theme lalu add class 'dark'). Default MV3 CSP memblokir inline script tanpa hash/nonce.  
**Kenapa penting:** Dari sisi KEAMANAN ini POSITIF: CSP ketat default melindungi kalau suatu saat ada XSS (mis. lewat label kolom di advanced.html) — script inline injeksi tidak akan tereksekusi. Efek samping fungsional: blok dark-mode inline kemungkinan silently gagal di 2 halaman itu, jadi tema gelap tidak ke-apply saat pertama buka (bug kecil non-keamanan). Dicatat agar tidak ada godaan melonggarkan CSP demi memperbaiki tema.  
**Fix konkret:** Pindahkan kedua blok inline ke satu file .js eksternal kecil (mis. theme-init.js) lalu `<script src="theme-init.js"></script>` di kedua halaman. Ini menghapus satu-satunya inline-script sehingga CSP default tetap ketat DAN dark-mode konsisten. Jangan tambahkan CSP yang mengizinkan 'unsafe-inline'.  
**Lokasi:** `advanced.html:36-38, help.html:52-54, manifest.json:17`  

### P2.73 Sinkron preset & sesi via file (kelanjutan import/export settings)
`improvement` · `Fitur baru` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** exportSettings/importSettings (settings.js:73-102) sudah bundle tvdSettings+tvdPresets, tapi TIDAK menyertakan sesi riset/hasil bintang/history. Tidak ada sinkron antar perangkat untuk data riset.  
**Kenapa penting:** Alfin mungkin riset di 2 PC (GEEKOM + kemungkinan laptop). Bisa bawa preset niche + post berbintang via file membuat ThreadLens portabel tanpa backend (sesuai constraint 100% client-side).  
**Fix konkret:** Perluas exportSettings (settings.js:73-82) untuk opsional menyertakan tvdSessions & item berbintang; importSettings (settings.js:83-102) merge balik. Beri checkbox 'sertakan hasil riset' saat export. Format JSON sudah ada, tinggal tambah key.  
**Lokasi:** `settings.js:73-102`  

### P2.74 Filter 'Periode' diam-diam MEMPERTAHANKAN post yang waktunya tak terbaca — tanpa peringatan
`improvement` · `Copywriting / microcopy` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** Filter 'Periode' (sidepanel.html:37-45) menyaring berdasar umur post. Tapi dateOk() di content.js:204-206 melakukan `if (timeMs == null) return true` — artinya post yang waktunya GAGAL DIBACA tetap LOLOS walau user pilih '7 hari'. (Catatan: ini KEBALIKAN dari asumsi awal bahwa post tanpa waktu dibuang.) Tidak ada microcopy yang menjelaskan perilaku ini.  
**Kenapa penting:** Scraping waktu rawan (waktu relatif). User pilih '7 hari' mengira hasilnya ketat, padahal post-tanpa-waktu (yang bisa jadi lama) tetap nyangkut — bikin hasil terlihat 'kotor'/tidak akurat. Relevan dgn kerawanan scraping. Dampak kecil karena tidak menghilangkan data, hanya ekspektasi yang meleset.  
**Fix konkret:** Tambah hint kecil di bawah dropdown Periode saat bukan 'Semua waktu': 'Post yang waktunya nggak kebaca tetap ditampilkan.' (sesuai perilaku aktual content.js:204-206). Atau, kalau memang mau ketat, ubah dateOk() membuang post tanpa waktu lalu beri hint yang sesuai — tapi cukup luruskan microcopy dulu agar jujur.  
**Lokasi:** `sidepanel.html:37-45, content.js:204-206`  

### P2.75 Placeholder keyword padat (3 konsep + separator '·') & sintaks '-kata' hilang saat diketik
`improvement` · `Copywriting / microcopy` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** Placeholder sidepanel.html:55: 'kata1, kata2 · pakai -kata untuk kecualikan' — memuat 3 konsep (multi-kata, koma, sintaks minus) dalam satu baris kecil dengan separator '·'. Sintaks '-kata' untuk exclude adalah fitur power yang nggak obvious, dan placeholder hilang begitu user ngetik — petunjuknya lenyap saat paling dibutuhkan.  
**Kenapa penting:** No-coder kemungkinan besar nggak paham '-kata'=kecualikan dari placeholder sekilas, dan setelah mengetik petunjuk hilang. Fitur exclude (buat buang 'lowongan', 'giveaway' saat riset konten) jadi tak terpakai. Logika exclude-nya ada & jalan di content.js:215-217.  
**Fix konkret:** Sederhanakan placeholder jadi contoh konkret: 'mis: ai, saham, -lowongan'. Pindahkan penjelasan sintaks ke hint permanen kecil di bawah field (tidak hilang saat diketik): 'Pisah pakai koma · awali - untuk kecualikan'.  
**Lokasi:** `sidepanel.html:55, content.js:215-217`  

### P2.76 Inkonsistensi istilah 'Hapus riwayat' (settings) vs 'Bersihkan daftar' (panel) untuk aksi yang tumpang tindih
`improvement` · `Copywriting / microcopy` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** Footer panel: tombol trash title 'Bersihkan daftar (klik 2x)' (sidepanel.html:141) yang mengosongkan rawItems + kirim cmd 'clear' (sidepanel.js:161-176). Settings: 'Hapus riwayat — Kosongkan daftar viral yang tersimpan' (settings.html:59-60) yang remove tvdHistory + kirim cmd 'clear' (settings.js:57-62). Keduanya pada dasarnya menghapus daftar yang sama, tapi dinamai beda.  
**Kenapa penting:** Dua nama untuk aksi yang tumpang tindih bikin no-coder ragu mana yang aman dipakai, takut salah hapus sesuatu yang beda. Konsistensi penamaan mengurangi keraguan ini.  
**Fix konkret:** Samakan istilah inti, pilih satu kata (mis. 'daftar'): panel title 'Hapus daftar (klik 2x)' (sidepanel.html:141); settings label 'Hapus daftar tersimpan' + sub 'Kosongkan semua post viral yang sudah dikumpulkan' (settings.html:59-60). Kalau memang beda scope, jelaskan bedanya (panel = sesi+history, settings = history saja).  
**Lokasi:** `sidepanel.html:141, settings.html:59-60, sidepanel.js:161-176, settings.js:57-62`  

### P2.77 host_permissions tidak mencakup subdomain mobile/lain (mis. m.threads.net) — content script bisa absen di varian URL
`na-note` · `Keamanan & privasi` · impact **low** · effort **low** · skor **5** · confidence medium  
**Masalah/Peluang:** manifest host_permissions & content_scripts.matches mencakup www + apex untuk .com/.net (manifest.json:18-23, 26-31) tapi tidak wildcard subdomain (*://*.threads.net/* hanya ada di query tabs sidepanel.js:67, BUKAN di manifest). Kalau Threads menyajikan varian subdomain, content script tidak akan ter-inject di sana, sementara panel query-nya pakai wildcard sehingga bisa menarget tab yang tidak punya content script.  
**Kenapa penting:** Sebagian besar N/A: Threads desktop konsisten di www.threads.com/net, jadi dampak praktis rendah untuk pemakaian Alfin sekarang. Tapi ada inkonsistensi nyata: pola match tabs di panel (*://*.threads.com/*) lebih luas dari manifest matches, yang bisa memilih tab tanpa content script -> sendToTab null (lihat ide koneksi senyap). Jadi reframe: bukan masalah keamanan, tapi konsistensi pola match.  
**Fix konkret:** Selaraskan pola: gunakan *://*.threads.com/* dan *://*.threads.net/* yang sama persis di manifest content_scripts.matches, host_permissions, DAN getThreadsTab di 3 file. Ini menutup celah panel menarget tab tanpa content script. Tidak perlu menambah izin baru kalau subdomain mobile tidak relevan.  
**Lokasi:** `manifest.json:18-31, sidepanel.js:67, settings.js:25, advanced.js:4-6`  

---

## ⚪ P3 — Rendah / nice-to-have  (15)

### P3.1 Animasi flash "cari di feed" (.tvd-flash) tidak pernah dipakai — dead code + sinyal lokasi lemah
`debt` · `UX / alur interaksi` · impact **low** · effort **low** · skor **4.9** · confidence high  
**Masalah/Peluang:** content.css cuma berisi @keyframes tvdFlash + .tvd-flash (content.css:4-10) dan komentarnya bilang file ini KHUSUS buat animasi kedip saat "Cari di feed" diklik. Tapi content.js TIDAK PERNAH menambahkan class tvd-flash ke elemen mana pun (dikonfirmasi: 0 kecocokan classList/tvd-flash di content.js). Yang dipakai cuma setLocatedHighlight (content.js:351-365) yang menaruh outline kuning STATIS via inline style — tanpa animasi. content.css tetap ter-load via manifest (manifest.json:33).  
**Kenapa penting:** Saat seek selesai, post di-scroll ke tengah tapi sorot kuning statis gampang kelewat di feed ramai (apalagi sudah ada highlight biru viral lain). Animasi kedip justru ada di codebase tapi mati — niat UX-nya hilang, sekaligus dead code yang membingungkan pengembangan berikutnya.  
**Fix konkret:** Di goTo() (content.js:500), setelah setLocatedHighlight, tambahkan el.classList.add('tvd-flash') lalu hapus on animationend (atau setTimeout 750ms) supaya bisa retrigger di klik berikutnya. Kalau memang tidak mau animasi, hapus content.css + referensinya di manifest.json:33 biar tidak ada dead code.  
**Lokasi:** `content.css:1-11, content.js:500, content.js:351-365`  

### P3.2 Semua error storage dibungkus catch kosong / lastError tak pernah dicek
`debt` · `Data / storage / state` · impact **low** · effort **low** · skor **4.9** · confidence high  
**Masalah/Peluang:** Setiap interaksi chrome.storage/tabs dibungkus `try{...}catch(e){}` kosong atau callback tanpa cek chrome.runtime.lastError: content.js:438/445/456/562, settings.js:31, sidepanel.js:74. chrome.storage API melaporkan kegagalan lewat chrome.runtime.lastError DI DALAM callback, BUKAN throw — jadi try/catch di sekitarnya bahkan tak menangkap error set/get yang gagal (dikonfirmasi: tidak ada satu pun `lastError` di seluruh kode).  
**Kenapa penting:** Dampak nyata untuk no-coder: kalau set tvdHistory gagal (kuota, atau context invalidated saat extension di-reload), tidak ada satu pun indikasi. Alfin akan melihat riwayat tidak tersimpan / setelan tidak nyangkut dan tak punya petunjuk kenapa. 'Extension context invalidated' (umum saat reload unpacked extension sambil tab Threads terbuka) bikin sendMessage/storage gagal senyap; gejalanya = panel diam tak update, tanpa pesan. Untuk produk yang justru menargetkan diagnosa mudah (ada advanced.html), menelan error adalah kontradiksi.  
**Fix konkret:** Buat helper kecil `function sset(obj){ chrome.storage.local.set(obj, ()=>{ if(chrome.runtime.lastError) toast('Gagal simpan: '+chrome.runtime.lastError.message);}); }` dan pakai di semua set penting (content.js:455, sidepanel.js:79, settings.js:21/66/94). Untuk 'context invalidated' di content.js broadcast/sendMessage (content.js:529/531), deteksi pesan tsb dan tampilkan 'Extension habis di-reload — refresh tab Threads'. Minimal: ganti `catch(e){}` jadi `catch(e){ console.warn('[TVD]',e); }` supaya ada jejak di DevTools.  
**Lokasi:** `content.js:438, content.js:445, content.js:456, content.js:562, settings.js:31, sidepanel.js:74`  

### P3.3 .tvd-flash di content.css adalah CSS mati (animasi tak pernah dipakai)
`debt` · `Maintainability / tech debt` · impact **low** · effort **low** · skor **4.9** · confidence high  
**Masalah/Peluang:** content.css mendefinisikan @keyframes tvdFlash + class .tvd-flash (baris 4-10) yang menurut komentar file dipakai untuk animasi kedip saat "Cari di feed". Grep di seluruh repo mengonfirmasi: 'tvd-flash'/'tvdFlash' HANYA muncul di content.css, tidak pernah ditambahkan ke elemen mana pun di JS. Fungsi yang benar-benar dipakai, setLocatedHighlight (content.js:351-365), pakai inline style box-shadow kuning (#f5c518 di content.js:358-361), bukan class flash.  
**Kenapa penting:** File CSS + komentar menjanjikan perilaku yang tak ada. Saat Alfin minta Claude "ubah animasi kedip cari-di-feed", Claude wajar mengedit .tvd-flash di content.css — dan perubahan itu TIDAK akan terlihat sama sekali karena yang aktif adalah inline style di content.js:358-361. Ini jebakan waktu nyata untuk iterasi vibe-coding.  
**Fix konkret:** Pilih satu: (a) hapus content.css .tvd-flash + @keyframes dan ubah komentar jadi jujur, ATAU (b) benar-benar pakai class: di setLocatedHighlight tambahkan el.classList.add('tvd-flash') lalu setTimeout hapus, dan pindahkan warna kuning ke CSS. Rekomendasi: (a) karena inline style memang dipilih agar tahan re-render React (lihat komentar content.css:1).  
**Lokasi:** `content.css:4-10; content.js:351-365 (inline, bukan class); content.js:358-361`  

### P3.4 README "Isi folder" tak lengkap: settings.html & help.html hilang dari tabel
`debt` · `docs` · impact **low** · effort **low** · skor **4.9** · confidence high  
**Masalah/Peluang:** Tabel "Isi folder" README.md:50-58 tidak mencantumkan settings.html/settings.js dan help.html sebagai baris sendiri (settings.html disinggung di prosa baris 7 tapi tak ada di tabel inventaris). Padahal keduanya file aktif: settings.html/.js (pengaturan + export/import/reset) dan help.html (tutorial, dibuka tombol ? via sidepanel.js:155). Tabel juga belum sebut vendor/fonts & icons.  
**Kenapa penting:** Tabel ini adalah peta mental Alfin + Claude soal "file apa ngapain". Kalau Claude diminta "ubah halaman pengaturan" dan mengandalkan tabel ini, settings.html tak ada di peta → bisa salah cari atau bikin file baru duplikat. Dokumentasi inventaris yang bolong langsung menurunkan kualitas iterasi berikutnya.  
**Fix konkret:** Tambah 2 baris ke tabel README.md:50-58: | settings.html/.js | Pengaturan: tema, warna highlight, dim, max item, export/import/reset | dan | help.html | Tutorial & definisi (tombol ?) |. Sekalian tambah baris vendor/fonts & icons biar lengkap.  
**Lokasi:** `README.md:50-58`  

### P3.5 Header CONFIG content.js menyebut "buka ⚙ → Diagnostik" — alur sama salahnya dengan README
`debt` · `docs / konsistensi` · impact **low** · effort **low** · skor **4.9** · confidence high  
**Masalah/Peluang:** Komentar pembuka content.js:7 menulis "Kalau deteksi meleset: lihat CONFIG / buka ⚙ → Diagnostik." Sama seperti README:42, ⚙ sebenarnya membuka settings.html (sidepanel.js:156), dan Diagnostik (advanced.html) ada di balik link di dalamnya (settings.html:68). Dua dokumen (README + komentar kode) salah dengan cara yang sama, jadi tak ada yang mengoreksi yang lain.  
**Kenapa penting:** Komentar ini adalah hal pertama yang dibaca Claude saat membuka content.js untuk memperbaiki deteksi. Petunjuk yang salah arah membuat Claude (dan Alfin) memandu langkah debug yang keliru, dan karena cocok dengan README yang juga salah, kesalahan tampak "terkonfirmasi".  
**Fix konkret:** Selaraskan komentar content.js:7 dengan perbaikan README: "...buka ⚙ Pengaturan → Diagnostik (Debug) → Buka." Lakukan bareng perbaikan README.md:42 agar dua sumber konsisten.  
**Lokasi:** `content.js:7; README.md:42`  

### P3.6 saveHistory menulis seluruh viralMap tiap 900ms; maxItems tak ada batas atas
`debt` · `Mesin scraping & logika` · impact **low** · effort **low** · skor **4.7** · confidence medium  
**Masalah/Peluang:** saveHistory (content.js:449-458) men-serialize SEMUA viralMap.values() ke chrome.storage.local tiap scan (debounce 900ms). Dengan maxItems yang hanya dibatasi bawah (settings.js:52 Math.max(20,v), tak ada batas atas) dan auto-scroll terus memicu scan, ini menulis ulang array ratusan-ribuan objek berkali-kali per menit. Exception ditelan diam-diam (try/catch kosong di 456).  
**Kenapa penting:** chrome.storage.local punya batas & biaya I/O; menulis ulang seluruh daftar tiap 900ms selama auto-scroll panjang membebani disk dan bisa mendekati kuota bila maxItems dinaikkan user. Karena exception ditelan, kalau gagal simpan riwayat diam-diam hilang — user kira datanya aman.  
**Fix konkret:** Tulis hanya saat ada perubahan nyata (bandingkan ukuran/last id), naikkan debounce saat auto-scroll, beri batas atas maxItems wajar (mis. 1000) di settings.js:52. Surface kegagalan simpan lewat toast/diagnostik alih-alih menelan exception di content.js:456.  
**Lokasi:** `content.js:449-458,411; settings.js:52`  

### P3.7 Komentar content.css menyesatkan: bilang file ini menerapkan highlight + flash, padahal keduanya via inline style di content.js
`debt` · `konsistensi / docs` · impact **low** · effort **low** · skor **4.7** · confidence medium  
**Masalah/Peluang:** Komentar content.css:1-2 mengeklaim highlight di-apply di content.js (benar) TAPI file ini dipakai "buat animasi kedip pas Cari di feed" (salah — flash tak pernah aktif, lihat temuan .tvd-flash). Jadi separuh deskripsi file CSS tidak mencerminkan kenyataan kode: SEMUA highlight (applyHighlight content.js:320-329) DAN flash (setLocatedHighlight content.js:351-365) pakai inline style; content.css praktis tak punya efek aktif.  
**Kenapa penting:** Ini memperkuat jebakan .tvd-flash: bukan cuma class-nya mati, komentarnya secara aktif mengarahkan editor ke file yang salah. Saat Alfin minta "ganti warna kotak highlight", membaca komentar ini bisa membuat Claude mengedit content.css padahal warna ada di content.js DEFAULTS.highlightColor (content.js:48) + applyHighlight (content.js:320-329).  
**Fix konkret:** Tulis ulang komentar content.css jadi jujur: "Semua highlight & flash diterapkan via inline style di content.js (tahan re-render React). File ini tidak punya class yang aktif." Jika .tvd-flash dihapus (lihat temuan terkait), sekalian kosongkan/hapus file dan lepas referensinya di manifest.json:33 (css: ["content.css"]).  
**Lokasi:** `content.css:1-10; content.js:320-329; manifest.json:33`  

### P3.8 Dedup repost dari original yang sama
`feature` · `Fitur baru` · impact **medium** · effort **high** · skor **4.4** · confidence low  
**Masalah/Peluang:** isRepost() (content.js:189) cuma menandai/menyembunyikan repost, tidak mendeteksi bahwa repost A dan original B adalah konten yang sama. idFor() (content.js:368) pakai permalink/snippet, jadi original + beberapa repost-nya bisa muncul sebagai entri berbeda.  
**Kenapa penting:** Saat satu post benar-benar viral, ia muncul berkali-kali (original + N repost) di For You. Itu membengkakkan daftar dengan konten identik dan mengaburkan berapa ide unik yang sebenarnya ada.  
**Fix konkret:** Untuk repost, coba ekstrak permalink original (link /post/ di dalam blok quote, lihat getPermalink content.js:155 + isQuote 190-193) sebagai canonical id; kalau cocok dengan entri lain, gabungkan & tampilkan badge 'di-repost N kali'. Fallback: dedup by snippet+user ternormalisasi.  
**Lokasi:** `content.js:189-193, content.js:368-370, content.js:404-412`  

### P3.9 advanced.html & help.html pakai emoji ⚙🔄📄🖼️🎬 sebagai 'ikon', beda total dari set ikon SVG line panel
`improvement` · `ui-visual` · impact **low** · effort **medium** · skor **4.2** · confidence high  
**Masalah/Peluang:** Panel utama pakai sistem ikon SVG line konsisten (stroke-width 2, sidepanel.js:27-49). Tapi advanced.html:21 judul pakai emoji '⚙ ThreadLens — Diagnostik' dan advanced.html:27 tombol '🔄 Ambil diagnostik'; help.html:43 definisi media pakai '📄 teks, 🖼️ gambar, 🎬 video' dan help.html:50 menyebut '⚙ Pengaturan'. Emoji = warna-warni & OS-dependent, bentrok dengan ikon line monokrom brand 3-warna.  
**Kenapa penting:** Emoji dirender beda di tiap OS/zoom dan berwarna-warni — merusak kesan brand 3-warna (biru/putih/hitam) yang dijaga ketat di panel. Inkonsistensi ⚙-emoji vs gear-SVG bikin halaman Diagnostik/Help terasa 'tempelan' beda kelas dari panel utama, walau ini produk pribadi.  
**Fix konkret:** Di advanced.html ganti ⚙ dan 🔄 dengan inline SVG gear/refresh (copy markup ICONS.gear dari sidepanel.js:37; buat ICONS.refresh dari ICONS.repost). Di help.html:43 ganti 📄🖼️🎬 dengan SVG ICONS.text/image/video (sidepanel.js:44-46) inline. Satu set ikon di semua halaman.  
**Lokasi:** `advanced.html:21, advanced.html:27, help.html:43, help.html:50`  

### P3.10 --muted contrast SUDAH lolos AA — reframe: risiko nyata di highlightColor custom
`na-note` · `Aksesibilitas` · impact **low** · effort **medium** · skor **4.2** · confidence high  
**Masalah/Peluang:** Dugaan '--muted gagal kontras' itu N/A. Hasil hitung terverifikasi: light #65686c on putih = 5.6:1, on card #f7f8fa = 5.27:1; dark #9aa0a6 on card #2a2a2d = 5.42:1, on #1c1c1e = 6.44:1 — SEMUA lolos AA normal text (4.5:1). Nuansa yang berlaku: teks muted sangat kecil (.hint 12px sidepanel.css:125; .item-counts/.item-time/.cnt 12px sidepanel.css:141,145,146) tetap butuh 4.5:1 di 12px, dan 5.x:1 masih aman. Risiko nyata: warna aksen biru var(--blue) yang BISA diubah user via settings highlightColor (settings.js:50). Terverifikasi default #2563eb on dark card #2a2a2d = 2.77:1 (GAGAL 4.5:1) — jadi .cnt.hit / .vel / .item-user:hover (semua var(--blue), 12-14px) di tema gelap sudah di bawah ambang, dan tidak ada guard sama sekali kalau user pilih warna lebih terang lagi.  
**Kenapa penting:** Audit jujur: tak ada masalah --muted yang perlu diperbaiki. Tapi accent biru di tema gelap + warna highlightColor bebas-pilih adalah lubang kontras nyata pada angka-angka metrik yang justru jadi inti pembacaan kartu.  
**Fix konkret:** Tidak perlu ubah --muted. Gantinya: (1) naikkan .item-counts/.cnt dari 12px ke 13px (sidepanel.css:141,146) untuk margin kontras; (2) di settings highlightColor (handler change settings.js:50), hitung rasio warna terpilih terhadap --card; bila <4.5:1 tampilkan toast peringatan 'warna ini agak susah dibaca'; (3) pertimbangkan token aksen terpisah untuk teks vs border highlight agar .cnt.hit tetap kontras di tema gelap.  
**Lokasi:** `sidepanel.css:125,141,145,146; settings.js:50`  

### P3.11 detectColumns COLUMN_NAMES match terlalu lebar (span/div/a generik) → kolom palsu
`improvement` · `Mesin scraping & logika` · impact **low** · effort **medium** · skor **4** · confidence medium  
**Masalah/Peluang:** detectColumns (content.js:270) memindai h1/h2/h3/[role=heading]/span/div/a dengan textContent <=22 char yang === atau startsWith salah satu COLUMN_NAMES (274), top<320. Kata seperti 'following','liked','search','cari','saved' (content.js:23-26) umum muncul di UI Threads (tab profil, label tombol, navigasi) di luar konteks kolom feed. Heuristik rapuh terhadap perubahan UI & bahasa campuran (ID+EN).  
**Kenapa penting:** Dropdown 'Target kolom' (sidepanel.js:311-320) diisi dari sini. Kalau salah deteksi, user dapat opsi kolom palsu; crawlTarget menunjuk elemen salah → getScanRoot (content.js:311-317) mengembalikan container keliru → seluruh pemindaian terbatas ke area salah/kosong TANPA error. Untuk single-column (kasus mayoritas Alfin), kompleksitas ini menambah risiko tanpa manfaat — COLUMN_IGNORE (27) sudah membuang Activity/Search jadi fitur kolom praktis hanya relevan di multi-kolom desktop.  
**Fix konkret:** Perketat: hanya anggap header kolom bila heading/role=heading ATAU di dalam wadah yang juga punya scroll-container ber-like-svg banyak (sudah dihitung 280-281). Buang fallback span/div/a generik. Kalau hanya 1 scroll-container terdeteksi, lewati deteksi kolom (default 'all') dan jangan tawarkan dropdown.  
**Lokasi:** `content.js:23-27,266-306,311-317; sidepanel.js:311-320`  

### P3.12 Tandai post yang sudah pernah di-export/dipakai
`feature` · `Fitur baru` · impact **low** · effort **medium** · skor **4** · confidence medium  
**Masalah/Peluang:** Tidak ada state 'sudah aku pakai'. Post yang sama muncul lagi di sesi berikutnya (kalau history tidak dihapus, content.js:565) tanpa penanda bahwa Alfin sudah menjadikannya konten.  
**Kenapa penting:** Mencegah Alfin meriset/membuat ulang ide yang sama. Penanda 'sudah dipakai' (mirip read/unread) menjaga daftar fokus ke ide baru — penting saat history menumpuk hingga maxItems 300 (content.js:411).  
**Fix konkret:** Tambah rec.used boolean (content.js:407), di-set saat Alfin export/copy post tertentu atau klik 'tandai dipakai' di kartu. Render dengan opacity/centang di renderList (sidepanel.js:279-296), + opsi filter 'sembunyikan yang sudah dipakai'. Simpan di history (saveHistory content.js:450-458).  
**Lokasi:** `content.js:407, content.js:450-458, sidepanel.js:279-296`  

### P3.13 Multi-akun / pindah akun Threads: history & 'Dipindai' tercampur antar akun tanpa pemisahan
`improvement` · `GAP / data riset edge case` · impact **low** · effort **medium** · skor **4** · confidence medium  
**Masalah/Peluang:** viralMap & tvdHistory tidak menyimpan konteks akun/feed. Kalau Alfin logout lalu login akun lain (akun bisnis vs pribadi), post dari kedua akun bercampur di daftar dan statbar 'Dipindai' kumulatif lintas-akun. Tidak ada cara membedakan/memisah.  
**Kenapa penting:** Solopreneur sering punya >1 akun (personal + brand + niche trading). Riset konten per-akun jadi tercemar: daftar berisi campuran feed yang konteksnya beda, export ke AI jadi membingungkan ('kok ada post niche A di riset niche B'). Silent karena tidak ada penanda sumber.  
**Fix konkret:** Saat menyimpan record, capture identitas feed sederhana: username akun login (dari link profil di nav) atau minimal hostname+path feed saat ini, simpan sebagai rec.context. Tambahkan di Pengaturan tombol 'Mulai sesi riset baru' yang clear history. Gap inti: TANPA pemisahan, data diam-diam tercampur — berbeda dari fitur 'snapshot bernama'.  
**Lokasi:** `content.js:407 (record build), content.js:450-458 (saveHistory)`  

### P3.14 Ukuran ikon hardcoded per konteks (14/16/18/19/20px) dengan stroke seragam 2 — berat visual ikon kecil tidak rata
`debt` · `ui-visual` · impact **low** · effort **medium** · skor **3.7** · confidence medium  
**Masalah/Peluang:** Ukuran ikon di-hardcode tanpa skala: header icon-btn 20px (sidepanel.css:48), footer fbtn 19px (:164), item-actions 16px (:156), media-toggles 18px (:90), metric 18px (:95), .cnt 14px (:148). Stroke seragam 2 (sidepanel.js:27) di semua ukuran, jadi pada 14px (.cnt) garis terlihat relatif lebih tebal/penuh dibanding 20px header. Tidak ada token ukuran.  
**Kenapa penting:** Karena stroke fixed 2 tapi ukuran beda-beda, ink density ikon tidak rata: ikon mungil di .cnt (14px) tampak lebih gemuk/penuh dibanding ikon 20px header. Di panel sempit yang padat ikon, ketidakrataan ini bikin terasa kurang dipoles. Juga susah maintain saat mau ubah ukuran global.  
**Fix konkret:** Definisikan kelas ukuran (--ico-sm 14, --ico-md 18, --ico-lg 20). Untuk ikon kecil (≤16px: .cnt .ico svg, .item-actions .ico svg), turunkan stroke-width jadi 1.75 via CSS override supaya berat visual lebih rata dengan ikon besar.  
**Lokasi:** `sidepanel.css:48,90,95,148,156,164, sidepanel.js:27`  

### P3.15 Reload extension tanpa refresh halaman membuat dua instance listener / state hantu — tidak ada teardown
`debt` · `Maintainability / tech debt` · impact **low** · effort **medium** · skor **3.7** · confidence medium  
**Masalah/Peluang:** content.js dijaga window.__tvdLoaded (baris 12-13) untuk cegah double-init di halaman SAMA, tapi saat Alfin klik reload di chrome://extensions, context lama ter-invalidasi sementara halaman tidak di-refresh: setInterval & MutationObserver lama jadi yatim (orphaned) dan chrome.runtime.sendMessage dari context lama akan melempar 'Extension context invalidated' yang ditelan catch kosong (baris 529,531). Tidak ada mekanisme cleanup/teardown.  
**Kenapa penting:** Alfin reload extension setiap update (dev-mode, rutin). Tanpa teardown, halaman Threads yang tidak di-refresh menyimpan interval/observer zombi yang membebani + melempar error terus ke catch{} senyap, dan content script baru tidak ter-inject sampai halaman di-refresh. Ini memperkuat ide 'panel mati senyap' dan menambah beban performa tak terlihat.  
**Fix konkret:** Deteksi context invalidation: bila chrome.runtime.id menjadi undefined / sendMessage melempar 'context invalidated', clearInterval + mo.disconnect() untuk menghentikan instance lama. Plus dokumentasikan/otomatiskan 'refresh halaman setelah reload extension' (README sudah menyebut, tapi UI tidak). Pertimbangkan banner di panel yang menyarankan refresh saat mendeteksi versi mismatch.  
**Lokasi:** `content.js:12-13, content.js:528-531, content.js:556-559`  

---

