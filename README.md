# Cricket Scorebar Editor

A single-file, broadcast-style cricket score bar you can edit live in the browser and export as a crisp PNG. Open the HTML file, type in the match state, and download a green-screen-ready graphic for your stream, highlights package, or social post.

![Scorebar preview on a green-screen background](docs/preview.png)

No build step, no server, no account. Everything runs in one HTML file.

---

## Table of contents

- [Features](#features)
- [Quick start](#quick-start)
- [Using the editor](#using-the-editor)
  - [Batting team](#batting-team)
  - [Bowling team](#bowling-team)
  - [Second line](#second-line)
  - [Batters](#batters)
  - [Bowler panel and ball notation](#bowler-panel-and-ball-notation)
  - [Bottom strip](#bottom-strip)
  - [Background and export](#background-and-export)
- [Exporting](#exporting)
- [Using the PNG in OBS, vMix, or a video editor](#using-the-png-in-obs-vmix-or-a-video-editor)
- [Customising the look](#customising-the-look)
- [How it works](#how-it-works)
- [Browser support](#browser-support)
- [Privacy](#privacy)
- [Known limitations](#known-limitations)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Live preview.** Every field updates the bar instantly. What you see is exactly what gets exported.
- **TV-style layout.** Skewed team block, boxed score, batter rows with an on-strike marker, bowler figures, and a ball-by-ball "this over" tracker.
- **Three flag modes.** India tricolour (with an SVG Ashoka Chakra), a solid colour block with team initials, or your own uploaded image.
- **Run rate and target line.** Show current run rate, runs required, both, or neither.
- **Ball-by-ball tracker.** Type `0 1 4 W wd 6` and get colour-coded ball icons.
- **Optional bottom strip.** A three-column ribbon for match title, situation, and format.
- **Chroma-key backgrounds.** Green screen, blue screen, black, true transparent PNG, or any custom colour.
- **High-resolution export.** 1×, 2×, or 3× scaling (up to 3708 px wide).
- **Download or copy.** Save a PNG or copy the image straight to your clipboard.
- **Responsive editor.** The preview scales to fit the window, so it works on a laptop or a tablet at the ground.
- **Zero dependencies to install.** One HTML file plus two CDN resources (a web font and html2canvas).

![The full editor with all panels](docs/editor.png)

---

## Quick start

1. Clone or download this repository.
2. Double-click `Cricket scorebar editor.html` to open it in Chrome, Edge, Firefox, or Safari.
3. Edit the fields under the preview.
4. Click **Download PNG** (or **Copy image**).

That is the whole workflow. An internet connection is needed the first time so the browser can fetch the Barlow web font and the html2canvas library.

### Hosting it

Because it is a static file, you can host it anywhere:

```bash
# Serve locally
python3 -m http.server 8000
# then open http://localhost:8000/Cricket%20scorebar%20editor.html
```

For GitHub Pages or Netlify, rename the file to `index.html` and publish the folder.

---

## Using the editor

The editor is a grid of panels under the preview. Each panel maps to one part of the bar.

### Batting team

| Field | What it controls |
|---|---|
| Short name | The team abbreviation shown inside the white score box (e.g. `IND`). |
| Score / Overs | The score (`128-1`) and overs bowled (`15.2`). Both are free text, so `128/1` or `128-1 (DLS)` work too. |
| Block colour | The colour of the skewed team block on the left. The bottom strip also takes its colour from this. |
| Flag | `India tricolor`, `Solid block with initials`, or `Uploaded image`. |
| Upload flag | Choose any image. Uploading automatically switches the flag mode to **Uploaded image** and turns flags on. |

### Bowling team

| Field | What it controls |
|---|---|
| Short name | Shown before the "v" (e.g. `WI v IND 128-1`). |
| Flag | Same three modes as above. |
| Upload flag | As above. |
| Initials colour | Background colour for the initials block when the flag mode is **Solid block with initials**. |
| Show flags in the bar | Toggles both flags on or off. Off by default. |

### Second line

The second line sits under the score inside the team block.

| Field | What it controls |
|---|---|
| Show current run rate | Toggles the run-rate segment. |
| Label / value | e.g. `CURRENT RUN RATE` and `8.35`. |
| Show runs required | Toggles the target segment. |
| Label / value | e.g. `NEED` and `152 OFF 29`. |

Turning both off removes the second line entirely and recentres the first line.

### Batters

Two batter rows, each with a name, runs, and balls faced. The **On strike** dropdown moves the triangle marker to the current striker.

### Bowler panel and ball notation

Tick the **Bowler panel** checkbox in the panel legend to show or hide the whole right-hand segment.

| Field | What it controls |
|---|---|
| Bowler | Name of the current bowler. |
| Figures / overs | e.g. `0-23` and `2.2`. |
| Over label | Text beside the balls, usually `THIS OVER`. |
| Balls | The balls bowled so far, separated by spaces. |

Ball tokens are case-insensitive and rendered as follows:

| Token | Rendered as |
|---|---|
| `0` or `.` | A round dot ball |
| `1`, `2`, `3`, `5` | A square showing the number |
| `4` | A blue square with `4` |
| `6` | A green square with `6` |
| `W` | A red square with `W` (wicket) |
| `wd`, `nb`, `lb`, `b`, `ro` | A dark square with the lowercase abbreviation (wide, no-ball, leg bye, bye, run out) |
| Anything else | A plain square showing the text as typed |

Up to 10 balls are shown, so a full over with extras fits.

Example: `0 1 4 W wd 6` renders as dot, 1, blue 4, red W, dark wd, green 6.

### Bottom strip

Tick the **Bottom strip** checkbox in the legend to add a ribbon under the bar. It has three cells: left (340 px), centre (flexible), and right (170 px). The word "vs" in the left cell is automatically dimmed for a broadcast look, as in `INDIA vs WEST INDIES`.

### Background and export

| Field | What it controls |
|---|---|
| Background | `Green screen` (#1bd91b), `Blue screen` (#0000ff), `Black`, `Transparent (PNG)`, or `Custom color`. |
| Custom colour | Enabled only when **Custom color** is selected. |
| Resolution | `1×` (1236 px wide), `2×` (2472 px wide, default), or `3×` (3708 px wide). |
| Reset to sample | Restores the built-in India v West Indies sample data. |

The preview shows a checkerboard when **Transparent** is selected. The exported PNG has a true alpha channel.

---

## Exporting

**Download PNG** renders the bar off-screen at the chosen resolution and saves a file named like `scorebar-ind-vs-wi.png`.

**Copy image** puts the same PNG on your clipboard so you can paste it straight into a slide, chat, or image editor. This needs a browser that supports writing images to the clipboard (Chrome, Edge, and Safari do; see [Browser support](#browser-support)).

The export includes an 18 px margin around the bar on every side, so the bar's drop shadow is not clipped. That is why the 1× export is 1236 px wide rather than 1200.

If rendering fails, the status text in the header will suggest dropping to a lower resolution.

---

## Using the PNG in OBS, vMix, or a video editor

**Transparent PNG (recommended).** Choose `Transparent (PNG)` as the background and add the file as an image source. No keying needed, and the drop shadow is preserved.

**Green or blue screen.** Choose the matching background, add the image, then apply a chroma-key filter. Use this when your software or workflow expects a keyed graphic.

**Updating during a match.** Keep the editor open in a browser tab. After each over, update the fields, export with the same team names, and overwrite the previous file. Most streaming tools reload image sources automatically when the file changes on disk.

---

## Customising the look

Everything is in one file, so open `Cricket scorebar editor.html` in a text editor.

**Colours of the bar itself.** The bar's ink colour (`#10325a`), gradient (`#edf2f6` to `#cfdae4`), and ball colours live in the `/* the scorebar */` CSS section. Search for `.bar`, `.main`, and `.ball`.

**Editor theme.** The dark UI colours are CSS custom properties on `:root` at the top of the `<style>` block (`--ink`, `--panel`, `--accent`, and so on).

**Fonts.** The bar uses *Barlow Semi Condensed* and the UI uses *Barlow*, both loaded from Google Fonts. Change the `<link>` tag and the `--bar` / `--ui` variables to swap them. If you replace them with locally installed fonts, the page will work offline.

**Default sample data.** The `sample()` function at the top of the `<script>` block returns the initial state. Edit it to make the editor open with your own teams and colours.

**Bar width.** The bar is designed at 1200 px. Several values depend on that number (`.fit`, `.bar`, `.export-wrap`, and `fitPreview()`), so change them together if you need a different base width.

---

## How it works

- **State.** A single plain object `S` holds everything. Every input has a `data-k` attribute such as `bat.0.runs` that names the path into that object.
- **Binding.** On `input`, the value is written into `S` by path and `render()` redraws the whole bar from scratch. There is no framework.
- **Preview scaling.** The bar is always laid out at 1200 px and CSS-transformed down to fit the window, so the preview is pixel-faithful to the export.
- **Export.** The bar is cloned into an off-screen container, [html2canvas](https://html2canvas.hertzen.com/) rasterises it at the chosen scale, and the canvas is turned into a PNG blob. The page waits for `document.fonts.ready` first so the web font is in place.
- **Flags.** The India flag is pure CSS plus a generated SVG chakra. The initials block derives its gradient and text colour from the chosen team colour. Uploaded images are read as data URLs and kept in memory.

---

## Browser support

| Browser | Edit and preview | Download PNG | Copy image |
|---|---|---|---|
| Chrome / Edge (desktop) | Yes | Yes | Yes |
| Safari (macOS) | Yes | Yes | Yes |
| Firefox | Yes | Yes | Yes in Firefox 127 and later; older versions fall back to Download PNG |
| Mobile browsers | Yes | Yes | Varies |

The clipboard button checks for the `ClipboardItem` API and shows a message if it is unavailable.

---

## Privacy

Nothing leaves your browser. Uploaded flag images are converted to data URLs and held in page memory only. The only network requests are to Google Fonts and the cdnjs copy of html2canvas, both made by the browser when the page loads. There is no analytics, storage, or form submission.

---

## Known limitations

- **Needs internet on first load** for the web font and html2canvas. Vendor both locally if you need a fully offline kit.
- **State is not saved.** Reloading the page resets to the sample. Keep the tab open during a match.
- **The ball tracker shows at most 10 balls.**
- **Very long names** will push the bar wider than 1200 px. Use broadcast-style short names (surnames in caps work best).
- **html2canvas is an approximation of the browser's renderer.** Exotic CSS added during customisation may not export identically.

---

## Project structure

```
cricket-scorebar-editor/
├── Cricket scorebar editor.html   # The whole app: markup, styles, and script
├── docs/
│   ├── preview.png                # Screenshot used in this README
│   └── editor.png                 # Screenshot used in this README
└── README.md
```

---

## Contributing

Issues and pull requests are welcome. Because the project is a single file, please:

1. Keep it dependency-free beyond the existing CDN resources.
2. Preserve the 1200 px design width unless the change updates every dependent value.
3. Test an export at 1× and 3× in at least one Chromium browser and one of Safari or Firefox.

---

## License

No license file has been added yet. Until one is, all rights are reserved by the author. If you intend to share or accept contributions, consider adding an [MIT](https://choosealicense.com/licenses/mit/) or similar license.
