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

document.addEventListener("DOMContentLoaded", () => {
    const adBanner = document.getElementById('ad-banner');
    const adBackdrop = document.getElementById('ad-backdrop');
    const dragHandle = document.getElementById('ad-drag-handle');

    if (!adBanner) return;

    const hasSeenAd = localStorage.getItem('spektrum_ad_seen');

    // 1. Munculkan Iklan (Delay 1.5 detik)
    if (!hasSeenAd) {
        setTimeout(() => {
            adBackdrop.classList.add('show');
            adBanner.classList.add('show');
        }, 1500);
    }

    // 2. Fungsi Tutup Iklan
    function closeAd() {
        adBanner.classList.remove('show');
        adBackdrop.classList.remove('show');
        adBanner.classList.remove('fullscreen');
        // Simpan memori
        localStorage.setItem('spektrum_ad_seen', 'true');
    }

    // 3. Klik Area Abu-abu untuk Tutup
    adBackdrop.addEventListener('click', closeAd);

    // 4. Logika Swipe / Drag (Geser)
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let isFullscreen = false;

    const startDrag = (e) => {
        isDragging = true;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        adBanner.style.transition = 'none'; // Matikan animasi CSS saat di-drag
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - startY;

        // Hitung posisi baru
        let translateY = deltaY;
        
        // Kalau udah fullscreen, jangan biarin geser ke atas lagi
        if (isFullscreen && deltaY < 0) translateY = 0;
        
        adBanner.style.transform = `translateY(${translateY}px)`;
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        adBanner.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s ease';

        const deltaY = currentY - startY;

        if (deltaY > 100) {
            // Jika digeser ke bawah lebih dari 100px, TUTUP
            closeAd();
        } else if (deltaY < -50 && !isFullscreen) {
            // Jika digeser ke atas lebih dari 50px, EXPAND (Fullscreen)
            adBanner.classList.add('fullscreen');
            adBanner.style.transform = 'translateY(0)';
            isFullscreen = true;
        } else if (deltaY > 50 && isFullscreen) {
            // Jika sedang fullscreen dan digeser ke bawah, KECILKAN
            adBanner.classList.remove('fullscreen');
            adBanner.style.transform = 'translateY(0)';
            isFullscreen = false;
        } else {
            // Kembalikan ke posisi semula jika gak memenuhi syarat
            adBanner.style.transform = 'translateY(0)';
        }
    };

    // Daftarkan Event Listener untuk PC (Mouse)
    dragHandle.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);

    // Daftarkan Event Listener untuk HP (Touch)
    dragHandle.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', onDrag, { passive: false }); // passive: false agar bisa preventDefault jika perlu
    window.addEventListener('touchend', endDrag);
});