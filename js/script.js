/* ================================
   Bandeau Actus (depuis data/news.json)
   Remplit .actus-marquee .marquee-track
   et duplique la liste pour un défilement continu
================================== */
document.addEventListener("DOMContentLoaded", () => {
  (async function initActusMarquee() {
    const TRACK_SELECTOR = ".actus-marquee .marquee-track";
    const DATA_URL = "./data/news.json";          // adapte si besoin
    const ALL_NEWS_URL = "./actualites.html";     // lien "Voir toutes les actus"
    const MAX_ITEMS = 6;                          // nb d’actus à afficher dans le bandeau
    const DUPLICATION = 2;                        // répéter la séquence pour un scroll fluide

    const track = document.querySelector(TRACK_SELECTOR);
    if (!track) return;

    const escapeHTML = (s) =>
      String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const all = await res.json();

      const items = (Array.isArray(all) ? all : [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, MAX_ITEMS)
        .map((it) => {
          const href = it.url || `./article.html?id=${it.id || ""}`;
          const title = escapeHTML(it.title || "");
          return `<a href="${href}" class="actu-item">${title}</a>`;
        });

      items.push(`<a href="${ALL_NEWS_URL}" class="actu-item">Voir toutes les actus</a>`);

      track.innerHTML = Array.from({ length: Math.max(1, DUPLICATION) })
        .map(() => items.join(""))
        .join("");

    } catch (e) {
      console.error("[Actus] Échec chargement news.json :", e);
      track.innerHTML = `<a href="${ALL_NEWS_URL}" class="actu-item">Voir toutes les actus</a>`;
    }
  })();
});



  /* ===========================
     = Effet menu (bounce)      =
     =========================== */
  (function initMenuBounce() {
    const trigger = document.querySelector(".menu-trigger");
    const wrapper = document.querySelector(".side-wrapper");
    if (!trigger || !wrapper) return;

    const bounceZoomShadow = [
      { transform: "translateY(0) scale(1)",   filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))" },
      { transform: "translateY(-6px) scale(1.1)", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" },
      { transform: "translateY(0) scale(1)",   filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))" },
      { transform: "translateY(-3px) scale(1.05)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.22))" },
      { transform: "translateY(0) scale(1)",   filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))" }
    ];
    const bounceOptions = { duration: 900, easing: "ease-in-out" };

    setInterval(() => {
      // On évite l’animation quand le menu est ouvert (mobile) ou survolé (desktop)
      if (!wrapper.classList.contains("open") && !wrapper.matches(":hover")) {
        trigger.animate(bounceZoomShadow, bounceOptions);
      }
    }, 8000);
  })();


  /* ===========================
     = Flip cards (mobile)      =
     =========================== */
  (function initFlipCards() {
    const cards = document.querySelectorAll(".vignette-card");
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener("click", () => {
        card.classList.toggle("flipped");
      });
    });
  })();


  /* ===========================
     = Menu déroulant (header)  =
     =========================== */
  (function initSideMenu() {
    const wrapper = document.querySelector(".side-wrapper");
    const trigger = wrapper?.querySelector(".menu-trigger");
    const nav = wrapper?.querySelector(".side-menu");
    if (!wrapper || !trigger || !nav) return;

    // — Toggle mobile (on garde ton hover desktop via CSS)
    const toggleOpen = () => {
      const isOpen = wrapper.classList.toggle("open");
      trigger.setAttribute("aria-expanded", String(isOpen));
    };

    // Clic sur le trigger (mobile)
    trigger.addEventListener("click", (e) => {
      // si l’icône <img> est cliquée, éviter qu’un clic remonte et ferme instantanément
      e.stopPropagation();
      toggleOpen();
    });

    // Fermer au clic extérieur (mobile)
    document.addEventListener("click", (e) => {
      if (!wrapper.classList.contains("open")) return;
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });

    // Fermer à Échap (accessibilité)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && wrapper.classList.contains("open")) {
        wrapper.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      }
    });

    // Accessibilité clavier sur le trigger
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");

    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleOpen();
      }
    });

    // — Lien actif (mise en évidence de la page courante)
    const currentPath = window.location.pathname.replace(/\/+$/, ""); // sans trailing slash
    const links = nav.querySelectorAll("a[href]");
    links.forEach((a) => {
      try {
        const aURL = new URL(a.getAttribute("href", 2), window.location.origin);
        const aPath = aURL.pathname.replace(/\/+$/, "");
        if (aPath === currentPath || (aPath === "/index.html" && (currentPath === "" || currentPath === "/"))) {
          a.classList.add("is-active");
          // Option : remonter une classe sur <li> si besoin
          a.parentElement?.classList?.add("is-active");
        }
      } catch {
        // lien relatif mal formé : on ignore
      }
    });
  })();


  /* =====================================
     = Skip-link : focus sur #main si présent (A11y)  =
     ================================== */
  (function initSkipLink() {
    const main = document.getElementById("main");
    if (!main) return;
    // Si le skip-link est utilisé, le navigateur gère déjà l’ancre.
    // On s’assure juste que #main est focusable.
    if (!main.hasAttribute("tabindex")) {
      main.setAttribute("tabindex", "-1");
    }
  })();



