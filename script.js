/* ============================================================
   Spektrum — skrip sederhana
   Satu-satunya tugas: mengisi tahun berjalan di footer secara
   otomatis (elemen dengan atribut data-year).
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  var els = document.querySelectorAll("[data-year]");
  for (var i = 0; i < els.length; i++) {
    els[i].textContent = new Date().getFullYear();
  }
});


// === TOMBOL SHARE ===
const btnShare = document.getElementById('btn-share');
if (btnShare) {
    btnShare.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    text: 'Baca artikel keren ini di Spektrum!',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share dibatalkan');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link artikel berhasil di-copy!');
        }
    });
}

// === LOGIKA IKLAN SLIDE-UP ===
document.addEventListener("DOMContentLoaded", () => {
    const adBanner = document.getElementById('ad-banner');
    const closeAdBtn = document.getElementById('close-ad');

    // Cek apakah user sudah pernah close iklan ini
    const hasSeenAd = localStorage.getItem('spektrum_ad_seen');

    // Kalau belum pernah, munculkan setelah 1,5 detik
    if (!hasSeenAd && adBanner) {
        setTimeout(() => {
            adBanner.classList.add('show'); // Memicu animasi slide-up
        }, 1500); 
    }

    // Tombol Close (X)
    if (closeAdBtn) {
        closeAdBtn.addEventListener('click', () => {
            adBanner.classList.remove('show'); // Memicu animasi slide-down
            // Simpan memori di browser user
            localStorage.setItem('spektrum_ad_seen', 'true');
        });
    }
});