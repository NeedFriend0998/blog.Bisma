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




// === TOMBOL LIKE ===
const likeBtn = document.getElementById('btn-like');
const likeCount = document.getElementById('like-count');

// Fungsi ngambil jumlah like awal pas halaman dibuka
async function fetchLikes() {
    try {
        // Ganti URL ini sesuai backend lo
        const res = await fetch('http://fi2.elysiannodes.uk:2502/api/likes'); 
        const data = await res.json();
        likeCount.textContent = data.count;
    } catch (e) {
        console.log("Gagal ambil data like", e);
    }
}
fetchLikes();

// Pas tombol diklik
likeBtn.addEventListener('click', async () => {
    // Ubah angka di layar dulu biar cepet responnya
    let current = parseInt(likeCount.textContent);
    likeCount.textContent = current + 1;

    try {
        // Tembak backend buat simpan
        const res = await fetch('http://localhost:3000/api/likes', { method: 'POST' });
        const data = await res.json();
        likeCount.textContent = data.count; // Update pakai angka valid dari server
    } catch (e) {
        console.log("Gagal like", e);
        likeCount.textContent = current; // Balikin angka kalau gagal
    }
});