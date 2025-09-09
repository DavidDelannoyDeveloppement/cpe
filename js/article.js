// js/article.js — structure : H1 séparé + section .article-intro (texte + image)
(async function () {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");

  const $title = document.getElementById("article-title");
  const $container = document.querySelector(".article-container");

  if (!$container) return;

  const safe = (s) => String(s ?? "");
  const fmtDate = (iso) => {
    try { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(iso)); }
    catch { return safe(iso); }
  };

  try {
    const res = await fetch("./data/news.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const article = (Array.isArray(data) ? data : []).find(a => String(a.id) === String(idParam));

    if (!article) {
      if ($title) $title.textContent = "Article introuvable";
      $container.innerHTML = `<section class="article-intro no-image"><div class="article-intro-container"><div class="article-intro-text"><p>(Contenu indisponible)</p><div class="cta-buttons"><a href="./actualites.html" class="btn">← Retour aux actualités</a></div></div></div></section>`;
      return;
    }

    document.title = `${safe(article.title)} — Actualités CPE`;
    if ($title) $title.textContent = safe(article.title);

    const hasImage = !!article.image;
    const sectionClass = `article-intro${hasImage ? "" : " no-image"}`;
    const meta = `${fmtDate(article.date)}${article.author ? ` — ${safe(article.author)}` : ""}`;

    const imageBlock = hasImage
      ? `<div class="article-intro-image">
           <img src="${safe(article.image)}" alt="${safe(article.image_alt || article.title || "")}">
         </div>`
      : ``;

    $container.innerHTML = `
      <section class="${sectionClass}">
        <div class="article-intro-container">
          <div class="article-intro-text">
            <p class="article-meta">${meta}</p>
            <div class="article-content">
              ${article.content || "<p>(Contenu vide)</p>"}
            </div>
            <div class="cta-buttons">
              <a href="./actualites.html" class="btn">← Retour aux actualités</a>
              <a href="./contact.html" class="btn">Contacter un expert</a>
            </div>
          </div>
          ${imageBlock}
        </div>
      </section>
    `;

    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (err) {
    console.error("[Article] Échec chargement:", err);
    if ($title) $title.textContent = "Erreur de chargement";
    $container.innerHTML = `<section class="article-intro no-image"><div class="article-intro-container"><div class="article-intro-text"><p>Impossible de charger l’article.</p><div class="cta-buttons"><a href="./actualites.html" class="btn">← Retour aux actualités</a></div></div></div></section>`;
  }
})();
