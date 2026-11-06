// Native file sharing shared by sound and GIF cards.
function addFileShareControls(container, { source, title, mimeType, extension, kind }) {
  const isGif = kind === 'gif';
  const label = isGif ? 'Κοινοποίηση GIF' : 'Κοινοποίηση ήχου';
  const unsupportedMessage = isGif
    ? 'Η κοινοποίηση GIF δεν υποστηρίζεται σε αυτό το πρόγραμμα περιήγησης. Δοκίμασε από κινητό μέσω HTTPS.'
    : 'Η κοινοποίηση ήχου δεν υποστηρίζεται σε αυτό το πρόγραμμα περιήγησης. Δοκίμασε από κινητό μέσω HTTPS.';
  const filename = `${title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim() || 'atakes'}.${extension}`;
  const controls = document.createElement('div');
  controls.className = 'mt-2 flex flex-col items-center gap-1';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'min-h-11 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 disabled:opacity-50';
  button.setAttribute('aria-label', `${label}: ${title}`);
  button.textContent = label;
  button.disabled = true;

  const status = document.createElement('p');
  status.className = 'text-xs text-slate-500 text-center';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  controls.append(button, status);
  container.appendChild(controls);

  if (!window.isSecureContext || !navigator.share || !navigator.canShare) {
    button.title = unsupportedMessage;
    if (isGif) status.textContent = unsupportedMessage;
    return;
  }

  let file = null;
  let preparing = null;
  let sharing = false;

  function prepare() {
    if (preparing) return preparing;
    let unsupported = false;
    button.disabled = true;
    button.textContent = 'Προετοιμασία…';
    status.textContent = '';
    preparing = (async () => {
      try {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`File fetch failed: ${response.status}`);
        const blob = await response.blob();
        if (!blob.size) throw new Error('Shared file is empty');
        file = new File([blob], filename, { type: mimeType });
        if (!navigator.canShare({ files: [file] })) {
          unsupported = true;
          file = null;
          button.textContent = label;
          status.textContent = unsupportedMessage;
          return;
        }
        button.textContent = label;
      } catch (error) {
        file = null;
        button.textContent = 'Δοκίμασε ξανά';
        status.textContent = isGif ? 'Δεν φορτώθηκε το GIF. Δοκίμασε ξανά.' : 'Δεν φορτώθηκε ο ήχος. Δοκίμασε ξανά.';
      } finally {
        preparing = null;
        button.disabled = unsupported;
      }
    })();
    return preparing;
  }

  button.addEventListener('click', async () => {
    if (sharing) return;
    if (!file) {
      // Preparation ends with a fresh tap so slow fetches cannot consume activation.
      await prepare();
      return;
    }
    sharing = true;
    button.disabled = true;
    status.textContent = '';
    try {
      // Call directly from the tap, with no fetch/await before opening the sheet.
      await navigator.share({ files: [file] });
    } catch (error) {
      if (error.name !== 'AbortError') {
        status.textContent = 'Δεν έγινε η κοινοποίηση. Δοκίμασε ξανά.';
      }
    } finally {
      sharing = false;
      button.disabled = false;
    }
  });

  // Prepare nearby cards ahead of a tap without downloading the entire board.
  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        prepare();
      }
    }, { rootMargin: '200px' });
    observer.observe(container);
  } else {
    prepare();
  }
}
