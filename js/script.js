document.addEventListener("DOMContentLoaded", () => {
  /* ===========================
     = Carousel Actus (auto 5s) =
     =========================== */
  (function initCarousel() {
    const slides = document.querySelectorAll(".actu-slide");
    if (!slides.length) return;

    let current = 0;
    slides[0].classList.add("active");

    function showNextSlide() {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }

    setInterval(showNextSlide, 5000);
  })();


  /* ===========================
     = Effet menu (bounce)      =
     =========================== */
  // (function initMenuBounce() {
  //   const trigger = document.querySelector(".menu-trigger");
  //   const wrapper = document.querySelector(".side-wrapper");
  //   if (!trigger || !wrapper) return;

  //   const bounceZoomShadow = [
  //     { transform: "translateY(0) scale(1)",   filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))" },
  //     { transform: "translateY(-8px) scale(1.1)", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" },
  //     { transform: "translateY(0) scale(1)",   filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))" },
  //     { transform: "translateY(-4px) scale(1.05)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.22))" },
  //     { transform: "translateY(0) scale(1)",   filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))" }
  //   ];
  //   const bounceOptions = { duration: 900, easing: "ease-in-out" };

  //   setInterval(() => {
  //     // On évite l’animation quand le menu est ouvert (mobile) ou survolé (desktop)
  //     if (!wrapper.classList.contains("open") && !wrapper.matches(":hover")) {
  //       trigger.animate(bounceZoomShadow, bounceOptions);
  //     }
  //   }, 10000);
  // })();


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


  /* ==================================================
     = Skip-link : focus sur #main si présent (A11y)  =
     ================================================== */
  (function initSkipLink() {
    const main = document.getElementById("main");
    if (!main) return;
    // Si le skip-link est utilisé, le navigateur gère déjà l’ancre.
    // On s’assure juste que #main est focusable.
    if (!main.hasAttribute("tabindex")) {
      main.setAttribute("tabindex", "-1");
    }
  })();
});



/* ===================================================
    ========   Vignettes Retournement Card    ========
    ================================================== */
(function(){
  function clamp(n,min,max){return Math.max(min,Math.min(n,max));}
  function initHoverFlag(){
    const canHover=window.matchMedia('(hover: hover)').matches;
    document.body.classList.toggle('can-hover',canHover);
    document.body.classList.toggle('has-touch',!canHover);
  }

  function run(){
    const grid=document.querySelector(".vignettes-section .vignettes-grid"); if(!grid) return;
    const cards=[...grid.querySelectorAll(".card")]; if(!cards.length) return;
    const LOCK_CONTENT=true;
    const MOBILE_MAX=980;

    function ensurePalettes(){
      const cycle=["palette-light","palette-dark","palette-accent"];
      cards.forEach((el,i)=>{
        if(!Array.from(el.classList).some(c=>/^palette-/.test(c))){
          const p=el.dataset.palette||cycle[i%cycle.length];
          el.classList.add(p);
        }
      });
    }

    function getMobileCols(){
      const cs=getComputedStyle(grid);
      const card=parseFloat(cs.getPropertyValue("--card"))||160;
      const gap=parseFloat(cs.getPropertyValue("gap"))||0;
      const w=grid.clientWidth;
      return Math.max(1,Math.floor((w+gap)/(card+gap)));
    }

    function applyMobilePalette(){
      const cols=getMobileCols();
      cards.forEach((el,i)=>{
        el.classList.remove("mp-light","mp-dark","mp-accent");
        const row=Math.floor(i/cols);
        const col=i%cols;
        const idx=(row+col)%3;
        el.classList.add(idx===0?"mp-light":idx===1?"mp-dark":"mp-accent");
      });
    }

    function clearInlineForMobile(){
      grid.style.removeProperty("grid-template-columns");
      grid.style.removeProperty("--cols");
      grid.style.removeProperty("--tile");
      cards.forEach(el=>{
        el.style.removeProperty("grid-column");
        el.style.removeProperty("grid-row");
        el.style.removeProperty("font-size");
      });
    }

    function applyDesktopLayout(){
      const section=document.querySelector(".vignettes-section");
      const scale=parseFloat(getComputedStyle(section).getPropertyValue("--cards-scale"))||1;
      const width=grid.clientWidth||window.innerWidth;
      let cols,tile;
      if(width>1100){cols=Math.round(12/scale); tile=104*scale;}
      else if(width>900){cols=Math.round(10/scale); tile=98*scale;}
      else if(width>720){cols=Math.round(8/scale);  tile=94*scale;}
      else {cols=6; tile=92*scale;}
      cols=clamp(cols,2,12);

      grid.style.setProperty("--cols",cols);
      grid.style.setProperty("--tile",tile+"px");
      grid.style.gridTemplateColumns=`repeat(${cols}, minmax(0,1fr))`;

      cards.forEach(el=>{
        let w=parseInt(el.dataset.w||2,10);
        let h=parseInt(el.dataset.h||2,10);
        w=clamp(w,1,Math.min(4,cols));
        h=clamp(h,1,4);
        el.style.gridColumn=`span ${w}`;
        el.style.gridRow=`span ${h}`;
        if(LOCK_CONTENT){el.style.fontSize="";}else{
          const area=Math.sqrt(w*h);
          const fz=clamp(tile*0.12*area/3,12,22);
          el.style.fontSize=fz+"px";
        }
      });
    }

    function applyLayout(){
      const isMobile=window.innerWidth<=MOBILE_MAX;
      if(isMobile){
        clearInlineForMobile();
        applyMobilePalette();
      }else{
        cards.forEach(el=>el.classList.remove("mp-light","mp-dark","mp-accent"));
        applyDesktopLayout();
      }
    }

    initHoverFlag();
    ensurePalettes();
    applyLayout();

    let raf;
    const req=()=>{cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{initHoverFlag(); applyLayout();});};
    const ro=new ResizeObserver(req); ro.observe(grid);
    window.addEventListener("resize",req,{passive:true});
    window.addEventListener("orientationchange",req,{passive:true});
    if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",applyLayout,{once:true});}
  }

  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",run,{once:true});}else{run();}
})();



