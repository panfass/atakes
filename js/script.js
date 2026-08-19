const GROUP_LABELS = {
  tasos_anita: 'Τάσος & Ανίτα',
  tasos: 'Τάσος',
  belesis: 'Μπέλεσης',
  nikolopoulos: 'Νικολόπουλος',
  diafora: 'Διάφορα',
  // individual labels still used for alt text / aria on each card
  Terios: 'Τέριος',
  takis: 'Τάκης',
  gerosathina: 'Γέρος Αθήνας',
  LigoXalara: 'Λίγο Χαλαρά',
  twopizzas: 'Δύο Πίτσες',
  LuxembourgFlag: 'Λουξεμβούργο',
  '10euro': '10άρικο',
  delivery: 'Ντελιβεράς',
  downloadarrow: 'Λήψη',
  'chicken-club-sandwich': 'Κλάμπ Τσίκεν',
};

// Groups with ≤2 clips are folded into the "Διάφορα" tab.
// The card still shows the original per-person image.
const DIAFORA_GROUPS = new Set([
  'takis', 'gerosathina', 'LigoXalara', 'Terios',
  'twopizzas', 'LuxembourgFlag', '10euro',
  'delivery', 'downloadarrow', 'chicken-club-sandwich',
]);

function tabGroupOf(group) {
  return DIAFORA_GROUPS.has(group) ? 'diafora' : group;
}

document.addEventListener('DOMContentLoaded', () => {
  const audioEls = Array.from(document.querySelectorAll('#audio-source audio'));
  let currentAudio = null;
  let currentCard = null;
  let activeGroup = 'all';
  let searchQuery = '';

  // Build clip data from audio elements
  const clips = audioEls.map(el => ({
    el,
    group: el.className,               // original class → used for image src
    tabGroup: tabGroupOf(el.className), // used for tab filtering
    label: GROUP_LABELS[el.className] || el.className,
    title: el.title,
  }));

  // Unique ordered groups (using tabGroup so small groups collapse into Διάφορα)
  const groups = ['all', ...new Set(clips.map(c => c.tabGroup))];

  // ── Tabs ──────────────────────────────────────────────────
  const tabsContainer = document.getElementById('tabs');
  groups.forEach(group => {
    const btn = document.createElement('button');
    btn.dataset.group = group;
    btn.textContent = group === 'all' ? 'Όλες' : (GROUP_LABELS[group] || group);
    btn.className = tabClass(group === 'all');
    btn.addEventListener('click', () => setGroup(group));
    tabsContainer.appendChild(btn);
  });

  // ── Cards ─────────────────────────────────────────────────
  const soundboard = document.getElementById('soundboard');
  clips.forEach(clip => {
    const li = document.createElement('li');
    li.dataset.group = clip.tabGroup;  // filter by tab group, not raw class
    li.dataset.title = clip.title.toLowerCase();

    const btn = document.createElement('button');
    btn.className = [
      'w-full flex flex-col items-center gap-2 p-3',
      'bg-white rounded-xl shadow-sm border border-slate-100',
      'hover:shadow-md hover:border-blue-200 transition-all cursor-pointer',
    ].join(' ');
    btn.setAttribute('aria-label', clip.title);

    btn.innerHTML = `
      <div class="relative w-full">
        <img src="imgs/${clip.group}.png" alt="${clip.label}"
             class="w-full aspect-square object-cover rounded-lg" loading="lazy"
             onerror="this.style.visibility='hidden'">
        <div class="play-ring pointer-events-none absolute inset-0 rounded-lg ring-0 ring-blue-400 ring-offset-2 transition-all"></div>
      </div>
      <span class="text-xs text-slate-600 text-center leading-tight font-medium">${clip.title}</span>
    `;

    btn.addEventListener('click', () => playClip(clip.el, btn));
    li.appendChild(btn);
    soundboard.appendChild(li);
  });

  // ── Playback ──────────────────────────────────────────────
  function playClip(audioEl, cardBtn) {
    if (currentAudio && currentAudio !== audioEl) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setPlaying(currentCard, false);
    }
    audioEl.currentTime = 0;
    audioEl.play();
    currentAudio = audioEl;
    currentCard = cardBtn;
    setPlaying(cardBtn, true);
    audioEl.onended = () => setPlaying(cardBtn, false);
  }

  function setPlaying(btn, on) {
    if (!btn) return;
    const ring = btn.querySelector('.play-ring');
    if (on) {
      btn.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
      ring && ring.classList.add('bg-blue-400/10');
    } else {
      btn.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
      ring && ring.classList.remove('bg-blue-400/10');
    }
  }

  // ── Filtering ─────────────────────────────────────────────
  function setGroup(group) {
    activeGroup = group;
    document.querySelectorAll('#tabs button').forEach(btn => {
      btn.className = tabClass(btn.dataset.group === group);
    });
    filterCards();
  }

  function filterCards() {
    const cards = soundboard.querySelectorAll('li');
    let visible = 0;
    cards.forEach(card => {
      const matchGroup = activeGroup === 'all' || card.dataset.group === activeGroup;
      const matchSearch = !searchQuery || card.dataset.title.includes(searchQuery);
      const show = matchGroup && matchSearch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    document.getElementById('no-results').classList.toggle('hidden', visible > 0);
  }

  document.getElementById('search').addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    filterCards();
  });

  // ── Easter egg ────────────────────────────────────────────
  document.getElementById('btn-easter').addEventListener('click', () => {
    const zone = document.getElementById('easter-egg-content');
    zone.classList.remove('hidden');
    if (!zone.querySelector('img')) {
      const img = document.createElement('img');
      img.src = 'bele_xexexe.gif';
      img.className = 'mx-auto rounded-xl max-w-xs';
      img.alt = 'Χεχεχεχε';
      zone.appendChild(img);
    }
    const xexexe = document.getElementById('xexexe');
    if (xexexe) { xexexe.currentTime = 0; xexexe.play(); }
  });

  // ── Helpers ───────────────────────────────────────────────
  function tabClass(active) {
    return [
      'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
      active
        ? 'bg-blue-500 text-white shadow-sm'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    ].join(' ');
  }
});