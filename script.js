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

// === LOGIKA POP-UP IKLAN ===
document.addEventListener("DOMContentLoaded", () => {
    const adModal = document.getElementById('ad-modal');
    const closeAdBtn = document.getElementById('close-ad');

    // Cek apakah user sudah pernah lihat iklan ini
    const hasSeenAd = localStorage.getItem('spektrum_ad_seen');

    // Kalau belum pernah lihat (atau habis hapus data browser), tampilkan
    if (!hasSeenAd && adModal) {
        // Kasih delay 1 detik biar webnya ke-load dulu, baru iklan muncul
        setTimeout(() => {
            adModal.style.display = 'flex';
        }, 1000); 
    }

    // Tombol Close
    if (closeAdBtn) {
        closeAdBtn.addEventListener('click', () => {
            adModal.style.display = 'none';
            // Simpan status di browser user kalau dia udah lihat
            localStorage.setItem('spektrum_ad_seen', 'true');
        });
    }
});