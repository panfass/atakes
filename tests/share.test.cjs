const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

const shareScript = readFileSync(resolve(__dirname, '../js/share.js'), 'utf8');
const script = readFileSync(resolve(__dirname, '../js/script.js'), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));

function element() {
  return {
    children: [], attributes: {}, listeners: {}, textContent: '', hidden: false,
    append(...children) { this.children.push(...children); },
    appendChild(child) { this.children.push(child); },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(event, handler) { this.listeners[event] = handler; },
  };
}

function setup(options = {}) {
  const shares = [];
  let requests = 0;
  const context = vm.createContext({
    document: { createElement: element, addEventListener() {} },
    window: { isSecureContext: options.secure !== false, ...options.window },
    navigator: options.navigator || {
      canShare: options.canShare || (() => true),
      share: data => { shares.push(data); return options.share ? options.share(data) : Promise.resolve(); },
    },
    File,
    fetch: async () => {
      requests++;
      return options.fetch ? options.fetch(requests) : { ok: true, blob: async () => new Blob(['audio']) };
    },
  });
  vm.runInContext(shareScript, context);
  vm.runInContext(script, context);
  const container = element();
  const audio = {
    title: 'Χεχεχεχε',
    dataset: {},
    querySelector: () => options.optOut ? null : { getAttribute: () => 'audio/mpele/mpele_xexexe.mp3' },
  };
  if (options.gif) {
    context.addFileShareControls(container, {
      source: 'bele_xexexe.gif', title: audio.title, mimeType: 'image/gif', extension: 'gif', kind: 'gif',
    });
  } else {
    context.addAudioShareControls(container, audio);
  }
  const [button, status] = container.children[0]?.children || [];
  return { container, button, status, shares, requests: () => requests };
}

test('prepares an MP3, then shares only the cached file immediately on a tap', async () => {
  const ui = setup();
  assert.equal(ui.button.disabled, true);
  await flush();
  assert.equal(ui.shares.length, 0);
  const click = ui.button.listeners.click();
  assert.equal(ui.shares.length, 1);
  const data = ui.shares[0];
  assert.deepEqual(Object.keys(data), ['files']);
  assert.equal(data.files[0].name, 'Χεχεχεχε.mp3');
  assert.equal(data.files[0].type, 'audio/mpeg');
  assert.equal(await data.files[0].text(), 'audio');
  assert.equal(ui.requests(), 1);
  await click;
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.container.children[0].children.length, 2);
});

test('disables sharing without fetching when native sharing is unavailable', () => {
  for (const options of [{ navigator: {} }, { secure: false }]) {
    const ui = setup(options);
    assert.equal(ui.button.disabled, true);
    assert.ok(ui.button.title);
    assert.equal(ui.requests(), 0);
  }
});

test('disables sharing and explains when the actual file is rejected', async () => {
  let checkedFile;
  const ui = setup({ canShare: data => { checkedFile = data.files[0]; return false; } });
  await flush();
  assert.equal(checkedFile.type, 'audio/mpeg');
  assert.equal(ui.button.disabled, true);
  assert.ok(ui.status.textContent.includes('δεν υποστηρίζεται'));
});

test('failed fetch can be retried, requiring another tap after preparation', async () => {
  const ui = setup({ fetch: count => count === 1
    ? { ok: false, status: 404 }
    : { ok: true, blob: async () => new Blob(['audio']) } });
  await flush();
  assert.equal(ui.button.textContent, 'Δοκίμασε ξανά');
  await ui.button.listeners.click();
  assert.equal(ui.requests(), 2);
  assert.equal(ui.shares.length, 0);
  await ui.button.listeners.click();
  assert.equal(ui.shares.length, 1);
});

test('empty audio does not become a shareable file', async () => {
  const ui = setup({ fetch: () => ({ ok: true, blob: async () => new Blob([]) }) });
  await flush();
  assert.equal(ui.button.textContent, 'Δοκίμασε ξανά');
  assert.equal(ui.shares.length, 0);
});

