/* ============================================================
   CHRONOS FACET — Vanilla JS
   No frameworks, no libraries.
   ============================================================ */

(() => {
  'use strict';

  document.documentElement.classList.remove('no-js');

  /* ---------------- Preloader ---------------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader?.classList.add('is-hidden');
    }, 400);
  });
  // Fallback in case 'load' already fired or is delayed unexpectedly
  setTimeout(() => preloader?.classList.add('is-hidden'), 2500);

  /* ---------------- Header scroll state ---------------- */
  const header = document.getElementById('siteHeader');
  let lastScrollY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    if (y > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
    lastScrollY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ----------------
     The header burger button opens the panel and morphs into an
     X (CSS-driven). A second, dedicated close button ("крестик")
     lives inside the panel itself — top-right, with its own
     scale/rotate entrance animation — so closing never depends on
     locating the header again once the panel covers it.
  ------------------------------------------------- */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  const setMenuState = (open) => {
    burgerBtn.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    burgerBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burgerBtn?.addEventListener('click', () => {
    const isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  // Dedicated close ("крестик") button inside the panel
  mobileMenuClose?.addEventListener('click', () => {
    setMenuState(false);
    burgerBtn.focus();
  });

  // Close on link tap
  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      setMenuState(false);
      burgerBtn.focus();
    }
  });

  /* ---------------- Scroll reveal (Prism / Luxury Fade) ---------------- */
  const revealEls = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------- Staggered reveal for grid children ---------------- */
  document.querySelectorAll('.philosophy-grid, .materials-grid, .testimonials-track').forEach((grid) => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  /* ---------------- Faceted card reveal (Materials + Testimonials) ----------------
     Cards enter with a clip-path facet wipe rather than a plain fade, matching
     the site's diagonal-cut visual language. Staggered via transitionDelay set
     above; observer just flips the class once each card enters the viewport.
  --------------------------------------------------------------------------- */
  const facetCards = document.querySelectorAll('.material-card, .testimonial-card');
  if ('IntersectionObserver' in window && facetCards.length) {
    const facetObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            facetObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
    );
    facetCards.forEach((card) => facetObserver.observe(card));
  } else {
    facetCards.forEach((card) => card.classList.add('is-visible'));
  }

  /* ---------------- Subtle pointer tilt on material cards (desktop only) ----------------
     A light 3D tilt that tracks the cursor, on top of the CSS hover lift.
     Reads as the macro surface catching light as you move — reinforced by
     the shimmer sweep defined in CSS. Skipped on touch / reduced-motion.
  ------------------------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (supportsHoverTiltCheck()) {
    document.querySelectorAll('.material-visual').forEach((visual) => {
      visual.addEventListener('mousemove', (e) => {
        const rect = visual.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        visual.style.transform = `rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg) translateZ(6px)`;
      });
      visual.addEventListener('mouseleave', () => { visual.style.transform = ''; });
    });
  }
  function supportsHoverTiltCheck() {
    return !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  /* ---------------- Animated spec counters (Mechanism) ----------------
     Numbers count up from 0 once the specs row scrolls into view, and the
     surrounding .mechanism section gets an .is-revealed class that drives
     the staggered entrance of the layer buttons (see CSS).
  ----------------------------------------------------------------------- */
  const mechanismEl = document.querySelector('.mechanism');
  const specCounters = document.querySelectorAll('.spec-count');

  const formatCount = (value, format) => {
    if (format === 'thousands') return Math.round(value).toLocaleString('ru-RU');
    return String(Math.round(value));
  };

  const runCounter = (el) => {
    const target = parseFloat(el.dataset.countTo || '0', 10);
    const format = el.dataset.format || 'plain';
    const specItem = el.closest('.mechanism-spec-item');
    if (prefersReducedMotion) {
      el.textContent = formatCount(target, format);
      specItem?.classList.add('is-counted');
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic — matches the site's precision easing feel
      el.textContent = formatCount(target * eased, format);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        specItem?.classList.add('is-counted');
      }
    };
    requestAnimationFrame(step);
  };

  if (mechanismEl && 'IntersectionObserver' in window) {
    const specObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            specCounters.forEach(runCounter);
            specObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    specObserver.observe(mechanismEl);
  } else {
    mechanismEl?.classList.add('is-revealed');
    specCounters.forEach((el) => {
      el.textContent = formatCount(parseFloat(el.dataset.countTo || '0', 10), el.dataset.format || 'plain');
      el.closest('.mechanism-spec-item')?.classList.add('is-counted');
    });
  }

  /* ---------------- Mechanism layer interaction ----------------
     Clicking / hovering a layer button highlights the matching
     SVG layer (data-layer attribute match). Keyboard accessible
     via aria-pressed + click (works with Enter/Space on buttons).
  ------------------------------------------------------------- */
  const mechLayerBtns = document.querySelectorAll('.mech-layer-btn');
  const mechLayers = document.querySelectorAll('.mech-layer');

  const activateLayer = (target) => {
    mechLayers.forEach((layer) => {
      layer.classList.toggle('is-active', layer.dataset.layer === target);
    });
    mechLayerBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.target === target));
    });
  };

  mechLayerBtns.forEach((btn) => {
    btn.addEventListener('click', () => activateLayer(btn.dataset.target));
    btn.addEventListener('mouseenter', () => activateLayer(btn.dataset.target));
  });

  // Auto-cycle through layers once mechanism section is in view (until user interacts)
  const mechanismSection = document.getElementById('mechanism');
  let autoCycleTimer = null;
  let userInteracted = false;

  mechLayerBtns.forEach((btn) => {
    btn.addEventListener('pointerdown', () => { userInteracted = true; clearInterval(autoCycleTimer); });
  });

  if (mechanismSection && 'IntersectionObserver' in window) {
    const mechObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !userInteracted) {
            let i = 0;
            const layers = Array.from(mechLayerBtns);
            activateLayer(layers[0]?.dataset.target);
            autoCycleTimer = setInterval(() => {
              i = (i + 1) % layers.length;
              activateLayer(layers[i].dataset.target);
            }, 2600);
          } else if (!entry.isIntersecting) {
            clearInterval(autoCycleTimer);
          }
        });
      },
      { threshold: 0.4 }
    );
    mechObserver.observe(mechanismSection);
  }

  /* ---------------- Art of Detail — custom fullscreen lightbox ----------------
     Prevents the browser/OS from taking over .detail-art-frame images with
     its own native image viewer (which has no caption, no close button, and
     can't be styled). Tapping/clicking a frame opens this in-page overlay
     instead, with the image + caption centered and a custom animated close
     button. Closes on: close button, Escape key, or backdrop click.
  ------------------------------------------------------------------------- */
  const detailFrames = document.querySelectorAll('.detail-art-frame');
  const detailLightbox = document.getElementById('detailLightbox');
  const detailLightboxImg = document.getElementById('detailLightboxImg');
  const detailLightboxCaption = document.getElementById('detailLightboxCaption');
  const detailLightboxClose = document.getElementById('detailLightboxClose');
  let lastFocusedDetailFrame = null;

  const openDetailLightbox = (frame) => {
    const img = frame.querySelector('img');
    const caption = frame.querySelector('figcaption');
    if (!img || !detailLightbox) return;

    lastFocusedDetailFrame = frame;
    detailLightboxImg.src = img.src;
    detailLightboxImg.alt = img.alt || '';
    detailLightboxCaption.textContent = caption ? caption.textContent : '';

    detailLightbox.classList.add('is-open');
    detailLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    detailLightboxClose.focus();
  };

  const closeDetailLightbox = () => {
    if (!detailLightbox) return;
    detailLightbox.classList.remove('is-open');
    detailLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocusedDetailFrame?.focus();
  };

  detailFrames.forEach((frame) => {
    frame.addEventListener('click', () => openDetailLightbox(frame));
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetailLightbox(frame);
      }
    });
    // Stop the tap from also triggering the browser's native image viewer.
    frame.querySelector('img')?.addEventListener('click', (e) => e.preventDefault());
  });

  detailLightboxClose?.addEventListener('click', closeDetailLightbox);

  detailLightbox?.addEventListener('click', (e) => {
    if (e.target === detailLightbox) closeDetailLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!detailLightbox?.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeDetailLightbox();
      return;
    }

    // Focus trap: the close button is the only focusable element inside
    // the lightbox, so Tab / Shift+Tab should just keep it focused rather
    // than letting focus escape onto the page content underneath.
    if (e.key === 'Tab') {
      e.preventDefault();
      detailLightboxClose.focus();
    }
  });

  /* ---------------- Magnetic cursor on primary buttons (desktop only) ---------------- */
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHover) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------------- Hero parallax on scroll (Depth Scroll) ----------------
     Only the decorative background facets parallax now — the watch hexagon
     is absolutely positioned inside .hero, so it scrolls together with the
     hero section as one piece and must NOT be pushed around here.
  ------------------------------------------------------------------------- */
  const heroFacets = document.querySelectorAll('.facet-plane');
  let ticking = false;

  const updateParallax = () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroFacets.forEach((facet, i) => {
        const speed = 0.08 + i * 0.04;
        facet.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  /* ---------------- Boutique form ---------------- */
  const boutiqueForm = document.getElementById('boutiqueForm');
  const formNote = document.getElementById('formNote');

  boutiqueForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = document.getElementById('fName').value.trim();
    const contactVal = document.getElementById('fContact').value.trim();

    if (!nameVal || !contactVal) {
      formNote.textContent = 'Пожалуйста, заполните имя и контакт для связи.';
      return;
    }

    formNote.textContent = `Благодарим, ${nameVal}. Куратор коллекции свяжется с вами в течение 24 часов.`;
    boutiqueForm.reset();
  });

  /* ---------------- Testimonials horizontal drag-scroll (touch/mouse) ---------------- */
  const track = document.getElementById('testimonialsTrack');
  // Grid layout on desktop; drag-scroll only meaningfully applies if content overflows on narrow viewports.
  // No-op safeguard: skip if track doesn't scroll.
  if (track && track.scrollWidth > track.clientWidth) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener('pointerdown', (e) => {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    track.addEventListener('pointerleave', () => { isDown = false; });
    track.addEventListener('pointerup', () => { isDown = false; });
    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX);
    });
  }

  /* ---------------- Smooth in-page nav focus management ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Move focus for keyboard/screen-reader users after scroll settles
          setTimeout(() => target.setAttribute('tabindex', '-1'), 0);
          setTimeout(() => target.focus({ preventScroll: true }), 500);
        }
      }
    });
  });

})();
