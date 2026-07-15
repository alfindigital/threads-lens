/* ThreadLens — service worker (v0.7.0)
 * 1) Buka Side Panel saat ikon extension diklik.
 * 2) Pastikan perilaku itu ke-set ulang tiap SW hidup lagi (MV3 sering ditidurkan). */

function enableSidePanelOnClick() {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  }
}

chrome.runtime.onInstalled.addListener(enableSidePanelOnClick);
if (chrome.runtime.onStartup) chrome.runtime.onStartup.addListener(enableSidePanelOnClick);
// juga set saat service worker pertama hidup (top-level)
enableSidePanelOnClick();
