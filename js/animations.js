/* ============================================================
   ANIMATIONS.JS — Sahiba Birthday Keepsake  [Phase 4]
   Depends on: GSAP 3.12.2 (loaded before this script)
   All animations play once (tracked with played Set).
   prefers-reduced-motion: motion replaced with opacity fades.
   ============================================================ */

(function () {
  'use strict';

  /* ── Wait for GSAP ───────────────────────────────────────── */
  if (typeof gsap === 'undefined') {
    console.error('[animations.js] GSAP not loaded.');
    return;
  }

  gsap.registerPlugin(MotionPathPlugin);

  /* ── prefers-reduced-motion ──────────────────────────────── */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Once-only guard ─────────────────────────────────────── */
  var played = new Set();

  function once(key, fn) {
    if (played.has(key)) return;
    played.add(key);
    fn();
  }

  /* ── Helpers ─────────────────────────────────────────────── */
  var scrollContainer = document.getElementById('site-scroll');

  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (!el || !scrollContainer) return;
    scrollContainer.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  }

  function safeSet(sel, props) {
    var els = document.querySelectorAll(sel);
    if (els.length) gsap.set(els, props);
  }

  /* ============================================================
     §01 — FILM COUNTDOWN
     Numbers 10 → 1 with flicker, over-exposure flash.
     Plays once on page load (not on sectionChange).
  ============================================================ */

  var numberEl  = document.getElementById('countdown-number');
  var flashEl   = document.getElementById('countdown-flash');

  function runCountdown() {
    if (!numberEl || !flashEl) return;

    var count = 10;

    function showNumber() {
      if (count < 1) return;
      numberEl.textContent = count;

      if (reducedMotion) {
        /* Reduced: just swap numbers, no flash */
        gsap.to(numberEl, { opacity: 1, duration: 0 });
        setTimeout(function () {
          count--;
          if (count >= 1) showNumber();
          else endCountdown();
        }, 800);
        return;
      }

      /* Flicker */
      var flickerTl = gsap.timeline({
        onComplete: function () {
          /* Over-exposure flash between numbers */
          gsap.timeline({
            onComplete: function () {
              count--;
              if (count >= 1) {
                showNumber();
              } else {
                endCountdown();
              }
            }
          })
            .to(flashEl, { opacity: 0.7, duration: 0.08, ease: 'none' })
            .to(flashEl, { opacity: 0,   duration: 0.08, ease: 'none' });
        }
      });

      var flickerCount = Math.floor(Math.random() * 2) + 1;
      flickerTl
        .to(numberEl, { opacity: 0.82, duration: 0.06, ease: 'none' })
        .to(numberEl, { opacity: 1,    duration: 0.06, ease: 'none' });

      if (flickerCount > 1) {
        flickerTl
          .to(numberEl, { opacity: 0.75, duration: 0.05, ease: 'none' })
          .to(numberEl, { opacity: 1,    duration: 0.05, ease: 'none' });
      }

      flickerTl.to({}, { duration: 0.8 }); /* hold */
    }

    function endCountdown() {
      /* Number 1: hold 1s, then sustained white flash, then scroll to §02 */
      if (reducedMotion) {
        setTimeout(function () { scrollToSection('section-02'); }, 1000);
        return;
      }
      gsap.timeline()
        .to({}, { duration: 1 })
        .add(function () {
          /* SOUND: stop projector reel exactly before flash */
          if (window.sahibaSound) window.sahibaSound.stopProjectorForFlash();
        })
        .to(flashEl, { opacity: 1, duration: 0.4, ease: 'power2.in' })
        .to({}, { duration: 0.6 })
        .add(function () { scrollToSection('section-02'); })
        .to(flashEl, { opacity: 0, duration: 2, ease: 'power1.out' });
    }

    showNumber();
  }

  /* Start countdown immediately on load */
  window.addEventListener('DOMContentLoaded', function () {
    once('section-01', runCountdown);
  });
  /* Fallback if DOMContentLoaded already fired */
  if (document.readyState !== 'loading') {
    once('section-01', runCountdown);
  }

  /* ============================================================
     §02 — TITLE REVEAL
     Lines blur-fade in, sprig draws, then auto-advance to §03.
  ============================================================ */

  /* Set initial hidden state immediately */
  safeSet('#line-1, #line-2, #line-3', { opacity: 0, filter: 'blur(8px)' });

  function animSection02() {
    var tl = gsap.timeline();

    if (reducedMotion) {
      tl.to('#line-1', { opacity: 1, duration: 0.6, delay: 0.3 })
        .to('#line-2', { opacity: 1, duration: 0.6 }, '+=0.4')
        .to('#line-3', { opacity: 1, duration: 0.6 }, '+=0.4')
        .add(function () { drawS02Sprig(); });
      return;
    }

    tl.to('#line-1', {
        opacity: 1, filter: 'blur(0px)',
        duration: 1.4, ease: 'power4.out', delay: 0.5
      })
      .to('#line-2', {
        opacity: 1, filter: 'blur(0px)',
        duration: 1.4, ease: 'power4.out'
      }, '1.8')
      .to('#line-3', {
        opacity: 1, filter: 'blur(0px)',
        scale: 1, duration: 1.4, ease: 'power4.out'
      }, '3.0')
      .set('#line-3', { scale: 0.98 }, '3.0')
      .add(function () { drawS02Sprig(); }, '5.5');

    /* Auto-advance after reveal */
    tl.add(function () {
      setTimeout(function () { scrollToSection('section-03'); }, 3000);
    }, '+=3.5');
  }

  function drawS02Sprig() {
    var paths = document.querySelectorAll('.s02-sprig-wrap path');
    paths.forEach(function (path) {
      var len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power1.inOut'
      });
    });
  }

  /* ============================================================
     §03 — BOUQUET BLOOM
     Stems, leaves, roses, baby's breath, petals, ribbon.
  ============================================================ */

  /* Initial hidden states for §03 */
  safeSet('.s03-bouquet-svg', { opacity: 0 });
  safeSet('.s03-quote', { opacity: 0 });

  function animSection03() {
    var svg = document.querySelector('.s03-bouquet-svg');
    if (!svg) return;

    gsap.set(svg, { opacity: 1 });

    if (reducedMotion) {
      gsap.to(svg,        { opacity: 1, duration: 1 });
      gsap.to('.s03-quote', { opacity: 1, duration: 0.8, delay: 1.5 });
      return;
    }

    var tl = gsap.timeline();

    /* t=0 — STEMS GROW */
    tl.from('#bouquet-stems path', {
      scaleY: 0,
      transformOrigin: 'bottom center',
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out'
    });

    /* t=1.0 — LEAVES UNFURL */
    tl.from('#bouquet-leaves ellipse', {
      scale: 0,
      opacity: 0,
      transformOrigin: 'bottom left',
      duration: 0.5,
      stagger: 0.08,
      ease: 'back.out(1.6)'
    }, '1.0');

    /* t=1.8 — ROSES OPEN */
    var roseGroups = ['#rose-1', '#rose-2', '#rose-3', '#rose-4', '#rose-5'];
    roseGroups.forEach(function (id, i) {
      var delay = 1.8 + i * 0.3;
      tl.from(id + ' ellipse:not(.petal-inner)', {
        rotation: 45,
        scale: 0.3,
        transformOrigin: 'bottom center',
        opacity: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: 'power3.out'
      }, delay);
      tl.from(id + ' circle', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, delay + 0.4);
    });

    /* t=3.2 — BABY'S BREATH */
    tl.from('#bouquet-babysbreath circle', {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      stagger: 0.025,
      ease: 'back.out(2)'
    }, '3.2');

    /* t=3.8 — FALLEN PETALS */
    tl.from('#bouquet-stems ~ ellipse', {
      y: -120,
      rotation: 0,
      opacity: 0,
      duration: 1.4,
      stagger: 0.3,
      ease: 'power1.in'
    }, '3.8');

    /* t=4.2 — RIBBON */
    tl.from('#bouquet-ribbon path, #bouquet-ribbon ellipse', {
      opacity: 0,
      scale: 0,
      transformOrigin: 'center center',
      duration: 0.6,
      stagger: 0.08,
      ease: 'back.out(1.5)'
    }, '4.2');

    /* BREATHING — infinite after bloom */
    tl.add(function () {
      gsap.to('.s03-bouquet-svg', {
        scale: 1.006,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
    }, '4.8');

    /* QUOTE */
    tl.to('.s03-quote', { opacity: 1, duration: 0.8, ease: 'power3.out' }, '4.5');
  }

  /* ============================================================
     §04 — FILM STRIP AUTO-SCROLL + ACTIVE FRAME SATURATION
  ============================================================ */

  var filmTrack    = document.querySelector('.s04-frames-row');
  var spotlight    = document.getElementById('strip-spotlight');
  var stripPos     = 0;
  var stripScroll  = true;
  var stripRafId   = null;
  var stripRunning = false;

  function updateActiveFrame() {
    if (!filmTrack) return;
    var frames = filmTrack.querySelectorAll('.film-frame');
    var trackRect = filmTrack.getBoundingClientRect();
    var centreX = trackRect.left + trackRect.width / 2;
    var best = null;
    var bestDist = Infinity;

    frames.forEach(function (frame) {
      var r = frame.getBoundingClientRect();
      var frameCentre = r.left + r.width / 2;
      var dist = Math.abs(frameCentre - centreX);
      if (dist < bestDist) {
        bestDist = dist;
        best = frame;
      }
    });

    var prevActive = filmTrack.querySelector('.film-frame--active');
    frames.forEach(function (f) { f.classList.remove('film-frame--active'); });
    if (best) {
      best.classList.add('film-frame--active');
      /* SOUND: tick every 3rd frame change */
      if (prevActive && prevActive !== best) {
        if (window.sahibaSound) window.sahibaSound.onFilmFrameAdvanced();
      }
      /* Phase 6: Pressed flower breathing */
      if (prevActive && prevActive !== best) {
        /* Stop old breathing if it was a flower */
        if (prevActive.classList.contains('pressed-flower-frame')) {
          gsap.killTweensOf(prevActive);
          gsap.set(prevActive, { scale: 1, rotation: 0 });
        }
        /* Start breathing if new active is a flower */
        if (best.classList.contains('pressed-flower-frame')) {
          gsap.to(best, {
            scale: 1.015,
            rotation: 0.5,
            duration: 3,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            transformOrigin: 'center center'
          });
        }
      }
      /* Move spotlight */
      if (spotlight) {
        var r = best.getBoundingClientRect();
        var trackR = filmTrack.getBoundingClientRect();
        spotlight.style.left = (r.left - trackR.left + r.width / 2 - 100) + 'px';
      }
    }
  }

  function animateStrip() {
    if (stripScroll) {
      stripPos += 0.6;
      filmTrack.scrollLeft = stripPos;
      if (stripPos >= filmTrack.scrollWidth - filmTrack.clientWidth - 1) {
        stripPos = 0;
      }
    }
    updateActiveFrame();
    /* §04 ribbon parallax: ribbon shifts 10% of scroll position */
    var ribbonStrip = document.getElementById('ribbon-strip');
    if (ribbonStrip) {
      gsap.set(ribbonStrip, { x: filmTrack.scrollLeft * 0.1 });
    }
    stripRafId = requestAnimationFrame(animateStrip);
  }

  function startFilmStrip() {
    if (stripRunning || !filmTrack) return;
    stripRunning = true;
    filmTrack.addEventListener('click', function () {
      stripScroll = !stripScroll;
    });
    animateStrip();
  }

  function stopFilmStrip() {
    if (stripRafId) {
      cancelAnimationFrame(stripRafId);
      stripRafId = null;
      stripRunning = false;
    }
  }

  /* ============================================================
     §05 — FILM BURN TRANSITIONS
     Hooks into video.js via window.sahibaVideo API.
  ============================================================ */

  function playFilmBurnEntry(onComplete) {
    if (reducedMotion) { if (onComplete) onComplete(); return; }
    gsap.timeline({ onComplete: onComplete })
      .set('#film-burn-entry', { opacity: 1, x: '-100%' })
      .to('#film-burn-entry', { x: '0%', duration: 0.5, ease: 'power2.in' })
      .to('#film-burn-entry', {
        x: '100%', duration: 0.4, ease: 'power2.out',
        onComplete: function () { gsap.set('#film-burn-entry', { opacity: 0 }); }
      });
  }

  function playFilmBurnExit(onComplete) {
    if (reducedMotion) { if (onComplete) onComplete(); return; }
    gsap.timeline({ onComplete: onComplete })
      .set('#film-burn-exit', { opacity: 1, x: '100%' })
      .to('#film-burn-exit', { x: '0%', duration: 0.5, ease: 'power2.in' })
      .to('#film-burn-exit', {
        x: '-100%', duration: 0.4, ease: 'power2.out',
        onComplete: function () { gsap.set('#film-burn-exit', { opacity: 0 }); }
      });
  }

  /* Expose for video.js to call */
  window.sahibaFilmBurn = {
    entry: playFilmBurnEntry,
    exit:  playFilmBurnExit
  };

  function animSection05() {
    /* Integrate with video.js */
    playFilmBurnEntry(function () {
      if (window.sahibaVideo && window.sahibaVideo.startSequence) {
        window.sahibaVideo.startSequence();
      }
    });

    /* Override video.js advance: play exit burn first */
    if (window.sahibaVideo) {
      var origAdvance = window.sahibaVideo.advanceTo06;
      window.sahibaVideo.advanceTo06 = function () {
        playFilmBurnExit(function () {
          origAdvance && origAdvance();
        });
      };
    }
  }

  /* ============================================================
     §06 — CAMERA ANIMATION SEQUENCE
  ============================================================ */

  /* Initial states */
  safeSet('.s06-camera-svg', { opacity: 0, y: 20 });
  for (var k = 1; k <= 4; k++) {
    safeSet('#polaroid-card-' + k, { opacity: 0, x: -272, y: 95, rotation: 0, scale: 0.1 });
    safeSet('#polaroid-caption-' + k, { opacity: 0 });
    safeSet('#polaroid-develop-' + k, { clipPath: 'inset(0% 0% 0% 0%)' });
  }
  safeSet('#camera-section-quote', { opacity: 0, y: 15 });

  function animSection06() {
    var tl = gsap.timeline({ delay: 1 });

    if (reducedMotion) {
      tl.to('.s06-camera-svg', { opacity: 1, duration: 0.8 });
      for (var i = 1; i <= 4; i++) {
        var xVal = (i === 1 ? -40 : i === 2 ? 80 : i === 3 ? 0 : 120);
        var yVal = (i === 1 ? -120 : i === 2 ? -40 : i === 3 ? 140 : 80);
        var rotVal = (i === 1 ? -12 : i === 2 ? 8 : i === 3 ? -5 : 10);
        tl.to('#polaroid-card-' + i, { opacity: 1, x: xVal, y: yVal, rotation: rotVal, scale: 1, duration: 0.4 }, '<+=0.1')
          .to('#polaroid-develop-' + i, { opacity: 0, duration: 0.4 }, '<')
          .to('#polaroid-caption-' + i, { opacity: 1, duration: 0.3 }, '<');
      }
      tl.to('#camera-section-quote', { opacity: 1, y: 0, duration: 0.5 });
      return;
    }

    /* STEP 1 — Camera fades in */
    tl.to('.s06-camera-svg', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' });

    /* STEP 2 — Pause */
    tl.to({}, { duration: 0.8 });

    /* STEP 3 — Aperture opens */
    tl.to('#iris-blade-1, #iris-blade-3, #iris-blade-5', {
        rotation: 60,
        transformOrigin: 'bottom center',
        duration: 0.6,
        ease: 'power2.inOut',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.cameraIrisOpen();
        }
      })
      .to('#iris-blade-2, #iris-blade-4, #iris-blade-6', {
        rotation: -60,
        transformOrigin: 'bottom center',
        duration: 0.6,
        ease: 'power2.inOut'
      }, '<')
      .to('#lens-aperture', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '<');

    /* CLICK 1 — PHOTO 1 */
    tl.to('#camera-section-flash', {
        opacity: 1, duration: 0.04, ease: 'none',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.cameraShutter();
        }
      })
      .to('#camera-section-flash', { opacity: 0, duration: 0.04, ease: 'none' })
      .to('#polaroid-card-1', {
        opacity: 1,
        x: -50, y: -110, rotation: -12, scale: 1,
        duration: 1.2,
        ease: 'power1.out',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.polaroidEject();
        }
      }, '+=0.1')
      .to('#polaroid-develop-1', {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 2.5,
        ease: 'power1.inOut'
      }, '-=0.2')
      .fromTo('#polaroid-warm-1',
        { opacity: 0.4 },
        { opacity: 0, duration: 2.5, ease: 'power2.out' }, '<')
      .to('#polaroid-caption-1', { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=1.0');

    /* CLICK 2 — PHOTO 2 */
    tl.to('#camera-section-flash', {
        opacity: 1, duration: 0.04, ease: 'none',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.cameraShutter();
        }
      }, '+=1.0')
      .to('#camera-section-flash', { opacity: 0, duration: 0.04, ease: 'none' })
      .to('#polaroid-card-2', {
        opacity: 1,
        x: 90, y: -30, rotation: 6, scale: 1,
        duration: 1.2,
        ease: 'power1.out',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.polaroidEject();
        }
      }, '+=0.1')
      .to('#polaroid-develop-2', {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 2.5,
        ease: 'power1.inOut'
      }, '-=0.2')
      .fromTo('#polaroid-warm-2',
        { opacity: 0.4 },
        { opacity: 0, duration: 2.5, ease: 'power2.out' }, '<')
      .to('#polaroid-caption-2', { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=1.0');

    /* CLICK 3 — PHOTO 3 */
    tl.to('#camera-section-flash', {
        opacity: 1, duration: 0.04, ease: 'none',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.cameraShutter();
        }
      }, '+=1.0')
      .to('#camera-section-flash', { opacity: 0, duration: 0.04, ease: 'none' })
      .to('#polaroid-card-3', {
        opacity: 1,
        x: 10, y: 110, rotation: -8, scale: 1,
        duration: 1.2,
        ease: 'power1.out',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.polaroidEject();
        }
      }, '+=0.1')
      .to('#polaroid-develop-3', {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 2.5,
        ease: 'power1.inOut'
      }, '-=0.2')
      .fromTo('#polaroid-warm-3',
        { opacity: 0.4 },
        { opacity: 0, duration: 2.5, ease: 'power2.out' }, '<')
      .to('#polaroid-caption-3', { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=1.0');

    /* CLICK 4 — PHOTO 4 */
    tl.to('#camera-section-flash', {
        opacity: 1, duration: 0.04, ease: 'none',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.cameraShutter();
        }
      }, '+=1.0')
      .to('#camera-section-flash', { opacity: 0, duration: 0.04, ease: 'none' })
      .to('#polaroid-card-4', {
        opacity: 1,
        x: 110, y: 50, rotation: 10, scale: 1,
        duration: 1.2,
        ease: 'power1.out',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.polaroidEject();
        }
      }, '+=0.1')
      .to('#polaroid-develop-4', {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 2.5,
        ease: 'power1.inOut'
      }, '-=0.2')
      .fromTo('#polaroid-warm-4',
        { opacity: 0.4 },
        { opacity: 0, duration: 2.5, ease: 'power2.out' }, '<')
      .to('#polaroid-caption-4', { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=1.0');

    /* STEP 9 — Quote */
    tl.to('#camera-section-quote', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '+=0.5');
  }

  /* ============================================================
     §07 — SPOTIFY WAVEFORMS + LYRICS REVEAL
     Vinyl transition omitted as the inner-scroll restructure
     from the brief would require HTML refactoring; instead we
     animate waveforms and lyrics when §07 is active.
  ============================================================ */

  var waveformTimers = {};

  function animWaveform(waveformId) {
    var bars = document.querySelectorAll('#' + waveformId + ' .s07-bar');
    if (!bars.length) return;

    function pulse() {
      // Find the parent spotify card wrapper
      var card = document.querySelector('#' + waveformId).closest('.spotify-card-wrapper');
      if (!card || !card.classList.contains('playing')) {
        // Flat waveform baseline when not playing
        bars.forEach(function (bar) {
          gsap.to(bar, {
            height: '4px',
            duration: 0.3,
            ease: 'sine.inOut'
          });
        });
        waveformTimers[waveformId] = setTimeout(pulse, 400);
        return;
      }

      bars.forEach(function (bar) {
        var h = 8 + Math.random() * 24;
        gsap.to(bar, {
          height: h + 'px',
          duration: 0.3 + Math.random() * 0.2,
          ease: 'sine.inOut'
        });
      });
      waveformTimers[waveformId] = setTimeout(pulse, 400);
    }
    pulse();
  }

  function stopWaveform(waveformId) {
    clearTimeout(waveformTimers[waveformId]);
  }

  function splitLyricsIntoWords() {
    document.querySelectorAll('.s07-lyrics-text').forEach(function (p) {
      if (p.dataset.split) return;
      p.dataset.split = '1';
      var text = p.textContent;
      var words = text.split(' ');
      p.innerHTML = words.map(function (w) {
        return '<span class="lyric-word" style="display:inline-block;opacity:0;transform:translateY(6px);">' + w + '</span>';
      }).join(' ');
    });
  }

  function animLyrics(container) {
    var words = container.querySelectorAll('.lyric-word');
    if (!words.length) return;
    gsap.to(words, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }

  /* Vinyl record spin between cards (simplified — plays on section entry) */
  var vinylColors = ['#3D1B1B', '#5E4018', '#1E2D30'];

  function spinVinyl(cardIndex, onComplete) {
    if (reducedMotion) { if (onComplete) onComplete(); return; }
    var label = document.getElementById('vinyl-label');
    if (label) label.setAttribute('fill', vinylColors[cardIndex] || '#3A2A4E');

    var vinyl = document.getElementById('vinyl-record');
    if (!vinyl) { if (onComplete) onComplete(); return; }

    gsap.set(vinyl, { x: '100vw', opacity: 0, rotation: 0 });
    var spinTl = gsap.timeline({ onComplete: onComplete });
    spinTl
      .to(vinyl, { x: '0vw', opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to(vinyl, { rotation: '+=1080', duration: 1.5, ease: 'power2.inOut' }, '<')
      .to(vinyl, { opacity: 0, duration: 0.5, delay: 0.2, ease: 'power2.in' });
  }

  function animSection07() {
    splitLyricsIntoWords();

    /* Animate all three card waveforms and lyrics simultaneously */
    animWaveform('waveform-song-1');
    animWaveform('waveform-song-2');
    animWaveform('waveform-song-3');

    /* Animate lyrics in all cards */
    document.querySelectorAll('.s07-lyrics-panel').forEach(function (panel) {
      animLyrics(panel);
    });

    /* Spin vinyl once on entry */
    spinVinyl(0, null);
  }

  function stopSection07() {
    stopWaveform('waveform-song-1');
    stopWaveform('waveform-song-2');
    stopWaveform('waveform-song-3');
  }

  /* ============================================================
     §08 — BOTANICAL MEADOW DRAW-ON
  ============================================================ */

  function animSection08() {
    /* Draw stems */
    var stems = document.querySelectorAll('#section-08 .s08-meadow-wrap path');
    stems.forEach(function (path) {
      var len = path.getTotalLength ? path.getTotalLength() : 100;
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
    });

    gsap.to(stems, {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 1.5,
      stagger: 0.05,
      ease: 'power1.inOut'
    });

    /* Flower heads bloom after stems */
    var flowerHeads = document.querySelectorAll('#section-08 .s08-meadow-wrap g > g');
    gsap.from(flowerHeads, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      stagger: 0.08,
      delay: 0.8,
      ease: 'back.out(1.6)',
      transformOrigin: 'center bottom'
    });

    /* Leaves */
    var leaves = document.querySelectorAll('#section-08 .s08-meadow-wrap ellipse');
    gsap.from(leaves, {
      scale: 0,
      opacity: 0,
      duration: 0.35,
      stagger: 0.04,
      delay: 0.6,
      ease: 'back.out(1.4)',
      transformOrigin: 'center center'
    });
  }

  /* ============================================================
     §09 — ENVELOPE → LETTER REVEAL  (3 Stages)
     Stage A: Envelope visible, wax seal intact. (CSS default)
     Stage B: Click envelope → seal cracks, flap lifts (700ms).
     Stage C: Letter sheet rises from envelope bottom (1.2s).
             Text paragraphs fade in sequentially.
  ============================================================ */

  /* Initial: letter sheet below viewport / hidden */
  safeSet('#letter-salutation, #letter-text-p1, #letter-text-p2, #letter-text-p3, #letter-closing, .s09-signoff, .s09-pressed-rose, .s09-date', {
    opacity: 0, y: 10
  });
  var s09LetterSheet = document.querySelector('.s09-letter-sheet');
  if (s09LetterSheet) gsap.set(s09LetterSheet, { y: 60, opacity: 0 });

  var envelopeStage = 'A';   /* tracks current stage */
  var s09Done       = false;

  function advanceEnvelopeStage() {
    if (s09Done) return;
    var env = document.getElementById('envelope-container');
    if (!env) return;

    if (envelopeStage === 'A') {
      /* Stage B — wax crack */
      envelopeStage = 'B';
      env.classList.add('stage-b');
      if (window.sahibaSound) window.sahibaSound.waxCrack();

      /* 700ms later → stage C */
      setTimeout(function () {
        if (s09Done) return;
        envelopeStage = 'C';
        env.classList.remove('stage-b');
        env.classList.add('stage-c');

        // Add class to body to release scroll-snapping so user can scroll the letter smoothly
        document.body.classList.add('letter-open');

        /* Letter sheet rises */
        if (s09LetterSheet) {
          gsap.to(s09LetterSheet, {
            y: 0, opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            onComplete: revealLetterText
          });
        } else {
          revealLetterText();
        }
        s09Done = true;
      }, 700);

    } else if (envelopeStage === 'B') {
      /* Already cracking — ignore extra clicks */
    }
  }

  function revealLetterText() {
    /* Calculate red thread length */
    var thread = document.getElementById('red-thread');
    var threadPath = thread
      ? (document.getElementById('red-thread-path') || thread.querySelector('path'))
      : null;
    var threadLen = threadPath ? threadPath.getTotalLength() : 480;
    if (threadPath) {
      gsap.set(threadPath, { strokeDasharray: threadLen, strokeDashoffset: threadLen });
    }

    var tl = gsap.timeline({ delay: 0.3 });
    tl.to('.s09-pressed-rose, .s09-date', { opacity: 0.6, duration: 1.0, ease: 'power1.out' })
      .to('#letter-salutation', {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        onStart: function () {
          if (window.sahibaSound) window.sahibaSound.paperRustle();
        }
      }, '<')
      .to({}, { duration: 0.4 })
      .to('#letter-text-p1', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .to('#letter-text-p2', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '+=0.3')
      .to('#letter-text-p3', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '+=0.3')
      .to('#letter-closing', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '+=0.3')
      .to('.s09-signoff', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '+=0.2');

    if (threadPath) {
      tl.to(threadPath, { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut' }, '+=0.5');
    }
  }

  function animSection09() {
    /* Bind click to envelope wrap */
    var envWrap = document.querySelector('.s09-envelope-wrap');
    if (envWrap) {
      envWrap.addEventListener('click', advanceEnvelopeStage, { once: false });
    }
    /* Auto-advance to Stage B after 2s if user hasn't clicked */
    setTimeout(function () {
      if (envelopeStage === 'A') advanceEnvelopeStage();
    }, 2000);
  }


  /* ── §04 strip play button click handler ─────────────────── */
  var playBtn = document.getElementById('strip-play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', function () {
      if (window.stripPaused) {
        /* Resume */
        window.stripPaused = false;
        playBtn.classList.remove('visible');
        if (window.resumeFilmStrip) window.resumeFilmStrip();
      }
    });
  }

  /* Expose play-button show helper for strip.js */
  window.showStripPlayBtn = function () {
    if (playBtn) playBtn.classList.add('visible');
  };
  window.hideStripPlayBtn = function () {
    if (playBtn) playBtn.classList.remove('visible');
  };



  /* Final rest positions for 10 notes */
  var notePositions = [
    { y: 0, rx:  -8, ry:  12, rz: -8  },
    { y: 0, rx:   5, ry: -10, rz:  4  },
    { y: 0, rx: -12, ry:   8, rz: -5  },
    { y: 0, rx:   8, ry: -12, rz:  9  },
    { y: 0, rx:  -5, ry:  10, rz: -12 },
    { y: 0, rx:  10, ry:  -8, rz:  6  },
    { y: 0, rx:  -8, ry:  12, rz: -3  },
    { y: 0, rx:   5, ry:  -5, rz:  11 },
    { y: 0, rx: -10, ry:   8, rz: -7  },
    { y: 0, rx:   8, ry: -12, rz:  3  }
  ];

  /* Initial hidden state */
  safeSet('.s10-note', { opacity: 0 });
  safeSet('#money-headline', { opacity: 0 });

  function animSection10() {
    var notes = document.querySelectorAll('.s10-note');

    /* Entry flash */
    gsap.timeline()
      .to('#section-10-flash', { opacity: 1, duration: 0.03 })
      .to('#section-10-flash', { opacity: 0, duration: 0.03 });

    if (reducedMotion) {
      gsap.to(notes, { opacity: 1, duration: 0.8, stagger: 0.1 });
      gsap.to('#money-headline', { opacity: 1, duration: 0.5, delay: 1 });
      return;
    }

    /* Phase 7: mobile reduces 3D rotation range for performance */
    var isMobile = window.innerWidth < 768;
    var rotMax   = isMobile ? 20 : 45;

    /* Set initial above-viewport position */
    gsap.set(notes, {
      y: -window.innerHeight,
      rotationX: function (i) { return (-rotMax / 2) + Math.random() * rotMax; },
      rotationY: function (i) { return (-rotMax / 2) + Math.random() * rotMax; },
      opacity: 0,
      transformPerspective: 800
    });

    /* Tumble in */
    notes.forEach(function (note, i) {
      var pos = notePositions[i] || notePositions[0];
      gsap.to(note, {
        y: pos.y,
        rotationX: pos.rx,
        rotationY: pos.ry,
        opacity: 1,
        duration: 0.8 + Math.random() * 0.4,
        delay: i * 0.12,
        ease: 'power3.in',
        transformPerspective: 800
      });
    });

    /* Headline stamp impact */
    gsap.fromTo('#money-headline',
      { opacity: 0, scaleY: 1.3, scaleX: 0.9 },
      { opacity: 1, scaleY: 1,   scaleX: 1,
        duration: 0.6, ease: 'back.out(1.6)',
        delay: (notes.length * 0.12) + 0.6
      }
    );
  }

  function exitSection10() {
    /* Notes hover slightly, section fades to parchment */
    var notes = document.querySelectorAll('.s10-note');
    notes.forEach(function (note, i) {
      var pos = notePositions[i] || notePositions[0];
      gsap.to(note, { y: (pos.y || 0) - 20, duration: 0.5, ease: 'power2.out', delay: i * 0.03 });
    });
  }

  /* ============================================================
     §11 — PETAL FALLS
  ============================================================ */

  safeSet('#section11-quote', { opacity: 0 });

  function animSection11() {
    /* Bouquet fades in */
    gsap.from('.s11-bouquet-svg', {
      opacity: 0, y: 20,
      duration: 1, ease: 'power2.out'
    });

    if (reducedMotion) {
      gsap.to('#fallen-petal-single', { opacity: 1, duration: 1, delay: 1 });
      gsap.to('#section11-quote',    { opacity: 1, duration: 0.8, delay: 2 });
      return;
    }

    /* Petal drops */
    gsap.set('#fallen-petal-single', { opacity: 0, y: -120, rotation: 0, x: 0 });
    gsap.set('#petal-shadow',        { opacity: 0 });
    var petalTl = gsap.timeline({ delay: 2 });
    petalTl
      .to('#fallen-petal-single', {
        y: 0,
        x: 12,
        rotation: 15,
        opacity: 1,
        duration: 2.5,
        ease: 'power1.in'
      })
      .to('#fallen-petal-single', {
        x: -4,
        duration: 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1
      }, '<')
      /* Phase 6: petal shadow grows as petal approaches ground */
      .to('#petal-shadow', {
        opacity: 0.12,
        duration: 2.5,
        ease: 'power1.in'
      }, '<');

    /* Quote */
    petalTl.to('#section11-quote', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '+=0.8');
  }

  /* ============================================================
     §12 — CANDLE FLAME + BIRTHDAY TEXT
  ============================================================ */

  /* Initial hidden states */
  safeSet('#birthday-text, #wish-text', { opacity: 0 });
  safeSet('#candle-flame', { opacity: 0, scale: 0 });

  /* Flame physics — irregular living animation */
  function flamePhysics(el) {
    if (!el || !el.isConnected) return;
    var randScaleX = 0.92 + Math.random() * 0.16;
    var randScaleY = 0.96 + Math.random() * 0.12;
    var randX = (Math.random() - 0.5) * 4;
    var randSkew = (Math.random() - 0.5) * 8;
    var duration = 0.15 + Math.random() * 0.1;

    gsap.to(el, {
      scaleX: randScaleX,
      scaleY: randScaleY,
      x: randX,
      skewX: randSkew,
      duration: duration,
      svgOrigin: '55 50',
      ease: 'none',
      onComplete: function () { flamePhysics(el); }
    });

    /* Pulsing ambient glow in sync with the flame's physics */
    var ambientGlow = document.getElementById('s12-ambient-glow');
    if (ambientGlow) {
      gsap.to(ambientGlow, {
        opacity: 0.75 + Math.random() * 0.4,
        scale: 0.96 + Math.random() * 0.08,
        duration: duration,
        ease: 'none'
      });
    }
  }

  var flameStarted = false;

  function animSection12() {
    if (flameStarted) return;
    flameStarted = true;

    var tl = gsap.timeline({ delay: 1.5 });

    if (reducedMotion) {
      tl.to('#candle-flame',   { opacity: 1, scale: 1, duration: 0.5, svgOrigin: '55 50' })
        .to('#s12-ambient-glow', { opacity: 0.9, duration: 1.5 }, '<')
        .to('#birthday-text', { opacity: 1, duration: 1.5 }, '+=0.5')
        .to('#wish-text',     { opacity: 1, duration: 1  }, '+=2');
      return;
    }

    /* STEP 1-3 — Match enters, flame appears */
    tl.from('#match', {
      x: 200, rotation: -45, opacity: 0,
      duration: 0.6, ease: 'power3.out',
      onStart: function () {
        /* SOUND: match strike */
        if (window.sahibaSound) window.sahibaSound.matchStrike();
      }
    });

    /* STEP 3 — Match flame glow */
    tl.to('#match rect', {
      fill: 'rgba(240,160,40,0.9)',
      duration: 0.3,
      ease: 'none'
    });

    /* STEP 4 — Match moves to wick */
    tl.to('#match', {
      x: -30, y: -20,
      duration: 0.8,
      ease: 'power3.inOut'
    });

    /* STEP 6 — Candle flame ignites + ambient room glow fades in */
    tl.to('#candle-flame', {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      svgOrigin: '55 50',
      ease: 'back.out(2)',
      onComplete: function () {
        var flameEl = document.getElementById('candle-flame');
        if (flameEl) flamePhysics(flameEl);
      }
    });
    tl.to('#s12-ambient-glow', {
      opacity: 1,
      duration: 1.5,
      ease: 'power3.out'
    }, '<');

    /* STEP 7 — Match extinguishes */
    tl.to('#match rect', { fill: '#2A1A0A', duration: 0.2, ease: 'none' })
      .to('#match',      { opacity: 0.4, duration: 0.5, ease: 'power1.out' }, '<');

    /* Phase 6: Smoke curl draw-on from match head */
    var smokeEl = document.getElementById('match-smoke');
    if (smokeEl) {
      var smokeLen = smokeEl.getTotalLength ? smokeEl.getTotalLength() : 50;
      gsap.set(smokeEl, { strokeDasharray: smokeLen, strokeDashoffset: smokeLen, opacity: 0 });
      tl.to(smokeEl, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power1.out'
      })
      .to(smokeEl, {
        y: -20,
        opacity: 0,
        duration: 1.0,
        ease: 'power1.out'
      }, '<0.4');
    }

    /* STEP 8 — Birthday text */
    tl.to('#birthday-text', {
      opacity: 1,
      duration: 2,
      ease: 'power3.out'
    }, '+=1');

    /* Phase 6: Ribbon loop fades in at t~3.8s (after flame established) */
    tl.to('#ribbon-candle', {
      opacity: 0.7,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=1.5');

    /* STEP 9 — Wish text */
    tl.to('#wish-text', {
      opacity: 1,
      duration: 1.2,
      ease: 'power3.out'
    }, '+=3');
  }

  /* ============================================================
     BOTANICAL DIVIDERS DRAW-ON
     All 6 dividers: animate paths on scroll entry.
  ============================================================ */

  var dividerIds = ['divider-a','divider-b','divider-c','divider-d','divider-e','divider-f'];

  function initDividerAnimation(id) {
    var el = document.getElementById(id);
    if (!el) return;

    var paths = el.querySelectorAll('path');
    paths.forEach(function (path) {
      var len = path.getTotalLength ? path.getTotalLength() : 100;
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
    });

    /* Ellipses (leaves/petals) start hidden */
    var ellipses = el.querySelectorAll('ellipse, circle');
    gsap.set(ellipses, { opacity: 0 });

    var divObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        divObs.unobserve(el);

        gsap.to(paths, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 1.5,
          stagger: 0.04,
          ease: 'power1.inOut'
        });

        gsap.to(ellipses, {
          opacity: 1,
          duration: 0.5,
          stagger: 0.03,
          delay: 0.6,
          ease: 'power2.out'
        });
      });
    }, { threshold: 0.2 });

    divObs.observe(el);
  }

  dividerIds.forEach(initDividerAnimation);

  /* ============================================================
     SECTION CHANGE DISPATCHER
     Listens to scroll.js sectionChange events.
  ============================================================ */

  window.addEventListener('sectionChange', function (e) {
    var sec = e.detail && e.detail.section;
    if (!sec) return;

    switch (sec) {
      case '02':
        once('section-02', animSection02);
        break;

      case '03':
        once('section-03', animSection03);
        break;

      case '04':
        once('section-04-start', startFilmStrip);
        break;

      case '05':
        once('section-05', animSection05);
        break;

      case '06':
        once('section-06', animSection06);
        break;

      case '07':
        once('section-07', animSection07);
        break;

      case '08':
        once('section-08', animSection08);
        break;

      case '09':
        once('section-09', animSection09);
        break;

      case '10':
        once('section-10', animSection10);
        break;

      case '11':
        once('section-11', animSection11);
        break;

      case '12':
        once('section-12', animSection12);
        break;
    }

    /* Stop film strip when leaving §04 */
    if (sec !== '04') {
      /* Don't stop — let it run as background for perf; 
         stop only when navigating far away */
      if (parseInt(sec) > 5) stopFilmStrip();
    }

    /* Exit §10 behaviour */
    if (sec !== '10' && played.has('section-10')) {
      exitSection10();
    }

    /* Phase 6: Vignette cross-fade between sections */
    (function () {
      var darkSections  = ['01','04','05','06','12'];
      var lightSections = ['02','03','07','08','09','10','11'];
      var incoming = document.getElementById('section-' + sec);
      if (!incoming) return;

      /* Momentarily boost vignette on entry, then normalise */
      var isDark = darkSections.indexOf(sec) !== -1;
      var peakVal = isDark ? '1.5' : '1.4';
      var normVal = '1.0';

      incoming.style.setProperty('--vignette-strength', peakVal);
      gsap.to(incoming, {
        '--vignette-strength': normVal,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true
      });
    })();
  });

  /* Initial state for §12 ribbon */
  safeSet('#ribbon-candle', { opacity: 0 });

  /* ============================================================
     PREFERS-REDUCED-MOTION — CSS side
     (JS animations already branch on reducedMotion flag)
  ============================================================ */
  if (reducedMotion) {
    /* Ensure everything starts visible if motion disabled */
    var els = [
      '#line-1','#line-2','#line-3',
      '#letter-salutation','#letter-text-p1','#letter-text-p2','#letter-text-p3','#letter-closing',
      '#birthday-text','#wish-text',
      '#section11-quote','#camera-section-quote',
      '#money-headline','.s03-quote'
    ];
    els.forEach(function (sel) {
      safeSet(sel, { opacity: 1, filter: 'none', y: 0, x: 0 });
    });
    safeSet('#candle-flame',  { opacity: 1, scale: 1 });
    safeSet('#s12-ambient-glow', { opacity: 0.9 });
    safeSet('#ribbon-candle', { opacity: 0.7 });
    safeSet('.s10-note',      { opacity: 1, y: 0 });
    safeSet('.s06-camera-svg',{ opacity: 1, y: 0 });
    for (var m = 1; m <= 4; m++) {
      var xVal = (m === 1 ? -40 : m === 2 ? 80 : m === 3 ? 0 : 120);
      var yVal = (m === 1 ? -120 : m === 2 ? -40 : m === 3 ? 140 : 80);
      var rotVal = (m === 1 ? -12 : m === 2 ? 8 : m === 3 ? -5 : 10);
      safeSet('#polaroid-card-' + m, { opacity: 1, x: xVal, y: yVal, rotation: rotVal, scale: 1 });
      safeSet('#polaroid-develop-' + m, { opacity: 0 });
      safeSet('#polaroid-caption-' + m, { opacity: 1 });
    }
    /* Start flame even in reduced motion */
    var flameEl = document.getElementById('candle-flame');
    if (flameEl) flamePhysics(flameEl);
  }

  console.log('[animations.js] Phase 4-6 initialised. reducedMotion=' + reducedMotion);

})();