test('cancel is quiet; other share failures allow retry', async () => {
  for (const name of ['AbortError', 'NotAllowedError', 'DataError']) {
    const ui = setup({ share: () => Promise.reject(Object.assign(new Error(), { name })) });
    await flush();
    await ui.button.listeners.click();
    assert.equal(ui.button.disabled, false);
    assert.equal(ui.status.textContent === '', name === 'AbortError');
  }
});

test('ignores repeated taps while the native sheet is open', async () => {
  let finish;
  const ui = setup({ share: () => new Promise(resolve => { finish = resolve; }) });
  await flush();
  const first = ui.button.listeners.click();
  await ui.button.listeners.click();
  assert.equal(ui.shares.length, 1);
  assert.equal(ui.button.disabled, true);
  finish();
  await first;
  assert.equal(ui.button.disabled, false);
});

test('clips without a share source do not add controls or fetch audio', () => {
  const ui = setup({ optOut: true });
  assert.equal(ui.container.children.length, 0);
  assert.equal(ui.requests(), 0);
});

test('prepares clips only as they approach the viewport, once per card', async () => {
  let intersect;
  let observed;
  let disconnected = false;
  const ui = setup({ window: { IntersectionObserver: class {
    constructor(callback, options) {
      intersect = callback;
      assert.equal(options.rootMargin, '200px');
    }
    observe(target) { observed = target; }
    disconnect() { disconnected = true; }
  } } });
  assert.equal(observed, ui.container);
  assert.equal(ui.requests(), 0);
  intersect([{ isIntersecting: false }]);
  assert.equal(ui.requests(), 0);
  intersect([{ isIntersecting: true }]);
  await flush();
  assert.equal(ui.requests(), 1);
  assert.equal(disconnected, true);
  assert.equal(ui.button.disabled, false);
});

test('every soundboard clip has a nonempty MP3 sharing source on disk', () => {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
  const clips = [...html.matchAll(/<audio\b[^>]*>([\s\S]*?)<\/audio>/g)];
  assert.equal(clips.length, 46);
  for (const clip of clips) {
    const src = clip[1].match(/<source src="([^"]+\.mp3)" type="audio\/mpeg"/);
    assert.ok(src, `Missing MP3 in ${clip[0]}`);
    assert.ok(readFileSync(resolve(__dirname, '..', src[1])).length > 0, src[1]);
  }
});

test('shares original GIF bytes, with a GIF filename and no link or caption', async () => {
  const original = readFileSync(resolve(__dirname, '../bele_xexexe.gif'));
  const ui = setup({ gif: true, fetch: () => ({ ok: true, blob: async () => new Blob([original]) }) });
  await flush();
  assert.equal(ui.button.textContent, 'Κοινοποίηση GIF');
  const click = ui.button.listeners.click();
  assert.equal(ui.shares.length, 1);
  await click;
  assert.deepEqual(Object.keys(ui.shares[0]), ['files']);
  const file = ui.shares[0].files[0];
  assert.equal(file.name, 'Χεχεχεχε.gif');
  assert.equal(file.type, 'image/gif');
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), original);
});

test('GIF sharing explains unsupported browsers and permits retry after file failures', async () => {
  const unsupported = setup({ gif: true, navigator: {} });
  assert.equal(unsupported.button.disabled, true);
  assert.ok(unsupported.status.textContent.includes('GIF'));
  const ui = setup({ gif: true, fetch: count => count === 1
    ? { ok: false, status: 503 }
    : { ok: true, blob: async () => new Blob(['GIF89a']) } });
  await flush();
  assert.equal(ui.button.textContent, 'Δοκίμασε ξανά');
  assert.ok(ui.status.textContent.includes('GIF'));
  await ui.button.listeners.click();
  assert.equal(ui.shares.length, 0);
  await ui.button.listeners.click();
  assert.equal(ui.shares.length, 1);
});

test('GIF cancellation is quiet and failure re-enables sharing', async () => {
  for (const name of ['AbortError', 'NotAllowedError', 'DataError']) {
    const ui = setup({ gif: true, share: () => Promise.reject(Object.assign(new Error(), { name })) });
    await flush();
    await ui.button.listeners.click();
    assert.equal(ui.button.disabled, false);
    assert.equal(ui.status.textContent === '', name === 'AbortError');
  }
});
