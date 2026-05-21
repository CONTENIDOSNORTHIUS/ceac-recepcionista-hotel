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

  /* ---------- 2. Acordeón del temario ---------- */
  document.querySelectorAll('.acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.classList.toggle('hidden');
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

  /* ---------- 4. Vídeos de los institutos: play en hover (desktop) + visible (móvil) ---------- */
  const institutoCards = document.querySelectorAll('.instituto-card');
  if (institutoCards.length) {
    const isTouch = window.matchMedia('(hover: none)').matches;

    institutoCards.forEach(card => {
      const video = card.querySelector('.instituto-video');
      if (!video) return;

      const play = () => video.play().catch(() => {});
      const pause = () => { video.pause(); video.currentTime = 0; };

      if (isTouch) {
        // En móvil: reproducir cuando entra en viewport, pausar cuando sale
        if ('IntersectionObserver' in window) {
          const vio = new IntersectionObserver(entries => {
            entries.forEach(e => (e.isIntersecting ? play() : pause()));
          }, { threshold: 0.5 });
          vio.observe(card);
        } else {
          play();
        }
      } else {
        card.addEventListener('mouseenter', play);
        card.addEventListener('mouseleave', pause);
        card.addEventListener('focusin', play);
        card.addEventListener('focusout', pause);
      }
    });
  }

  /* ---------- 5. Nav: transparente sobre hero → blanco al hacer scroll ---------- */
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
