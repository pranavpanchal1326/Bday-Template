# Premium Vintage Birthday Keepsake Template

An ultra-premium, interactive digital birthday keepsake designed with a stunning vintage botanical and cinematic film aesthetic. Built entirely using core web technologies (**pure HTML, modular CSS, and Vanilla JavaScript**) alongside high-fidelity physics and animation libraries (**GSAP & Howler.js**).

This is a **completely generic, privacy-cleaned, plug-and-play template** ready to be customized and pushed to GitHub or deployed directly to Vercel/Netlify.

---

## 🎨 Design System & Aesthetics

* **Warm Antiqued Palette:** Powered by custom CSS variables (`css/variables.css`) built around HSL-curated color tokens:
  * **Ivory Parchment:** `#FAF3E8` (rich background canvas)
  * **Deep Antique Rose:** `#B5526A` (primary accent tone)
  * **Sage Green:** `#7A9478` (botanical elements)
  * **Champagne Gold:** `#C4A26B` (metadata and interactive highlights)
  * **Warm Cream:** `#F5EDD8` (paper surfaces)
* **Textured Ambience:** Features an organic grain overlay layer (`css/grain.css`) and subtle vignette framing (`css/vignette.css`) for a nostalgic analog film reel mood.
* **Premium Typography:** Curated pairings of *Cormorant Garamond* (elegant serif), *DM Serif Display* (dramatic labels), and *Jost* (minimalist modern geometric labels).

---

## ✨ Features & Cinematic Stages

1. **Film Countdown (§01):** An authentic vintage 35mm projector countdown starting from 10 down to 1, with realistic ticking, crosshair rotation, and projector sound effects.
2. **Title Reveal (§02):** A poetic typed text sequence introducing the dedication, framed by an elegant botanical gold-leaf sprig.
3. **Rose Bouquet (§03):** A gorgeous, layered hand-drawn SVG rose bouquet tied with a satin ribbon and fallen petals.
4. **Interactive Film Strip (§04):** A horizontal lazy-loaded filmstrip track that desaturates and highlights snapshots dynamically as they enter the spotlight frame.
5. **Cinematic Video Reels (§05):** A dual-video layout with blurred background sidebars for vertical videos, responsive pagination dots, and a custom **animated film projector placeholder** if video files are not yet present.
6. **Leica Camera & Polaroid Ejector (§06):** A beautifully detailed vector Leica M camera. Clicking the shutter releases a shutter sound, iris blink, and slides out **Polaroid cards** that gradually develop from white to high-contrast warm color before your eyes!
7. **Lyric-Synced Spotify Cards (§07):** Staff-ruled cards presenting custom playlist songs with animated audio waveforms and cursive lyric annotations.
8. **Wildflower Meadow (§08):** A tall arching botanical SVG landscape that separates stages with scattered petals.
9. **wax-Sealed Envelope & Letter (§09):** A heavy parchment letter locked under a detailed wax seal. Clicking the seal strikes a wax crack sound, opens the envelope flap, slides out the paper, and draws an organic red thread under the cursive sign-off.
10. **Scattered Tickets & Banknotes (§10):** A rain of custom-styled ticket banknotes stamped with serial numbers and custom watermarks.
11. **Conclusion & Lit Candle (§12):** A high-fidelity cylindrical birthday candle with a realistic flame core glow, floating golden dust particles, and match smoke.

---

## 🛠️ Step-by-Step Customization Guide

Customizing this keepsake is incredibly straightforward and requires no complex build tools. Open the codebase in any editor (like VS Code) and follow these simple steps:

### 1. Update the Dedication & Letter Contents
Open `index.html` and edit the following blocks:
* **Page Title (Line 8):** Change `<title>For You | Birthday Keepsake</title>` to your recipient's name.
* **Letter Salutation & Body (Lines 1468–1479):**
  * Change `Dear [Name],` to your recipient's name.
  * Change `[Your Name]` to your signature name.
  * Customize the paragraph contents if you wish to write a custom personal note!
* **Banknote Watermarks (Lines 1546–1591):** Customize the center span text (`MEMORIES` / `BDAY`) and serial numbers (`BDAY-26-05-YYYY`) to match a special date.
* **Ending Header (Line 1729):** Change `Happy Birthday.` to `Happy Birthday, [Name].`

### 2. Add Custom Photographs
All photographs are located inside `assets/photos/`. We have bundled 3 high-quality generic vintage placeholders (`placeholder-portrait.png`, `placeholder-landscape.png`, `placeholder-square.png`).
To insert your own photos:
* Drop your image files into `assets/photos/`.
* Inside `index.html`, locate the `<img>` tags in the **Film Strip** (§04) and **Polaroids** (§06) and change their `src` attributes to point to your files:
  * For example, change `src="assets/photos/placeholder-portrait.png"` $\rightarrow$ `src="assets/photos/my-photo-01.jpg"`.
  * *Tip: Portrait aspect ratio photos work best in the Polaroids and vertical frames.*

### 3. Add Custom Video Clips
The template includes a plug-and-play video sequence inside Section 05:
* Drop two `.mp4` video files into `assets/video/`.
* Rename them exactly to `video-01.mp4` and `video-02.mp4`.
* **That's it!** The JavaScript in `js/video.js` will automatically detect the presence of the video files, slide away the animated film projector placeholder card, and play your custom video loops sequentially with a blurred background.

### 4. Custom Background Music & Sound Effects
* **Soundtrack:** Drop your favorite audio track in `assets/sounds/` and name it `love-story.mp3` (or update the filename reference in `js/sound.js`).
* **Sound Effects:** All sound effects (projector ticking, polaroid eject, shutter, paper rustle, wax crack) are lightweight audio assets referenced globally.

---

## 🚀 Local Running & Vercel Deployment

Since this project consists of raw HTML, CSS, and JS, you don't need to install any node modules or dependencies to run it locally.

### Local Server
Simply open `index.html` in your browser. Alternatively, to ensure sounds and lazy-loading operate correctly, run it via a local development server:
* If using VS Code, install the **Live Server** extension and click "Go Live".
* Or, using python in your terminal:
  ```bash
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your web browser.

### Instant Deploy (Vercel)
You can deploy this keepsake directly to Vercel in 1 click:
1. Push your customized code repository to GitHub.
2. Go to Vercel, log in, and click **Add New Project**.
3. Import your keepsake repository, leave the build settings at default (Static Site), and click **Deploy**.

---

## 📄 License & Sharing
This keepsake template is fully open for personal modification. Share the love, build beautiful memories, and make someone's day special!
