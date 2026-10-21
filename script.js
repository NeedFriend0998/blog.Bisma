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
