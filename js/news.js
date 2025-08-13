/* news.js — injecte les actus sur la page liste (#actu-list)
   et le bandeau d’accueil (#actu-strip) à partir de ./data/news.json */

(function () {
  "use strict";

  // Résout correctement l’URL du JSON depuis n’importe quelle page
  const newsUrl = new URL("./data/news.json", document.baseURI);
  // Anti-cache (CDN Pages / navigateur)
  newsUrl.searchParams.set("v", Date.now().toString());

  // Points d’injection (optionnels)
  const $list = document.getElementById("actu-list");   // page Actualités
  const $strip = document.getElementById("actu-strip"); // bandeau d’accueil

  if (!$list && !$strip) return; // rien à faire sur cette page

  fetch(newsUrl.toString(), { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(items => {
      const arr = Array.isArray(items) ? items : [];
      const sorted = arr.sort((a, b) => new Date(b.date) - new Date(a.date));

      if ($list) renderList($list, sorted);
      if ($strip) renderStrip($strip, sorted.slice(0, 6)); // 6 dernières actus
    })
    .catch(err => {
      console.error("Chargement des actus impossible :", err);
      if ($list) $list.innerHTML = `<p>Impossible de charger les actualités.</p>`;
      // Le bandeau peut rester vide en cas d’erreur
    });

  // ---- RENDERERS ----
  function renderList(root, items) {
    root.innerHTML = items.map(renderCard).join("");
  }

  function renderStrip(root, items) {
    root.innerHTML = items.map(renderSlide).join("");
    // ⚠️ Le défilement auto est déjà géré par ton js/script.js (réf. projet),
    // ici on ne fait qu’injecter les éléments .actu-slide.
  }

  // ---- TEMPLATES ----
  function renderCard(a) {
    const date = fmtDateFR(a.date);
    const img = a.image ? `<img src="${escapeAttr(a.image)}" alt="${escapeAttr(a.title || "")}" loading="lazy">` : "";
    const tags = (a.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");
    return `
      <article class="actu-card" id="${escapeAttr(a.id || "")}">
        <div class="actu-media">${img}</div>
        <div class="actu-body">
          <h3 class="actu-title">${escapeHtml(a.title || "")}</h3>
          <p class="actu-meta">${date}${tags ? " · " + tags : ""}</p>
          <p class="actu-summary">${escapeHtml(a.summary || "")}</p>
        </div>
      </article>
    `;
  }

  function renderSlide(a) {
    const date = fmtDateFRshort(a.date);
    const id = a.id ? `#${encodeURIComponent(a.id)}` : "";
    // Lien vers la page des actus (à créer ensuite) + ancre de l’article
    return `
      <a class="actu-slide" href="./actualites.html${id}" title="${escapeAttr(a.title || "")}">
        <span class="actu-date">${escapeHtml(date)}</span>
        <span class="actu-title">${escapeHtml(a.title || "")}</span>
      </a>
    `;
  }

  // ---- UTILS ----
  function fmtDateFR(iso) {
    try {
      return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
        .format(new Date(iso));
    } catch { return iso || ""; }
  }
  function fmtDateFRshort(iso) {
    try {
      return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" })
        .format(new Date(iso));
    } catch { return iso || ""; }
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[m]));
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }

})();
