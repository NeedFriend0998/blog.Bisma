/* ============================================================
   Spektrum — versi sederhana (JavaScript murni)
   - Router berbasis hash: #/ (beranda) dan #/artikel/<slug>
   - Filter kategori + pencarian sisi klien
   - Tombol suka tersimpan di localStorage
   - Newsletter: kirim ke /api/subscribe bila tersedia,
     jika tidak (mis. dibuka via file://) disimpan lokal
   ============================================================ */
(function () {
  "use strict";

  var CATEGORIES = [
    { id: "fisika", label: "Fisika" },
    { id: "antariksa", label: "Antariksa" },
    { id: "biologi", label: "Biologi" },
    { id: "bumi", label: "Bumi & Iklim" },
    { id: "teknologi", label: "Teknologi" },
    { id: "kesehatan", label: "Kesehatan" }
  ];

  var LIKES_KEY = "spektrum_likes_v1";
  var SUBS_KEY = "spektrum_subs_v1";
  var state = { category: "semua", query: "" };

  var app = document.getElementById("app");
  var searchInput = document.getElementById("search");

  /* ---------- util ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // format **tebal** dan *miring* pada teks konten
  function inline(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function fmtDate(iso) {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      }).format(new Date(iso));
    } catch (e) { return iso; }
  }

  function fmtNum(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(".", ",") + " rb" : String(n);
  }

  function catLabel(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) return CATEGORIES[i].label;
    }
    return "Sains";
  }

  function catDot(id) {
    return '<span class="dot dot-' + esc(id) + '" aria-hidden="true"></span>';
  }

  function findArticle(slug) {
    for (var i = 0; i < ARTICLES.length; i++) {
      if (ARTICLES[i].slug === slug) return ARTICLES[i];
    }
    return null;
  }

  /* ---------- penyimpanan lokal ---------- */

  function likedMap() {
    try { return JSON.parse(localStorage.getItem(LIKES_KEY) || "{}"); }
    catch (e) { return {}; }
  }

  function isLiked(slug) { return !!likedMap()[slug]; }

  function setLiked(slug, val) {
    var m = likedMap();
    if (val) m[slug] = true; else delete m[slug];
    try { localStorage.setItem(LIKES_KEY, JSON.stringify(m)); } catch (e) { /* abaikan */ }
  }

  /* ---------- beranda ---------- */

  function renderHome() {
    var q = state.query.trim();
    var list = ARTICLES.filter(function (a) {
      var okCat = state.category === "semua" || a.category === state.category;
      if (!okCat) return false;
      if (!q) return true;
      var hay = (a.title + " " + a.excerpt + " " + a.tags.join(" ") + " " + a.author).toLowerCase();
      return hay.indexOf(q.toLowerCase()) !== -1;
    });

    var counts = { semua: ARTICLES.length };
    CATEGORIES.forEach(function (c) {
      counts[c.id] = ARTICLES.filter(function (a) { return a.category === c.id; }).length;
    });

    var chips = ['<button type="button" class="chip' + (state.category === "semua" ? " active" : "") +
      '" data-cat="semua">Semua <span class="count">' + counts.semua + "</span></button>"];
    CATEGORIES.forEach(function (c) {
      chips.push('<button type="button" class="chip' + (state.category === c.id ? " active" : "") +
        '" data-cat="' + c.id + '">' + esc(c.label) + ' <span class="count">' + counts[c.id] + "</span></button>");
    });

    var cards = list.map(function (a) {
      var likeCount = a.likes + (isLiked(a.slug) ? 1 : 0);
      return '<a class="card" href="#/artikel/' + esc(a.slug) + '">' +
        '<p class="card-cat">' + catDot(a.category) + esc(catLabel(a.category)) +
        '<span class="card-dot-meta">' + esc(a.readMinutes) + ' mnt baca</span></p>' +
        "<h2>" + esc(a.title) + "</h2>" +
        '<p class="card-excerpt">' + esc(a.excerpt) + "</p>" +
        '<div class="card-meta"><span>' + esc(a.author) + '</span><span aria-hidden="true">·</span>' +
        "<span>" + fmtDate(a.publishedAt) + "</span>" +
        '<span class="card-likes">&#9825; ' + fmtNum(likeCount) + "</span></div>" +
        "</a>";
    }).join("");

    app.innerHTML =
      '<section class="intro">' +
      "<h1>Sains yang ringan dibaca</h1>" +
      "<p>Kumpulan artikel ilmiah populer berbahasa Indonesia — dari langit biru di atas kepala " +
      "hingga otak yang bekerja saat Anda tidur. Pilih kategori atau langsung cari topik favoritmu.</p>" +
      "</section>" +
      '<section class="toolbar" aria-label="Filter kategori">' + chips.join("") + "</section>" +
      (list.length === 0
        ? '<div class="empty"><p>Tidak ada artikel yang cocok' +
          (q ? ' untuk &ldquo;' + esc(q) + '&rdquo;' : "") + ".</p>" +
          '<button type="button" id="reset-btn" class="btn-outline">Tampilkan semua artikel</button></div>'
        : '<section class="cards">' + cards + "</section>");

    Array.prototype.forEach.call(app.querySelectorAll(".chip"), function (btn) {
      btn.addEventListener("click", function () {
        state.category = btn.getAttribute("data-cat");
        renderHome();
      });
    });

    var resetBtn = app.querySelector("#reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        state.category = "semua";
        state.query = "";
        searchInput.value = "";
        renderHome();
      });
    }
  }

  /* ---------- halaman artikel ---------- */

  function blockHTML(b, i) {
    if (b.type === "h2") {
      return '<h2 id="sec-' + i + '">' + esc(b.text) + "</h2>";
    }
    if (b.type === "h3") {
      return "<h3>" + esc(b.text) + "</h3>";
    }
    if (b.type === "quote") {
      return '<blockquote class="quote"><p>&ldquo;' + inline(b.text) + "&rdquo;</p>" +
        (b.cite ? "<cite>— " + esc(b.cite) + "</cite>" : "") + "</blockquote>";
    }
    if (b.type === "list") {
      var items = b.items.map(function (it) { return "<li>" + inline(it) + "</li>"; }).join("");
      return (b.ordered ? '<ol class="list">' : '<ul class="list">') + items + (b.ordered ? "</ol>" : "</ul>");
    }
    if (b.type === "fact") {
      return '<aside class="fact"><p class="fact-title">' + esc(b.title || "Tahukah Anda?") +
        "</p><p>" + inline(b.text) + "</p></aside>";
    }
    if (b.type === "stats") {
      var st = b.items.map(function (s) {
        return '<div class="stat"><strong>' + esc(s.value) + "</strong><span>" + esc(s.label) + "</span></div>";
      }).join("");
      return '<div class="stats">' + st + "</div>";
    }
    return "<p>" + inline(b.text) + "</p>";
  }

  function renderArticle(slug) {
    var a = findArticle(slug);
    if (!a) { renderHome(); return; }

    var sections = [];
    a.content.forEach(function (b, i) {
      if (b.type === "h2") sections.push({ id: "sec-" + i, text: b.text });
    });

    var toc = sections.length
      ? '<nav class="toc" aria-label="Daftar isi"><p class="toc-title">Daftar isi</p><ol>' +
        sections.map(function (s) {
          return '<li><a href="#' + s.id + '" data-scroll="' + s.id + '">' + esc(s.text) + "</a></li>";
        }).join("") + "</ol></nav>"
      : "";

    var body = a.content.map(function (b, i) { return blockHTML(b, i); }).join("");

    var sourcesHTML = a.sources && a.sources.length
      ? '<section class="sources"><p class="sec-title">Sumber &amp; bacaan lanjut</p><ol>' +
        a.sources.map(function (s) {
          return "<li><span><strong>" + esc(s.label) + "</strong> — " + esc(s.detail) + "</span></li>";
        }).join("") + "</ol></section>"
      : "";

    var related = ARTICLES.filter(function (x) {
      return x.slug !== a.slug && x.category === a.category;
    }).slice(0, 3);

    var relatedHTML = related.length
      ? '<section class="related"><p class="sec-title">Bacaan terkait</p><ul>' +
        related.map(function (r) {
          return '<li><a href="#/artikel/' + esc(r.slug) + '">' + esc(r.title) + "</a></li>";
        }).join("") + "</ul></section>"
      : "";

    var liked = isLiked(a.slug);
    var likeCount = a.likes + (liked ? 1 : 0);

    app.innerHTML =
      '<a class="back" href="#/">&larr; Kembali ke daftar artikel</a>' +
      '<article class="article">' +
      '<div class="banner banner-' + esc(a.category) + '" aria-hidden="true"></div>' +
      '<header class="article-head">' +
      '<p class="card-cat">' + catDot(a.category) + esc(catLabel(a.category)) +
      '<span class="card-dot-meta">' + esc(a.readMinutes) + " mnt baca · " + fmtDate(a.publishedAt) + "</span></p>" +
      "<h1>" + esc(a.title) + "</h1>" +
      '<p class="lede">' + esc(a.excerpt) + "</p>" +
      '<p class="byline">Oleh <strong>' + esc(a.author) + "</strong> — " + esc(a.authorRole) + "</p>" +
      "</header>" +
      toc +
      '<div class="article-body">' + body + "</div>" +
      '<div class="article-actions">' +
      '<button type="button" id="like-btn" class="btn-like' + (liked ? " liked" : "") +
      '" aria-pressed="' + liked + '">&#9825; <span id="like-count">' + likeCount +
      '</span> — <span id="like-label">' + (liked ? "Anda menyukai artikel ini" : "Suka artikel ini") + "</span></button>" +
      "</div>" +
      sourcesHTML +
      relatedHTML +
      "</article>";

    var likeBtn = document.getElementById("like-btn");
    likeBtn.addEventListener("click", function () {
      var nowLiked = !isLiked(a.slug);
      setLiked(a.slug, nowLiked);
      likeBtn.classList.toggle("liked", nowLiked);
      likeBtn.setAttribute("aria-pressed", String(nowLiked));
      document.getElementById("like-count").textContent = a.likes + (nowLiked ? 1 : 0);
      document.getElementById("like-label").textContent =
        nowLiked ? "Anda menyukai artikel ini" : "Suka artikel ini";
    });

    Array.prototype.forEach.call(app.querySelectorAll("[data-scroll]"), function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var el = document.getElementById(link.getAttribute("data-scroll"));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- router ---------- */

  function router() {
    var h = location.hash || "#/";
    window.scrollTo(0, 0);
    if (h.indexOf("#/artikel/") === 0) {
      renderArticle(h.replace("#/artikel/", ""));
    } else {
      renderHome();
    }
  }

  window.addEventListener("hashchange", router);
  router();

  /* ---------- pencarian ---------- */

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value;
    var onArticle = location.hash.indexOf("#/artikel/") === 0;
    if (onArticle) {
      location.hash = "#/"; // memicu hashchange -> renderHome
    } else {
      renderHome();
    }
  });

  /* ---------- newsletter ---------- */

  var subForm = document.getElementById("sub-form");
  var subMsg = document.getElementById("sub-msg");

  subForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("sub-email");
    var email = input.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      subMsg.textContent = "Mohon masukkan alamat email yang valid.";
      subMsg.className = "sub-msg err";
      return;
    }

    subMsg.textContent = "Mengirim…";
    subMsg.className = "sub-msg";

    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    })
      .then(function (res) {
        return res.json().then(function (d) { return { ok: res.ok, d: d }; });
      })
      .then(function (r) {
        subMsg.textContent = (r.d && (r.d.message || r.d.error)) ||
          (r.ok ? "Terima kasih sudah berlangganan!" : "Gagal mendaftarkan email.");
        subMsg.className = "sub-msg " + (r.ok ? "ok" : "err");
        if (r.ok) input.value = "";
      })
      .catch(function () {
        // Mode tanpa server (mis. dibuka langsung dari file): simpan di perangkat
        try {
          var arr = JSON.parse(localStorage.getItem(SUBS_KEY) || "[]");
          if (arr.indexOf(email) === -1) arr.push(email);
          localStorage.setItem(SUBS_KEY, JSON.stringify(arr));
          subMsg.textContent = "Mode tanpa server: email disimpan di perangkat ini.";
          subMsg.className = "sub-msg ok";
          input.value = "";
        } catch (err) {
          subMsg.textContent = "Tidak dapat menyimpan email.";
          subMsg.className = "sub-msg err";
        }
      });
  });
})();