/* ======================================
    ===  Vignettes Retournement Card  ===
    =================================== */
// (function(){
//   function clamp(n,min,max){return Math.max(min,Math.min(n,max));}
//   function initHoverFlag(){
//     const canHover=window.matchMedia('(hover: hover)').matches;
//     document.body.classList.toggle('can-hover',canHover);
//     document.body.classList.toggle('has-touch',!canHover);
//   }

//   function run(){
//     const grid=document.querySelector(".vignettes-section .vignettes-grid"); if(!grid) return;
//     const cards=[...grid.querySelectorAll(".card")]; if(!cards.length) return;
//     const LOCK_CONTENT=true;
//     const MOBILE_MAX=980;

//     function ensurePalettes(){
//       const cycle=["palette-light","palette-dark","palette-accent"];
//       cards.forEach((el,i)=>{
//         if(!Array.from(el.classList).some(c=>/^palette-/.test(c))){
//           const p=el.dataset.palette||cycle[i%cycle.length];
//           el.classList.add(p);
//         }
//       });
//     }

//     function getMobileCols(){
//       const cs=getComputedStyle(grid);
//       const card=parseFloat(cs.getPropertyValue("--card"))||160;
//       const gap=parseFloat(cs.getPropertyValue("gap"))||0;
//       const w=grid.clientWidth;
//       return Math.max(1,Math.floor((w+gap)/(card+gap)));
//     }

//     function applyMobilePalette(){
//       const cols=getMobileCols();
//       cards.forEach((el,i)=>{
//         el.classList.remove("mp-light","mp-dark","mp-accent");
//         const row=Math.floor(i/cols);
//         const col=i%cols;
//         const idx=(row+col)%3;
//         el.classList.add(idx===0?"mp-light":idx===1?"mp-dark":"mp-accent");
//       });
//     }

//     function clearInlineForMobile(){
//       grid.style.removeProperty("grid-template-columns");
//       grid.style.removeProperty("--cols");
//       grid.style.removeProperty("--tile");
//       cards.forEach(el=>{
//         el.style.removeProperty("grid-column");
//         el.style.removeProperty("grid-row");
//         el.style.removeProperty("font-size");
//       });
//     }

//     function applyDesktopLayout(){
//       const section=document.querySelector(".vignettes-section");
//       const scale=parseFloat(getComputedStyle(section).getPropertyValue("--cards-scale"))||1;
//       const width=grid.clientWidth||window.innerWidth;
//       let cols,tile;
//       if(width>1100){cols=Math.round(12/scale); tile=104*scale;}
//       else if(width>900){cols=Math.round(10/scale); tile=98*scale;}
//       else if(width>720){cols=Math.round(8/scale);  tile=94*scale;}
//       else {cols=6; tile=92*scale;}
//       cols=clamp(cols,2,12);

//       grid.style.setProperty("--cols",cols);
//       grid.style.setProperty("--tile",tile+"px");
//       grid.style.gridTemplateColumns=`repeat(${cols}, minmax(0,1fr))`;

