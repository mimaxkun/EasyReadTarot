# EasyReadTarot

A static single-page web application for generating and interpreting three-card Marseille tarot readings. Hosted on GitHub Pages at [cards.catmaxtarot.com](https://cards.catmaxtarot.com).

## Project Overview

Zero-dependency vanilla JavaScript app. No build step, no npm, no frameworks. All logic runs in the browser.

## Running Locally

Serve the project root over HTTP (required for ES6 module loading and image paths):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or use any static file server (Live Server VSCode extension, `npx serve`, etc.).

Opening `index.html` directly as a `file://` URL may cause issues with relative asset paths.

## File Structure

```
index.html          # App entry point and markup
css/
  style.css         # All styling, animations, and responsive layout
js/
  app.js            # UI controller: card flip logic, state, event handling
  cards.js          # 78-card deck data and image path mapping
  spread.js         # Fisher-Yates shuffle and three-card draw
  interpret.js      # Keyword-based interpretation engine (Vince Petitia methodology)
images/
  cards/            # 78 Marseille deck JPEGs (~31MB total)
```

## Architecture

Each JS file uses `'use strict'` and IIFE-based scope isolation. There are no ES modules or imports — all files are loaded via `<script>` tags in `index.html` and share a single global namespace.

**Data flow:**
1. `cards.js` defines the full 78-card deck
2. `spread.js` shuffles and draws three cards (Past / Present / Future)
3. `app.js` renders cards and handles flip interactions
4. `interpret.js` generates the reading text from card data and positional context

## Card Data

- 22 Major Arcana: `FOOL0.jpg` through `WORLD21.jpg`
- 40 Pip cards: `ACE` through `10` in each suit (SWORDS, CUPS, WANDS, COINS)
- 16 Court cards: PAGE, KNIGHT, QUEEN, KING per suit

All cards are read upright only (no reversals).

## Interpretation Engine

`interpret.js` implements Vince Petitia's keyword-based methodology:

- Each rank has a core keyword (Ace = Beginning, 2 = Choice, etc.)
- Each suit has a flavor (Swords = Thought, Cups = Emotion, Wands = Spirit, Pentacles = Physical)
- Position (Past/Present/Future) modifies the interpretation

## Testing

No automated test framework. Test manually in a browser:

1. Open the app
2. Click "Draw Your Cards"
3. Click each card to flip it
4. Verify the interpretation panel renders correctly
5. Click "New Reading" to reset

Cross-browser testing (Chrome, Firefox, Safari) is recommended, particularly for CSS flip animations.

## Deployment

Pushes to `master` auto-deploy via GitHub Pages. The `CNAME` file sets the custom domain. The `.nojekyll` file disables Jekyll processing so GitHub Pages serves files as-is.

## Code Style

- ES6+ (const/let, arrow functions, template literals, destructuring)
- No linting or formatting tools configured
- Inline comments explain non-obvious logic
- Keep files self-contained — avoid adding external dependencies
