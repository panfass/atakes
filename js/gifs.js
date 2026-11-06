// Match Greek text with or without accents, as well as Latin tags.
function normalizeGifText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('el').replace(/ς/g, 'σ');
}

function filterGifCatalog(items, query, category) {
  const terms = normalizeGifText(query).trim().split(/\s+/).filter(Boolean);
  return items.filter(item => {
    const text = normalizeGifText([item.title, item.category, ...item.tags].join(' '));
    return (category === null || item.category === category) && terms.every(term => text.includes(term));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gif-gallery');
  const categories = document.getElementById('gif-categories');
  const search = document.getElementById('gif-search');
  const loadStatus = document.getElementById('gif-load-status');
  const retry = document.getElementById('gif-retry');
  const noResults = document.getElementById('gif-no-results');
  const dialog = document.getElementById('gif-preview');
  const dialogTitle = document.getElementById('gif-preview-title');
  const dialogImage = document.getElementById('gif-preview-image');
  const dialogError = document.getElementById('gif-preview-error');
  const motionButton = document.getElementById('gif-preview-motion');
  const autoplayButton = document.getElementById('gif-autoplay');
  const cards = [];
  let catalog = [];
  let category = null;
  let selectedItem = null;
  let previewTrigger = null;
  let dialogPlaying = false;
  let autoplay = true;

  function setImageSource(image, source) {
    if (image.getAttribute('src') !== source) image.src = source;
  }

  function updateCardAnimation(card) {
    const animate = autoplay && card.visible && !card.li.hidden
      && !document.hidden && !dialog.open && !card.animationFailed;
    setImageSource(card.image, animate ? card.item.src : card.item.preview);
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const card = cards.find(card => card.li === entry.target);
        if (card) {
          card.visible = entry.isIntersecting;
          updateCardAnimation(card);
        }
      });
    }) : null;

  function updateDialogAnimation() {
    if (!selectedItem) return;
    setImageSource(dialogImage, dialogPlaying && !document.hidden ? selectedItem.src : selectedItem.preview);
    motionButton.textContent = dialogPlaying ? 'Παύση' : 'Αναπαραγωγή';
    motionButton.setAttribute('aria-pressed', String(dialogPlaying));
  }

  function openPreview(item, trigger) {
    selectedItem = item;
    previewTrigger = trigger;
    dialogTitle.textContent = item.title;
    dialogImage.alt = item.title;
    dialogImage.width = item.width;
    dialogImage.height = item.height;
    dialogError.hidden = true;
    dialogPlaying = autoplay;
    updateDialogAnimation();
    dialog.showModal();
    cards.forEach(updateCardAnimation);
  }

  document.getElementById('gif-preview-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    selectedItem = null;
    dialogPlaying = false;
    dialogImage.removeAttribute('src');
    previewTrigger?.focus();
    cards.forEach(updateCardAnimation);
  });
  dialogImage.addEventListener('error', () => {
    if (!selectedItem) return;
    dialogError.hidden = false;
    dialogPlaying = false;
    motionButton.textContent = 'Αναπαραγωγή';
    motionButton.setAttribute('aria-pressed', 'false');
    setImageSource(dialogImage, selectedItem.preview);
  });
  motionButton.addEventListener('click', () => {
    dialogError.hidden = true;
    dialogPlaying = !dialogPlaying;
    updateDialogAnimation();
  });
  autoplayButton.addEventListener('click', () => {
    autoplay = !autoplay;
    autoplayButton.textContent = autoplay ? 'Παύση GIFs' : 'Αναπαραγωγή GIFs';
    autoplayButton.setAttribute('aria-pressed', String(autoplay));
    cards.forEach(updateCardAnimation);
  });
  document.addEventListener('visibilitychange', () => {
    updateDialogAnimation();
    cards.forEach(updateCardAnimation);
  });

  function filterCards() {
    const matching = new Set(filterGifCatalog(catalog, search.value, category).map(item => item.id));
    cards.forEach(card => {
      card.li.hidden = !matching.has(card.item.id);
      updateCardAnimation(card);
    });
    noResults.hidden = matching.size > 0;
    categories.querySelectorAll('button').forEach(button => {
      const active = button.dataset.category === (category ?? '');
      button.setAttribute('aria-pressed', String(active));
      button.className = `shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${active
        ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`;
    });
  }

  search.addEventListener('input', filterCards);

  function buildGallery() {
    [null, ...new Set(catalog.map(item => item.category))].forEach(value => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.category = value ?? '';
      button.textContent = value ?? 'Όλα';
      button.addEventListener('click', () => { category = value; filterCards(); });
      categories.appendChild(button);
    });

    catalog.forEach(item => {
      const li = document.createElement('li');
      li.dataset.id = item.id;
      li.className = 'min-w-0';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w-full bg-white p-2 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-shadow';
      button.setAttribute('aria-label', `Προεπισκόπηση GIF: ${item.title}`);
      button.setAttribute('aria-haspopup', 'dialog');
      const image = document.createElement('img');
      image.src = item.preview;
      image.alt = item.title;
      image.width = item.width;
      image.height = item.height;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.className = 'w-full h-auto rounded-lg bg-slate-100';
      const title = document.createElement('span');
      title.className = 'block px-1 pt-2 pb-1 text-xs font-medium text-slate-600';
      title.textContent = item.title;
      button.append(image, title);
      button.addEventListener('click', () => openPreview(item, button));
      li.appendChild(button);
      addFileShareControls(li, {
        source: item.src, title: item.title, mimeType: 'image/gif', extension: 'gif', kind: 'gif',
      });
      gallery.appendChild(li);
      const card = { li, image, item, visible: false, animationFailed: false };
      cards.push(card);
      image.addEventListener('error', () => {
        card.animationFailed = true;
        setImageSource(image, item.preview);
      });
      // Without viewport observation, leave thumbnails static; the dialog can animate.
      observer?.observe(li);
    });
    filterCards();
  }

  async function loadCatalog() {
    retry.hidden = true;
    loadStatus.hidden = false;
    loadStatus.textContent = 'Φόρτωση συλλογής…';
    try {
      const response = await fetch('data/gifs.json');
      if (!response.ok) throw new Error(`Catalog fetch failed: ${response.status}`);
      const items = await response.json();
      const ids = new Set();
      if (!Array.isArray(items) || !items.every(item => {
        if (!item || !['id', 'title', 'category', 'src', 'preview'].every(key => typeof item[key] === 'string' && item[key])
          || !Array.isArray(item.tags) || !item.tags.every(tag => typeof tag === 'string')
          || !Number.isFinite(item.width) || item.width <= 0 || !Number.isFinite(item.height) || item.height <= 0
          || ids.has(item.id)) return false;
        ids.add(item.id);
        return true;
      })) throw new Error('Invalid GIF catalog');
      catalog = items;
      buildGallery();
      loadStatus.hidden = true;
    } catch (error) {
      loadStatus.textContent = 'Δεν φορτώθηκε η συλλογή GIF. Δοκίμασε ξανά.';
      retry.hidden = false;
    }
  }
  retry.addEventListener('click', loadCatalog);
  loadCatalog();
});
