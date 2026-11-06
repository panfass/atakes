# Ατάκες χεχεχεχε

A personal HTML5 soundboard and GIF library featuring clips from friends, built for fun and deployed on GitHub Pages.

🔊 **Live site:** [atakes.fassarispan.com](https://atakes.fassarispan.com)

---

## Features

- Click any card to play the clip — only one plays at a time
- Filter by person using the tab bar
- Search clips by title in real time
- Responsive grid — works on mobile and desktop
- Share any clip as an MP3 through the device's native share sheet
- Browse a GIF collection with search, categories, enlarged previews, and native file sharing
- No Flash, no jQuery, no build step — pure HTML5, vanilla JS, and Tailwind CSS CDN

## Project Structure

```
index.html          — Main soundboard page
gifs.html           — GIF library page
js/script.js        — Vanilla JS: reads audio elements, builds tabs/cards, handles playback & search
js/gifs.js          — GIF catalog, filtering, animation, and accessible preview dialog
js/share.js         — Shared native file sharing for audio and GIFs
data/gifs.json      — GIF catalog (titles, categories, tags, assets, and dimensions)
imgs/gifs/          — Static GIF preview images
imgs/               — Button images (one .png per group)
audio/              — Audio clips organised by person/group
  tasos_anita/
  tasos/
  mpele/
  takis/
  nikolopoulos/
css/                — Legacy Bootstrap CSS (not used in modern version)
admin_panel.html    — Snippet generator for adding new clips (live at /admin_panel.html)
```

## Audio sharing

Every clip has a **Κοινοποίηση ήχου** (Share audio) button. Native sharing needs HTTPS (or localhost) and a browser supporting audio file sharing. Open the site through a web server, rather than double-clicking `index.html`. For local preview, run `python -m http.server 8000 --bind 127.0.0.1` from the repository and open `http://localhost:8000/`.

MP3 files are prepared as cards approach the viewport and cached in memory for subsequent shares. This lets the share sheet open directly from a tap without waiting on a network request. If loading fails, tap Retry, then tap Share audio once preparation finishes. Unsupported browsers show a disabled share button. There is no download button. Sharing sends only the audio file with MIME type `audio/mpeg`, without a website link or caption.

Each `<audio>` element uses an MP3 `<source type="audio/mpeg">` for playback and sharing; original OGG files remain as playback fallbacks. To create MP3 copies of new OGG files, install FFmpeg and run:

```sh
python tools/prepare-audio.py
# Or provide an executable path:
python tools/prepare-audio.py --ffmpeg /path/to/ffmpeg
```

The converter skips existing MP3 files. Add the MP3 source to the audio element after conversion, or use the admin snippet generator, which generates an MP3 source and an OGG fallback when given an OGG path. Conversion happens during maintenance; the deployed site requires no FFmpeg, Python, or backend.

Run the automated sharing checks with Node.js 20 or newer:

```sh
node --check js/script.js
node --check js/share.js
node --check js/gifs.js
node --test tests/share.test.cjs tests/gifs.test.cjs
```

For phone acceptance testing, open the site over HTTPS in Android Chrome and iPhone Safari with Messenger, Instagram, and Viber installed. For each of the six combinations, record whether the app appears in the share sheet, accepts the file, and delivers a voice-style player, an audio attachment, or rejects it. Verify recipient playback, cancellation, retry after a failed request, and several clips from different groups. Native app delivery has not yet been verified; receiving apps control presentation and acceptance. A resolved share promise does not confirm message delivery.

## GIF library

Use the **Ήχοι | GIFs** navigation or open `/gifs.html`. The initial collection contains the existing Χεχεχεχε GIF in the Μπέλεσης category. Search matches titles, categories, and tags, including Greek text without accents. Categories and search combine.

Cards preserve each GIF's proportions in a responsive two-column mobile grid. Autoplay is enabled by default, including when the system requests reduced motion; use **Παύση GIFs** to pause the gallery, and **Αναπαραγωγή GIFs** to resume it. Animations run only while cards are visible and the page is active; opening the enlarged preview pauses card animations. The preview follows the gallery's autoplay setting when opened and also has its own play/pause control. The preview supports close, Escape, keyboard focus containment, and return to its triggering card.

**Κοινοποίηση GIF** sends the actual `.gif` file as `image/gif`, using the same preparation, retry, cancellation, and support detection as audio sharing. There is no download button. Test animation after delivery on Android/iPhone in Messenger, Instagram, and Viber; accepting a GIF file does not guarantee an animated chat presentation. No public GIF provider or API key is involved.

### Adding a GIF

1. Add the original GIF to a `gifs/` folder (the existing `bele_xexexe.gif` stays at its current path for the soundboard Easter egg).
2. Create a static JPEG preview, for example with FFmpeg:

   ```sh
   ffmpeg -i gifs/new.gif -frames:v 1 -q:v 3 imgs/gifs/new.jpg
   ```

3. Add an entry to `data/gifs.json`, using the GIF's actual pixel dimensions:

   ```json
   {
     "id": "new-gif",
     "title": "Τίτλος GIF",
     "category": "Μπέλεσης",
     "tags": ["αντίδραση", "reaction"],
     "src": "gifs/new.gif",
     "preview": "imgs/gifs/new.jpg",
     "width": 320,
     "height": 240
   }
   ```

4. Keep IDs unique, include all fields, and use paths relative to the site root without a leading slash. Categories are created automatically. Test preview and sharing through localhost or HTTPS before publishing.

## Adding a New Clip

1. Drop the MP3 file into the correct `audio/<folder>/` subfolder. If starting from OGG, run the conversion command above first.
2. Open `index.html` and paste a new `<audio>` block inside `<div hidden id="audio-source">`:

```html
<audio class="groupname" title="Clip title here">
    <source src="audio/groupname/filename.mp3" type="audio/mpeg" />
    <!-- Optional original OGG fallback: -->
    <source src="audio/groupname/filename.ogg" type="audio/ogg" />
</audio>
```

3. The `class` must match the button image filename in `imgs/` (e.g. `class="tasos"` → `imgs/tasos.png`).
4. Commit and push:

```bash
git add . && git commit -m "add: clip title" && git push
```

> **Tip:** Visit [atakes.fassarispan.com/admin_panel.html](https://atakes.fassarispan.com/admin_panel.html) for a form that generates the correct snippet for you.

## Adding a New Group (Person)

1. Add a button image at `imgs/<groupname>.png` (138×120 px recommended).
2. Add the group label to `GROUP_LABELS` in `js/script.js`.
3. If the group will have ≤2 clips, also add the key to `DIAFORA_GROUPS` so it folds into the **Διάφορα** tab automatically. Remove it from `DIAFORA_GROUPS` later if you add more clips.
4. Add clips using the format above with the new group class.

## Tab categories

| Tab | Groups included |
|---|---|
| Τάσος & Ανίτα | `tasos_anita` |
| Τάσος | `tasos` |
| Μπέλεσης | `belesis` |
| Νικολόπουλος | `nikolopoulos` |
| Διάφορα | `takis`, `gerosathina`, `LigoXalara`, `Terios`, `twopizzas`, `LuxembourgFlag`, `10euro`, `delivery`, `downloadarrow`, `chicken-club-sandwich` |

Groups with ≤2 clips are folded into **Διάφορα** via `DIAFORA_GROUPS` in `js/script.js`. Each card still shows its own image.

## Deployment

Hosted on **GitHub Pages** from the `main` branch with a custom domain (`atakes.fassarispan.com`).  
Every `git push` to `main` triggers a new deployment automatically.

## Tech Stack

| | |
|---|---|
| Styling | [Tailwind CSS](https://tailwindcss.com) (CDN, no build step) |
| JS | Vanilla ES2020 |
| Audio | HTML5 `<audio>` + `.ogg` / `.mp3` |
| Hosting | GitHub Pages |

## Credits

Based on the [Bootstrap HTML5 Soundboard](https://github.com/sk33lz/bootstrap-html5-soundboard) template by sk33lz.  
Modernized and customized by [TakisFass](https://fassarispan.com).

4. Looking at the source code's `index.html` you would copy the following lines, Lines 84-88, and paste them on the following line, Line 89.

        <audio class="raven" title="Great Odin's Raven! Clip">
		    <source src="audio/raven.mp3" />
		    <source src="audio/raven.ogg" />
		    <source src="audio/raven.wav" />
        </audio>

5. Modify the `<audio>` title to what you would like users to see when they mouseover the image.
		
6. Rinse and repeat these steps for additional soundboard entries with audio clips with images. Just make sure that your `<audio>` class name, your image name, and your `<audio>` src clip name match, or the jQuery won't work properly in rendering the soundboard.

## Issues

Found an issue with this script? Please [Submit an Issue](https://github.com/sk33lz/bootstrap-html5-soundboard/issues) on GitHub.

## Feature Requests

Want to see something new in this script? Please [Submit a Pull Request](https://github.com/sk33lz/bootstrap-html5-soundboard/pulls) on GitHub. If it's something useful I will merge it into the codebase.

## Learn More

Learn more about the Bootstrap HTML5 Soundboard on the [Wiki page](https://github.com/sk33lz/bootstrap-html5-soundboard/wiki) on GitHub.

## Credits

- The Bootstrap HTML5 Soundboard was inspired by [Perry Harlock's HTML5 Soundboard](https://github.com/perryharlock/soundboard).

- The JavaScript used in this soundboard was found in [this blog post](http://blog.mozilla.org/webdev/2009/08/06/html5-audio-soundboard/).

- The following audio files and image files included in this repository are copyright their original content creators and copyright owners. These files were included as examples of the types of audio files and image files that can be used in this HTML Soundboard script. These files are included for educational purposes and research only. They should fall under [Fair Use](http://copyright.gov/fair-use/more-info.html).

  - [Chewbacca sound byte](https://www.youtube.com/watch?v=Pr3sBks5o_8) from Star Wars recorded from YouTube.
  - [Phil Connors sound byte](http://goo.gl/B9D74) from Groundhog Day downloaded from moviesoundclips.net.
  - [Obi-Wan Kenobi sound byte](http://goo.gl/IH9Bg) from Star Wars: A New Hope downloaded from moviesoundclips.net.
  - [Ron Burgundy sound byte](http://goo.gl/wkT0M) from Anchorman: The Legend of Ron Burgundy downloaded from moviesoundclips.net.
