/* ============================================
   POPOYO REAL ESTATE — App Logic
   GSAP animations, Leaflet map, filters, theme
   ============================================ */

(function() {
  'use strict';

  // Initialize Lucide icons
  lucide.createIcons();

  // -------------------------------------------
  // THEME TOGGLE
  // -------------------------------------------
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function updateToggleIcon() {
    if (!toggle) return;
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  }
  updateToggleIcon();

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      updateToggleIcon();
    });
  }

  // -------------------------------------------
  // MOBILE MENU
  // -------------------------------------------
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // -------------------------------------------
  // HEADER SCROLL BEHAVIOR (FIXED)
  // Hide header sooner when scrolling down
  // -------------------------------------------
  const header = document.getElementById('header');
  let lastScroll = 0;
  let scrollThreshold = 80;

  window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    
    // Add blur background after 50px
    if (curr > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
    
    // Hide when scrolling down (after threshold)
    // Show when scrolling up or at top
    const scrollingDown = curr > lastScroll;
    const scrollingUp = curr < lastScroll;
    const pastThreshold = curr > scrollThreshold;
    const atTop = curr < 20;
    
    if (scrollingDown && pastThreshold) {
      header.classList.add('header--hidden');
    } else if (scrollingUp || atTop) {
      header.classList.remove('header--hidden');
    }
    
    lastScroll = curr;
  }, { passive: true });

  // -------------------------------------------
  // GSAP — Register ScrollTrigger
  // -------------------------------------------
  gsap.registerPlugin(ScrollTrigger);

  // Hero animations
  const heroTl = gsap.timeline({ delay: 0.3 });
  heroTl
    .to('.hero-bg img', { scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
    .to('.hero-tag', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.3)
    .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.5)
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.8)
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1)
    .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.2);

  // Counter animation
  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.count);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        delay: 1.4,
        onUpdate: () => {
          el.textContent = Math.round(obj.val);
        }
      });
    });
  }
  animateCounters();

  // Listing cards reveal with stagger
  const cards = gsap.utils.toArray('.listing-card');
  cards.forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: i % 3 * 0.1,
          ease: 'power3.out'
        });
        card.classList.add('visible');
      },
      once: true
    });
  });

  // ---- Robust scroll-reveal helper ----
  // Uses gsap.set + gsap.to so anchor-link jumps never leave cards invisible.
  // Also handles smooth-scroll nav clicks by listening to hashchange and
  // refreshing ScrollTrigger after jumps.
  function revealOnScroll(selector, staggerFn) {
    gsap.utils.toArray(selector).forEach((el, i) => {
      gsap.set(el, { opacity: 0, y: 30 });

      function reveal() {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: staggerFn ? staggerFn(i) : 0,
          ease: 'power3.out',
          overwrite: true
        });
      }

      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: reveal
      });
    });
  }

  // After any anchor-link click, refresh ScrollTrigger so cards
  // that jumped into view get their onEnter fired.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      // Multiple refresh passes to catch both instant jumps and smooth scrolls
      setTimeout(() => ScrollTrigger.refresh(), 50);
      setTimeout(() => ScrollTrigger.refresh(), 300);
      setTimeout(() => ScrollTrigger.refresh(), 800);
    });
  });

  // Value strip items
  revealOnScroll('.value-item', i => i * 0.08);

  // Timeline steps
  revealOnScroll('.timeline-step', i => i * 0.12);

  // Trip includes cards
  revealOnScroll('.includes-card', i => (i % 3) * 0.1);

  // Itinerary day cards
  revealOnScroll('.itinerary-day', i => (i % 3) * 0.1);

  // Itinerary note
  revealOnScroll('.itinerary-note', () => 0);

  // Invest cards
  revealOnScroll('.invest-card', i => (i % 3) * 0.1);

  // Lifestyle cards
  revealOnScroll('.lifestyle-card', i => i * 0.12);

  // Surf cards
  revealOnScroll('.surf-card', i => i * 0.1);

  // Surf comparison
  revealOnScroll('.surf-comparison', () => 0);

  // Surf CTA
  revealOnScroll('.surf-cta', () => 0);

  // Comparison cards
  revealOnScroll('.comparison-card', i => i * 0.15);

  // Section headers
  revealOnScroll('.section-header', () => 0);

  // CTA section
  revealOnScroll('.cta-content', () => 0);

  // Listings trip CTA
  revealOnScroll('.listings-trip-cta', () => 0);

  // Timeline CTA
  revealOnScroll('.timeline-cta', () => 0);

  // Contact card
  revealOnScroll('.contact-card', () => 0);

  // -------------------------------------------
  // FILTER
  // -------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const listingCards = document.querySelectorAll('.listing-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      listingCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          gsap.fromTo(card, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // -------------------------------------------
  // LEAFLET MAP
  // -------------------------------------------
  const mapEl = document.getElementById('mapContainer');
  if (mapEl && typeof L !== 'undefined') {
    const map = L.map('mapContainer', {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView([11.8, -86.3], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(map);

    const tealIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:14px;height:14px;background:var(--color-primary,#0e7a6e);border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const orangeIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:14px;height:14px;background:#c27020;border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const blueIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:14px;height:14px;background:#2563eb;border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const locations = [
      // Emerald Coast (Primary Investment Zone)
      {
        lat: 11.500, lng: -86.053,
        title: 'Playa Popoyo',
        desc: 'World-famous surf break. Consistent barrels year-round.',
        icon: tealIcon
      },
      {
        lat: 11.508, lng: -86.058,
        title: 'Playa Guasacate',
        desc: 'Popular beach with restaurants, hostels, tidal pools. Prime real estate.',
        icon: tealIcon
      },
      {
        lat: 11.490, lng: -86.044,
        title: 'Downtown Popoyo',
        desc: 'Growing community. Lots from $20/m². Hotels, shops, surf access.',
        icon: orangeIcon
      },
      {
        lat: 11.486, lng: -86.039,
        title: 'Playa Santana',
        desc: 'Punchy, barreling waves. Beachfront hotel and restaurant opportunities.',
        icon: tealIcon
      },
      {
        lat: 11.467, lng: -86.010,
        title: 'Hacienda Iguana',
        desc: 'Gated resort community. Golf, pools, Playa Colorado surf.',
        icon: orangeIcon
      },
      {
        lat: 11.453, lng: -85.985,
        title: 'Rancho Santana',
        desc: '2,700-acre luxury resort. Premium beachfront homes and condos.',
        icon: orangeIcon
      },
      // Northern Surf Zones (Extended Trip Options)
      {
        lat: 12.367, lng: -86.933,
        title: 'El Tránsito',
        desc: 'Authentic fishing village. All-level beach break. Québec expat community. Budget-friendly investments.',
        icon: blueIcon
      },
      {
        lat: 12.183, lng: -86.850,
        title: 'Playa San Diego',
        desc: 'Intermediate-advanced. Rocky/coral bottom, fast lefts. Less crowded, premium feel.',
        icon: blueIcon
      }
    ];

    locations.forEach(loc => {
      L.marker([loc.lat, loc.lng], { icon: loc.icon })
        .addTo(map)
        .bindPopup(`
          <div class="map-popup-title">${loc.title}</div>
          <div class="map-popup-desc">${loc.desc}</div>
        `);
    });

    // Animate map entry
    ScrollTrigger.create({
      trigger: '#map',
      start: 'top 80%',
      onEnter: () => {
        map.invalidateSize();
      },
      once: true
    });
  }

  // -------------------------------------------
  // PARALLAX on hero image
  // -------------------------------------------
  gsap.to('.hero-bg img', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // -------------------------------------------
  // INQUIRY MODAL
  // -------------------------------------------
  const modal = document.getElementById('inquiryModal');
  const modalClose = document.getElementById('modalClose');
  const modalProperty = document.getElementById('modalProperty');
  const modalEmailBtn = document.getElementById('modalEmailBtn');
  const CONTACT_EMAIL = 'epicurewise@gmail.com';

  function openModal(propertyName) {
    modalProperty.textContent = propertyName;
    const subject = encodeURIComponent('Inquiry: ' + propertyName);
    const body = encodeURIComponent(
      'Hi,\n\nI\'m interested in the following property:\n\n' +
      propertyName +
      '\n\nPlease send me more details, photos, and available tour dates.\n\nThank you.'
    );
    modalEmailBtn.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Re-create lucide icons inside modal
    lucide.createIcons();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Attach click handlers to all listing detail buttons
  document.querySelectorAll('[data-inquiry]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.dataset.inquiry);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close on overlay click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

})();
