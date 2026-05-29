/* ============================================================
   CURSOR.JS — Sahiba Birthday Keepsake  [Phase 6 refined]
   Custom dual-element cursor system.
   Dot: instantaneous. Ring: lerp-lagged via rAF loop.
   ============================================================ */

(function () {
  'use strict';

  /* ── Phase 7: Touch device detection ─────────────────────
     On touch-only devices (iOS, Android), hide the custom cursor
     elements completely and restore native cursor behaviour.
     This MUST run before anything else.
  ────────────────────────────────────────────────────────── */

  const isTouchDevice = (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );

  if (isTouchDevice) {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (dot)  dot.style.display  = 'none';
    if (ring) ring.style.display = 'none';

    /* Restore default cursor for touch users */
    var styleEl = document.createElement('style');
    styleEl.textContent = '* { cursor: auto !important; }';
    document.head.appendChild(styleEl);

    /* Expose a no-op setCursorType for scroll.js to safely call */
    window.setCursorType = function () {};
    return; /* bail out — no cursor logic needed */
  }

  /* ──────────────────────────────────────────
     SVG ICON DEFINITIONS  — Phase 6 final
     12×12 minimal silhouettes — fill="currentColor"
     All colour via CSS var(--deep-antique-rose).
  ────────────────────────────────────────── */

  const ICONS = {

    /* ROSE cursor: 5-petal silhouette (Sections 03, 08, 11) */
    rose: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <ellipse cx="6" cy="2.5" rx="1.8" ry="2.6"/>
      <ellipse cx="6" cy="2.5" rx="1.8" ry="2.6" transform="rotate(72 6 6)"/>
      <ellipse cx="6" cy="2.5" rx="1.8" ry="2.6" transform="rotate(144 6 6)"/>
      <ellipse cx="6" cy="2.5" rx="1.8" ry="2.6" transform="rotate(216 6 6)"/>
      <ellipse cx="6" cy="2.5" rx="1.8" ry="2.6" transform="rotate(288 6 6)"/>
      <circle cx="6" cy="6" r="1.5"/>
    </svg>`,

    /* CAMERA cursor: body + viewfinder bump + lens ring (Section 06) */
    camera: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="1" y="4.5" width="10" height="6.5" rx="1.2" fill="currentColor"/>
      <rect x="2.5" y="2.5" width="3" height="2" rx="0.7" fill="currentColor"/>
      <circle cx="6.2" cy="7.8" r="2.1" fill="none" stroke="#FAF3E8" stroke-width="0.8"/>
      <circle cx="6.2" cy="7.8" r="1" fill="#FAF3E8"/>
      <circle cx="9.8" cy="5.4" r="0.55" fill="#CC2222"/>
    </svg>`,

    /* QUILL cursor: 45° feather with inner vein + nib (Section 09) */
    quill: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M 10,1.2 C 11,1 8.5,4 5.5,7 L 2.5,10.5 L 2,11.5 L 3,11 L 6,8 C 9,5 11.2,1.8 10,1.2 Z" fill="currentColor"/>
      <line x1="9.2" y1="2.2" x2="2.8" y2="11" stroke="rgba(250,243,232,0.38)" stroke-width="0.5" stroke-linecap="round"/>
      <line x1="2" y1="11.5" x2="0.8" y2="12" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    </svg>`,

    /* FILM cursor: film frame with 4 rounded sprocket holes (Section 04) */
    film: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <rect x="1.5" y="2" width="9" height="8" rx="0.8"/>
      <rect x="0.2" y="3.4" width="2.3" height="1.9" rx="0.45" fill="#1A1014"/>
      <rect x="0.2" y="6.7" width="2.3" height="1.9" rx="0.45" fill="#1A1014"/>
      <rect x="9.5" y="3.4" width="2.3" height="1.9" rx="0.45" fill="#1A1014"/>
      <rect x="9.5" y="6.7" width="2.3" height="1.9" rx="0.45" fill="#1A1014"/>
      <rect x="3"   y="3.2" width="6"   height="5.6" rx="0.5"  fill="#1A1014"/>
    </svg>`,

    /* VINYL cursor: disc + groove ring + label + centre dot (Section 07) */
    vinyl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="6" r="5.5"/>
      <circle cx="6" cy="6" r="3.8" fill="none" stroke="#1A1014" stroke-width="0.7"/>
      <circle cx="6" cy="6" r="2.2" fill="#1A1014"/>
      <circle cx="6" cy="6" r="0.72" fill="currentColor"/>
    </svg>`,

  };

  /* ──────────────────────────────────────────
     ELEMENT REFERENCES
  ────────────────────────────────────────── */

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  /* ──────────────────────────────────────────
     MOUSE STATE
  ────────────────────────────────────────── */

  let mouseX  = -100;
  let mouseY  = -100;
  let ringX   = -100;
  let ringY   = -100;
  let rafId   = null;

  /* ──────────────────────────────────────────
     MOVE DOT INSTANTLY
  ────────────────────────────────────────── */

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    /* Dot follows exactly */
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  /* ──────────────────────────────────────────
     RING LERP LOOP — 400ms feel via 0.08 lerp factor
  ────────────────────────────────────────── */

  function lerpRing () {
    /* Linear interpolation: ring chases mouse at ~8% per frame */
    ringX += (mouseX - ringX) * 0.08;
    ringY += (mouseY - ringY) * 0.08;

    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    rafId = requestAnimationFrame(lerpRing);
  }

  lerpRing();

  /* ──────────────────────────────────────────
     CLICK PULSE — dot shrinks to 0.6× for 150ms
  ────────────────────────────────────────── */

  document.addEventListener('mousedown', function () {
    dot.classList.add('is-clicking');
  });

  document.addEventListener('mouseup', function () {
    setTimeout(function () {
      dot.classList.remove('is-clicking');
    }, 150);
  });

  /* ──────────────────────────────────────────
     INTERACTIVE HOVER — ring scale ×2
  ────────────────────────────────────────── */

  function onEnterInteractive () {
    ring.classList.add('is-hovering');
  }

  function onLeaveInteractive () {
    ring.classList.remove('is-hovering');
  }

  /* Delegate: watch all interactive elements */
  document.addEventListener('mouseover', function (e) {
    const target = e.target.closest('button, a, .interactive, [role="button"]');
    if (target) {
      onEnterInteractive();
    }
  });

  document.addEventListener('mouseout', function (e) {
    const target = e.target.closest('button, a, .interactive, [role="button"]');
    if (target) {
      onLeaveInteractive();
    }
  });

  /* ──────────────────────────────────────────
     CURSOR TYPE SWITCHER
     Called from scroll.js via window event or directly.
     Phase 6: 200ms crossfade between icon states.
  ────────────────────────────────────────── */

  function setCursorType (type) {
    /* Update data attributes for CSS hooks */
    dot.setAttribute('data-cursor-type', type);
    ring.setAttribute('data-cursor-type', type);

    if (type === 'default') {
      /* Crossfade out icon → plain dot */
      dot.style.opacity = '0';
      setTimeout(function () {
        dot.classList.remove('has-icon');
        dot.innerHTML = '';
        dot.style.opacity = '1';
      }, 100);
    } else if (ICONS[type]) {
      /* Crossfade out → swap icon → fade in */
      dot.style.opacity = '0';
      setTimeout(function () {
        dot.classList.add('has-icon');
        dot.innerHTML = ICONS[type];
        dot.style.opacity = '1';
      }, 100);
    } else {
      /* Unknown type — fall back to default */
      dot.classList.remove('has-icon');
      dot.innerHTML = '';
    }
  }

  /* Add transition to dot */
  dot.style.transition = 'opacity 100ms ease';

  /* Expose globally for scroll.js */
  window.setCursorType = setCursorType;

  /* ──────────────────────────────────────────
     LISTEN FOR SECTION CHANGE EVENT
     Dispatched by scroll.js
  ────────────────────────────────────────── */

  window.addEventListener('sectionChange', function (e) {
    const section = document.getElementById('section-' + e.detail.section);
    if (!section) return;

    const cursorType = section.getAttribute('data-cursor') || 'default';
    setCursorType(cursorType);
  });

  /* ──────────────────────────────────────────
     HIDE CURSOR WHEN MOUSE LEAVES WINDOW
  ────────────────────────────────────────── */

  document.addEventListener('mouseleave', function () {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', function () {
    dot.style.opacity  = '1';
    ring.style.opacity = '0.5';
  });

})();
