/* ============================================================
   VIDEO.JS — Sahiba Birthday Keepsake  [Phase 3]
   Responsibilities:
     1. Photo lazy-loading observer for the film strip
     2. Video deferred load (triggered when §04 is active)
     3. Sequential video playback: video-01 → video-02 → advance
     4. Un-mute on first user interaction
     5. Portrait video: blurred background handling
     6. Captions config (Phase 8 will inject real text)
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     1. CAPTIONS CONFIG
     Phase 8: replace each "— —" with real caption strings.
  ────────────────────────────────────────── */

  var CAPTIONS = {
    1:  '— —',
    2:  '— —',
    3:  '— —',
    4:  '— —',
    5:  '— —',
    6:  '— —',
    7:  '— —',
    8:  '— —',
    9:  '— —',
    10: '— —',
    11: '— —',
    12: '— —',
    13: '— —',
    14: '— —',
    15: '— —',
    16: '— —'
  };

  /* Apply captions to DOM on load */
  Object.keys(CAPTIONS).forEach(function (idx) {
    var frames = document.querySelectorAll('.film-frame[data-frame="' + idx + '"]');
    frames.forEach(function (frame) {
      var cap = frame.querySelector('.film-frame-caption');
      if (cap) cap.textContent = CAPTIONS[idx];
    });
  });

  /* ──────────────────────────────────────────
     2. FILM STRIP LAZY LOADING
     Each .film-frame img has data-src instead of src.
     An IntersectionObserver on the horizontal strip
     loads images when they scroll into view.
  ────────────────────────────────────────── */

  var framesRow = document.querySelector('.s04-frames-row');
  var filmPhotos = Array.from(document.querySelectorAll('.film-photo[data-src]'));

  if (filmPhotos.length && framesRow) {

    var stripObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            var src = img.getAttribute('data-src');
            if (src && !img.getAttribute('src')) {
              img.setAttribute('src', src);
              img.removeAttribute('data-src');
            }
            stripObserver.unobserve(img);
          }
        });
      },
      {
        root:       framesRow,        /* scroll root = the strip itself */
        rootMargin: '0px 400px 0px 400px',  /* pre-load 2 frames ahead/behind */
        threshold:  0
      }
    );

    filmPhotos.forEach(function (img) {
      stripObserver.observe(img);
    });

  }

  /* ── Phase 7: Mobile grid lazy loading ─────────────────────
     The mobile grid images use data-src but their root is the
     viewport (the section itself), not a horizontal scroll strip.
  ────────────────────────────────────────── */

  var mobileGridPhotos = Array.from(
    document.querySelectorAll('.s04-mobile-grid img[data-src]')
  );

  if (mobileGridPhotos.length) {
    var mobileGridObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            var src = img.getAttribute('data-src');
            if (src && !img.getAttribute('src')) {
              img.setAttribute('src', src);
              img.removeAttribute('data-src');
            }
            mobileGridObserver.unobserve(img);
          }
        });
      },
      {
        root:       null,      /* viewport */
        rootMargin: '200px',   /* pre-load before fully in view */
        threshold:  0
      }
    );

    mobileGridPhotos.forEach(function (img) {
      mobileGridObserver.observe(img);
    });
  }

  /* ──────────────────────────────────────────
     3. VIDEO ELEMENTS
  ────────────────────────────────────────── */

  var v1     = document.getElementById('video-player-1');
  var v2     = document.getElementById('video-player-2');
  var vBg1   = document.getElementById('video-bg-1');
  var vBg2   = document.getElementById('video-bg-2');

  if (!v1 || !v2) {
    console.warn('[video.js] Video elements not found.');
    return;
  }

  var videosLoaded = false;

  /* ──────────────────────────────────────────
     4. DEFERRED VIDEO LOAD
     Triggered when §04 becomes active — one section
     before the video — so it's ready when §05 enters.
  ────────────────────────────────────────── */

  function loadVideos () {
    if (videosLoaded) return;
    videosLoaded = true;
    console.log('[video.js] Deferred load: triggering video-01 + video-02');
    v1.load();
    v2.load();
    if (vBg1) vBg1.load();
    if (vBg2) vBg2.load();
  }

  /* Listen for scroll.js sectionChange events */
  window.addEventListener('sectionChange', function (e) {
    var sec = e.detail && e.detail.section;
    if (sec === '04') {
      loadVideos();
    }
    if (sec === '05') {
      /* Section 05 entered — start playback sequence */
      startVideoSequence();
    }
    if (sec !== '05') {
      /* Left video section — pause both */
      pauseAll();
    }
  });

  /* ──────────────────────────────────────────
     5. PORTRAIT VIDEO DETECTION & BLURRED BG
     After metadata loads, check aspect ratio.
     If portrait (width < height), activate bg blur.
  ────────────────────────────────────────── */

  function checkPortrait (videoEl, bgEl) {
    if (!bgEl) return;
    var w = videoEl.videoWidth;
    var h = videoEl.videoHeight;
    if (w > 0 && h > 0 && w < h) {
      bgEl.classList.add('video-bg-active');
      console.log('[video.js] Portrait video detected — blur BG active:', videoEl.id);
    }
  }

  v1.addEventListener('loadedmetadata', function () { checkPortrait(v1, vBg1); });
  v2.addEventListener('loadedmetadata', function () { checkPortrait(v2, vBg2); });

  /* ──────────────────────────────────────────
     6. SEQUENTIAL PLAYBACK
     video-01 plays → ends → video-02 plays → ends → advance.
     Phase 4 will slot film burn transitions around this.
  ────────────────────────────────────────── */

  var sequenceStarted = false;
  var activeVideoIndex = 1;

  function updatePagination (idx) {
    var dots = document.querySelectorAll('.video-dot');
    dots.forEach(function (dot, dIdx) {
      if (dIdx + 1 === idx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function startVideoSequence () {
    if (sequenceStarted) return;
    sequenceStarted = true;

    /* Show video-1 */
    activeVideoIndex = 1;
    showVideo(v1, vBg1);
    updatePagination(1);

    /* Attempt autoplay */
    var playPromise = v1.play();
    if (playPromise !== undefined) {
      playPromise.then(function () {
        var c = document.getElementById('video-container');
        if (c) c.classList.add('video-playing');
      }).catch(function (err) {
        console.warn('[video.js] Autoplay blocked or media missing for video-01:', err.message);
        /* Phase 4: show play button overlay if blocked */
      });
    }
  }

  /* Tap-to-Toggle Click Listener */
  var container = document.getElementById('video-container');
  if (container) {
    container.style.cursor = 'pointer';
    container.addEventListener('click', function () {
      if (activeVideoIndex === 1) {
        activeVideoIndex = 2;
        hideVideo(v1, vBg1);
        showVideo(v2, vBg2);
        updatePagination(2);
        var playPromise = v2.play();
        if (playPromise !== undefined) {
          playPromise.then(function () {
            container.classList.add('video-playing');
          }).catch(function (err) {
            console.warn('[video.js] Autoplay blocked or media missing for video-02:', err.message);
          });
        }
      } else {
        activeVideoIndex = 1;
        hideVideo(v2, vBg2);
        showVideo(v1, vBg1);
        updatePagination(1);
        var playPromise = v1.play();
        if (playPromise !== undefined) {
          playPromise.then(function () {
            container.classList.add('video-playing');
          }).catch(function (err) {
            console.warn('[video.js] Autoplay blocked or media missing for video-01:', err.message);
          });
        }
      }
    });
  }

  /* video-01 ends → start video-02 (kept as fallback in case loop is off) */
  v1.addEventListener('ended', function () {
    if (v1.hasAttribute('loop')) return; // ignore if looping
    activeVideoIndex = 2;
    hideVideo(v1, vBg1);
    showVideo(v2, vBg2);

    var playPromise = v2.play();
    if (playPromise !== undefined) {
      playPromise.catch(function (err) {
        console.warn('[video.js] Autoplay blocked for video-02:', err.message);
      });
    }
  });

  /* video-02 ends → advance site to §06 (kept as fallback in case loop is off) */
  v2.addEventListener('ended', function () {
    if (v2.hasAttribute('loop')) return; // ignore if looping
    hideVideo(v2, vBg2);
    advanceToSection06();
  });

  /* ──────────────────────────────────────────
     SHOW / HIDE HELPERS
  ────────────────────────────────────────── */

  function showVideo (videoEl, bgEl) {
    videoEl.classList.add('video-active');
    if (bgEl) bgEl.classList.add('video-bg-active');
    /* Sync bg video */
    if (bgEl) {
      bgEl.currentTime = videoEl.currentTime;
      bgEl.play().then(function () {
        var c = document.getElementById('video-container');
        if (c) c.classList.add('video-playing');
      }).catch(function () {});
    }
  }

  function hideVideo (videoEl, bgEl) {
    videoEl.classList.remove('video-active');
    if (bgEl) bgEl.classList.remove('video-bg-active');
    videoEl.pause();
    if (bgEl) bgEl.pause();
  }

  function pauseAll () {
    /* Called when leaving §05 — stop playback */
    if (sequenceStarted) {
      v1.pause();
      v2.pause();
      if (vBg1) vBg1.pause();
      if (vBg2) vBg2.pause();
      /* Reset for re-entry */
      sequenceStarted = false;
      activeVideoIndex = 1;
      v1.currentTime = 0;
      v2.currentTime = 0;
      hideVideo(v1, vBg1);
      hideVideo(v2, vBg2);
      updatePagination(1);

      /* Reset placeholder card */
      var c = document.getElementById('video-container');
      if (c) c.classList.remove('video-playing');
    }
  }

  /* ──────────────────────────────────────────
     ADVANCE TO SECTION 06
  ────────────────────────────────────────── */

  function advanceToSection06 () {
    var scrollContainer = document.getElementById('site-scroll');
    if (!scrollContainer) return;

    var sec06 = document.getElementById('section-06');
    if (sec06) {
      scrollContainer.scrollTo({
        top:      sec06.offsetTop,
        behavior: 'smooth'
      });
    } else {
      /* Fallback: scroll by one viewport height */
      scrollContainer.scrollBy({
        top:      window.innerHeight,
        behavior: 'smooth'
      });
    }
  }

  /* ──────────────────────────────────────────
     7. UN-MUTE ON FIRST USER INTERACTION
     Videos start muted for autoplay.
     After any click/touch, attempt to un-mute.
  ────────────────────────────────────────── */

  var unmuted = false;

  function tryUnmute () {
    if (unmuted) return;
    unmuted = true;
    [v1, v2].forEach(function (vid) {
      try {
        vid.muted = false;
      } catch (e) {
        console.warn('[video.js] Could not un-mute:', e);
      }
    });
    console.log('[video.js] Videos un-muted after user interaction.');
    /* Clean up listeners */
    document.removeEventListener('click',     tryUnmute);
    document.removeEventListener('touchstart', tryUnmute);
    document.removeEventListener('keydown',   tryUnmute);
  }

  document.addEventListener('click',      tryUnmute, { once: true, passive: true });
  document.addEventListener('touchstart', tryUnmute, { once: true, passive: true });
  document.addEventListener('keydown',    tryUnmute, { once: true, passive: true });

  /* ──────────────────────────────────────────
     EXPOSE API FOR DEBUGGING / PHASE 4 HOOKS
  ────────────────────────────────────────── */

  window.sahibaVideo = {
    /* Phase 4 will hook into these */
    startSequence:  startVideoSequence,
    pauseAll:       pauseAll,
    advanceTo06:    advanceToSection06,
    getV1:          function () { return v1; },
    getV2:          function () { return v2; },
    CAPTIONS:       CAPTIONS
  };

  console.log('[video.js] Phase 3 initialised.');

})();