//       cards.forEach(el=>{
//         let w=parseInt(el.dataset.w||2,10);
//         let h=parseInt(el.dataset.h||2,10);
//         w=clamp(w,1,Math.min(4,cols));
//         h=clamp(h,1,4);
//         el.style.gridColumn=`span ${w}`;
//         el.style.gridRow=`span ${h}`;
//         if(LOCK_CONTENT){el.style.fontSize="";}else{
//           const area=Math.sqrt(w*h);
//           const fz=clamp(tile*0.12*area/3,12,22);
//           el.style.fontSize=fz+"px";
//         }
//       });
//     }

//     function applyLayout(){
//       const isMobile=window.innerWidth<=MOBILE_MAX;
//       if(isMobile){
//         clearInlineForMobile();
//         applyMobilePalette();
//       }else{
//         cards.forEach(el=>el.classList.remove("mp-light","mp-dark","mp-accent"));
//         applyDesktopLayout();
//       }
//     }

//     initHoverFlag();
//     ensurePalettes();
//     applyLayout();

//     let raf;
//     const req=()=>{cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{initHoverFlag(); applyLayout();});};
//     const ro=new ResizeObserver(req); ro.observe(grid);
//     window.addEventListener("resize",req,{passive:true});
//     window.addEventListener("orientationchange",req,{passive:true});
//     if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",applyLayout,{once:true});}
//   }

//   if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",run,{once:true});}else{run();}
// })();



/* =======================================
    ===  Section Vignettes Carrousel   ===
    =================================== */
