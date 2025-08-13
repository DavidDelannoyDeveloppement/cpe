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
  (function initMenuBounce() {
    const trigger = document.querySelector(".menu-trigger");
    const wrapper = document.querySelector(".side-wrapper");
    if (!trigger || !wrapper) return;

    const bounceZoomShadow = [
      { transform: "translateY(0) scale(1)",   filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))" },
      { transform: "translateY(-8px) scale(1.1)", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" },
      { transform: "translateY(0) scale(1)",   filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))" },
      { transform: "translateY(-4px) scale(1.05)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.22))" },
      { transform: "translateY(0) scale(1)",   filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.2))" }
    ];
    const bounceOptions = { duration: 900, easing: "ease-in-out" };

    setInterval(() => {
      // On évite l’animation quand le menu est ouvert (mobile) ou survolé (desktop)
      if (!wrapper.classList.contains("open") && !wrapper.matches(":hover")) {
        trigger.animate(bounceZoomShadow, bounceOptions);
      }
    }, 10000);
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



  /* ==================================================
     =======   Calcul et placement Vignettes    =======
     ================================================== */
(function(){
  function clamp(n,min,max){return Math.max(min,Math.min(n,max));}
  function run(){
    const grid=document.querySelector(".vignettes-section .vignettes-grid"); if(!grid) return;
    const cards=[...grid.querySelectorAll(".card")]; if(!cards.length) return;

    function ensurePalettes(){
      const paletteCycle=["palette-light","palette-dark","palette-accent"];
      cards.forEach((el,i)=>{
        const has=Array.from(el.classList).some(c=>/^palette-/.test(c));
        if(!has){
          const p=el.dataset.palette||paletteCycle[i%paletteCycle.length];
          el.classList.add(p);
        }
      });
    }

    function applyLayout(){
      const cs=getComputedStyle(grid);
      const width=grid.clientWidth||window.innerWidth;
      let cols=parseInt(cs.getPropertyValue("--cols"))||10;
      let tile=parseFloat(cs.getPropertyValue("--tile"))||120;

      if(width>1100){cols=10; tile=120;}
      else if(width>900){cols=8; tile=115;}
      else if(width>720){cols=7; tile=110;}
      else {cols=6; tile=102;}

      grid.style.setProperty("--cols",cols);
      grid.style.setProperty("--tile",tile+"px");
      grid.style.gridTemplateColumns=`repeat(${cols}, minmax(0,1fr))`;

      cards.forEach((el,i)=>{
        let w=parseInt(el.dataset.w||2,10);
        let h=parseInt(el.dataset.h||2,10);
        w=clamp(w,1,Math.min(4,cols));
        h=clamp(h,1,4);
        el.style.gridColumn=`span ${w}`;
        el.style.gridRow=`span ${h}`;

        const areaScale=Math.sqrt(w*h);
        const fz=clamp(tile*0.25*areaScale/3,12,22);
        el.style.fontSize=fz+"px";
      });
    }

    function init(){
      ensurePalettes();
      applyLayout();
    }

    let raf; const req=()=>{cancelAnimationFrame(raf); raf=requestAnimationFrame(applyLayout);};
    const ro=new ResizeObserver(req); ro.observe(grid);
    window.addEventListener("resize",req,{passive:true});
    if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init,{once:true});}else{init();}
  }
  run();
})();



