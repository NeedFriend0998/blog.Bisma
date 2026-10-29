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
document.getElementById('btn-share').addEventListener('click', async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: document.title,
                text: 'Baca artikel keren ini!',
                url: window.location.href
            });
        } catch (err) {
            console.log('Share dibatalkan', err);
        }
    } else {
        // Kalau browser gak support (misal Firefox PC), copy link aja
        navigator.clipboard.writeText(window.location.href);
        alert('Link artikel berhasil di-copy!');
    }
});