(function () {
  const roots = document.querySelectorAll('.vignettes-carousel .vc-inner');
  if (!roots.length) return;

  roots.forEach((root) => {
    const viewport = root.querySelector('.vc-viewport');
    const track = root.querySelector('.vc-track');
    const prevBtn = root.querySelector('.vc-prev');
    const nextBtn = root.querySelector('.vc-next');
    if (!viewport || !track || !prevBtn || !nextBtn) return;

    // === 1) Figer les variantes A/B une fois (évite les couleurs qui "glissent") ===
    (function assignVariantsOnce() {
      const items = track.querySelectorAll('.vc-item');
      items.forEach((el, i) => {
        if (!el.classList.contains('vc-a') && !el.classList.contains('vc-b')) {
          el.classList.add(i % 2 === 0 ? 'vc-a' : 'vc-b'); // index 0 => A, 1 => B, etc.
        }
      });
    })();

    // === 2) En mobile, ancrer les boutons *dans* .vc-viewport pour un centrage vertical exact ===
    const originalPrevNextSiblings = {
      prevNextRef: viewport,                    // point de référence
      before: viewport,                         // prev doit être AVANT viewport
      after: viewport.nextSibling               // next doit être APRÈS viewport
    };

    function dockButtonsIntoViewport() {
      // déplacer les boutons à l'intérieur du viewport
      if (prevBtn.parentElement !== viewport) viewport.appendChild(prevBtn);
      if (nextBtn.parentElement !== viewport) viewport.appendChild(nextBtn);
    }

    function undockButtonsToOriginal() {
      // remettre les boutons à leur place d'origine (prev avant viewport, next après)
      if (prevBtn.parentElement !== root) root.insertBefore(prevBtn, originalPrevNextSiblings.before);
      if (nextBtn.parentElement !== root) {
        if (originalPrevNextSiblings.after && originalPrevNextSiblings.after.parentNode === root) {
          root.insertBefore(nextBtn, originalPrevNextSiblings.after);
        } else {
          // si after a changé/disparu, on le remet juste après le viewport
          if (viewport.nextSibling) root.insertBefore(nextBtn, viewport.nextSibling);
          else root.appendChild(nextBtn);
        }
      }
    }

    const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

    function updateButtonDocking() {
      if (isMobile()) dockButtonsIntoViewport();
      else undockButtonsToOriginal();
    }

    // === 3) Carrousel défilement continu ===
    let offset = 0, gapPx = 0, running = true, rafId = null, lastT = 0;
    const speed = Math.max(10, Number(root.getAttribute('data-speed')) || 40);

    const getGap = () => parseFloat(getComputedStyle(track).gap || '0') || 0;

    const totalWidth = () => {
      const items = [...track.children];
      const widths = items.map(el => el.getBoundingClientRect().width);
      return widths.reduce((a, b) => a + b, 0) + Math.max(0, items.length - 1) * gapPx;
    };

    const ensureUsable = () => {
      gapPx = getGap();
      const usable = totalWidth() > viewport.getBoundingClientRect().width + 20;
      prevBtn.disabled = !usable;
      nextBtn.disabled = !usable;
      if (!usable) { stop(); offset = 0; track.style.transform = 'translateX(0)'; } else { start(); }
    };

    const stepForward = (px) => {
      offset += px;
      let first = track.firstElementChild;
      while (first) {
        const w = first.getBoundingClientRect().width + gapPx;
        if (offset >= w) { offset -= w; track.appendChild(first); first = track.firstElementChild; }
        else break;
      }
      track.style.transform = `translateX(${-offset}px)`;
    };

    const stepBackward = (px) => {
      offset -= px;
      while (offset < 0) {
        const last = track.lastElementChild;
        const w = last.getBoundingClientRect().width + gapPx;
        track.prepend(last); offset += w;
      }
      track.style.transform = `translateX(${-offset}px)`;
    };

    const tick = (t) => {
      if (!lastT) lastT = t;
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;
      if (running) stepForward(speed * dt);
      rafId = requestAnimationFrame(tick);
    };

    const start = () => { if (rafId) return; running = true; lastT = 0; rafId = requestAnimationFrame(tick); };
    const stop  = () => { running = false; if (rafId) { cancelAnimationFrame(rafId); rafId = null; } };

    const perClick = Math.max(1, Number(root.getAttribute('data-step')) || 1);
    const getItemW = () => {
      const first = track.querySelector('.vc-item');
      return first ? first.getBoundingClientRect().width + gapPx : 240 + gapPx;
    };
    const nudge = (dir) => {
      const delta = getItemW() * perClick;
      stop(); if (dir > 0) stepForward(delta); else stepBackward(delta); start();
    };

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', () => { if (!root.contains(document.activeElement)) start(); });

    nextBtn.addEventListener('click', () => nudge(1));
    prevBtn.addEventListener('click', () => nudge(-1));

    // Mobile : tap pour focus/flip sans bloquer la CTA
    const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
    if (isTouch) {
      root.querySelectorAll('.vc-card').forEach((card) => {
        card.addEventListener('touchstart', (e) => {
          const target = e.target;
          if (target && !(target.closest && target.closest('.vc-cta'))) {
            card.focus({ preventScroll: true });
          }
        }, { passive: true });
      });
    }

    window.addEventListener('resize', () => {
      updateButtonDocking();
      const prevLeft = offset;
      gapPx = getGap();
      ensureUsable();
      offset = prevLeft;
      track.style.transform = `translateX(${-offset}px)`;
    }, { passive: true });

    // init
    updateButtonDocking();
    ensureUsable();
  });
})();



// ===========================
// Effet transition entre sections
document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const seps = document.querySelectorAll('.text-sep.shape-diamond');
  if (!seps.length) return;

  let turn = 0; // 0..3
  setInterval(() => {
    turn = (turn + 1) % 4; // +90° à chaque tick
    const angle = 45 + turn * 90;
    seps.forEach(el => { el.style.transform = `rotate(${angle}deg)`; });
  }, 3000); // toutes les 3s
});



// ===========================
//tile survol page definition/domaines
// ===========================
// (() => {
//   const BREAKPOINT = 990;
//   const mq = window.matchMedia(`(max-width:${BREAKPOINT}px)`);
//   const HANDLERS = Symbol('handlers');
//   const stateByContainer = new WeakMap(); // par .domaines-content

//   document.addEventListener('DOMContentLoaded', refreshAll);
//   mq.addEventListener?.('change', refreshAll);

