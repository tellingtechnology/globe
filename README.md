# The Globe — a spinning planet for any dark hero

Zero build step. Open the HTML and it pulls real-world map data from a CDN and renders a draggable, spinning globe. From the [Telling Technology](https://www.youtube.com/@tellingtechnology) design-drop episodes.

## Two flavours

| Folder | What | Files |
|---|---|---|
| repo root | **The basic globe** — drag to spin, drop on any dark hero | `index.html`, `globe.js` |
| [`overlay/`](overlay/) | **The network overlay** — your LinkedIn connections land as pins, a terminal streams names, packets race real routes. One toggle flips it all back off | `index.html`, `globe.js`, `trace.js`, `connections.js` |

## Run it

```bash
# Windows
start "" index.html
# macOS
open index.html
```

Opens straight from disk — it fetches the map itself (d3 · topojson · world-atlas via CDN, nothing to install).

## Make the overlay yours

`overlay/connections.js` ships with **1,782 generated fake names** — demo data, no real people. To put *your* world on it:

1. LinkedIn → Settings & Privacy → Data privacy → **Get a copy of your data** → Connections.
2. From the CSV, build entries shaped `{"s":"First L.","i":"FL"}` (first name + last initial only — keep it trimmed, it ends up on screen):

```js
window.LINKEDIN = {"count":1782,"people":[{"s":"Ada L.","i":"AL"}, …]};
```

3. Overwrite `overlay/connections.js`. Done — the count, the terminal stream and the pins all follow.

## Licence

MIT — yours to remix.
