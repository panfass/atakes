const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ document: { addEventListener() {} } });
vm.runInContext(readFileSync(resolve(__dirname, '../js/gifs.js'), 'utf8'), context);
const catalog = JSON.parse(readFileSync(resolve(__dirname, '../data/gifs.json'), 'utf8'));

test('GIF search matches accentless Greek, final sigma, titles, and Latin tags', () => {
  for (const query of ['Μπελεσης', 'ΜΠΕΛΕΣΗΣ', 'Χεχε', 'laugh', 'ΓΕΛΙΟ']) {
    assert.equal(context.filterGifCatalog(catalog, query, null).length, 1, query);
  }
  assert.equal(context.filterGifCatalog(catalog, 'not-a-match', null).length, 0);
});

test('search terms and categories filter together', () => {
  const items = [...catalog, { ...catalog[0], id: 'other', category: 'Άλλο', tags: ['reaction'] }];
  assert.equal(context.filterGifCatalog(items, '', null).length, 2);
  assert.equal(context.filterGifCatalog(items, 'laugh', 'Άλλο').length, 0);
  assert.equal(context.filterGifCatalog(items, 'laugh γελιο', 'Μπέλεσης').length, 1);
});

test('GIF catalog uses unique IDs and valid animated GIF / static preview files', () => {
  assert.ok(catalog.length > 0);
  assert.equal(new Set(catalog.map(item => item.id)).size, catalog.length);
  for (const item of catalog) {
    const gif = readFileSync(resolve(__dirname, '..', item.src));
    const preview = readFileSync(resolve(__dirname, '..', item.preview));
    assert.match(gif.subarray(0, 6).toString(), /^GIF8[79]a$/);
    assert.equal(gif.readUInt16LE(6), item.width);
    assert.equal(gif.readUInt16LE(8), item.height);
    assert.equal(preview.readUInt16BE(0), 0xffd8);
    assert.ok(preview.length < gif.length);
  }
});