//   function refreshAll() {
//     document.querySelectorAll('.domaines-container').forEach(container => {
//       const labelsWrap = container.querySelector('.tiles--labels'); // grille texte
//       const imagesWrap = container.querySelector('.tiles--images'); // grille images
//       if (!labelsWrap || !imagesWrap) return;

//       // init état une seule fois (on mémorise les emplacements d’origine)
//       if (!stateByContainer.has(container)) {
//         const remember = node => ({ node, parent: node.parentNode, next: node.nextSibling });
//         const labels = Array.from(labelsWrap.querySelectorAll('.tile'));
//         const images = Array.from(imagesWrap.querySelectorAll('.tile'));
//         if (!labels.length || labels.length !== images.length) return;

//         stateByContainer.set(container, {
//           labelsWrap, imagesWrap,
//           slotsLabels: labels.map(remember),
//           slotsImages: images.map(remember),
//           mobileGrid: null
//         });
//       }

//       const s = stateByContainer.get(container);
//       if (mq.matches) {
//         // ===== MOBILE =====
//         toMobile(container, s);
//         // sécurité : pas de “liage” en mobile
//         teardownLinkedDesktop(container);
//       } else {
//         // ===== DESKTOP =====
//         fromMobileIfAny(s);
//         setupLinkedDesktop(container); // <-- rebranche TOUJOURS après restauration
//       }
//     });
//   }

//   /* ------------------- MOBILE ------------------- */
//   // REMPLACE ta fonction toMobile par celle-ci
//   function toMobile(container, s) {
//     if (s.mobileGrid) return; // déjà actif

//     // conteneur mobile
//     const grid = document.createElement('div');
//     grid.className = 'domaines-mobile';
//     container.appendChild(grid);
//     s.mobileGrid = grid;

//     // on cache les grilles d’origine
//     s.labelsWrap.style.display = 'none';
//     s.imagesWrap.style.display = 'none';

//     // pairage par data-key si présent, sinon index
//     const labels = s.slotsLabels.map(x => x.node);
//     const images = s.slotsImages.map(x => x.node);
//     const mapImgByKey = new Map(images.map(el => [el.dataset.key, el]));

//     labels.forEach((label, i) => {
//       const pair = document.createElement('div');
//       pair.className = 'pair';

//       const key = label.dataset.key;
//       const img = key ? mapImgByKey.get(key) : images[i];

//       // classes de style SUR .tile
//       label.classList.add('tile-text');
//       if (img) img.classList.add('tile-image');

//       // ➜ ALTERNE : lignes impaires = [texte | image], lignes paires = [image | texte]
//       const isOddRow = i % 2 === 1; // 0-based : 0,1,2,3...
//       if (isOddRow) {
//         if (img) pair.appendChild(img);
//         pair.appendChild(label);
//       } else {
//         pair.appendChild(label);
//         if (img) pair.appendChild(img);
//       }

//       grid.appendChild(pair);
//     });
//   }


//   /* ------------------- RESTAURE (quand on repasse desktop) ------------------- */
//   function fromMobileIfAny(s) {
//     if (!s.mobileGrid) return;

//     // réinsère chaque tuile à sa place d’origine (ordre conservé)
//     s.slotsLabels.forEach(({ node, parent, next }) => parent.insertBefore(node, next));
//     s.slotsImages.forEach(({ node, parent, next }) => parent.insertBefore(node, next));

//     // nettoie classes ajoutées en mobile
//     s.slotsLabels.forEach(({ node }) => node.classList.remove('tile-text', 'is-linked-hover'));
//     s.slotsImages.forEach(({ node }) => node.classList.remove('tile-image', 'is-linked-hover'));

//     // supprime la grille mobile et ré-affiche les grilles d’origine
//     s.mobileGrid.remove();
//     s.mobileGrid = null;
//     s.labelsWrap.style.display = '';
//     s.imagesWrap.style.display = '';
//   }

//   /* ------------------- DESKTOP : survol lié ------------------- */
//   function setupLinkedDesktop(container) {
//     const labels = Array.from(container.querySelectorAll('.tiles--labels .tile'));
//     const images = Array.from(container.querySelectorAll('.tiles--images .tile'));
//     if (!labels.length || labels.length !== images.length) return;

