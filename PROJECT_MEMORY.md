# Project Memory

## Architecture
- Static Greek soundboard hosted on GitHub Pages, using vanilla JavaScript and Tailwind CDN. `index.html` supplies hidden audio elements; `js/script.js` generates playback cards, tabs, and search.

## Audio sharing decision (2026-11-06)
- Started with a one-clip prototype, then expanded to all 46 clips at the user's request. Converted 45 OGG files into MP3 siblings; originals remain as playback fallbacks. MP3 sources also improve playback compatibility.
- Sharing discovers the `source[type="audio/mpeg"]` in each audio element, with `data-share-src` available as an override. Independent sibling controls preserve playback behavior. No backend, app SDK, or runtime transcoding is needed.
- Prepare the File before the sharing tap, check `navigator.canShare` against it, and share files only with MIME `audio/mpeg`. Fetching before enabling sharing avoids losing transient activation during network requests.
- User explicitly requested share-only controls, so download buttons and download-related error guidance were removed. Unsupported sharing is disabled; preparation retries and quiet native cancellation remain.
- IntersectionObserver prepares cards within 200px of the viewport, then disconnects; files stay cached for repeat sharing. Browsers without this API prepare immediately.
- `tools/prepare-audio.py` uses FFmpeg to convert missing MP3 siblings and skips existing files. The admin generator emits MP3 sources (plus OGG fallbacks for OGG inputs) so future clips inherit sharing. FFmpeg was obtained through imageio-ffmpeg in a temporary tools directory, with no runtime dependency added to the site.
- Dependency-free Node tests exercise sharing and failure paths. Headless Edge decoded all 46 MP3s and verified card controls, search, tabs, and a stubbed native handoff. Receiving apps decide presentation and acceptance; physical device/app delivery remains unverified.

## GIF library decision (2026-11-06)
- Added `gifs.html` alongside the soundboard, with shared Ήχοι/GIFs navigation. Same audience and static hosting make a second project unnecessary. Existing vanilla JS/Tailwind styling is retained without adding a framework or provider API.
- `data/gifs.json` is the curated catalog: unique ID, title, category, tags, GIF path, static preview path, and original width/height. Seeded with the existing Χεχεχεχε GIF; its original root path remains unchanged for the Easter egg. The 16 KB JPEG preview was extracted with FFmpeg from the 2.6 MB GIF.
- `js/share.js` owns native file preparation and sharing; audio uses a thin wrapper and GIFs use `image/gif`. No download controls. Native app acceptance/animation remains outside the site's control.
- GIF cards autoplay by default only onscreen while the document is visible and the preview dialog is closed. At the user's explicit request, system reduced-motion no longer suppresses autoplay; the gallery has an explicit pause/resume button instead. Offscreen and no-IntersectionObserver cases use static thumbnails. The dialog starts according to the gallery autoplay setting, has independent play/pause controls, and restores focus on Escape/close.
- Search normalizes Greek accents and final sigma, matching all query terms across title/category/tags. Catalog loading failures have retry controls; category chips are generated from catalog entries.
- Verified 16 Node tests and headless Edge browser scenarios for gallery/dialog, sharing payload, filtering, animation, reduced motion, failure/retry, navigation, and audio regression. See CURRENT_STATE.md for release status.
