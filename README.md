# Ατάκες χεχεχεχε

A personal HTML5 soundboard featuring audio clips from friends, built for fun and deployed on GitHub Pages.

🔊 **Live site:** [atakes.fassarispan.com](https://atakes.fassarispan.com)

---

## Features

- Click any card to play the clip — only one plays at a time
- Filter by person using the tab bar
- Search clips by title in real time
- Responsive grid — works on mobile and desktop
- No Flash, no jQuery, no build step — pure HTML5, vanilla JS, and Tailwind CSS CDN

## Project Structure

```
index.html          — Main soundboard page
js/script.js        — Vanilla JS: reads audio elements, builds tabs/cards, handles playback & search
imgs/               — Button images (one .png per group)
audio/              — Audio clips organised by person/group
  tasos_anita/
  tasos/
  mpele/
  takis/
  nikolopoulos/
css/                — Legacy Bootstrap CSS (not used in modern version)
admin_panel.html    — Local-only snippet generator (gitignored, not deployed)
```

## Adding a New Clip

1. Drop the `.ogg` (or `.mp3`) file into the correct `audio/<folder>/` subfolder.
2. Open `index.html` and paste a new `<audio>` block inside `<div hidden id="audio-source">`:

```html
<audio class="groupname" title="Clip title here">
    <source src="audio/groupname/filename.ogg" />
</audio>
```

3. The `class` must match the button image filename in `imgs/` (e.g. `class="tasos"` → `imgs/tasos.png`).
4. Commit and push:

```bash
git add . && git commit -m "add: clip title" && git push
```

> **Tip:** Open `admin_panel.html` locally in your browser for a form that generates the correct snippet for you.

## Adding a New Group (Person)

1. Add a button image at `imgs/<groupname>.png` (138×120 px recommended).
2. Add the group label to `GROUP_LABELS` in `js/script.js`.
3. Add clips using the format above with the new group class.

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


3. Upload your new PNG image file to the the img directory, 'img'. (Formats: .png)

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