//     // nettoie d’éventuels anciens handlers
//     teardownLinkedDesktop(container);

//     // lier par data-key si possible
//     const mapImgByKey = new Map(images.map(el => [el.dataset.key, el]));
//     labels.forEach((label, i) => {
//       const twin = label.dataset.key ? mapImgByKey.get(label.dataset.key) : images[i];
//       if (!twin) return;
//       bindPair(label, twin);
//     });
//   }

//   function bindPair(a, b) {
//     teardownOne(a);
//     teardownOne(b);

//     const enterA = () => b.classList.add('is-linked-hover');
//     const leaveA = () => b.classList.remove('is-linked-hover');
//     const enterB = () => a.classList.add('is-linked-hover');
//     const leaveB = () => a.classList.remove('is-linked-hover');

//     add(a, 'mouseenter', enterA);
//     add(a, 'mouseleave', leaveA);
//     add(a, 'focusin',    enterA);
//     add(a, 'focusout',   leaveA);

//     add(b, 'mouseenter', enterB);
//     add(b, 'mouseleave', leaveB);
//     add(b, 'focusin',    enterB);
//     add(b, 'focusout',   leaveB);
//   }

//   function teardownLinkedDesktop(container) {
//     container.querySelectorAll('.tile').forEach(teardownOne);
//   }

//   function add(target, ev, fn) {
//     target.addEventListener(ev, fn);
//     (target[HANDLERS] ||= []).push({ ev, fn });
//   }
//   function teardownOne(target) {
//     const hs = target[HANDLERS];
//     if (!hs) return;
//     hs.forEach(({ ev, fn }) => target.removeEventListener(ev, fn));
//     target[HANDLERS] = [];
//     target.classList.remove('is-linked-hover');
//   }
// })();




// ===========================
// Personnalisation du comparatif
// (()=> {
//   const els = document.querySelectorAll('.comparatif .comparatif-container .colonne');
//   const tilt = 9;
//   let raf = null;

//   function baseTransform(el, hovered){
//     if (hovered && el.id === 'col-cpe') return 'translateY(-4px) scale(1.035) ';
//     return '';
//   }

//   function apply(el, x, y, hovered){
//     const r = el.getBoundingClientRect();
//     const px = (x / r.width - .5) * 2;
//     const py = (y / r.height - .5) * 2;
//     const rx = (-py * tilt).toFixed(2);
//     const ry = ( px * tilt).toFixed(2);
//     el.style.transform = `perspective(800px) ${baseTransform(el, hovered)}rotateX(${rx}deg) rotateY(${ry}deg)`;
//     el.style.setProperty('--mx', x + 'px');
//     el.style.setProperty('--my', y + 'px');
//   }

//   function reset(el){
//     el.style.transform = `perspective(800px) ${baseTransform(el, false)}`;
//     el.style.setProperty('--mx', '50%');
//     el.style.setProperty('--my', '50%');
//   }

//   els.forEach(el => {
//     reset(el);

//     el.addEventListener('pointermove', e => {
//       const r = el.getBoundingClientRect();
//       const x = e.clientX - r.left;
//       const y = e.clientY - r.top;
//       if (raf) cancelAnimationFrame(raf);
//       raf = requestAnimationFrame(() => apply(el, x, y, true));
//     });

//     el.addEventListener('pointerleave', () => {
//       if (raf) cancelAnimationFrame(raf);
//       reset(el);
//     });

//     el.addEventListener('pointerdown', e => {
//       const r = el.getBoundingClientRect();
//       apply(el, e.clientX - r.left, e.clientY - r.top, true);
//     });
//   });
// })();




