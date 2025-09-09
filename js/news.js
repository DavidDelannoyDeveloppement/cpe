/* js/news.js — version minimaliste (sans recherche, sans tags visibles) + kill anciens contrôles */
(function () {
  const LIST_SELECTOR = '#actu-list';
  const DATA_URL = './data/news.json';

  const $list = document.querySelector(LIST_SELECTOR);
  if (!$list) return;

  // Supprime tout vieux bloc de contrôles (si un ancien JS en a injecté)
  document.querySelectorAll('.actu-controls').forEach(n => n.remove());

  const escapeHTML = (s) =>
    String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const formatDate = (iso) => {
    try { return new Intl.DateTimeFormat('fr-FR',{ dateStyle:'long' }).format(new Date(iso)); }
    catch { return iso || ''; }
  };

  // ⬇️ VERSION SANS TAG (mots-clés)
  const cardTemplate = (item) => {
    const url = item.url || (item.id ? `./article.html?id=${item.id}` : '#');
    const title = escapeHTML(item.title);
    const summary = escapeHTML(item.summary || '');
    const dateStr = formatDate(item.date);
    const alt = escapeHTML(item.image_alt || item.title || 'Actualité CPE');

    const media = item.image
      ? `<img loading="lazy" src="${item.image}" alt="${alt}" width="800" height="450">`
      : `<div class="thumb-fallback" aria-hidden="true"></div>`;

    return `
      <article class="actu-card">
        <a class="actu-media" href="${url}">
          ${media}
        </a>
        <div class="actu-body">
          <h3 class="actu-title"><a href="${url}">${title}</a></h3>
          <p class="actu-meta">
            <span class="date">${dateStr}</span>
            ${source ? ` · <span class="source">${source}</span>` : ''}
          </p>
          <p class="actu-summary">${summary}</p>
        </div>
      </article>
    `;
  };

  async function init() {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const items = (Array.isArray(data) ? data : [])
        .map(it => ({
          id: it.id,
          title: it.title || '',
          date: it.date || '1970-01-01',
          source: it.source || '',
          url: it.url || (it.id ? `./article.html?id=${it.id}` : '#'),
          // tag: it.tag || '',  // <-- on n’utilise plus le tag pour l’affichage
          summary: it.summary || '',
          image: it.image || '',
          image_alt: it.image_alt || ''
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      $list.innerHTML = items.map(cardTemplate).join('');
    } catch (err) {
      console.error('[Actus] Échec chargement :', err);
      $list.innerHTML = `
        <div class="actu-error">
          <p>Impossible de charger les actualités pour le moment.</p>
        </div>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
