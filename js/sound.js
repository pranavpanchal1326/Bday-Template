/* ============================================================
   SOUND.JS — Sahiba Birthday Keepsake  [Phase 5]
   Depends on: Howler.js 2.2.3 (loaded before this script)

   Architecture:
     - SoundLibrary: Howler instances, one per sound file
     - SyntheticFallbacks: Web Audio API approximations
       used when the .mp3 file is missing (404)
     - Sound state: enabled/disabled via localStorage
     - Section hooks: listens to sectionChange events
     - Animation hooks: window.sahibaSound API for GSAP callbacks
     - Mobile unlock: resumes AudioContext on first interaction
   ============================================================ */

(function () {
  'use strict';

  /* ── Guard: Howler must be loaded ─────────────────────────── */
  if (typeof Howl === 'undefined') {
    console.error('[sound.js] Howler.js not loaded.');
    return;
  }

  /* ============================================================
     1. STATE
  ============================================================ */

  var currentSection       = '01';
  var firstInteractionDone = false;
  var frameCount           = 0;

  /* Read sound preference from localStorage */
  var soundEnabled = localStorage.getItem('sahiba-sound') !== 'off';

  /* ============================================================
     2. WEB AUDIO API — SYNTHETIC FALLBACKS
     Used when the real .mp3 file is missing.
     Each function returns a function that, when called, plays
     the synthesised sound once.
     SYNTHETIC FALLBACK — replace each with real file
  ============================================================ */

  var _ctx = null;

  function getCtx() {
    if (!_ctx) {
      try {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('[sound.js] Web Audio API not available.');
        return null;
      }
    }
    return _ctx;
  }

  var Synth = {

    /* vinyl-crackle: warm crackling fire/vinyl bed using lowpass-filtered noise + popcorn impulses */
    vinylCrackle: function () {
      var ctx = getCtx(); if (!ctx) return;
      var bufferSize = ctx.sampleRate * 2;
      var buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < data.length; i++) {
        // Soft white noise
        var noise = (Math.random() * 2 - 1) * 0.008;
        // Popcorn impulses at random intervals
        var pop = (Math.random() > 0.9997) ? (Math.random() * 2 - 1) * 0.15 : 0;
        data[i] = (noise + pop) * (1 - i / data.length);
      }
      var src = ctx.createBufferSource();
      src.buffer = buf; src.loop = false;
      
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800; // Warm cozy feel

      var gain = ctx.createGain(); gain.gain.value = 0.22;
      
      src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      src.start();
    },

    /* projector-reel: warm vintage hum using 60Hz + 120Hz sines + lowpass filtered pink noise */
    projectorReel: function (loop) {
      var ctx = getCtx(); if (!ctx) return null;
      var master = ctx.createGain(); master.gain.value = 0.07;
      master.connect(ctx.destination);

      /* Deep motor hum fundamental */
      var osc1 = ctx.createOscillator();
      osc1.type = 'sine'; osc1.frequency.value = 60;
      var gain1 = ctx.createGain(); gain1.gain.value = 0.8;
      osc1.connect(gain1); gain1.connect(master);
      osc1.start();

      /* Overtone */
      var osc2 = ctx.createOscillator();
      osc2.type = 'sine'; osc2.frequency.value = 120;
      var gain2 = ctx.createGain(); gain2.gain.value = 0.3;
      osc2.connect(gain2); gain2.connect(master);
      osc2.start();

      /* Rhythmic vintage clicks */
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) {
        // Rhythmic gear rattle
        d[i] = (Math.random() * 2 - 1) * 0.05 * Math.pow(1 - i / d.length, 3);
      }
      var reelRattle = ctx.createBufferSource();
      reelRattle.buffer = buf; reelRattle.loop = true;
      
      var rattleFilter = ctx.createBiquadFilter();
      rattleFilter.type = 'bandpass'; rattleFilter.frequency.value = 350;
      
      var rattleGain = ctx.createGain(); rattleGain.gain.value = 0.6;
      
      reelRattle.connect(rattleFilter); rattleFilter.connect(rattleGain); rattleGain.connect(master);
      reelRattle.start();

      return {
        stop: function () {
          try {
            osc1.stop(); osc2.stop(); reelRattle.stop();
          } catch(e){}
        }
      };
    },

    /* film-advance: gentle mechanical metal latch latch-click */
    filmAdvance: function () {
      var ctx = getCtx(); if (!ctx) return;
      var osc = ctx.createOscillator(); osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
      
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = 2000;

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.045);
    },

    /* camera-iris: soft elegant glass element sweep */
    cameraIris: function () {
      var ctx = getCtx(); if (!ctx) return;
      var osc = ctx.createOscillator(); osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(760, ctx.currentTime + 0.35);

      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 1200;

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.36);
    },

    /* shutter-click: realistic SLR click (high-frequency curtain noise + resonant mirror thud) */
    shutterClick: function () {
      var ctx = getCtx(); if (!ctx) return;
      
      /* Mirror slap thud (low-mid body resonance) */
      var osc = ctx.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.09);
      var gainOsc = ctx.createGain();
      gainOsc.gain.setValueAtTime(0.24, ctx.currentTime);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gainOsc); gainOsc.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);

      /* Shutter curtain sweep (highpass white noise transient) */
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.07), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
      }
      var src = ctx.createBufferSource(); src.buffer = buf;
      
      var hpFilter = ctx.createBiquadFilter();
      hpFilter.type = 'highpass'; hpFilter.frequency.value = 4000;
      
      var gainNoise = ctx.createGain(); gainNoise.gain.value = 0.18;
      
      src.connect(hpFilter); hpFilter.connect(gainNoise); gainNoise.connect(ctx.destination);
      src.start();
    },

    /* polaroid-eject: mechanical motor gear whirr */
    polaroidEject: function () {
      var ctx = getCtx(); if (!ctx) return;
      var duration = 0.8;
      var osc = ctx.createOscillator(); osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + duration);

      // Amplitude modulation for motor buzz
      var mod = ctx.createOscillator(); mod.frequency.value = 65;
      var modGain = ctx.createGain(); modGain.gain.value = 40;
      mod.connect(modGain); modGain.connect(osc.frequency);

      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 350;

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      mod.start(); osc.start();
      mod.stop(ctx.currentTime + duration); osc.stop(ctx.currentTime + duration);
    },

    /* wax-crack: tactile rich snap combining low end block sound + snap transient */
    waxCrack: function () {
      var ctx = getCtx(); if (!ctx) return;
      
      /* Resonant thud */
      var osc = ctx.createOscillator(); osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      var gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.18, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain1); gain1.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.16);

      /* Fracturing snap noise */
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3.5);
      var src = ctx.createBufferSource(); src.buffer = buf;
      
      var bpFilter = ctx.createBiquadFilter();
      bpFilter.type = 'bandpass'; bpFilter.frequency.value = 1600;

      var gain2 = ctx.createGain(); gain2.gain.value = 0.22;
      src.connect(bpFilter); bpFilter.connect(gain2); gain2.connect(ctx.destination);
      src.start();
    },

    /* paper-rustle: gorgeous organic leaf-like friction rustling */
    paperRustle: function () {
      var ctx = getCtx(); if (!ctx) return;
      var duration = 1.6;
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) {
        var progress = i / d.length;
        var r = (Math.random() * 2 - 1);
        // Amplitude envelope: soft swell, then decay
        var env = progress < 0.2 
          ? (progress / 0.2) * 0.08
          : 0.08 * Math.pow(1 - (progress - 0.2) / 0.8, 3);
        // Gentle crackle frequency modulation
        var mod = Math.sin(progress * Math.PI * 18);
        d[i] = r * env * (0.6 + 0.4 * mod);
      }
      var src = ctx.createBufferSource(); src.buffer = buf;
      
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = 2400; filter.Q.value = 1.0;

      var gain = ctx.createGain(); gain.gain.value = 0.25;
      src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      src.start();
    },

    /* ambient-chord: breathtakingly lush, warm, cinematic Major 9th chord (C3-G3-C4-E4-G4-B4-D5) */
    ambientChord: function () {
      var ctx = getCtx(); if (!ctx) return;
      var freqs = [130.81, 196.00, 261.63, 329.63, 392.00, 493.88, 587.33];
      var master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.2);
      master.gain.setValueAtTime(0.06, ctx.currentTime + 1.8);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 4.2);
      master.connect(ctx.destination);

      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 550; // Extremely warm and cozy
      filter.connect(master);

      freqs.forEach(function (f, i) {
        var osc = ctx.createOscillator();
        osc.type = 'triangle'; // Soft acoustic timbre
        osc.frequency.value = f;
        
        // Stagger detuning for deep space chorusing
        osc.detune.value = (Math.random() - 0.5) * 8;
        
        osc.connect(filter);
        osc.start(ctx.currentTime + i * 0.05); // Elegant rolling chord strike
        osc.stop(ctx.currentTime + 4.2);
      });
    },

    /* match-strike: realistic match scratch (filtered transient) and soft warm pop of ignition */
    matchStrike: function () {
      var ctx = getCtx(); if (!ctx) return;
      
      /* Strike friction scratch */
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3.0) * 0.28;
      var src = ctx.createBufferSource(); src.buffer = buf;
      var filter1 = ctx.createBiquadFilter();
      filter1.type = 'highpass'; filter1.frequency.value = 3500;
      var gain1 = ctx.createGain(); gain1.gain.value = 0.35;
      src.connect(filter1); filter1.connect(gain1); gain1.connect(ctx.destination);
      src.start();

      /* Ignition gas pop */
      var osc = ctx.createOscillator(); osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.03);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
      var filter2 = ctx.createBiquadFilter();
      filter2.type = 'lowpass'; filter2.frequency.value = 600;
      var gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(filter2); filter2.connect(gain2); gain2.connect(ctx.destination);
      osc.start(ctx.currentTime + 0.02); osc.stop(ctx.currentTime + 0.26);
    },

    /* cash-register: beautiful physical antique brass chime click */
    cashRegister: function () {
      var ctx = getCtx(); if (!ctx) return;
      var freqs = [1200, 1680, 2400]; // Multi-tone metallic chime
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = 2000;
      filter.connect(ctx.destination);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      gain.connect(filter);

      freqs.forEach(function (f) {
        var osc = ctx.createOscillator(); osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(gain);
        osc.start(); osc.stop(ctx.currentTime + 0.8);
      });
    },

    /* song1: Ek Ladki Ko Dekha Toh Aisa Laga synthetic melody */
    song1: function () {
      var ctx = getCtx(); if (!ctx) return null;
      var activeNodes = [];
      var isStopped = false;
      
      var freqs = [
        293.66, 392.00, 440.00, 493.88, 440.00, 392.00, 440.00, 369.99, 392.00, 329.63,
        293.66, 392.00, 440.00, 493.88, 440.00, 392.00, 440.00, 369.99, 392.00, 329.63
      ];
      var durs = [
        0.3, 0.3, 0.3, 0.6, 0.6, 0.3, 0.3, 0.3, 0.6, 0.9,
        0.3, 0.3, 0.3, 0.6, 0.6, 0.3, 0.3, 0.3, 0.6, 0.9
      ];
      var time = ctx.currentTime;
      var timerRef = null;

      function playNote(freq, startTime, duration) {
        if (isStopped) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.04);
        
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, startTime);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        
        activeNodes.push(osc);
      }

      function scheduleLoop() {
        if (isStopped) return;
        var loopTime = 0;
        freqs.forEach(function (f, idx) {
          playNote(f, time + loopTime, durs[idx]);
          loopTime += durs[idx];
        });
        
        timerRef = setTimeout(function () {
          time = ctx.currentTime;
          scheduleLoop();
        }, loopTime * 1000);
      }

      scheduleLoop();

      return {
        stop: function () {
          isStopped = true;
          if (timerRef) clearTimeout(timerRef);
          activeNodes.forEach(function (node) {
            try { node.stop(); } catch(e){}
          });
        }
      };
    },

    /* song2: Mere Sapnon Ki Rani synthetic melody */
    song2: function () {
      var ctx = getCtx(); if (!ctx) return null;
      var activeNodes = [];
      var isStopped = false;
      
      var freqs = [
        293.66, 369.99, 440.00, 493.88, 440.00, 369.99, 293.66,
        329.63, 369.99, 392.00, 369.99, 329.63,
        293.66, 369.99, 440.00, 493.88, 440.00, 369.99, 293.66,
        329.63, 369.99, 392.00, 369.99, 329.63
      ];
      var durs = [
        0.25, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25,
        0.25, 0.25, 0.5, 0.5, 0.75,
        0.25, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25,
        0.25, 0.25, 0.5, 0.5, 0.75
      ];
      var time = ctx.currentTime;
      var timerRef = null;

      function playNote(freq, startTime, duration) {
        if (isStopped) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.03);
        
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, startTime);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        
        activeNodes.push(osc);
      }

      function scheduleLoop() {
        if (isStopped) return;
        var loopTime = 0;
        freqs.forEach(function (f, idx) {
          playNote(f, time + loopTime, durs[idx]);
          loopTime += durs[idx];
        });
        
        timerRef = setTimeout(function () {
          time = ctx.currentTime;
          scheduleLoop();
        }, loopTime * 1000);
      }

      scheduleLoop();

      return {
        stop: function () {
          isStopped = true;
          if (timerRef) clearTimeout(timerRef);
          activeNodes.forEach(function (node) {
            try { node.stop(); } catch(e){}
          });
        }
      };
    },

    /* song3: The Night We Met synthetic melody */
    song3: function () {
      var ctx = getCtx(); if (!ctx) return null;
      var activeNodes = [];
      var isStopped = false;
      
      var freqs = [
        246.94, 293.66, 329.63, 293.66, 246.94,
        246.94, 293.66, 329.63, 293.66, 246.94
      ];
      var durs = [
        0.8, 0.8, 0.8, 0.8, 1.6,
        0.8, 0.8, 0.8, 0.8, 1.6
      ];
      var time = ctx.currentTime;
      var timerRef = null;

      function playNote(freq, startTime, duration) {
        if (isStopped) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.1);
        
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, startTime);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        
        activeNodes.push(osc);
        
        // Echo
        var echoTime = startTime + 0.4;
        var echoGain = ctx.createGain();
        echoGain.gain.setValueAtTime(0, echoTime);
        echoGain.gain.linearRampToValueAtTime(0.015, echoTime + 0.1);
        echoGain.gain.exponentialRampToValueAtTime(0.0001, echoTime + duration - 0.1);
        
        var echoOsc = ctx.createOscillator();
        echoOsc.type = 'sine';
        echoOsc.frequency.setValueAtTime(freq, echoTime);
        
        echoOsc.connect(filter);
        filter.connect(echoGain);
        echoGain.connect(ctx.destination);
        
        echoOsc.start(echoTime);
        echoOsc.stop(echoTime + duration);
        
        activeNodes.push(echoOsc);
      }

      function scheduleLoop() {
        if (isStopped) return;
        var loopTime = 0;
        freqs.forEach(function (f, idx) {
          playNote(f, time + loopTime, durs[idx]);
          loopTime += durs[idx];
        });
        
        timerRef = setTimeout(function () {
          time = ctx.currentTime;
          scheduleLoop();
        }, loopTime * 1000);
      }

      scheduleLoop();

      return {
        stop: function () {
          isStopped = true;
          if (timerRef) clearTimeout(timerRef);
          activeNodes.forEach(function (node) {
            try { node.stop(); } catch(e){}
          });
        }
      };
    }

  };

  /* ============================================================
     3. HOWLER SOUND LIBRARY
     Each Howl has an onloaderror that falls back to Synth.
  ============================================================ */

  function makeSyntheticHowl(synthFn, volume, loop) {
    /* Returns a minimal object that mimics the Howl API */
    var isPlaying = false;
    var loopRef   = null;
    var activeRef = null;
    return {
      play:    function () {
        if (!soundEnabled) return;
        if (isPlaying) return;
        isPlaying = true;
        activeRef = synthFn();
        // Only run setInterval for simple non-self-managing sounds that need looping
        if (loop && (!activeRef || typeof activeRef.stop !== 'function')) {
          loopRef = setInterval(function () {
            synthFn();
          }, 2000);
        }
      },
      stop:    function () {
        isPlaying = false;
        if (loopRef) { clearInterval(loopRef); loopRef = null; }
        if (activeRef && activeRef.stop) {
          activeRef.stop();
          activeRef = null;
        }
      },
      playing: function () { return isPlaying; },
      fade:    function (from, to, ms) {
        /* Fade not directly supported in synthetic fallback */
        if (to === 0) { setTimeout(this.stop.bind(this), ms); }
      },
      load:    function () { /* no-op */ },
      volume:  function () {},
      _synthetic: true
    };
  }

  function makeHowl(opts, synthFn) {
    try {
      var h = new Howl({
        src:     opts.src,
        volume:  opts.volume  || 0.3,
        loop:    opts.loop    || false,
        preload: true,
        onloaderror: function () {
          console.warn('[sound.js] File missing, using synthetic fallback for: ' + opts.src[0]);
          /* Replace self with synthetic */
          SoundLibrary[opts._key] = makeSyntheticHowl(synthFn, opts.volume, opts.loop);
        }
      });
      h._key = opts._key;
      return h;
    } catch (e) {
      console.warn('[sound.js] Howl failed, using synthetic fallback.');
      return makeSyntheticHowl(synthFn, opts.volume, opts.loop);
    }
  }

  var SoundLibrary = {

    vinylCrackle: makeHowl({
      _key: 'vinylCrackle',
      src:  ['assets/sounds/vinyl-crackle.mp3'],
      volume: 0.18, loop: true
    }, Synth.vinylCrackle),

    projectorReel: makeHowl({
      _key: 'projectorReel',
      src:  ['assets/sounds/projector-reel.mp3'],
      volume: 0.22, loop: true
    }, Synth.projectorReel),

    filmAdvance: makeHowl({
      _key: 'filmAdvance',
      src:  ['assets/sounds/film-advance.mp3'],
      volume: 0.12
    }, Synth.filmAdvance),

    cameraIris: makeHowl({
      _key: 'cameraIris',
      src:  ['assets/sounds/camera-iris.mp3'],
      volume: 0.30
    }, Synth.cameraIris),

    shutterClick: makeHowl({
      _key: 'shutterClick',
      src:  ['assets/sounds/shutter-click.mp3'],
      volume: 0.45
    }, Synth.shutterClick),

    polaroidEject: makeHowl({
      _key: 'polaroidEject',
      src:  ['assets/sounds/polaroid-eject.mp3'],
      volume: 0.20
    }, Synth.polaroidEject),

    waxCrack: makeHowl({
      _key: 'waxCrack',
      src:  ['assets/sounds/wax-crack.mp3'],
      volume: 0.40
    }, Synth.waxCrack),

    paperRustle: makeHowl({
      _key: 'paperRustle',
      src:  ['assets/sounds/paper-rustle.mp3'],
      volume: 0.25
    }, Synth.paperRustle),

    ambientChord: makeHowl({
      _key: 'ambientChord',
      src:  ['assets/sounds/ambient-chord.mp3'],
      volume: 0.15
    }, Synth.ambientChord),

    matchStrike: makeHowl({
      _key: 'matchStrike',
      src:  ['assets/sounds/match-strike.mp3'],
      volume: 0.50
    }, Synth.matchStrike),

    cashRegister: makeHowl({
      _key: 'cashRegister',
      src:  ['assets/sounds/cash-register.mp3'],
      volume: 0.35
    }, Synth.cashRegister),

    song1: makeHowl({
      _key: 'song1',
      src:  ['assets/sounds/song-1.mp3'],
      volume: 0.50
    }, Synth.song1),

    song2: makeHowl({
      _key: 'song2',
      src:  ['assets/sounds/song-2.mp3'],
      volume: 0.50
    }, Synth.song2),

    song3: makeHowl({
      _key: 'song3',
      src:  ['assets/sounds/song-3.mp3'],
      volume: 0.50
    }, Synth.song3),

    loveStory: makeHowl({
      _key: 'loveStory',
      src:  ['assets/sounds/love-story.mp3'],
      volume: 0.8,
      loop: true
    }, function () {
      var ctx = getCtx(); if (!ctx) return null;
      var activeNodes = [];
      var isStopped = false;
      var time = ctx.currentTime;
      var timerRef = null;
      var freqs = [329.63, 392.00, 440.00, 392.00, 329.63];
      
      function playNote(freq, startTime, duration) {
        if (isStopped) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.02, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration - 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
        activeNodes.push(osc);
      }
      
      function schedule() {
        if (isStopped) return;
        freqs.forEach(function(f, i) {
          playNote(f, time + i * 2, 2.2);
        });
        timerRef = setTimeout(function() {
          time = ctx.currentTime;
          schedule();
        }, freqs.length * 2000);
      }
      schedule();
      return {
        stop: function() {
          isStopped = true;
          if (timerRef) clearTimeout(timerRef);
          activeNodes.forEach(function(n) { try{n.stop();}catch(e){} });
        }
      };
    })

  };

  /* ============================================================
     4. CORE PLAY / STOP HELPERS
  ============================================================ */

  function play(sound) {
    if (!soundEnabled) return;
    if (!firstInteractionDone) return; /* Respect autoplay policy */
    if (sound && !sound.playing()) {
      sound.play();
    }
  }

  function playOnce(sound) {
    /* Play regardless of playing() — good for one-shot SFX */
    if (!soundEnabled) return;
    if (!firstInteractionDone) return;
    if (sound) sound.play();
  }

  function stop(sound) {
    if (sound && sound.playing()) sound.stop();
  }

  /* ============================================================
     5. SOUND TOGGLE
  ============================================================ */

  var toggleBtn  = document.getElementById('sound-toggle');
  var iconOn     = document.getElementById('sound-icon-on');
  var iconOff    = document.getElementById('sound-icon-off');

  function updateSoundToggleUI() {
    if (!toggleBtn) return;
    toggleBtn.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');

    if (iconOn && iconOff) {
      if (soundEnabled) {
        iconOn.style.display  = '';
        iconOff.style.display = 'none';
        toggleBtn.style.opacity = '0.6';
      } else {
        iconOn.style.display  = 'none';
        iconOff.style.display = '';
        toggleBtn.style.opacity = '0.4';
        /* Tint gold when muted */
        iconOff.style.stroke = 'var(--champagne-gold, #C4A26B)';
      }
    }
  }

  /* Apply initial UI state */
  updateSoundToggleUI();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      soundEnabled = !soundEnabled;
      localStorage.setItem('sahiba-sound', soundEnabled ? 'on' : 'off');
      updateSoundToggleUI();

      if (!soundEnabled) {
        Howler.volume(0);
        if (SoundLibrary.loveStory) SoundLibrary.loveStory.pause();
      } else {
        Howler.volume(1);
        /* Unlock audio context if needed */
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume();
        }
        if (_ctx && _ctx.state === 'suspended') {
          _ctx.resume();
        }
        // Resume background music on unmute if no card is active
        if (!activeTrackId && SoundLibrary.loveStory && !SoundLibrary.loveStory.playing()) {
          SoundLibrary.loveStory.play();
          if (SoundLibrary.loveStory.fade) {
            SoundLibrary.loveStory.fade(0, 0.8, 1000);
          }
        }
      }
    });
  }

  /* ============================================================
     6. FIRST INTERACTION UNLOCK
   ============================================================ */

  function handleFirstInteraction() {
    if (firstInteractionDone) return;
    firstInteractionDone = true;

    /* Resume Web Audio context */
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }
    if (_ctx && _ctx.state === 'suspended') {
      _ctx.resume();
    }

    /* Start background music (Love Story) with soft 2s fade-in */
    if (soundEnabled && SoundLibrary.loveStory && !SoundLibrary.loveStory.playing()) {
      SoundLibrary.loveStory.play();
      if (SoundLibrary.loveStory.fade) {
        SoundLibrary.loveStory.fade(0, 0.8, 2000);
      }
    }

    /* Vinyl crackle intro */
    if (soundEnabled) {
      play(SoundLibrary.vinylCrackle);
      setTimeout(function () {
        if (SoundLibrary.vinylCrackle.playing()) {
          if (SoundLibrary.vinylCrackle.fade) {
            SoundLibrary.vinylCrackle.fade(0.18, 0, 800);
          }
          setTimeout(function () {
            stop(SoundLibrary.vinylCrackle);
          }, 900);
        }
      }, 700);

      /* If we're on section-01, start projector reel */
      if (currentSection === '01') {
        play(SoundLibrary.projectorReel);
      }
    }

    console.log('[sound.js] First interaction — audio unlocked.');
  }

  document.addEventListener('click',      handleFirstInteraction, { once: true });
  document.addEventListener('touchstart', handleFirstInteraction, { once: true });

  /* ============================================================
     7. PRELOAD STRATEGY
     Load sounds in batches as sections are approached.
  ============================================================ */

  var preloaded = {};

  function preload(keys) {
    keys.forEach(function (key) {
      if (preloaded[key]) return;
      preloaded[key] = true;
      var sound = SoundLibrary[key];
      if (sound && sound.load) sound.load();
    });
  }

  var PRELOAD_MAP = {
    '01': ['projectorReel', 'vinylCrackle'],
    '03': ['filmAdvance'],
    '05': ['cameraIris', 'shutterClick', 'polaroidEject'],
    '08': ['waxCrack', 'paperRustle'],
    '09': ['cashRegister', 'ambientChord', 'matchStrike']
  };

  /* ============================================================
     8. FILM STRIP FRAME COUNTER
     Hooked into animations.js via window.sahibaSound.
  ============================================================ */

  function onFilmFrameAdvanced() {
    frameCount++;
    if (frameCount % 3 === 0) {
      playOnce(SoundLibrary.filmAdvance);
    }
  }

  /* ============================================================
     9. SECTION CHANGE HANDLER
     Listens to sectionChange from scroll.js.
  ============================================================ */

  window.addEventListener('sectionChange', function (e) {
    var sec = e.detail && e.detail.section;
    if (!sec) return;
    currentSection = sec;

    /* Preload upcoming sounds */
    if (PRELOAD_MAP[sec]) preload(PRELOAD_MAP[sec]);

    switch (sec) {

      case '01':
        /* Projector reel starts on first interaction.
           If interaction already happened, start now. */
        if (firstInteractionDone && soundEnabled) {
          play(SoundLibrary.projectorReel);
        }
        break;

      case '02':
        /* Countdown ended — projector fades out */
        if (SoundLibrary.projectorReel.playing()) {
          if (SoundLibrary.projectorReel.fade) {
            SoundLibrary.projectorReel.fade(0.22, 0, 200);
          }
          setTimeout(function () {
            stop(SoundLibrary.projectorReel);
          }, 220);
        }
        break;

      case '04':
        /* Film advance clicks are triggered per-frame
           via window.sahibaSound.onFilmFrameAdvanced() */
        frameCount = 0; /* reset counter on re-entry */
        break;

      case '10':
        /* Cash register on entry flash */
        playOnce(SoundLibrary.cashRegister);
        break;

      case '11':
        /* Ambient chord when bouquet appears */
        playOnce(SoundLibrary.ambientChord);
        break;
    }

    /* Stop projector if we scroll past §01 */
    if (parseInt(sec) >= 2) {
      if (SoundLibrary.projectorReel.playing()) {
        SoundLibrary.projectorReel.fade
          ? SoundLibrary.projectorReel.fade(0.22, 0, 300)
          : null;
        setTimeout(function () { stop(SoundLibrary.projectorReel); }, 320);
      }
    }
  });

  /* ============================================================
     10. ANIMATION HOOK API
     animations.js calls window.sahibaSound.* at exact moments.
     Defined here so animations.js can call them without timing
     its own delays, but knowing sound.js is the single authority.
  ============================================================ */

  window.sahibaSound = {

    /* §01 — stop projector exactly before white flash */
    stopProjectorForFlash: function () {
      if (SoundLibrary.projectorReel.playing()) {
        if (SoundLibrary.projectorReel.fade) {
          SoundLibrary.projectorReel.fade(0.22, 0, 200);
        }
        setTimeout(function () { stop(SoundLibrary.projectorReel); }, 210);
      }
    },

    /* §04 — film strip frame counter tick */
    onFilmFrameAdvanced: onFilmFrameAdvanced,

    /* §06 — camera sequence sound cues */
    cameraIrisOpen:   function () { playOnce(SoundLibrary.cameraIris);    },
    cameraShutter:    function () { playOnce(SoundLibrary.shutterClick);   },
    polaroidEject:    function () { playOnce(SoundLibrary.polaroidEject);  },

    /* §09 — letter sounds */
    waxCrack:         function () { playOnce(SoundLibrary.waxCrack);       },
    paperRustle:      function () { playOnce(SoundLibrary.paperRustle);    },

    /* §12 — match strike */
    matchStrike:      function () { playOnce(SoundLibrary.matchStrike);    },

    /* Public query */
    isEnabled:        function () { return soundEnabled; }
  };

  /* ============================================================
     11. PATCH animations.js — insert sound cues at animation moments
     animations.js has already defined window.sahibaSound hooks.
     We now patch into the GSAP timelines by overriding the
     window.sahibaSound callbacks (already used in animations.js).

     For the countdown "stop before flash" — animations.js calls:
       if (window.sahibaSound) window.sahibaSound.stopProjectorForFlash()
     just before the white flash gsap.to.
     This is safe because sound.js loads after animations.js.

     For camera sequence — animations.js calls:
       window.sahibaSound && window.sahibaSound.cameraIrisOpen()
     at the aperture step, etc.

     The hooks in animations.js are already wired (see comments there).
     This file provides the implementations.
  ============================================================ */

  /* ============================================================
     12. ACCESSIBILITY
     If prefers-reduced-motion is on, we still allow sounds
     (motion-reduced ≠ sound-disabled). The toggle controls audio.
  ============================================================ */

  /* ============================================================
     13. SPOTIFY PLAYLIST INTERACTION
     ============================================================ */

  var activeTrackId = null;
  var currentSong = null;

  function stopCurrentSong() {
    if (currentSong) {
      currentSong.stop();
      currentSong = null;
    }
    activeTrackId = null;

    // Remove playing class from all card wrappers
    document.querySelectorAll('.spotify-card-wrapper').forEach(function (w) {
      w.classList.remove('playing');
    });

    // Resume background music softly
    if (soundEnabled && SoundLibrary.loveStory && !SoundLibrary.loveStory.playing()) {
      SoundLibrary.loveStory.play();
      if (SoundLibrary.loveStory.fade) {
        SoundLibrary.loveStory.fade(0, 0.8, 1000);
      }
    }
  }

  var spotifyCards = document.querySelectorAll('.spotify-card-wrapper');
  spotifyCards.forEach(function (wrapper, idx) {
    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', function () {
      if (!firstInteractionDone) {
        handleFirstInteraction();
      }

      var songKey = 'song' + (idx + 1);
      var sound = SoundLibrary[songKey];

      // If clicked the currently playing song, pause it
      if (activeTrackId === songKey) {
        stopCurrentSong();
        console.log('[sound.js] Paused ' + songKey);
      } else {
        // Stop current playing song first
        stopCurrentSong();

        // Fade out background music before playing card song
        if (SoundLibrary.loveStory && SoundLibrary.loveStory.playing()) {
          if (SoundLibrary.loveStory.fade) {
            SoundLibrary.loveStory.fade(0.8, 0, 800);
            setTimeout(function () {
              if (activeTrackId) { // check if song is still playing
                SoundLibrary.loveStory.pause();
              }
            }, 850);
          } else {
            SoundLibrary.loveStory.pause();
          }
        }

        // Start new song
        activeTrackId = songKey;
        wrapper.classList.add('playing');

        if (sound) {
          sound.play();
          currentSong = sound;
        }
        console.log('[sound.js] Playing ' + songKey);
      }
    });
  });

  // Stop music when leaving Section 07 to be clean
  window.addEventListener('sectionChange', function (e) {
    var sec = e.detail && e.detail.section;
    if (sec !== '07') {
      stopCurrentSong();
    }
  });

  /* ============================================================
     14. CLEANUP: stop all loops when page hides
     ============================================================ */

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stop(SoundLibrary.projectorReel);
      stop(SoundLibrary.vinylCrackle);
      stopCurrentSong();
    }
  });

  console.log('[sound.js] Phase 5 initialised. soundEnabled=' + soundEnabled);

})();
