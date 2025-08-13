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