/* ===================================================
    ========   Section Vignettes Carrousel    ========
    ================================================== */
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
// Personnalisation du wrapper
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.side-wrapper');
  if (!wrapper || wrapper.dataset.mascotBound === '1') return;
  wrapper.dataset.mascotBound = '1';

  const mascot = wrapper.querySelector('.mascot-inline');
  const trigger = wrapper.querySelector('.menu-trigger');
  const eyes = wrapper.querySelectorAll('.mascot-inline .eye');
  if (!mascot || !eyes.length) return;

  // --- 1) Disparition quand le menu est ouvert (au clic/ARIA)
  function applyVisibility() {
    const expanded = trigger && trigger.getAttribute('aria-expanded') === 'true';
    mascot.classList.toggle('is-hidden', !!expanded);
  }
  applyVisibility();
  if (trigger) {
    new MutationObserver(applyVisibility)
      .observe(trigger, { attributes: true, attributeFilter: ['aria-expanded'] });
  }

  // --- 2) Yeux qui suivent le pointeur
  let targetX = 0, targetY = 0, pending = false;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function updateEyes() {
    pending = false;
    eyes.forEach(eye => {
      const pupil = eye.querySelector('.pupil');
      if (!pupil) return;
      const rEye = eye.getBoundingClientRect();
      const rPupil = pupil.getBoundingClientRect();
      const cx = rEye.left + rEye.width / 2;
      const cy = rEye.top + rEye.height / 2;
      const dx = targetX - cx;
      const dy = targetY - cy;
      const angle = Math.atan2(dy, dx);
      const maxX = (rEye.width - rPupil.width) / 2 - 1;
      const maxY = (rEye.height - rPupil.height) / 2 - 1;
      const tx = clamp(Math.cos(angle) * maxX, -maxX, maxX);
      const ty = clamp(Math.sin(angle) * maxY, -maxY, maxY);
      pupil.style.setProperty('--tx', `${tx}px`);
      pupil.style.setProperty('--ty', `${ty}px`);
    });
  }
  function requestUpdate() {
    if (!pending) { pending = true; requestAnimationFrame(updateEyes); }
  }
  window.addEventListener('mousemove', e => { targetX = e.clientX; targetY = e.clientY; requestUpdate(); }, { passive: true });
  window.addEventListener('touchmove', e => {
    const t = e.touches && e.touches[0];
    if (t) { targetX = t.clientX; targetY = t.clientY; requestUpdate(); }
  }, { passive: true });
  window.addEventListener('mouseleave', () => {
    wrapper.querySelectorAll('.mascot-inline .pupil').forEach(p => {
      p.style.setProperty('--tx', '0px');
      p.style.setProperty('--ty', '0px');
    });
  });
});


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
(() => {
  const BREAKPOINT = 990;
  const mq = window.matchMedia(`(max-width:${BREAKPOINT}px)`);
  const HANDLERS = Symbol('handlers');
  const stateByContainer = new WeakMap(); // par .domaines-content

  document.addEventListener('DOMContentLoaded', refreshAll);
  mq.addEventListener?.('change', refreshAll);

  function refreshAll() {
    document.querySelectorAll('.domaines-container').forEach(container => {
      const labelsWrap = container.querySelector('.tiles--labels'); // grille texte
      const imagesWrap = container.querySelector('.tiles--images'); // grille images
      if (!labelsWrap || !imagesWrap) return;

      // init état une seule fois (on mémorise les emplacements d’origine)
      if (!stateByContainer.has(container)) {
        const remember = node => ({ node, parent: node.parentNode, next: node.nextSibling });
        const labels = Array.from(labelsWrap.querySelectorAll('.tile'));
        const images = Array.from(imagesWrap.querySelectorAll('.tile'));
        if (!labels.length || labels.length !== images.length) return;

        stateByContainer.set(container, {
          labelsWrap, imagesWrap,
          slotsLabels: labels.map(remember),
          slotsImages: images.map(remember),
          mobileGrid: null
        });
      }

      const s = stateByContainer.get(container);
      if (mq.matches) {
        // ===== MOBILE =====
        toMobile(container, s);
        // sécurité : pas de “liage” en mobile
        teardownLinkedDesktop(container);
      } else {
        // ===== DESKTOP =====
        fromMobileIfAny(s);
        setupLinkedDesktop(container); // <-- rebranche TOUJOURS après restauration
      }
    });
  }

  /* ------------------- MOBILE ------------------- */
  // REMPLACE ta fonction toMobile par celle-ci
  function toMobile(container, s) {
    if (s.mobileGrid) return; // déjà actif

    // conteneur mobile
    const grid = document.createElement('div');
    grid.className = 'domaines-mobile';
    container.appendChild(grid);
    s.mobileGrid = grid;

    // on cache les grilles d’origine
    s.labelsWrap.style.display = 'none';
    s.imagesWrap.style.display = 'none';

    // pairage par data-key si présent, sinon index
    const labels = s.slotsLabels.map(x => x.node);
    const images = s.slotsImages.map(x => x.node);
    const mapImgByKey = new Map(images.map(el => [el.dataset.key, el]));

    labels.forEach((label, i) => {
      const pair = document.createElement('div');
      pair.className = 'pair';

      const key = label.dataset.key;
      const img = key ? mapImgByKey.get(key) : images[i];

      // classes de style SUR .tile
      label.classList.add('tile-text');
      if (img) img.classList.add('tile-image');

      // ➜ ALTERNE : lignes impaires = [texte | image], lignes paires = [image | texte]
      const isOddRow = i % 2 === 1; // 0-based : 0,1,2,3...
      if (isOddRow) {
        if (img) pair.appendChild(img);
        pair.appendChild(label);
      } else {
        pair.appendChild(label);
        if (img) pair.appendChild(img);
      }

      grid.appendChild(pair);
    });
  }


  /* ------------------- RESTAURE (quand on repasse desktop) ------------------- */
  function fromMobileIfAny(s) {
    if (!s.mobileGrid) return;

    // réinsère chaque tuile à sa place d’origine (ordre conservé)
    s.slotsLabels.forEach(({ node, parent, next }) => parent.insertBefore(node, next));
    s.slotsImages.forEach(({ node, parent, next }) => parent.insertBefore(node, next));

    // nettoie classes ajoutées en mobile
    s.slotsLabels.forEach(({ node }) => node.classList.remove('tile-text', 'is-linked-hover'));
    s.slotsImages.forEach(({ node }) => node.classList.remove('tile-image', 'is-linked-hover'));

    // supprime la grille mobile et ré-affiche les grilles d’origine
    s.mobileGrid.remove();
    s.mobileGrid = null;
    s.labelsWrap.style.display = '';
    s.imagesWrap.style.display = '';
  }

  /* ------------------- DESKTOP : survol lié ------------------- */
  function setupLinkedDesktop(container) {
    const labels = Array.from(container.querySelectorAll('.tiles--labels .tile'));
    const images = Array.from(container.querySelectorAll('.tiles--images .tile'));
    if (!labels.length || labels.length !== images.length) return;

    // nettoie d’éventuels anciens handlers
    teardownLinkedDesktop(container);

    // lier par data-key si possible
    const mapImgByKey = new Map(images.map(el => [el.dataset.key, el]));
    labels.forEach((label, i) => {
      const twin = label.dataset.key ? mapImgByKey.get(label.dataset.key) : images[i];
      if (!twin) return;
      bindPair(label, twin);
    });
  }

  function bindPair(a, b) {
    teardownOne(a);
    teardownOne(b);

    const enterA = () => b.classList.add('is-linked-hover');
    const leaveA = () => b.classList.remove('is-linked-hover');
    const enterB = () => a.classList.add('is-linked-hover');
    const leaveB = () => a.classList.remove('is-linked-hover');

    add(a, 'mouseenter', enterA);
    add(a, 'mouseleave', leaveA);
    add(a, 'focusin',    enterA);
    add(a, 'focusout',   leaveA);

    add(b, 'mouseenter', enterB);
    add(b, 'mouseleave', leaveB);
    add(b, 'focusin',    enterB);
    add(b, 'focusout',   leaveB);
  }

  function teardownLinkedDesktop(container) {
    container.querySelectorAll('.tile').forEach(teardownOne);
  }

  function add(target, ev, fn) {
    target.addEventListener(ev, fn);
    (target[HANDLERS] ||= []).push({ ev, fn });
  }
  function teardownOne(target) {
    const hs = target[HANDLERS];
    if (!hs) return;
    hs.forEach(({ ev, fn }) => target.removeEventListener(ev, fn));
    target[HANDLERS] = [];
    target.classList.remove('is-linked-hover');
  }
})();

