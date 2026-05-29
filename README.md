<div align="center">

<br/>

```
✦  B I R T H D A Y  K E E P S A K E  ✦
```

# 🎞️ Birthday Keepsake Template

### *A cinematic, vintage-styled digital tribute — built for the ones you love.*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-wise--pasteur.vercel.app-B5526A?style=for-the-badge&logoColor=white)](https://wise-pasteur.vercel.app)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/pranavpanchal1326/Bday-Template)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/pranavpanchal1326/Bday-Template)
[![License](https://img.shields.io/badge/License-Open_Personal_Use-C4A26B?style=for-the-badge)](LICENSE)

<br/>

> *"Because some people deserve more than a text message."*

<br/>

---

</div>

## 📖 What is This?

**Birthday Keepsake** is an **ultra-premium, fully interactive digital experience** — a love letter to cinema, nostalgia, and the art of gifting. It is a static, zero-dependency-build website that tells a story in eleven cinematic chapters, each hand-crafted with meticulous attention to detail.

This template is **completely generic and privacy-clean** — ready for you to fork, personalize, and deploy in minutes to someone who means the world to you.

Built with **pure HTML, modular CSS, and Vanilla JavaScript**. No frameworks. No build step. No compromises.

<br/>

---

## ✨ Cinematic Chapters

| § | Stage | Description |
|---|-------|-------------|
| 01 | **Film Countdown** | Authentic 35mm projector countdown with crosshair rotation, film grain, and projector tick sounds |
| 02 | **Title Reveal** | Typed poetic dedication framed by a hand-drawn botanical gold sprig |
| 03 | **Rose Bouquet** | Layered, hand-crafted SVG roses with a satin ribbon and scattered petals |
| 04 | **Interactive Film Strip** | Lazy-loaded filmstrip with dynamic desaturation & spotlight highlight on scroll |
| 05 | **Cinematic Video Reels** | Dual video player with blurred backdrop, pagination dots, & animated projector placeholder |
| 06 | **Leica Camera & Polaroids** | Click the shutter → iris blinks → polaroids eject and *develop* before your eyes |
| 07 | **Lyric Cards** | Staff-ruled song cards with animated audio waveforms and handwritten lyric annotations |
| 08 | **Wildflower Meadow** | Arching botanical SVG landscape with floating petals |
| 09 | **Wax-Sealed Letter** | Crackable wax seal → envelope opens → letter slides out → red thread hand-drawn |
| 10 | **Memory Banknotes** | A rain of custom-stamped ticket banknotes with serial numbers & watermarks |
| 12 | **Lit Birthday Candle** | Realistic candle flame with floating golden dust, glow, and match smoke |

<br/>

---

## 🎨 Design System

The entire aesthetic is driven by a curated palette of **warm, antiqued HSL tokens** defined in `css/variables.css`.

```css
/* Core Palette */
--color-ivory:    #FAF3E8;   /* Rich parchment background canvas  */
--color-rose:     #B5526A;   /* Deep antique rose — primary accent */
--color-sage:     #7A9478;   /* Sage green for botanical elements  */
--color-gold:     #C4A26B;   /* Champagne gold for highlights      */
--color-cream:    #F5EDD8;   /* Warm cream for paper surfaces      */
```

**Typography** uses three premium Google Font pairings:
- `Cormorant Garamond` — Elegant serif for body & letter content
- `DM Serif Display` — Dramatic display headers
- `Jost` — Minimalist geometric sans-serif for labels & metadata

**Atmosphere** is created through a CSS grain overlay (`css/grain.css`) and a vignette layer (`css/vignette.css`) — together giving the sensation of old 35mm film.

<br/>

---

## 🛠️ Customization Guide

> No build tools. No `npm install`. Just open in VS Code and edit.

### Step 1 — Personal Details

Open `index.html` and update:

| What | Where (approx.) | How |
|------|-----------------|-----|
| Browser tab title | `<title>` tag | Change `For You \| Birthday Keepsake` |
| Dedication header | Section `§02` | Replace typed text sequence |
| Letter salutation | Section `§09`, `Dear [Name]` | Write your recipient's name |
| Letter sign-off | Section `§09`, `[Your Name]` | Write your name |
| Ending header | Section `§12` | Change `Happy Birthday.` |
| Banknote date | Section `§10`, serial spans | Change `BDAY-26-05-YYYY` |

---

### Step 2 — Add Your Photos

Drop your image files into **`assets/photos/`** and update the `src` attributes inside the film strip (§04) and polaroid (§06) sections of `index.html`.

```
assets/
└── photos/
    ├── placeholder-portrait.png   ← replace with portrait photos
    ├── placeholder-landscape.png  ← replace with landscape photos
    └── placeholder-square.png     ← replace with square / group shots
```

> 💡 *Portrait-oriented photos look best in Polaroids. Landscape photos shine in the film strip.*

---

### Step 3 — Add Your Videos *(Optional)*

Drop two `.mp4` files into `assets/video/` and name them exactly:

```
assets/
└── video/
    ├── video-01.mp4
    └── video-02.mp4
```

The JavaScript (`js/video.js`) **auto-detects** their presence. If videos are missing, an animated film projector placeholder card is shown instead — so the site always looks complete.

---

### Step 4 — Add Your Music

```
assets/
└── sounds/
    └── love-story.mp3   ← drop your custom soundtrack here
```

Update the filename reference in `js/sound.js` if you use a different name.

<br/>

---

## 🚀 Running Locally

No installation required. Open `index.html` directly, or run a local server for full audio/video support:

**Using VS Code:**
> Install the **Live Server** extension → click **Go Live** in the status bar.

**Using Python:**
```bash
python -m http.server 8000
# then open http://localhost:8000
```

<br/>

---

## ☁️ Deploy to Vercel (1 Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pranavpanchal1326/Bday-Template)

Or manually:
1. Fork this repository to your GitHub.
2. Go to [vercel.com](https://vercel.com), log in, and click **Add New Project**.
3. Import your forked repository — leave all build settings at default (Static Site).
4. Click **Deploy**. Done. ✦

> **Live Demo:** [https://wise-pasteur.vercel.app](https://wise-pasteur.vercel.app)

<br/>

---

## 📁 Project Structure

```
wise-pasteur/
│
├── index.html              # Single-page experience (all 11 chapters)
│
├── css/
│   ├── variables.css       # Design tokens — colors, fonts, spacing
│   ├── base.css            # CSS reset and global defaults
│   ├── grain.css           # Analog film grain overlay
│   ├── vignette.css        # Cinematic vignette frame
│   ├── section-01.css      # Film countdown styles
│   ├── section-02.css      # Title reveal styles
│   ├── section-03.css      # Rose bouquet styles
│   ├── section-04.css      # Film strip & photo styles
│   ├── section-05.css      # Video reel + projector placeholder
│   ├── section-06.css      # Leica camera & polaroid styles
│   ├── section-07.css      # Lyric card styles
│   ├── section-08.css      # Wildflower meadow styles
│   ├── section-09.css      # Wax-sealed letter styles
│   ├── section-10.css      # Banknote & ticket styles
│   └── section-12.css      # Candle & closing styles
│
├── js/
│   ├── sound.js            # Howler.js audio engine & sound effects
│   ├── video.js            # Video detection, playback & fallback logic
│   ├── polaroid.js         # Shutter → develop animation controller
│   ├── letter.js           # Wax seal interaction & letter reveal
│   └── scroll.js           # GSAP scroll-triggered animation orchestrator
│
└── assets/
    ├── photos/             # Drop your photos here
    ├── video/              # Drop video-01.mp4 & video-02.mp4 here
    └── sounds/             # Drop love-story.mp3 & SFX here
```

<br/>

---

## 🧰 Tech Stack

| Technology | Role |
|------------|------|
| `HTML5` | Structure — semantic, accessible markup |
| `Vanilla CSS` | Styling — modular, token-driven design system |
| `Vanilla JS` | Logic — zero-framework interactivity |
| `GSAP` | Scroll-triggered & timeline animations |
| `Howler.js` | Cross-browser audio engine |
| `Google Fonts` | Typography (Cormorant, DM Serif, Jost) |
| `Vercel` | Hosting — instant global CDN deployment |

<br/>

---

## 📄 License

This template is open for **personal, non-commercial use**. Fork it, personalize it, and make someone feel extraordinary on their birthday. If you build something beautiful with it — share it. 🌹

<br/>

---

<div align="center">

Made with `</3` and a lot of late nights.

**[⬆ Back to Top](#️-birthday-keepsake-template)**

</div>