// ==================================
// Carrousel Commentaires (chiffres)
(() => {
  const root = document.querySelector('.temo-carousel--secteurs');
  if (!root) return;

  const allSlides  = Array.from(root.querySelectorAll('.temo-slide'));
  const sectorBtns = Array.from(root.querySelectorAll('.temo-secteur'));
  const prev       = root.querySelector('.temo-nav.prev');
  const next       = root.querySelector('.temo-nav.next');
  const INTERVAL   = 10000; 
  // Ordre des secteurs = ordre des onglets
  const sectors = sectorBtns.map(b => b.dataset.sector);

  let activeSector = sectors[0];
  let sectorIdx    = 0;          // index dans `sectors`
  let slides       = [];         // slides du secteur actif
  let i            = 0;          // index du slide courant
  let timer;

  function filterSlides(sector) {
    return allSlides.filter(s => s.dataset.sector === sector);
  }

  function setActiveSector(sector, { startAt = 0 } = {}) {
    activeSector = sector;
    sectorIdx = sectors.indexOf(sector);

    // Onglets (état visuel + ARIA)
    sectorBtns.forEach(b => {
      const on = b.dataset.sector === sector;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    // Masquer tout, afficher le slide cible du secteur
    allSlides.forEach(s => s.classList.remove('is-active'));
    slides = filterSlides(activeSector);

    if (!slides.length) {
      // Si ce secteur est vide, passer directement au suivant
      goToNextSector();
      return;
    }

    i = Math.max(0, Math.min(startAt, slides.length - 1));
    slides[i].classList.add('is-active');

    start(); // relance l'auto-lecture sur le nouveau secteur
  }

  function show(idx) {
    if (!slides.length) return;
    slides[i].classList.remove('is-active');
    i = (idx + slides.length) % slides.length;
    slides[i].classList.add('is-active');
  }

  // ——— Navigation “suivant” : passe au secteur suivant si on est sur le dernier slide
  function showNext() {
    if (!slides.length) return;
    if (i < slides.length - 1) {
      show(i + 1);
    } else {
      goToNextSector(); // fin du secteur → secteur suivant (slide 1)
    }
  }

  // ——— Navigation “précédent” : si on est au début, revient au secteur précédent (dernier slide)
  function showPrev() {
    if (!slides.length) return;
    if (i > 0) {
      show(i - 1);
    } else {
      goToPrevSector(); // début du secteur → secteur précédent (dernier slide)
    }
  }

  function goToNextSector() {
    const nextIdx = (sectorIdx + 1) % sectors.length;
    setActiveSector(sectors[nextIdx], { startAt: 0 });
  }

  function goToPrevSector() {
    const prevIdx = (sectorIdx - 1 + sectors.length) % sectors.length;
    const targetSector = sectors[prevIdx];
    const targetSlides = filterSlides(targetSector);
    setActiveSector(targetSector, { startAt: Math.max(0, targetSlides.length - 1) });
  }

  function start() { stop(); timer = setInterval(showNext, INTERVAL); }
  function stop()  { if (timer) clearInterval(timer); }

  // Événements
  prev.addEventListener('click', () => { showPrev(); start(); });
  next.addEventListener('click', () => { showNext(); start(); });
  sectorBtns.forEach(btn => btn.addEventListener('click', () => {
    setActiveSector(btn.dataset.sector, { startAt: 0 });
  }));

  // Clavier (gauche/droite)
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); showPrev(); start(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showNext(); start(); }
  });
  root.setAttribute('tabindex', '0');

  // Init
  setActiveSector(sectors[0]);
})();



