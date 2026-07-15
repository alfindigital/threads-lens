/* ThreadLens — set tema gelap saat halaman dibuka (help/advanced/diagnostik).
   File terpisah (bukan inline) karena CSP default MV3 memblokir <script> inline. */
try {
  chrome.storage.local.get("tvdSettings", (d) => {
    if (d && d.tvdSettings && d.tvdSettings.theme === "dark") document.body.classList.add("dark");
  });
} catch (e) {}
