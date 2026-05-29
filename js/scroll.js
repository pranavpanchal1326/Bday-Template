/* ============================================================
   SCROLL.JS — Sahiba Birthday Keepsake
   Intersection Observer for scroll-snap sections.
   Manages active state, body classes, cursor type, events.
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     COLLECT ALL SECTIONS
  ────────────────────────────────────────── */

  const sections = Array.from(
    document.querySelectorAll('#site-scroll > section[data-section]')
  );

  if (!sections.length) {
    console.warn('[scroll.js] No sections found.');
    return;
  }

  /* ──────────────────────────────────────────
     CURRENT ACTIVE SECTION TRACKING
  ────────────────────────────────────────── */

  let currentSection = null;

  /* ──────────────────────────────────────────
     ACTIVATE A SECTION
     - Sets data-active="true" on section
     - Removes data-active from all others
     - Swaps body class to "section-{nn}-active"
     - Dispatches sectionChange custom event
  ────────────────────────────────────────── */

  function activateSection (section) {
    if (section === currentSection) return;
    currentSection = section;

    const sectionNum = section.getAttribute('data-section');

    /* 1. Update data-active on all sections */
    sections.forEach(function (s) {
      if (s === section) {
        s.setAttribute('data-active', 'true');
      } else {
        s.removeAttribute('data-active');
      }
    });

    /* 2. Swap body class */
    const body = document.body;

    /* Remove any previous section-XX-active class */
    const oldClass = Array.from(body.classList).find(function (cls) {
      return /^section-\d{2}-active$/.test(cls);
    });
    if (oldClass) body.classList.remove(oldClass);

    /* Add new active class */
    body.classList.add('section-' + sectionNum + '-active');

    /* 3. Update cursor system */
    const cursorType = section.getAttribute('data-cursor') || 'default';
    if (typeof window.setCursorType === 'function') {
      window.setCursorType(cursorType);
    }

    /* 4. Dispatch sectionChange event
         video.js listens to this for:
         - §04 → deferred video load (preload="none" → .load())
         - §05 → start video playback sequence
         - leaving §05 → pause/reset
    */
    const event = new CustomEvent('sectionChange', {
      detail: { section: sectionNum },
      bubbles: false,
      cancelable: false,
    });
    window.dispatchEvent(event);

    /* 5. Debug log (remove in production) */
    console.log('[scroll.js] Section active: §' + sectionNum, '| cursor: ' + cursorType);
  }

  /* ──────────────────────────────────────────
     INTERSECTION OBSERVER
     Fires when a section is ≥50% in view
  ────────────────────────────────────────── */

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activateSection(entry.target);
        }
      });
    },
    {
      root:       document.getElementById('site-scroll'),
      rootMargin: '0px',
      threshold:  0.5,
    }
  );

  /* Observe every section */
  sections.forEach(function (section) {
    observer.observe(section);
  });

  /* ──────────────────────────────────────────
     INITIALISE — activate first section on load
  ────────────────────────────────────────── */

  if (sections.length > 0) {
    activateSection(sections[0]);
  }

  /* ──────────────────────────────────────────
     EXPOSE API FOR FUTURE PHASES
     Other modules can call window.scrollTo(sectionId)
  ────────────────────────────────────────── */

  window.sahibaScroll = {
    goTo: function (sectionId) {
      const target = document.getElementById(sectionId);
      if (!target) return;
      const scrollContainer = document.getElementById('site-scroll');
      scrollContainer.scrollTo({
        top:      target.offsetTop,
        behavior: 'smooth',
      });
    },
    getCurrent: function () {
      return currentSection
        ? currentSection.getAttribute('data-section')
        : null;
    },
  };

})();
