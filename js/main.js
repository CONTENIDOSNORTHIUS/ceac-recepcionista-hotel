/* ============================================================
   CEAC · Recepcionista de Hotel — main.js
   - Smooth scroll (delegado a CSS scroll-behavior)
   - Menú móvil
   - Acordeón del temario (accesible)
   - Reveal on scroll (IntersectionObserver)
   - Sombra dinámica en nav al hacer scroll
   ============================================================ */

(() => {
  'use strict';

  /* ---------- 1. Menú móvil ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Cierra el menú al pulsar un enlace
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 2. Acordeón del temario (exclusivo: solo uno abierto a la vez) ---------- */
  const accButtons = Array.from(document.querySelectorAll('.acc-btn'));

  const closeAccordion = (btn) => {
    btn.setAttribute('aria-expanded', 'false');
    const panel = btn.nextElementSibling;
    if (panel && panel.classList.contains('acc-panel')) panel.classList.add('hidden');
  };

  const openAccordion = (btn) => {
    btn.setAttribute('aria-expanded', 'true');
    const panel = btn.nextElementSibling;
    if (panel && panel.classList.contains('acc-panel')) panel.classList.remove('hidden');
  };

  accButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const wasOpen = btn.getAttribute('aria-expanded') === 'true';

      // Cierra TODOS los módulos
      accButtons.forEach(closeAccordion);

      // Si el clicado estaba cerrado, lo abrimos (si estaba abierto, queda cerrado)
      if (!wasOpen) openAccordion(btn);
    });
  });

  /* ---------- 3. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback: mostrar todo
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- 4. Vídeos de los institutos: play SOLO al pasar el cursor (hover) ---------- */
  document.querySelectorAll('.instituto-card').forEach(card => {
    const video = card.querySelector('.instituto-video');
    if (!video) return;

    const play = () => { video.play().catch(() => {}); };
    const stop = () => { video.pause(); video.currentTime = 0; };

    // Desktop: hover y foco por teclado
    card.addEventListener('mouseenter', play);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focusin', play);
    card.addEventListener('focusout', stop);

    // Touch (móvil/tablet): un tap inicia, otro detiene
    card.addEventListener('touchstart', () => {
      if (video.paused) play(); else stop();
    }, { passive: true });
  });

  /* ---------- 5. Vídeo "Bienvenido": facade → iframe al pulsar (ahorra carga inicial) ---------- */
  const welcomeBtn = document.getElementById('welcomeVideo');
  const welcomeWrap = document.getElementById('welcomeVideoWrap');
  if (welcomeBtn && welcomeWrap) {
    welcomeBtn.addEventListener('click', () => {
      const id = welcomeBtn.dataset.yt;
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = 'Vídeo de bienvenida CEAC';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.className = 'absolute inset-0 w-full h-full border-0';
      welcomeWrap.innerHTML = '';
      welcomeWrap.appendChild(iframe);
    });
  }

  /* ---------- 6. Vídeo docente: facade → iframe al pulsar ---------- */
  const docenteBtn = document.getElementById('docenteVideo');
  const docenteWrap = document.getElementById('docenteVideoWrap');
  if (docenteBtn && docenteWrap) {
    docenteBtn.addEventListener('click', () => {
      const id = docenteBtn.dataset.yt;
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = 'Vídeo de presentación de Luis Romo';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.className = 'absolute inset-0 w-full h-full border-0';
      docenteWrap.innerHTML = '';
      docenteWrap.appendChild(iframe);
    });
  }

  /* ---------- 7. Carrusel de logos colaboradores (loop infinito con duplicado) ---------- */
  const logosTrack = document.getElementById('logosTrack');
  const logosPrev  = document.getElementById('logosPrev');
  const logosNext  = document.getElementById('logosNext');
  if (logosTrack && logosPrev && logosNext) {
    // Duplicamos el set de logos para crear la ilusión de loop infinito
    const originalCount = logosTrack.children.length;
    Array.from(logosTrack.children).forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach(img => { img.alt = ''; });
      logosTrack.appendChild(clone);
    });

    const stepPx = () => {
      const card = logosTrack.querySelector('.logo-card');
      if (!card) return 200;
      const gap = parseFloat(getComputedStyle(logosTrack).gap) || 16;
      return card.offsetWidth + gap;
    };
    const setWidth = () => originalCount * stepPx();

    // Reset silencioso: si se pasa del set original, salta atrás SIN animación
    const silentRewind = (delta) => {
      const prev = logosTrack.style.scrollBehavior;
      logosTrack.style.scrollBehavior = 'auto';
      logosTrack.scrollLeft += delta;
      // Restauramos el behavior en el siguiente frame
      requestAnimationFrame(() => { logosTrack.style.scrollBehavior = prev; });
    };

    let throttle = 0;
    logosTrack.addEventListener('scroll', () => {
      const now = Date.now();
      if (now - throttle < 80) return;
      const ow = setWidth();
      if (logosTrack.scrollLeft >= ow) {
        throttle = now;
        silentRewind(-ow);
      }
    }, { passive: true });

    logosNext.addEventListener('click', () => {
      logosTrack.scrollBy({ left: stepPx(), behavior: 'smooth' });
    });

    logosPrev.addEventListener('click', () => {
      // Si estamos al inicio, saltar primero al equivalente del set duplicado
      if (logosTrack.scrollLeft <= 2) silentRewind(setWidth());
      logosTrack.scrollBy({ left: -stepPx(), behavior: 'smooth' });
    });
  }

  /* ---------- 7. Metodología CEAC: ocultar el hint de scroll tras el primer desplazamiento ---------- */
  const metodologiaScroll = document.getElementById('metodologiaScroll');
  const metodologiaHint  = document.getElementById('metodologiaHint');
  if (metodologiaScroll && metodologiaHint) {
    let dismissed = false;
    metodologiaScroll.addEventListener('scroll', () => {
      if (!dismissed && metodologiaScroll.scrollLeft > 30) {
        metodologiaHint.style.transition = 'opacity 0.4s ease';
        metodologiaHint.style.opacity = '0';
        setTimeout(() => metodologiaHint.remove(), 500);
        dismissed = true;
      }
    }, { passive: true });
  }

  /* ---------- 6. Nav: transparente sobre hero → blanco al hacer scroll ---------- */
  const nav = document.getElementById('nav');
  const navLogo = document.getElementById('navLogo');
  const navLinks = document.getElementById('navLinks');
  const menuBtnEl = document.getElementById('menuBtn');

  if (nav) {
    const hero = document.getElementById('hero');
    const threshold = () => (hero ? hero.offsetHeight - 80 : 200);

    const setSolid = (solid) => {
      if (solid) {
        nav.classList.remove('bg-transparent');
        nav.classList.add('bg-white/95', 'backdrop-blur', 'border-b', 'border-gray-100', 'shadow-sm');
        if (navLogo && navLogo.dataset.logoDark) navLogo.src = navLogo.dataset.logoDark;
        if (navLinks) {
          navLinks.classList.remove('text-white');
          navLinks.classList.add('text-[#1a1a1a]');
        }
        if (menuBtnEl) {
          menuBtnEl.classList.remove('text-white');
          menuBtnEl.classList.add('text-[#1a1a1a]');
        }
      } else {
        nav.classList.add('bg-transparent');
        nav.classList.remove('bg-white/95', 'backdrop-blur', 'border-b', 'border-gray-100', 'shadow-sm');
        if (navLogo && navLogo.dataset.logoLight) navLogo.src = navLogo.dataset.logoLight;
        if (navLinks) {
          navLinks.classList.add('text-white');
          navLinks.classList.remove('text-[#1a1a1a]');
        }
        if (menuBtnEl) {
          menuBtnEl.classList.add('text-white');
          menuBtnEl.classList.remove('text-[#1a1a1a]');
        }
      }
    };

    const onScroll = () => setSolid(window.scrollY > threshold());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }
})();