// ================================
// Page actualités
/* js/news.js
   Affiche les actus de ./data/news.json
   - Tri par date desc
   - Filtre par tag
   - Recherche
   - Pagination (12/cartes)
*/
(function () {
  const LIST_SELECTOR = '#actu-list';
  const DATA_URL = './data/news.json';
  const PAGE_SIZE = 12;

  const state = { all: [], filtered: [], page: 1, q: '', tag: 'Tous' };
  const $list = document.querySelector(LIST_SELECTOR);
  if (!$list) return;

  function injectControls() {
    const section = $list.closest('.actualites-section');
    const controls = document.createElement('div');
    controls.className = 'actu-controls';
    controls.innerHTML = `
      <input id="actu-search" type="search" placeholder="Rechercher une actu…" />
      <div class="tags"></div>
      <div class="count"></div>
      <button class="btn btn-more" type="button">Charger plus</button>
    `;
    section.prepend(controls);

    controls.querySelector('#actu-search').addEventListener('input', (e) => {
      state.q = (e.target.value || '').trim();
      state.page = 1;
      applyFilters(); render();
    });
    controls.querySelector('.btn-more').addEventListener('click', () => {
      state.page += 1; render();
    });
  }

  function uniqueTags(items) {
    const tags = new Set(['Tous']);
    items.forEach(i => { if (i.tag) tags.add(i.tag); });
    return Array.from(tags);
  }

  function renderTags() {
    const wrap = document.querySelector('.actu-controls .tags');
    wrap.innerHTML = '';
    uniqueTags(state.all).forEach(t => {
      const b = document.createElement('button');
      b.textContent = t; b.type = 'button';
      if (t === state.tag) b.classList.add('is-active');
      b.addEventListener('click', () => {
        state.tag = t; state.page = 1;
        applyFilters(); renderTags(); render();
      });
      wrap.appendChild(b);
    });
  }

  function applyFilters() {
    const q = state.q.toLowerCase(), tag = state.tag;
    state.filtered = state.all.filter(item => {
      const matchesTag = tag === 'Tous' || item.tag === tag;
      const hay = `${item.title} ${item.summary} ${item.source}`.toLowerCase();
      const matchesQuery = !q || hay.includes(q);
      return matchesTag && matchesQuery;
    });
  }

  function formatDate(iso) {
    try { return new Intl.DateTimeFormat('fr-FR',{dateStyle:'long'}).format(new Date(iso)); }
    catch { return iso; }
  }

  function cardTemplate(item) {
    return `
      <article class="actu-card">
        <a class="actu-media" href="${item.url}" target="_blank" rel="noopener noreferrer">
          ${item.image ? `<img loading="lazy" src="${item.image}" alt="${item.image_alt||item.title}" />` : ''}
        </a>
        <div class="actu-body">
          <h3 class="actu-title"><a href="${item.url}" target="_blank">${item.title}</a></h3>
          <p class="actu-meta">
            <span>${formatDate(item.date)}</span>
            ${item.source ? `· ${item.source}` : ''}
            ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
          </p>
          <p class="actu-summary">${item.summary}</p>
        </div>
      </article>`;
  }

  function render() {
    const intro = document.querySelector('.intro');
    if (intro) intro.style.display = state.filtered.length ? 'none' : '';
    const slice = state.filtered.slice(0, state.page * PAGE_SIZE);
    $list.innerHTML = slice.map(cardTemplate).join('');
    document.querySelector('.actu-controls .count').textContent =
      `${slice.length} / ${state.filtered.length} actus`;
    document.querySelector('.btn-more').style.display =
      slice.length < state.filtered.length ? 'inline-block' : 'none';
  }

  async function init() {
    injectControls();
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      state.all = (await res.json())
        .sort((a,b)=>new Date(b.date)-new Date(a.date));
      applyFilters(); renderTags(); render();
    } catch(e) {
      $list.innerHTML = `<p>⚠️ Impossible de charger les actus.</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

// js/article.js
(async function () {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  const container = document.querySelector(".article-container");
  if (!id || !container) {
    container.innerHTML = "<p>Article introuvable.</p>";
    return;
  }

  try {
    const res = await fetch("./data/news.json");
    const data = await res.json();
    const article = data[id - 1]; // simple: index = id-1

    if (!article) {
      container.innerHTML = "<p>Article introuvable.</p>";
      return;
    }

    document.title = article.title + " — Actualités CPE";

    container.innerHTML = `
      <article class="article-full">
        <h1>${article.title}</h1>
        <p class="meta">${new Intl.DateTimeFormat("fr-FR",{dateStyle:"long"}).format(new Date(article.date))} — ${article.author || ""}</p>
        <figure>
          <img src="${article.image}" alt="${article.image_alt || ""}">
        </figure>
        <div class="content">${article.content}</div>
        <p><a href="./actualites.html" class="btn">← Retour aux actualités</a></p>
      </article>
    `;
  } catch (err) {
    container.innerHTML = "<p>Erreur de chargement de l’article.</p>";
  }
})();
